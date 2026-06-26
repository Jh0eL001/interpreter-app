// frontend/js/app.js

const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results-container");

// Escuchar el evento 'input' (se dispara en tiempo real con cada letra que escribes)
searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.trim();

  // Si borras todo el buscador, limpiamos la pantalla
  if (query.length === 0) {
    resultsContainer.innerHTML =
      '<p class="placeholder-text">Empieza a teclear para ver traducciones al instante...</p>';
    return;
  }

  try {
    // Hacemos la petición HTTP a nuestro servidor local Express
    const response = await fetch(
      `http://localhost:3000/api/search?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    // Renderizar los resultados en la interfaz
    renderResults(data);
  } catch (error) {
    console.error("❌ Error haciendo fetch al servidor:", error);
    resultsContainer.innerHTML =
      '<p class="error-text">Error de conexión con el servidor local.</p>';
  }
});

// Función profesional para pintar las tarjetas de vocabulario en el HTML
function renderResults(terms) {
  if (terms.length === 0) {
    resultsContainer.innerHTML =
      '<p class="no-results">No se encontraron coincidencias.</p>';
    return;
  }

  // Mapeamos los términos a bloques de código HTML limpio
  resultsContainer.innerHTML = terms
    .map(
      (item) => `
        <div class="card ${item.category.toLowerCase()}">
            <div class="card-header">
                <span class="term-title">${item.term}</span>
                <span class="badge">${item.category}</span>
            </div>
            <div class="card-body">
                <p class="translation"><strong>➔ ${item.translation}</strong></p>
                ${item.notes ? `<p class="notes">💡 <em>${item.notes}</em></p>` : ""}
            </div>
        </div>
    `
    )
    .join("");
}
