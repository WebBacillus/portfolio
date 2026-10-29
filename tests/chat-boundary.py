"""HTTP checks for the public Python service boundary, using a local model stub."""

import json
import os
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

import httpx

root = Path(__file__).resolve().parent.parent
assert (root / "knowledge" / "cv.md").read_bytes() == (root / "chat-service" / "knowledge" / "cv.md").read_bytes(), "bundled CV knowledge has drifted from the approved source"


class ModelStub(BaseHTTPRequestHandler):
    calls = 0
    def do_POST(self):
        ModelStub.calls += 1
        request = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        question = request["input"][-1]["content"]
        if question == "Force provider error":
            body = b'{"secret":"provider-private-data"}'
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        output = "not JSON" if question == "Malformed model output" else '{"kind":"answer","answer":"I study Computer Engineering at Chulalongkorn University.","source":"Resume"}'
        body = json.dumps({"output": [{"content": [{"type": "output_text", "text": output}]}]}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *args):
        pass


stub = HTTPServer(("127.0.0.1", 0), ModelStub)
threading.Thread(target=stub.serve_forever, daemon=True).start()
env = {**os.environ, "OPENAI_API_KEY": "local-test-key", "CHAT_INTERNAL_TOKEN": "local-test-token", "OPENAI_BASE_URL": f"http://127.0.0.1:{stub.server_port}/v1"}
service = subprocess.Popen(["uv", "run", "--directory", "chat-service", "uvicorn", "api.index:app", "--host", "127.0.0.1", "--port", "8078", "--no-access-log"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
client = httpx.Client(base_url="http://127.0.0.1:8078", timeout=5)
try:
    for _ in range(100):
        try:
            client.get("/health")
            break
        except httpx.ConnectError:
            time.sleep(0.1)
    else:
        raise AssertionError("service did not start")

    payload = {"question": "Where did you study?", "history": []}
    unauthenticated = client.post("/chat", json=payload)
    assert unauthenticated.status_code == 401
    assert ModelStub.calls == 0
    headers = {"x-chat-internal-token": "local-test-token"}
    blank = client.post("/chat", json={"question": "   "}, headers=headers)
    assert blank.status_code == 422
    assert ModelStub.calls == 0
    answer = client.post("/chat", json=payload, headers=headers)
    assert answer.status_code == 200, answer.text
    assert answer.json() == {"kind": "answer", "answer": "I study Computer Engineering at Chulalongkorn University.", "source": "Resume"}
    assert ModelStub.calls == 1
    for invalid in (
        {"question": "x" * 1001},
        {"question": "Valid", "history": [{"role": "user", "content": "x"}] * 13},
    ):
        assert client.post("/chat", json=invalid, headers=headers).status_code == 422
    assert client.post("/chat", content=b"x" * (32 * 1024 + 1), headers=headers).status_code == 413
    assert ModelStub.calls == 1

    bad = client.post("/chat", json={"question": "Malformed model output"}, headers=headers)
    assert bad.status_code == 502 and bad.json()["kind"] == "error"
    hostile = client.post("/chat", json={"question": "Force provider error"}, headers=headers)
    assert hostile.status_code == 502 and "provider-private-data" not in hostile.text

    ip_a = {**headers, "x-forwarded-for": "192.0.2.20"}
    for _ in range(20):
        assert client.post("/chat", json=payload, headers=ip_a).status_code == 200
    assert client.post("/chat", json=payload, headers=ip_a).status_code == 429
    ip_b = {**headers, "x-forwarded-for": "192.0.2.21"}
    assert client.post("/chat", json=payload, headers=ip_b).status_code == 200
    print("Boundary: unauthenticated and blank requests spend nothing; approved answer returned")
finally:
    service.terminate()
    service.wait(timeout=5)
    stub.shutdown()
