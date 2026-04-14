/**
 * DemandFlow - Submit Request Module
 * Handles form submission and validation
 */

document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('requestForm');
  if (!form) return;

  // Set minimum date to today
  var dateInput = document.getElementById('requiredDate');
  if (dateInput) {
    var today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!validateForm()) return;

    var requestData = {
      type: document.querySelector('input[name="requestType"]:checked').value,
      title: document.getElementById('requestTitle').value.trim(),
      department: document.getElementById('department').value,
      priority: document.getElementById('priority').value,
      quantity: parseInt(document.getElementById('quantity').value),
      unit: document.getElementById('unit').value,
      requiredDate: document.getElementById('requiredDate').value,
      requesterName: document.getElementById('requesterName').value.trim(),
      requesterEmail: document.getElementById('requesterEmail').value.trim(),
      budget: parseFloat(document.getElementById('budget').value) || 0,
      description: document.getElementById('description').value.trim(),
      notes: document.getElementById('notes').value.trim()
    };

    var newRequest = addRequest(requestData);

    showToast('Request "' + newRequest.id + '" submitted successfully!', 'success');

    // Reset form after short delay
    setTimeout(function() {
      form.reset();
      // Re-select default radio
      document.getElementById('typeProduct').checked = true;
    }, 500);

    // Redirect to dashboard after 1.5 seconds
    setTimeout(function() {
      window.location.href = 'dashboard.html';
    }, 1500);
  });
});

function validateForm() {
  var title = document.getElementById('requestTitle').value.trim();
  var department = document.getElementById('department').value;
  var priority = document.getElementById('priority').value;
  var quantity = document.getElementById('quantity').value;
  var requiredDate = document.getElementById('requiredDate').value;
  var requesterName = document.getElementById('requesterName').value.trim();
  var description = document.getElementById('description').value.trim();

  if (!title) {
    showToast('Please enter a request title.', 'warning');
    document.getElementById('requestTitle').focus();
    return false;
  }

  if (title.length < 5) {
    showToast('Title must be at least 5 characters long.', 'warning');
    document.getElementById('requestTitle').focus();
    return false;
  }

  if (!department) {
    showToast('Please select a department.', 'warning');
    document.getElementById('department').focus();
    return false;
  }

  if (!priority) {
    showToast('Please select a priority level.', 'warning');
    document.getElementById('priority').focus();
    return false;
  }

  if (!quantity || parseInt(quantity) < 1) {
    showToast('Please enter a valid quantity.', 'warning');
    document.getElementById('quantity').focus();
    return false;
  }

  if (!requiredDate) {
    showToast('Please select a required-by date.', 'warning');
    document.getElementById('requiredDate').focus();
    return false;
  }

  if (!requesterName) {
    showToast('Please enter your name.', 'warning');
    document.getElementById('requesterName').focus();
    return false;
  }

  if (!description) {
    showToast('Please provide a description.', 'warning');
    document.getElementById('description').focus();
    return false;
  }

  if (description.length < 20) {
    showToast('Description must be at least 20 characters long.', 'warning');
    document.getElementById('description').focus();
    return false;
  }

  return true;
}

function resetForm() {
  var form = document.getElementById('requestForm');
  if (form) {
    form.reset();
    document.getElementById('typeProduct').checked = true;
    showToast('Form has been reset.', 'info');
  }
}
