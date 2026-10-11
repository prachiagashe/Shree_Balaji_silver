/* Jewellery Shop Receipt Management System - Reports Logic */

let currentReportData = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!Storage.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Set default date range (current month)
    setDefaultDateRange();
    
    // Generate initial report
    generateReport();
    
    setupEventListeners();
    updateActiveNav();
});

// Set default date range to current month
function setDefaultDateRange() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    document.getElementById('reportDateFrom').value = firstDay.toISOString().split('T')[0];
    document.getElementById('reportDateTo').value = lastDay.toISOString().split('T')[0];
}

// Generate report
function generateReport() {
    const dateFrom = document.getElementById('reportDateFrom').value;
    const dateTo = document.getElementById('reportDateTo').value;
    const transactionType = document.getElementById('reportTransactionType').value;
    
    const allReceipts = Storage.getReceipts();
    
    // Filter receipts based on criteria
    const filteredReceipts = allReceipts.filter(receipt => {
        // Date filter
        let matchesDate = true;
        if (dateFrom) {
            matchesDate = matchesDate && new Date(receipt.date) >= new Date(dateFrom);
        }
        if (dateTo) {
            matchesDate = matchesDate && new Date(receipt.date) <= new Date(dateTo);
        }
        
        // Transaction type filter
        const matchesType = !transactionType || receipt.transactionType === transactionType;
        
        return matchesDate && matchesType;
    });
    
    // Store current report data
    currentReportData = {
        receipts: filteredReceipts,
        dateFrom: dateFrom,
        dateTo: dateTo,
        transactionType: transactionType
    };
    
    // Update summary statistics
    updateSummaryStats(filteredReceipts);
    
    // Update transaction type breakdown
    updateTransactionTypeBreakdown(filteredReceipts);
    
    // Update daily summary
    updateDailySummary(filteredReceipts);
}

