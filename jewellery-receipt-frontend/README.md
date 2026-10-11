# Jewellery Shop Receipt Management System - Frontend

A professional, responsive frontend-only receipt management system for jewellery shops. Built with HTML5, CSS3, and vanilla JavaScript, using browser localStorage for demo data persistence.

## ⚠️ Important Notice

**This is a frontend-only demonstration application.** It does not include:
- Backend server (Node.js, Express, etc.)
- Database (MongoDB, MySQL, etc.)
- Real authentication system
- API endpoints
- Production security features

All data is stored in the browser's localStorage and will persist only in the same browser. This application is designed to be a foundation that can be connected to a backend later.

## Features

### 📝 Receipt Management
- Create receipts with multiple items
- Automatic calculations for weights, charges, and taxes
- Support for 9 transaction types:
  - Cash Receipt
  - Purchase
  - Rate Purchase
  - Rate Sales
  - Manufacturing Receipt
  - Manufacturing Issue
  - Approval Receipt
  - Approval Issue
  - Job Work Issue
- Receipt preview and print functionality
- Edit and delete receipts

### 📊 Dashboard
- Summary cards showing key metrics
- Recent receipts table
- Real-time calculations from stored data
- Date and transaction type filters

### 📋 Receipt History
- Complete receipt listing
- Advanced filtering (search, date range, transaction type, payment status)
- View, print, and delete receipts
- Export to Excel

### 👥 Customer Management
- Add, edit, and delete customers
- View customer details and receipt history
- Customer-wise transaction totals
- Export customer data to Excel

### 📈 Reports
- Date-range reports
- Transaction type breakdown
- Daily summary
- Export reports to Excel

### 📊 Excel Export
- Export all receipts
- Export customer details
- Export customer-wise totals
- Export filtered reports
- Uses SheetJS library for browser-side Excel generation

## Technology Stack

- **HTML5** - Markup
- **CSS3** - Styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No frameworks
- **localStorage** - Browser-based data persistence
- **SheetJS (xlsx)** - Excel export functionality

## Project Structure

```
jewellery-receipt-frontend/
├── index.html                  # Login page
├── dashboard.html              # Dashboard
├── create-receipt.html         # Create/view/print receipts
├── receipt-history.html        # Receipt history with filters
├── customers.html              # Customer management
├── reports.html                # Reports and analytics
├── css/
│   ├── style.css               # Main styles
│   └── receipt-print.css       # Print-specific styles
├── js/
│   ├── storage.js              # localStorage utilities
│   ├── login.js                # Login logic
│   ├── dashboard.js            # Dashboard logic
│   ├── receipt.js              # Receipt creation/editing logic
│   ├── history.js              # Receipt history logic
│   ├── customers.js            # Customer management logic
│   └── reports.js              # Reports logic
├── assets/                     # Static assets (logo placeholder)
└── README.md                   # This file
```

## Setup Instructions

### Option 1: Direct File Access (Simplest)

1. Download or clone the project files
2. Open `index.html` in your web browser
3. The application will work immediately

**Note:** Some browsers may restrict localStorage when opening files directly. If you encounter issues, use Option 2.

### Option 2: VS Code Live Server (Recommended)

1. Install VS Code: https://code.visualstudio.com/
2. Install the "Live Server" extension:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Live Server"
   - Click "Install"
3. Open the project folder in VS Code
4. Right-click on `index.html`
5. Select "Open with Live Server"
6. The application will open in your default browser

### Option 3: Any Local Web Server

You can use any local web server:

