---
summary: "An image classification system for storefront photos, with a human review queue and drift-triggered retraining."
role: "University group project. I designed and created the C4 diagrams at all four levels and implemented the model serving layer. Drift detection and the retraining workflow were designed with teammates."
---

## What it does

A browser-facing FastAPI application classifies storefront photos into six industries, records the prediction, and sends low-confidence cases to a reviewer. The point of the project is the work around a classifier, not the training run itself: serving predictions, observing incoming data, reviewing uncertain outcomes, tracking experiments, and deciding when new data warrants retraining.

It is a university group project built to practise the lifecycle of a machine learning system beyond a notebook. It is not a production deployment, and it does not claim to be one.

## How it works

- **Inference** runs as a separate host process. The FastAPI app reads model artifacts from a shared project directory and reads the current model pointer on startup or on an authorized reload.
- **Orchestration** is handled by Apache Airflow. The training DAG is started manually, while the drift detection DAG runs on a daily schedule.
- **Experiments** are tracked in MLflow, which records candidate feature extractors and their test metrics before a pointer is written to the selected model artifacts.
- **Persistence** uses PostgreSQL for prediction and review data.

### Human review for uncertainty

Predictions below 60% confidence are marked for review instead of being returned as final. The review queue shows pending predictions with confidence and image-quality signals, and the reviewer can approve or correct each one. Approved and corrected examples can feed later training runs.

### Avoiding reactive retraining

Drift checks use PSI for class distribution, CSI for brightness and blur, and a reviewer rejection-rate signal. Minimum sample counts, persistence requirements, and a cooldown limit noisy triggers, so a single unusual day does not start a training run.

When drift persists past the cooldown, monitoring can start the training DAG using reviewed examples alongside the original dataset. Promoting a model updates the model pointer, while reloading the serving model is a separate manual reviewer action through `POST /api/v1/admin/reload`.

## Model comparison

The training workflow compares ResNet34 and EfficientNetV2-S feature extractors with PCA and logistic regression across two training splits. In the latest run, EfficientNetV2-S on the first training split came out on top at roughly 0.82 test macro F1, narrowly ahead of both ResNet34 configurations and the EfficientNetV2-S second split. That figure is a project result from the training pipeline, not a personal metric.

## API surface

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/predict` | Submit an image; returns the predicted industry, confidence, and whether it was routed to manual review |
| GET | `/api/v1/review/pending` | List low-confidence predictions awaiting human review |
| POST | `/api/v1/review/{id}` | Approve or reject a pending review, optionally with a corrected label |
| GET | `/api/v1/monitoring/drift/latest` | Latest drift report (PSI, brightness CSI, blur CSI, rejection rate) |
| POST | `/api/v1/admin/reload` | Hot-reload the model artifact from the shared volume without restarting the API |
| GET | `/health` | Liveness probe with current model and device info |

## Tech stack

| Layer | Tools |
| --- | --- |
| Inference | PyTorch, torchvision, scikit-learn, FastAPI |
| Orchestration and experiments | Apache Airflow, MLflow |
| Persistence | PostgreSQL, local model-artifact volume |
| Development and runtime | Python, Docker Compose, uv |
