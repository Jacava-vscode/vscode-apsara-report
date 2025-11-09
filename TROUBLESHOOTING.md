# 🔧 Troubleshooting Guide

Common issues and their solutions for Apsara Report Management System.

---

## Installation Issues

### ❌ npm install fails

**Symptoms:**
- Error messages during `npm install`
- Dependencies not installing

**Solutions:**

1. **Check Node.js version:**
   ```powershell
   node --version
   ```
   Should be v14 or higher. If not, update Node.js.

2. **Clear npm cache:**
   ```powershell
   npm cache clean --force
   npm install
   ```

3. **Delete node_modules and retry:**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

4. **Run as Administrator:**
   Right-click PowerShell → "Run as Administrator"

---

## Authentication Issues

### ❌ "credentials.json not found"

**Symptoms:**
- Error when running `npm run auth`
- Cannot start server

**Solutions:**

1. **Verify file exists:**
   ```powershell
   Test-Path "credentials.json"
   ```

2. **Check file location:**
   - Must be in project root
   - Same folder as package.json

3. **Download again from Google Cloud Console:**
   - Go to APIs & Services → Credentials
   - Download OAuth client
   - Rename to `credentials.json`
   - Place in root folder

### ❌ "Invalid credentials" or "Authentication failed"

**Symptoms:**
- Can't authenticate with Google
- OAuth errors

**Solutions:**

1. **Verify credentials.json format:**
   ```powershell
   Get-Content credentials.json
   ```
   Should be valid JSON with `installed` or `web` key.

2. **Check OAuth consent screen:**
   - Must be configured in Google Cloud Console
   - Add your email as test user
   - Publishing status can be "Testing"

3. **Recreate credentials:**
   - Delete old OAuth client
   - Create new Desktop app credentials
   - Download and replace credentials.json

### ❌ "Token expired" or "Invalid token"

**Symptoms:**
- Server starts but can't access Drive
- 401 Unauthorized errors

**Solutions:**

1. **Delete and regenerate token:**
   ```powershell
   Remove-Item token.json
   npm run auth
   ```

2. **Check token.json permissions:**
   - File should be readable
   - Contains access_token and refresh_token

---

## Server Issues

### ❌ "Port 5000 already in use"

**Symptoms:**
- Error: EADDRINUSE
- Server won't start

**Solutions:**

1. **Find process using port:**
   ```powershell
   Get-NetTCPConnection -LocalPort 5000
   ```

2. **Kill the process:**
   ```powershell
   # Get PID from above command
   Stop-Process -Id [PID] -Force
   ```

3. **Use different port:**
   Edit `.env`:
   ```
   PORT=3000
   ```

### ❌ Server starts but pages don't load

**Symptoms:**
- Server running but browser shows "Can't connect"
- 404 errors

**Solutions:**

1. **Check server output:**
   - Look for error messages
   - Verify "Server is running" message appears

2. **Verify URL:**
   - Use `http://localhost:5000` (not https)
   - Check port matches .env file

3. **Check firewall:**
   - Allow Node.js through Windows Firewall
   - Temporarily disable firewall to test

4. **Try different browser:**
   - Clear browser cache
   - Try incognito mode
   - Try different browser

---

## Google Drive Issues

### ❌ "Drive API not enabled"

**Symptoms:**
- Error mentioning Drive API
- 403 Forbidden errors

**Solutions:**

1. **Enable Drive API:**
   - Go to Google Cloud Console
   - APIs & Services → Library
   - Search "Google Drive API"
   - Click Enable

2. **Wait a few minutes:**
   - API activation takes time
   - Retry after 2-3 minutes

### ❌ "Folder not found" or "Invalid folder ID"

**Symptoms:**
- Can't read/write data
- 404 errors for Drive operations

**Solutions:**

1. **Verify folder ID:**
   - Open folder in Google Drive
   - Check URL: `drive.google.com/drive/folders/FOLDER_ID`
   - Copy FOLDER_ID exactly

