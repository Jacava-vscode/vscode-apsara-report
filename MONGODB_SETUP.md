# 🗄️ MongoDB Atlas Setup Guide

Complete step-by-step guide to set up MongoDB Atlas for Apsara Report Management System.

---

## 📋 What You'll Need

- Email address (for MongoDB Atlas account)
- Internet connection
- 5-10 minutes

---

## 🚀 Step 1: Create MongoDB Atlas Account

### 1.1 Sign Up

1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Fill in the form:
   - Email address
   - First name
   - Last name
   - Password (minimum 8 characters)
3. Click **"Create your Atlas account"**
4. Check your email and verify your account

### 1.2 Complete the Welcome Questionnaire (Optional)

- You can skip this or fill it in
- Click "Finish" when done

---

## 🌐 Step 2: Create a Free Cluster

### 2.1 Build a Database

1. Click **"Build a Database"** button
2. Choose deployment option: **"M0 FREE"**
   - ✅ 512 MB storage
   - ✅ Shared RAM
   - ✅ Free forever
   - ✅ No credit card required

### 2.2 Select Cloud Provider & Region

1. **Provider**: Choose any (AWS, Google Cloud, or Azure)
2. **Region**: Select closest to your location for better performance
   - Example: `us-east-1` (N. Virginia) for USA
   - Example: `eu-west-1` (Ireland) for Europe
   - Example: `ap-southeast-1` (Singapore) for Asia
3. **Cluster Name**: Keep default or change to `ApsaraCluster`

### 2.3 Create Cluster

1. Review your selections
2. Click **"Create Cluster"**
3. Wait 1-3 minutes for cluster to be created
   - You'll see "Creating your cluster..." message
   - Green checkmark appears when ready

---

## 🔐 Step 3: Create Database User

### 3.1 Add Database User

1. You'll see "Security Quickstart" screen
2. **Authentication Method**: Choose "Password"
3. **Username**: `apsara_admin` (or your preferred name)
4. **Password**: Click "Autogenerate Secure Password" or create your own
   - ⚠️ **IMPORTANT**: Copy and save this password!
   - You'll need it for the connection string
5. **Database User Privileges**: Select "Read and write to any database"
6. Click **"Create User"**

### 3.2 Save Your Credentials

```
Username: apsara_admin
Password: [your_password_here]
```

💡 **Tip**: Save these in a secure password manager!

---

## 🌍 Step 4: Configure Network Access

### 4.1 Add IP Address

1. You'll see "Where would you like to connect from?" screen
2. Click **"Add My Current IP Address"** 
   - OR click **"Add a Different IP Address"**
3. For development, you can click **"Allow Access from Anywhere"**
   - IP Address: `0.0.0.0/0`
   - Description: "Allow all IPs"
   - ⚠️ **Note**: For production, use specific IPs only!
4. Click **"Finish and Close"**
5. Click **"Go to Database"** on success message

---

## 🔗 Step 5: Get Connection String

### 5.1 Connect to Your Cluster

1. On Database Deployments page, find your cluster
2. Click **"Connect"** button
3. Choose: **"Connect your application"**

### 5.2 Select Driver and Version

1. **Driver**: Node.js
2. **Version**: 5.5 or later
3. You'll see a connection string like:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 5.3 Customize Connection String

1. **Copy the connection string**
2. **Replace placeholders**:
   - Replace `<username>` with: `apsara_admin`
   - Replace `<password>` with your actual password (no brackets!)
3. **Add database name** after `.net/`:
   - Change: `mongodb+srv://...@cluster0.xxxxx.mongodb.net/`
   - To: `mongodb+srv://...@cluster0.xxxxx.mongodb.net/apsara_report`

### 5.4 Final Connection String Format

```
mongodb+srv://apsara_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/apsara_report?retryWrites=true&w=majority
```

**Example** (with fake password):
```
mongodb+srv://apsara_admin:MySecure123Pass@cluster0.abc1de.mongodb.net/apsara_report?retryWrites=true&w=majority
```

