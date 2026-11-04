---
summary: "Research for a Thai and English support agent for TrueX smart home devices. The planned support scope covers ten models and 29 issue groups, with troubleshooting guided by reviewed product evidence."
role: "Personal project focused on research, scope definition, and prototype exploration. The repository documents the work; it does not contain a completed support application."
---

## Project overview

Customer support for a connected home device depends on details that a generic answer can easily miss: the exact model, the reported symptom, the customer's observations, and the instructions that actually apply. This project explores a Thai and English support agent that uses reviewed product evidence and follows a result driven troubleshooting flow.

The project is currently in research, planning, and prototype exploration. The repository does not contain a completed customer support application or a production deployment.

## How the proposed support flow works

1. Identify the device and the bounded issue without guessing when the information is unclear.
2. Check safety conditions before routine troubleshooting.
3. Consult reviewed material that applies to the confirmed model and issue.
4. Ask one relevant question or suggest one documented check.
5. Record the customer's reported result and use it to choose the next step.
6. Close only when the customer confirms resolution. If no supported step remains, explain the limitation and prepare a case summary.

Retrieval and diagnosis have separate roles: finding a relevant passage does not establish that a step applies, that it worked, or that the customer is helped.

## Scope and language

The reviewed Phase 1 scope covers ten selected TrueX smart home models and 29 bounded issue groups. These are limits on the planned support surface, not proof that every listed issue can already be handled. A model's presence in the scope does not imply support for every problem involving that model.

The planned agent accepts Thai and English input. Replies follow the language selected in the customer's system settings and default to Thai when no preference is available. The design excludes live device control, cloud diagnostics, automatic repair, and direct connection to a human support platform.

## Research and design artifacts

The private repository contains a reviewed device and issue matrix, dated scope decisions, source reviews, a result driven troubleshooting concept, research on prior systems, and bounded prototype explorations. The central design question is how to preserve customer reported facts and check results across turns while keeping each device specific step tied to applicable evidence.

Some early HTML prototypes are in the private repository. This page describes the research and planned support flow.

## Planned technical stack

The selected stack is designed around traceability — every answer should be traceable back to a reviewed source passage. Components and their roles:

- **Python** with **Ruff** and pre-commit hooks for consistent code quality.
- **FastAPI** for the support agent API, with **Streamlit** as the inspection UI.
- **LangGraph** for the multi-turn conversation flow, backed by **SQLite** persistence so state, recorded checks, and identified device context survive across turns.
- **OpenAI Responses API** using `gpt-6-luna` for generation and `text-embedding-3-large` for embeddings.
- **Qdrant** for dense Top-K retrieval over the reviewed FAQ and manual artifacts.
- **Opik** for experiment tracking and observability.

Source content is drawn from reviewed extracted TrueX model manuals, selected TrueX Help Center FAQ articles, and vetted Tuya FAQ troubleshooting content. Manual pipeline provenance is retained so each retrieved passage can be traced back to its originating document.

## Current limits

The project has not established an end to end support experience, a deployment, or measured customer outcomes. Some device paths, source reviews, safety wording, and evaluation cases remain preparation work. Planned technical choices in the repository describe a possible implementation and should not be read as running services or installed application components.

No application quickstart is provided because there is no complete application to run. Prototype specific instructions belong in the relevant repository `poc/` or `demo/` directory.