// Update summary statistics
function updateSummaryStats(receipts) {
    const totalReceipts = receipts.length;
    const totalAmount = receipts.reduce((sum, r) => sum + (r.grandTotal || 0), 0);
    const totalCollected = receipts.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
    const totalOutstanding = receipts.reduce((sum, r) => sum + (r.outstandingBalance || 0), 0);
    
    document.getElementById('reportTotalReceipts').textContent = totalReceipts;
    document.getElementById('reportTotalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('reportTotalCollected').textContent = formatCurrency(totalCollected);
    document.getElementById('reportTotalOutstanding').textContent = formatCurrency(totalOutstanding);
}

// Update transaction type breakdown
function updateTransactionTypeBreakdown(receipts) {
    const tbody = document.getElementById('transactionTypeBody');
    
    // Group by transaction type
    const typeGroups = {};
    receipts.forEach(receipt => {
        const type = receipt.transactionType;
        if (!typeGroups[type]) {
            typeGroups[type] = {
                count: 0,
                totalAmount: 0,
                totalCollected: 0,
                totalOutstanding: 0
            };
        }
        typeGroups[type].count += 1;
        typeGroups[type].totalAmount += receipt.grandTotal || 0;
        typeGroups[type].totalCollected += receipt.paidAmount || 0;
        typeGroups[type].totalOutstanding += receipt.outstandingBalance || 0;
    });
    
    const types = Object.keys(typeGroups).sort();
    
    if (types.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No data available for selected filters</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = types.map(type => `
        <tr>
            <td><strong>${type}</strong></td>
            <td>${typeGroups[type].count}</td>
            <td>${formatCurrency(typeGroups[type].totalAmount)}</td>
            <td>${formatCurrency(typeGroups[type].totalCollected)}</td>
            <td class="${typeGroups[type].totalOutstanding > 0 ? 'text-danger' : 'text-success'}">
                ${formatCurrency(typeGroups[type].totalOutstanding)}
            </td>
        </tr>
    `).join('');
}

// Update daily summary
function updateDailySummary(receipts) {
    const tbody = document.getElementById('dailySummaryBody');
    
    // Group by date
    const dateGroups = {};
    receipts.forEach(receipt => {
        const date = receipt.date;
        if (!dateGroups[date]) {
            dateGroups[date] = {
                count: 0,
                totalAmount: 0,
                totalCollected: 0,
                totalOutstanding: 0
            };
        }
        dateGroups[date].count += 1;
        dateGroups[date].totalAmount += receipt.grandTotal || 0;
        dateGroups[date].totalCollected += receipt.paidAmount || 0;
        dateGroups[date].totalOutstanding += receipt.outstandingBalance || 0;
    });
    
    // Sort by date descending
    const dates = Object.keys(dateGroups).sort((a, b) => new Date(b) - new Date(a));
    
    if (dates.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No data available for selected filters</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = dates.map(date => `
        <tr>
            <td><strong>${formatDate(new Date(date))}</strong></td>
            <td>${dateGroups[date].count}</td>
            <td>${formatCurrency(dateGroups[date].totalAmount)}</td>
            <td>${formatCurrency(dateGroups[date].totalCollected)}</td>
            <td class="${dateGroups[date].totalOutstanding > 0 ? 'text-danger' : 'text-success'}">
                ${formatCurrency(dateGroups[date].totalOutstanding)}
            </td>
        </tr>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            Storage.clearUserSession();
            window.location.href = 'index.html';
        }
    });
}

// Export report to Excel
function exportReportToExcel() {
    if (!currentReportData || currentReportData.receipts.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const receipts = currentReportData.receipts;
    
    // Prepare summary data
    const summaryData = [{
        'Report Type': 'Transaction Summary',
        'Date Range': `${currentReportData.dateFrom} to ${currentReportData.dateTo}`,
        'Transaction Type Filter': currentReportData.transactionType || 'All',
        'Total Receipts': receipts.length,
        'Total Amount (₹)': receipts.reduce((sum, r) => sum + (r.grandTotal || 0), 0).toFixed(2),
        'Total Collected (₹)': receipts.reduce((sum, r) => sum + (r.paidAmount || 0), 0).toFixed(2),
        'Total Outstanding (₹)': receipts.reduce((sum, r) => sum + (r.outstandingBalance || 0), 0).toFixed(2)
    }];
    
    // Prepare detailed receipt data
    const receiptData = receipts.map(receipt => {
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
    
    // Prepare transaction type breakdown
    const typeGroups = {};
    receipts.forEach(receipt => {
        const type = receipt.transactionType;
        if (!typeGroups[type]) {
            typeGroups[type] = {
                count: 0,
                totalAmount: 0,
                totalCollected: 0,
                totalOutstanding: 0
            };
        }
        typeGroups[type].count += 1;
        typeGroups[type].totalAmount += receipt.grandTotal || 0;
        typeGroups[type].totalCollected += receipt.paidAmount || 0;
        typeGroups[type].totalOutstanding += receipt.outstandingBalance || 0;
    });
    
    const typeBreakdownData = Object.keys(typeGroups).map(type => ({
        'Transaction Type': type,
        'Count': typeGroups[type].count,
        'Total Amount (₹)': typeGroups[type].totalAmount.toFixed(2),
        'Total Collected (₹)': typeGroups[type].totalCollected.toFixed(2),
        'Total Outstanding (₹)': typeGroups[type].totalOutstanding.toFixed(2)
    }));
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add summary sheet
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    // Add receipts sheet
    const receiptsWs = XLSX.utils.json_to_sheet(receiptData);
    XLSX.utils.book_append_sheet(wb, receiptsWs, 'Receipts');
    
    // Add transaction type breakdown sheet
    const typeWs = XLSX.utils.json_to_sheet(typeBreakdownData);
    XLSX.utils.book_append_sheet(wb, typeWs, 'Transaction Types');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `jewellery_report_${timestamp}.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, filename);
    
    showNotification('Report exported successfully', 'success');
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
