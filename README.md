\# 🏗️ BuildTrack Pro+ | Data Architecture & Predictive Analytics Platform

\> \*\*An edge-to-cloud data pipeline and AI-driven analytics platform for enterprise construction management.\*\*

BuildTrack Pro+ is a comprehensive data application built to solve a critical data quality and reporting problem in the construction industry: migrating companies away from brittle, disconnected Excel spreadsheets into a centralized, high-integrity PostgreSQL database with real-time predictive analytics.

\---

\## 📊 Key Data & Analytics Features

\* 🔄 \*\*Edge-to-Cloud Data Ingestion:\*\* Engineered a fault-tolerant offline data capture system for remote job sites. Field data is cached via IndexedDB and processed through a background sync queue, acting as a resilient edge-ingestion pipeline to the central PostgreSQL database.

\* 📈 \*\*Predictive Cost Analytics (AI):\*\* Designed a vendor-agnostic LLM pipeline (via OpenRouter) to analyze historical transaction data, detect spending anomalies, and generate predictive budget overruns in real-time.

\* 🛡️ \*\*Data Governance & Integrity:\*\* Enforced strict data contracts from the client to the database. Utilized Zod for payload validation and Drizzle ORM for strict schema enforcement, guaranteeing relational integrity for downstream business intelligence (BI) reporting.

\* 📉 \*\*Interactive BI Dashboards:\*\* Transformed raw relational data into aggregated, actionable metrics (vendor spending, category distributions, phase budgets) visualized dynamically for stakeholders.

\---

\## 🛠️ Data Stack & Architecture

\*\*Data Storage & Modeling:\*\*

\* \*\*Database:\*\* PostgreSQL (Hosted on Neon.tech Serverless)

\* \*\*Data Modeling / ORM:\*\* Drizzle ORM

\* \*\*Schema Validation:\*\* Zod + OpenAPI

\*\*Data Ingestion & Pipeline:\*\*

\* \*\*API / Middleware:\*\* Node.js + Express.js REST API

\* \*\*Edge Storage:\*\* IndexedDB (LocalForage) for offline queuing

\* \*\*State Synchronization:\*\* React Query (TanStack)

\*\*Analytics & Visualization:\*\*

\* \*\*AI Processing:\*\* OpenRouter API (Dynamic routing to Llama 3 / Gemini for text analytics)

\* \*\*Data Visualization:\*\* Recharts + React 18

\* \*\*UI/UX:\*\* Tailwind CSS + shadcn/ui

\---

\## 🧠 Engineering & Analytics Highlights

\### 1. Resolving the "Excel Silo" via Strict Data Modeling

Construction teams typically rely on fragmented Excel files, resulting in broken formulas, duplicate data entry, and zero relational integrity. I designed a normalized PostgreSQL database schema where every financial expense must explicitly map to a verified \`Project\`, \`Phase\`, and \`Vendor\`. This single source of truth ensures downstream analytics are 100% accurate.

\### 2. Resilient Edge Data Synchronization

Because construction sites lack reliable internet, standard API requests result in massive data loss. I architected an edge-ingestion queue using Service Workers. When a user submits data offline, it is serialized and stored locally. Upon network restoration, the system automatically flushes the queue, handling timestamped conflict resolution to ensure no data is lost in the pipeline.

\### 3. Vendor-Agnostic AI Data Pipeline

To perform text-based data analysis and predictive budgeting, I integrated an AI middleware layer. Instead of hardcoding a single provider, the system dynamically routes unstructured data prompts through OpenRouter. This allows the platform to use the most cost-effective open-weight models (like Llama 3) for heavy analytical tasks, while maintaining a strict JSON-output structure for the frontend UI.

\---

\## 🚀 Getting Started (Local Development)

\### Prerequisites

\* Node.js (v18+)

\* \`pnpm\` package manager

\* PostgreSQL (Local instance or Neon connection string)

\### 1. Clone & Install

\`\`\`bash

git clone \[https://github.com/yourusername/buildtrack-pro.git\](https://github.com/yourusername/buildtrack-pro.git)

cd buildtrack-pro

pnpm install

\## 🧠 Engineering Highlights (For Reviewers)

\### 1. Resilient AI Integration

Instead of hardcoding a single AI provider (like OpenAI), the backend utilizes an LLM routing layer (OpenRouter). This achieves three things:

1\. Eliminates vendor lock-in.

2\. Allows dynamic routing to the most cost-effective or performant open-weight models (Llama 3, Gemini Flash).

3\. Ensures fault tolerance. If the API rate-limits, the backend utilizes a \`try/catch\` fallback payload to guarantee the frontend UI never breaks.

\### 2. The "Excel Problem" & Relational Integrity

Construction teams heavily rely on Excel, leading to broken formulas and isolated data. BuildTrack Pro+ enforces strict relational schemas. An expense \*cannot\* exist without being explicitly tied to a verified Project and Phase. This creates a single source of truth for business owners.

\### 3. Local-First Synchronization

A thin-wrapper mobile app fails on a construction site. BuildTrack Pro+ is designed to load its core assets directly from the device's storage. Read-queries check local cache before hitting the network, and write-queries utilize an offline queue system to prevent data loss during network drops.

\---

\## 🚀 Getting Started (Local Development)

\### Prerequisites

\* Node.js (v18+)

\* \`pnpm\` package manager

\* PostgreSQL (Local instance or Neon connection string)

\### 1. Clone & Install

\`\`\`bash

git clone \[https://github.com/yourusername/buildtrack-pro.git\](https://github.com/yourusername/buildtrack-pro.git)

cd buildtrack-pro

pnpm install

\### 2. Environment Variables

Create a \`.env\` file in the \`artifacts/api-server/\` directory:

\`\`\`env

DATABASE\_URL=postgresql://user:password@localhost:5432/buildtrack

OPENROUTER\_API\_KEY=sk-or-v1-...

\### 3. Database Setup

Push the Drizzle schema to your PostgreSQL database:

\`\`\`bash

pnpm --filter @workspace/db run push

\### 4. Run the Application

Start the backend and frontend concurrently from the workspace root:

\`\`\`bash

pnpm run dev

\## 📦 Building for Android (APK)

To generate the native Android \`.apk\` for field testing:

\`\`\`bash

cd artifacts/buildtrack

pnpm run build

npx cap sync android

npx cap open android

\## 🌐 Live Deployment

\* \*\*Frontend UI:\*\* Hosted on Vercel

\* \*\*API Backend:\*\* Hosted on Railway

\* \*\*Database:\*\* Serverless PostgreSQL via Neon.tech
