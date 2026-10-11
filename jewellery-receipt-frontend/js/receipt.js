/* Jewellery Shop Receipt Management System - Receipt Logic */

let currentReceipt = null;
let isEditMode = false;
let isViewMode = false;
let isPrintMode = false;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!Storage.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Check URL parameters for view/print mode
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const receiptNumber = urlParams.get('receiptNumber');

    if (mode === 'view' || mode === 'print') {
        isViewMode = true;
        isPrintMode = mode === 'print';
        loadReceiptForView(receiptNumber);
    } else {
        initializeNewReceipt();
    }

    setupEventListeners();
    updateActiveNav();
});

// Update receipt heading based on transaction type
function updateReceiptHeading() {
    const transactionType = document.getElementById('transactionType');
    const pageTitle = document.getElementById('pageTitle');
    
    const selectedType = transactionType.value;
    
    if (!selectedType) {
        pageTitle.textContent = 'Create Receipt';
        return;
    }
    
    const selectedText = transactionType.options[transactionType.selectedIndex].text.trim();
    
    // Use "View" prefix if in view mode, otherwise "Create"
    const prefix = isViewMode ? 'View' : 'Create';
    pageTitle.textContent = `${prefix} ${selectedText}`;
}

// Initialize new receipt
function initializeNewReceipt() {
    document.getElementById('pageTitle').textContent = 'Create Receipt';
    document.getElementById('receiptNumber').value = Storage.generateReceiptNumber();
    document.getElementById('receiptDate').value = new Date().toISOString().split('T')[0];
    
    // Add first item row
    addItemRow();
    
    // Set paid amount to 0 initially
    document.getElementById('paidAmount').value = 0;
    updateTotals();
    
    // Set initial heading based on transaction type
    updateReceiptHeading();
}

// Load receipt for viewing/editing
function loadReceiptForView(receiptNumber) {
    const viewingReceipt = sessionStorage.getItem('viewingReceipt');
    
    if (viewingReceipt) {
        currentReceipt = JSON.parse(viewingReceipt);
        sessionStorage.removeItem('viewingReceipt');
        
        // Set page title for print mode
        if (isPrintMode) {
            document.getElementById('pageTitle').textContent = 'Print Receipt';
        }
        
        // Populate form
        document.getElementById('receiptNumber').value = currentReceipt.receiptNumber;
        document.getElementById('receiptDate').value = currentReceipt.date;
        document.getElementById('transactionType').value = currentReceipt.transactionType;
        document.getElementById('customerName').value = currentReceipt.customerName;
        document.getElementById('mobileNumber').value = currentReceipt.mobile;
        document.getElementById('customerAddress').value = currentReceipt.address || '';
        document.getElementById('paymentMode').value = currentReceipt.paymentMode;
        document.getElementById('paidAmount').value = currentReceipt.paidAmount;
        document.getElementById('remarks').value = currentReceipt.remarks || '';
        
        // Update heading based on transaction type for view mode
        if (!isPrintMode) {
            updateReceiptHeading();
        }
        
        // Clear existing items
        document.getElementById('itemsBody').innerHTML = '';
        
        // Add items
        currentReceipt.items.forEach(item => {
            addItemRow(item);
        });
        
        // Update totals
        updateTotals();
        
        // Disable form in view mode
        if (isViewMode) {
            disableForm();
        }
        
        // Auto-print if in print mode
        if (isPrintMode) {
            setTimeout(() => {
                showPreview();
                setTimeout(() => {
                    window.print();
                }, 500);
            }, 500);
        }
    } else {
        showNotification('Receipt not found', 'error');
        window.location.href = 'receipt-history.html';
    }
}

