# ProcurePro 🚀

**ProcurePro** is a modern full-stack platform designed for smart procurement, tender compliance analysis, and technical standards auditing.

---

## 🏗️ Project Architecture

```
SIH/
├── backend/                  # Python FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── db.py             # SQLAlchemy engine (SQLite dev fallback / PostgreSQL)
│   │   ├── models.py         # Database models
│   │   └── routers/          # Modular API route controllers
│   ├── main.py               # FastAPI application entrypoint & health check
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Sample environment configuration
├── frontend/                 # React 19 + Vite 8 + Tailwind CSS
│   ├── src/
│   │   ├── App.jsx           # ProcurePro health dashboard & stack monitor
│   │   ├── index.css         # Tailwind CSS v4 styling & glassmorphic utilities
│   │   └── main.jsx          # React DOM entrypoint
│   ├── index.html            # Application HTML shell
│   ├── package.json          # Node dependencies & scripts
│   └── vite.config.js        # Vite + Tailwind build configuration
├── data/                     # Curated standards dataset (CSV / JSON)
│   ├── sample_standards.json # Curated ISO, BIS, IEEE standards
│   └── README.md
├── .gitignore                # Root git ignore covering Python & Node.js
└── README.md                 # Project documentation (this file)
```

---

## ⚡ Getting Started Locally

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** (Node v20+ recommended) and **npm**
- (Optional) **PostgreSQL** — If not provided, ProcurePro automatically runs with a zero-config local SQLite database (`procurepro.db`).

---

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. *(Optional)* Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - If using PostgreSQL, set your connection string:
     ```env
     DATABASE_URL=postgresql://username:password@localhost:5432/procurepro_db
     ```
   - If `DATABASE_URL` is empty, ProcurePro uses `sqlite:///./procurepro.db` automatically.

5. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

6. Verify the backend:
   - **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
   - **Interactive API Docs (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### 2. Frontend Setup (React + Vite + Tailwind CSS)

1. In a separate terminal, navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```
   The dashboard will automatically ping the backend at `http://localhost:8000/health` and display real-time connection status and latency.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Sample Output |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Root API welcome & route discovery | `{"service": "ProcurePro API", "version": "0.1.0"}` |
| `GET` | `/health` | Stack health, DB connectivity, and latency | `{"status": "ok", "service": "ProcurePro API", "database": {"status": "connected", "dialect": "sqlite"}}` |
| `GET` | `/docs` | Interactive Swagger API documentation | Interactive OpenAPI UI |

---

## 📊 Dataset Folder

The `data/` directory contains curated industry and government standards:
- [data/sample_standards.json](file:///z:/SIH/data/sample_standards.json): Pre-loaded ISO 9001, ISO 20400, BIS IS 1570, and IEEE standards.

---

## 🛠️ Build for Production

### Frontend
```bash
cd frontend
npm run build
```
This generates the optimized static assets inside `frontend/dist/`.

---

## 🔗 Repository
- **GitHub Repository**: [https://github.com/Shreyasu1016/SIH.git](https://github.com/Shreyasu1016/SIH.git)
