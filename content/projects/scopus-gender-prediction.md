---
summary: "A data pipeline that predicts the likely gender of an academic author from their name, then maps the result across the Scopus corpus by country and subject area."
role: "University team project for the Data Science and Data Engineering final project. Teammates built the collection and model work; I built the interactive Streamlit map and the colour scale that drives the dashboard."
---

## What it does

The project starts from the Scopus record of academic papers and asks one question about every author it can find: what is the likely gender of this person? It answers that from the shape of the name, attaches the prediction back to the author's country and subject area, and turns the result into a set of interactive dashboards.

The output is a gender distribution per country and per field, and a world map that lets you explore it.

## The pipeline

- **Collection** uses the Elsevier Scopus API for subject areas and author affiliations. Where a paper's author list is incomplete, the DOI is passed to the Crossref API to recover author metadata.
- **Name and gender labels** come from `behindthename.com`. The scraper walks the site's per country usage pages and records each name with the gender the site lists, treating an "m & f" entry as both.
- **Storage** is MongoDB. The raw document collection is loaded into PySpark for the preprocessing pass.
- **Cleaning** happens in notebooks: duplicate names are dropped, country codes are resolved to a shapefile friendly name, and the result is exported to CSV.

## The model

The only input is the name. A feature function turns it into character level keys: the first letter, the last letter, the first two and last two characters, the first three and last three, and the first four. A `DictVectorizer` turns each name into a sparse feature vector, and a Multinomial Naive Bayes classifier is fitted on it.

The fitted pipeline is pickled per country, so Thailand, the United States, India, and China each have their own model. A Random Forest over the same features was trained in parallel; the report below is the one saved in the repository, produced by the Naive Bayes pipeline.

Evaluation on 25,773 held out names:

| Metric | Female class | Male class | All |
| --- | --- | --- | --- |
| Precision | 0.90 | 0.82 | |
| Recall | 0.89 | 0.84 | |
| F1 | 0.89 | 0.83 | |
| Accuracy | | | 0.87 |
| Macro average F1 | | | 0.86 |
| Weighted average F1 | | | 0.87 |

## The dashboards

A Streamlit application sits on top of the predictions. It uses Plotly for the charts, PyDeck for the map layer, and Altair for the lighter views. Country outlines come from the Natural Earth 110m admin 0 dataset, and the map colour scale is computed in a shared module so the same scale applies to every view.

The shipped prediction table is 300,364 rows of author name, affiliation, subject code, citation count, publication type, year, and predicted gender.

## Tech stack

| Layer | Tools |
| --- | --- |
| Collection | Elsevier Scopus API, Crossref API, `requests`, BeautifulSoup |
| Storage and processing | MongoDB, PySpark, Pandas, NumPy |
| Modelling | Scikit-learn, `DictVectorizer`, Multinomial Naive Bayes, Random Forest |
| Serialisation | `pickle` for the per country pipelines |
| Dashboards | Streamlit, Plotly, PyDeck, Altair |
| Maps | Natural Earth 110m admin 0 |
