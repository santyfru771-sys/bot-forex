import { SMA, RSI } from 'technicalindicators';

export function checkSignal(data) {
  if (!data || !Array.isArray(data)) {
    console.log("Datos inválidos en checkSignal:", data);
    return null;
  }

  const closes = data.map(c => parseFloat(c.close));

  const sma = SMA.calculate({ period: 14, values: closes });
  const rsi = RSI.calculate({ period: 14, values: closes });

  if (rsi[rsi.length - 1] < 30) return "Posible compra (RSI < 30)";
  if (rsi[rsi.length - 1] > 70) return "Posible venta (RSI > 70)";
  return null;
}
