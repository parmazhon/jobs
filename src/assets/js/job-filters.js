(() => {
  const form = document.querySelector("[data-job-filters]");
  const cards = [...document.querySelectorAll("[data-job-card]")];
  const list = document.querySelector("[data-job-list]");
  const count = document.querySelector("[data-job-count]");
  const countLabel = document.querySelector("[data-job-count-label]");
  const emptyState = document.querySelector("[data-job-empty]");
  const clearButtons = [...document.querySelectorAll("[data-clear-filters]")];
  const filterTools = document.querySelector("[data-job-filter-tools]");
  const quickFilterButtons = [...document.querySelectorAll("[data-quick-filter]")];
  const advancedSearch = document.querySelector("[data-advanced-search]");
  const advancedCount = document.querySelector("[data-advanced-count]");

  if (!form || !list || !count || !countLabel || !emptyState) return;

  const controls = {
    q: form.elements.q,
    role: form.elements.role,
    location: form.elements.location,
    workplace: form.elements.workplace,
    employment: form.elements.employment
  };

  const normalize = (value = "") =>
    String(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const optionExists = (control, value) =>
    control.tagName !== "SELECT" ||
    [...control.options].some((option) => option.value === value);

  function updateFilterControls() {
    for (const button of quickFilterButtons) {
      const control = controls[button.dataset.quickFilter];
      const isActive = control &&
        normalize(control.value) === normalize(button.dataset.filterValue);
      button.setAttribute("aria-pressed", String(Boolean(isActive)));
    }

    if (advancedCount) {
      const activeAdvancedFilters = ["q", "location", "employment"].filter(
        (name) => controls[name].value.trim()
      ).length;

      advancedCount.textContent = activeAdvancedFilters;
      advancedCount.hidden = activeAdvancedFilters === 0;
    }
  }

  function readFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);

    for (const [name, control] of Object.entries(controls)) {
      const value = params.get(name) || "";
      control.value = optionExists(control, value) ? value : "";
    }
  }

  function syncFiltersToUrl() {
    const url = new URL(window.location.href);

    for (const [name, control] of Object.entries(controls)) {
      const value = control.value.trim();
      if (value) {
        url.searchParams.set(name, value);
      } else {
        url.searchParams.delete(name);
      }
    }

    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`
    );
  }

  function applyFilters({ syncUrl = true } = {}) {
    const filters = Object.fromEntries(
      Object.entries(controls).map(([name, control]) => [
        name,
        normalize(control.value)
      ])
    );

    let visibleCount = 0;

    for (const card of cards) {
      const searchText = normalize(card.textContent);
      const matches =
        (!filters.q || searchText.includes(filters.q)) &&
        (!filters.role || normalize(card.dataset.role) === filters.role) &&
        (!filters.location || normalize(card.dataset.location).includes(filters.location)) &&
        (!filters.workplace || normalize(card.dataset.workplace) === filters.workplace) &&
        (!filters.employment || normalize(card.dataset.employment) === filters.employment);

      card.hidden = !matches;
      if (matches) visibleCount += 1;
    }

    const filtersAreActive = Object.values(controls).some(
      (control) => control.value.trim()
    );

    count.textContent = visibleCount;
    countLabel.textContent = filtersAreActive
      ? `of ${cards.length} open ${cards.length === 1 ? "job" : "jobs"}`
      : visibleCount === 1 ? "open job" : "open jobs";
    emptyState.hidden = visibleCount !== 0;
    list.hidden = visibleCount === 0;

    for (const button of clearButtons) {
      if (button.classList.contains("job-filters-clear")) {
        button.hidden = !filtersAreActive;
      }
    }

    updateFilterControls();
    if (syncUrl) syncFiltersToUrl();
  }

  function clearFilters() {
    form.reset();
    applyFilters();
    if (advancedSearch) advancedSearch.open = false;
    (quickFilterButtons[0] || controls.q).focus();
  }

  if (filterTools) filterTools.hidden = false;
  form.hidden = false;
  readFiltersFromUrl();
  applyFilters({ syncUrl: false });

  if (advancedSearch && ["q", "location", "employment"].some(
    (name) => controls[name].value.trim()
  )) {
    advancedSearch.open = true;
  }

  form.addEventListener("input", () => applyFilters());
  form.addEventListener("submit", (event) => event.preventDefault());

  for (const button of clearButtons) {
    button.addEventListener("click", clearFilters);
  }

  for (const button of quickFilterButtons) {
    button.addEventListener("click", () => {
      const control = controls[button.dataset.quickFilter];
      if (!control) return;
      control.value = button.dataset.filterValue;
      applyFilters();
    });
  }

  window.addEventListener("popstate", () => {
    form.reset();
    readFiltersFromUrl();
    applyFilters({ syncUrl: false });
  });
})();
