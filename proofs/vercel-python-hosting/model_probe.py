"""PROTOTYPE PROOF. One authorized minimal model call from a Python process.

Reads the key from the environment only. Never prints the key. This proves that a
Python serverless process can reach the model, and measures the round trip, which is
what decides whether a separate Vercel deployment is worth its cold start.
"""

import json
import os
import sys
import time

import httpx


def main() -> int:
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        print("FAIL: OPENAI_API_KEY is not in the environment")
        return 2

    base = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
    model = os.environ.get("OPENAI_MODEL", "gpt-6-luna")

    t0 = time.perf_counter()
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.get(f"{base}/models", headers={"Authorization": f"Bearer {key}"})
            models_ms = int((time.perf_counter() - t0) * 1000)
            print(f"GET /models -> {resp.status_code} in {models_ms}ms")
            if resp.status_code != 200:
                print("FAIL: model list call did not return 200")
                print("body:", resp.text[:300])
                return 3
            ids = [m.get("id") for m in resp.json().get("data", [])]
            print(f"model_count={len(ids)} requested_model_present={model in ids}")
    except Exception as exc:
        print(f"FAIL: model list call raised {type(exc).__name__}: {exc}")
        return 4

    # The minimal authorized call the contract needs: one question, one answer.
    t1 = time.perf_counter()
    payload = {
        "model": model,
        "input": "Reply with exactly the word: reachable",
        "max_output_tokens": 32,
    }
    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(
                f"{base}/responses",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json=payload,
            )
            call_ms = int((time.perf_counter() - t1) * 1000)
            print(f"POST /responses -> {resp.status_code} in {call_ms}ms")
            if resp.status_code != 200:
                print("FAIL: responses call did not return 200")
                print("body:", resp.text[:400])
                return 5
            data = resp.json()
            out_text = ""
            for item in data.get("output", []):
                for part in item.get("content", []):
                    if part.get("type") in ("output_text", "text"):
                        out_text += part.get("text", "")
            usage = data.get("usage", {})
            print(json.dumps({
                "status": resp.status_code,
                "latency_ms": call_ms,
                "model": data.get("model"),
                "output_text": out_text[:120],
                "input_tokens": usage.get("input_tokens"),
                "output_tokens": usage.get("output_tokens"),
                "has_request_id": bool(resp.headers.get("x-request-id")),
            }, indent=2))
    except Exception as exc:
        print(f"FAIL: responses call raised {type(exc).__name__}: {exc}")
        return 6

    return 0


if __name__ == "__main__":
    sys.exit(main())
