const express = require("express");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.TWELVE_DATA_KEY;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Cache simple para evitar límites de API
const cache = new Map();
const CACHE_DURATION = 60000; // 60 segundos

// Función para obtener datos de Twelve Data
async function getForexData(pair, interval = "1h", limit = 100) {
  try {
    // Crear clave de cache
    const cacheKey = `${pair}-${interval}`;
    const cached = cache.get(cacheKey);
    
    // Verificar si está en cache y es reciente
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Obtener datos de la API
    const response = await axios.get("https://api.twelvedata.com/time_series", {
      params: {
        symbol: pair,
        interval: interval,
        outputsize: limit,
        apikey: API_KEY
      }
    });

    if (response.data.status === "error") {
      console.error(`API Error para ${pair}:`, response.data.message);
      return null;
    }

    const data = response.data.values || [];
    
    // Guardar en cache
    cache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });

    return data;
  } catch (err) {
    console.error(`Error obteniendo datos para ${pair}:`, err.message);
    return null;
  }
}

// Función para calcular EMA
function calculateEMA(prices, period) {
  const k = 2 / (period + 1);
  let ema = prices[0];
  const result = [ema];

  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    result.push(ema);
  }

  return result;
}

// Función para calcular RSI
function calculateRSI(prices, period = 14) {
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  let gains = 0, losses = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) gains += changes[i];
    else losses -= changes[i];
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rsi = [];

  for (let i = period; i < changes.length; i++) {
    if (changes[i] > 0) gains = changes[i];
    else gains = 0;
    if (changes[i] < 0) losses = -changes[i];
    else losses = 0;

    avgGain = (avgGain * (period - 1) + gains) / period;
    avgLoss = (avgLoss * (period - 1) + losses) / period;

    const rs = avgGain / (avgLoss || 1);
    rsi.push(100 - 100 / (1 + rs));
  }

  return rsi;
}

// Función para detectar soporte/resistencia
function detectSupportResistance(prices, lookback = 20) {
  if (prices.length < lookback) {
    return { support: prices[prices.length - 1], resistance: prices[prices.length - 1] };
  }

  const recentPrices = prices.slice(-lookback);
  const support = Math.min(...recentPrices);
  const resistance = Math.max(...recentPrices);

  return { support, resistance };
}

// Función para analizar volumen
function analyzeVolume(volumes) {
  if (volumes.length < 5) {
    return "insuficiente";
  }

  const recent = volumes.slice(-5);
  const average = recent.reduce((a, b) => a + b, 0) / recent.length;
  const current = volumes[volumes.length - 1];

  if (current > average * 1.2) return "en aumento";
  if (current < average * 0.8) return "en disminución";
  return "normal";
}

// Función para detectar tendencia
function detectTrend(ema20, ema50, ema200, currentPrice) {
  const current20 = ema20[ema20.length - 1];
  const current50 = ema50[ema50.length - 1];
  const current200 = ema200[ema200.length - 1];

  if (current20 > current50 && current50 > current200) {
    return "ALCISTA";
  } else if (current20 < current50 && current50 < current200) {
    return "BAJISTA";
  } else {
    return "LATERAL";
  }
}

