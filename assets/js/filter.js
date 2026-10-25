(function () {
  "use strict";
  const { readData, designCard, escapeHtml, money } = window.DigiStore;
  const els = {
    search: document.querySelector("#search-input"), category: document.querySelector("#category-filter"),
    subcategory: document.querySelector("#subcategory-filter"), subWrap: document.querySelector("#subcategory-filter-wrap"),
    style: document.querySelector("#style-filter"), price: document.querySelector("#price-filter"),
    priceValue: document.querySelector("#price-value"), sort: document.querySelector("#sort-select"),
    grid: document.querySelector("#design-grid"), count: document.querySelector("#result-count"),
    empty: document.querySelector("#empty-state")
  };
  let categories = [], templates = [];
  const params = new URLSearchParams(location.search);
  const applyFilters = () => {
    const query = els.search.value.trim().toLowerCase();
    let visible = templates.filter((item) => {
      const searchable = [item.name, item.tagline, item.categoryName, item.subCategory, ...item.features].join(" ").toLowerCase();
      return (!els.category.value || item.category === els.category.value)
        && (!els.subcategory.value || item.subCategory === els.subcategory.value)
        && (!els.style.value || item.style === els.style.value)
        && item.price <= Number(els.price.value)
        && (!query || searchable.includes(query));
    });
    if (els.sort.value === "price-asc") visible.sort((a, b) => a.price - b.price);
    if (els.sort.value === "price-desc") visible.sort((a, b) => b.price - a.price);
    if (els.sort.value === "name") visible.sort((a, b) => a.name.localeCompare(b.name));
    if (els.sort.value === "newest") visible.sort((a, b) => templates.indexOf(b) - templates.indexOf(a));
    els.grid.innerHTML = visible.map(designCard).join("");
    els.count.textContent = `${visible.length} ${visible.length === 1 ? "design" : "designs"} to explore`;
    els.empty.hidden = visible.length > 0;
  };
  const updateSubcategories = () => {
    const selectedCategory = categories.find((item) => item.slug === els.category.value);
    const options = selectedCategory?.subCategories || [];
    els.subWrap.hidden = options.length === 0;
    els.subcategory.innerHTML = `<option value="">All types</option>${options.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
    if (options.includes(params.get("subCategory"))) els.subcategory.value = params.get("subCategory");
  };
  const updatePrice = () => { els.priceValue.textContent = money(els.price.value); };
  const clear = () => {
    els.search.value = ""; els.category.value = ""; els.subcategory.value = ""; els.style.value = "";
    els.price.value = els.price.max; els.sort.value = "featured"; updateSubcategories(); updatePrice(); applyFilters();
    history.replaceState(null, "", location.pathname);
  };
  document.querySelector("#clear-filters").addEventListener("click", clear);
  document.querySelector("#empty-clear").addEventListener("click", clear);
  [els.search, els.category, els.subcategory, els.style, els.price, els.sort].forEach((control) => {
    control.addEventListener(control === els.search ? "input" : "change", () => {
      if (control === els.category) updateSubcategories();
      if (control === els.price) updatePrice();
      applyFilters();
    });
  });
  document.querySelectorAll("[data-currency]").forEach((node) => { node.textContent = window.DigiStore.config.CURRENCY || "PKR"; });
  readData().then(([loadedCategories, loadedTemplates]) => {
    categories = loadedCategories; templates = loadedTemplates;
    els.category.insertAdjacentHTML("beforeend", categories.map((category) => `<option value="${escapeHtml(category.slug)}">${escapeHtml(category.name)}</option>`).join(""));
    if (categories.some((item) => item.slug === params.get("category"))) els.category.value = params.get("category");
    if (params.get("q")) els.search.value = params.get("q");
    updateSubcategories(); updatePrice(); applyFilters();
  }).catch((error) => {
    els.grid.innerHTML = `<p class="load-error">${escapeHtml(error.message)} Check that the site is being served from its project folder.</p>`;
    els.count.textContent = "Catalog unavailable";
  });
}());
