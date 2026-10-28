---
summary: "A Go service that collects Twitch chat activity and turns it into stream statistics."
role: "Solo project. I wrote the Go collector and the data access layer."
---

## What it does

Takluz Leaderboard is a web platform that displays statistics and insights from Twitch chat. It collects live chat events from a Twitch channel and turns them into the numbers a streamer cares about: who is active, how much they contribute, and how the channel behaves over time.

## How it works

- **Collection** uses the `go-twitch-irc` client. The service authenticates with a Twitch OAuth token, joins the channel, and subscribes to chat events including messages, clear-chat notices, and private messages.
- **Storage** goes to Supabase through a dedicated connection module, with a repository layer that keeps the queries in one place per entity: channels, users, per-user channel statistics, and timeouts.
- **Configuration** is handled by Viper, reading a config file and allowing environment overrides for credentials.

The handler package processes incoming events and applies channel rules such as timeouts, while the model package holds the database structures.

## Deployment

The service is packaged with Docker and runs on AWS ECS behind an ECR registry, so the collector can stay running independently of the front end that presents the data.

## Tech stack

| Layer | Tools |
| --- | --- |
| Backend | Go, `go-twitch-irc`, Viper, Supabase |
| Front end | Next.js |
| Infrastructure | Docker, AWS ECR, AWS ECS |
