'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './TradingWidget.module.css';

export function TradingWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadWidget = useCallback(() => {
    if (containerRef.current) {
      // Limpiamos el contenido anterior antes de re-inyectar
      containerRef.current.innerHTML = '';
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
          "height": "600",
          "largeChartUrl": "",
          "isTransparent": true,
          "showSymbolLogo": true,
          "showFloatingTooltip": false,
          "tabs": [
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

  // 1. Cargar el widget inmediatamente al montar el componente (previniendo duplicación en React Strict Mode)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadWidget();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [loadWidget]);

  // 2. Configurar el timer basándose en el Checkbox del usuario
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        loadWidget();
      }, 30000);
    }

    // 3. Cleanup: detener el timer si se desactiva el check o se destruye la página
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, loadWidget]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Contenedor del IFrame de Mercado con Scroll Personalizado */}
      <div
        className={`tradingview-widget-container ${styles.scrollContainer}`}
        ref={containerRef}
        style={{
          width: '100%',
          flexGrow: 1,
          opacity: 0.9,
          mixBlendMode: 'lighten'
        }}
      >
      </div>

      {/* Nuevo Footer con el Toggle Estilo iOS */}
      <div className={styles.widgetFooter}>
        <label htmlFor="autoRefreshToggle" className={styles.toggleLabel}>
          Refresco automático (30s)
        </label>
        <label className={styles.toggleSwitch}>
          <input
            id="autoRefreshToggle"
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

    </div>
  );
}
