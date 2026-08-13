# Royal Collection — GitHub + Google Sheets Test Setup

## PART A — Upload the website to GitHub Pages

### 1. Create a GitHub repository
- Sign in to GitHub.
- Click **New repository**.
- Repository name: `royal-collection`
- Choose **Public**.
- Create the repository.

### 2. Upload the website files
Upload these files/folders from this package to the repository root:

- `index.html`
- `admin.html`
- `app.js`
- `styles.css`
- `logo.png`
- `anti_tarnish_bracelet_01.png`
- `anti_tarnish_bracelet_02.png`
- `anti_tarnish_bracelet_03.png`
- `demo-payment-qr.svg`

Also upload `Google_Apps_Script_Backend.gs` and this guide if you want to keep your setup files in the repository. They are not required for the customer website to load.

IMPORTANT: Keep `index.html` in the repository root.

### 3. Turn on GitHub Pages
In the repository:
- Open **Settings**
- Open **Pages**
- Under **Build and deployment**, choose **Deploy from a branch**
- Branch: `main`
- Folder: `/ (root)`
- Click **Save**

GitHub will give you a public address similar to:

`https://YOUR-GITHUB-USERNAME.github.io/royal-collection/`

Open that address.

### 4. Test the admin page
The admin page is:

`https://YOUR-GITHUB-USERNAME.github.io/royal-collection/admin.html`

The demo store and admin page use the same browser storage when opened from the same GitHub Pages site.

---

# PART B — Connect Google Sheets

This is a one-time setup.

## 1. Create the Google Sheet

Create a new Google Sheet, for example:

**Royal Collection Orders**

You do NOT need to manually create the columns.

## 2. Open Apps Script

Inside the Google Sheet:

**Extensions → Apps Script**

Delete the default code.

Open the file:

`Google_Apps_Script_Backend.gs`

from this package and copy all of it into Apps Script.

Click **Save**.

## 3. Run setup once

At the top of Apps Script, choose:

`setupRoyalCollection`

Then click **Run**.

Google will ask you to authorize the script.

Approve the permissions.

After it runs, your spreadsheet will contain:

- `Orders`
- `Products`
- `Settings`

The script also creates a Google Drive folder:

**Royal Collection Payment Screenshots**

## 4. Deploy the backend

In Apps Script:

**Deploy → New deployment**

Choose:

**Web app**

Use:

- Execute as: **Me**
- Who has access: **Anyone**

Click **Deploy**.

Copy the URL ending in:

`/exec`

Example:

`https://script.google.com/macros/s/XXXXXXXXXXXX/exec`

Do NOT use the `/dev` URL.

## 5. Put the URL into the website

Open `app.js`.

At the very top you will see:

`googleSheetEndpoint: ""`

Change it to:

`googleSheetEndpoint: "YOUR_EXEC_URL"`

For example:

`googleSheetEndpoint: "https://script.google.com/macros/s/XXXXXXXXXXXX/exec"`

Save the file.

## 6. Upload the changed app.js to GitHub

Replace the old `app.js` in your GitHub repository with the updated one.

Wait a few seconds for GitHub Pages to publish the change.

---

# PART C — Test the complete system

Open your public website.

### Customer test

1. Open a product.
2. Click **Add to Cart**.
3. Open Cart.
4. Proceed to Checkout.
5. Enter test customer details.
6. Continue to Payment.
7. Use the demo QR only for testing — DO NOT send real money to the demo QR.
8. Enter a test UTR such as `TEST123456`.
9. Upload a test image as the payment screenshot.
10. Submit the order.

You should see an order confirmation such as:

`RC1001`

### Check the admin

Open:

`https://YOUR-GITHUB-USERNAME.github.io/royal-collection/admin.html`

The order should appear.

Try changing:

**Payment**
- Under Verification
- Verified
- Rejected

and:

**Order**
- New
- Packed
- Shipped
- Delivered
- Cancelled

### Check Google Sheets

Open your Google Sheet.

The order should appear in the `Orders` tab.

The payment screenshot should appear in:

**Google Drive → Royal Collection Payment Screenshots**

---

# IMPORTANT — Before going live

The QR inside this test website is a DEMO QR.

Do NOT use it for real customer payments.

Before launch we will replace it with your real PhonePe QR.

Also, this test version stores browser-side orders in localStorage and sends them to Google Sheets only after the Apps Script endpoint is configured. The Google Sheet becomes the business record after connection.

Do not put:
- UPI PIN
- bank password
- OTP
- private banking credentials

inside the website.

---

# Free hosting

For this test, GitHub Pages is enough.

You do not need to buy:
- hosting
- a domain
- Shopify
- WooCommerce
- a paid e-commerce platform

A custom domain can be added later if you decide the business is working well.

---

# Recommended test order

Test with the three existing bracelets first.

Do NOT add the full catalogue until these work:

Website
→ Product
→ Cart
→ Address
→ Payment
→ Screenshot
→ Confirmation
→ Admin
→ Google Sheet
→ Google Drive

Once this entire chain works, we can safely start adding the real Royal Collection products.
