async function updateAll() {
  try {
    document.getElementById('lastUpdate').textContent = 'Actualizando...';
    await updateCurrentPrice();
    const analysisData = await fetchAnalysis(state.currentPair);
    if (!analysisData) return;

    updateAlerts(analysisData.signals);
    updateTimeframeAnalysis('2h', analysisData.analysis2h);
    updateTimeframeAnalysis('1h', analysisData.analysis1h);
    updateTimeframeAnalysis('15m', analysisData.analysis15m);

    createCandleChartLW('chart-2h', state.currentPair);
    createLineChart('chart-1h', analysisData.analysis1h, '1h');
    createLineChart('chart-15m', analysisData.analysis15m, '15m');

    document.getElementById('lastUpdate').textContent = `Actualizado: ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    showError('Error al actualizar datos');
  }
}

// Auto-refresh cada 20 minutos
state.autoRefreshTimer = setInterval(updateAll, 20 * 60 * 1000);
