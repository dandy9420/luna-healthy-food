const fs = require("fs");
const path = "index.html";
const tag = '<script src="/luna-overrides.js"></script>';
let html = fs.readFileSync(path, "utf8");

// Remove Wellness Journal at build time.
html = html.replace(
  /\s*<section class="section" style="padding-top:28px;">\s*<div class="section-head"><div><h2>Luna Wellness Journal<\/h2><p class="small-note" style="padding:4px 0 0;">Simple tips for a healthier everyday life\.<\/p><\/div><\/div>\s*<div class="wellness-carousel" id="wellness-carousel"><\/div>\s*<\/section>\s*/,
  "\n"
);

// Delivery belongs to Checkout, never Cart.
html = html.replace(
  /\s*<div id="delivery-field">[\s\S]*?<\/div>\s*\n\s*<div class="hairline">/,
  '\n        <div class="hairline">'
);

// Remove legacy Order type from Checkout.
html = html.replace(
  /\s*<div class="field"><label>Order type<\/label>[\s\S]*?<\/div>\s*\n\s*<div class="field" id="ck-delivery-info">/,
  '\n        <div class="field" id="ck-delivery-info">'
);

// Replace legacy checkout gate.
html = html.replace(
  /function goToCheckout\(\)\{[\s\S]*?\n\}\nfunction backToCart\(\)/,
  'function goToCheckout(){\n  if(cart.length===0) return;\n  const checkoutLink=document.getElementById("ck-maps-link");\n  if(checkoutLink) checkoutLink.value="";\n  const name=document.getElementById("ck-name");\n  const phone=document.getElementById("ck-phone");\n  if(name) name.value="";\n  if(phone) phone.value="";\n  const subtotal=document.getElementById("ck-subtotal");\n  if(subtotal) subtotal.textContent=fmtPrice(cartSubtotal());\n  const deliveryInfo=document.getElementById("ck-delivery-info");\n  if(deliveryInfo) deliveryInfo.style.display="none";\n  const confirm=document.getElementById("ck-confirm-btn");\n  if(confirm){\n    confirm.textContent="Order via WhatsApp";\n    confirm.setAttribute("onclick","confirmOrderViaWhatsApp()");\n    confirm.disabled=true;\n    confirm.style.opacity="0.55";\n  }\n  deliveryLoc={address:"",mapsLink:"",lat:null,lng:null,distanceKm:null,fee:null};\n  updateDeliverySummary();\n  showOrderSub("checkout");\n  if(typeof setupCheckoutFlow==="function") setupCheckoutFlow();\n}\nfunction backToCart()'
);

// Safety fallback for any remaining legacy field.
html = html.replace(/<div id="delivery-field">/, '<div id="delivery-field" style="display:none !important;">');

if (!html.includes(tag)) {
  html = html.replace("</body>", tag + "\n" + flow + "\n</body>");
} else if (!html.includes(flow)) {
  html = html.replace(tag, tag + "\n" + flow);
}

fs.writeFileSync(path, html);
