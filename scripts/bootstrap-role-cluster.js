'use strict';

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const adminUserSchema = require('../server/models/AdminUser');

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const uri = process.env.MONGODB_URI_ROLES;
const dbName = process.env.MONGODB_ROLE_DB_NAME || 'apsara_role';
const username = (process.env.DEFAULT_ADMIN_USERNAME || 'admin').toLowerCase();
const password = process.env.DEFAULT_ADMIN_PASSWORD || '@dminpanel';
const displayName = process.env.DEFAULT_ADMIN_DISPLAY_NAME || 'Administrator';
const saltRounds = parseInt(process.env.AUTH_PASSWORD_SALT_ROUNDS, 10) || 10;

if (!uri) {
  console.error('❌ MONGODB_URI_ROLES is not set. Please update your .env file.');
  process.exit(1);
}

(async () => {
  console.log('🔄 Connecting to roles cluster...');

  const connection = await mongoose.createConnection(uri, {
    dbName,
    serverSelectionTimeoutMS: parseInt(process.env.CLUSTER_SERVER_SELECTION_TIMEOUT_MS, 10) || 10000
  }).asPromise();

  const AdminUser = connection.model('AdminUser', adminUserSchema);
  console.log('📁 Ensuring adminusers collection exists with indexes...');
  await AdminUser.createCollection();
  await AdminUser.ensureIndexes();

  const existing = await AdminUser.findOne({ username }).exec();
  const permissions = {
    view: true,
    add: true,
    edit: true,
    delete: true,
    admin: true
  };

  if (!existing) {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    await AdminUser.create({
      username,
      displayName,
      role: 'Administrator',
      passwordHash,
      permissions,
      createdBy: 'bootstrap',
      updatedBy: 'bootstrap'
    });
    console.log('✅ Default administrator inserted into roles cluster');
  } else {
    console.log('ℹ️  Default administrator already present. Skipping insert.');
  }

  await connection.close();
  console.log('👋 Connection closed. Roles cluster ready.');
})();
