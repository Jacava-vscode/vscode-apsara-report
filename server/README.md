# apsara-report-backend

This repository contains the backend for Apsara Report. The `server/` folder is the canonical backend codebase.

Setup and running locally
1. Copy `server/.env.example` to `server/.env` and update MongoDB URIs and other settings.
2. Install dependencies and start server:

```powershell
Set-Location -LiteralPath 'D:\DEV\Apsara Report\server'
npm install
npm run dev
```

Reconfiguring nested backend
- If you previously had nested `server/server` content (older versions), run the helper script from the repo root to move nested files and remove the nested folder:

```powershell
Set-Location -LiteralPath 'D:\DEV\Apsara Report'
.\scripts\reconfigure-backend.ps1  # use -DryRun to preview
```

Database checks
- A helper `server/scripts/check_db.js` checks if all configured clusters are reachable and reports basic usage. It prefers `server/.env` but falls back to the repository root `.env` if not found.
