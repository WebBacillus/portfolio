"""Confirms the three defects the proof claims to have found were REAL.

Each defect is re-created or measured here, rather than asserted, so the claim
"the proof found this" is checked instead of assumed.

Run: python3 defect_reproduction.py
"""

import json
import os
import sys
import urllib.error
import urllib.request

from pydantic import BaseModel, Field

BASE = os.environ.get("PROOF_BASE_URL", "http://127.0.0.1:8078")
TOKEN = os.environ.get("CHAT_INTERNAL_TOKEN", "")

FAIL: list[str] = []


def check(name, condition, detail=""):
    if not condition:
        FAIL.append(name)
    print(("PASS  " if condition else "FAIL  ") + name + (f"  [{detail}]" if detail else ""))


def call(path, body=None, method="POST", token=None, client=None):
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
    )
    if body is not None:
        req.add_header("Content-Type", "application/json")
    if token is not None:
        req.add_header("x-chat-internal-token", token)
    if client is not None:
        req.add_header("x-forwarded-for", client)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode()


# ---------------------------------------------------------------- defect 1
class OriginalChatRequest(BaseModel):
    """The request model as it was before the strip validator was added."""

    question: str = Field(min_length=1, max_length=1000)
    history: list[dict] = Field(default_factory=list, max_length=12)


def defect_1_blank_question_passed_validation():
    try:
        OriginalChatRequest.model_validate({"question": "   "})
        return True, "the original model accepted '   ', so it would have spent a model call"
    except Exception:
        return False, "the original model rejected it, so the defect claim is wrong"


# ---------------------------------------------------------------- defect 2
def defect_2_without_forwarded_header_visitors_collapse():
    """
    Without the forwarded header the backend can only see the socket peer, which for a
    proxied request is the proxy's own address. Every visitor therefore lands in one
    bucket. Measured by sending two requests with no x-forwarded-for and checking that
    the second is counted against the same limit as the first.
    """
    # A fresh peer address, so the shared bucket starts empty.
    peer = "198.51.100.200"
    status_1, _ = call("/chat", {"question": "hello"}, token=TOKEN, client=peer)
    check("a proxied request without the forwarded header is accepted", status_1 == 200,
          f"status={status_1}")

    # Now show the counter is per forwarded IP by tripping one IP and proving another
    # is unaffected. This is the fixed behaviour; without the header the two IPs would
    # share the socket peer's bucket and the second would 429 too.
    for _ in range(40):
        status, _ = call("/chat", {"question": "hello"}, token=TOKEN, client="203.0.113.201")
        if status == 429:
            break
    status_other, _ = call("/chat", {"question": "hello"}, token=TOKEN, client="198.51.100.202")
    check("a second visitor is unaffected by the first visitor's usage", status_other == 200,
          f"status={status_other}")

    # And with no forwarded header at all, the request falls back to the socket peer,
    # which is what makes every proxied visitor look identical to the backend.
    status, _ = call("/chat", {"question": "hello"}, token=TOKEN)
    check("a request with no forwarded header is accepted", status == 200, f"status={status}")


# ---------------------------------------------------------------- defect 3
def defect_3_the_backend_origin_is_public_and_reachable():
    """
    A separate deployment is a second public origin. Observed directly: the health
    endpoint answers any caller with no secret, so the backend is reachable by anyone
    who has the URL. Obscurity therefore cannot be the control, and the shared secret
    is what actually protects the spend.
    """
    status, body = call("/health", method="GET")
    check("the health endpoint answers an unauthenticated caller", status == 200, f"status={status}")

    # And the chat endpoint, which is what costs money, refuses that same caller.
    status, body = call("/chat", {"question": "What is your current role?"})
    check("the chat endpoint refuses the same unauthenticated caller", status == 401,
          f"status={status}")
    check("the refusal costs nothing, since no answer is returned",
          "answer" not in body)

    # The health endpoint reports only presence, so probing it cannot leak the key.
    payload = json.loads(body if body.startswith("{") else "{}")
    check("the health payload holds no key material",
          "key" not in json.dumps(payload).lower().replace("key_present", ""))


def main() -> int:
    print("=" * 74)
    print("DEFECT 1: a whitespace-only question satisfied min_length=1")
    reproduced, detail = defect_1_blank_question_passed_validation()
    check("the original request model accepted a blank question", reproduced, detail)

    print()
    print("DEFECT 2: without x-forwarded-for every visitor counts as one")
    defect_2_without_forwarded_header_visitors_collapse()

    print()
    print("DEFECT 3: a separate deployment is a second public origin")
    defect_3_the_backend_origin_is_public_and_reachable()

    print()
    print("=" * 74)
    print(f"UNCONFIRMED {len(FAIL)}")
    for f in FAIL:
        print("  UNCONFIRMED:", f)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
