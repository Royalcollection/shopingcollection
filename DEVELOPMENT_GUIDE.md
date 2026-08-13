# Royal Collection — Free MVP Development Plan

## What is already built in this test version

Customer side:
1. Home / Shop
2. Categories
3. Search
4. Product cards
5. Product detail modal
6. Multiple-photo slider (future-ready)
7. Add to cart
8. Quantity controls limited by stock
9. Checkout
10. Customer address
11. Exact order total
12. Demo UPI QR payment page
13. UTR / transaction reference
14. Payment screenshot upload + preview
15. Instagram / WhatsApp handoff
16. Order confirmation + order ID
17. Stock decreases after successful test order

Admin side:
1. Product count / stock / order-value dashboard
2. Add product with multiple photos
3. Automatic image resizing for browser storage
4. Category, price, size, stock, description
5. Edit stock
6. Edit price
7. Remove product
8. Search catalogue
9. Order list
10. Payment status: Under Verification / Verified / Rejected
11. Order status: New / Packed / Shipped / Delivered / Cancelled
12. View uploaded payment screenshot for local test orders
13. Export orders to CSV
14. Backup and restore store data
15. Google Sheets backend setup prepared but not connected

## How the prototype works

This version is intentionally free and uses browser localStorage. It lets us prove the shopping journey before spending money or connecting accounts.

Important limitation: localStorage is per browser/device. It is NOT a central production database. A customer placing an order on their phone will not automatically appear in your admin browser.

## Final production architecture

Customer website (free static hosting)
        |
        v
Google Apps Script Web App
        |
        +--> Google Sheet (orders / inventory)
        |
        +--> Google Drive (payment screenshots)

The real PhonePe QR is added only after the website flow is approved.

## Recommended build order

Phase A — TEST (current)
- Test all screens
- Test mobile
- Test cart and stock
- Test checkout
- Test screenshot upload
- Test admin status changes
- Test backup/export

Phase B — CONNECT
- Create Google Sheet
- Deploy Apps Script
- Paste /exec URL into app.js
- Test a real order end-to-end

Phase C — REAL CATALOGUE
- Add all products
- Add multiple photos per product
- Add videos where useful
- Add correct categories
- Add exact stock
- Add exact price and margin

Phase D — LIVE
- Replace demo QR with real PhonePe QR
- Publish on free hosting
- Connect custom domain later if desired
- Test on Android/iPhone
- Start accepting real orders

## Important business safeguards

- Do not store UPI PINs, bank passwords or sensitive banking credentials in the website.
- Payment status should remain "Under Verification" until you verify the payment.
- Keep COD disabled unless you intentionally add it later.
- Keep delivery included in the listed product price as planned.
- Do not claim "anti-tarnish" beyond what the seller can actually support; product descriptions should match the actual product.
