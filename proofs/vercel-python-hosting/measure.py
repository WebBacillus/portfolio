"""PROTOTYPE PROOF. Measures what decides the hosting boundary.

Three numbers matter for the boundary question:
  1. cold start  - how long a fresh Python process takes to import the app. On Vercel
                   a Python function pays this on every cold instance.
  2. warm latency - the app's own overhead around a request, excluding the model.
  3. bundle size - the dependency footprint, against Vercel's 500 MB Python limit.

Run: .venv/bin/python measure.py
"""

import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))


def cold_start_ms() -> float:
    """Time a fresh interpreter importing the app module. This is the cold-start floor."""
    code = (
        "import time,os,sys;sys.path.insert(0,%r);"
        "t=time.perf_counter();import api.index;print((time.perf_counter()-t)*1000)"
    ) % HERE
    out = subprocess.run(
        [sys.executable, "-c", code], capture_output=True, text=True, check=True
    )
    return float(out.stdout.strip())


def _dependency_closure(roots: list[str]) -> set[str]:
    """The distributions that would be installed for the declared requirements.

    Walking site-packages instead would measure whatever else happens to be installed
    in the current interpreter, which is not what Vercel would ship.
    """
    from importlib.metadata import PackageNotFoundError, requires

    closure: set[str] = set()
    queue = list(roots)
    while queue:
        name = queue.pop()
        key = name.lower().replace("_", "-")
        if key in closure:
            continue
        closure.add(key)
        try:
            deps = requires(name) or []
        except PackageNotFoundError:
            continue
        for spec in deps:
            # A spec looks like "httpx>=0.28", "httpx[http2]" or "httpx; python_version<'3.11'".
            # The distribution name is the part before any version, extra or marker.
            dep = spec.split(";", 1)[0].strip()
            dep = dep.split("[", 1)[0].strip()
            for sep in ("==", ">=", "<=", "~=", ">", "<", "!="):
                dep = dep.split(sep, 1)[0].strip()
            if not dep:
                continue
            base = dep.lower().replace("_", "-")
            if base in closure:
                continue
            queue.append(dep)
    return closure


def bundle_bytes() -> int:
    """Total size of the installed dependency tree that would ship in the function."""
    from importlib.metadata import distribution

    declared = ["fastapi", "httpx", "pydantic"]
    closure = _dependency_closure(declared)

    total = 0
    seen: set[str] = set()
    for name in sorted(closure):
        try:
            dist = distribution(name)
        except Exception:
            continue
        for file in dist.files or []:
            path = str(file)
            if not path.endswith((".py", ".so", ".pyd", ".typed", ".pyi")):
                continue
            if path in seen:
                continue
            seen.add(path)
            try:
                total += os.path.getsize(str(dist.locate_file(file)))
            except OSError:
                pass
    return total


def warm_overhead_ms() -> float:
    """App overhead for a request that never touches the model (the 422 path)."""
    from fastapi.testclient import TestClient
    import api.index as mod

    client = TestClient(mod.app)
    client.post("/chat", json={"question": ""})  # warm the client

    samples = []
    for _ in range(20):
        t0 = time.perf_counter()
        client.post("/chat", json={"question": ""})
        samples.append((time.perf_counter() - t0) * 1000)
    samples.sort()
    return samples[len(samples) // 2]


if __name__ == "__main__":
    result = {
        "cold_start_import_ms": round(cold_start_ms(), 1),
        "warm_request_overhead_ms": round(warm_overhead_ms(), 2),
        "dependency_bundle_bytes": bundle_bytes(),
        "dependency_bundle_mb": round(bundle_bytes() / 1024 / 1024, 1),
        "python": sys.version.split()[0],
    }
    print(json.dumps(result, indent=2))
