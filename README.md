# vscode-apsara-report

## Apsara Report Management System

A full-stack web application for managing computer and printer inventory with **Multi-Cluster MongoDB Atlas** support for unlimited free storage!

## 🌟 Key Features

- 📊 **Dashboard**: Visual analytics with storage monitoring
- 📝 **Data Entry Form**: Add computer and printer records
- 📋 **List View**: View and filter all stored records
- ☁️ **Multi-Cluster Storage**: Unlimited free MongoDB Atlas storage
- 🔄 **Auto-Failover**: Automatic cluster switching when storage fills
- 💾 **Real-time Monitoring**: Visual storage dashboard with live updates
- 📦 **Smart Archiving**: Automatic old data management
- 📱 **Responsive Design**: Works on desktop and mobile

## 🚀 Multi-Cluster Architecture

This system supports **unlimited free storage** by connecting to multiple MongoDB Atlas free tier clusters:

```
PRIMARY Cluster:   512 MB (Active)
SECONDARY Cluster: 512 MB (Auto-switch when primary fills)
ARCHIVE Cluster:   512 MB (Optional - for old data)
... Add more as needed = UNLIMITED STORAGE!
```

### How It Works:
1. **Write**: System automatically writes to cluster with available space
2. **Read**: Queries all clusters and presents unified view
3. **Switch**: Auto-switches to next cluster when current reaches 90% capacity
4. **Monitor**: Real-time dashboard shows storage across all clusters

## 📂 Project Structure

```
Apsara Report/
├── server/                      # Backend Express server
│   ├── index.js                # Main server with cluster manager
│   ├── routes/
│   │   ├── equipment.js        # Equipment API (multi-cluster)
│   │   └── storage.js          # Storage monitoring API ✨ NEW
│   ├── models/
│   │   ├── Equipment.js        # Equipment schema
│   │   └── MultiClusterEquipment.js  # Multi-cluster wrapper ✨ NEW
│   └── services/
│       ├── database.js         # Single cluster connection
│       └── clusterManager.js   # Multi-cluster manager ✨ NEW
├── client/                      # Frontend application
│   ├── index.html              # Home page
│   ├── dashboard.html          # Dashboard + Storage Monitor ✨
│   ├── form.html               # Data entry form
│   ├── list.html               # List view page
│   ├── css/                    # Stylesheets
│   └── js/                     # JavaScript files
├── test-multicluster.js        # Multi-cluster test suite ✨ NEW
└── Documentation/
    ├── README.md               # This file
    ├── QUICK_START_MULTICLUSTER.md  # Quick start guide ✨ NEW
    ├── MULTI_CLUSTER_GUIDE.md       # Complete guide ✨ NEW
    ├── IMPLEMENTATION_SUMMARY.md    # Summary ✨ NEW
    ├── ARCHITECTURE_DIAGRAM.md      # Visual diagrams ✨ NEW
    ├── MONGODB_SETUP.md             # MongoDB setup
    └── MONGODB_VISUAL_GUIDE.md      # Visual setup guide

✨ = Multi-Cluster Features
```

## 🎯 Quick Start

### Option 1: Multi-Cluster (Recommended - Unlimited Storage!)

See **[QUICK_START_MULTICLUSTER.md](QUICK_START_MULTICLUSTER.md)** for 3-step setup!

### Option 2: Traditional Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. MongoDB Atlas Setup

You have **2 MongoDB Atlas clusters** configured:

**PRIMARY Cluster**: ApsaraCluster (apsaracluster.rcjepfw.mongodb.net)
**SECONDARY Cluster**: Cluster0 (cluster0.qq95l5f.mongodb.net)

Both are already configured in your `.env` file!

For adding more clusters, see [MONGODB_SETUP.md](MONGODB_SETUP.md)

### 3. Configure Environment

1. Copy `.env.example` to `.env`
2. Update `MONGODB_URI` with your MongoDB Atlas connection string

---

