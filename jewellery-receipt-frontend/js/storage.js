/* Jewellery Shop Receipt Management System - LocalStorage Utilities */

const Storage = {
    // Keys for localStorage
    KEYS: {
        RECEIPTS: 'jewellery_receipts',
        CUSTOMERS: 'jewellery_customers',
        SHOP_DETAILS: 'jewellery_shop_details',
        USER_SESSION: 'jewellery_user_session'
    },

    // Get data from localStorage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    // Save data to localStorage
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clear all demo data
    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // Receipt operations
    getReceipts() {
        return this.get(this.KEYS.RECEIPTS) || [];
    },

    saveReceipt(receipt) {
        const receipts = this.getReceipts();
        const existingIndex = receipts.findIndex(r => r.receiptNumber === receipt.receiptNumber);
        
        if (existingIndex >= 0) {
            receipts[existingIndex] = receipt;
        } else {
            receipts.push(receipt);
        }
        
        return this.set(this.KEYS.RECEIPTS, receipts);
    },

    deleteReceipt(receiptNumber) {
        const receipts = this.getReceipts().filter(r => r.receiptNumber !== receiptNumber);
        return this.set(this.KEYS.RECEIPTS, receipts);
    },

    getReceiptByNumber(receiptNumber) {
        const receipts = this.getReceipts();
        return receipts.find(r => r.receiptNumber === receiptNumber);
    },

    // Customer operations
    getCustomers() {
        return this.get(this.KEYS.CUSTOMERS) || [];
    },

    saveCustomer(customer) {
        const customers = this.getCustomers();
        const existingIndex = customers.findIndex(c => c.mobile === customer.mobile);
        
        if (existingIndex >= 0) {
            customers[existingIndex] = customer;
        } else {
            customers.push(customer);
        }
        
        return this.set(this.KEYS.CUSTOMERS, customers);
    },

    deleteCustomer(mobile) {
        const customers = this.getCustomers().filter(c => c.mobile !== mobile);
        return this.set(this.KEYS.CUSTOMERS, customers);
    },

    getCustomerByMobile(mobile) {
        const customers = this.getCustomers();
        return customers.find(c => c.mobile === mobile);
    },

    // Shop details operations
    getShopDetails() {
        return this.get(this.KEYS.SHOP_DETAILS) || {
            name: 'SHREE BALAJI',
            address: 'Shop Address Line 1',
            city: 'City',
            state: 'State',
            pincode: '000000',
            phone: '+91 00000 00000',
            email: 'contact@shreebalaji.com',
            gstin: 'GSTIN Number'
        };
    },

    saveShopDetails(details) {
        return this.set(this.KEYS.SHOP_DETAILS, details);
    },

    // User session operations
    setUserSession(session) {
        return this.set(this.KEYS.USER_SESSION, session);
    },

    getUserSession() {
        return this.get(this.KEYS.USER_SESSION);
    },

    clearUserSession() {
        return this.remove(this.KEYS.USER_SESSION);
    },

    // Check if user is logged in
    isLoggedIn() {
        const session = this.getUserSession();
        return session && session.loggedIn;
    },

    // Initialize demo data
    initDemoData() {
        // Only initialize if no data exists
        if (!this.get(this.KEYS.RECEIPTS)) {
            const demoReceipts = [
                {
                    receiptNumber: 'REC-2024-001',
                    date: '2024-01-15',
                    transactionType: 'Cash Receipt',
                    customerName: 'Rahul Sharma',
                    mobile: '9876543210',
                    address: '123 Main Street, Mumbai',
                    items: [
                        {
                            itemName: 'Gold Necklace',
                            billNumber: 'BILL-001',
                            fineWeight: 10.5,
                            alloyWeight: 0.5,
                            totalWeight: 11.0,
                            metalRate: 6500,
                            makingChargeRate: 500,
                            makingCharges: 5500,
                            amount: 77000,
                            cgstPercent: 1.5,
                            cgstAmount: 1155,
                            sgstPercent: 1.5,
                            sgstAmount: 1155
                        }
                    ],
                    subtotal: 77000,
                    cgstTotal: 1155,
                    sgstTotal: 1155,
                    grandTotal: 79310,
                    paymentMode: 'Cash',
                    paidAmount: 79310,
                    outstandingBalance: 0,
                    remarks: 'Full payment received'
                },
                {
                    receiptNumber: 'REC-2024-002',
                    date: '2024-01-16',
                    transactionType: 'Rate Sales',
                    customerName: 'Priya Patel',
                    mobile: '9876543211',
                    address: '456 Park Avenue, Delhi',
                    items: [
                        {
                            itemName: 'Silver Anklet',
                            billNumber: 'BILL-002',
                            fineWeight: 25.0,
                            alloyWeight: 0,
                            totalWeight: 25.0,
                            metalRate: 750,
                            makingChargeRate: 200,
                            makingCharges: 5000,
                            amount: 23750,
                            cgstPercent: 1.5,
                            cgstAmount: 356.25,
                            sgstPercent: 1.5,
                            sgstAmount: 356.25
                        }
                    ],
                    subtotal: 23750,
                    cgstTotal: 356.25,
                    sgstTotal: 356.25,
                    grandTotal: 24462.50,
                    paymentMode: 'Card',
                    paidAmount: 20000,
                    outstandingBalance: 4462.50,
                    remarks: 'Balance payable in 7 days'
                }
            ];
            this.set(this.KEYS.RECEIPTS, demoReceipts);
        }

        if (!this.get(this.KEYS.CUSTOMERS)) {
            const demoCustomers = [
                {
                    name: 'Rahul Sharma',
                    mobile: '9876543210',
                    address: '123 Main Street, Mumbai',
                    email: 'rahul@example.com',
                    createdAt: '2024-01-15'
                },
                {
                    name: 'Priya Patel',
                    mobile: '9876543211',
                    address: '456 Park Avenue, Delhi',
                    email: 'priya@example.com',
                    createdAt: '2024-01-16'
                },
                {
                    name: 'Amit Kumar',
                    mobile: '9876543212',
                    address: '789 Garden Road, Bangalore',
                    email: 'amit@example.com',
                    createdAt: '2024-01-17'
                }
            ];
            this.set(this.KEYS.CUSTOMERS, demoCustomers);
        }
    },

    // Calculate dashboard statistics
    getDashboardStats() {
        const receipts = this.getReceipts();
        const customers = this.getCustomers();
        const today = new Date().toISOString().split('T')[0];

        const todayReceipts = receipts.filter(r => r.date === today);
        const todayAmount = todayReceipts.reduce((sum, r) => sum + (r.grandTotal || 0), 0);
        const totalAmount = receipts.reduce((sum, r) => sum + (r.grandTotal || 0), 0);
        const outstandingAmount = receipts.reduce((sum, r) => sum + (r.outstandingBalance || 0), 0);

        return {
            totalReceipts: receipts.length,
            totalAmount: totalAmount,
            totalCustomers: customers.length,
            todayReceipts: todayReceipts.length,
            todayAmount: todayAmount,
            outstandingAmount: outstandingAmount
        };
    },

    // Get customer-wise totals
    getCustomerTotals() {
        const receipts = this.getReceipts();
        const customerTotals = {};

        receipts.forEach(receipt => {
            const key = receipt.mobile;
            if (!customerTotals[key]) {
                customerTotals[key] = {
                    customerName: receipt.customerName,
                    mobile: receipt.mobile,
                    address: receipt.address,
                    totalReceipts: 0,
                    totalAmount: 0,
                    totalPaid: 0,
                    totalOutstanding: 0
                };
            }

            customerTotals[key].totalReceipts += 1;
            customerTotals[key].totalAmount += receipt.grandTotal || 0;
            customerTotals[key].totalPaid += receipt.paidAmount || 0;
            customerTotals[key].totalOutstanding += receipt.outstandingBalance || 0;
        });

        return Object.values(customerTotals);
    },

    // Generate next receipt number
    generateReceiptNumber() {
        const receipts = this.getReceipts();
        const year = new Date().getFullYear();
        const prefix = `REC-${year}`;
        
        const existingNumbers = receipts
            .filter(r => r.receiptNumber && r.receiptNumber.startsWith(prefix))
            .map(r => {
                const numPart = r.receiptNumber.replace(`${prefix}-`, '');
                return parseInt(numPart) || 0;
            });

        const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
        const nextNum = maxNum + 1;

        return `${prefix}-${String(nextNum).padStart(3, '0')}`;
    }
};

// Initialize demo data on load
Storage.initDemoData();
