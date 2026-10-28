---
summary: "A Twitch channel-points text-to-speech bot that lets long-time viewers speak on stream without paying for Bits."
role: "Solo project. I built the Go service, the SAMMI configuration, and the OBS playback integration."
---

## What it does

Most Twitch text-to-speech bots gate voices behind Bits, so participating means paying. Takluz TTS swaps Bits for **channel points**, the currency every viewer already earns just by being active in chat. A viewer with 200 days of chat gets the same voice slot as someone who tipped once.

The bot listens for channel point redemptions and chat commands, synthesizes audio through a text-to-speech engine, and plays it into the live stream through OBS Studio.

## How it works

The whole path runs on the streamer's own PC, so nothing is proxied through a third party:

- **SAMMI Core** bridges Twitch events (channel points and chat commands) into plain HTTP JSON.
- **Takluz TTS Bot** is a Go 1.23 service on Fiber v2 listening on `localhost:4444`.
- The bot calls the configured text-to-speech engine over HTTPS and receives synthesized audio.
- **OBS Studio** plays that audio through the OBS WebSocket control interface.
- **MongoDB Atlas** records every request, which makes moderation and abuse review possible.
- A small PyInstaller GUI handles provider API keys and the OBS password.

## Plug-in text-to-speech engines

Five engines ship in the current build: OpenAI, Google Cloud, Azure Speech, Botnoi, and Resemble AI. Each has its own strengths, which is why the engine is configuration rather than a hard-coded dependency. Adding another one is a single route handler plus a config struct, and the existing engines are not touched when that happens.

| Engine | Strongest for | Notes |
| --- | --- | --- |
| OpenAI | English, high quality | `tts-1` / `gpt-4o-mini-tts` |
| Google Cloud | Wide language coverage | Multi-voice |
| Botnoi | Thai pronunciation | Local speech team |
| Azure | Enterprise reliability | SSML support |
| Resemble AI | Custom cloned voices | Voice UUID required |

## Design choices

- **Channel points over Bits.** The free, Twitch-native path lowers the barrier for casual viewers and rewards loyalty instead of spending.
- **No vendor coupling.** OBS, Twitch, and every text-to-speech provider sit behind small interfaces, so any of them can be replaced.
- **Local-first.** The bot runs on the streamer's PC; no third party sits in the request path.
