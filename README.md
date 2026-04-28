# 🏗️ BuildTrack Pro+ 

> **A Professional, Offline-First Construction Data Platform.**

BuildTrack Pro+ is engineered as a high-integrity **distributed data ingestion and analytics platform** designed for the construction industry. It solves the "Excel Problem" by migrating fragmented, unstructured workflows into a strictly normalized relational system that remains operational in zero-connectivity environments.

## 📺 App Demo

![BuildTrack Pro+ Demo](screenshots/demo.gif)

---
## 🧨 Data Problem

Construction workflows rely on fragmented Excel files, leading to:

- No schema enforcement → inconsistent data
- Broken relationships → unreliable reporting
- Manual aggregation → delayed insights

➡️ Result: low-trust financial data

BuildTrack Pro+ solves this by introducing a **validated, relational data system with enforced integrity**.

---

## 🔄 Data Pipeline Architecture

The system implements an end-to-end data pipeline for high-fidelity financial data, from edge ingestion to analytical insights:

- **Ingestion (Edge):** Offline capture via IndexedDB with local queueing.
- **Transport:** Background sync using Service Workers (batched + retry).
- **Processing:** Schema validation via Zod (client → API → DB).
- **Storage:** Normalized PostgreSQL with enforced relational constraints.
- **Consumption:** BI dashboards + AI analytics layer.

> ➡️ Designed for eventual consistency across distributed edge clients

<p align="center">
  <img src="./screenshots/pipe.png" alt="Data Model Erd" width="900"/>
</p>


---

## 📜 Data Contracts

Data integrity is enforced across every layer:

- **Client → API**: Validated via Zod schemas
- **API → Database**: Enforced via Drizzle ORM constraints

Guarantees:
- No malformed writes
- Strict type safety
- Consistent schema across the pipeline

---

## ⚙️ Reliability & Fault Tolerance

- Offline queue prevents data loss in low-connectivity environments
- Automatic retry mechanism for failed sync operations
- Conflict resolution using timestamp-based reconciliation
- Graceful fallback for AI processing failures

➡️ Ensures eventual consistency across distributed clients

---

## 📜 Audit Logging & Data Traceability

BuildTrack Pro+ implements an **immutable audit logging system** to track all critical data changes:

- Every create, update, and delete operation is recorded
- Logs are append-only and cannot be modified or deleted
- Captures historical state for full traceability

### Why this matters

- Ensures **data integrity and accountability**
- Enables **historical reconstruction of financial activity**
- Supports **audit/compliance use cases**

➡️ Designed as a tamper-resistant record of all system activity

## 🧩 Data Model Overview

The database is designed around strict relational integrity to eliminate the redundancy and "formula rot" common in spreadsheet workflows.


<p align="center">
  <img src="./screenshots/model.png" alt="Data Pipeline" width="900"/>
</p>

### Data Modeling Decisions
- **Normalized Schema**: Designed to eliminate data redundancy and ensure a single source of truth for financial reporting.
- **Strict Relational Hierarchy**: **Project → Phase → Expense**. Enforced foreign keys prevent orphaned records and ensure 100% relational integrity.
- **Relational Vendor Management**: Moves vendor data from simple strings to a referenced `vendors` entity for professional supply-chain analytics.
- **Analytical Query Optimization**: Indexed frequently queried paths (vendor spend, phase budgets) for high-performance reporting.

### Example Schema Definition (Drizzle ORM)
```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id INTEGER REFERENCES phases(id) ON DELETE SET NULL,
  vendor_id TEXT REFERENCES vendors(name) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
## 🔍 Analytical Query Patterns

The schema is optimized for:

- Vendor spend aggregation  
- Phase-level budget tracking  
- Project-wide cost summaries  
- Time-series expense analysis  

Indexes applied on:
- project_id  
- phase_id  
- created_at  


---

## 🤖 AI as a Data Processing Layer

Instead of a static feature, BuildTrack Pro+ implements an **unstructured data processing pipeline** using LLMs:

- **Data Extraction**: Converts unstructured physical receipt images into structured JSON payloads.
- **Normalization**: Maps diverse vendor descriptions into standardized relational formats.
- **Downstream Analytics**: Feeds normalized data into BI dashboards for real-time cost anomaly detection.

---

## 🛠️ Data Engineering Focus

BuildTrack Pro+ is built on core data engineering principles to ensure reliability and scalability:

- **Unstructured Data → Structured Data Migration**: Transforms messy field notes and receipt photos into a rigorous SQL format.
- **Reliable Distributed Data Ingestion**: Handles eventual consistency and data synchronization from edge devices.
- **Data Reliability Layer**: Implements retry mechanisms for failed syncs and **idempotent API design** to prevent duplicate writes during retries.
- **Type-Safe Data Contracts**: Ensures data remains valid at every hop of the pipeline (Zod + TypeScript).

---

## 🧰 Data Engineering Stack Mapping

- **Ingestion:** IndexedDB, Service Workers (Offline Queue)
- **Processing:** Node.js, Express, Zod (Validation Layer)
- **Storage:** PostgreSQL (Neon Serverless)
- **Modeling:** Drizzle ORM (Type-safe Relational Modeling)
- **Analytics:** Recharts (BI Visualization), LLM OCR Pipeline

---

## 🚀 Getting Started

### Local Development (Quick Start)
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Faizee669/Buildtrackpro.git
    cd Buildtrackpro
    ```
2.  **Environment Setup**:
    Create a `.env` file in the root with your credentials.
3.  **One-Click Start (Windows)**:
    Run the included `start-app.bat` to automatically install dependencies and start both servers.

---

## 🌐 Deployment Architecture

- **Frontend**: Hosted on **Vercel** with SPA routing rewrites.
- **Backend API**: Hosted on **Railway** with workspace-aware build scripts.
- **Security**: Dual-Auth strategy using cross-domain cookies and fallback `localStorage` tokens.

---

## 💡 Key Takeaway

This project demonstrates a **production-style data platform**, including:

- Distributed data ingestion
- Strong data contracts and validation
- Relational modeling for analytics
- Offline-first reliability with eventual consistency

Designed to reflect real-world data engineering systems.

**Developed for the Construction Industry by Faizan.**