// Add item row
function addItemRow(itemData = null) {
    const tbody = document.getElementById('itemsBody');
    const rowCount = tbody.children.length + 1;
    
    const row = document.createElement('tr');
    row.className = 'item-row';
    row.innerHTML = `
        <td>
            <input type="text" class="item-name form-control" placeholder="Item name" required>
        </td>
        <td>
            <input type="text" class="bill-number form-control" placeholder="Bill #">
        </td>
        <td>
            <input type="number" class="fine-weight number-input form-control" placeholder="0.00" step="0.01" min="0">
        </td>
        <td>
            <input type="number" class="alloy-weight number-input form-control" placeholder="0.00" step="0.01" min="0">
        </td>
        <td>
            <input type="number" class="total-weight number-input form-control" placeholder="0.00" step="0.01" min="0" readonly>
        </td>
        <td>
            <input type="number" class="metal-rate number-input form-control" placeholder="0" step="1" min="0">
        </td>
        <td>
            <input type="number" class="making-rate number-input form-control" placeholder="0" step="1" min="0">
        </td>
        <td>
            <input type="number" class="making-charges number-input form-control" placeholder="0.00" step="0.01" min="0" readonly>
        </td>
        <td>
            <input type="number" class="amount number-input form-control" placeholder="0.00" step="0.01" min="0" readonly>
        </td>
        <td>
            <input type="number" class="cgst-percent number-input form-control" placeholder="1.5" step="0.1" min="0" max="100" value="1.5">
        </td>
        <td>
            <input type="number" class="sgst-percent number-input form-control" placeholder="1.5" step="0.1" min="0" max="100" value="1.5">
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-danger remove-item-btn" onclick="removeItemRow(this)">×</button>
        </td>
    `;
    
    tbody.appendChild(row);
    
    // Add event listeners to new row inputs
    const rowInputs = row.querySelectorAll('input');
    rowInputs.forEach(input => {
        input.addEventListener('input', function() {
            calculateItemRow(row);
            updateTotals();
        });
    });
    
    // If item data provided, populate it
    if (itemData) {
        row.querySelector('.item-name').value = itemData.itemName || '';
        row.querySelector('.bill-number').value = itemData.billNumber || '';
        row.querySelector('.fine-weight').value = itemData.fineWeight || 0;
        row.querySelector('.alloy-weight').value = itemData.alloyWeight || 0;
        row.querySelector('.metal-rate').value = itemData.metalRate || 0;
        row.querySelector('.making-rate').value = itemData.makingChargeRate || 0;
        row.querySelector('.cgst-percent').value = itemData.cgstPercent || 1.5;
        row.querySelector('.sgst-percent').value = itemData.sgstPercent || 1.5;
        
        calculateItemRow(row);
    }
}

// Remove item row
function removeItemRow(button) {
    const tbody = document.getElementById('itemsBody');
    if (tbody.children.length > 1) {
        button.closest('tr').remove();
        updateTotals();
    } else {
        showNotification('At least one item is required', 'warning');
    }
}

// Calculate item row
function calculateItemRow(row) {
    const fineWeight = parseFloat(row.querySelector('.fine-weight').value) || 0;
    const alloyWeight = parseFloat(row.querySelector('.alloy-weight').value) || 0;
    const metalRate = parseFloat(row.querySelector('.metal-rate').value) || 0;
    const makingRate = parseFloat(row.querySelector('.making-rate').value) || 0;
    
    // Calculate total weight (fine + alloy)
    const totalWeight = fineWeight + alloyWeight;
    row.querySelector('.total-weight').value = totalWeight.toFixed(2);
    
    // Calculate making charges (making rate * total weight)
    const makingCharges = makingRate * totalWeight;
    row.querySelector('.making-charges').value = makingCharges.toFixed(2);
    
    // Calculate amount (fine weight * metal rate + making charges)
    const amount = (fineWeight * metalRate) + makingCharges;
    row.querySelector('.amount').value = amount.toFixed(2);
}

