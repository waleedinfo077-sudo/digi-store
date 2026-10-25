(function () {
  "use strict";
  const config = window.DIGI_STORE_CONFIG || {};
  const money = (amount) => `${config.CURRENCY_SYMBOL || "Rs"} ${Number(amount || 0).toLocaleString("en-PK")}`;
  const escapeHtml = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  const storage = {
    get(key) {
      try { return window.localStorage.getItem(key); }
      catch (error) { console.error("Digi Store could not read local storage:", error); }
      try { return window.sessionStorage.getItem(key); }
      catch (error) { console.error("Digi Store could not read session storage:", error); return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); return true; }
      catch (error) { console.error("Digi Store could not write local storage:", error); }
      try { window.sessionStorage.setItem(key, value); return true; }
      catch (error) { console.error("Digi Store could not write session storage:", error); return false; }
    }
  };
  window.DigiStore = { config, money, escapeHtml, storage };

  const savedTheme = storage.get("digi-store-theme");
  if (config.FEATURES?.darkMode !== false && savedTheme === "dark") document.body.classList.add("dark-mode");
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      storage.set("digi-store-theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    });
  });
  const menuToggle = document.querySelector(".menu-toggle");
  if (menuToggle) menuToggle.addEventListener("click", () => {
    const nav = document.querySelector(".main-nav");
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = String(new Date().getFullYear()); });

  const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 }) : null;
  document.querySelectorAll(".reveal").forEach((node) => revealObserver ? revealObserver.observe(node) : node.classList.add("is-visible"));

  async function readData() {
    const [categoryResponse, templateResponse] = await Promise.all([
      fetch("./categories.json"), fetch("./templates.json")
    ]);
    if (!categoryResponse.ok || !templateResponse.ok) throw new Error("The Digi Store catalog could not be loaded.");
    return Promise.all([categoryResponse.json(), templateResponse.json()]);
  }
  function categoryCard(category) {
    return `<a class="category-card" style="--category-color:${escapeHtml(category.color)}" href="./templates.html?category=${encodeURIComponent(category.slug)}">
      <span class="category-icon" aria-hidden="true">${escapeHtml(category.icon)}</span><span class="category-arrow" aria-hidden="true">↗</span>
      <h3>${escapeHtml(category.name)}</h3><p>${escapeHtml(category.count)} designs to explore</p></a>`;
  }
  function designCard(item) {
    const thumbPath = `./${escapeHtml(item.thumbnail)}`;
    const chips = item.features.slice(0, 3).map((feature) => `<span class="feature-chip">${escapeHtml(feature)}</span>`).join("");
    return `<article class="design-card">
      <a class="card-image" href="./preview.html?id=${encodeURIComponent(item.id)}" aria-label="Preview ${escapeHtml(item.name)}">
        <img src="${thumbPath}" alt="${escapeHtml(item.name)} website design preview" loading="lazy" width="800" height="500">
        ${item.badge ? `<span class="card-badge">${escapeHtml(item.badge)}</span>` : ""}
      </a>
      <div class="card-body"><div class="card-topline"><div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.tagline)}</p></div>
        <div class="card-price">${money(item.price)}<small>one-time</small></div></div>
        <div class="feature-chips">${chips}</div>
        <div class="card-actions"><a class="card-preview" href="./preview.html?id=${encodeURIComponent(item.id)}">Live preview <span aria-hidden="true">◉</span></a>
          <a class="card-order" href="./checkout.html?id=${encodeURIComponent(item.id)}">Order <span aria-hidden="true">↗</span></a></div>
      </div></article>`;
  }
  window.DigiStore.readData = readData;
  window.DigiStore.categoryCard = categoryCard;
  window.DigiStore.designCard = designCard;

  const categoryTarget = document.querySelector("#home-categories");
  const featuredTarget = document.querySelector("#featured-designs");
  if (categoryTarget || featuredTarget) {
    readData().then(([categories, templates]) => {
      if (categoryTarget) categoryTarget.innerHTML = categories.slice(0, 10).map(categoryCard).join("");
      if (featuredTarget) featuredTarget.innerHTML = templates.slice(0, 3).map(designCard).join("");
      const counters = document.querySelectorAll("[data-counter]");
      if ("IntersectionObserver" in window && counters.length) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const node = entry.target, target = Number(node.dataset.counter), start = performance.now();
            const tick = (now) => {
              const progress = Math.min((now - start) / 900, 1);
              node.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick); observer.unobserve(node);
          });
        });
        counters.forEach((node) => counterObserver.observe(node));
      } else counters.forEach((node) => { node.textContent = node.dataset.counter; });
    }).catch((error) => {
      if (categoryTarget) categoryTarget.innerHTML = `<p class="load-error">${escapeHtml(error.message)}</p>`;
      if (featuredTarget) featuredTarget.innerHTML = `<p class="load-error">${escapeHtml(error.message)}</p>`;
    });
  }
}());
