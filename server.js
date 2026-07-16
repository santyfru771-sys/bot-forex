const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static("public"));
const API_KEY = process.env.TWELVE_DATA_KEY; // guardá tu clave en .env

// Ruta para obtener datos de un par de divisas
async function getData(pair) {
  try {
    const response = await axios.get("https://api.twelvedata.com/time_series", {
      params: {
        symbol: pair,
        interval: "1min",
        apikey: process.env.API_KEY
      }
    });
    return response.data;
  } catch (err) {
    console.error("Error en la API:", err.message);
    return { error: "No se pudo obtener datos" };
  }
}
app.get("/data/:base/:quote", async (req, res) => {
  const { base, quote } = req.params;
  const pair = `${base}/${quote}`;
  const data = await getData(pair);
  res.json(data);
});

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
