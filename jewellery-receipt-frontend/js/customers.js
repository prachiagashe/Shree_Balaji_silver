/* Jewellery Shop Receipt Management System - Customer Management Logic */

let editingCustomerMobile = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!Storage.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    loadCustomers();
    setupEventListeners();
    updateActiveNav();
});

// Load customers with totals
function loadCustomers() {
    const customers = Storage.getCustomers();
    const customerTotals = Storage.getCustomerTotals();
    const tbody = document.getElementById('customersBody');
    
    // Merge customer data with totals
    const customersWithTotals = customers.map(customer => {
        const totals = customerTotals.find(t => t.mobile === customer.mobile) || {
            totalReceipts: 0,
            totalAmount: 0,
            totalPaid: 0,
            totalOutstanding: 0
        };
        
        return {
            ...customer,
            ...totals
        };
    });
    
    // Apply search filter
    const searchTerm = document.getElementById('searchCustomer').value.toLowerCase();
    const filteredCustomers = customersWithTotals.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.mobile.includes(searchTerm)
    );
    
    if (filteredCustomers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    No customers found.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredCustomers.map(customer => `
        <tr>
            <td><strong>${customer.name}</strong></td>
            <td>${customer.mobile}</td>
            <td>${customer.address || 'N/A'}</td>
            <td>${customer.totalReceipts}</td>
            <td>${formatCurrency(customer.totalAmount)}</td>
            <td>${formatCurrency(customer.totalPaid)}</td>
            <td class="${customer.totalOutstanding > 0 ? 'text-danger' : 'text-success'}">
                ${formatCurrency(customer.totalOutstanding)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="viewCustomerDetails('${customer.mobile}')" title="View Details">
                        👁️
                    </button>
                    <button class="btn btn-sm btn-success" onclick="editCustomer('${customer.mobile}')" title="Edit">
                        ✏️
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${customer.mobile}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    document.getElementById('searchCustomer').addEventListener('input', loadCustomers);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            Storage.clearUserSession();
            window.location.href = 'index.html';
        }
    });
}

// Show add customer modal
function showAddCustomerModal() {
    editingCustomerMobile = null;
    document.getElementById('modalTitle').textContent = 'Add Customer';
    document.getElementById('customerForm').reset();
    document.getElementById('customerModal').classList.remove('hidden');
}

// Edit customer
function editCustomer(mobile) {
    const customer = Storage.getCustomerByMobile(mobile);
    if (customer) {
        editingCustomerMobile = mobile;
        document.getElementById('modalTitle').textContent = 'Edit Customer';
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerMobile').value = customer.mobile;
        document.getElementById('customerMobile').readOnly = true;
        document.getElementById('customerAddress').value = customer.address || '';
        document.getElementById('customerEmail').value = customer.email || '';
        document.getElementById('customerModal').classList.remove('hidden');
    }
}

// Close customer modal
function closeCustomerModal() {
    document.getElementById('customerModal').classList.add('hidden');
    document.getElementById('customerForm').reset();
    document.getElementById('customerMobile').readOnly = false;
    editingCustomerMobile = null;
}

// Save customer
function saveCustomer() {
    const name = document.getElementById('customerName').value.trim();
    const mobile = document.getElementById('customerMobile').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    
    // Validation
    if (!name || !mobile) {
        showNotification('Please fill in name and mobile number', 'error');
        return;
    }
    
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Check if mobile already exists (for new customers)
    if (!editingCustomerMobile) {
        const existingCustomer = Storage.getCustomerByMobile(mobile);
        if (existingCustomer) {
            showNotification('A customer with this mobile number already exists', 'error');
            return;
        }
    }
    
    const customer = {
        name: name,
        mobile: mobile,
        address: address,
        email: email,
        createdAt: editingCustomerMobile ? 
            Storage.getCustomerByMobile(mobile)?.createdAt : 
            new Date().toISOString().split('T')[0]
    };
    
    if (Storage.saveCustomer(customer)) {
        showNotification('Customer saved successfully', 'success');
        closeCustomerModal();
        loadCustomers();
    } else {
        showNotification('Error saving customer', 'error');
    }
}

// Delete customer
function deleteCustomer(mobile) {
    const customer = Storage.getCustomerByMobile(mobile);
    if (!customer) {
        showNotification('Customer not found', 'error');
        return;
    }
    
    // Check if customer has receipts
    const receipts = Storage.getReceipts();
    const customerReceipts = receipts.filter(r => r.mobile === mobile);
    
    if (customerReceipts.length > 0) {
        showNotification(`Cannot delete customer. They have ${customerReceipts.length} receipt(s) associated.`, 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete customer ${customer.name}? This action cannot be undone.`)) {
        if (Storage.deleteCustomer(mobile)) {
            showNotification('Customer deleted successfully', 'success');
            loadCustomers();
        } else {
            showNotification('Error deleting customer', 'error');
        }
    }
}