⚠️ **Important**: 
- Remove `<` and `>` brackets
- No spaces in the connection string
- Password should NOT have special characters like @, :, /, ?, #

---

## ⚙️ Step 6: Configure Your Application

### 6.1 Create .env File

```powershell
# In project root directory
Copy-Item .env.example .env
```

### 6.2 Edit .env File

```powershell
notepad .env
```

### 6.3 Add Connection String

Update the file with your connection string:

```env
PORT=5000
MONGODB_URI_PRIMARY=mongodb+srv://apsara_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/apsara_report?retryWrites=true&w=majority
NODE_ENV=development
```

### 6.4 Save the File

- Save and close notepad
- ⚠️ Make sure there are no extra spaces or line breaks!

### 6.5 Configure Optional Clusters

Add the following variables if you plan to separate workloads:

```env
# Dedicated image cluster
MONGODB_URI_IMAGES=mongodb+srv://<user>:<password>@your-image-cluster.mongodb.net/
MONGODB_IMAGE_DB_NAME=apsara_image

# Dedicated role directory cluster (stores login accounts)
MONGODB_URI_ROLES=mongodb+srv://apsara_admin:YOUR_PASSWORD@apsararole.xxxxx.mongodb.net/
MONGODB_ROLE_DB_NAME=apsara_role

# Session & authentication defaults
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=@dminpanel
DEFAULT_ADMIN_DISPLAY_NAME=Administrator
AUTH_PASSWORD_SALT_ROUNDS=10
AUTH_SESSION_TTL_MINUTES=60
AUTH_SESSION_SWEEP_MINUTES=15
```

> ℹ️ **Password encoding tip:** If your password contains special characters (e.g. `@`), URL-encode them before placing them in the connection string. Example: `apsara@dmin` becomes `apsara%40dmin`.

Once the variables are set, initialize each optional cluster as needed:

```powershell
npm run bootstrap:images   # prepares the image attachment cluster
npm run bootstrap:roles    # prepares the role directory cluster
```

---

## ✅ Step 7: Test Connection

### 7.1 Install Dependencies

```powershell
npm install
```

### 7.2 Start the Server

```powershell
npm start
```

### 7.3 Check for Success

You should see:
```
✅ Successfully connected to MongoDB
📊 Database: apsara_report
🚀 Server is running on port 5000
```

### 7.4 If You See Errors

**Error**: "MongoServerError: bad auth"
- **Solution**: Check username and password in connection string

**Error**: "MongoNetworkError: connection timeout"
- **Solution**: Check Network Access settings, whitelist your IP

**Error**: "Invalid connection string"
- **Solution**: Check for typos, spaces, or missing parts

---

## 🎯 Step 8: Verify Database

### 8.1 Add Test Data

1. Open browser: **http://localhost:5000**
2. Click **"Add Entry"**
3. Fill in test equipment data
4. Submit the form

### 8.2 Check MongoDB Atlas

1. Go back to MongoDB Atlas
2. Click **"Browse Collections"** on your cluster
3. You should see:
   - Database: `apsara_report`
   - Collection: `equipments`
   - Your test data inside

🎉 **Success!** Your application is connected to MongoDB!

---

## �️ Optional: Dedicated Image Cluster

To offload file attachments into their own MongoDB Atlas project:

1. **Create a new Atlas project and cluster** (e.g., name the cluster `Cluster1`).
2. **Create the database user** (the same `apsara_admin` account works).
3. **Add a database named `apsara_image`** – the provided bootstrap script will create it on first run.
4. **Update `.env`** with the new connection string:

   ```env
   MONGODB_URI_IMAGES=mongodb+srv://apsara_admin:apsara%40dmin@imagedb-1.u5ui8ir.mongodb.net/apsara_image
   MONGODB_IMAGE_DB_NAME=apsara_image
   ```

   > ⚠️ Remember to URL-encode the password (`@` → `%40`).

5. **Initialize the image database**:

   ```powershell
   npm install
   node scripts/bootstrap-image-cluster.js
   ```

6. **Restart the backend** so the new cluster is detected.

