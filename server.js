// Ruta principal con analysis2h integrado
app.get("/api/analysis/:base/:quote", async (req, res) => {
  const { base, quote } = req.params;
  const pair = `${base}/${quote}`;

  try {
    const data2h = await getForexData(pair, "2h", 100);
    const data1h = await getForexData(pair, "1h", 100);
    const data15m = await getForexData(pair, "15min", 100);
    const data5m = await getForexData(pair, "5min", 100);

    if (!data2h || !data1h || !data15m || !data5m) {
      return res.status(500).json({ error: "No se pudieron obtener datos" });
    }

    const processTimeframe = (data) => {
      const prices = data.map(d => parseFloat(d.close)).reverse();
      const volumes = data.map(d => parseInt(d.volume) || 0).reverse();
      return {
        prices,
        volumes,
        ema20: calculateEMA(prices, 20).pop(),
        ema50: calculateEMA(prices, 50).pop(),
        ema200: calculateEMA(prices, 200).pop(),
        rsi: calculateRSI(prices).pop(),
        ...detectSupportResistance(prices),
        volumeTrend: analyzeVolume(volumes),
        trend: detectTrend(calculateEMA(prices, 20), calculateEMA(prices, 50), calculateEMA(prices, 200), prices.at(-1)),
        currentPrice: prices.at(-1),
        datetime: data[0].datetime,
        rawData: data
      };
    };

    res.json({
      pair,
      analysis2h: processTimeframe(data2h),
      analysis1h: processTimeframe(data1h),
      analysis15m: processTimeframe(data15m),
      analysis5m: processTimeframe(data5m),
      signals: [], // lógica de señales igual que antes
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
;