// Update totals
function updateTotals() {
    const rows = document.querySelectorAll('.item-row');
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    
    rows.forEach(row => {
        const amount = parseFloat(row.querySelector('.amount').value) || 0;
        const cgstPercent = parseFloat(row.querySelector('.cgst-percent').value) || 0;
        const sgstPercent = parseFloat(row.querySelector('.sgst-percent').value) || 0;
        
        subtotal += amount;
        
        const cgstAmount = (amount * cgstPercent) / 100;
        const sgstAmount = (amount * sgstPercent) / 100;
        
        totalCGST += cgstAmount;
        totalSGST += sgstAmount;
    });
    
    const grandTotal = subtotal + totalCGST + totalSGST;
    const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
    const outstandingBalance = grandTotal - paidAmount;
    
    document.getElementById('subtotal').value = subtotal.toFixed(2);
    document.getElementById('totalCGST').value = totalCGST.toFixed(2);
    document.getElementById('totalSGST').value = totalSGST.toFixed(2);
    document.getElementById('grandTotal').value = grandTotal.toFixed(2);
    document.getElementById('outstandingBalance').value = outstandingBalance.toFixed(2);
    
    // Auto-update paid amount to grand total if not set
    if (paidAmount === 0 && grandTotal > 0) {
        document.getElementById('paidAmount').value = grandTotal.toFixed(2);
        document.getElementById('outstandingBalance').value = '0.00';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', () => addItemRow());
    
    // Paid amount change
    document.getElementById('paidAmount').addEventListener('input', updateTotals);
    
    // Save button
    document.getElementById('saveBtn').addEventListener('click', (e) => {
        e.preventDefault();
        saveReceipt();
    });
    
    // Preview button
    document.getElementById('previewBtn').addEventListener('click', showPreview);
    
    // Print button
    document.getElementById('printBtn').addEventListener('click', () => {
        window.print();
    });
    
    // Confirm save button
    document.getElementById('confirmSaveBtn').addEventListener('click', saveReceipt);
    
    // Edit button
    document.getElementById('editBtn').addEventListener('click', hidePreview);
    
    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            window.location.href = 'receipt-history.html';
        }
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            Storage.clearUserSession();
            window.location.href = 'index.html';
        }
    });
    
    // Transaction type change - update heading dynamically
    document.getElementById('transactionType').addEventListener('change', updateReceiptHeading);
}

