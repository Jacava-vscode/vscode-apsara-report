'use strict';

(function () {
  const statusConfig = {
    healthy: { className: 'success', labelKey: 'storage.status.healthy', fallback: 'Healthy', icon: '✅' },
    warning: { className: 'warning', labelKey: 'storage.status.warning', fallback: 'Warning', icon: '⚠️' },
    critical: { className: 'danger', labelKey: 'storage.status.critical', fallback: 'Critical', icon: '🔴' },
    full: { className: 'danger', labelKey: 'storage.status.full', fallback: 'Full', icon: '🚫' },
    default: { className: 'secondary', labelKey: 'storage.status.unknown', fallback: 'Unknown', icon: '⚪' }
  };

  const storageSection = {
    container: () => document.getElementById('storageInfo'),
    refreshButton: () => document.getElementById('refreshStorageBtn')
  };

  const translate = (key, options = {}) => {
    if (window.I18n) {
      return I18n.t(key, options);
    }

    if (typeof options.fallback === 'string') {
      return options.fallback;
    }

    return key;
  };

  let lastStorageData = null;

  const formatNumber = (value, digits = 2) => {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      return (0).toFixed(digits);
    }
    return numberValue.toFixed(digits);
  };

  const getStatusConfig = (status) => statusConfig[status] || statusConfig.default;

  const renderSummaryCards = (data) => {
    const overall = getStatusConfig(data.overallStatus);
    const overallPercent = formatNumber(data.overallPercent, 1);
    const totalUsed = formatNumber(data.totalUsed, 2);
    const totalStorage = formatNumber(data.totalStorage, 0);
    const totalAvailable = formatNumber(data.totalAvailable, 0);
    const activeClusterCode = (data.activeCluster || 'primary').toUpperCase();

    return `
      <div class="storage-summary">
        <div class="stat-card ${overall.className}">
          <div class="stat-label">${translate('storage.summary.overallUsage', { fallback: 'Overall Usage' })}</div>
          <div class="stat-value">${overallPercent}%</div>
          <div class="stat-label">${translate('storage.summary.totalUsage', {
            fallback: `${totalUsed} MB / ${totalStorage} MB`,
            params: { used: totalUsed, total: totalStorage }
          })}</div>
        </div>
        <div class="stat-card secondary">
          <div class="stat-label">${translate('storage.summary.activeCluster', { fallback: 'Active Cluster' })}</div>
          <div class="stat-value" style="font-size: 1.75rem;">${translate('storage.summary.activeClusterValue', {
            fallback: activeClusterCode,
            params: { cluster: activeClusterCode }
          })}</div>
          <div class="stat-label">${translate('storage.summary.activeClusterCaption', { fallback: 'Currently Writing' })}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">${translate('storage.summary.freeCapacity', { fallback: 'Free Capacity' })}</div>
          <div class="stat-value">${translate('storage.summary.freeCapacityValue', {
            fallback: `${totalAvailable} MB`,
            params: { amount: totalAvailable }
          })}</div>
          <div class="stat-label">${translate('storage.summary.freeCapacityCaption', { fallback: 'Across All Clusters' })}</div>
        </div>
      </div>
    `;
  };

  const renderClusterCard = (name, stats, activeCluster) => {
    const statusDetails = getStatusConfig(stats.status);
    const used = formatNumber(stats.storageMB, 2);
    const available = formatNumber(stats.available, 2);
    const percentUsed = formatNumber(stats.percentUsed, 1);
    const documents = Number.isFinite(Number(stats.documents)) ? stats.documents : 0;
    const isActive = name === activeCluster;
    const statusLabel = translate(statusDetails.labelKey, { fallback: statusDetails.fallback });
    const clusterTitle = translate('storage.clusterTitle', {
      fallback: `${name.toUpperCase()} Cluster`,
      params: { name: name.toUpperCase() }
    });
    const activeBadge = translate('storage.badge.active', { fallback: 'Active' });

    return `
      <div class="cluster-card ${statusDetails.className}">
        <div class="cluster-header">
          <div>
            <div class="cluster-title">
              <span class="cluster-icon">${statusDetails.icon}</span>
              ${clusterTitle}
            </div>
            ${isActive ? `<span class="badge badge-success cluster-active">${activeBadge}</span>` : ''}
          </div>
          <span class="badge badge-${statusDetails.className}">${statusLabel}</span>
        </div>
        <div class="cluster-progress">
          <div class="cluster-progress-fill ${statusDetails.className}" style="width: ${percentUsed}%"></div>
        </div>
        <div class="storage-metrics">
          <div>
            <span class="metric-label">${translate('storage.metrics.used', { fallback: 'Used' })}</span>
            ${used} MB
          </div>
          <div>
            <span class="metric-label">${translate('storage.metrics.available', { fallback: 'Available' })}</span>
            ${available} MB
          </div>
          <div>
            <span class="metric-label">${translate('storage.metrics.percent', { fallback: 'Percent' })}</span>
            ${percentUsed}%
          </div>
          <div>
            <span class="metric-label">${translate('storage.metrics.documents', { fallback: 'Documents' })}</span>
            ${documents}
          </div>
        </div>
      </div>
    `;
  };

  const displayStorageInfo = (data) => {
    const container = storageSection.container();
    if (!container) {
      return;
    }

    lastStorageData = data;

    if (!data || !data.clusters || Object.keys(data.clusters).length === 0) {
      container.innerHTML = `<div class="alert alert-info">${translate('storage.noData', { fallback: 'No storage data available yet.' })}</div>`;
      return;
    }

    const summaryHtml = renderSummaryCards(data);
    const clusterCards = Object.entries(data.clusters)
      .filter((entry) => Boolean(entry[1]))
      .map(([name, stats]) => renderClusterCard(name, stats, data.activeCluster))
      .join('');

    container.innerHTML = summaryHtml + `<div class="cluster-grid">${clusterCards}</div>`;
  };

  const loadStorageInfo = async () => {
    const container = storageSection.container();
    if (!container) {
      return;
    }

    try {
      const data = await API.storage.getReport();
      displayStorageInfo(data);
    } catch (error) {
      console.error('Error loading storage info:', error);
      container.innerHTML = `<p class="alert alert-error">${translate('storage.error.load', { fallback: 'Failed to load storage information.' })}</p>`;
    }
  };

  const refreshStorage = async (event) => {
    const button = event?.currentTarget;
    if (button) {
      button.disabled = true;
      button.textContent = translate('storage.button.refreshing', { fallback: '🔄 Refreshing...' });
    }

    try {
  await API.storage.refresh();
      await loadStorageInfo();
      if (button) {
        button.textContent = translate('storage.button.refreshed', { fallback: '✅ Refreshed' });
        setTimeout(() => {
          button.textContent = translate('storage.button.refresh', { fallback: '🔄 Refresh' });
          button.disabled = false;
        }, 1800);
      }
    } catch (error) {
      console.error('Error refreshing storage info:', error);
      if (button) {
        button.textContent = translate('storage.button.error', { fallback: '❌ Error' });
        setTimeout(() => {
          button.textContent = translate('storage.button.refresh', { fallback: '🔄 Refresh' });
          button.disabled = false;
        }, 1800);
      }
      const container = storageSection.container();
      if (container) {
        container.innerHTML = `<p class="alert alert-error">${translate('storage.error.refresh', { fallback: 'Failed to refresh storage information.' })}</p>`;
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    loadStorageInfo();

    const refreshButton = storageSection.refreshButton();
    if (refreshButton) {
      refreshButton.textContent = translate('storage.button.refresh', { fallback: '🔄 Refresh' });
      refreshButton.addEventListener('click', refreshStorage);
    }

    window.setInterval(loadStorageInfo, 30000);

    if (window.I18n) {
      I18n.onChange(() => {
        if (lastStorageData) {
          displayStorageInfo(lastStorageData);
        }
        const button = storageSection.refreshButton();
        if (button && !button.disabled) {
          button.textContent = translate('storage.button.refresh', { fallback: '🔄 Refresh' });
        }
      });
    }
  });

  window.StorageMonitor = {
    load: loadStorageInfo,
    refresh: refreshStorage
  };
})();
