(function () {
  "use strict";
  const { readData, escapeHtml, money } = window.DigiStore;
  const id = new URLSearchParams(location.search).get("id");
  const frame = document.querySelector("#site-frame");
  const shell = document.querySelector(".frame-shell");
  const loading = document.querySelector("#frame-loading");
  const fail = (message) => {
    document.querySelector("#preview-name").textContent = "Preview unavailable";
    loading.innerHTML = `<b>${escapeHtml(message)}</b><a class="text-link" href="./templates.html">Back to designs</a>`;
  };
  frame.addEventListener("load", () => loading.classList.add("loaded"));
  readData().then(([, templates]) => {
    const item = templates.find((design) => design.id === id);
    if (!item) throw new Error("We couldn’t find that design. Choose another from the collection.");
    const sameCategory = templates.filter((design) => design.category === item.category && design.id !== item.id);
    document.title = `${item.name} — Live Preview | Digi Store`;
    document.querySelector("#preview-name").textContent = item.name;
    document.querySelector("#preview-category").textContent = item.categoryName;
    document.querySelector("#info-name").textContent = item.name;
    document.querySelector("#info-tagline").textContent = item.tagline;
    document.querySelector("#info-price").textContent = money(item.price);
    document.querySelector("#info-category").textContent = item.categoryName;
    document.querySelector("#includes-list").innerHTML = item.includes.map((value) => `<li>${escapeHtml(value)}</li>`).join("");
    document.querySelector("#pages-list").innerHTML = item.pagesIncluded.map((value) => `<span class="detail-chip">${escapeHtml(value)}</span>`).join("");
    document.querySelector("#features-list").innerHTML = item.features.map((value) => `<span class="detail-chip">${escapeHtml(value)}</span>`).join("");
    document.querySelector("#delivery-time").textContent = item.deliveryTime || window.DigiStore.config.DELIVERY_TIME_TEXT;
    document.querySelector("#other-designs").innerHTML = sameCategory.map((other) => `<a class="other-design-link" href="./preview.html?id=${encodeURIComponent(other.id)}"><span style="--other-color:${escapeHtml(other.colors[0])}">${escapeHtml(other.name.slice(0, 1))}</span>${escapeHtml(other.name)} <b>↗</b></a>`).join("");
    document.querySelector("#order-button").href = `./checkout.html?id=${encodeURIComponent(item.id)}`;
    const previewUrl = `./${item.previewPath}`;
    frame.src = previewUrl;
    document.querySelector("#new-tab-link").href = previewUrl;
    const palette = item.palettes || [item.colors];
    document.querySelector("#palette-controls").innerHTML = palette.map((colors, index) => `<button class="palette-swatch${index === 0 ? " active" : ""}" type="button" aria-label="Apply ${escapeHtml(item.paletteNames[index] || `color theme ${index + 1}`)}" title="${escapeHtml(item.paletteNames[index] || `Theme ${index + 1}`)}" style="background:${escapeHtml(colors[0])}" data-palette='${JSON.stringify(colors)}'></button>`).join("");
    document.querySelectorAll(".palette-swatch").forEach((button) => button.addEventListener("click", () => {
      document.querySelectorAll(".palette-swatch").forEach((swatch) => swatch.classList.remove("active"));
      button.classList.add("active");
      frame.contentWindow.postMessage({ type: "digi-store-theme", colors: JSON.parse(button.dataset.palette) }, location.origin);
    }));
    document.querySelectorAll("[data-device]").forEach((button) => button.addEventListener("click", () => {
      document.querySelectorAll("[data-device]").forEach((device) => device.classList.toggle("active", device === button));
      shell.classList.remove("device-tablet", "device-mobile");
      if (button.dataset.device !== "desktop") shell.classList.add(`device-${button.dataset.device}`);
    }));
  }).catch((error) => fail(error.message));
  document.querySelector("#fullscreen-button").addEventListener("click", () => {
    if (!frame.requestFullscreen) {
      document.querySelector("#preview-status").textContent = "Fullscreen preview is not available in this browser.";
      return;
    }
    frame.requestFullscreen().catch((error) => {
      console.error("Digi Store could not open the preview in fullscreen:", error);
      document.querySelector("#preview-status").textContent = "Fullscreen preview could not be opened. You can use Open in new tab instead.";
    });
  });
  document.querySelector("#info-toggle").addEventListener("click", (event) => {
    const isCollapsed = document.querySelector("#preview-info").classList.toggle("collapsed");
    event.currentTarget.setAttribute("aria-expanded", String(!isCollapsed));
  });
}());
