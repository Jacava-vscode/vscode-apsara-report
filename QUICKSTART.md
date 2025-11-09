# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1️⃣ Install Dependencies (1 minute)

```powershell
npm install
```

### 2️⃣ Set Up MongoDB Atlas (2 minutes)

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free (no credit card required)
   - Verify your email

2. **Create a Cluster:**
   - Click "Build a Database"
   - Choose **FREE** M0 tier
   - Select a cloud provider & region (closest to you)
   - Click "Create Cluster" (takes 1-3 minutes)

3. **Create Database User:**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `apsara_admin` (or your choice)
   - Password: Generate a secure password (save it!)
   - User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist Your IP:**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like): 
     ```
     mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/
     ```
   - Replace `<password>` with your actual password
   - Add database name at the end: `apsara_report`
   
   Final format:
   ```
   mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/apsara_report
   ```

### 3️⃣ Configure Environment (30 seconds)

```powershell
# Copy the example file
Copy-Item .env.example .env

# Edit .env and add your connection string
notepad .env
```

Update this line:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/apsara_report
```

### 4️⃣ Start the Application (30 seconds)

```powershell
npm start
```

Open browser: http://localhost:5000

## 🎉 You're Ready!

### What You Can Do:

1. **📊 View Dashboard** - See statistics and charts
2. **➕ Add Equipment** - Register computers and printers
3. **📋 View List** - Browse, search, and manage entries

## 📱 Pages Available:

- **Home**: http://localhost:5000/
- **Dashboard**: http://localhost:5000/dashboard.html
- **Add Entry**: http://localhost:5000/form.html
- **View List**: http://localhost:5000/list.html

## ⚠️ Troubleshooting

**Problem**: Cannot connect to MongoDB
**Solution**: Check your connection string, ensure IP is whitelisted, verify username/password

**Problem**: Server won't start
**Solution**: 
```powershell
# Check if port 5000 is in use
Get-NetTCPConnection -LocalPort 5000
# Kill the process if needed
```

**Problem**: Can't see data
**Solution**: Check server console for MongoDB connection errors

## 📖 Need More Help?

See detailed instructions in `SETUP.md`

## 🔧 Development Mode

For auto-reload during development:

```powershell
npm run dev
```

## 📦 Project Features

✅ Full-stack web application
✅ MongoDB Atlas cloud database
✅ Beautiful responsive UI
✅ Real-time dashboard with charts
✅ Search and filter functionality
✅ CRUD operations (Create, Read, Update, Delete)
✅ Computer and printer management
✅ Status tracking (Working, Maintenance, Broken)

---

**Built with**: Node.js, Express, MongoDB, Mongoose, Chart.js, Vanilla JavaScript
