/**
 * DemandFlow - Main Application Module
 * Handles shared functionality: navigation, toasts, animations, stats
 */

// ===== NAVIGATION =====
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', function() {
      navLinks.classList.toggle('open');
      const icon = this.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    });
  }

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Fade-in animations on scroll
  const fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length > 0) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    fadeElements.forEach(function(el) {
      observer.observe(el);
    });
  }

  // Update hero stats if on home page
  updateHeroStats();
});

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type) {
  type = type || 'info';
  var container = document.getElementById('toastContainer');
  if (!container) return;

  var icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };

  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML =
    '<i class="toast-icon ' + (icons[type] || icons.info) + '"></i>' +
    '<span class="toast-message">' + message + '</span>' +
    '<button class="toast-close" onclick="this.parentElement.remove()">' +
      '<i class="fas fa-times"></i>' +
    '</button>';

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(function() {
    if (toast.parentElement) {
      toast.classList.add('removing');
      setTimeout(function() {
        if (toast.parentElement) toast.remove();
      }, 300);
    }
  }, 4000);
}

// ===== MODAL HELPERS =====
function openModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Close modal on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var modals = document.querySelectorAll('.modal-overlay.active');
    modals.forEach(function(modal) {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
});

// ===== HERO STATS (Home Page) =====
function updateHeroStats() {
  var stats = getStats();

  // Hero counter stats
  animateCounter('statRequests', stats.total);
  animateCounter('statApproved', stats.approved);

  // Hero card stats
  animateCounter('cardProducts', stats.byType.product);
  animateCounter('cardResources', stats.byType.resource);
  animateCounter('cardSupplyChain', stats.byType['supply-chain']);
}

function animateCounter(elementId, target) {
  var el = document.getElementById(elementId);
  if (!el) return;

  var current = 0;
  var duration = 1500;
  var stepTime = 30;
  var steps = duration / stepTime;
  var increment = target / steps;

  function step() {
    current += increment;
    if (current >= target) {
      el.textContent = target;
      return;
    }
    el.textContent = Math.round(current);
    setTimeout(step, stepTime);
  }

  if (target > 0) {
    step();
  } else {
    el.textContent = target;
  }
}

// ===== UTILITY FUNCTIONS =====
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  var date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return 'N/A';
  return '$' + Number(amount).toLocaleString();
}

function timeAgo(dateString) {
  var now = new Date();
  var date = new Date(dateString);
  var seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  var minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  var hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  var days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  return formatDate(dateString);
}

function getTypeIcon(type) {
  var icons = {
    'product': 'fas fa-boxes-stacked',
    'resource': 'fas fa-users',
    'supply-chain': 'fas fa-truck'
  };
  return icons[type] || 'fas fa-file';
}

function getTypeLabel(type) {
  var labels = {
    'product': 'Product & Inventory',
    'resource': 'Resource & Staffing',
    'supply-chain': 'Supply Chain'
  };
  return labels[type] || type;
}

function getStatusClass(status) {
  return status || 'pending';
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
}
