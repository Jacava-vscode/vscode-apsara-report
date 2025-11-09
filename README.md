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
