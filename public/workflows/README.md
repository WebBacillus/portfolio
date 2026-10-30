# YouTube Summarizer n8n workflow

This is a sanitized export of a personal local n8n workflow. It monitors a Notion video database, gets timestamped captions through Apify, generates a transcript based English breakdown with OpenAI, and uploads a Markdown note to Dropbox for a synced Obsidian vault.

## Before importing

The export intentionally contains no saved credentials, pinned Notion records, personal database identifier, or n8n instance identifier. After import:

1. Select your Notion database in the Notion Trigger and connect your Notion account.
2. Configure the Apify HTTP Header Auth credential used by the transcript request.
3. Connect your OpenAI account and Dropbox account in n8n.
4. Set the Dropbox upload folder to a path synced with your Obsidian vault. The included template path is `/Obsidian/YoutubeNote/`.
5. Review the model prompt, destination path, and service costs before activating the workflow.

The workflow asks the model for a detailed English summary organized by transcript timestamps, creates relevant Obsidian wiki links, and adds video metadata and an embed to the note. Transcript retrieval depends on the video's available captions and the configured Apify actor.

This export has not been run against another person's n8n instance. Treat it as a starting template and verify credentials, node versions, and folder syncing in your own setup.
