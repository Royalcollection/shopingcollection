/**
 * ROYAL COLLECTION — FREE ORDER BACKEND
 *
 * 1) Create a Google Sheet.
 * 2) Extensions → Apps Script.
 * 3) Paste this whole file.
 * 4) Run setupRoyalCollection() once and allow permissions.
 * 5) Deploy → New deployment → Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 * 6) Copy the /exec URL and paste it into app.js:
 *    ORDER_CONFIG.googleSheetEndpoint = "YOUR_EXEC_URL";
 *
 * The script creates:
 *   Orders   = every submitted order
 *   Products = simple inventory table for future use
 *   Settings = connection/setup notes
 *
 * Payment screenshots are stored in a Google Drive folder.
 */

const SHEET_ORDERS = "Orders";
const SHEET_PRODUCTS = "Products";
const SHEET_SETTINGS = "Settings";
const DRIVE_FOLDER_NAME = "Royal Collection Payment Screenshots";

function setupRoyalCollection() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const orders = getOrCreateSheet_(ss, SHEET_ORDERS);
  if (orders.getLastRow() === 0) {
    orders.appendRow([
      "Order ID","Created At","Customer Name","Mobile","Email",
      "Address","Area","City","State","Pincode",
      "Items","Amount","UTR","Payment Status","Order Status",
      "Screenshot","Instagram","Notes"
    ]);
    orders.setFrozenRows(1);
  }

  const products = getOrCreateSheet_(ss, SHEET_PRODUCTS);
  if (products.getLastRow() === 0) {
    products.appendRow(["Product ID","Product Name","Category","Price","Stock","Size","Active"]);
    products.setFrozenRows(1);
  }

  const settings = getOrCreateSheet_(ss, SHEET_SETTINGS);
  settings.clear();
  settings.getRange(1,1,4,2).setValues([
    ["Setting","Value"],
    ["Backend","Royal Collection Order Backend"],
    ["Screenshot Folder",getOrCreateDriveFolder_().getUrl()],
    ["Created",new Date()]
  ]);

  orders.autoResizeColumns(1,18);
  products.autoResizeColumns(1,7);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ok:true,service:"Royal Collection Order Backend"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "";
    if (!raw) throw new Error("Empty request");

    const order = JSON.parse(raw);
    validateOrder_(order);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreateSheet_(ss, SHEET_ORDERS);
    const customer = order.customer || {};
    const address = [customer.house, customer.street].filter(Boolean).join(", ");

    let screenshotUrl = "";
    if (order.paymentScreenshot && order.paymentScreenshot.dataUrl) {
      screenshotUrl = saveScreenshot_(
        order.paymentScreenshot.dataUrl,
        order.paymentScreenshot.fileName || (order.orderId + ".png"),
        order.paymentScreenshot.mimeType || "image/png",
        order.orderId
      );
    }

    const itemText = (order.items || []).map(function(item) {
      return item.name + " x" + item.quantity + " = ₹" + item.lineTotal;
    }).join(" | ");

    sheet.appendRow([
      order.orderId,
      new Date(order.createdAt || new Date()),
      customer.name || "",
      customer.phone || "",
      customer.email || "",
      address,
      customer.area || "",
      customer.city || "",
      customer.state || "",
      customer.pincode || "",
      itemText,
      order.amount || 0,
      order.utr || "",
      "Under Verification",
      "New",
      screenshotUrl,
      order.instagramUrl || "",
      ""
    ]);

    return json_({ok:true,orderId:order.orderId,screenshotUrl:screenshotUrl});
  } catch (err) {
    return json_({ok:false,error:String(err)});
  }
}

function validateOrder_(order) {
  if (!order.orderId) throw new Error("Missing order ID");
  if (!order.customer || !order.customer.name) throw new Error("Missing customer");
  if (!order.customer.phone) throw new Error("Missing phone");
  if (!order.items || !order.items.length) throw new Error("No items");
  if (!order.amount) throw new Error("Missing amount");
  if (!order.utr) throw new Error("Missing UTR");
}

function saveScreenshot_(dataUrl, fileName, mimeType, orderId) {
  const folder = getOrCreateDriveFolder_();
  const comma = dataUrl.indexOf(",");
  if (comma < 0) throw new Error("Invalid screenshot data");

  const base64 = dataUrl.substring(comma + 1);
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, mimeType, orderId + "_" + fileName);
  const file = folder.createFile(blob);
  return file.getUrl();
}

function getOrCreateDriveFolder_() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
