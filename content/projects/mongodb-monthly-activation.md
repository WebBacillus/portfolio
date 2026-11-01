---
summary: "A monthly n8n workflow that sends a lightweight MongoDB heartbeat and reports returned records in Telegram."
role: "Personal project. I built the automation to create periodic activity for older MongoDB projects."
---

## Why I built it

Some of my older projects use MongoDB Atlas clusters that may pause after a period without activity. I wanted a simple scheduled workflow to send a lightweight query and notify me in Telegram when a configured collection stops returning a record.

## How it works

1. An n8n schedule trigger starts the workflow once a month.
2. The workflow loops through a list of project labels and MongoDB collections.
3. For each item, the MongoDB node runs a `find` query with a limit of one document.
4. The workflow checks whether the result contains an `_id`, groups project labels into `Exists` and `Non Exists`, and sends a timestamped report to Telegram.

The query is read only. The report contains the project label and result status, not the document contents.

![Monthly MongoDB heartbeat workflow in n8n](/images/projects/mongodb-monthly-activation-workflow.png)

![Sanitized Telegram status report example](/images/projects/mongodb-monthly-activation-report.png)

## Design choices and limits

- **Small read request:** a `find` query with a limit of one creates database activity without inserting or modifying records.
- **Useful notification:** the Telegram report summarizes which configured collections returned a document.
- **Result status is not a connection diagnosis:** the exported branches test for the presence of `_id`. An empty collection and a connection failure may both result in no `_id`, so `Non Exists` does not identify the cause by itself.
- **One MongoDB credential:** the supplied export contains a single MongoDB node with one configured credential. Its per item URI values were not wired into that node, so this sanitized template removes them and does not switch between separate cluster connections. Configure a separate query path for each cluster that uses a different credential.
- **Monthly schedule:** this is intended as a recurring heartbeat, not a guarantee against every provider's inactivity policy. Adjust the schedule to match the current limits of your MongoDB plan.

## Download the workflow

[Download the sanitized n8n workflow JSON](/workflows/mongodb-monthly-activation.json). Add your own MongoDB and Telegram credentials, collection configuration, and chat destination before activating it.
