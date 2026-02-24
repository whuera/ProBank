'use client';

import React, { useEffect, useRef } from 'react';

export function TradingWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Evitar que el script se inserte múltiples veces en re-renders de React
    if (containerRef.current && containerRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = `
        {
          "colorTheme": "dark",
          "dateRange": "12M",
          "showChart": true,
          "locale": "es",
          "width": "100%",
          "height": "100%",
          "largeChartUrl": "",
          "isTransparent": true,
          "showSymbolLogo": true,
          "showFloatingTooltip": false,
          "tabs": [
            {
              "title": "Mercado Chileno",
              "symbols": [
                {
                  "s": "FX_IDC:USDCLP",
                  "d": "Dólar Observado (USD/CLP)"
                },
                {
                  "s": "BVC:COPEC",
                  "d": "Empresas Copec"
                },
                {
                  "s": "BVC:CHILE",
                  "d": "Banco de Chile"
                },
                {
                  "s": "BVC:SQM_B",
                  "d": "SQM"
                },
                {
                  "s": "BVC:FALABELLA",
                  "d": "Falabella"
                },
                {
                  "s": "BVC:BSANTANDER",
                  "d": "Banco Santander"
                }
              ],
              "originalTitle": "Mercado Local"
            },
            {
              "title": "Índices Globales",
              "symbols": [
                {
                  "s": "FOREXCOM:SPXUSD",
                  "d": "S&P 500"
                },
                {
                  "s": "FOREXCOM:NSXUSD",
                  "d": "US 100"
                },
                {
                  "s": "FOREXCOM:DJI",
                  "d": "Dow 30"
                }
              ],
              "originalTitle": "Índices"
            },
            {
              "title": "Materias Primas",
              "symbols": [
                {
                  "s": "CME_MINI:ES1!",
                  "d": "S&P 500"
                },
                {
                  "s": "CME:6E1!",
                  "d": "Euro"
                },
                {
                  "s": "COMEX:GC1!",
                  "d": "Oro"
                },
                {
                  "s": "NYMEX:CL1!",
                  "d": "Petróleo Crudo"
                },
                {
                  "s": "NYMEX:NG1!",
                  "d": "Gas Natural"
                },
                {
                  "s": "CBOT:ZC1!",
                  "d": "Maíz"
                }
              ],
              "originalTitle": "Materias Primas"
            }
          ]
        }`;
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        opacity: 0.9,
        mixBlendMode: 'lighten'
      }}
    >
    </div>
  );
}
