NOVA STORE - NEW FRONTEND

Files:
- index.html
- products.html
- cart.html
- checkout.html
- success.html
- cancel.html
- about.html
- contact.html
- config.js
- products.js
- app.js
- style.css

The frontend is configured to call the new Google Apps Script /exec endpoint supplied by the owner.

IMPORTANT:
1. Never put PAYMONGO_SECRET_KEY in frontend files.
2. The Google Apps Script backend must have PAYMONGO_SECRET_KEY in Script Properties.
3. The backend should also have FRONTEND_URL configured to the deployed frontend URL for PayMongo success/cancel redirects.
4. Product prices shown in the frontend are for display only. The backend remains authoritative for checkout totals.
