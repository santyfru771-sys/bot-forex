import { getForexData } from './services/forex.js';
import { checkSignal } from './services/signals.js';
import { sendMessage } from './services/whatsapp.js';

const PAIRS = ["EUR/USD", "USD/ARS", "GBP/USD"];

async function main() {
  for (const pair of PAIRS) {
    const data = await getForexData(pair);
    const signal = checkSignal(data);
    if (signal) {
      await sendMessage(`Señal detectada en ${pair}: ${signal}`);
    }
  }
}

main();
