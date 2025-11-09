// Dashboard Handler
let equipmentData = [];
let statsData = {};

const COMPUTER_TYPES = new Set(['desktop', 'laptop', 'computer']);
const STATUS_KEYS = ['working', 'maintenance', 'broken', 'done'];
const TYPE_COLOR_MAP = {
  desktop: '#2563eb',
  laptop: '#38bdf8',
  printer: '#f59e0b',
  computer: '#6366f1'
};

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});

// Load all dashboard data
async function loadDashboard() {
  try {
    // Load statistics and equipment data
    const [stats, equipment] = await Promise.all([
      API.getStats(),
      API.getEquipment()
    ]);

    statsData = stats;
    equipmentData = equipment;

    // Update UI
    updateStats();
    updateEquipmentTypeStats();
    renderCharts();
  } catch (error) {
    console.error('Error loading dashboard:', error);
    document.querySelector('.container').innerHTML += 
      '<div class="alert alert-error">Failed to load dashboard data. Please make sure the server is running.</div>';
  }
}

// Update main statistics
function updateStats() {
  const statusCounts = statsData.byStatus || {};

  document.getElementById('totalEquipment').textContent = statsData.total || 0;
  document.getElementById('workingCount').textContent = statusCounts.working || 0;
  document.getElementById('maintenanceCount').textContent = statusCounts.maintenance || 0;
  document.getElementById('brokenCount').textContent = statusCounts.broken || 0;
}

// Update equipment type statistics
function updateEquipmentTypeStats() {
  const computers = equipmentData.filter(e => COMPUTER_TYPES.has(e.type));
  const printers = equipmentData.filter(e => e.type === 'printer');

  // Computer stats
  document.getElementById('computerCount').textContent = computers.length;
  document.getElementById('computerWorking').textContent = 
    `${computers.filter(c => c.status === 'working').length} Working`;
  document.getElementById('computerMaintenance').textContent = 
    `${computers.filter(c => c.status === 'maintenance').length} Maintenance`;
  document.getElementById('computerBroken').textContent = 
    `${computers.filter(c => c.status === 'broken').length} Broken`;

  // Printer stats
  document.getElementById('printerCount').textContent = printers.length;
  document.getElementById('printerWorking').textContent = 
    `${printers.filter(p => p.status === 'working').length} Working`;
  document.getElementById('printerMaintenance').textContent = 
    `${printers.filter(p => p.status === 'maintenance').length} Maintenance`;
  document.getElementById('printerBroken').textContent = 
    `${printers.filter(p => p.status === 'broken').length} Broken`;
}

// Render all charts
function renderCharts() {
  renderTypeChart();
  renderStatusChart();
  renderBrandChart();
  renderStatusByTypeChart();
}

// Equipment by Type Chart
function renderTypeChart() {
  const ctx = document.getElementById('typeChart');
  const typeCounts = statsData.byType || {};
  const baseTypes = ['desktop', 'laptop', 'printer'];
  if (typeCounts.computer && !baseTypes.includes('computer')) {
    baseTypes.push('computer');
  }

  const labels = baseTypes.map((type) => {
    if (type === 'desktop') return 'Desktops';
    if (type === 'laptop') return 'Laptops';
    if (type === 'printer') return 'Printers';
    return 'Computers (Legacy)';
  });

  const dataPoints = baseTypes.map((type) => typeCounts[type] || 0);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: dataPoints,
        backgroundColor: baseTypes.map((type) => TYPE_COLOR_MAP[type] || '#94a3b8'),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: false
        }
      }
    }
  });
}

// Status Distribution Chart
function renderStatusChart() {
  const ctx = document.getElementById('statusChart');
  const statusCounts = statsData.byStatus || {};

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Working', 'Maintenance', 'Broken', 'Done'],
      datasets: [{
        data: [
          statusCounts.working || 0,
          statusCounts.maintenance || 0,
          statusCounts.broken || 0,
          statusCounts.done || 0
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#2563eb'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Equipment by Brand Chart
function renderBrandChart() {
  const ctx = document.getElementById('brandChart');
  const brandData = statsData.byBrand || {};
  const brands = Object.keys(brandData);
  const counts = brands.map((brand) => brandData[brand]);

  // Generate random colors for each brand
  const colors = brands.map(() => 
    `hsl(${Math.random() * 360}, 70%, 60%)`
  );

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: brands,
      datasets: [{
        label: 'Equipment Count',
        data: counts,
        backgroundColor: colors,
        borderWidth: 1,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Status by Type Chart
function renderStatusByTypeChart() {
  const ctx = document.getElementById('statusByTypeChart');
  const typeBuckets = ['desktop', 'laptop', 'printer'];
  if (equipmentData.some((item) => item.type === 'computer')) {
    typeBuckets.push('computer');
  }

  const datasets = typeBuckets.map((type) => {
    const label = type === 'desktop'
      ? 'Desktops'
      : type === 'laptop'
        ? 'Laptops'
        : type === 'printer'
          ? 'Printers'
          : 'Computers (Legacy)';

    const data = STATUS_KEYS.map((status) =>
      equipmentData.filter((item) => item.type === type && item.status === status).length
    );

    return {
      label,
      data,
      backgroundColor: TYPE_COLOR_MAP[type] || '#94a3b8',
      borderWidth: 1
    };
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Working', 'Maintenance', 'Broken', 'Done'],
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}
