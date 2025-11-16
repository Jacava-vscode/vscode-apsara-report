#!/usr/bin/env node
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load server .env explicitly - prefer `server/.env` but fall back to root `../.env` if not found
const serverEnv = path.resolve(__dirname, '..', '.env');
const rootEnv = path.resolve(__dirname, '..', '..', '.env');
if (require('fs').existsSync(serverEnv)) {
  dotenv.config({ path: serverEnv });
} else if (require('fs').existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
} else {
  dotenv.config();
}

const descriptors = [
  { name: 'primary', envKey: 'MONGODB_URI_PRIMARY', dbNameEnvKey: null },
  { name: 'secondary', envKey: 'MONGODB_URI_SECONDARY', dbNameEnvKey: null },
  { name: 'tertiary', envKey: 'MONGODB_URI_TERTIARY', dbNameEnvKey: null },
  { name: 'archive', envKey: 'MONGODB_URI_ARCHIVE', dbNameEnvKey: null },
  { name: 'images', envKey: 'MONGODB_URI_IMAGES', dbNameEnvKey: 'MONGODB_IMAGE_DB_NAME' },
  { name: 'roles', envKey: 'MONGODB_URI_ROLES', dbNameEnvKey: 'MONGODB_ROLE_DB_NAME' }
];

const connectionOptions = {
  serverSelectionTimeoutMS: parseInt(process.env.CLUSTER_SERVER_SELECTION_TIMEOUT_MS, 10) || 10000,
  maxPoolSize: parseInt(process.env.CLUSTER_MAX_POOL_SIZE, 10) || 5,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

async function checkOne(desc) {
  const uri = process.env[desc.envKey];
  if (!uri || uri.trim().length === 0) {
    console.log(`- ${desc.name.toUpperCase()}: not configured (skipped)`);
    return { name: desc.name, status: 'skipped' };
  }

  const opts = { ...connectionOptions };
  if (desc.dbNameEnvKey) {
    const dbName = process.env[desc.dbNameEnvKey];
    if (dbName && dbName.trim().length > 0) opts.dbName = dbName.trim();
  }

  const conn = mongoose.createConnection(uri, opts);
  try {
    await conn.asPromise();
    const stats = await conn.db.stats();
    console.log(`✓ ${desc.name.toUpperCase()}: connected — db='${conn.name || opts.dbName || stats.db}' collections=${stats.collections} dataSize=${Math.round(stats.dataSize / (1024*1024))}MB`);
    await conn.close();
    return { name: desc.name, status: 'connected', stats };
  } catch (err) {
    console.error(`✗ ${desc.name.toUpperCase()}: connection failed — ${err.message}`);
    try { await conn.close(); } catch(e){}
    return { name: desc.name, status: 'failed', error: err.message };
  }
}

async function main() {
  console.log('Checking configured MongoDB clusters (reading server/.env)...');

  const results = [];
  for (const d of descriptors) {
    const res = await checkOne(d);
    results.push(res);
  }

  const failed = results.filter(r => r.status === 'failed');
  const connected = results.filter(r => r.status === 'connected');

  console.log('\nSummary:');
  console.log(`- connected: ${connected.length}`);
  console.log(`- failed: ${failed.length}`);
  console.log(`- skipped: ${results.filter(r => r.status === 'skipped').length}`);

  if (failed.length > 0) process.exitCode = 2;
}

main().catch((e) => {
  console.error('Unexpected error:', e.message || e);
  process.exit(3);
});