// Ruta principal para obtener análisis completo
app.get("/api/analysis/:base/:quote", async (req, res) => {
  const { base, quote } = req.params;
  const pair = `${base}/${quote}`;

  try {
    // Obtener datos de los tres timeframes
    const data1h = await getForexData(pair, "1h", 100);
    const data15m = await getForexData(pair, "15min", 100);
    const data5m = await getForexData(pair, "5min", 100);

    if (!data1h || !data15m || !data5m) {
      return res.status(500).json({ 
        error: "No se pudieron obtener los datos de la API" 
      });
    }

    // Función auxiliar para procesar datos de timeframe
    const processTimeframe = (data) => {
      const prices = data.map(d => parseFloat(d.close)).reverse();
      const volumes = data.map(d => parseInt(d.volume) || 0).reverse();

      const ema20 = calculateEMA(prices, 20);
      const ema50 = calculateEMA(prices, 50);
      const ema200 = calculateEMA(prices, 200);
      const rsi = calculateRSI(prices);
      const { support, resistance } = detectSupportResistance(prices);
      const volumeTrend = analyzeVolume(volumes);
      const trend = detectTrend(ema20, ema50, ema200, prices[prices.length - 1]);

      return {
        prices,
        volumes,
        ema20: ema20[ema20.length - 1],
        ema50: ema50[ema50.length - 1],
        ema200: ema200[ema200.length - 1],
        rsi: rsi[rsi.length - 1],
        support,
        resistance,
        volumeTrend,
        trend,
        currentPrice: prices[prices.length - 1],
        datetime: data[0].datetime,
        rawData: data
      };
    };

    const analysis1h = processTimeframe(data1h);
    const analysis15m = processTimeframe(data15m);
    const analysis5m = processTimeframe(data5m);

    // Detectar señales
    const signals = [];

    // Condiciones para señal ALCISTA
    if (analysis1h.trend === "ALCISTA" && 
        analysis15m.rsi < 70 && analysis15m.rsi > 30 &&
        analysis5m.rsi < 70 && analysis5m.rsi > 30) {
      signals.push({
        type: "ALCISTA",
        strength: "Fuerte",
        reason: "Tendencia alcista en 1H con confirmación en 15m y 5m"
      });
    }

    // Condiciones para señal BAJISTA
    if (analysis1h.trend === "BAJISTA" && 
        analysis15m.rsi > 30 && analysis15m.rsi < 70 &&
        analysis5m.rsi > 30 && analysis5m.rsi < 70) {
      signals.push({
        type: "BAJISTA",
        strength: "Fuerte",
        reason: "Tendencia bajista en 1H con confirmación en 15m y 5m"
      });
    }

    // RSI en sobrecompra
    if (analysis5m.rsi > 70) {
      signals.push({
        type: "SOBRECOMPRA",
        strength: "Media",
        reason: "RSI en sobrecompra en 5m - Posible reversión"
      });
    }

    // RSI en sobreventa
    if (analysis5m.rsi < 30) {
      signals.push({
        type: "SOBREVENTA",
        strength: "Media",
        reason: "RSI en sobreventa en 5m - Posible reversión"
      });
    }

    // Cruce de precio con EMA
    if (Math.abs(analysis5m.currentPrice - analysis5m.ema20) < (analysis5m.resistance - analysis5m.support) * 0.01) {
      signals.push({
        type: "CRUCE_EMA20",
        strength: "Media",
        reason: "Precio cerca de EMA20 - Posible zona de decisión"
      });
    }

    res.json({
      pair,
      analysis1h,
      analysis15m,
      analysis5m,
      signals,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error en análisis:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener solo el precio actual
app.get("/api/price/:base/:quote", async (req, res) => {
  const { base, quote } = req.params;
  const pair = `${base}/${quote}`;

  try {
    const data = await getForexData(pair, "1min", 10);
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No data available" });
    }

    const current = data[0];
    const previous = data[1] || current;

    res.json({
      pair,
      price: parseFloat(current.close),
      open: parseFloat(current.open),
      high: parseFloat(current.high),
      low: parseFloat(current.low),
      volume: parseInt(current.volume) || 0,
      datetime: current.datetime,
      change: parseFloat(current.close) - parseFloat(previous.close),
      changePercent: ((parseFloat(current.close) - parseFloat(previous.close)) / parseFloat(previous.close) * 100).toFixed(2)
    });
  } catch (error) {
    console.error("Error obteniendo precio:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Accede a http://localhost:${PORT}`);
  console.log(`🔗 API disponible en http://localhost:${PORT}/api/analysis/EUR/USD`);
});