Attachments uploaded through the app will now be stored in the `imageattachments` collection inside the `apsara_image` database.

---

## �🔄 Managing Your Database

### View Data in Atlas

1. **Database Deployments** → Click your cluster
2. Click **"Browse Collections"**
3. Select `apsara_report` database
4. Select `equipments` collection
5. View/edit documents

### Monitor Usage

1. Go to **"Metrics"** tab
2. View:
   - Operations per second
   - Data size
   - Network usage
3. Free tier includes:
   - 512 MB storage
   - Unlimited queries (within reasonable limits)

### Backup Data

1. Go to **"Backup"** tab (Pro feature)
2. Or manually export:
   - Use MongoDB Compass (free GUI tool)
   - Or use `mongodump` command

---

## 🔧 Connection String Troubleshooting

### Issue: Password has special characters

If your password contains `@`, `:`, `/`, `?`, `#`, `[`, `]` you need to URL-encode them:

| Character | Encoded |
|-----------|---------|
| @ | %40 |
| : | %3A |
| / | %2F |
| ? | %3F |
| # | %23 |
| [ | %5B |
| ] | %5D |

**Example**:
- Original password: `Pass@123:`
- Encoded password: `Pass%40123%3A`

### Issue: Cannot connect from current IP

**Solution**:
1. Go to Network Access
2. Click "Edit" on your IP entry
3. Update to current IP or use `0.0.0.0/0`

### Issue: Cluster paused (after 60 days of inactivity)

**Solution**:
1. Go to Database Deployments
2. Click **"Resume"** button
3. Wait for cluster to resume

---

## 📊 MongoDB Atlas Dashboard Tour

### Main Sections

1. **Database Deployments**: View and manage clusters
2. **Data Services**: 
   - Browse Collections (view data)
   - Search (full-text search)
   - Charts (data visualization)
3. **Security**:
   - Database Access (users)
   - Network Access (IP whitelist)
4. **Monitoring**: Performance metrics
5. **Billing**: Usage and costs (free tier = $0)

---

## 💡 Pro Tips

### Tip 1: Use MongoDB Compass (Optional)

- Free GUI tool to view and edit data
- Download: https://www.mongodb.com/products/compass
- Connect using the same connection string

### Tip 2: Multiple Environments

Create separate databases for dev/prod:
- Development: `apsara_report_dev`
- Production: `apsara_report_prod`

### Tip 3: Index Your Data

Collections automatically have indexes on `_id`
- For better performance, add indexes on frequently queried fields
- Already included in the application code!

### Tip 4: Monitor Your Usage

- Free tier: 512 MB
- Check usage: Database → Metrics tab
- Upgrade to M10 if you exceed limits

---

## 🆘 Getting Help

### MongoDB Documentation

- Main docs: https://docs.mongodb.com/
- Atlas docs: https://docs.atlas.mongodb.com/
- Mongoose docs: https://mongoosejs.com/

### Support

- MongoDB Community: https://community.mongodb.com/
- Atlas Support: Available from dashboard
- Stack Overflow: Tag questions with `mongodb` and `mongoose`

---

## ✅ Checklist

Use this to verify your setup:

- [ ] MongoDB Atlas account created
- [ ] Email verified
- [ ] Free M0 cluster created
- [ ] Database user created (username + password saved)
- [ ] IP address whitelisted
- [ ] Connection string obtained
- [ ] Password replaced in connection string
- [ ] Database name added to connection string
- [ ] .env file created and updated
- [ ] npm install completed
- [ ] Server starts without errors
- [ ] "Connected to MongoDB" message appears
- [ ] Test data added successfully
- [ ] Data visible in Atlas Browse Collections

---

## 🎉 You're All Set!

Your MongoDB Atlas database is ready to use with the Apsara Report Management System!

**Connection String Template**:
```
mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER].mongodb.net/apsara_report
```

**Your Database**:
- Database Name: `apsara_report`
- Collection Name: `equipments`
- Location: Cloud (MongoDB Atlas)

---

**Last Updated**: November 2025
**MongoDB Atlas**: Free Tier (M0)
