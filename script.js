async function loadPair(pair) {
  // ⚠️ Cambia esta URL por la de tu backend real
  const res = await fetch(`https://bot-forex.onrender.com/data/${pair}`);
  const { data, signals } = await res.json();

  // Datos de velas
  const candles = data.map(c => ({
    x: c.datetime,
    o: parseFloat(c.open),
    h: parseFloat(c.high),
    l: parseFloat(c.low),
    c: parseFloat(c.close)
  }));

  const closes = data.map(c => parseFloat(c.close));
  const volumes = data.map(c => parseFloat(c.volume));

  // EMA cálculo
  function ema(values, period) {
    const k = 2 / (period + 1);
    let emaArray = [];
    let prevEma = values[0];
    for (let i = 0; i < values.length; i++) {
      const price = values[i];
      prevEma = (price - prevEma) * k + prevEma;
      emaArray.push({ x: data[i].datetime, y: prevEma });
    }
    return emaArray;
  }

  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const ema200 = ema(closes, 200);

  // Gráfico de velas + EMAs
  new Chart(document.getElementById('candlestick'), {
    type: 'candlestick',
    data: {
      datasets: [
        { label: pair, data: candles, borderColor: 'white' },
        { label: 'EMA 20', type: 'line', data: ema20, borderColor: 'red', fill: false },
        { label: 'EMA 50', type: 'line', data: ema50, borderColor: 'blue', fill: false },
        { label: 'EMA 200', type: 'line', data: ema200, borderColor: 'green', fill: false }
      ]
    }
  });

  // RSI cálculo
  const periodRSI = 14;
  const rsiValues = [];
  for (let i = periodRSI; i < closes.length; i++) {
    const slice = closes.slice(i - periodRSI, i);
    let gains = 0, losses = 0;
    for (let j = 1; j < slice.length; j++) {
      const diff = slice[j] - slice[j - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / periodRSI;
    const avgLoss = losses / periodRSI;
    const rs = avgGain / (avgLoss || 1);
    const rsi = 100 - (100 / (1 + rs));
    rsiValues.push(rsi);
  }

  new Chart(document.getElementById('rsi'), {
    type: 'line',
    data: {
      labels: data.slice(periodRSI).map(c => c.datetime),
      datasets: [{
        label: 'RSI',
        data: rsiValues,
        borderColor: 'orange',
        fill: false
      }]
    },
    options: { scales: { y: { min: 0, max: 100 } } }
  });

  // Volumen
  new Chart(document.getElementById('volume'), {
    type: 'bar',
    data: {
      labels: data.map(c => c.datetime),
      datasets: [{
        label: 'Volumen',
        data: volumes,
        backgroundColor: 'purple'
      }]
    }
  });

  // Señales
  document.getElementById("signals").innerText = `Señal actual: ${signals}`;
}

// Inicializar con EUR/USD
loadPair("EUR/USD");

// Cambiar par desde el selector
document.getElementById("pairSelector").addEventListener("change", e => {
  loadPair(e.target.value);
});
