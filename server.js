const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.TWELVE_DATA_KEY; // guardá tu clave en .env

// Ruta para obtener datos de un par de divisas
app.get("/data/:pair", async (req, res) => {
  const pair = req.params.pair; // ejemplo: EUR/USD
  try {
    const response = await axios.get("https://api.twelvedata.com/time_series", {
      params: {
        symbol: pair,
        interval: "15min",
        outputsize: 10,
        apikey: API_KEY,
      },
    });

    // Si la API responde con error
    if (response.data.status === "error") {
      return res.status(400).json({ error: response.data.message });
    }

    // Devolver datos limpios
    res.json({
      meta: response.data.meta,
      values: response.data.values,
      status: "ok",
    });
  } catch (error) {
    console.error("Error al consultar Twelve Data:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Mantener el servidor vivo en Render
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
