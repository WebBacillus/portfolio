# Chatbot project routing index — milestone 1

<!--
Purpose: the redirect table. The chatbot does NOT answer project questions, it hands the
visitor to the matching page. This file holds only what a redirect needs: title, one line
summary, role line, and path. No body text lives here.

Matching is on title and on the words a visitor is likely to use. A project question that
matches no row takes the no match template. The chatbot never improvises a path.
-->

| Project | Path | Also matches |
| --- | --- | --- |
| Takluz TTS | `/work/takluz-tts` | TTS, text to speech, Twitch bot, channel points, voice bot |
| SE for ML | `/work/se-for-ml` | Scalable ML Classification Pipeline, image classification, MLOps, drift detection, retraining, C4, model serving |
| ProfanityGuard | `/work/profanity-guard` | profanity, swear word, Thai ASR, speech recognition, content moderation, AI Builders project |
| Adozoil | `/work/adozoil` | drowsiness, driver fatigue, fuel theft, fuel monitoring, IoT, ESP32, fleet, truck |
| Employee Management | `/work/employee-management` | attendance, leave request, HR system, employee system, microservices, RabbitMQ |
| Takluz Leaderboards | `/work/takluz-leaderboards` | leaderboard, Twitch statistics, chat analytics, ranking |
| Monkey Massage | `/work/monkey-massage` | massage, reservation, booking, OTP, spa |
| Scopus Gender Prediction | `/work/scopus-gender-prediction` | Scopus, Crossref, gender prediction, author gender, name features, PySpark, MongoDB, DSDE, 2110403 |
| NECTEC Medical AI | `/work/nectec-medical-ai` | NECTEC, chest X-ray, chest xray, medical imaging, multi-label, EfficientNetV2, EfficientNet, radiology |
| SCB Tech X Loan Origination | `/work/scb-tech-x-loan-origination` | SCB, loan origination, Temporal, Azure Blob Storage, loan pipeline |

## The one line summary for each redirect

Each summary below is the summary on that project's own page. The chatbot repeats it
rather than writing a new one, so the redirect and the page agree.

- **Takluz TTS**: A Twitch channel-points text-to-speech bot that lets long-time viewers speak on stream without paying for Bits.
- **SE for ML**: An image classification system for storefront photos, with a human review queue and drift-triggered retraining.
- **ProfanityGuard**: A speech model that detects Thai profanity in audio, built so streamers can act on it before publishing.
- **Adozoil**: An IoT system for transport fleets that watches for driver drowsiness and flags unusual fuel consumption.
- **Employee Management**: A microservices employee platform for attendance, leave requests, and workforce notifications.
- **Takluz Leaderboards**: A Go service that collects Twitch chat activity and turns it into stream statistics.
- **Monkey Massage**: A reservation platform for massage shops, with OTP-based sign-up and reviews.
- **Scopus Gender Prediction**: A data pipeline that predicts the likely gender of an academic author from their name, then maps the result across the Scopus corpus by country and subject area.
- **NECTEC Medical AI**: A multi-label chest X-ray diagnostic system that predicts several findings at once from a single radiograph.
- **SCB Tech X Loan Origination**: A loan origination pipeline that replaces manual steps with Go services and durable Temporal workflows.

## Not on this site

The customer support agent work at True Corporation is in progress and has no page of
its own. It is covered by the True Corporation experience entry in `cv.md`, not by a
redirect. The chatbot may answer about the role from the CV bullet and must label the
work as in progress. It must not invent a project page for it.

ChuMaiNichi is not the candidate's project and must never appear here.
