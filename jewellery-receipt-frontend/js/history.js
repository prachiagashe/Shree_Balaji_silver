/* Jewellery Shop Receipt Management System - Receipt History Logic */

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!Storage.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    loadReceipts();
    setupEventListeners();
    updateActiveNav();
});

// Load receipts
function loadReceipts() {
    const receipts = Storage.getReceipts();
    const tbody = document.getElementById('receiptsBody');
    
    // Sort by date descending
    const sortedReceipts = receipts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply filters
    const filteredReceipts = filterReceipts(sortedReceipts);
    
    if (filteredReceipts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    No receipts found. <a href="create-receipt.html">Create your first receipt</a>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredReceipts.map(receipt => `
        <tr>
            <td><strong>${receipt.receiptNumber}</strong></td>
            <td>${formatDate(new Date(receipt.date))}</td>
            <td>${receipt.customerName}</td>
            <td>${receipt.mobile}</td>
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
                    <button class="btn btn-sm btn-danger" onclick="deleteReceipt('${receipt.receiptNumber}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter receipts
function filterReceipts(receipts) {
    const searchTerm = document.getElementById('searchReceipt').value.toLowerCase();
    const transactionType = document.getElementById('filterTransactionType').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    const paymentStatus = document.getElementById('filterPaymentStatus').value;
    
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
        
        // Payment status filter
        let matchesPaymentStatus = true;
        if (paymentStatus === 'paid') {
            matchesPaymentStatus = receipt.outstandingBalance === 0;
        } else if (paymentStatus === 'partial') {
            matchesPaymentStatus = receipt.outstandingBalance > 0 && receipt.paidAmount > 0;
        } else if (paymentStatus === 'outstanding') {
            matchesPaymentStatus = receipt.outstandingBalance > 0;
        }
        
        return matchesSearch && matchesType && matchesDateRange && matchesPaymentStatus;
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    document.getElementById('searchReceipt').addEventListener('input', loadReceipts);
    
    // Transaction type filter
    document.getElementById('filterTransactionType').addEventListener('change', loadReceipts);
    
    // Date filters
    document.getElementById('filterDateFrom').addEventListener('change', loadReceipts);
    document.getElementById('filterDateTo').addEventListener('change', loadReceipts);
    
    // Payment status filter
    document.getElementById('filterPaymentStatus').addEventListener('change', loadReceipts);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            Storage.clearUserSession();
            window.location.href = 'index.html';
        }
    });
}

// View receipt
function viewReceipt(receiptNumber) {
    const receipt = Storage.getReceiptByNumber(receiptNumber);
    if (receipt) {
        sessionStorage.setItem('viewingReceipt', JSON.stringify(receipt));
        window.location.href = `create-receipt.html?mode=view`;
    }
}

// Print receipt
function printReceipt(receiptNumber) {
    const receipt = Storage.getReceiptByNumber(receiptNumber);
    if (receipt) {
        sessionStorage.setItem('viewingReceipt', JSON.stringify(receipt));
        window.location.href = `create-receipt.html?mode=print&receiptNumber=${receiptNumber}`;
    }
}

// Delete receipt
function deleteReceipt(receiptNumber) {
    if (confirm(`Are you sure you want to delete receipt ${receiptNumber}? This action cannot be undone.`)) {
        if (Storage.deleteReceipt(receiptNumber)) {
            showNotification('Receipt deleted successfully', 'success');
            loadReceipts();
        } else {
            showNotification('Error deleting receipt', 'error');
        }
    }
}

// Export to Excel
function exportToExcel() {
    const receipts = Storage.getReceipts();
    
    if (receipts.length === 0) {
        showNotification('No receipts to export', 'warning');
        return;
    }
    
    // Prepare data for export
    const exportData = receipts.map(receipt => {
        const itemNames = receipt.items.map(item => item.itemName).join(', ');
        const totalFineWeight = receipt.items.reduce((sum, item) => sum + item.fineWeight, 0);
        const totalAlloyWeight = receipt.items.reduce((sum, item) => sum + item.alloyWeight, 0);
        const totalWeight = receipt.items.reduce((sum, item) => sum + item.totalWeight, 0);
        
        return {
            'Receipt Number': receipt.receiptNumber,
            'Date': receipt.date,
            'Customer Name': receipt.customerName,
            'Mobile Number': receipt.mobile,
            'Address': receipt.address || '',
            'Transaction Type': receipt.transactionType,
            'Items': itemNames,
            'Total Fine Weight (g)': totalFineWeight.toFixed(2),
            'Total Alloy Weight (g)': totalAlloyWeight.toFixed(2),
            'Total Weight (g)': totalWeight.toFixed(2),
            'Subtotal (₹)': receipt.subtotal.toFixed(2),
            'CGST (₹)': receipt.cgstTotal.toFixed(2),
            'SGST (₹)': receipt.sgstTotal.toFixed(2),
            'Grand Total (₹)': receipt.grandTotal.toFixed(2),
            'Payment Mode': receipt.paymentMode,
            'Paid Amount (₹)': receipt.paidAmount.toFixed(2),
            'Outstanding Balance (₹)': receipt.outstandingBalance.toFixed(2),
            'Remarks': receipt.remarks || ''
        };
    });
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Receipts');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `jewellery_receipts_${timestamp}.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, filename);
    
    showNotification('Excel file downloaded successfully', 'success');
}

// Clear demo data
function clearDemoData() {
    if (confirm('Are you sure you want to clear all demo data? This will delete all receipts and customers stored in localStorage. This action cannot be undone.')) {
        if (Storage.clearAll()) {
            showNotification('Demo data cleared successfully', 'success');
            loadReceipts();
            
            // Reinitialize demo data
            setTimeout(() => {
                Storage.initDemoData();
                loadReceipts();
            }, 500);
        } else {
            showNotification('Error clearing demo data', 'error');
        }
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