**Using Python:**
```bash
cd jewellery-receipt-frontend
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

**Using Node.js (http-server):**
```bash
npm install -g http-server
cd jewellery-receipt-frontend
http-server
```
Then open the provided URL in your browser.

## Usage Guide

### 1. Login

- Open the application in your browser
- Enter any email/username and password (demo mode)
- Click "Login"
- **Note:** This is demo authentication only. No real security.

### 2. Dashboard

- View summary statistics (total receipts, amounts, customers, etc.)
- See recent receipts
- Use filters to search receipts
- Click "Create Receipt" to add a new receipt

### 3. Creating a Receipt

1. Click "Create Receipt" from the sidebar or dashboard
2. Fill in basic information:
   - Receipt number (auto-generated)
   - Date
   - Transaction type
3. Fill in customer information:
   - Customer name
   - Mobile number
   - Address (optional)
4. Add items:
   - Click "+ Add Item" to add multiple items
   - Enter item details (name, weights, rates)
   - Calculations update automatically
5. Review totals:
   - Subtotal, CGST, SGST, Grand Total
   - Payment mode and paid amount
   - Outstanding balance calculated automatically
6. Click "Preview" to see the receipt
7. Click "Save" to store the receipt
8. Click "Print" to print the receipt

### 4. Receipt History

- View all receipts
- Use filters:
  - Search by receipt number, customer name, or mobile
  - Filter by transaction type
  - Filter by date range
  - Filter by payment status
- View, print, or delete receipts
- Export to Excel

### 5. Customer Management

- View all customers with their transaction totals
- Add new customers
- Edit existing customer details
- View customer details and receipt history
- Delete customers (only if no receipts associated)
- Export customer data to Excel

### 6. Reports

- Select date range and transaction type filters
- Click "Generate Report"
- View summary statistics
- View transaction type breakdown
- View daily summary
- Export report to Excel

### 7. Excel Export

Excel exports are available from:
- Receipt History page (all receipts)
- Customers page (customer details and totals)
- Reports page (filtered reports)

Exports generate real `.xlsx` files using SheetJS.

## Calculation Formulas

### Weight Calculations
- **Total Weight** = Fine Weight + Alloy Weight

### Making Charges
- **Making Charges** = Making Rate × Total Weight

### Item Amount
- **Amount** = (Fine Weight × Metal Rate) + Making Charges

### Tax Calculations
- **CGST Amount** = (Amount × CGST%) / 100
- **SGST Amount** = (Amount × SGST%) / 100

### Totals
- **Subtotal** = Sum of all item amounts
- **Total CGST** = Sum of all CGST amounts
- **Total SGST** = Sum of all SGST amounts
- **Grand Total** = Subtotal + Total CGST + Total SGST
- **Outstanding Balance** = Grand Total - Paid Amount

**Note:** Default tax rates are set to 1.5% for CGST and SGST. These can be adjusted per item. Tax rates should be confirmed with a tax professional for actual business use.

## Demo Data

The application includes demo data that is automatically initialized:
- 2 sample receipts
- 3 sample customers

You can clear all demo data from the Receipt History page by clicking "Clear Demo Data". This will reset the application to its initial state.

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

**Note:** Internet Explorer is not supported.

## Print Functionality

The application includes print-specific styles:
- Opens browser print dialog
- Hides navigation and UI elements during print
- Optimized for A4 paper
- Clean, professional receipt layout

## Data Persistence

All data is stored in browser localStorage:
- Receipts
- Customers
- Shop details
- User session

**Important:**
- Data persists only in the same browser
- Clearing browser data will delete all stored information
- Data is not synchronized across devices or browsers
- This is suitable for demo purposes only

## Customization

### Shop Details

Shop details can be customized by editing the `getShopDetails()` function in `js/storage.js`:
```javascript
getShopDetails() {
    return this.get(this.KEYS.SHOP_DETAILS) || {
        name: 'Your Shop Name',
        address: 'Your Address',
        city: 'City',
        state: 'State',
        pincode: 'Pincode',
        phone: 'Phone Number',
        email: 'email@example.com',
        gstin: 'GSTIN Number'
    };
}
```

### Color Scheme

The color scheme is defined in `css/style.css` under `:root`:
```css
:root {
    --primary-maroon: #800020;
    --primary-gold: #D4AF37;
    --light-gold: #F4E4BC;
    /* ... more colors */
}
```

### Transaction Types

Transaction types can be modified in the HTML files where the select dropdowns are defined (create-receipt.html, dashboard.html, etc.).

## Future Backend Integration

This frontend is structured to easily connect to a backend:

1. Replace `Storage` object methods in `js/storage.js` with API calls
2. Add authentication middleware
3. Connect to a database (MongoDB, MySQL, etc.)
4. Add server-side validation
5. Implement real user authentication
6. Add data synchronization

The current structure separates data operations in the `Storage` object, making it straightforward to replace with API calls.

## Limitations

- No real authentication (demo only)
- Data stored in browser localStorage only
- No data backup or sync
- No multi-user support
- No server-side validation
- No real-time updates
- Limited to single browser usage

## Security Considerations

**This is a demo application. Do not use for production without:**
- Implementing proper authentication
- Adding server-side validation
- Using a secure database
- Implementing HTTPS
- Adding audit logging
- Regular security updates
- Professional security review

## Troubleshooting

### Data not persisting
- Ensure you're using a modern browser
- Check that localStorage is enabled in your browser settings
- Try using a local web server instead of opening files directly

### Excel export not working
- Ensure you have an internet connection (SheetJS is loaded from CDN)
- Check browser console for errors
- Try a different browser

### Print layout issues
- Check browser print settings
- Ensure "Background graphics" is enabled in print settings
- Try different paper size settings

## License

This project is provided as-is for demonstration purposes.

## Support

For issues or questions about this demo application, please refer to the code comments or modify as needed for your specific requirements.

## Version History

- **v1.0.0** - Initial release
  - Complete frontend implementation
  - All core features functional
  - Demo data included
  - Excel export functionality
  - Print functionality
