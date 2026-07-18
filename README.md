# 🤖 Bot Forex - Análisis Técnico Multi-Timeframe

Una plataforma inteligente de análisis forex con detección automática de señales utilizando análisis técnico multi-timeframe (1H, 15m, 5m).

## ✨ Características

- **Análisis Multi-Timeframe**: Combina análisis de 1 hora, 15 minutos y 5 minutos
- **Indicadores Técnicos**:
  - Media Móvil Exponencial (EMA 20, 50, 200)
  - RSI (Relative Strength Index)
  - Soporte y Resistencia dinámicos
  - Análisis de Volumen
- **Detección Automática de Señales**:
  - Tendencia Alcista/Bajista
  - Sobrecompra/Sobreventa
  - Cruces de EMA
- **Dashboard Interactivo**: Interfaz web en tiempo real
- **Múltiples Pares de Divisas**: EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD

## 📋 Requisitos

- Node.js (v14+)
- npm o yarn
- Clave API de [Twelve Data](https://twelvedata.com/)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/santyfru771-sys/bot-forex.git
cd bot-forex
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
PORT=3000
TWELVE_DATA_KEY=tu_api_key_aqui
```

**Obtener tu API Key:**
1. Ve a [https://twelvedata.com/](https://twelvedata.com/)
2. Regístrate (plan gratuito disponible)
3. Ve a tu dashboard y copia tu API key
4. Pégala en el archivo `.env`

## 🏃 Ejecución

### Desarrollo Local

```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

### Acceso a la Aplicación

Abre tu navegador en:
```
http://localhost:3000
```

## 📡 API Endpoints

### Análisis Completo Multi-Timeframe
```
GET /api/analysis/:base/:quote
```

**Ejemplo:**
```bash
curl http://localhost:3000/api/analysis/EUR/USD
```

**Respuesta:**
```json
{
  "pair": "EUR/USD",
  "analysis1h": {
    "trend": "ALCISTA",
    "rsi": 65.42,
    "support": 1.0950,
    "resistance": 1.1050,
    "volumeTrend": "en aumento",
    "currentPrice": 1.1005
  },
  "analysis15m": { ... },
  "analysis5m": { ... },
  "signals": [
    {
      "type": "ALCISTA",
      "strength": "Fuerte",
      "reason": "Tendencia alcista en 1H con confirmación en 15m y 5m"
    }
  ]
}
```

### Precio Actual
```
GET /api/price/:base/:quote
```

**Ejemplo:**
```bash
curl http://localhost:3000/api/price/EUR/USD
```

### Health Check
```
GET /health
```

## 📊 Indicadores Explicados

### EMA (Media Móvil Exponencial)
- **EMA 20**: Soporte/Resistencia de corto plazo
- **EMA 50**: Nivel intermedio
- **EMA 200**: Tendencia general a largo plazo
- Cuando EMA20 > EMA50 > EMA200 → Tendencia **ALCISTA**
- Cuando EMA20 < EMA50 < EMA200 → Tendencia **BAJISTA**

### RSI (Índice de Fuerza Relativa)
- **Rango**: 0 - 100
- **Sobrecompra**: > 70 (posible reversión bajista)
- **Sobreventa**: < 30 (posible reversión alcista)
- **Normal**: 30 - 70

### Soporte y Resistencia
- **Soporte**: Nivel más bajo en últimas 20 velas
- **Resistencia**: Nivel más alto en últimas 20 velas
- Zona donde el precio "rebota" o encuentra dificultad

## 🎯 Estrategia de Señales

La plataforma genera señales cuando se cumplen estas condiciones:

### Señal ALCISTA (COMPRA)
```
✓ Tendencia ALCISTA en 1H
✓ RSI en 15m entre 30-70 (no extremo)
✓ RSI en 5m entre 30-70 (no extremo)
```

### Señal BAJISTA (VENTA)
```
✓ Tendencia BAJISTA en 1H
✓ RSI en 15m entre 30-70 (no extremo)
✓ RSI en 5m entre 30-70 (no extremo)
```

### Alertas Adicionales
- **SOBRECOMPRA**: RSI > 70 en 5m
- **SOBREVENTA**: RSI < 30 en 5m
- **CRUCE_EMA20**: Precio muy cerca de EMA20

## 🔄 Cómo Funciona

1. **Obtención de Datos**: Extrae datos de los últimos 100 períodos de cada timeframe
2. **Cálculo de Indicadores**: Calcula EMA, RSI, soportes y resistencias
3. **Detección de Tendencia**: Analiza la relación entre las EMAs
4. **Generación de Señales**: Busca confirmaciones en múltiples timeframes
5. **Visualización**: Muestra gráficos interactivos y alertas

## 📈 Estructura del Proyecto

```
bot-forex/
├── index.html          # Página principal (frontend)
├── style.css           # Estilos personalizados
├── script.js           # Lógica del frontend
├── server.js           # Backend con APIs
├── package.json        # Dependencias
├── .env                # Variables de entorno
└── README.md           # Este archivo
```

## 🔧 Personalización

### Cambiar Pares de Divisas

En `index.html`, modifica el selector:

```html
<select id="pairSelector">
    <option value="EUR/USD">EUR/USD</option>
    <option value="GBP/USD">GBP/USD</option>
    <option value="USD/JPY">USD/JPY</option>
    <!-- Agrega más pares aquí -->
</select>
```

### Ajustar Indicadores

En `server.js`, modifica los períodos en `processTimeframe()`:

```javascript
const ema20 = calculateEMA(prices, 20);  // Cambia este número
const ema50 = calculateEMA(prices, 50);  // O este
const ema200 = calculateEMA(prices, 200); // O este
```

### Modificar Condiciones de Señales

En `server.js`, edita la sección de detección de señales:

```javascript
if (analysis1h.trend === "ALCISTA" && 
    analysis15m.rsi < 70 && analysis15m.rsi > 30) {
  // Tu lógica aquí
}
```

## 📚 Próximos Pasos

- [ ] Implementar webhooks para alertas en Telegram/Discord
- [ ] Base de datos para historial de señales
- [ ] Backtesting de estrategias
- [ ] Machine Learning para mejora de señales
- [ ] Integración con brokers para operaciones automáticas
- [ ] Análisis geopolítico integrado
- [ ] Sección educativa expandida

## 🐛 Troubleshooting

### "API Error: 401"
→ Verifica tu `TWELVE_DATA_KEY` en el archivo `.env`

### "No se pudieron obtener los datos"
→ Verifica tu conexión a internet y que la API key sea válida

### Los gráficos no cargan
→ Abre la consola del navegador (F12) para ver errores específicos

### Límite de API excedido
→ La API gratuita tiene límites. Espera 24h o upgradea tu plan

## 📝 Licencia

Este proyecto es de código abierto. Úsalo libremente en tus proyectos.

## 💬 Soporte

Para reportar bugs o sugerencias, abre un issue en el repositorio.

---

**Disclaimer**: Este bot es solo para análisis educativo. No es asesoría financiera. Trading tiene riesgos. Invierte responsablemente.

🚀 **¡Feliz trading!**