2. **Check .env file:**
   ```powershell
   Get-Content .env
   ```
   Verify GOOGLE_DRIVE_FOLDER_ID is correct.

3. **Check folder permissions:**
   - Folder must be owned by authenticated account
   - Or shared with authenticated account

4. **Create new folder:**
   - Create fresh folder in Drive
   - Update .env with new ID
   - Restart server

### ❌ "Insufficient permissions"

**Symptoms:**
- Can read but can't write
- Permission denied errors

**Solutions:**

1. **Re-authenticate with correct scope:**
   ```powershell
   Remove-Item token.json
   npm run auth
   ```

2. **Check folder ownership:**
   - Must own folder OR
   - Have edit permissions

3. **Verify OAuth scopes:**
   - Should include `drive.file` scope
   - Check server/auth-helper.js

---

## Frontend Issues

### ❌ Blank page or white screen

**Symptoms:**
- Page loads but shows nothing
- No content visible

**Solutions:**

1. **Check browser console (F12):**
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Verify server is running:**
   ```powershell
   # In PowerShell where server is running
   # Should see "Server is running" message
   ```

3. **Check API URL:**
   - Open `client/js/api.js`
   - Verify `API_BASE_URL = 'http://localhost:5000/api'`
   - Update if using different port

4. **Clear browser cache:**
   - Ctrl+Shift+Delete
   - Clear cached images and files
   - Hard reload: Ctrl+F5

### ❌ "Failed to fetch" or CORS errors

**Symptoms:**
- Network errors in console
- CORS policy errors

**Solutions:**

1. **Verify server is running:**
   - Server must be started
   - Check terminal for server output

2. **Check API URL matches server port:**
   - client/js/api.js should match server port
   - Both should use same protocol (http)

3. **Restart server:**
   - Stop server (Ctrl+C)
   - Start again: `npm start`

### ❌ Charts not showing

**Symptoms:**
- Dashboard loads but no charts
- Canvas elements empty

**Solutions:**

1. **Check Chart.js loaded:**
   - Open dashboard.html
   - Verify CDN link in <script> tag
   - Check browser console for 404 errors

2. **Verify data exists:**
   - Add some equipment first
   - Charts need data to display

3. **Check console errors:**
   - F12 → Console
   - Look for Chart.js errors

---

## Data Issues

### ❌ Data not saving

**Symptoms:**
- Form submits but data disappears
- List is empty

**Solutions:**

1. **Check server console:**
   - Look for error messages
   - Verify Drive API calls succeed

2. **Verify Google Drive file:**
   - Open Drive folder
   - Check if equipment_data.json exists
   - Verify it contains data

3. **Test manually:**
   ```powershell
   # Add a test entry
   # Check Drive folder immediately
   # File should update
   ```

4. **Check write permissions:**
   - Folder permissions
   - Token has correct scopes

### ❌ Data not loading

**Symptoms:**
- List page is empty
- Dashboard shows zero

**Solutions:**

1. **Check if data exists:**
   - Open Google Drive folder
   - Open equipment_data.json
   - Should contain array of objects

2. **Verify API endpoint:**
   - Open browser
   - Go to: `http://localhost:5000/api/equipment`
   - Should see JSON data

3. **Check browser console:**
   - F12 → Console
   - Look for API errors

4. **Clear and re-add data:**
   - Add test equipment via form
   - Check if it appears

---

## Common Error Messages

### "ENOENT: no such file or directory"

**Cause:** Missing file

**Solution:**
- Check which file is missing from error message
- Verify all required files exist
- Re-download missing files if needed

### "SyntaxError: Unexpected token"

**Cause:** Invalid JSON

**Solution:**
- Check credentials.json is valid JSON
- Check .env file syntax
- Verify equipment_data.json in Drive

### "Cannot read property of undefined"

**Cause:** Missing data or configuration

**Solution:**
- Check .env file exists
- Verify all required env variables set
- Check data structure matches expected format

### "TypeError: Cannot read properties of null"

