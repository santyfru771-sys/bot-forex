// Ejemplo simple con Chart.js
// Asegurate de tener Chart.js cargado en tu proyecto

document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("chart").getContext("2d");
  new Chart(ctx, {
    type: "candlestick", // requiere chartjs-chart-financial
    data: {
      datasets: [{
        label: "Velas Forex",
        data: [
          { t: new Date(), o: 1.12, h: 1.15, l: 1.10, c: 1.14 },
          { t: new Date(), o: 1.14, h: 1.16, l: 1.12, c: 1.13 }
        ]
      }]
    }
  });
});
 
