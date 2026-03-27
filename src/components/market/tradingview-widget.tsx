'use client'

import { useEffect, useRef } from 'react'

interface TradingViewWidgetProps {
  symbol?: string
  height?: number
  theme?: 'dark' | 'light'
}

/**
 * Terminal TradingView con soporte BCBA (BYMA), NYSE, NASDAQ, crypto
 * Símbolos BYMA: BCBA:GGAL, BCBA:YPF, BCBA:PAMP, etc.
 */
export function TradingViewWidget({
  symbol = 'BCBA:GGAL',
  height = 500,
  theme  = 'dark',
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Limpiar instancia previa
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize:           true,
      symbol,
      interval:           'D',
      timezone:           'America/Argentina/Buenos_Aires',
      theme,
      style:              '1',
      locale:             'es',
      enable_publishing:  false,
      allow_symbol_change: true,
      support_host:       'https://www.tradingview.com',
      studies: ['RSI@tv-basicstudies', 'MACD@tv-basicstudies'],
      show_popup_button:  true,
      popup_width:        '1000',
      popup_height:       '650',
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [symbol, theme])

  return (
    <div
      className="tradingview-widget-container rounded-xl overflow-hidden border border-zinc-800"
      ref={containerRef}
      style={{ height }}
    />
  )
}
