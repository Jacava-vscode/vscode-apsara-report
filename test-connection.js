// MongoDB Multi-Cluster Connection Test Script
require('dotenv').config();
const mongoose = require('mongoose');

const clusterTargets = [
    { label: 'PRIMARY', envKey: 'MONGODB_URI_PRIMARY', required: true },
    { label: 'SECONDARY', envKey: 'MONGODB_URI_SECONDARY', required: false },
    { label: 'TERTIARY', envKey: 'MONGODB_URI_TERTIARY', required: false },
    { label: 'ARCHIVE', envKey: 'MONGODB_URI_ARCHIVE', required: false },
    // Backwards compatibility for legacy single-URI setups
    { label: 'LEGACY', envKey: 'MONGODB_URI', required: false, legacy: true }
];

console.log('🔍 Testing MongoDB Connection(s)...\n');
console.log('📋 Configuration:');
console.log('   Port:', process.env.PORT || '(default)');
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Primary URI configured:', process.env.MONGODB_URI_PRIMARY ? '✅ Yes' : '❌ No');
console.log('   Secondary URI configured:', process.env.MONGODB_URI_SECONDARY ? '✅ Yes' : '⚪ Skipped');
console.log('   Tertiary URI configured:', process.env.MONGODB_URI_TERTIARY ? '✅ Yes' : '⚪ Skipped');
console.log('   Archive URI configured:', process.env.MONGODB_URI_ARCHIVE ? '✅ Yes' : '⚪ Skipped');
console.log('');

function buildCollectionHandle(connection) {
    const db = connection.db;
    const collectionName = 'connection_test';
    return db.collection(collectionName);
}

async function cleanUpTestDoc(collection) {
    try {
        await collection.deleteMany({ test: true, context: 'multi-cluster-check' });
    } catch (err) {
        console.warn('   ⚠️  Cleanup warning:', err.message);
    }
}

async function testCluster({ label, envKey, required, legacy }) {
    const uri = process.env[envKey];

    if (!uri) {
        console.log(`⏭️  ${label}: skipped (${envKey} not set)`);
        return { label, success: !required, skipped: true };
    }

    console.log(`� Testing ${label} cluster (${envKey})`);

    const connection = mongoose.createConnection(uri, {
        serverSelectionTimeoutMS: parseInt(process.env.CLUSTER_SERVER_SELECTION_TIMEOUT_MS, 10) || 10000,
        maxPoolSize: parseInt(process.env.CLUSTER_MAX_POOL_SIZE, 10) || 5
    });

    connection.on('error', (err) => {
        console.error(`   ❌ ${label} cluster error:`, err.message);
    });

    try {
        await connection.asPromise();

        console.log(`   ✅ Connected to ${label} cluster`);
        console.log('   📊 Connection details:');
        console.log('      Database:', connection.name);
        console.log('      Host:', connection.host);
        console.log('      Port:', connection.port || '(srv)');

        const collections = await connection.db.listCollections().toArray();
        if (collections.length === 0) {
            console.log('      Collections: (auto-created on first insert)');
        } else {
            console.log('      Collections:', collections.map(col => col.name).join(', '));
        }

        const collection = buildCollectionHandle(connection);
        await cleanUpTestDoc(collection);

        console.log('   🧪 Running write/read check...');
        const testDocument = {
            test: true,
            context: 'multi-cluster-check',
            cluster: label,
            timestamp: new Date()
        };

        await collection.insertOne(testDocument);
        const fetched = await collection.findOne({ test: true, cluster: label, context: 'multi-cluster-check' });

        if (!fetched) {
            throw new Error('Inserted document not found during read-back');
        }

        console.log('   ✅ Write/read check passed');
        await cleanUpTestDoc(collection);

        await connection.close();
        console.log('   👋 Connection closed');

        return { label, success: true };
    } catch (error) {
        console.error(`   ❌ ${label} cluster connection failed: ${error.message}`);

        if (required) {
            console.error('   ➤ This cluster is required. Please verify the connection string and network rules.');
        }

        if (!legacy) {
            console.error('   Troubleshooting tips:');
            console.error('     • Ensure the password is URL-encoded ("@" → "%40")');
            console.error('     • Confirm your IP address is whitelisted in MongoDB Atlas');
            console.error('     • Verify the database user has read/write permissions');
        }

        try {
            await connection.close();
        } catch (closeErr) {
            console.warn('   ⚠️  Unable to close connection cleanly:', closeErr.message);
        }

        return { label, success: false, error };
    }
}

(async () => {
    let anyFailures = false;
    let requiredFailure = false;

    for (const target of clusterTargets) {
        const result = await testCluster(target);

        if (result.skipped) {
            continue;
        }

        if (!result.success) {
            anyFailures = true;
            if (target.required) {
                requiredFailure = true;
            }
        }
    }

    console.log('\n📄 Test Summary:');
    if (!anyFailures) {
        console.log('✅ All configured clusters responded successfully.');
    } else if (!requiredFailure) {
        console.log('⚠️ Optional cluster(s) failed. Primary cluster is operational, but investigate the warnings above.');
    } else {
        console.log('🚨 Primary cluster unavailable. Fix the errors above before starting the server.');
    }

    process.exit(requiredFailure ? 1 : 0);
})();
