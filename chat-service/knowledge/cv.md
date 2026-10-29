# Chatbot CV knowledge — milestone 1 (DRAFT, pending owner approval)

<!--
Purpose: the answerable fact set for the milestone 1 chatbot.
Scope: CV facts only. Project detail is not answerable. See docs/chatbot/knowledge-contract.md.
Rules for whoever edits this file:
  1. Every fact carries a source label: [Resume], [About page], [Project page], or [In progress].
  2. Keep facts at source fidelity. Do not elaborate a bullet into an explanation.
  3. Do not add project detail here. The routing index lives in knowledge/projects.md.
  4. Skills may be attached to a project, employer, role, or outcome ONLY where the
     contract marks that skill E1 or E2. E3 skills stay bare list items.
  5. Work that is still in progress is labelled [In progress] and never stated as shipped.
-->

## IDENTITY

Pasit Khumsena. [Resume]

## SUMMARY

Computer Engineering student graduating in December 2026 with hands-on experience
developing LLM-powered applications and RAG-based customer support systems. Strong
backend engineering foundation with experience in AI workflow design, document
processing, and API integrations. [Resume]

The summary also says he is seeking an entry level AI Engineer role. Keep it for now.
It goes stale at the first offer and the owner has not decided to drop it. [Resume]

## EDUCATION

Chulalongkorn University. B.Eng. in Computer Engineering. GPAX 3.71 out of 4.0.
Expected December 2026. [Resume]

Relevant coursework: Software Engineering for ML Systems, Digital and AI Transformation,
Introduction to Data Science and Data Engineering, Data Structures and Algorithms,
System Design for Software Development, Software Engineering. [Resume]

## EXPERIENCE

### True Corporation | August 2026 to Present | AI Engineer (Intern) [Resume]

- Product Ownership: Drive product design and project planning for an AI customer support
  agent; define project scope, development timelines, and customer workflows, supported by
  market and competitor research.
- Thai PDF Processing and Unicode Recovery: Develop a document processing pipeline using
  Docling and font-aware Unicode recovery to resolve unknown Thai characters and prepare
  device manuals for a RAG knowledge base.
- AI Customer Support Agent: Develop a RAG prototype for TrueX smart home support using
  LLMs and Qdrant; implement device retrieval and evidence validation, and design guided
  troubleshooting workflows with escalation to human support.

The bullet says "Develop a RAG prototype". Call it a prototype. The work is in progress,
and the repository that carries it describes itself as a planned research prototype whose
files do not establish that an application, evaluation, deployment, or product integration
has been built. [In progress]

### National Interbank Transaction Management and Exchange (NITMX) | April 2025 to July 2026 | Software Engineer (Part-time) [Resume]

- Legacy Code Modernization and Security: Successfully upgraded critical legacy
  applications from Java 11 to Java 25, refactoring the codebase to leverage modern language
  features while identifying and mitigating security vulnerabilities.
- Anti-Mule Account: Collaborated on a national-level project detecting mule accounts;
  designed and executed comprehensive automated API testing utilizing Postman and Bruno to
  validate complex input fields and verify XML outputs for data integrity.
- Interbank Financial Adjustment Web Application: Developed a secure interbank financial
  adjustment web application using Go, Clean Architecture, and Hexagonal Architecture.
- Blockchain Infrastructure: Contributed to the design of a blockchain network using
  Hyperledger Besu; developed full-stack features with NestJS and Next.js, and established
  a resilient Disaster Recovery (DR) plan by provisioning backup nodes and automating
  deployment using Ansible playbooks.

## PROGRAMME

AI Builders Program, March 2023 to June 2023. Participant. Developed a project for Thai
profanity detection in video using AI and natural language processing, and presented it at
the Bangkok Art and Culture Centre. [About page]

## SKILLS

Listed skills, at list fidelity. State them as listed skills. [Resume]

- Languages: Go, Python, C++, TypeScript, JavaScript, Java
- Databases: PostgreSQL, MongoDB, MySQL
- Backend and Architecture: REST API, gRPC, Microservices, Clean and Hexagonal Architecture, Kafka, RabbitMQ
- AI and ML: PyTorch, Torchvision, Scikit-learn, Pandas, NumPy, Apache Airflow, MLflow, Streamlit, Plotly
- Generative AI: OpenAI API, LLM Tool Calling, RAG, Text-to-Speech (TTS), n8n, LangChain, Langgraph, Qdrant
- Testing and Quality: Unit, Integration, and Load Testing, promptfoo (Red Teaming, Agent Evaluation)

The list is complete on the site and stays complete here. The owner confirmed that no
skill is dropped for thin evidence. What changes is the wording when a skill is attached
to work, not the list itself. See the pairing section.

### Skill pairings that may be stated with a project, employer, role, or outcome

Only these. Everything else in the list above stays a bare list item. [Resume], [Project page]

- Takluz TTS: Go, TypeScript, JavaScript, MongoDB, OpenAI API, Text-to-Speech (TTS), REST API
- SE for ML: Python, PyTorch, Torchvision, Scikit-learn, Pandas, NumPy, Apache Airflow, MLflow, PostgreSQL
- Employee Management: Go, TypeScript, JavaScript, PostgreSQL, REST API, Microservices, Clean and Hexagonal Architecture, RabbitMQ
- Takluz Leaderboards: TypeScript, JavaScript, REST API
- Monkey Massage: MongoDB
- Scopus Gender Prediction: Python, Scikit-learn, Pandas, NumPy, Streamlit, Plotly, PySpark, MongoDB
- NECTEC Medical AI: PyTorch, torchvision, EfficientNetV2
- SCB Tech X Loan Origination: Go, Temporal, PostgreSQL, Azure Blob Storage
- True Corporation: RAG, LLM Tool Calling, Qdrant, Docling
- NITMX: Java, Go, Clean Architecture, Hexagonal Architecture, Hyperledger Besu, NestJS, Next.js, Ansible, Postman, Bruno

### Skills that may be attached only with an in-progress label

A skill from this group may be named, but only alongside a statement that the work is in
progress. Never state it as a shipped, deployed, or released result. [In progress]

- LangGraph: the TrueX customer support agent. The repository builds a real LangGraph
  StateGraph for the multi-turn runtime, and the work is a prototype in progress.
- promptfoo: listed as a skill. The customer support agent repository contains no
  promptfoo code, configuration, or usage, so nothing may be claimed about it beyond
  the list entry. If the owner names a specific promptfoo work, it may be described as
  in progress until that work exists.

### Metrics that may be stated

Use the project's own wording. Never state a project result as a personal metric, and
never state a metric that does not appear on the project page. [Project page]

- SE for ML: roughly 0.82 test macro F1, described on the page as a project result
- ProfanityGuard: described on the page as roughly twice as good as the pretrained model
  when compared with WER, CER, and F1
- Scopus Gender Prediction: 0.87 accuracy and 0.87 weighted average F1 on 25,773 held out
  names, described on the page as a project result. The page states the report came from
  the Naive Bayes pipeline, with a Random Forest trained in parallel.

## CONTACT

- Email: web.pasit.kh@gmail.com. May be stated. [Resume]
- Phone: do not state the digits. Direct the visitor to the contact page.
- GitHub: github.com/WebBacillus. May be stated. [Resume]
- LeetCode: leetcode.com/u/webbalaka. May be stated. [Resume]
- Location: Pathum Wan, Bangkok, Thailand. City level only. [Project page]

## RESUME DOWNLOAD

The resume is available as a one page PDF from the About page. Offer it as a download.
Never read an answer out of the PDF. [Resume]
