const express = require("express");
const axios = require("axios");
const { RSI, SMA } = require("technicalindicators");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.TWELVE_DATA_KEY;

const PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "USD/CHF", "NZD/USD"];

app.use(express.static("public")); // servir frontend

// Estrategia simple: RSI + SMA
function checkSignal(values) {
  const closes = values.map(v => parseFloat(v.close)).reverse();
  const rsi = RSI.calculate({ values: closes, period: 14 });
  const sma = SMA.calculate({ values: closes, period: 20 });

  const lastRSI = rsi[rsi.length - 1];
  const lastClose = closes[closes.length - 1];
  const lastSMA = sma[sma.length - 1];

  if (lastRSI < 30 && lastClose > lastSMA) return "BUY";
  if (lastRSI > 70 && lastClose < lastSMA) return "SELL";
  return "HOLD";
}

// Endpoint para obtener datos de un par
app.get("/data/:base/:quote", async (req, res) => {
  const { base, quote } = req.params;
  const pair = `${base}/${quote}`;
  // ... resto igual
});


  const pair = req.params.pair;
  try {
    const response = await axios.get("https://api.twelvedata.com/time_series", {
      params: {
        symbol: pair,
        interval: "15min",
        outputsize: 50,
        apikey: API_KEY,
      },
    });

    if (response.data.status === "error") {
      return res.status(400).json({ error: response.data.message });
    }

    const signal = checkSignal(response.data.values);

    res.json({
      meta: response.data.meta,
      values: response.data.values,
      signal,
      status: "ok",
    });
  } catch (error) {
    console.error("Error al consultar Twelve Data:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta raíz
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
