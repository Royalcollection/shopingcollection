/*
 * ROYAL COLLECTION ORDER CONNECTION
 * After creating the Google Apps Script Web App, paste its /exec URL below.
 * Leave it blank while testing locally.
 */
const ORDER_CONFIG = {
  googleSheetEndpoint: "",
  shopName: "Royal Collection",
  instagramUrl: "https://ig.me/m/royalcollection.inn"
};

const DEMO_PRODUCTS = [
  {id:"RC001",name:"Anti-Tarnish Bracelet 01",category:"Bracelets",price:299,stock:1,emoji:"💎",size:"Free Size",image:"anti_tarnish_bracelet_01.png",images:["anti_tarnish_bracelet_01.png"],description:"A sleek silver-tone anti-tarnish bracelet with a clean circular band and subtle decorative detailing. A simple, polished choice for everyday styling or gifting."},
  {id:"RC002",name:"Anti-Tarnish Bracelet 02",category:"Bracelets",price:299,stock:1,emoji:"✨",size:"Free Size",image:"anti_tarnish_bracelet_02.png",images:["anti_tarnish_bracelet_02.png"],description:"A graceful silver-tone bracelet featuring a detailed leaf-inspired centre design with stone-like accents. Its elegant look makes it suitable for everyday wear and special occasions."},
  {id:"RC003",name:"Anti-Tarnish Bracelet 03",category:"Bracelets",price:299,stock:1,emoji:"💛",size:"Free Size",image:"anti_tarnish_bracelet_03.png",images:["anti_tarnish_bracelet_03.png"],description:"A stylish gold-tone bracelet with a heart, cross and geometric charm-inspired centre design. A thoughtful pick for gifting or adding a statement touch to an outfit."}
];

let products = JSON.parse(localStorage.getItem("rc_products_v2") || "null") || DEMO_PRODUCTS;
let cart = JSON.parse(localStorage.getItem("rc_cart_v2") || "{}");
let activeCategory = "All";
let customerDraft = null;

const money = n => `₹${Number(n).toLocaleString("en-IN")}`;
const save = () => { localStorage.setItem("rc_products_v2", JSON.stringify(products)); localStorage.setItem("rc_cart_v2", JSON.stringify(cart)); };
const total = () => Object.entries(cart).reduce((s,[id,q]) => { const p=products.find(x=>x.id===id); return s+(p?p.price*q:0)},0);
const count = () => Object.values(cart).reduce((a,b)=>a+b,0);

function renderCategories(){
  const cats=["All",...new Set(products.map(p=>p.category))];
  document.getElementById("categories").innerHTML=cats.map(c=>`<button class="${c===activeCategory?'active':''}" data-cat="${c}">${c}</button>`).join("");
  document.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;renderCategories();renderProducts();});
}
function renderProducts(){
  const q=document.getElementById("search").value.trim().toLowerCase();
  const list=products.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&p.name.toLowerCase().includes(q));
  document.getElementById("productGrid").innerHTML=list.map(p=>`
    <article class="product" onclick="openProduct('${p.id}')">
      <div class="product-image">${p.image?`<img src="${p.image}" alt="${escapeHtml(p.name)}">`:`<span>${p.emoji||"💎"}</span>`}</div>
      <div class="product-body">
        <h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category)} • ${escapeHtml(p.size||"Free Size")}</p>
        <div class="price">${money(p.price)}</div><div class="stock">${p.stock>0?`${p.stock} available`:"Currently unavailable"}</div>
        <button class="btn primary" ${p.stock===0?"disabled":""} onclick="event.stopPropagation();addToCart('${p.id}')">${p.stock===0?"Sold Out":"Add to Cart"}</button>
      </div>
    </article>`).join("");
  document.getElementById("emptyState").classList.toggle("hidden",list.length>0);
}

let currentProductImages = [];
let currentProductImageIndex = 0;

function openProduct(id){
  const p=products.find(x=>x.id===id);
  if(!p)return;
  currentProductImages = (p.images && p.images.length) ? p.images : (p.image ? [p.image] : []);
  currentProductImageIndex = 0;
  renderProductDetail(p);
  document.getElementById("productModal").classList.remove("hidden");
}

