---
summary: "A local n8n workflow that turns videos saved in Notion into timestamped breakdowns and linked Markdown notes for an Obsidian vault."
role: "Personal project. I built and run the automation locally with n8n."
---

## Why I built it

I often find useful ideas in YouTube videos whose titles and delivery lean on clickbait. I wanted the substance without spending time on framing designed to provoke a reaction, so I built a workflow that turns saved videos into notes I can read and continue exploring in Obsidian.

## How it works

The workflow checks a Notion video database for new pages, processes each video, and writes a Markdown file into a Dropbox folder used by the Obsidian vault.

1. A Notion trigger checks for new database pages every minute and passes them through a loop.
2. A code node normalizes the YouTube URL. Apify retrieves the timestamped transcript, and another node prepares it for the language model. The workflow stops with an error when a transcript is missing or empty.
3. An OpenAI model produces a detailed English breakdown organized by transcript timestamps, leaving out sponsorships and calls to action. The note includes useful Obsidian wiki links for concepts and named ideas.
4. The workflow adds video metadata and an embed, then uploads the Markdown file to `/Obsidian/YoutubeNote/` in Dropbox. The synced folder makes the note available in Obsidian.

## What the notes look like

The example note includes a timestamped summary, video details, and inline wiki links to related concepts. Those links become navigable notes in the vault and appear in Obsidian's local graph.

The exported workflow template writes frontmatter for the YouTube tag, channel, duration, rating, and watch status, followed by the generated summary and source video embed. The actual note shown here is an example of the workflow's output, not a live demo.

![The n8n workflow that retrieves transcripts and creates notes](/images/projects/youtube-summarizer-workflow.png)

![The Notion database used to queue YouTube videos](/images/projects/youtube-summarizer-notion.png)

![A generated note with a timestamped summary and linked concepts in Obsidian](/images/projects/youtube-summarizer-obsidian.png)

## Design choices

- **Transcript grounded.** The prompt treats the timestamped transcript as its source and tells the model not to invent timestamps or claims.
- **Useful sections over watch time.** The summary omits sponsorships, reminders, self promotion, and calls to action.
- **Local workflow, connected services.** n8n runs locally while Notion, Apify, OpenAI, Dropbox, and Obsidian form the input, processing, and note taking path.
- **Reusable export.** The downloadable n8n JSON has credentials and personal database data removed. Configure your own service credentials and Notion database before running it.

## Download the workflow

[Download the sanitized n8n workflow JSON](/workflows/youtube-summarizer.json). It is a template, not a one click deployment: connect your own Notion, Apify, OpenAI, and Dropbox credentials, select your database, and point the Dropbox destination to a folder synced with your Obsidian vault. Check the workflow and provider requirements before importing or running it.
