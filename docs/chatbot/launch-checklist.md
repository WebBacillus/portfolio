# Ask me anything launch checklist

**Status:** deployment setup in progress; public launcher remains off by default in production. See [deployment-notes.md](deployment-notes.md) for verified state and remaining gates.

## Deploy behind the off switch

1. Import the repository into two Vercel projects. Set the portfolio project's root directory to the repository root and the Python project's root directory to `chat-service/` ([Vercel monorepo setup](https://vercel.com/docs/monorepos)). Keep `CHAT_PUBLIC_ENABLED=false` on the portfolio project.
2. Set `OPENAI_API_KEY` only on the Python project. Set the same random `CHAT_INTERNAL_TOKEN` on both projects. Set `CHAT_API_URL` to the Python deployment origin and an independent random `CHAT_SESSION_SECRET` on the portfolio project. Keep all keys server-side and use distinct values for preview and production. See [runtime.md](runtime.md) for the complete variable list.
3. In the OpenAI dashboard, verify that the key belongs to the intended API project and that the owner-confirmed **$5 monthly hard spend limit** is active for that same project. Record the project and cap in the deployment notes without copying credentials.
4. On the portfolio Vercel project, publish a WAF rule matching `/api/chat` that limits each IP to **20 requests per minute** and returns **429** after the threshold. Confirm the rule is applied and test from a controlled client ([Vercel WAF custom rules](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules)).

## Smoke checks before enabling the launcher

- Check all ten project names and aliases through the deployed `POST /api/chat`. Each must return its page link and the exact page summary without spending a model request.
- Check the Python origin rejects a missing or wrong internal token before a model call. The public proxy must not reveal the token, API key, upstream error body, or stack trace.
- Check blank and oversized questions fail without spending; check the signed session cap and WAF 429. From two controlled IPs, verify that exhausting one IP does not block the other. Do this with non-model-spending requests where possible.
- Send one controlled CV question through the deployed portfolio origin and verify its source label and factual boundary. Force an upstream failure and verify the UI shows an error with no invented answer. Verify an unavailable state offers `/contact`.
- On desktop and a real phone, check launcher, CV and project suggestions, exact project redirect card, Enter and Shift+Enter, Escape focus return, reset, and composer visibility above the software keyboard.
- Verify the visible privacy notice before the first question: the question and recent chat pass through this site to OpenAI; the site saves no transcript text; hosting may retain request metadata; `/contact` is an alternative.

## Public switch

After the checks pass, set `CHAT_PUBLIC_ENABLED=true` on the portfolio project and redeploy it. Verify the launcher on the public domain and repeat one controlled answer and one project redirect. If the checks fail later, set the flag to `false` and redeploy while investigating.
