/**
 * DemandFlow - Analytics Module
 * Handles chart rendering and analytics data visualization
 */

document.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('typeChart')) return;

  initAnalytics();
});

function initAnalytics() {
  var stats = getStats();

  // Update stat cards
  var el;
  el = document.getElementById('analyticsTotal');
  if (el) el.textContent = stats.total;
  el = document.getElementById('analyticsAvgQty');
  if (el) el.textContent = stats.avgQuantity.toLocaleString();
  el = document.getElementById('analyticsBudget');
  if (el) el.textContent = formatCurrency(stats.totalBudget);
  el = document.getElementById('analyticsApproval');
  if (el) el.textContent = stats.approvalRate + '%';

  // Update forecast summary
  el = document.getElementById('forecastProduct');
  if (el) el.textContent = stats.byType.product + ' requests';
  el = document.getElementById('forecastResource');
  if (el) el.textContent = stats.byType.resource + ' requests';
  el = document.getElementById('forecastSupply');
  if (el) el.textContent = stats.byType['supply-chain'] + ' requests';

  // Chart.js defaults
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.borderColor = 'rgba(51, 65, 85, 0.5)';
  Chart.defaults.font.family = "'Inter', sans-serif";

  renderTypeChart(stats);
  renderStatusChart(stats);
  renderPriorityChart(stats);
  renderTrendChart();
  renderDepartmentChart(stats);
}

function renderTypeChart(stats) {
  var ctx = document.getElementById('typeChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Product & Inventory', 'Resource & Staffing', 'Supply Chain'],
      datasets: [{
        data: [stats.byType.product, stats.byType.resource, stats.byType['supply-chain']],
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10,
            font: { size: 12 }
          }
        }
      }
    }
  });
}

function renderStatusChart(stats) {
  var ctx = document.getElementById('statusChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'Approved', 'In Review', 'Rejected'],
      datasets: [{
        data: [stats.pending, stats.approved, stats.inReview, stats.rejected],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10,
            font: { size: 12 }
          }
        }
      }
    }
  });
}

function renderPriorityChart(stats) {
  var ctx = document.getElementById('priorityChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Low', 'Medium', 'High', 'Critical'],
      datasets: [{
        label: 'Requests',
        data: [stats.byPriority.low, stats.byPriority.medium, stats.byPriority.high, stats.byPriority.critical],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(252, 165, 165, 0.7)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(252, 165, 165, 1)'
        ],
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, font: { size: 11 } },
          grid: { color: 'rgba(51, 65, 85, 0.3)' }
        },
        x: {
          ticks: { font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

function renderTrendChart() {
  var ctx = document.getElementById('trendChart');
  if (!ctx) return;

  var requests = getRequests();
  var monthlyData = {};
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Get current year
  var currentYear = new Date().getFullYear();

  // Initialize all months
  months.forEach(function(m) { monthlyData[m] = 0; });

  // Count requests per month
  requests.forEach(function(req) {
    var date = new Date(req.createdAt);
    if (date.getFullYear() === currentYear) {
      var month = months[date.getMonth()];
      monthlyData[month]++;
    }
  });

  var data = months.map(function(m) { return monthlyData[m]; });

  // Generate simple forecast (moving average + slight growth)
  var forecast = data.map(function(val, i) {
    if (i < 3) return null;
    var avg = (data[i - 1] + data[i - 2] + data[i - 3]) / 3;
    return Math.round(avg * 1.1 * 10) / 10;
  });

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Actual Requests',
          data: data,
          borderColor: 'rgba(79, 70, 229, 1)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Forecast',
          data: forecast,
          borderColor: 'rgba(14, 165, 233, 0.7)',
          backgroundColor: 'rgba(14, 165, 233, 0.05)',
          fill: true,
          tension: 0.4,
          borderDash: [5, 5],
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            font: { size: 12 }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, font: { size: 11 } },
          grid: { color: 'rgba(51, 65, 85, 0.3)' }
        },
        x: {
          ticks: { font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

function renderDepartmentChart(stats) {
  var ctx = document.getElementById('departmentChart');
  if (!ctx) return;

  var departments = Object.keys(stats.byDepartment);
  var counts = departments.map(function(d) { return stats.byDepartment[d]; });

  var colors = [
    'rgba(79, 70, 229, 0.7)',
    'rgba(14, 165, 233, 0.7)',
    'rgba(245, 158, 11, 0.7)',
    'rgba(16, 185, 129, 0.7)',
    'rgba(239, 68, 68, 0.7)',
    'rgba(99, 102, 241, 0.7)',
    'rgba(168, 85, 247, 0.7)',
    'rgba(236, 72, 153, 0.7)'
  ];

  var borderColors = colors.map(function(c) { return c.replace('0.7', '1'); });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: departments,
      datasets: [{
        label: 'Requests',
        data: counts,
        backgroundColor: colors.slice(0, departments.length),
        borderColor: borderColors.slice(0, departments.length),
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1, font: { size: 11 } },
          grid: { color: 'rgba(51, 65, 85, 0.3)' }
        },
        y: {
          ticks: { font: { size: 12 } },
          grid: { display: false }
        }
      }
    }
  });
}
