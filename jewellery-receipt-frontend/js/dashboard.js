/* Jewellery Shop Receipt Management System - Dashboard Logic */

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!Storage.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Load dashboard data
    loadDashboardStats();
    loadRecentReceipts();
    setupEventListeners();
    updateActiveNav();
});

// Load dashboard statistics
function loadDashboardStats() {
    const stats = Storage.getDashboardStats();
    
    document.getElementById('totalReceipts').textContent = stats.totalReceipts;
    document.getElementById('totalAmount').textContent = formatCurrency(stats.totalAmount);
    document.getElementById('totalCustomers').textContent = stats.totalCustomers;
    document.getElementById('outstandingAmount').textContent = formatCurrency(stats.outstandingAmount);
}

// Load recent receipts
function loadRecentReceipts() {
    const receipts = Storage.getReceipts();
    const tbody = document.getElementById('recentReceiptsBody');
    
    // Sort by date descending
    const sortedReceipts = receipts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply filters
    const filteredReceipts = filterReceipts(sortedReceipts);
    
    // Display recent 10 receipts
    const recentReceipts = filteredReceipts.slice(0, 10);
    
    if (recentReceipts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    No receipts found. <a href="create-receipt.html">Create your first receipt</a>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = recentReceipts.map(receipt => `
        <tr>
            <td><strong>${receipt.receiptNumber}</strong></td>
            <td>${formatDate(new Date(receipt.date))}</td>
            <td>${receipt.customerName}</td>
            <td>${receipt.transactionType}</td>
            <td>${formatCurrency(receipt.grandTotal)}</td>
            <td>${formatCurrency(receipt.paidAmount)}</td>
            <td class="${receipt.outstandingBalance > 0 ? 'text-danger' : 'text-success'}">
                ${formatCurrency(receipt.outstandingBalance)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="viewReceipt('${receipt.receiptNumber}')" title="View">
                        👁️
                    </button>
                    <button class="btn btn-sm btn-success" onclick="printReceipt('${receipt.receiptNumber}')" title="Print">
                        🖨️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter receipts based on search and filters
function filterReceipts(receipts) {
    const searchTerm = document.getElementById('searchReceipt').value.toLowerCase();
    const transactionType = document.getElementById('filterTransactionType').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    
    return receipts.filter(receipt => {
        // Search filter
        const matchesSearch = !searchTerm || 
            receipt.receiptNumber.toLowerCase().includes(searchTerm) ||
            receipt.customerName.toLowerCase().includes(searchTerm) ||
            receipt.mobile.includes(searchTerm);
        
        // Transaction type filter
        const matchesType = !transactionType || receipt.transactionType === transactionType;
        
        // Date range filter
        let matchesDateRange = true;
        if (dateFrom) {
            matchesDateRange = matchesDateRange && new Date(receipt.date) >= new Date(dateFrom);
        }
        if (dateTo) {
            matchesDateRange = matchesDateRange && new Date(receipt.date) <= new Date(dateTo);
        }
        
        return matchesSearch && matchesType && matchesDateRange;
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    document.getElementById('searchReceipt').addEventListener('input', loadRecentReceipts);
    
    // Transaction type filter
    document.getElementById('filterTransactionType').addEventListener('change', loadRecentReceipts);
    
    // Date filters
    document.getElementById('filterDateFrom').addEventListener('change', loadRecentReceipts);
    document.getElementById('filterDateTo').addEventListener('change', loadRecentReceipts);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        Storage.logout();
        window.location.href = 'index.html';
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
        });
    }
    
    // Close sidebar when clicking overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            const sidebar = document.querySelector('.sidebar');
            const toggle = document.getElementById('mobileMenuToggle');
            if (sidebar && !sidebar.contains(e.target) && !toggle.contains(e.target) && !sidebarOverlay.contains(e.target)) {
                sidebar.classList.remove('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
            }
        }
    });
}

// View receipt
function viewReceipt(receiptNumber) {
    const receipt = Storage.getReceiptByNumber(receiptNumber);
    if (receipt) {
        // Store receipt in sessionStorage for viewing
        sessionStorage.setItem('viewingReceipt', JSON.stringify(receipt));
        window.location.href = 'create-receipt.html?mode=view';
    }
}

// Print receipt
function printReceipt(receiptNumber) {
    const receipt = Storage.getReceiptByNumber(receiptNumber);
    if (receipt) {
        // Store receipt in sessionStorage for printing
        sessionStorage.setItem('viewingReceipt', JSON.stringify(receipt));
        window.location.href = `create-receipt.html?mode=print&receiptNumber=${receiptNumber}`;
    }
}

// Update active navigation
function updateActiveNav() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amount || 0);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(date));
}

// Show notification
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
