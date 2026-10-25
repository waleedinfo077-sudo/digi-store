(function () {
  "use strict";
  const { config, money, escapeHtml, storage } = window.DigiStore;
  const raw = storage.get("digi-store-last-order");
  const order = raw ? JSON.parse(raw) : null;
  const fromUrl = new URLSearchParams(location.search);
  if (!order) {
    document.querySelector(".success-card").innerHTML = `<div class="success-mark">✳</div><span class="eyebrow">No saved order found</span><h1>Let’s start<br><span>with a design.</span></h1><p class="success-lead">Choose a website to begin your order with Digi Store.</p><a class="button button-wide" href="./templates.html">Explore website designs ↗</a>`;
    return;
  }
  document.querySelector("#success-order-id").textContent = order.orderId;
  document.querySelector("#success-design").textContent = order.designName;
  document.querySelector("#success-price").textContent = money(order.price);
  const nextStep = config.SUPPORT_TEXT || "We’ll contact you to confirm the details and arrange payment.";
  document.querySelector("#payment-copy").textContent = `${nextStep} Delivery estimate: ${config.DELIVERY_TIME_TEXT || "to be confirmed."}`;
  const methods = Object.entries(config.PAYMENT_METHODS || {}).filter(([, value]) => value);
  document.querySelector("#payment-methods").innerHTML = methods.map(([method, details]) => `<span class="payment-method"><b>${escapeHtml(method)}</b>: ${escapeHtml(details)}</span>`).join("");
  const link = document.querySelector("#whatsapp-link");
  const number = (config.OWNER_WHATSAPP || "").replace(/\D/g, "");
  const whatsappText = [
    `Digi Store website order: ${order.orderId}`, `Design: ${order.designName} (${order.category})`,
    `Price: ${money(order.price)}`, `Customer: ${order.customerName}`, `Phone: ${order.phone}`,
    `Email: ${order.email}`, `Business: ${order.businessName || "Not provided"}`,
    `Theme: ${order.theme}`, `Notes: ${order.notes || "None"}`, `Date: ${order.date}`
  ].join("\n");
  link.href = `https://wa.me/${number}?text=${encodeURIComponent(whatsappText)}`;
  if (config.FEATURES?.whatsapp === false || !number) {
    link.hidden = true;
    document.querySelector("#notification-note").textContent = "WhatsApp sharing is not configured. Your order details are saved in this browser.";
  } else if (fromUrl.get("notice") === "failed" || storage.get("digi-store-notification-sent") !== "yes") {
    document.querySelector("#notification-note").textContent = "Email notification could not be confirmed. Please send the order using the WhatsApp button so we can follow up.";
  } else {
    document.querySelector("#notification-note").textContent = "Your order notification was sent. You can also share the details on WhatsApp.";
  }
}());
