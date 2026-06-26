// frontend/js/app.js
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results-container");
const macroCategoriesDiv = document.getElementById("macro-categories");
const subScenariosDiv = document.getElementById("sub-scenarios");

let currentFilters = {};
let activeCategory = "";
let activeScenario = "";
let searchTimeout = null;

// 1. Inicializar la app
async function initApp() {
  try {
    const res = await fetch("/api/filters");
    currentFilters = await res.json();
    renderMacroCategories();
    enableMouseWheelScroll(); // Activa el scroll con rueda de mouse
    performSearch();
  } catch (error) {
    console.error("Error inicializando app:", error);
    resultsContainer.innerHTML = `<p class="placeholder-text">Error de conexión con el servidor.</p>`;
  }
}

// 2. Renderizar categorías principales (Fila Superior)
function renderMacroCategories() {
  if (!macroCategoriesDiv) return;
  macroCategoriesDiv.innerHTML =
    '<div class="pill active" data-cat="">All</div>';

  Object.keys(currentFilters).forEach((cat) => {
    macroCategoriesDiv.innerHTML += `<div class="pill cat-${cat}" data-cat="${cat}">${cat}</div>`;
  });

  macroCategoriesDiv.querySelectorAll(".pill").forEach((pill) => {
    pill.addEventListener("click", (e) => {
      macroCategoriesDiv
        .querySelectorAll(".pill")
        .forEach((p) => p.classList.remove("active"));
      e.target.classList.add("active");

      activeCategory = e.target.getAttribute("data-cat") || "";
      activeScenario = ""; // Reiniciar escenario al cambiar categoría

      renderSubScenarios(activeCategory);
      performSearch();
    });
  });
}

// 3. Renderizar sub-escenarios (Fila Inferior Dinámica)
function renderSubScenarios(category) {
  if (!subScenariosDiv) return;

  if (
    !category ||
    !currentFilters[category] ||
    currentFilters[category].length === 0
  ) {
    subScenariosDiv.classList.add("hidden");
    subScenariosDiv.innerHTML = "";
    return;
  }

  subScenariosDiv.classList.remove("hidden");
  subScenariosDiv.innerHTML =
    '<div class="pill active" data-scen="">All Scenarios</div>';

  currentFilters[category].forEach((scen) => {
    subScenariosDiv.innerHTML += `<div class="pill" data-scen="${scen}">${scen}</div>`;
  });

  subScenariosDiv.querySelectorAll(".pill").forEach((pill) => {
    pill.addEventListener("click", (e) => {
      subScenariosDiv
        .querySelectorAll(".pill")
        .forEach((p) => p.classList.remove("active"));
      e.target.classList.add("active");
      activeScenario = e.target.getAttribute("data-scen") || "";
      performSearch();
    });
  });
}

// 4. Motor de renderizado y fetch a la API
async function performSearch() {
  const query = searchInput ? searchInput.value.trim() : "";

  let url = `/api/search?q=${encodeURIComponent(query)}`;
  if (activeCategory) url += `&category=${encodeURIComponent(activeCategory)}`;
  if (activeScenario) url += `&scenario=${encodeURIComponent(activeScenario)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data || data.length === 0) {
      resultsContainer.innerHTML = `<p class="no-results">No se encontraron términos.</p>`;
      return;
    }

    resultsContainer.innerHTML = data
      .map(
        (item) => `
            <div class="card ${item.category ? item.category.toLowerCase() : ""}">
                <div class="card-header">
                    <span class="term-title">${item.term}</span>
                    <span class="badge">${item.scenario || item.category || "Term"}</span>
                </div>
                <div class="translation">${item.translation}</div>
                ${item.notes ? `<div class="notes">${item.notes}</div>` : ""}
            </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error obteniendo resultados:", error);
  }
}

// 5. Soporte para Scroll horizontal con la rueda del mouse
function enableMouseWheelScroll() {
  const pillRows = document.querySelectorAll(".pill-row");
  pillRows.forEach((row) => {
    row.removeEventListener("wheel", handleWheelEvent); // Evita duplicados
    row.addEventListener("wheel", handleWheelEvent);
  });
}

function handleWheelEvent(e) {
  if (e.deltaY !== 0) {
    e.preventDefault();
    this.scrollLeft += e.deltaY * 1.2;
  }
}

// Escuchar el cuadro de búsqueda
if (searchInput) {
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 50); // Latencia de 50ms para búsquedas instantáneas
  });
}

// Ejecutar al cargar la página
initApp();
