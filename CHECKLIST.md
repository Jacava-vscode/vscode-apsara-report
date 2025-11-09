# ✅ Setup Checklist

Use this checklist to ensure everything is properly configured.

## Pre-Setup

- [ ] **Node.js installed**
  ```powershell
  node --version
  # Should show v14 or higher
  ```

- [ ] **npm installed**
  ```powershell
  npm --version
  # Should show 6.x or higher
  ```

- [ ] **Google Account available**
  - [ ] Access to Google Drive
  - [ ] Access to Google Cloud Console

---

## Installation

- [ ] **Dependencies installed**
  ```powershell
  npm install
  ```
  Expected output: All packages installed successfully

- [ ] **Check node_modules folder created**
  - [ ] Folder exists: `node_modules/`

---

## Google Cloud Setup

- [ ] **Created Google Cloud Project**
  1. [ ] Visited https://console.cloud.google.com/
  2. [ ] Created new project
  3. [ ] Project name: ___________________________

- [ ] **Enabled Google Drive API**
  1. [ ] Went to "APIs & Services" → "Library"
  2. [ ] Searched for "Google Drive API"
  3. [ ] Clicked "Enable"

- [ ] **Created OAuth Credentials**
  1. [ ] Went to "APIs & Services" → "Credentials"
  2. [ ] Configured OAuth consent screen
     - [ ] App name entered
     - [ ] Email addresses added
  3. [ ] Created OAuth 2.0 Client ID
     - [ ] Type: Desktop app
     - [ ] Name: Apsara Report Desktop
  4. [ ] Downloaded credentials
  5. [ ] Renamed to `credentials.json`
  6. [ ] Placed in project root folder

- [ ] **Verify credentials.json exists**
  ```powershell
  Test-Path "credentials.json"
  # Should return: True
  ```

---

## Google Drive Setup

- [ ] **Created folder in Google Drive**
  1. [ ] Folder name: ___________________________
  2. [ ] Copied folder ID from URL
     - URL: `https://drive.google.com/drive/folders/FOLDER_ID`
     - Folder ID: ___________________________

---

## Environment Configuration

- [ ] **Created .env file**
  ```powershell
  Copy-Item .env.example .env
  ```

- [ ] **Edited .env file**
  ```powershell
  notepad .env
  ```

- [ ] **Updated configuration**
  ```
  PORT=5000
  GOOGLE_DRIVE_FOLDER_ID=[Your folder ID here]
  NODE_ENV=development
  ```

- [ ] **Verify .env file**
  ```powershell
  Get-Content .env
  # Should show your configuration
  ```

---

## Authentication

- [ ] **Run authentication helper**
  ```powershell
  npm run auth
  ```

- [ ] **Followed authentication steps**
  1. [ ] Opened URL in browser
  2. [ ] Signed in to Google
  3. [ ] Granted permissions
  4. [ ] Copied authorization code
  5. [ ] Pasted code in console
  6. [ ] Saw success message

- [ ] **Verify token.json created**
  ```powershell
  Test-Path "token.json"
  # Should return: True
  ```

---

## Testing

- [ ] **Start the server**
  ```powershell
  npm start
  ```

- [ ] **Check server output**
  - [ ] No error messages
  - [ ] Shows: "🚀 Server is running on port 5000"
  - [ ] Shows: "📂 Access the application at http://localhost:5000"

- [ ] **Test in browser**
  1. [ ] Opened http://localhost:5000
  2. [ ] Page loads without errors
  3. [ ] Navigation works
  4. [ ] No console errors (F12 → Console)

---

## Functionality Tests

### Home Page
- [ ] **Test home page (index.html)**
  - [ ] Page loads
  - [ ] Statistics show (may be 0)
  - [ ] Navigation links work

### Dashboard
- [ ] **Test dashboard (dashboard.html)**
  - [ ] Page loads
  - [ ] Statistics cards appear
  - [ ] Charts render (may be empty)
  - [ ] No JavaScript errors

### Add Entry
- [ ] **Test form page (form.html)**
  - [ ] Page loads
  - [ ] Form displays
  - [ ] Type selector works
  - [ ] Computer specs appear when selected
  - [ ] Printer specs appear when selected