function renderProductDetail(p){
  const image = currentProductImages[currentProductImageIndex];
  const hasMultiple = currentProductImages.length > 1;
  document.getElementById("productDetail").innerHTML=`
    <div class="product-detail-media">
      ${image ? `<img id="detailProductImage" src="${image}" alt="${escapeHtml(p.name)}">` : `<div>${p.emoji||"💎"}</div>`}
      ${hasMultiple ? `
        <button class="slider-btn slider-prev" onclick="changeProductImage(-1)" aria-label="Previous photo">‹</button>
        <button class="slider-btn slider-next" onclick="changeProductImage(1)" aria-label="Next photo">›</button>
        <div class="slider-dots">${currentProductImages.map((_,i)=>`<button class="slider-dot ${i===currentProductImageIndex?"active":""}" onclick="setProductImage(${i})" aria-label="Photo ${i+1}"></button>`).join("")}</div>
      ` : ""}
    </div>
    <div class="product-detail-info">
      <p class="eyebrow">${escapeHtml(p.category)}</p>
      <h2>${escapeHtml(p.name)}</h2>
      <div class="detail-price">${money(p.price)}</div>
      <p class="detail-meta">${escapeHtml(p.size||"Free Size")} • ${p.stock>0?`${p.stock} available`:"Currently unavailable"}</p>
      <h3>About this product</h3>
      <p class="detail-description">${escapeHtml(p.description||"A stylish artificial jewellery piece selected by Royal Collection.")}</p>
      <button class="btn primary full" ${p.stock===0?"disabled":""} onclick="addToCartFromDetail('${p.id}')">${p.stock===0?"Currently Unavailable":"Add to Cart"}</button>
    </div>`;
}

function changeProductImage(direction){
  if(currentProductImages.length < 2)return;
  currentProductImageIndex=(currentProductImageIndex+direction+currentProductImages.length)%currentProductImages.length;
  const p=products.find(x=>x.images?.includes(currentProductImages[0]) || x.image===currentProductImages[0]);
  if(p) renderProductDetail(p);
}

function setProductImage(index){
  if(index<0 || index>=currentProductImages.length)return;
  currentProductImageIndex=index;
  const p=products.find(x=>x.images?.includes(currentProductImages[0]) || x.image===currentProductImages[0]);
  if(p) renderProductDetail(p);
}

function closeProduct(){document.getElementById("productModal").classList.add("hidden")}
function addToCartFromDetail(id){closeProduct();addToCart(id)}

function renderCart(){
  document.getElementById("cartCount").textContent=count();
  const el=document.getElementById("cartItems");
  const entries=Object.entries(cart).filter(([id])=>products.some(p=>p.id===id));
  if(!entries.length){el.innerHTML='<div class="empty-state">Your cart is empty.<br><br>Find something special.</div>'}
  else el.innerHTML=entries.map(([id,q])=>{const p=products.find(x=>x.id===id);return `<div class="cart-line"><div class="thumb">${p.image?`<img src="${p.image}" alt="${escapeHtml(p.name)}">`:(p.emoji||"💎")}</div><div><strong>${escapeHtml(p.name)}</strong><div class="muted">${money(p.price)} each</div><div class="qty"><button onclick="changeQty('${id}',-1)">−</button><span>${q}</span><button onclick="changeQty('${id}',1)">+</button></div></div><strong>${money(p.price*q)}</strong></div>`}).join("");
  document.getElementById("cartTotal").textContent=money(total());
}
function addToCart(id){const p=products.find(x=>x.id===id);if(!p||p.stock<1)return;cart[id]=Math.min((cart[id]||0)+1,p.stock);save();renderCart();openCart();}
function changeQty(id,d){const p=products.find(x=>x.id===id);if(!p)return;cart[id]=(cart[id]||0)+d;if(cart[id]<=0)delete cart[id];else cart[id]=Math.min(cart[id],p.stock);save();renderCart();}
function openCart(){document.getElementById("cartDrawer").classList.add("open");document.getElementById("overlay").classList.remove("hidden")}
function closeCart(){document.getElementById("cartDrawer").classList.remove("open");document.getElementById("overlay").classList.add("hidden")}
function openCheckout(){
  if(!count()){alert("Your cart is empty.");return}
  closeCart();
  document.getElementById("checkoutModal").classList.remove("hidden");
  document.getElementById("checkoutStep1").classList.remove("hidden");
  document.getElementById("checkoutStep2").classList.add("hidden");
  document.getElementById("orderSuccess").classList.add("hidden");
  document.getElementById("checkoutSummary").innerHTML=`
    <div class="summary-title">Order Summary</div>
    ${Object.entries(cart).map(([id,q])=>{const p=products.find(x=>x.id===id);return `
      <div class="checkout-item">
        <div class="checkout-item-photo">${p.image?`<img src="${p.image}" alt="${escapeHtml(p.name)}">`:(p.emoji||"💎")}</div>
        <div class="checkout-item-info"><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.size||"Free Size")} • Qty ${q}</span></div>
        <strong>${money(p.price*q)}</strong>
      </div>`}).join("")}
    <div class="summary-total"><span>Total</span><strong>${money(total())}</strong></div>`;
}
function closeCheckout(){document.getElementById("checkoutModal").classList.add("hidden")}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function generateOrderId(){const n=Number(localStorage.getItem("rc_order_no")||1000)+1;localStorage.setItem("rc_order_no",n);return "RC"+n;}

