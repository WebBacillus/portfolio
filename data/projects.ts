export const projectTopics = [
  { id: "ai-ml", label: "AI & ML" },
  { id: "web-apps", label: "Web apps" },
  { id: "backend", label: "Backend & APIs" },
  { id: "data", label: "Data & analytics" },
  { id: "automation", label: "Automation" },
  { id: "iot", label: "IoT & hardware" },
] as const

export type ProjectTopicId = (typeof projectTopics)[number]["id"]

type Project = {
  id: number
  slug: string
  title: string
  description: string
  image: string
  tags: string[]
  topics: ProjectTopicId[]
  imageFit?: "contain" | "cover"
  imageBg?: string
  liveUrl?: string
  repoUrl?: string
  workflowUrl?: string
  featured?: boolean
}

export const projects: Project[] = [
  {
    id: 1,
    slug: "takluz-tts",
    title: "Takluz TTS",
    description:
      "Takluz TTS enhances Twitch streams by using OpenAI's TTS model with a channel points system. Viewers can redeem points for diverse voices, offering a richer and more engaging TTS experience than standard bit/donation-based systems.",
    image: "/images/projects/takluz-tts.gif",
    tags: ["Go", "Twitch", "Text-to-speech", "API integrations"],
    topics: ["backend"],
    liveUrl: "https://www.twitch.tv/takluz/clip/CorrectEvilButterPogChamp-PmfPRK0Lz6-wpMai",
    repoUrl: "https://github.com/WebBacillus/Takluz_TTS",
    featured: true,
  },
  {
    id: 7,
    slug: "se-for-ml",
    title: "SE for ML",
    description:
      "I designed and created C4 diagrams at all four levels: Context, Container, Component, and Code. I also implemented model serving for an image classification system that predicts one of six storefront industries and routes uncertain cases to human review. I contributed to the team's design of drift detection and retraining workflows, where persistent drift can trigger retraining automatically while the serving model is reloaded manually by a reviewer. Through the project, I gained experience with Airflow, MLflow, PyTorch, torchvision, and scikit learn.",
    image: "/images/projects/se-for-ml.png",
    tags: ["MLOps", "Computer Vision", "FastAPI", "PyTorch", "Airflow", "MLflow", "Drift Detection", "C4"],
    topics: ["ai-ml", "backend", "automation"],
    repoUrl: "https://github.com/AtipatSiwhatrakool/SE-for-ML-Project",
    featured: true,
  },
  {
    id: 2,
    slug: "profanity-guard",
    title: "ProfanityGuard",
    description: "An AI-powered tool that detects and filters Thai-language profanity in speech, helping YouTubers and streamers avoid content restrictions. It enhances the airesearch/wav2vec2-large-xlsr-53-th model with additional Thai swear word data, improving Automatic Speech Recognition (ASR) accuracy.",
    image: "/images/projects/profanity-guard.png",
    tags: ["Speech Recognition", "Thai NLP", "Python", "Hugging Face"],
    topics: ["ai-ml"],
    liveUrl: "https://huggingface.co/spaces/BALAKA/ProfanityGuard",
    repoUrl: "https://github.com/WebBacillus/ProfanityGuard",
  },
  {
    id: 3,
    slug: "adozoil",
    title: "Adozoil (Anti + Doze off + Oil)",
    description: "An IoT solution for transport businesses, preventing accidents and fuel theft. It detects driver drowsiness with eye-tracking, triggering alarms and employer notifications. Fuel sensors flag unusual consumption as potential theft, sending alerts with location and speed.",
    image: "/images/projects/adozoil.gif",
    tags: ["IoT", "Computer Vision", "React", "Blynk", "ThingSpeak"],
    topics: ["iot", "web-apps"],
    liveUrl: "https://www.youtube.com/watch?v=IVfVR3CYpv4",
    repoUrl: "https://github.com/tanboon/project_embedded_system",
  },
  {
    id: 4,
    slug: "employee-management",
    title: "Employee Management",
    description: "The Employee Management System is a comprehensive web application for managing employees, tracking attendance (check-in/check-out), processing leave requests, and delivering notifications. It uses a microservices architecture built with Go backend services and a Next.js frontend.",
    image: "/images/projects/employee-management.jpg",
    tags: ["Go", "Next.js", "Microservices", "Clean Architecture", "RabbitMQ", "PostgreSQL"],
    topics: ["backend", "web-apps"],
    repoUrl: "https://github.com/night-sornram/employee-management",
    featured: true,
  },
  {
    id: 5,
    slug: "takluz-leaderboards",
    title: "Takluz Leaderboards",
    description: "Takluz Leaderboard is a Next.js web platform designed to display various statistics and insights from Twitch chat. It leverages Go Twitch IRC for efficient real-time data collection from live streams. The application is deployed on AWS ECR and ECS, ensuring scalability and reliability, and provides valuable analytical tools for streamers to understand their chat activity and community engagement.",
    image: "/images/projects/takluz-leaderboards.gif",
    tags: ["Next.js", "Go", "Twitch IRC", "Supabase", "AWS ECR", "AWS ECS"],
    topics: ["web-apps", "backend", "data"],
    liveUrl: "https://v0-leaderboard-pi.vercel.app",
    repoUrl: "https://github.com/WebBacillus/Takluz_Leaderboard",
    featured: true,
  },
  {
    id: 6,
    slug: "monkey-massage",
    title: "Monkey Massage",
    description: "Next.js web platform that allows users to browse massage shops, view detailed information about each shop, make reservations, and manage their bookings.",
    image: "/images/projects/monkey-massage.jpg",
    tags: ["Next.js", "NextAuth.js", "MUI", "Tailwind CSS", "Express.js", "MongoDB", "JWT", "Jest"],
    topics: ["web-apps", "backend"],
    liveUrl: "https://swdevprac2-project-kalaeksi-phloeng-rachan.vercel.app",
    repoUrl: "https://github.com/WebBacillus/MonkeyMassage-Backend",
    featured: true,
  },
  {
    id: 8,
    slug: "scopus-gender-prediction",
    title: "Scopus Gender Prediction",
    description:
      "A data pipeline that predicts the likely gender of an academic author from their name, then maps the result across the Scopus corpus by country and subject area. Built with the Elsevier and Crossref APIs, MongoDB, PySpark, and scikit-learn, with Streamlit and Plotly dashboards on top.",
    image: "/images/projects/scopus-gender-prediction.png",
    tags: ["Python", "Scikit-learn", "Streamlit", "Plotly", "PySpark", "MongoDB", "Data Pipeline"],
    topics: ["data", "ai-ml"],
    repoUrl: "https://github.com/Don-Yurillo/2110403_DSDE_Final_Project",
  },
  {
    id: 9,
    slug: "nectec-medical-ai",
    title: "NECTEC Medical AI",
    description:
      "A multi-label chest X-ray diagnostic system that predicts several findings at once from a single radiograph. Class imbalance was the main problem, addressed with augmentation and balancing before selecting EfficientNetV2 for the accuracy and efficiency trade-off.",
    image: "/images/projects/nectec-medical-ai.png",
    tags: ["Chest X-ray", "PyTorch", "EfficientNetV2", "Multi-label Classification", "Data Augmentation", "Medical Imaging"],
    topics: ["ai-ml"],
  },
  {
    id: 10,
    slug: "scb-tech-x-loan-origination",
    title: "SCB Tech X Loan Origination",
    description:
      "A loan origination pipeline that replaces manual steps with Go microservices and durable Temporal workflows, so a multi-step loan process survives a failed dependency instead of needing a manual re-run. PostgreSQL holds the records and Azure Blob Storage holds the documents.",
    image: "/images/projects/scb-tech-x-loan-origination.gif",
    imageFit: "contain" as const,
    imageBg: "#4B258B",
    tags: ["Go", "Temporal", "Microservices", "PostgreSQL", "Azure Blob Storage", "Loan Origination"],
    topics: ["backend", "automation"],
  },
  {
    id: 11,
    slug: "youtube-summarizer",
    title: "YouTube Summarizer",
    description:
      "I built this local n8n workflow to get useful ideas from YouTube videos without sitting through clickbait framing. It turns new Notion entries into timestamped breakdowns and Markdown notes with metadata and inline wiki links for Obsidian.",
    image: "/images/projects/youtube-summarizer-workflow.png",
    imageFit: "contain" as const,
    imageBg: "linear-gradient(160deg, #222222 0%, #171717 55%)",
    tags: ["n8n", "LLM Summarization", "Apify", "OpenAI", "Notion", "Dropbox", "Obsidian"],
    topics: ["automation", "ai-ml"],
    repoUrl: "https://github.com/WebBacillus/youtube-summarizer-n8n",
    workflowUrl: "/workflows/youtube-summarizer.json",
  },
  {
    id: 12,
    slug: "mongodb-monthly-activation",
    title: "MongoDB Monthly Activation",
    description:
      "A monthly n8n workflow that queries configured MongoDB collections and sends a Telegram report showing which queries returned a record. It is designed to create recurring activity for older Atlas projects.",
    image: "/images/projects/mongodb-monthly-activation-workflow.png",
    imageFit: "contain" as const,
    imageBg: "linear-gradient(160deg, #222222 0%, #171717 55%)",
    tags: ["n8n", "MongoDB", "Telegram", "Scheduled Workflow", "Reporting"],
    topics: ["automation"],
    repoUrl: "https://github.com/WebBacillus/mongodb-monthly-activation",
    workflowUrl: "/workflows/mongodb-monthly-activation.json",
  },
  {
    id: 13,
    slug: "customer-support-agent",
    title: "Customer Support Agent",
    description:
      "Research for a Thai and English support agent for TrueX smart home devices. The planned support scope covers ten models and 29 issue groups, with troubleshooting guided by reviewed product evidence.",
    image: "/images/projects/customer-support-agent.png",
    imageFit: "contain" as const,
    tags: ["Support Research", "RAG Prototype", "Thai & English", "Troubleshooting"],
    topics: ["ai-ml"],
  },
]
