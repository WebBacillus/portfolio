---
summary: "A microservices employee platform for attendance, leave requests, and workforce notifications."
role: "University team project. I contributed to the Go backend services alongside teammates."
---

## What it does

The Employee Management System is a web application for the everyday parts of running a workforce: managing employees, tracking attendance with check-in and check-out, processing leave requests, and delivering notifications.

## Architecture

The system is built as microservices. Four primary backend services run independently and talk to each other through REST APIs and a message queue. Each service follows a clean architecture pattern, with layered components that separate the domain logic from delivery and persistence.

**Communication follows two patterns.** Synchronous REST calls are used where an immediate response is required, including the calls from the front end to the backend services and between backend services. Asynchronous messaging through RabbitMQ carries events, so services can react to each other without blocking the request that triggered them.

**Data is split by domain but connected.** PostgreSQL holds a separate schema per service domain, with database links and shared keys where the domains need to reference each other.

## Key workflows

- **Attendance.** Employees check in and out, and their work hours are recorded.
- **Leave requests.** The full lifecycle is handled: submission, then approval or rejection.

## Containerization and deployment

Every service runs in its own container, and Docker Compose orchestrates the deployment. The local setup starts the backend services and the database with `docker-compose up`, then runs the Next.js front end separately.

## Tech stack

| Component | Technology | Details |
| --- | --- | --- |
| Backend services | Go 1.22.3 | Fiber web framework, GORM ORM, JWT authentication |
| Front end | Next.js | React-based with server-side rendering |
| Database | PostgreSQL | Multiple schemas with cross-schema references |
| Message queue | RabbitMQ | Asynchronous communication between services |
| Containerization | Docker | Docker Compose for orchestration |