Secrets storage
- For local development and CI, you can store plaintext secret files in `./secrets` located at the repo root (ignored by git) or mount them at `/etc/secrets/` on Linux hosts.
- The backend automatically reads `SECRETS_DIR/.env` (or `/etc/secrets/.env`) and any files in that directory — each file becomes an environment variable by name (e.g., `ATLAS_PRIVATE_KEY` file sets `process.env.ATLAS_PRIVATE_KEY`).
- On Windows, you can use `.\
esources\secrets` in the repo root; configure `SECRETS_DIR` if you prefer a different location.

### 4. Run the Application

**Start Backend Server:**
```bash
npm start
# or for development with auto-reload
npm run dev
```

**Open Frontend:**
Open `client/index.html` in your browser or use:
```bash
npm run client
```

Then navigate to `http://localhost:3000`

=== Frontend vs Backend — quick deploy comparison ===

- Frontend (`client/`)
    - Type: static site (HTML/CSS/JS)
    - Local dev: `npm run client` runs `python -m http.server 3000` by default, or use `npx live-server client` for live reload
    - Deploy as: static site (Render Static, Netlify, Vercel, GitHub Pages), or let `server/` serve it in a single-service deploy
    - API URL: change `API_BASE_URL` in `client/js/api.js` if separating the services; prefer a relative path if you host both on the same domain
    - Fonts: `client/fonts` and `client/css/styles.css` contain self-hosting fallbacks for Khmer fonts. If you use a CDN or static site service, the font files and `fonts.css` must be present in `client/fonts/`.

- Backend (`server/`)
    - Type: Node.js (Express) — serves API and optionally `client/` static files
    - Local dev: `cd server && npm install && npm run dev` (nodemon), or root `npm start` from repo root
    - Deploy as: Node/Express service on Render (web service) or other Node host. Set `Root Directory` to `server` or use repo root with the `npm start` script that runs `server/index.js`.
    - Env & secrets: `MONGODB_URI_*`, `INTERNAL_CHECK_TOKEN`, `ATLAS_PUBLIC_KEY`, `ATLAS_PRIVATE_KEY` (optional for automation), `SECRETS_DIR` if mounting secret files
    - Health: `/api/health` — used by Render and CI to check DB connectivity and overall server health

Choose single service (server serves static) for simplicity or split services for scale & CDN benefits. See below for how to deploy each option.

---

## 🚀 Deploy to Render (step-by-step)

1. Create a new Web Service on Render and connect your GitHub repository.
2. Set the Build Command to `npm install` and the Start Command to `npm start` (or leave blank if you use `render.yaml`).
    - If you set the Render service `Root Directory` to `server`, Render will use `server/package.json` and `server/index.js`. If you leave the root blank, repo root `package.json` is used; both are valid. We recommend using the repo root with `npm start` which calls `node server/index.js`.
3. Add the following environment variables in Render's Dashboard (or use the `secrets/` mount if you prefer):
    - `MONGODB_URI_PRIMARY` (and others used by your clusters)
    - `INTERNAL_CHECK_TOKEN` — a random secret used by GitHub Actions to securely trigger internal checks on the server.
4. Optionally add `SECRETS_DIR` (if using mounted secrets) and put secrets into `/etc/secrets`.
5. Deploy the service. After it's up, use the GitHub Action `CI - Check DB on Render after deploy` to validate the database connections from the Render host.
    - Alternative: run `npm run check-db` from the repo root (or `node server/scripts/check_db.js`) to validate DB connections manually if Render supports custom commands.

This repo also contains `render.yaml` which instructs Render how to build and run the service. 

Note: This monorepo previously supported a one-way mirror of the `server/` folder into a separate `apsara-report-backend` repo using `scripts/sync-backend.ps1`. This pattern is deprecated — `server/` is now the canonical backend repository. The mirror script is retained for history but is disabled by default.

## Usage

1. **Dashboard**: View statistics and charts of all computers and printers
2. **Add Entry**: Fill the form to add new computer or printer records
3. **View List**: See all records with search and filter capabilities

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas, Mongoose ODM
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: Chart.js

## License

ISC
