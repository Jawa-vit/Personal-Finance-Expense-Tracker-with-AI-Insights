# 💰 FinTrack — Personal Finance Tracker

A full-stack personal finance app with AI insights, expense tracking, budget planning, and monthly reports.

## Tech Stack
- **Frontend**: React + Vite + Chart.js + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (via Mongoose)
- **Auth**: JWT + bcrypt
- **AI**: Anthropic Claude API (already wired in the UI)

---

## Project Structure

```
fintrack/
├── frontend/          ← React app (Vite)
│   └── src/
│       ├── components/   ← Reusable UI components
│       ├── pages/        ← Dashboard, Transactions, Budget, Reports, AI
│       ├── context/      ← AuthContext, FinanceContext
│       ├── hooks/        ← Custom hooks
│       └── utils/        ← Helpers, API calls
├── backend/           ← Node + Express API
│   ├── models/        ← Mongoose schemas
│   ├── routes/        ← API routes
│   ├── controllers/   ← Route logic
│   └── middleware/    ← Auth middleware
└── README.md
```

---

## Quick Start

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # fill in your values
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env      # fill in your values
npm run dev
```

Open http://localhost:5173
