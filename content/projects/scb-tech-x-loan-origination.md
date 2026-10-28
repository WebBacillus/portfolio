---
summary: "A loan origination pipeline that replaces manual steps with Go services and durable Temporal workflows."
role: "Employer project at SCB Tech X. I built the Go microservices and the Temporal workflows that drove the loan process. The repository is internal, so the code stays with the company."
---

## What it does

Loan origination is the part of lending that runs before an application becomes a decision. A lot of it is paperwork moving between systems and people. The project takes that manual path and turns it into services and workflows, so the steps run themselves and the record of what happened is kept in one place.

## Services and workflows, with different jobs

The work splits into two kinds of component, and the split is the design.

- **Go microservices** own the domain logic and the request handling. They are the parts that talk to the database, apply the rules, and answer the calls.
- **Temporal workflows** own the sequence. A workflow describes what happens and in what order, and it survives a crash or a dependency being down: if a service the workflow is waiting on is unavailable, the workflow waits instead of failing and someone re-running it by hand.

That split is what makes a multi step loan process safe to automate. The rules live in ordinary services that are easy to read and test. The coordination lives in a workflow engine that already handles retries, timers, and resumable state, rather than in hand written try and catch blocks spread across services.

## Storage

Two stores, chosen for what each one holds.

- **PostgreSQL** holds the structured loan records and the state the services read and write.
- **Azure Blob Storage** holds the documents that travel with an application. Keeping them out of the relational store means a large binary does not sit in a row, and access to the documents can be controlled on its own terms.

## Why there is no link

The services run against SCB's internal systems, so the code and its configuration are not published and there is no public demo. This page describes the shape of the system and the reason for the two different ways of building it.

## Tech stack

| Layer | Tools |
| --- | --- |
| Services | Go, gRPC and REST style service boundaries |
| Orchestration | Temporal workflows, for durable and resumable multi step execution |
| Structured data | PostgreSQL |
| Documents | Azure Blob Storage |
