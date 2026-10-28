"""PROTOTYPE PROOF. Measures the cost of the proxy hop and of the two hosting shapes.

The question the ticket asks is whether a separate Python deployment is needed at all.
That turns on one number: how much does the extra network hop cost, and how much does
a cold Python instance cost compared with a cold Node instance.

Run against a STUB=1 service so the model latency does not swamp the measurement:
  .venv/bin/python hop_cost.py
"""

import json
import os
import statistics
import time
import urllib.request

PY = os.environ.get("PY_BASE_URL", "http://127.0.0.1:8078")
PROXY = os.environ.get("PROXY_BASE_URL", "http://127.0.0.1:3000")
N = int(os.environ.get("N", "30"))


def timed(url: str, body: dict | None = None, method: str = "POST", client: str | None = None) -> float:
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    if client is not None:
        # Each request is sent as a distinct visitor. The service's per-IP limiter is
        # per-instance and in-memory, so a single IP would trip it and the measurement
        # would measure the 429 path instead of the request path.
        req.add_header("X-Forwarded-For", client)
    t0 = time.perf_counter()
    with urllib.request.urlopen(req, timeout=30) as resp:
        resp.read()
    return (time.perf_counter() - t0) * 1000


def stats(samples: list[float]) -> dict:
    s = sorted(samples)
    return {
        "median_ms": round(statistics.median(s), 2),
        "p95_ms": round(s[int(len(s) * 0.95) - 1], 2),
        "min_ms": round(s[0], 2),
        "max_ms": round(s[-1], 2),
    }


if __name__ == "__main__":
    question = {"question": "What is your current role?"}

    direct = [timed(f"{PY}/chat", question, client=f"10.0.0.{i}") for i in range(N)]
    proxied = [timed(f"{PROXY}/api/chat", question, client=f"10.0.1.{i}") for i in range(N)]

    d = stats(direct)
    p = stats(proxied)

    print(json.dumps({
        "n_requests": N,
        "direct_to_python_ms": d,
        "through_next_proxy_ms": p,
        "proxy_hop_overhead_median_ms": round(p["median_ms"] - d["median_ms"], 2),
    }, indent=2))

    print()
    print("Interpretation: this is the extra latency the same-origin proxy route adds")
    print("on top of talking to the Python service directly. It excludes the model call,")
    print("which is the dominant cost in both shapes.")
