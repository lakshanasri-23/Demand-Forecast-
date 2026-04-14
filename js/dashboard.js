/**
 * DemandFlow - Dashboard Module
 * Handles request listing, filtering, status management, and detail views
 */

var currentFilter = 'all';
var currentSearch = '';

document.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('requestTableBody')) return;

  initDashboard();
});

function initDashboard() {
  updateDashboardStats();
  renderRequests();
  renderActivity();
  initFilters();
  initSearch();
}

// ===== STATS =====
function updateDashboardStats() {
  var stats = getStats();

  var el;
  el = document.getElementById('dashTotal');
  if (el) el.textContent = stats.total;
  el = document.getElementById('dashPending');
  if (el) el.textContent = stats.pending;
  el = document.getElementById('dashApproved');
  if (el) el.textContent = stats.approved;
  el = document.getElementById('dashRejected');
  if (el) el.textContent = stats.rejected;

  el = document.getElementById('typeProduct');
  if (el) el.textContent = stats.byType.product;
  el = document.getElementById('typeResource');
  if (el) el.textContent = stats.byType.resource;
  el = document.getElementById('typeSupplyChain');
  if (el) el.textContent = stats.byType['supply-chain'];
}

// ===== RENDER REQUESTS =====
function renderRequests() {
  var tbody = document.getElementById('requestTableBody');
  var emptyState = document.getElementById('emptyState');
  var tableContainer = document.getElementById('requestTableContainer');
  if (!tbody) return;

  var requests = getFilteredRequests({
    status: currentFilter,
    search: currentSearch
  });

  if (requests.length === 0) {
    if (tableContainer) tableContainer.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (tableContainer) tableContainer.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = requests.map(function(req) {
    return '<tr>' +
      '<td>' +
        '<div style="font-weight: 500;">' + escapeHtml(req.title) + '</div>' +
        '<div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">' +
          escapeHtml(req.id) + ' &middot; ' + escapeHtml(req.department) +
        '</div>' +
      '</td>' +
      '<td><span class="type-badge"><i class="' + getTypeIcon(req.type) + '"></i> ' + getTypeLabel(req.type) + '</span></td>' +
      '<td><span class="priority-badge ' + req.priority + '">' + capitalizeFirst(req.priority) + '</span></td>' +
      '<td><span class="status-badge ' + getStatusClass(req.status) + '">' + capitalizeFirst(req.status) + '</span></td>' +
      '<td style="font-size: 0.85rem; color: var(--text-secondary);">' + formatDate(req.createdAt) + '</td>' +
      '<td>' +
        '<div style="display: flex; gap: 6px;">' +
          '<button class="btn-icon" onclick="viewRequest(\'' + req.id + '\')" title="View details"><i class="fas fa-eye"></i></button>' +
          '<button class="btn-icon" onclick="changeStatus(\'' + req.id + '\')" title="Change status"><i class="fas fa-edit"></i></button>' +
          '<button class="btn-icon" onclick="confirmDelete(\'' + req.id + '\')" title="Delete" style="color: var(--danger);"><i class="fas fa-trash"></i></button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join('');
}

// ===== VIEW REQUEST DETAILS =====
function viewRequest(id) {
  var request = getRequestById(id);
  if (!request) return;

  var modalTitle = document.getElementById('modalTitle');
  var modalBody = document.getElementById('modalBody');
  if (!modalTitle || !modalBody) return;

  modalTitle.textContent = request.title;

  modalBody.innerHTML =
    '<div class="detail-row">' +
      '<span class="detail-label">Request ID</span>' +
      '<span class="detail-value" style="font-family: var(--font-mono); color: var(--primary-light);">' + request.id + '</span>' +
    '</div>' +
    '<div class="detail-row">' +
      '<span class="detail-label">Type</span>' +
      '<span class="detail-value"><span class="type-badge"><i class="' + getTypeIcon(request.type) + '"></i> ' + getTypeLabel(request.type) + '</span></span>' +
    '</div>' +
    '<div class="detail-row">' +
      '<span class="detail-label">Status</span>' +
      '<span class="detail-value"><span class="status-badge ' + getStatusClass(request.status) + '">' + capitalizeFirst(request.status) + '</span></span>' +
    '</div>' +
    '<div class="detail-row">' +
      '<span class="detail-label">Priority</span>' +
      '<span class="detail-value"><span class="priority-badge ' + request.priority + '">' + capitalizeFirst(request.priority) + '</span></span>' +
    '</div>' +
    '<div class="detail-row">' +
      '<span class="detail-label">Department</span>' +
      '<span class="detail-value">' + escapeHtml(request.department) + '</span>' +
    '</div>' +
    '<div class="detail-row">' +
      '<span class="detail-label">Quantity</span>' +
      '<span class="detail-value">' + request.quantity + ' ' + request.unit + '</span>' +
    '</div>' +
    '<div class="detail-row">' +
      '<span class="detail-label">Required By</span>' +
      '<span class="detail-value">' + formatDate(request.requiredDate) + '</span>' +
    '</div>' +
    '<div class="detail-row">' +
      '<span class="detail-label">Budget</span>' +
      '<span class="detail-value">' + formatCurrency(request.budget) + '</span>' +
    '</div>' +
    '<div class="detail-row">' +
      '<span class="detail-label">Requester</span>' +
      '<span class="detail-value">' + escapeHtml(request.requesterName) + (request.requesterEmail ? ' (' + escapeHtml(request.requesterEmail) + ')' : '') + '</span>' +
    '</div>' +
    '<div class="detail-row">' +
      '<span class="detail-label">Description</span>' +
      '<span class="detail-value">' + escapeHtml(request.description) + '</span>' +
    '</div>' +
    (request.notes ? '<div class="detail-row"><span class="detail-label">Notes</span><span class="detail-value">' + escapeHtml(request.notes) + '</span></div>' : '') +
    '<div class="detail-row">' +
      '<span class="detail-label">Created</span>' +
      '<span class="detail-value">' + formatDate(request.createdAt) + '</span>' +
    '</div>' +
    '<div class="detail-row">' +
      '<span class="detail-label">Last Updated</span>' +
      '<span class="detail-value">' + formatDate(request.updatedAt) + '</span>' +
    '</div>';

  // Update modal footer with status change buttons
  var modalFooter = document.getElementById('modalFooter');
  if (modalFooter) {
    modalFooter.innerHTML =
      '<button class="btn btn-success btn-sm" onclick="quickStatus(\'' + request.id + '\', \'approved\')"><i class="fas fa-check"></i> Approve</button>' +
      '<button class="btn btn-sm" style="background: var(--info); color: white;" onclick="quickStatus(\'' + request.id + '\', \'in-review\')"><i class="fas fa-search"></i> In Review</button>' +
      '<button class="btn btn-danger btn-sm" onclick="quickStatus(\'' + request.id + '\', \'rejected\')"><i class="fas fa-times"></i> Reject</button>' +
      '<button class="btn btn-secondary btn-sm" onclick="closeModal(\'viewModal\')">Close</button>';
  }

  openModal('viewModal');
}

function quickStatus(id, status) {
  updateRequestStatus(id, status);
  closeModal('viewModal');
  showToast('Request status updated to ' + capitalizeFirst(status) + '.', 'success');
  initDashboard();
}

// ===== CHANGE STATUS =====
function changeStatus(id) {
  var request = getRequestById(id);
  if (!request) return;

  var statuses = ['pending', 'in-review', 'approved', 'rejected'];
  var currentIndex = statuses.indexOf(request.status);
  var nextStatus = statuses[(currentIndex + 1) % statuses.length];

  updateRequestStatus(id, nextStatus);
  showToast('Status changed to ' + capitalizeFirst(nextStatus) + '.', 'success');
  initDashboard();
}

// ===== DELETE REQUEST =====
function confirmDelete(id) {
  var request = getRequestById(id);
  if (!request) return;

  if (confirm('Are you sure you want to delete "' + request.title + '"? This action cannot be undone.')) {
    deleteRequest(id);
    showToast('Request deleted successfully.', 'success');
    initDashboard();
  }
}

// ===== FILTERS =====
function initFilters() {
  var chips = document.querySelectorAll('.filter-chip');
  chips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      chips.forEach(function(c) { c.classList.remove('active'); });
      this.classList.add('active');
      currentFilter = this.getAttribute('data-filter');
      renderRequests();
    });
  });
}

