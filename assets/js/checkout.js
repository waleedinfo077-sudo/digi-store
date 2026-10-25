(function () {
  "use strict";
  const { readData, escapeHtml, money, config, storage } = window.DigiStore;
  const params = new URLSearchParams(location.search), form = document.querySelector("#order-form");
  const alertBox = document.querySelector("#checkout-alert"), submit = document.querySelector("#submit-order");
  const submitLabel = submit.innerHTML;
  let selected;
  const setAlert = (message) => { alertBox.textContent = message; alertBox.hidden = !message; };
  const validate = () => {
    let valid = true;
    form.querySelectorAll("[required]").forEach((field) => {
      let message = "";
      if (!field.value.trim()) message = "Please fill in this field.";
      else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) message = "Enter a valid email address.";
      else if (field.name === "phone" && field.value.replace(/\D/g, "").length < 7) message = "Enter a valid phone or WhatsApp number.";
      else if (field.name === "customerName" && field.value.trim().length < 2) message = "Please enter at least two characters.";
      field.setAttribute("aria-invalid", String(Boolean(message)));
      field.parentElement.querySelector(".field-error").textContent = message;
      if (message) valid = false;
    });
    return valid;
  };
  const whatsappUrl = (order) => {
    const number = (config.OWNER_WHATSAPP || "").replace(/\D/g, "");
    const lines = [
      `Digi Store website order: ${order.orderId}`,
      `Design: ${order.designName} (${order.category})`,
      `Price: ${money(order.price)}`,
      `Customer: ${order.customerName}`,
      `Phone: ${order.phone}`,
      `Email: ${order.email}`,
      `Business: ${order.businessName || "Not provided"}`,
      `Theme: ${order.theme}`,
      `Notes: ${order.notes || "None"}`,
      `Date: ${order.date}`
    ];
    return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
  };
  readData().then(([, templates]) => {
    selected = templates.find((item) => item.id === params.get("id"));
    if (!selected) throw new Error("This design couldn’t be found. Please choose a website design before ordering.");
    document.title = `Order ${selected.name} — Digi Store`;
    document.querySelector("#summary-name").textContent = selected.name;
    document.querySelector("#summary-tagline").textContent = selected.tagline;
    document.querySelector("#summary-category").textContent = selected.categoryName;
    document.querySelector("#summary-price").textContent = money(selected.price);
    document.querySelector("#summary-thumb").innerHTML = `<img src="./${escapeHtml(selected.thumbnail)}" alt="${escapeHtml(selected.name)} design" width="800" height="500">`;
    document.querySelector("#change-design").href = `./preview.html?id=${encodeURIComponent(selected.id)}`;
    const themeSelect = document.querySelector("#theme-choice");
    (selected.paletteNames || ["Original"]).forEach((name, index) => {
      const option = document.createElement("option");
      option.value = name; option.textContent = name; if (index === 0) option.selected = true;
      themeSelect.append(option);
    });
    document.querySelector("#web3-access-key").value = config.FORM_ACCESS_KEY || "";
    document.querySelector("#email-subject").value = `Digi Store order: ${selected.name}`;
  }).catch((error) => {
    setAlert(error.message);
    submit.disabled = true;
  });
  form.addEventListener("input", (event) => {
    const field = event.target;
    if (field.hasAttribute("required")) {
      field.setAttribute("aria-invalid", "false");
      field.parentElement.querySelector(".field-error").textContent = "";
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); setAlert("");
    if (!selected) return setAlert("Please go back and choose a website design first.");
    if (!validate()) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid.focus();
      return setAlert("A couple of details need a quick check. Please review the highlighted fields.");
    }
    const now = new Date();
    const order = {
      orderId: `DS-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      customerName: form.elements.customerName.value.trim(), phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(), businessName: form.elements.businessName.value.trim(),
      category: selected.categoryName, designName: selected.name, designId: selected.id,
      price: selected.price, currency: config.CURRENCY || "PKR", theme: form.elements.theme.value,
      notes: form.elements.notes.value.trim(), date: now.toLocaleString()
    };
    if (!storage.set("digi-store-last-order", JSON.stringify(order))) {
      setAlert("Your browser blocked local storage. Allow site storage and try again, or send this order using WhatsApp.");
      submit.disabled = false;
      submit.innerHTML = submitLabel;
      if (config.FEATURES?.whatsapp !== false && (config.OWNER_WHATSAPP || "").replace(/\D/g, "")) {
        window.open(whatsappUrl(order), "_blank", "noopener,noreferrer");
      }
      return;
    }
    const orderWhatsAppUrl = whatsappUrl(order);
    let whatsappWindow = null;
    if (config.FEATURES?.whatsapp !== false && (config.OWNER_WHATSAPP || "").replace(/\D/g, "")) {
      whatsappWindow = window.open("about:blank", "_blank");
      if (whatsappWindow) whatsappWindow.opener = null;
    }
    const openWhatsAppFallback = () => {
      if (!whatsappWindow) return;
      try {
        whatsappWindow.location.replace(orderWhatsAppUrl);
      } catch (error) {
        console.error("Digi Store could not open the WhatsApp order link:", error);
      }
    };
    const provider = config.FORM_PROVIDER || "none";
    const payload = new FormData(form);
    Object.entries(order).forEach(([key, value]) => payload.set(key, String(value)));
    payload.set("message", [
      `Order ID: ${order.orderId}`, `Customer: ${order.customerName}`, `Phone: ${order.phone}`,
      `Email: ${order.email}`, `Business: ${order.businessName || "Not provided"}`,
      `Category: ${order.category}`, `Design: ${order.designName}`, `Price: ${money(order.price)}`,
      `Theme: ${order.theme}`, `Notes: ${order.notes || "None"}`, `Date: ${order.date}`
    ].join("\n"));
    submit.disabled = true; submit.innerHTML = "Sending your request…";
    let sent = false;
    try {
      if (provider === "web3forms") {
        if (!config.FORM_ACCESS_KEY) throw new Error("Email notifications are not configured yet.");
        const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: payload });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "The email service could not accept your request.");
        sent = true;
      } else if (provider === "formspree") {
        if (!config.FORM_ACCESS_KEY) throw new Error("Email notifications are not configured yet.");
        const response = await fetch(`https://formspree.io/f/${encodeURIComponent(config.FORM_ACCESS_KEY)}`, {
          method: "POST", body: payload, headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error("The email service could not accept your request.");
        sent = true;
      }
      storage.set("digi-store-notification-sent", sent ? "yes" : "no");
      openWhatsAppFallback();
      location.href = `./success.html?id=${encodeURIComponent(order.orderId)}`;
    } catch (error) {
      console.error("Digi Store order notification failed:", error);
      storage.set("digi-store-notification-sent", "no");
      openWhatsAppFallback();
      location.href = `./success.html?id=${encodeURIComponent(order.orderId)}&notice=failed`;
    }
  });
}());
