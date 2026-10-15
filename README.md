# Saradakosh Project

Welcome to the **Saradakosh** repository. This project is a hybrid application comprising a modern Next.js frontend, a Python-based Flask Admin Dashboard, and a suite of Python data-processing scripts. All components interact with a centralized, file-based SQLite database (`saradakosh-web/saradakosh.db`).

## 🚀 Project Overview

- **Frontend / Web App:** Built with Next.js 16.2.7, React 19, and Tailwind CSS (located in `/saradakosh-web`).
- **Admin Dashboard:** Built with Python and Flask, serving as a CMS to manage data (located in `/admin_dashboard`).
- **Data & ETL Scripts:** Python scripts at the root level used for parsing raw data, importing into SQLite (`import_to_sqlite.py`), and generating custom reports.
- **Database:** SQLite3 (`saradakosh-web/saradakosh.db`).

## 📋 Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18+ recommended)
- **Python** (v3.9+ recommended)
- **SQLite3 CLI** (for manual database operations)

## 🛠️ Quickstart Guide

Follow these three steps to get your local environment running:

### Step 1: Clone and Install Web Dependencies
Navigate to the web application directory and install the Node packages.
```bash
cd saradakosh-web
npm install
```

### Step 2: Set up the Python Environment
Open a new terminal session, navigate to the admin dashboard, and install the required dependencies (we recommend using a virtual environment).
```bash
cd admin_dashboard
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install flask
```

### Step 3: Run the Development Servers
Start the **Next.js frontend**:
```bash
cd saradakosh-web
npm run dev
# The web app will be accessible at http://localhost:3000
```

Start the **Flask Admin Dashboard** (in your other terminal):
```bash
cd admin_dashboard
python app.py
# The admin dashboard will be accessible at http://localhost:5000
```

## ⚙️ Environment Variables & Configuration

This project currently relies on hardcoded path resolutions rather than strict `.env` variables for database connectivity:
- **Admin Dashboard and Python tools:** Paths are anchored to the source files and select `saradakosh-web/saradakosh.db`, regardless of the terminal working directory.
- **Next.js Web App:** Database connections and embeddings use the same path anchored to the application package. Next.js output tracing explicitly includes the database in server deployments. See [the database reconciliation record](docs/database-reconciliation.md).

For legacy workbook imports, follow [the maintenance runbook](RUNBOOK.md#-reimporting-legacy-workbook-data). `python import_to_sqlite.py` replaces only legacy data in one transaction, preserves Library and scheduling tables, and leaves embedding generation as a separate operation. Keep the shared database in place; the raw workbooks do not contain its Library editorial content or all accepted legacy corrections.
