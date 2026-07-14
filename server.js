const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint de prueba con datos reales simulados
app.get("/data/:pair", (req, res) => {
  const pair = req.params.pair;
  const data = [
    { datetime: "2024-01-01", open: 1.12, high: 1.15, low: 1.10, close: 1.14, volume: 1200 },
    { datetime: "2024-01-02", open: 1.14, high: 1.16, low: 1.12, close: 1.13, volume: 1500 },
    { datetime: "2024-01-03", open: 1.13, high: 1.17, low: 1.11, close: 1.16, volume: 1800 }
  ];
  const signals = "BUY"; // señal de prueba
  res.json({ data, signals });
});

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

