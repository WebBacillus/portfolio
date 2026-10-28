---
summary: "A multi-label chest X-ray diagnostic system that predicts several findings at once from a single radiograph."
role: "Research collaboration project with NECTEC. I built the model and the training pipeline; the work is not published, so the code and the clinical data stay with the research team."
---

## What it does

The system reads a chest radiograph and predicts several findings at the same time, rather than one disease per model. A single image can carry multiple labels, so the model has to treat the problem as multi-label classification.

## The hard part was the data, not the model

A chest X-ray dataset for a specific finding is naturally lopsided: the clearly abnormal cases are a small fraction of the study, and in a multi-label set the rarest finding can be a small single digit percentage of the images. Train on that as it stands and the model learns to predict the common normal case and nothing else. Accuracy looks fine and the model is useless.

Two things push back against that:

- **Augmentation** so the minority classes are not the only examples of their own appearance. Transforms are applied to the radiographs themselves rather than to the labels, so the added images stay clinically plausible.
- **Balancing** so the loss function does not see a training set that is almost entirely one class.

## The model

EfficientNetV2 was selected over the other candidates because the compound scaling it uses reaches a better accuracy and efficiency trade off at the smaller input sizes medical imaging runs at. That matters here, because the class imbalance work is only worth doing if the backbone can still learn from the augmented minority examples.

## Why there is no link

The work is a research collaboration, and the code and the clinical data are not published. The images are patient data, and the trained weights and the preprocessing choices that shaped the result are the research team's, so this page describes the approach rather than shipping the artefact.

## Tech stack

| Layer | Tools |
| --- | --- |
| Modelling | PyTorch, torchvision, EfficientNetV2 |
| Task setup | Multi-label classification, one model, several findings per image |
| Data handling | Augmentation and class balancing for imbalanced label distributions |
