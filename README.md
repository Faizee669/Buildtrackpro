# 🏗️ BuildTrack Pro+

### Data Architecture & Predictive Analytics Platform for Construction

> **An edge-to-cloud, AI-powered data platform designed to replace fragmented Excel workflows with a centralized, reliable, and intelligent analytics system.**

---

## 📌 Overview

BuildTrack Pro+ addresses a core problem in the construction industry: **poor data integrity caused by disconnected spreadsheets**.

This platform replaces manual, error-prone workflows with a **structured PostgreSQL-backed system**, enabling:

* Real-time financial visibility
* Predictive cost analysis
* Reliable, relational data modeling

The result: **better decisions, fewer budget overruns, and zero spreadsheet chaos.**

---

## 🚀 Core Features

### 🔄 Edge-to-Cloud Data Pipeline

* Offline-first architecture for remote job sites
* Local data persistence using IndexedDB
* Background sync queue ensures **zero data loss**
* Automatic reconciliation once connectivity is restored

### 📈 Predictive Cost Analytics (AI)

* LLM-powered analysis of historical transaction data
* Detects anomalies and forecasts budget overruns
* Vendor-agnostic AI routing via OpenRouter
* Structured JSON outputs for seamless UI integration

### 🛡️ Data Integrity & Governance

* Strict schema enforcement using Drizzle ORM
* Runtime validation with Zod
* Enforced relational constraints across:

  * Projects
  * Phases
  * Vendors
* Guarantees **high-quality, analytics-ready data**

### 📊 Interactive Dashboards

* Real-time aggregation of financial metrics
* Insights into:

  * Vendor spending
  * Category distribution
  * Phase-level budgets
* Built with responsive, modern UI components

---

## 🏗️ Architecture & Tech Stack

### **Data Layer**

* PostgreSQL (Neon serverless)
* Drizzle ORM (type-safe schema management)
* Zod + OpenAPI (validation & contracts)

### **Data Pipeline**

* Node.js + Express (REST API)
* IndexedDB (offline storage)
* React Query (state synchronization)

### **Analytics & UI**

* OpenRouter (LLM routing: Llama 3, Gemini, etc.)
* Recharts (data visualization)
* React 18 + Tailwind + shadcn/ui

---

## 🧠 Engineering Highlights

### 1. Eliminating the "Excel Silo"

Traditional workflows rely on scattered spreadsheets with no integrity.

BuildTrack Pro+ introduces:

* A **normalized relational schema**
* Enforced entity relationships
* A **single source of truth** for all financial data

➡️ Result: Reliable, audit-ready analytics.

---

### 2. Offline-First Data Synchronization

Construction environments often lack stable internet.

Solution:

* Local-first writes using IndexedDB
* Background sync queue with retry logic
* Conflict-aware reconciliation system

➡️ Result: **No lost data, even in zero-connectivity environments**

---

### 3. Vendor-Agnostic AI Pipeline

Instead of locking into a single AI provider:

* Requests are dynamically routed via OpenRouter
* Supports multiple models (cost vs performance optimization)
* Built-in fallback handling for reliability

➡️ Result: **Flexible, resilient, and cost-efficient AI processing**

---

## ⚙️ Getting Started

### Prerequisites

* Node.js (v18+)
* `pnpm`
* PostgreSQL (local or Neon)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/buildtrack-pro.git
cd buildtrack-pro
pnpm install
```

---

### 2. Environment Setup

Create a `.env` file in `artifacts/api-server/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/buildtrack
OPENROUTER_API_KEY=your_api_key
```

---

### 3. Initialize Database

```bash
pnpm --filter @workspace/db run push
```

---

### 4. Run the App

```bash
pnpm run dev
```

---

## 📱 Android Build (APK)

```bash
cd artifacts/buildtrack
pnpm run build
npx cap sync android
npx cap open android
```

---

## 🌐 Deployment

* **Frontend:** Vercel
* **Backend:** Railway
* **Database:** Neon (Serverless PostgreSQL)

---

## 💡 Why This Project Matters

BuildTrack Pro+ is more than a CRUD app — it demonstrates:

* Real-world **data engineering principles**
* Offline-first system design
* AI integration with production constraints
* Strong emphasis on **data integrity and reliability**

---

## 📎 Source

Original version: 

---

## 🔮 Future Improvements

* Role-based access control (RBAC)
* Advanced forecasting models (time-series)
* Multi-project portfolio analytics
* Mobile-first UX enhancements

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome. Feel free to open an issue or submit a PR.

---

## 📬 Contact

If you're interested in the architecture or want to collaborate, reach out!

---
