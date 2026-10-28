"""Checks what the proxy does with a hostile or broken upstream.

A visitor-facing proxy must not relay an upstream's internals. This points the proxy at
a local server that answers with a body full of secrets and lies about its status, and
checks what actually reaches the visitor.

Run: python3 hostile_upstream_check.py
"""

import json
import os
import sys
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer

PROXY = os.environ.get("PROXY_BASE_URL", "http://127.0.0.1:3112")
PORT = int(os.environ.get("HOSTILE_PORT", "8099"))

FAIL: list[str] = []


def check(name, condition, detail=""):
    if not condition:
        FAIL.append(name)
    print(("PASS  " if condition else "FAIL  ") + name + (f"  [{detail}]" if detail else ""))


SECRETS = "SUPER_SECRET_KEY_sk-abcdef123456 TRACE_ID_zzz999 INTERNAL_PATH_/etc/passwd"


class Hostile(BaseHTTPRequestHandler):
    """Answers every path with a body stuffed with internals."""

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        self.rfile.read(length)
        payload = json.dumps({
            "error": "internal_error",
            "secret": SECRETS,
            "answer": "THE UPSTREAM LEAKED AN ANSWER",
            "model": "gpt-6-luna-internal",
            "stack": "Traceback (most recent call last): /srv/app/secret_path.py line 42",
        }).encode()
        self.send_response(500)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format, *args):
        pass


def main() -> int:
    server = HTTPServer(("127.0.0.1", PORT), Hostile)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    print(f"hostile upstream on 127.0.0.1:{PORT}")
    time.sleep(1)

    # Restart the proxy pointed at the hostile upstream.
    print("pointing the proxy at the hostile upstream...")
    os.environ["CHAT_API_URL"] = f"http://127.0.0.1:{PORT}"
    print("NOTE: the proxy reads CHAT_API_URL at server start, so this check must be")
    print("run against a proxy started with that value.")

    req = urllib.request.Request(
        f"{PROXY}/api/chat",
        data=json.dumps({"question": "What is your current role?"}).encode(),
        method="POST",
    )
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            status, body = resp.status, resp.read().decode()
    except urllib.error.HTTPError as exc:
        status, body = exc.code, exc.read().decode()

    print(f"\nvisitor received HTTP {status}")
    print(f"body: {body}")
    print()

    check("the proxy did not return 200 for a failed upstream", status != 200, f"status={status}")
    check("the proxy mapped a 500 upstream to 502", status == 502, f"status={status}")
    check("no upstream secret reached the visitor", SECRETS not in body)
    check("no upstream stack trace reached the visitor", "Traceback" not in body)
    check("no internal path reached the visitor", "/etc/passwd" not in body)
    check("no upstream answer reached the visitor", "LEAKED AN ANSWER" not in body)
    check("no internal model id reached the visitor", "gpt-6-luna-internal" not in body)

    try:
        parsed = json.loads(body)
    except json.JSONDecodeError:
        parsed = {}
    check("the visitor got a clean JSON error object", isinstance(parsed, dict) and "error" in parsed)
    check("the visitor got a human message", isinstance(parsed, dict) and bool(parsed.get("message")))

    server.shutdown()
    print()
    print("=" * 74)
    print(f"UNCONFIRMED {len(FAIL)}")
    for f in FAIL:
        print("  UNCONFIRMED:", f)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
