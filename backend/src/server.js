const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ⚡ CARGA EN MEMORIA RAM
const dataPath = path.join(__dirname, "data", "vocabulary.json");
let vocabulary = [];

try {
  const rawData = fs.readFileSync(dataPath, "utf-8");
  vocabulary = JSON.parse(rawData);
  console.log(
    `Success: Loaded ${vocabulary.length} términos en memoria champ.`
  );
} catch (error) {
  console.error("❌ Error leyendo vocabulary.json:", error);
}

// Servir Frontend automático
app.use(express.static(path.join(__dirname, "../../frontend")));

// 🏷️ ENDPOINT PARA OBTENER FILTROS DINÁMICOS
app.get("/api/filters", (req, res) => {
  const filters = {};
  vocabulary.forEach((item) => {
    if (item && item.category) {
      const cat = item.category;
      const scen = item.scenario || "General";
      if (!filters[cat]) filters[cat] = new Set();
      filters[cat].add(scen);
    }
  });

  const formattedFilters = {};
  for (const cat in filters) {
    formattedFilters[cat] = Array.from(filters[cat]).sort();
  }
  res.json(formattedFilters);
});

// 🔍 ENDPOINT DE BÚSQUEDA INTEGRAL ULTRA DEFENSIVO
const removeAccents = (str) => {
  return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
};

app.get("/api/search", (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase().trim() : "";
  const category = req.query.category;
  const scenario = req.query.scenario;

  // 📝 LOG DIAGNÓSTICO: Verás esto en tu terminal de VS Code al teclear
  console.log(
    `🔍 Buscando: "${query}" | Cat: "${category || "Todas"}" | Scen: "${scenario || "Todos"}"`
  );

  const cleanQuery = removeAccents(query);

  const results = vocabulary.filter((item) => {
    // Validación de seguridad por si hay algún objeto corrupto
    if (!item || !item.term || !item.translation) return false;

    let match = true;

    // Filtrar por categoría (solo si viene un valor real y no vacío)
    if (category && category !== "" && category !== "undefined") {
      match = match && item.category === category;
    }
    // Filtrar por escenario (solo si viene un valor real y no vacío)
    if (scenario && scenario !== "" && scenario !== "undefined") {
      match = match && item.scenario === scenario;
    }

    // Filtrar por texto bidireccional
    if (cleanQuery) {
      const cleanTerm = removeAccents(item.term.toLowerCase());
      const cleanTrans = removeAccents(item.translation.toLowerCase());
      const cleanNotes = item.notes
        ? removeAccents(item.notes.toLowerCase())
        : "";

      match =
        match &&
        (cleanTerm.includes(cleanQuery) ||
          cleanTrans.includes(cleanQuery) ||
          cleanNotes.includes(cleanQuery));
    }
    return match;
  });

  res.json(results.slice(0, 50));
});

app.listen(PORT, () => {
  console.log(`¡Servidor blindado corriendo en http://localhost:${PORT}!`);
});
