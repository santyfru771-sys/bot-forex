// Configuración global
const CONFIG = {
  autoRefreshInterval: 60000, // 60 segundos
  apiBaseUrl: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : '', // En producción usa el mismo dominio
};

// Estado global
let state = {
  currentPair: 'EUR/USD',
  analysisData: null,
  charts: {},
  autoRefreshTimer: null
};

// Convertir par a formato API (EUR/USD -> EUR/USD)
function formatPair(pair) {
  const [base, quote] = pair.split('/');
  return { base, quote };
}

// Obtener análisis completo
async function fetchAnalysis(pair) {
  try {
    const { base, quote } = formatPair(pair);
    const url = `${CONFIG.apiBaseUrl}/api/analysis/${base}/${quote}`;
    
    console.log('Obteniendo datos de:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    state.analysisData = data;
    return data;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    showError(`Error al obtener datos: ${error.message}`);
    return null;
  }
}

// Obtener solo el precio actual
async function fetchPrice(pair) {
  try {
    const { base, quote } = formatPair(pair);
    const url = `${CONFIG.apiBaseUrl}/api/price/${base}/${quote}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching price:', error);
    return null;
  }
}

// Actualizar sección de precio actual
async function updateCurrentPrice() {
  const priceData = await fetchPrice(state.currentPair);
  
  if (!priceData) return;

  document.getElementById('pairName').textContent = priceData.pair;
  document.getElementById('currentPrice').textContent = priceData.price.toFixed(5);
  
  const changeElement = document.getElementById('priceChange');
  const changePercent = parseFloat(priceData.changePercent);
  
  changeElement.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
  changeElement.className = 'price-change ' + (changePercent >= 0 ? 'up' : 'down');
  
  document.getElementById('priceTime').textContent = new Date(priceData.datetime).toLocaleString();
}

// Mostrar error
function showError(message) {
  const alertsContainer = document.getElementById('alertsContainer');
  alertsContainer.innerHTML = `<div class="alert-item" style="color: #ff4444;">${message}</div>`;
}

// Actualizar alertas detectadas
function updateAlerts(signals) {
  const alertsContainer = document.getElementById('alertsContainer');
  
  if (!signals || signals.length === 0) {
    alertsContainer.innerHTML = '<p class="no-alerts">Sin alertas en este momento</p>';
    return;
  }

  const alertsHTML = signals.map(signal => `
    <div class="alert-item">
      <strong>${signal.type}</strong> (${signal.strength})
      <p>${signal.reason}</p>
    </div>
  `).join('');

  alertsContainer.innerHTML = alertsHTML;
}

// Actualizar análisis de timeframe
function updateTimeframeAnalysis(timeframe, data) {
  const trend = data.trend || '-';
  const trendClass = trend === 'ALCISTA' ? 'trend-up' : trend === 'BAJISTA' ? 'trend-down' : 'trend-neutral';
  
  document.getElementById(`trend-${timeframe}`).textContent = trend;
  document.getElementById(`trend-${timeframe}`).className = `trend-indicator ${trendClass}`;
  
  const support = data.support?.toFixed(5) || '-';
  const resistance = data.resistance?.toFixed(5) || '-';
  document.getElementById(`zone-${timeframe}`).innerHTML = 
    `<small>Soporte: ${support}<br>Resistencia: ${resistance}</small>`;
  
  const rsiValue = data.rsi?.toFixed(2) || '-';
  const rsiStatus = data.rsi > 70 ? '(Sobrecompra)' : data.rsi < 30 ? '(Sobreventa)' : '(Normal)';
  document.getElementById(`rsi-${timeframe}`).textContent = `${rsiValue} ${rsiStatus}`;
  
  document.getElementById(`volume-${timeframe}`).textContent = data.volumeTrend || '-';
}

// Crear gráfico de velas
function createCandleChart(canvasId, data, timeframe) {
  // Destruir gráfico anterior si existe
  if (state.charts[canvasId]) {
    state.charts[canvasId].destroy();
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Preparar datos para el gráfico de línea (usamos Chart.js con línea + volumen)
  const prices = data.rawData.map(d => parseFloat(d.close)).reverse();
  const labels = data.rawData.map((d, i) => {
    const date = new Date(d.datetime);
    return date.toLocaleTimeString();
  }).reverse();

  const ema20Array = calculateEMAArray(prices, 20);
  const ema50Array = calculateEMAArray(prices, 50);
  const ema200Array = calculateEMAArray(prices, 200);

  state.charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Precio',
          data: prices,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          yAxisID: 'y'
        },
        {
          label: 'EMA 20',
          data: ema20Array,
          borderColor: '#ff6b6b',
          borderWidth: 1,
          fill: false,
          tension: 0.1,
          yAxisID: 'y'
        },
        {
          label: 'EMA 50',
          data: ema50Array,
          borderColor: '#4ecdc4',
          borderWidth: 1,
          fill: false,
          tension: 0.1,
          yAxisID: 'y'
        },
        {
          label: 'EMA 200',
          data: ema200Array,
          borderColor: '#95e1d3',
          borderWidth: 1,
          fill: false,
          tension: 0.1,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#e0e0e0' }
        }
      },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          ticks: { color: '#e0e0e0' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
          ticks: { color: '#e0e0e0' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    }
  });
}

// Calcular array de EMA
function calculateEMAArray(prices, period) {
  const k = 2 / (period + 1);
  let ema = prices[0];
  const result = [ema];

  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    result.push(ema);
  }

  return result;
}

// Actualizar todos los gráficos
function updateCharts(analysisData) {
  createCandleChart('chart-1h', analysisData.analysis1h, '1h');
  createCandleChart('chart-15m', analysisData.analysis15m, '15m');
  createCandleChart('chart-5m', analysisData.analysis5m, '5m');
}

// Actualizar todas las secciones
async function updateAll() {
  try {
    document.getElementById('lastUpdate').textContent = 'Actualizando...';
    
    // Actualizar precio
    await updateCurrentPrice();
    
    // Obtener análisis completo
    const analysisData = await fetchAnalysis(state.currentPair);
    
    if (!analysisData) return;

    // Actualizar alertas
    updateAlerts(analysisData.signals);
    
    // Actualizar análisis por timeframe
    updateTimeframeAnalysis('1h', analysisData.analysis1h);
    updateTimeframeAnalysis('15m', analysisData.analysis15m);
    updateTimeframeAnalysis('5m', analysisData.analysis5m);
    
    // Actualizar gráficos
    updateCharts(analysisData);
    
    // Actualizar último update
    const now = new Date();
    document.getElementById('lastUpdate').textContent = 
      `Actualizado: ${now.toLocaleTimeString()}`;
    
  } catch (error) {
    console.error('Error en updateAll:', error);
    showError('Error al actualizar datos');
  }
}

// Event Listeners
document.getElementById('pairSelector').addEventListener('change', (e) => {
  state.currentPair = e.target.value;
  updateAll();
});

document.getElementById('refreshBtn').addEventListener('click', () => {
  updateAll();
});

// Cambiar timeframe activo
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Remover clase active de todos
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Agregar clase active al clickeado
    e.target.classList.add('active');
    document.querySelector(`.tab-content[data-timeframe="${e.target.dataset.timeframe}"]`)
      .classList.add('active');
  });
});

// Inicializar
console.log('🚀 Bot Forex iniciando...');
updateAll();

// Auto-refresh cada 60 segundos
state.autoRefreshTimer = setInterval(updateAll, CONFIG.autoRefreshInterval);

// Cleanup al cerrar
window.addEventListener('beforeunload', () => {
  if (state.autoRefreshTimer) {
    clearInterval(state.autoRefreshTimer);
  }
});
