// backend/src/server.js
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
    `Success: Loaded ${vocabulary.length} tus terminos ya se cargaron en memoria champ.`
  );
} catch (error) {
  console.error("❌ algo paso webon vocabulary.json:", error);
}

// 🔍 ENDPOINT DE BÚSQUEDA ULTRA RÁPIDO
app.get("/api/search", (req, res) => {
  const query = req.query.q;
  if (!query) return res.json(vocabulary);

  const cleanQuery = query.toLowerCase().trim();

  const results = vocabulary.filter((item) => {
    return (
      item.term.toLowerCase().includes(cleanQuery) ||
      item.translation.toLowerCase().includes(cleanQuery) ||
      item.category.toLowerCase().includes(cleanQuery)
    );
  });

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Bien huevon tu servidor esta corriendo en el PUERTO: ${PORT}`);
});
