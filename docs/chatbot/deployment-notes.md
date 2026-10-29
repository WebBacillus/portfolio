# Ask me anything deployment notes

## 29 October 2026

- The feature branch `feat/ask-me-anything-chatbot` is pushed to GitHub at `b3bfdb5`. The existing Vercel `portfolio` project built a ready preview from that commit. Its production domain, `webbacillus.dev`, still serves `main`; the chat launcher remains off there.
- A separate Vercel project, `portfolio-chat-service`, is connected to the same repository with root directory `chat-service/` and the FastAPI preset. Its first deployment from `b3bfdb5` is ready at `https://portfolio-chat-service.vercel.app`. `GET /health` reports `ok: true` and both key and internal authentication unconfigured. An unauthenticated `POST /chat` returns 401. The service is not ready to answer questions.
- The portfolio project has `CHAT_API_URL=https://portfolio-chat-service.vercel.app` in Production and Preview. A redeployment is required before this takes effect.
- A Vercel project WAF rule for request path `/api/chat` is published: fixed window of 60 seconds, limit 20, key IP Address, follow-up action 429. A controlled test against the direct Vercel production domain returned 20 responses of 404 and then three of 429, without reaching a model.
- `webbacillus.dev` is proxied by Cloudflare. The same 23-request test there returned 404 each time, so the Vercel per-IP rule was **not verified as effective on the public domain**. Resolve this with a Cloudflare-side rate limit or a validated client-IP path before enabling the launcher there.
- The signed-in OpenAI Platform account's `Default project` (`proj_tFJz3nuYErczoNPDrFmY32uJ`) did not have a project spend limit, and the local API key ending `KZ4A` does not appear in that project's key list. A $5 hard cap was briefly set on this unrelated project during investigation, then hard enforcement was removed. Its current project limit is $120, **not enforced**, matching the organization's existing soft $120 threshold but leaving a new project-level alert. The owner chose to keep the existing key and will identify the project that has its hard cap. Do not upload or enable the key until that association and cap are verified.

## Remaining launch gates

1. Verify the existing OpenAI key's project and enforced $5 monthly cap.
2. Store `OPENAI_API_KEY` only on `portfolio-chat-service`, and set separate production and preview shared tokens plus portfolio session secrets. Deploy both projects with the correct settings.
3. Make the public domain's per-client rate limit effective, then complete the deployed smoke checks in [launch-checklist.md](launch-checklist.md).
4. Enable `CHAT_PUBLIC_ENABLED=true` only after all checks pass and deploy the portfolio to production.
