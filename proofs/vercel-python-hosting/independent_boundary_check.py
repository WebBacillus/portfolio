"""Independent verification of the hosting boundary proof, in stub mode.

This does NOT spend money: STUB=1 makes the service answer without calling the model,
and the key used here is a dummy string, so the real key is never read or needed.

It re-checks the claims in the ticket resolution independently of the proof's own
script, because a proof that verifies itself proves very little.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request

BASE = os.environ.get("PROOF_BASE_URL", "http://127.0.0.1:8077")
TOKEN = os.environ.get("CHAT_INTERNAL_TOKEN", "")

PASS: list[str] = []
FAIL: list[str] = []


def call(path, body=None, method="POST", raw=None, token=None, client=None):
    url = f"{BASE}{path}"
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request(url, data=data, method=method)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    if token is not None:
        req.add_header("x-chat-internal-token", token)
    if client is not None:
        req.add_header("x-forwarded-for", client)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            text = resp.read().decode()
            try:
                return resp.status, json.loads(text)
            except json.JSONDecodeError:
                return resp.status, text
    except urllib.error.HTTPError as exc:
        text = exc.read().decode()
        try:
            return exc.code, json.loads(text)
        except json.JSONDecodeError:
            return exc.code, text


def check(name, condition, detail=""):
    (PASS if condition else FAIL).append(name)
    print(("PASS  " if condition else "FAIL  ") + name + (f"  [{detail}]" if detail else ""))


def main() -> int:
    print("=" * 74)
    print("A. HEALTH reports key presence without revealing it")
    status, body = call("/health", method="GET")
    check("health 200", status == 200, f"status={status}")
    check("health reports key_present true", isinstance(body, dict) and body.get("key_present") is True)
    check("health reports internal auth configured",
          isinstance(body, dict) and body.get("internal_auth_configured") is True)
    check("health leaks no key material",
          isinstance(body, dict) and "key" not in json.dumps(body).lower().replace("key_present", ""))

    print()
    print("B. AUTH refuses before parsing, before the rate limiter, before the model")
    status, body = call("/chat", {"question": "What is your current role?"})
    check("no token -> 401", status == 401, f"status={status}")
    check("401 body carries no answer", isinstance(body, dict) and "answer" not in body)
    status, _ = call("/chat", {"question": "What is your current role?"}, token="wrong-token")
    check("wrong token -> 401", status == 401, f"status={status}")

    print()
    print("C. REQUEST BOUNDS are enforced before any spend")
    big = json.dumps({"question": "x" * 200000}).encode()
    status, _ = call("/chat", raw=big, token=TOKEN)
    check("oversized body -> 413", status == 413, f"status={status}")
    status, _ = call("/chat", {"question": "x" * 1500}, token=TOKEN)
    check("1500-char question -> 422", status == 422, f"status={status}")
    hist = [{"role": "user", "content": "hello"} for _ in range(20)]
    status, _ = call("/chat", {"question": "ok", "history": hist}, token=TOKEN)
    check("20-message history -> 422", status == 422, f"status={status}")
    status, _ = call("/chat", raw=b"{not json", token=TOKEN)
    check("malformed JSON -> 422", status == 422, f"status={status}")

    print()
    print("D. DEFECT 1: a whitespace-only question must not spend a model call")
    status, body = call("/chat", {"question": "   "}, token=TOKEN)
    check("blank question -> 422", status == 422, f"status={status} body={str(body)[:120]}")

    print()
    print("E. A valid question is answered")
    status, body = call("/chat", {"question": "What is your current role?"}, token=TOKEN)
    check("chat 200", status == 200, f"status={status} body={str(body)[:160]}")
    check("answer is non-empty", isinstance(body, dict) and len(str(body.get("answer", "")).strip()) > 0)
    check("request_id present", isinstance(body, dict) and bool(body.get("request_id")))

    print()
    print("F. DEFECT 2: x-forwarded-for must isolate visitors (the dropped-header bug)")
    # Burn one IP past its cap.
    hit_429 = False
    for _ in range(40):
        status, body = call("/chat", {"question": "hello"}, token=TOKEN, client="203.0.113.99")
        if status == 429:
            hit_429 = True
            break
    check("one IP trips the limit -> 429", hit_429, "tripped" if hit_429 else "never hit 429 in 40")
    if hit_429:
        check("429 body carries an error code", isinstance(body, dict) and "error" in body, str(body)[:100])
        check("429 body carries no answer", isinstance(body, dict) and "answer" not in body)
    # A different IP must still work. If the header were dropped, this would 429 too.
    status, _ = call("/chat", {"question": "hello"}, token=TOKEN, client="198.51.100.42")
    check("a different IP is NOT rate limited", status == 200, f"status={status}")
    # And the original IP is still limited, so the counter is per IP and not global.
    status, _ = call("/chat", {"question": "hello"}, token=TOKEN, client="203.0.113.99")
    check("the first IP is still limited", status == 429, f"status={status}")

    print()
    print("G. CORS is absent, so a browser cannot call the service cross origin")
    req = urllib.request.Request(f"{BASE}/chat", method="OPTIONS")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            headers = dict(resp.headers)
    except urllib.error.HTTPError as exc:
        status = exc.code
        headers = dict(exc.headers)
    check("preflight is not 200", status != 200, f"status={status}")
    check("no Access-Control-Allow-Origin header",
          not any(k.lower() == "access-control-allow-origin" for k in headers))

    print()
    print("=" * 74)
    print(f"PASSED {len(PASS)}   FAILED {len(FAIL)}")
    for f in FAIL:
        print("  FAILED:", f)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
