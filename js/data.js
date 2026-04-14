/**
 * DemandFlow - Data Management Module
 * Handles localStorage CRUD operations for demand requests
 */

const DB_KEY = 'demandflow_requests';
const ACTIVITY_KEY = 'demandflow_activity';

// Generate unique ID
function generateId() {
  return 'REQ-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Get all requests
function getRequests() {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading requests:', e);
    return [];
  }
}

// Save all requests
function saveRequests(requests) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Error saving requests:', e);
  }
}

// Add a new request
function addRequest(requestData) {
  const requests = getRequests();
  const newRequest = {
    id: generateId(),
    ...requestData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  requests.unshift(newRequest);
  saveRequests(requests);
  addActivity('created', `New ${requestData.type} request: "${requestData.title}"`);
  return newRequest;
}

// Get a single request by ID
function getRequestById(id) {
  const requests = getRequests();
  return requests.find(r => r.id === id) || null;
}

// Update a request
function updateRequest(id, updates) {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) return null;

  requests[index] = {
    ...requests[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveRequests(requests);
  return requests[index];
}

// Update request status
function updateRequestStatus(id, newStatus) {
  const request = getRequestById(id);
  if (!request) return null;

  const updated = updateRequest(id, { status: newStatus });
  addActivity(newStatus, `"${request.title}" marked as ${newStatus}`);
  return updated;
}

// Delete a request
function deleteRequest(id) {
  const requests = getRequests();
  const request = requests.find(r => r.id === id);
  const filtered = requests.filter(r => r.id !== id);
  saveRequests(filtered);
  if (request) {
    addActivity('rejected', `Deleted request: "${request.title}"`);
  }
  return filtered;
}

// Get requests filtered
function getFilteredRequests(filters = {}) {
  let requests = getRequests();

  if (filters.status && filters.status !== 'all') {
    requests = requests.filter(r => r.status === filters.status);
  }

  if (filters.type && filters.type !== 'all') {
    requests = requests.filter(r => r.type === filters.type);
  }

  if (filters.priority && filters.priority !== 'all') {
    requests = requests.filter(r => r.priority === filters.priority);
  }

  if (filters.search) {
    const term = filters.search.toLowerCase();
    requests = requests.filter(r =>
      r.title.toLowerCase().includes(term) ||
      r.department.toLowerCase().includes(term) ||
      r.requesterName.toLowerCase().includes(term) ||
      r.id.toLowerCase().includes(term)
    );
  }

  return requests;
}

// Get statistics
function getStats() {
  const requests = getRequests();
  const total = requests.length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const inReview = requests.filter(r => r.status === 'in-review').length;

  const byType = {
    product: requests.filter(r => r.type === 'product').length,
    resource: requests.filter(r => r.type === 'resource').length,
    'supply-chain': requests.filter(r => r.type === 'supply-chain').length
  };

  const byPriority = {
    low: requests.filter(r => r.priority === 'low').length,
    medium: requests.filter(r => r.priority === 'medium').length,
    high: requests.filter(r => r.priority === 'high').length,
    critical: requests.filter(r => r.priority === 'critical').length
  };

  const byDepartment = {};
  requests.forEach(r => {
    byDepartment[r.department] = (byDepartment[r.department] || 0) + 1;
  });

  const totalBudget = requests.reduce((sum, r) => sum + (parseFloat(r.budget) || 0), 0);
  const avgQuantity = total > 0 ? Math.round(requests.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0) / total) : 0;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  return {
    total, pending, approved, rejected, inReview,
    byType, byPriority, byDepartment,
    totalBudget, avgQuantity, approvalRate
  };
}

// Activity log
function getActivity() {
  try {
    const data = localStorage.getItem(ACTIVITY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function addActivity(type, message) {
  const activities = getActivity();
  activities.unshift({
    type,
    message,
    timestamp: new Date().toISOString()
  });
  // Keep only last 50 activities
  if (activities.length > 50) activities.length = 50;
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
}

// Seed sample data if empty
function seedSampleData() {
  if (getRequests().length > 0) return;

  const sampleRequests = [
    {
      type: 'product',
      title: 'Q3 Electronics Inventory Restock',
      department: 'Operations',
      priority: 'high',
      quantity: 5000,
      unit: 'units',
      requiredDate: '2026-06-15',
      requesterName: 'Priya Sharma',
      requesterEmail: 'priya@company.com',
      budget: 75000,
      description: 'Restock electronics inventory for Q3 peak season. Includes smartphones, tablets, and accessories. Historical data shows 40% demand increase during this period.',
      notes: 'Coordinate with Supplier A for bulk discount.'
    },
    {
      type: 'resource',
      title: 'Summer Intern Hiring - Engineering',
      department: 'Engineering',
      priority: 'medium',
      quantity: 12,
      unit: 'headcount',
      requiredDate: '2026-05-01',
      requesterName: 'Arjun Patel',
      requesterEmail: 'arjun@company.com',
      budget: 48000,
      description: 'Hire 12 summer interns for the engineering department to support new product development initiatives.',
      notes: 'Focus on ML and data science backgrounds.'
    },
    {
      type: 'supply-chain',
      title: 'Raw Material Shipment - Steel',
      department: 'Procurement',
      priority: 'critical',
      quantity: 200,
      unit: 'tons',
      requiredDate: '2026-04-30',
      requesterName: 'Meera Krishnan',
      requesterEmail: 'meera@company.com',
      budget: 150000,
      description: 'Urgent steel procurement for manufacturing line. Current inventory will run out in 3 weeks. Need to secure shipment from approved vendor.',
      notes: 'Preferred vendor: SteelCo Industries. Alternative: MetalWorks Ltd.'
    },
    {
      type: 'product',
      title: 'Seasonal Fashion Line Stocking',
      department: 'Sales',
      priority: 'medium',
      quantity: 3000,
      unit: 'pieces',
      requiredDate: '2026-07-01',
      requesterName: 'Kavitha Rajan',
      requesterEmail: 'kavitha@company.com',
      budget: 45000,
      description: 'Stock summer fashion collection including new arrivals. Based on last year trends, expect 25% increase in casual wear demand.',
      notes: 'Include size variety based on regional demand data.'
    },
    {
      type: 'resource',
      title: 'Customer Support Team Expansion',
      department: 'Operations',
      priority: 'high',
      quantity: 8,
      unit: 'headcount',
      requiredDate: '2026-05-15',
      requesterName: 'Deepak Nair',
      requesterEmail: 'deepak@company.com',
      budget: 64000,
      description: 'Expand customer support team ahead of product launch. Need 8 additional representatives for phone, chat, and email support channels.',
      notes: 'Bilingual candidates preferred (English + Hindi/Tamil).'
    },
    {
      type: 'supply-chain',
      title: 'Packaging Material Order',
      department: 'Logistics',
      priority: 'low',
      quantity: 50000,
      unit: 'units',
      requiredDate: '2026-08-01',
      requesterName: 'Sunita Verma',
      requesterEmail: 'sunita@company.com',
      budget: 12000,
      description: 'Regular quarterly order for packaging materials including boxes, bubble wrap, and shipping labels.',
      notes: 'Consider switching to eco-friendly packaging options.'
    }
  ];

  const statuses = ['pending', 'approved', 'in-review', 'pending', 'approved', 'pending'];

  sampleRequests.forEach((req, i) => {
    const requests = getRequests();
    const newReq = {
      id: generateId(),
      ...req,
      status: statuses[i],
      createdAt: new Date(Date.now() - (i * 86400000 * 2)).toISOString(),
      updatedAt: new Date(Date.now() - (i * 86400000)).toISOString()
    };
    requests.push(newReq);
    saveRequests(requests);
  });

  addActivity('created', 'Sample data loaded - 6 demo requests created');
}

// Initialize sample data on first load
seedSampleData();