- [ ] **Add test equipment**
  1. [ ] Fill form with test data
     - Type: Computer
     - Brand: Test Brand
     - Model: Test Model
     - Status: Working
  2. [ ] Submit form
  3. [ ] Success message appears
  4. [ ] Redirects to list

### List View
- [ ] **Test list page (list.html)**
  - [ ] Page loads
  - [ ] Test equipment appears in table
  - [ ] Search box works
  - [ ] Type filter works
  - [ ] Status filter works

- [ ] **Test edit function**
  1. [ ] Click "Edit" on test equipment
  2. [ ] Modal appears with data
  3. [ ] Change something
  4. [ ] Save changes
  5. [ ] Success message appears
  6. [ ] Changes reflect in list

- [ ] **Test delete function**
  1. [ ] Click "Delete" on test equipment
  2. [ ] Confirmation dialog appears
  3. [ ] Confirm deletion
  4. [ ] Success message appears
  5. [ ] Item removed from list

### Data Persistence
- [ ] **Verify Google Drive storage**
  1. [ ] Go to Google Drive folder
  2. [ ] File `equipment_data.json` exists
  3. [ ] Open file
  4. [ ] Contains JSON data

- [ ] **Test data persistence**
  1. [ ] Stop server (Ctrl+C)
  2. [ ] Start server again
  3. [ ] Open list page
  4. [ ] Data still there

---

## Common Issues Checklist

### Server won't start
- [ ] Node.js is installed
- [ ] Dependencies are installed (`npm install`)
- [ ] Port 5000 is not in use
- [ ] .env file exists and is configured

### Authentication fails
- [ ] credentials.json exists in root
- [ ] credentials.json is valid JSON
- [ ] Google Drive API is enabled
- [ ] OAuth consent screen is configured
- [ ] Correct authorization code entered

### No data showing
- [ ] Server is running
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls
- [ ] Google Drive folder ID is correct
- [ ] token.json exists and is valid

### Google Drive errors
- [ ] Google Drive API is enabled
- [ ] Folder ID is correct
- [ ] token.json is valid
- [ ] Drive folder has correct permissions
- [ ] Internet connection is active

---

## Production Readiness (Optional)

If deploying to production:

- [ ] **Security**
  - [ ] Remove test data
  - [ ] Update OAuth redirect URIs
  - [ ] Use environment variables
  - [ ] Enable HTTPS

- [ ] **Performance**
  - [ ] Test with larger datasets
  - [ ] Optimize queries
  - [ ] Add caching if needed

- [ ] **Backup**
  - [ ] Document Drive folder location
  - [ ] Export data regularly
  - [ ] Have credentials backup

---

## Final Verification

- [ ] **All pages work**
  - [ ] Home page ✓
  - [ ] Dashboard ✓
  - [ ] Form page ✓
  - [ ] List page ✓

- [ ] **All features work**
  - [ ] Create equipment ✓
  - [ ] Read/View equipment ✓
  - [ ] Update equipment ✓
  - [ ] Delete equipment ✓
  - [ ] Search/Filter ✓
  - [ ] Charts display ✓

- [ ] **Data persists**
  - [ ] In Google Drive ✓
  - [ ] After server restart ✓

---

## 🎉 Ready to Use!

If all items are checked, your Apsara Report Management System is fully operational!

### Quick Reference Commands

```powershell
# Start server
npm start

# Development mode (auto-reload)
npm run dev

# Re-authenticate
npm run auth

# Reinstall dependencies
npm install
```

### Quick Links

- **Application**: http://localhost:5000
- **Dashboard**: http://localhost:5000/dashboard.html
- **Add Entry**: http://localhost:5000/form.html
- **View List**: http://localhost:5000/list.html

---

## Support Resources

- 📖 README.md - Overview and features
- 🚀 QUICKSTART.md - 5-minute setup
- 📚 SETUP.md - Detailed instructions
- 🏗️ ARCHITECTURE.md - System design
- 📊 PROJECT_SUMMARY.md - Complete summary

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Status**: Ready for Use ✅
