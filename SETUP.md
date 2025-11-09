# Setup Instructions for Apsara Report Management System

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Google Account for Drive API access

## Step-by-Step Setup

### 1. Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

### 2. Set Up Google Drive API

#### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "Apsara Report Management")
4. Click "Create"

#### 2.2 Enable Google Drive API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on it and click "Enable"

#### 2.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Apsara Report Management
   - User support email: Your email
   - Developer contact: Your email
   - Save and Continue through all steps
4. Back to "Create OAuth client ID":
   - Application type: "Desktop app"
   - Name: "Apsara Report Desktop"
   - Click "Create"
5. Download the credentials file
6. Rename it to `credentials.json` and place it in the project root directory

### 3. Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder (e.g., "Apsara Equipment Data")
3. Open the folder
4. Copy the folder ID from the URL:
   - URL looks like: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the `FOLDER_ID_HERE` part

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` file and update:
   ```
   PORT=5000
   GOOGLE_DRIVE_FOLDER_ID=your_actual_folder_id_here
   NODE_ENV=development
   ```

### 5. First-Time Authentication

The first time you run the server, you need to authenticate with Google:

1. Start the server:
   ```powershell
   npm start
   ```

2. If authentication is needed, you'll see an error with a URL in the console
3. Copy the URL and open it in your browser
4. Sign in with your Google account
5. Grant the requested permissions
6. Copy the authorization code from the URL after redirect
7. Create a `token.json` file manually with the token, or use the auth helper

Alternatively, you can run the authentication helper (if created):
```powershell
node server/auth-helper.js
```

### 6. Run the Application

#### Start the Backend Server:

```powershell
npm start
```

Or for development with auto-reload:

```powershell
npm run dev
```

The server will start on http://localhost:5000

#### Access the Frontend:

Open your browser and navigate to:
```
http://localhost:5000
```

Or open the `client/index.html` file directly in your browser.

## Usage Guide

### Dashboard
- View comprehensive statistics
- See charts and analytics
- Monitor equipment status

### Add Entry
- Select equipment type (Computer or Printer)
- Fill in required fields (Brand, Model, Status)
- Add optional details (Serial number, location, etc.)
- For computers: Add processor, RAM, storage, OS
- For printers: Add printer type, technology, connectivity
- Submit the form

### View List
- Browse all equipment
- Search by brand, model, serial number
- Filter by type and status
- Edit or delete entries

## Troubleshooting

### Server won't start
- Make sure Node.js is installed: `node --version`
- Check if port 5000 is available
- Verify `.env` file exists and is configured correctly

### Google Drive authentication fails
- Ensure `credentials.json` is in the project root
- Check that Google Drive API is enabled
- Verify the folder ID is correct
- Try deleting `token.json` and re-authenticating

### Data not showing
- Check server console for errors
- Verify Google Drive folder permissions
- Ensure the server is running
- Check browser console for JavaScript errors

### CORS errors
- Make sure the server is running on port 5000
- Update API_BASE_URL in `client/js/api.js` if needed

## Project Structure

```
Apsara Report/
├── server/
│   ├── index.js              # Express server
│   ├── routes/
│   │   └── equipment.js      # API routes
│   └── services/
│       └── driveService.js   # Google Drive integration
├── client/
│   ├── index.html           # Home page
│   ├── dashboard.html       # Dashboard
│   ├── form.html           # Data entry form
│   ├── list.html           # List view
│   ├── css/
│   │   └── styles.css      # Styles
│   └── js/
│       ├── api.js          # API client
│       ├── dashboard.js    # Dashboard logic
│       ├── form.js         # Form handler
│       └── list.js         # List view logic
├── package.json
├── .env                    # Environment variables (create this)
├── .env.example           # Environment template
├── credentials.json       # Google credentials (download this)
└── README.md

```

## Security Notes

- Never commit `credentials.json`, `token.json`, or `.env` to version control
- Keep your Google API credentials secure
- Use appropriate Google Drive folder permissions
- Consider implementing user authentication for production use

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all setup steps were completed
3. Ensure all dependencies are installed
4. Check file permissions

## Future Enhancements

Potential improvements:
- User authentication and authorization
- Multi-tenant support
- Advanced reporting and exports
- Email notifications for maintenance schedules
- Mobile app
- Barcode/QR code scanning
