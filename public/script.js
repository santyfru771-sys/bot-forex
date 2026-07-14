async function loadData() {
  // URL de tu backend en Render/Railway
  const res = await fetch('https://bot-forex.onrender.com/data');
  const data = await res.json();

  // Preparar datos para velas japonesas
  const candles = data.map(c => ({
    x: c.datetime,
    o: parseFloat(c.open),
    h: parseFloat(c.high),
    l: parseFloat(c.low),
    c: parseFloat(c.close)
  }));

  // Dataset de velas
  new Chart(document.getElementById('candlestick'), {
    type: 'candlestick',
    data: {
      datasets: [{
        label: 'EUR/USD',
        data: candles,
        borderColor: 'white'
      }]
    }
  });

  // Calcular RSI (simple ejemplo)
  const closes = data.map(c => parseFloat(c.close));
  const period = 14;
  const rsiValues = [];
  for (let i = period; i < closes.length; i++) {
    const slice = closes.slice(i - period, i);
    const avgGain = slice.filter((v, j) => j > 0 && v > slice[j - 1])
                         .reduce((a, b, j) => a + (b - slice[j]), 0) / period;
    const avgLoss = slice.filter((v, j) => j > 0 && v < slice[j - 1])
                         .reduce((a, b, j) => a + (slice[j] - b), 0) / period;
    const rs = avgGain / (avgLoss || 1);
    const rsi = 100 - (100 / (1 + rs));
    rsiValues.push(rsi);
  }

  // Dataset RSI
  new Chart(document.getElementById('rsi'), {
    type: 'line',
    data: {
      labels: data.slice(period).map(c => c.datetime),
      datasets: [{
        label: 'RSI',
        data: rsiValues,
        borderColor: 'orange',
        fill: false
      }]
    },
    options: {
      scales: {
        y: { min: 0, max: 100 }
      }
    }
  });
}

loadData();

