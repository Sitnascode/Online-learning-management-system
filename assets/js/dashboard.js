/**
 * Dashboard JavaScript - Production Ready
 * Features: Responsive navigation, notifications, real-time updates
 */

class Dashboard {
  constructor() {
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupNotifications();
    this.setupSearch();
    this.setupProgressBars();
    this.setupTooltips();
    this.setupModals();
  }

  /**
   * Setup responsive navigation
   */
  setupNavigation() {
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (sidebarToggle && sidebar && overlay) {
      // Mobile sidebar toggle
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("hidden");
        document.body.classList.toggle("sidebar-open");
      });

      // Close sidebar when clicking overlay
      overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
        document.body.classList.remove("sidebar-open");
      });

      // Close sidebar on escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidebar.classList.contains("open")) {
          sidebar.classList.remove("open");
          overlay.classList.add("hidden");
          document.body.classList.remove("sidebar-open");
        }
      });
    }

    // Active navigation highlighting
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".sidebar-nav-item");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.includes(currentPage)) {
        link.classList.add("active");
      }
    });
  }

  /**
   * Setup notification system
   */
  setupNotifications() {
    this.checkForNotifications();

    // Check for new notifications every 30 seconds
    setInterval(() => {
      this.checkForNotifications();
    }, 30000);
  }

  async checkForNotifications() {
    try {
      const response = await fetch("api/notifications.php");
      const data = await response.json();

      if (data.success && data.notifications) {
        this.updateNotificationBadge(data.unread_count);
        this.displayNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  updateNotificationBadge(count) {
    const badge = document.querySelector(".notification-badge");
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? "99+" : count;
        badge.style.display = "block";
      } else {
        badge.style.display = "none";
      }
    }
  }

  displayNotifications(notifications) {
    const container = document.getElementById("notifications-container");
    if (!container) return;

    container.innerHTML = "";

    if (notifications.length === 0) {
      container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="bell" class="w-12 h-12 text-secondary-300 mx-auto mb-4"></i>
                    <p class="text-secondary-500">No notifications</p>
                </div>
            `;
      return;
    }

    notifications.forEach((notification) => {
      const notificationEl = this.createNotificationElement(notification);
      container.appendChild(notificationEl);
    });

    // Reinitialize Lucide icons
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  createNotificationElement(notification) {
    const div = document.createElement("div");
    div.className = `notification-item ${notification.is_read ? "" : "unread"}`;

    const iconMap = {
      info: "info",
      success: "check-circle",
      warning: "alert-triangle",
      error: "alert-circle",
    };

    div.innerHTML = `
            <div class="flex items-start gap-3 p-4 hover:bg-secondary-50 cursor-pointer">
                <div class="w-8 h-8 ${this.getNotificationColor(notification.type)} rounded-full flex items-center justify-center flex-shrink-0">
                    <i data-lucide="${iconMap[notification.type] || "bell"}" class="w-4 h-4 text-white"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-secondary-800">${notification.title}</p>
                    <p class="text-sm text-secondary-600 mt-1">${notification.message}</p>
                    <p class="text-xs text-secondary-400 mt-2">${this.formatDate(notification.created_at)}</p>
                </div>
                ${!notification.is_read ? '<div class="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>' : ""}
            </div>
        `;

    div.addEventListener("click", () => {
      this.markNotificationAsRead(notification.id);
      if (notification.action_url) {
        window.location.href = notification.action_url;
      }
    });

    return div;
  }

  getNotificationColor(type) {
    const colors = {
      info: "bg-primary-500",
      success: "bg-success-500",
      warning: "bg-warning-500",
      error: "bg-error-500",
    };
    return colors[type] || "bg-secondary-500";
  }

  async markNotificationAsRead(notificationId) {
    try {
      await fetch("api/notifications.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "mark_read",
          notification_id: notificationId,
        }),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  /**
   * Setup search functionality
   */
  setupSearch() {
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length < 2) {
        this.hideSearchResults();
        return;
      }

      searchTimeout = setTimeout(() => {
        this.performSearch(query);
      }, 300);
    });

    // Hide search results when clicking outside
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target)) {
        this.hideSearchResults();
      }
    });
  }

  async performSearch(query) {
    try {
      const response = await fetch(
        `api/search.php?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();

      if (data.success) {
        this.displaySearchResults(data.results);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  }

  displaySearchResults(results) {
    let container = document.getElementById("search-results");

    if (!container) {
      container = document.createElement("div");
      container.id = "search-results";
      container.className =
        "absolute top-full left-0 right-0 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 mt-1";

      const searchInput = document.querySelector(
        'input[placeholder*="Search"]',
      );
      searchInput.parentElement.appendChild(container);
    }

    if (results.length === 0) {
      container.innerHTML = `
                <div class="p-4 text-center text-secondary-500">
                    No results found
                </div>
            `;
    } else {
      container.innerHTML = results
        .map(
          (result) => `
                <a href="${result.url}" class="block p-3 hover:bg-secondary-50 border-b border-secondary-100 last:border-b-0">
                    <div class="font-medium text-secondary-800">${result.title}</div>
                    <div class="text-sm text-secondary-600">${result.description}</div>
                    <div class="text-xs text-secondary-400 mt-1">${result.type}</div>
                </a>
            `,
        )
        .join("");
    }

    container.style.display = "block";
  }

  hideSearchResults() {
    const container = document.getElementById("search-results");
    if (container) {
      container.style.display = "none";
    }
  }

  /**
   * Setup animated progress bars
   */
  setupProgressBars() {
    const progressBars = document.querySelectorAll(".progress-bar");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const progressBar = entry.target;
          const targetWidth =
            progressBar.getAttribute("data-progress") ||
            progressBar.style.width;

          progressBar.style.width = "0%";
          setTimeout(() => {
            progressBar.style.transition = "width 1s ease-in-out";
            progressBar.style.width = targetWidth;
          }, 100);

          observer.unobserve(progressBar);
        }
      });
    });

    progressBars.forEach((bar) => observer.observe(bar));
  }

  /**
   * Setup tooltips
   */
  setupTooltips() {
    const tooltipElements = document.querySelectorAll("[data-tooltip]");

    tooltipElements.forEach((element) => {
      element.addEventListener("mouseenter", (e) => {
        this.showTooltip(e.target, e.target.getAttribute("data-tooltip"));
      });

      element.addEventListener("mouseleave", () => {
        this.hideTooltip();
      });
    });
  }

  showTooltip(element, text) {
    const tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.className =
      "absolute bg-secondary-800 text-white text-sm px-2 py-1 rounded shadow-lg z-50";
    tooltip.textContent = text;

    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.left =
      rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px";
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + "px";
  }

  hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
      tooltip.remove();
    }
  }

  /**
   * Setup modal functionality
   */
  setupModals() {
    // Modal triggers
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-modal]")) {
        e.preventDefault();
        const modalId = e.target.getAttribute("data-modal");
        this.openModal(modalId);
      }

      if (
        e.target.matches(".modal-close") ||
        e.target.closest(".modal-close")
      ) {
        this.closeModal();
      }

      if (e.target.matches(".modal-overlay")) {
        this.closeModal();
      }
    });

    // Close modal on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  closeModal() {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      modal.classList.add("hidden");
    });
    document.body.style.overflow = "";
  }

  /**
   * Utility functions
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  }

  /**
   * Show toast notification
   */
  showToast(message, type = "info", duration = 5000) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
            <div class="flex items-center gap-3">
                <i data-lucide="${this.getToastIcon(type)}" class="w-5 h-5"></i>
                <span>${message}</span>
                <button class="ml-auto" onclick="this.parentElement.parentElement.remove()">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        `;

    // Add toast styles if not already present
    if (!document.getElementById("toast-styles")) {
      const styles = document.createElement("style");
      styles.id = "toast-styles";
      styles.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 16px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    animation: slideIn 0.3s ease-out;
                }
                .toast-info { background: #3b82f6; color: white; }
                .toast-success { background: #10b981; color: white; }
                .toast-warning { background: #f59e0b; color: white; }
                .toast-error { background: #ef4444; color: white; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(toast);

    // Initialize Lucide icons for the toast
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    // Auto remove after duration
    setTimeout(() => {
      toast.style.animation = "slideIn 0.3s ease-out reverse";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  getToastIcon(type) {
    const icons = {
      info: "info",
      success: "check-circle",
      warning: "alert-triangle",
      error: "alert-circle",
    };
    return icons[type] || "info";
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new Dashboard();
});

// Export for use in other scripts
window.Dashboard = Dashboard;