// Save receipt
function saveReceipt() {
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Collect receipt data
    const receipt = {
        receiptNumber: document.getElementById('receiptNumber').value,
        date: document.getElementById('receiptDate').value,
        transactionType: document.getElementById('transactionType').value,
        customerName: document.getElementById('customerName').value,
        mobile: document.getElementById('mobileNumber').value,
        address: document.getElementById('customerAddress').value,
        items: collectItems(),
        subtotal: parseFloat(document.getElementById('subtotal').value),
        cgstTotal: parseFloat(document.getElementById('totalCGST').value),
        sgstTotal: parseFloat(document.getElementById('totalSGST').value),
        grandTotal: parseFloat(document.getElementById('grandTotal').value),
        paymentMode: document.getElementById('paymentMode').value,
        paidAmount: parseFloat(document.getElementById('paidAmount').value),
        outstandingBalance: parseFloat(document.getElementById('outstandingBalance').value),
        remarks: document.getElementById('remarks').value,
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    if (Storage.saveReceipt(receipt)) {
        // Save or update customer
        const customer = {
            name: receipt.customerName,
            mobile: receipt.mobile,
            address: receipt.address,
            email: '',
            createdAt: new Date().toISOString().split('T')[0]
        };
        Storage.saveCustomer(customer);
        
        showNotification('Receipt saved successfully!', 'success');
        
        // Redirect to history after a delay
        setTimeout(() => {
            window.location.href = 'receipt-history.html';
        }, 1500);
    } else {
        showNotification('Error saving receipt', 'error');
    }
}

// Validate form
function validateForm() {
    const receiptNumber = document.getElementById('receiptNumber').value;
    const receiptDate = document.getElementById('receiptDate').value;
    const transactionType = document.getElementById('transactionType').value;
    const customerName = document.getElementById('customerName').value;
    const mobileNumber = document.getElementById('mobileNumber').value;
    
    if (!receiptNumber || !receiptDate || !transactionType || !customerName || !mobileNumber) {
        showNotification('Please fill in all required fields', 'error');
        return false;
    }
    
    if (mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return false;
    }
    
    const items = document.querySelectorAll('.item-row');
    if (items.length === 0) {
        showNotification('Please add at least one item', 'error');
        return false;
    }
    
    let hasValidItem = false;
    items.forEach(row => {
        const itemName = row.querySelector('.item-name').value;
        const fineWeight = parseFloat(row.querySelector('.fine-weight').value) || 0;
        const metalRate = parseFloat(row.querySelector('.metal-rate').value) || 0;
        
        if (itemName && fineWeight > 0 && metalRate > 0) {
            hasValidItem = true;
        }
    });
    
    if (!hasValidItem) {
        showNotification('Please add at least one valid item with name, weight, and rate', 'error');
        return false;
    }
    
    return true;
}

// Collect items from form
function collectItems() {
    const items = [];
    const rows = document.querySelectorAll('.item-row');
    
    rows.forEach(row => {
        const fineWeight = parseFloat(row.querySelector('.fine-weight').value) || 0;
        const alloyWeight = parseFloat(row.querySelector('.alloy-weight').value) || 0;
        const metalRate = parseFloat(row.querySelector('.metal-rate').value) || 0;
        const makingRate = parseFloat(row.querySelector('.making-rate').value) || 0;
        const totalWeight = fineWeight + alloyWeight;
        const makingCharges = makingRate * totalWeight;
        const amount = (fineWeight * metalRate) + makingCharges;
        const cgstPercent = parseFloat(row.querySelector('.cgst-percent').value) || 0;
        const sgstPercent = parseFloat(row.querySelector('.sgst-percent').value) || 0;
        const cgstAmount = (amount * cgstPercent) / 100;
        const sgstAmount = (amount * sgstPercent) / 100;
        
        items.push({
            itemName: row.querySelector('.item-name').value,
            billNumber: row.querySelector('.bill-number').value,
            fineWeight: fineWeight,
            alloyWeight: alloyWeight,
            totalWeight: totalWeight,
            metalRate: metalRate,
            makingChargeRate: makingRate,
            makingCharges: makingCharges,
            amount: amount,
            cgstPercent: cgstPercent,
            cgstAmount: cgstAmount,
            sgstPercent: sgstPercent,
            sgstAmount: sgstAmount
        });
    });
    
    return items;
}

// Show preview
function showPreview() {
    if (!validateForm()) {
        return;
    }
    
    const shopDetails = Storage.getShopDetails();
    const receipt = {
        receiptNumber: document.getElementById('receiptNumber').value,
        date: document.getElementById('receiptDate').value,
        transactionType: document.getElementById('transactionType').value,
        customerName: document.getElementById('customerName').value,
        mobile: document.getElementById('mobileNumber').value,
        address: document.getElementById('customerAddress').value,
        items: collectItems(),
        subtotal: parseFloat(document.getElementById('subtotal').value),
        cgstTotal: parseFloat(document.getElementById('totalCGST').value),
        sgstTotal: parseFloat(document.getElementById('totalSGST').value),
        grandTotal: parseFloat(document.getElementById('grandTotal').value),
        paymentMode: document.getElementById('paymentMode').value,
        paidAmount: parseFloat(document.getElementById('paidAmount').value),
        outstandingBalance: parseFloat(document.getElementById('outstandingBalance').value),
        remarks: document.getElementById('remarks').value
    };
    
    const previewHTML = generateReceiptPreview(receipt, shopDetails);
    document.getElementById('receiptPreview').innerHTML = previewHTML;
    document.getElementById('receiptPreview').classList.remove('hidden');
    document.getElementById('previewActions').classList.remove('hidden');
    document.getElementById('receiptFormCard').classList.add('hidden');
}

// Hide preview
function hidePreview() {
    document.getElementById('receiptPreview').classList.add('hidden');
    document.getElementById('previewActions').classList.add('hidden');
    document.getElementById('receiptFormCard').classList.remove('hidden');
}

// Generate receipt preview HTML
function generateReceiptPreview(receipt, shopDetails) {
    const itemsHTML = receipt.items.map(item => `
        <tr>
            <td>${item.itemName}</td>
            <td>${item.billNumber || '-'}</td>
            <td>${item.fineWeight.toFixed(2)}</td>
            <td>${item.alloyWeight.toFixed(2)}</td>
            <td>${item.totalWeight.toFixed(2)}</td>
            <td>${item.metalRate.toFixed(2)}</td>
            <td>${item.makingChargeRate.toFixed(2)}</td>
            <td>${item.makingCharges.toFixed(2)}</td>
            <td>${item.amount.toFixed(2)}</td>
            <td>${item.cgstPercent.toFixed(1)}%</td>
            <td>${item.cgstAmount.toFixed(2)}</td>
            <td>${item.sgstPercent.toFixed(1)}%</td>
            <td>${item.sgstAmount.toFixed(2)}</td>
        </tr>
    `).join('');
    
    return `
        <div class="receipt-header">
            <h2 class="receipt-shop-name">${shopDetails.name}</h2>
            <p class="receipt-shop-address">${shopDetails.address}, ${shopDetails.city}, ${shopDetails.state} - ${shopDetails.pincode}</p>
            <p class="receipt-shop-contact">Phone: ${shopDetails.phone} | Email: ${shopDetails.email}</p>
            <p class="receipt-shop-contact">GSTIN: ${shopDetails.gstin}</p>
        </div>
        
        <h3 class="receipt-title">${receipt.transactionType}</h3>
        
        <div class="receipt-info">
            <div class="receipt-info-item">
                <span class="receipt-info-label">Receipt Number:</span>
                <span class="receipt-info-value">${receipt.receiptNumber}</span>
            </div>
            <div class="receipt-info-item">
                <span class="receipt-info-label">Date:</span>
                <span class="receipt-info-value">${formatDate(new Date(receipt.date))}</span>
            </div>
            <div class="receipt-info-item">
                <span class="receipt-info-label">Customer Name:</span>
                <span class="receipt-info-value">${receipt.customerName}</span>
            </div>
            <div class="receipt-info-item">
                <span class="receipt-info-label">Mobile:</span>
                <span class="receipt-info-value">${receipt.mobile}</span>
            </div>
            <div class="receipt-info-item" style="grid-column: span 2;">
                <span class="receipt-info-label">Address:</span>
                <span class="receipt-info-value">${receipt.address || 'N/A'}</span>
            </div>
        </div>
        
        <div class="receipt-items">
            <table class="item-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Bill #</th>
                        <th>Fine (g)</th>
                        <th>Alloy (g)</th>
                        <th>Total (g)</th>
                        <th>Rate</th>
                        <th>Making Rate</th>
                        <th>Making (₹)</th>
                        <th>Amount (₹)</th>
                        <th>CGST %</th>
                        <th>CGST (₹)</th>
                        <th>SGST %</th>
                        <th>SGST (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        </div>
        
        <div class="receipt-totals">
            <div class="receipt-total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(receipt.subtotal)}</span>
            </div>
            <div class="receipt-total-row">
                <span>CGST:</span>
                <span>${formatCurrency(receipt.cgstTotal)}</span>
            </div>
            <div class="receipt-total-row">
                <span>SGST:</span>
                <span>${formatCurrency(receipt.sgstTotal)}</span>
            </div>
            <div class="receipt-total-row grand-total">
                <span>Grand Total:</span>
                <span>${formatCurrency(receipt.grandTotal)}</span>
            </div>
            <div class="receipt-total-row">
                <span>Payment Mode:</span>
                <span>${receipt.paymentMode}</span>
            </div>
            <div class="receipt-total-row">
                <span>Paid Amount:</span>
                <span>${formatCurrency(receipt.paidAmount)}</span>
            </div>
            <div class="receipt-total-row">
                <span>Outstanding Balance:</span>
                <span>${formatCurrency(receipt.outstandingBalance)}</span>
            </div>
            ${receipt.remarks ? `
            <div class="receipt-total-row">
                <span>Remarks:</span>
                <span>${receipt.remarks}</span>
            </div>
            ` : ''}
        </div>
        
        <div class="receipt-footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    `;
}

// Disable form for view mode
function disableForm() {
    const form = document.getElementById('receiptForm');
    const inputs = form.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => {
        input.disabled = true;
    });
    
    // Hide add item button
    document.getElementById('addItemBtn').classList.add('hidden');
    
    // Hide save and preview buttons
    document.getElementById('saveBtn').classList.add('hidden');
    document.getElementById('previewBtn').classList.add('hidden');
    
    // Show print button
    const printBtn = document.createElement('button');
    printBtn.className = 'btn btn-success';
    printBtn.textContent = '🖨️ Print';
    printBtn.onclick = () => window.print();
    document.querySelector('.form-section:last-child .form-group:last-child').appendChild(printBtn);
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
