const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.TWELVE_DATA_KEY; // guardá tu clave en .env

// Servir archivos estáticos desde la carpeta public
app.use(express.static("public"));

// Función auxiliar para pedir datos a Twelve Data
async function getData(pair) {
  try {
    const response = await axios.get("https://api.twelvedata.com/time_series", {
      params: {
        symbol: pair,
        interval: "1min",
        outputsize: 10,
        apikey: API_KEY
      }
    });

    // Si la API devuelve error
    if (response.data.status === "error") {
      return { error: response.data.message };
    }

    // Devolver datos limpios
    return {
      meta: response.data.meta,
      values: response.data.values,
      status: "ok"
    };
  } catch (err) {
    console.error("Error en la API:", err.message);
    return { error: "Error interno del servidor" };
  }
}

// Ruta para obtener datos de un par de divisas
app.get("/data/:base/:quote", async (req, res) => {
  const { base, quote } = req.params;
  const pair = `${base}/${quote}`;
  const data = await getData(pair);
  res.json(data);
});

// Mantener el servidor vivo en Railway
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
