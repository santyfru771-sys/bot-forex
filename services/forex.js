import fetch from 'node-fetch';
import { API_KEY } from '../config/env.js';

export async function getForexData(symbol) {
  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=15min&outputsize=50&apikey=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  console.log("Respuesta Twelve Data:", json); // debug
  return json.values;
}