**Cause:** Element not found in DOM

**Solution:**
- Check HTML file for correct element IDs
- Verify JavaScript loads after HTML
- Check for typos in getElementById()

---

## Performance Issues

### ❌ Slow loading

**Symptoms:**
- Pages take long to load
- Laggy interface

**Solutions:**

1. **Check data size:**
   - Large equipment_data.json slows things
   - Consider pagination if >1000 items

2. **Check network:**
   - Slow internet affects Drive API
   - Test connection speed

3. **Optimize queries:**
   - Add indexes
   - Implement caching

### ❌ Server crashes

**Symptoms:**
- Server stops unexpectedly
- Must restart frequently

**Solutions:**

1. **Check logs:**
   - Read error messages
   - Look for patterns

2. **Use process manager:**
   ```powershell
   npm install -g pm2
   pm2 start server/index.js
   ```

3. **Add error handling:**
   - Check server/index.js for try-catch blocks
   - Add more error handlers if needed

---

## Development Issues

### ❌ Changes not reflecting

**Symptoms:**
- Edit files but see no changes
- Old code still running

**Solutions:**

1. **Restart server:**
   - Stop: Ctrl+C
   - Start: `npm start`

2. **Use nodemon for auto-reload:**
   ```powershell
   npm run dev
   ```

3. **Clear browser cache:**
   - Hard reload: Ctrl+Shift+R
   - Or clear cache completely

4. **Check you're editing correct file:**
   - Verify file path
   - Check if file is saved

---

## Testing Checklist

When debugging, test in this order:

1. **Basic functionality:**
   - [ ] Server starts without errors
   - [ ] Can access homepage
   - [ ] No console errors

2. **Authentication:**
   - [ ] credentials.json exists
   - [ ] token.json exists
   - [ ] Can access Google Drive

3. **API endpoints:**
   - [ ] GET /api/equipment works
   - [ ] POST /api/equipment works
   - [ ] Other endpoints work

4. **Frontend:**
   - [ ] All pages load
   - [ ] Forms submit
   - [ ] Data displays

5. **Data persistence:**
   - [ ] Data saves to Drive
   - [ ] Data persists after restart
   - [ ] CRUD operations work

---

## Getting Help

### Before asking for help:

1. **Check error messages:**
   - Server console
   - Browser console (F12)
   - Network tab

2. **Try these docs:**
   - README.md
   - SETUP.md
   - QUICKSTART.md
   - This file

3. **Gather information:**
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - Error messages (full text)
   - What you were doing when error occurred
   - What you've already tried

### Useful debugging commands:

```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# List installed packages
npm list --depth=0

# Check if files exist
Test-Path credentials.json
Test-Path token.json
Test-Path .env

# View environment variables
Get-Content .env

# Check what's using port 5000
Get-NetTCPConnection -LocalPort 5000

# Test API endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/equipment"
```

---

## Quick Fixes

Try these in order:

1. **Restart everything:**
   ```powershell
   # Stop server (Ctrl+C)
   # Close browser
   # Start server
   npm start
   # Open browser
   ```

2. **Clear and reinstall:**
   ```powershell
   Remove-Item -Recurse node_modules
   Remove-Item package-lock.json
   npm install
   ```

3. **Re-authenticate:**
   ```powershell
   Remove-Item token.json
   npm run auth
   ```

4. **Fresh start:**
   ```powershell
   # Backup .env if needed
   Remove-Item token.json
   Remove-Item -Recurse node_modules
   npm install
   npm run auth
   npm start
   ```

---

## Still Having Issues?

1. Check all files are present
2. Verify Google Cloud setup
3. Review error messages carefully
4. Try with fresh Google Drive folder
5. Test with minimal data

---

**Remember:** Most issues are configuration-related. Double-check:
- credentials.json (valid and in root)
- .env file (correct folder ID)
- token.json (exists and valid)
- Google Drive API (enabled)
- Server (running on correct port)

---

**Last Updated**: November 2025