document.getElementById("search").addEventListener("input",renderProducts);
document.getElementById("openCart").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
document.getElementById("overlay").onclick=closeCart;
document.getElementById("checkoutBtn").onclick=openCheckout;
document.getElementById("closeCheckout").onclick=closeCheckout;
document.querySelectorAll("[data-category-link]").forEach(a=>a.onclick=()=>{activeCategory="Hampers";renderCategories();renderProducts();});
document.getElementById("checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();
  const data=Object.fromEntries(new FormData(e.target).entries());
  const phone=String(data.phone).replace(/\D/g,"");
  const pincode=String(data.pincode).replace(/\D/g,"");
  if(phone.length!==10){alert("Please enter a valid 10-digit mobile number.");return}
  if(pincode.length!==6){alert("Please enter a valid 6-digit pincode.");return}
  customerDraft=data;
  document.getElementById("payAmount").textContent=money(total());
  document.getElementById("checkoutStep1").classList.add("hidden");
  document.getElementById("checkoutStep2").classList.remove("hidden");
});
document.getElementById("paymentScreenshot").addEventListener("change",e=>{
  const file=e.target.files[0];
  const box=document.getElementById("screenshotPreview");
  const img=document.getElementById("screenshotPreviewImg");
  if(!file){box.classList.add("hidden");return}
  if(!file.type.startsWith("image/")){alert("Please select an image file.");e.target.value="";box.classList.add("hidden");return}
  img.src=URL.createObjectURL(file);
  box.classList.remove("hidden");
});
async function fileToDataUrl(file){
  return await new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

async function submitOrderToGoogle(order){
  if(!ORDER_CONFIG.googleSheetEndpoint) return {connected:false};
  try{
    const response=await fetch(ORDER_CONFIG.googleSheetEndpoint,{
      method:"POST",
      mode:"no-cors",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify(order)
    });
    return {connected:true};
  }catch(err){
    console.error("Order connection failed:",err);
    return {connected:false,error:String(err)};
  }
}

document.getElementById("paymentForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const form=new FormData(e.target);
  const file=form.get("screenshot");
  const utr=String(form.get("utr")||"").trim();
  if(!utr){alert("Please enter the UTR / transaction reference.");return}
  if(!(file instanceof File) || !file.size){alert("Please upload your payment screenshot.");return}
  if(file.size>3*1024*1024){alert("Please upload a screenshot smaller than 3 MB.");return}

  const orderId=generateOrderId();
  const items=Object.entries(cart).map(([id,q])=>{
    const p=products.find(x=>x.id===id);
    return {productId:id,name:p?.name||id,quantity:q,unitPrice:p?.price||0,lineTotal:(p?.price||0)*q};
  });

  const screenshot=await fileToDataUrl(file);
  const order={
    orderId,
    shopName:ORDER_CONFIG.shopName,
    customer:customerDraft,
    items,
    amount:total(),
    utr,
    paymentStatus:"Under Verification",
    orderStatus:"New",
    createdAt:new Date().toISOString(),
    instagramUrl:ORDER_CONFIG.instagramUrl,
    paymentScreenshot:{
      fileName:file.name,
      mimeType:file.type,
      dataUrl:screenshot
    }
  };

  // Always keep a local backup for this browser.
  const orders=JSON.parse(localStorage.getItem("rc_orders")||"[]");
  orders.push(order);
  localStorage.setItem("rc_orders",JSON.stringify(orders));

  // Send to Google Sheets + Google Drive when the endpoint is configured.
  order.syncedToGoogle=false;

  Object.entries(cart).forEach(([id,q])=>{
    const p=products.find(x=>x.id===id);
    if(p)p.stock=Math.max(0,p.stock-q)
  });
  cart={};save();renderProducts();renderCart();

  document.getElementById("checkoutStep2").classList.add("hidden");
  document.getElementById("orderSuccess").classList.remove("hidden");
  document.getElementById("successOrderId").textContent=orderId;

  // Make the success-page WhatsApp button carry the order reference.
  const successLinks=document.querySelectorAll("#orderSuccess a");
  const instagramLink=Array.from(successLinks).find(a=>/instagram/i.test(a.textContent||""));
  if(instagramLink){ instagramLink.href=ORDER_CONFIG.instagramUrl; instagramLink.target="_blank"; instagramLink.rel="noopener"; }
  const wa=Array.from(successLinks).find(a=>/whatsapp/i.test(a.textContent||""));
  if(wa){
    const text=`Hello Royal Collection, I have placed order ${orderId}. Amount: ${money(order.amount)}. UTR: ${utr}.`;
    wa.href=`https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  if(!connection.connected && ORDER_CONFIG.googleSheetEndpoint){
    alert("Order saved on this device, but the Google Sheet connection could not be confirmed. Please check the Apps Script endpoint.");
  }
});
document.getElementById("year").textContent=new Date().getFullYear();
document.getElementById("closeProduct").onclick=closeProduct;
renderCategories();renderProducts();renderCart();
