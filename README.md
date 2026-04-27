# 🏗️ BuildTrack Pro+ 

> **An offline-first, AI-powered construction management designed for the field.**

BuildTrack Pro+ is a full-stack, cross-platform application built to solve a genuine problem in the construction industry: managing projects, tracking complex expenses, and maintaining strict relational data integrity in environments with zero internet connectivity.

It replaces brittle, disconnected Excel spreadsheets with a robust PostgreSQL database, an offline-capable mobile architecture, and predictive LLM-powered cost analysis.

---

## ✨ Key Features

* 📶 **Offline-First Field Mode:** Engineered for remote job sites. Uses Service Workers and IndexedDB to cache the UI and queue database mutations. Data seamlessly syncs back to the cloud via background listeners the moment a cell signal is restored.
* 🧠 **AI Cost Advisor (Vendor-Agnostic):** Integrates an LLM pipeline to analyze historical spending and predict budget overruns. Built with an architecture that dynamically routes requests to open-source models for zero-cost scaling and 100% uptime fallback.
* 📱 **True Cross-Platform:** Deployed as a highly responsive Progressive Web App (PWA) and a native Android `.apk` (via Capacitor JS) utilizing the exact same React/Vite codebase.
* 🔒 **Strict Data Integrity:** End-to-end type safety. Zod schemas validate all incoming API payloads, and Drizzle ORM enforces relational integrity in the PostgreSQL database.

---

## 🛠️ Architecture & Tech Stack

**Frontend:**
* **Framework:** React 18 + Vite (TypeScript)
* **Styling:** Tailwind CSS + shadcn/ui
* **State & Caching:** React Query (TanStack) + IndexedDB (LocalForage)
* **Mobile Wrapper:** Capacitor JS (Android)

**Backend:**
* **Server:** Node.js + Express.js
* **Database:** PostgreSQL (Hosted on Neon.tech)
* **ORM:** Drizzle ORM
* **Validation:** Zod + OpenAPI Spec Generation
* **AI Middleware:** OpenRouter API (OpenAI SDK Compatible)

---

## 🧠 Engineering Highlights (For Reviewers)

### 1. Resilient AI Integration
Instead of hardcoding a single AI provider (like OpenAI), the backend utilizes an LLM routing layer (OpenRouter). This achieves three things:
1. Eliminates vendor lock-in.
2. Allows dynamic routing to the most cost-effective or performant open-weight models (Llama 3, Gemini Flash).
3. Ensures fault tolerance. If the API rate-limits, the backend utilizes a `try/catch` fallback payload to guarantee the frontend UI never breaks.

### 2. The "Excel Problem" & Relational Integrity
Construction teams heavily rely on Excel, leading to broken formulas and isolated data. BuildTrack Pro+ enforces strict relational schemas. An expense *cannot* exist without being explicitly tied to a verified Project and Phase. This creates a single source of truth for business owners.

### 3. Local-First Synchronization
A thin-wrapper mobile app fails on a construction site. BuildTrack Pro+ is designed to load its core assets directly from the device's storage. Read-queries check local cache before hitting the network, and write-queries utilize an offline queue system to prevent data loss during network drops.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* Node.js (v18+)
* `pnpm` package manager
* PostgreSQL (Local instance or Neon connection string)

### 1. Clone & Install
```bash
git clone [https://github.com/yourusername/buildtrack-pro.git](https://github.com/yourusername/buildtrack-pro.git)
cd buildtrack-pro
pnpm install

### 2. Environment Variables
Create a `.env` file in the `artifacts/api-server/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/buildtrack
OPENROUTER_API_KEY=sk-or-v1-...

### 3. Database Setup
Push the Drizzle schema to your PostgreSQL database:

```bash
pnpm --filter @workspace/db run push

### 4. Run the Application
Start the backend and frontend concurrently from the workspace root:

```bash
pnpm run dev

## 📦 Building for Android (APK)

To generate the native Android `.apk` for field testing:

```bash
cd artifacts/buildtrack
pnpm run build
npx cap sync android
npx cap open android

## 🌐 Live Deployment

* **Frontend UI:** Hosted on Vercel
* **API Backend:** Hosted on Railway
* **Database:** Serverless PostgreSQL via Neon.tech