// View customer details
function viewCustomerDetails(mobile) {
    const customer = Storage.getCustomerByMobile(mobile);
    if (!customer) {
        showNotification('Customer not found', 'error');
        return;
    }
    
    const receipts = Storage.getReceipts().filter(r => r.mobile === mobile);
    const totals = Storage.getCustomerTotals().find(t => t.mobile === mobile) || {
        totalReceipts: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalOutstanding: 0
    };
    
    const receiptsHTML = receipts.length > 0 ? `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Receipt #</th>
                    <th>Date</th>
                    <th>Transaction Type</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Outstanding</th>
                </tr>
            </thead>
            <tbody>
                ${receipts.map(receipt => `
                    <tr>
                        <td><a href="create-receipt.html?mode=view" onclick="viewReceiptFromModal('${receipt.receiptNumber}')">${receipt.receiptNumber}</a></td>
                        <td>${formatDate(new Date(receipt.date))}</td>
                        <td>${receipt.transactionType}</td>
                        <td>${formatCurrency(receipt.grandTotal)}</td>
                        <td>${formatCurrency(receipt.paidAmount)}</td>
                        <td class="${receipt.outstandingBalance > 0 ? 'text-danger' : 'text-success'}">
                            ${formatCurrency(receipt.outstandingBalance)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p class="text-center">No receipts found for this customer.</p>';
    
    const detailsHTML = `
        <div class="form-section">
            <h4 class="form-section-title">Customer Information</h4>
            <div class="receipt-info">
                <div class="receipt-info-item">
                    <span class="receipt-info-label">Name:</span>
                    <span class="receipt-info-value">${customer.name}</span>
                </div>
                <div class="receipt-info-item">
                    <span class="receipt-info-label">Mobile:</span>
                    <span class="receipt-info-value">${customer.mobile}</span>
                </div>
                <div class="receipt-info-item">
                    <span class="receipt-info-label">Email:</span>
                    <span class="receipt-info-value">${customer.email || 'N/A'}</span>
                </div>
                <div class="receipt-info-item">
                    <span class="receipt-info-label">Registered On:</span>
                    <span class="receipt-info-value">${formatDate(new Date(customer.createdAt))}</span>
                </div>
                <div class="receipt-info-item" style="grid-column: span 2;">
                    <span class="receipt-info-label">Address:</span>
                    <span class="receipt-info-value">${customer.address || 'N/A'}</span>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h4 class="form-section-title">Transaction Summary</h4>
            <div class="receipt-info">
                <div class="receipt-info-item">
                    <span class="receipt-info-label">Total Receipts:</span>
                    <span class="receipt-info-value">${totals.totalReceipts}</span>
                </div>
                <div class="receipt-info-item">
                    <span class="receipt-info-label">Total Amount:</span>
                    <span class="receipt-info-value">${formatCurrency(totals.totalAmount)}</span>
                </div>
                <div class="receipt-info-item">
                    <span class="receipt-info-label">Total Paid:</span>
                    <span class="receipt-info-value">${formatCurrency(totals.totalPaid)}</span>
                </div>
                <div class="receipt-info-item">
                    <span class="receipt-info-label">Outstanding:</span>
                    <span class="receipt-info-value ${totals.totalOutstanding > 0 ? 'text-danger' : 'text-success'}">
                        ${formatCurrency(totals.totalOutstanding)}
                    </span>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h4 class="form-section-title">Receipt History</h4>
            ${receiptsHTML}
        </div>
    `;
    
    document.getElementById('customerDetailsContent').innerHTML = detailsHTML;
    document.getElementById('customerDetailsModal').classList.remove('hidden');
}

// Close customer details modal
function closeCustomerDetailsModal() {
    document.getElementById('customerDetailsModal').classList.add('hidden');
}

// View receipt from modal
function viewReceiptFromModal(receiptNumber) {
    const receipt = Storage.getReceiptByNumber(receiptNumber);
    if (receipt) {
        sessionStorage.setItem('viewingReceipt', JSON.stringify(receipt));
    }
}

// Export customers to Excel
function exportCustomersExcel() {
    const customers = Storage.getCustomers();
    
    if (customers.length === 0) {
        showNotification('No customers to export', 'warning');
        return;
    }
    
    // Prepare data for export
    const exportData = customers.map(customer => ({
        'Name': customer.name,
        'Mobile Number': customer.mobile,
        'Address': customer.address || '',
        'Email': customer.email || '',
        'Registered On': customer.createdAt
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `jewellery_customers_${timestamp}.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, filename);
    
    showNotification('Customer Excel file downloaded successfully', 'success');
}

// Export customer totals to Excel
function exportCustomerTotalsExcel() {
    const customerTotals = Storage.getCustomerTotals();
    
    if (customerTotals.length === 0) {
        showNotification('No customer totals to export', 'warning');
        return;
    }
    
    // Prepare data for export
    const exportData = customerTotals.map(totals => ({
        'Customer Name': totals.customerName,
        'Mobile Number': totals.mobile,
        'Address': totals.address || '',
        'Total Receipts': totals.totalReceipts,
        'Total Amount (₹)': totals.totalAmount.toFixed(2),
        'Total Paid (₹)': totals.totalPaid.toFixed(2),
        'Total Outstanding (₹)': totals.totalOutstanding.toFixed(2)
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customer Totals');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `jewellery_customer_totals_${timestamp}.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, filename);
    
    showNotification('Customer totals Excel file downloaded successfully', 'success');
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