// ===== SEARCH =====
function initSearch() {
  var searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  var debounceTimer;
  searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    var value = this.value;
    debounceTimer = setTimeout(function() {
      currentSearch = value;
      renderRequests();
    }, 300);
  });
}

// ===== ACTIVITY FEED =====
function renderActivity() {
  var activityList = document.getElementById('activityList');
  if (!activityList) return;

  var activities = getActivity();

  if (activities.length === 0) {
    activityList.innerHTML =
      '<div class="empty-state" style="padding: 20px 0;">' +
        '<i class="fas fa-stream" style="font-size: 1.5rem;"></i>' +
        '<p style="font-size: 0.85rem;">No activity yet</p>' +
      '</div>';
    return;
  }

  var activityIcons = {
    'created': 'created',
    'approved': 'approved',
    'rejected': 'rejected',
    'in-review': 'updated',
    'pending': 'updated'
  };

  var activityFaIcons = {
    'created': 'fas fa-plus',
    'approved': 'fas fa-check',
    'rejected': 'fas fa-times',
    'in-review': 'fas fa-search',
    'pending': 'fas fa-clock'
  };

  activityList.innerHTML = activities.slice(0, 8).map(function(activity) {
    var iconType = activityIcons[activity.type] || 'updated';
    var faIcon = activityFaIcons[activity.type] || 'fas fa-info';

    return '<div class="activity-item">' +
      '<div class="activity-icon ' + iconType + '"><i class="' + faIcon + '"></i></div>' +
      '<div class="activity-content">' +
        '<p>' + escapeHtml(activity.message) + '</p>' +
        '<span class="time">' + timeAgo(activity.timestamp) + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ===== HELPERS =====
function escapeHtml(text) {
  if (!text) return '';
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
