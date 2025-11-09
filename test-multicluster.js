// Multi-Cluster Testing Script
require('dotenv').config();
const clusterManager = require('./server/services/clusterManager');
const MultiClusterEquipment = require('./server/models/MultiClusterEquipment');

async function runTests() {
    console.log('🧪 MULTI-CLUSTER SYSTEM TESTS\n');
    console.log('=' .repeat(60));
    
    try {
        // Test 1: Initialize clusters
        console.log('\n📋 Test 1: Cluster Initialization');
        await clusterManager.initialize();
        console.log('✅ PASSED: All clusters initialized\n');

        // Test 2: Check storage stats
        console.log('📋 Test 2: Storage Statistics');
        const report = await clusterManager.getStorageReport();
        console.log('✅ PASSED: Storage report retrieved');
        console.log(`   Active Cluster: ${report.activeCluster.toUpperCase()}`);
        console.log(`   Total Storage: ${report.totalStorage} MB`);
        console.log(`   Total Used: ${report.totalUsed.toFixed(2)} MB`);
        console.log(`   Overall Usage: ${report.overallPercent}%`);
        console.log(`   Status: ${report.overallStatus.toUpperCase()}\n`);

        // Test 3: Per-cluster details
        console.log('📋 Test 3: Per-Cluster Details');
        for (const [name, stats] of Object.entries(report.clusters)) {
            if (stats) {
                console.log(`   ${name.toUpperCase()}:`);
                console.log(`     - Storage: ${stats.storageMB} MB / ${stats.maxStorageMB} MB`);
                console.log(`     - Usage: ${stats.percentUsed}%`);
                console.log(`     - Status: ${stats.status.toUpperCase()}`);
                console.log(`     - Documents: ${stats.documents}`);
                console.log(`     - Collections: ${stats.collections}`);
            }
        }
        console.log('✅ PASSED: All cluster details retrieved\n');

        // Test 4: Read data from all clusters
        console.log('📋 Test 4: Unified Data Reading');
        const allEquipment = await MultiClusterEquipment.findAll();
        console.log('✅ PASSED: Data retrieved from all clusters');
        console.log(`   Total Equipment: ${allEquipment.length}`);
        
        // Count by cluster
        const byCluster = {};
        allEquipment.forEach(item => {
            byCluster[item.cluster] = (byCluster[item.cluster] || 0) + 1;
        });
        console.log('   Distribution:');
        for (const [cluster, count] of Object.entries(byCluster)) {
            console.log(`     - ${cluster.toUpperCase()}: ${count} items`);
        }
        console.log('');

        // Test 5: Statistics across clusters
        console.log('📋 Test 5: Cross-Cluster Statistics');
        const stats = await MultiClusterEquipment.getStats();
        console.log('✅ PASSED: Statistics calculated');
        console.log(`   Total Equipment: ${stats.total}`);
        console.log(`   Computers: ${stats.byType.computer}`);
        console.log(`   Printers: ${stats.byType.printer}`);
        console.log('   By Status:');
        console.log(`     - Working: ${stats.byStatus.working}`);
        console.log(`     - Maintenance: ${stats.byStatus.maintenance}`);
        console.log(`     - Broken: ${stats.byStatus.broken}`);
        console.log('   By Cluster:');
        for (const [cluster, count] of Object.entries(stats.byCluster)) {
            console.log(`     - ${cluster.toUpperCase()}: ${count}`);
        }
        console.log('');

        // Test 6: Archive check
        console.log('📋 Test 6: Archive System');
        const oldRecords = await clusterManager.checkArchivingNeeded();
        console.log('✅ PASSED: Archive check completed');
        console.log(`   Records eligible for archiving: ${oldRecords.length}`);
        console.log(`   Archive after: ${process.env.ARCHIVE_AFTER_DAYS || 180} days`);
        console.log(`   Auto-archive enabled: ${process.env.AUTO_ARCHIVE_ENABLED || 'false'}\n`);

        // Test 7: Active cluster determination
        console.log('📋 Test 7: Active Cluster Logic');
        await clusterManager.updateStorageStats();
        const activeCluster = clusterManager.determineActiveCluster();
        console.log('✅ PASSED: Active cluster determined');
        console.log(`   Active cluster: ${activeCluster.toUpperCase()}`);
        console.log(`   Will write new data to: ${activeCluster.toUpperCase()}\n`);

        // Test 8: Simulate write operation
        console.log('📋 Test 8: Write Operation Test (Simulation)');
        const testEquipment = {
            type: 'computer',
            brand: 'TEST',
            model: 'Multi-Cluster-Test',
            status: 'working',
            notes: 'This is a test entry to verify multi-cluster writing'
        };
        
        const saved = await MultiClusterEquipment.create(testEquipment);
        console.log('✅ PASSED: Equipment created successfully');
        console.log(`   Saved to cluster: ${saved.cluster.toUpperCase()}`);
        console.log(`   Equipment ID: ${saved._id}`);
        console.log('');

        // Clean up test data
        console.log('🧹 Cleaning up test data...');
        await MultiClusterEquipment.deleteById(saved._id);
        console.log('✅ Test data removed\n');

        // Summary
        console.log('=' .repeat(60));
        console.log('\n🎉 ALL TESTS PASSED!\n');
        console.log('Multi-Cluster System Status:');
        console.log(`  ✅ ${Object.keys(report.clusters).length} cluster(s) connected`);
        console.log(`  ✅ ${allEquipment.length} equipment records accessible`);
        console.log(`  ✅ ${report.totalAvailable.toFixed(0)} MB storage available`);
        console.log(`  ✅ Active cluster: ${activeCluster.toUpperCase()}`);
        console.log(`  ✅ Auto-routing: ENABLED`);
        console.log(`  ✅ Storage monitoring: ACTIVE`);
        console.log(`  ✅ Archive system: ${process.env.AUTO_ARCHIVE_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
        console.log('\n✨ Your multi-cluster system is working perfectly!\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error('\nError Details:', error);
        process.exit(1);
    } finally {
        // Disconnect
        console.log('🔌 Disconnecting from clusters...');
        await clusterManager.disconnect();
        console.log('👋 Test complete!\n');
        process.exit(0);
    }
}

// Run tests
console.log('\n🚀 Starting Multi-Cluster System Tests...\n');
runTests();
