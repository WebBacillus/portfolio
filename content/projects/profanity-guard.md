---
summary: "A speech model that detects Thai profanity in audio, built so streamers can act on it before publishing."
role: "Solo project, developed during the AI Builders program."
---

## The problem it solves

YouTubers and streamers often have a video demonetized or taken down over a handful of swear words. The video is otherwise good, but the platform's copyright strike removes the revenue. The reaction is manual: watch the video, note the timestamps, and cut around the words. That is slow and easy to get wrong.

ProfanityGuard detects Thai profanity in audio automatically, so the creator can find the risky moments quickly and fix them before upload.

## How it works

The model builds on a pretrained Thai speech recognition model, `airesearch/wav2vec2-large-xlsr-53-th`, which handles the speech-to-text step. That pretrained model is then trained further on the Common Voice 7.0 dataset and combined with a brute-force pass to check the transcribed text for swear words.

The result is roughly twice as good as the pretrained model when compared with WER, CER, and F1 score.

## Trying it

- A Hugging Face Space is available for trying the model in a browser.
- A Google Colab notebook walks through running the model directly.
- A write-up on Medium covers the motivation and the approach in more depth.
