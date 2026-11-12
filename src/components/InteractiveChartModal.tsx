import React, { useState, useMemo, useRef } from 'react';
import { MarketTicker, Candle } from '../types/market';
import { useMarket } from '../context/MarketContext';
import { generateCandles } from '../data/mockMarketData';
import {
  X,
  TrendingUp,
  TrendingDown,
  Bookmark,
  Layers,
  Activity,
  Maximize2,
  Minimize2,
  CheckCircle2,
  BarChart2,
  Sliders,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface InteractiveChartModalProps {
  ticker: MarketTicker | null;
  onClose: () => void;
}

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W';
type ChartStyle = 'candles' | 'line' | 'area';

export const InteractiveChartModal: React.FC<InteractiveChartModalProps> = ({
  ticker,
  onClose,
}) => {
  const { formatPrice, toggleWatchlist, isInWatchlist } = useMarket();

  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('candles');
  const [showSMA, setShowSMA] = useState<boolean>(true);
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Paper Trade State
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState<number>(10);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  // Generate dynamic candles based on timeframe & ticker
  const candles = useMemo(() => {
    if (!ticker) return [];
    const count = 55;
    const vol = timeframe === '1m' ? 0.005 : timeframe === '1D' ? 0.025 : 0.012;
    return generateCandles(ticker.price, count, vol);
  }, [ticker?.symbol, ticker?.price, timeframe]);

  const activeCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  // Technical calculations
  const chartHeight = 340;
  const chartWidth = 740;
  const rsiHeight = showRSI ? 80 : 0;

  // Price scale
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (candles.length === 0) return { minPrice: 0, maxPrice: 100, priceRange: 100 };
    let min = Infinity;
    let max = -Infinity;
    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    });
    const padding = (max - min) * 0.08 || 1;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      priceRange: max - min + padding * 2 || 1,
    };
  }, [candles]);

  // Max volume for volume bars
  const maxVolume = useMemo(() => {
    return Math.max(...candles.map((c) => c.volume), 1);
  }, [candles]);

  // Calculate 20-period SMA
  const smaPoints = useMemo(() => {
    const period = 14;
    return candles.map((_, i) => {
      if (i < period - 1) return null;
      const slice = candles.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, c) => sum + c.close, 0) / period;
      return avg;
    });
  }, [candles]);

  // Calculate 50-period EMA / secondary smoothed line
  const emaPoints = useMemo(() => {
    const period = 20;
    const k = 2 / (period + 1);
    let ema = candles[0]?.close || 0;
    return candles.map((c, i) => {
      if (i === 0) return ema;
      ema = c.close * k + ema * (1 - k);
      return ema;
    });
  }, [candles]);

  // Approximate RSI (14)
  const rsiValues = useMemo(() => {
    const period = 14;
    const rsis: number[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < candles.length; i++) {
      const diff = candles[i].close - candles[i - 1].close;
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);

      if (i >= period) {
        const avgGain = gains / period;
        const avgLoss = losses / period || 0.0001;
        const rs = avgGain / avgLoss;
        const rsi = 100 - 100 / (1 + rs);
        rsis.push(Math.min(Math.max(rsi, 0), 100));
        // decay
        gains = gains * 0.9 + (diff > 0 ? diff : 0) * 0.1;
        losses = losses * 0.9 + (diff < 0 ? Math.abs(diff) : 0) * 0.1;
      } else {
        rsis.push(50);
      }
    }
    return [50, ...rsis];
  }, [candles]);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;
    const total = ticker.price * quantity;
    setOrderNotice(
      `Filled: ${orderSide.toUpperCase()} ${quantity} ${ticker.symbol} @ ${formatPrice(
        ticker.price,
        ticker.symbol
      )} (Total: ${formatPrice(total)})`
    );
    setTimeout(() => setOrderNotice(null), 4000);
  };

  if (!ticker) return null;

  const isUp = ticker.changePercent >= 0;
  const inWatchlist = isInWatchlist(ticker.symbol);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className={`bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isExpanded
            ? 'w-full h-full max-w-[98vw] max-h-[96vh]'
            : 'w-full max-w-6xl max-h-[90vh]'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3 border-b border-[#2a2e39] bg-[#131722] flex flex-wrap items-center justify-between gap-4">
          {/* Symbol Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2a2e39] flex items-center justify-center font-bold text-white text-sm">
              {ticker.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  {ticker.symbol}
                </h2>
                <span className="text-xs text-[#787b86]">
                  {ticker.name}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#2a2e39] text-[#9598a1]">
                  {ticker.assetClass}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-sm font-semibold text-white tabular-nums">
                  {formatPrice(ticker.price, ticker.symbol)}
                </span>
                <span
                  className={`font-medium tabular-nums ${
                    isUp ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isUp ? '+' : ''}
                  {ticker.change.toFixed(2)} ({isUp ? '+' : ''}
                  {ticker.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Timeframe Controls */}
          <div className="flex items-center gap-1 bg-[#1e222d] p-1 rounded-lg border border-[#2a2e39]">
            {(['1m', '5m', '15m', '1h', '4h', '1D', '1W'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
                  timeframe === tf
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#9598a1] hover:text-white hover:bg-[#2a2e39]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWatchlist(ticker.symbol)}
              className={`p-2 rounded-lg border border-[#2a2e39] text-xs transition-colors flex items-center gap-1.5 ${
                inWatchlist
                  ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/40'
                  : 'bg-[#1e222d] text-[#9598a1] hover:text-white hover:bg-[#2a2e39]'
              }`}
              title="Add to Watchlist"
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">
                {inWatchlist ? 'Watchlisted' : 'Watchlist'}
              </span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg bg-[#1e222d] text-[#9598a1] hover:text-white hover:bg-[#2a2e39] border border-[#2a2e39]"
              title={isExpanded ? 'Restore window' : 'Full window'}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#1e222d] text-[#9598a1] hover:text-white hover:bg-[#2a2e39] border border-[#2a2e39]"
              title="Close chart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chart Sub-Header Toolbar (Indicators & Style) */}
        <div className="px-5 py-2 bg-[#171b26] border-b border-[#2a2e39] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Chart Style Switcher */}
          <div className="flex items-center gap-1 text-[#9598a1]">
            <span className="text-[11px] text-[#787b86] mr-1">Style:</span>
            {(['candles', 'area', 'line'] as ChartStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setChartStyle(style)}
                className={`px-2 py-0.5 rounded capitalize ${
                  chartStyle === style
                    ? 'bg-[#2a2e39] text-white font-medium'
                    : 'hover:text-white'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Indicators toggles */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#787b86]">Indicators:</span>
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                showSMA ? 'bg-[#2962ff]/20 text-[#2962ff] font-medium' : 'text-[#787b86] hover:text-white'
              }`}
            >
              <span className="w-2 h-0.5 bg-[#2962ff]" />
              SMA(14)
            </button>
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                showEMA ? 'bg-[#f7931a]/20 text-[#f7931a] font-medium' : 'text-[#787b86] hover:text-white'
              }`}
            >
              <span className="w-2 h-0.5 bg-[#f7931a]" />
              EMA(20)
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-0.5 rounded ${
                showVolume ? 'bg-[#2a2e39] text-white font-medium' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-0.5 rounded ${
                showRSI ? 'bg-[#9c27b0]/20 text-[#ba68c8] font-medium' : 'text-[#787b86] hover:text-white'
              }`}
            >
              RSI(14)
            </button>
          </div>

          {/* Active OHLC readout */}
          {activeCandle && (
            <div className="flex items-center gap-3 font-mono text-[11px] text-[#787b86] ml-auto">
              <span>Time: <span className="text-white">{activeCandle.time}</span></span>
              <span>O: <span className="text-white">{formatPrice(activeCandle.open, ticker.symbol)}</span></span>
              <span>H: <span className="text-[#089981]">{formatPrice(activeCandle.high, ticker.symbol)}</span></span>
              <span>L: <span className="text-[#f23645]">{formatPrice(activeCandle.low, ticker.symbol)}</span></span>
              <span>C: <span className="text-white">{formatPrice(activeCandle.close, ticker.symbol)}</span></span>
            </div>
          )}
        </div>

        {/* Modal Main Content (Chart + Side Panel) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-y-auto">
          {/* Main Chart Canvas Area (3 cols) */}
          <div className="lg:col-span-3 p-4 flex flex-col border-b lg:border-b-0 lg:border-r border-[#2a2e39] bg-[#131722] relative">
            {orderNotice && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-[#089981] text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {orderNotice}
              </div>
            )}

            {/* Interactive SVG Chart Canvas */}
            <div className="w-full flex-1 min-h-[380px] relative select-none">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight + rsiHeight}`}
                className="w-full h-full block"
                preserveAspectRatio="none"
                onMouseLeave={() => setHoveredCandle(null)}
              >
                <defs>
                  <linearGradient id="area-chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2962ff" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2962ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0.2, 0.4, 0.6, 0.8].map((pct) => {
                  const y = chartHeight * pct;
                  const priceAtY = maxPrice - pct * priceRange;
                  return (
                    <g key={pct}>
                      <line
                        x1="0"
                        y1={y}
                        x2={chartWidth - 65}
                        y2={y}
                        stroke="#2a2e39"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={chartWidth - 5}
                        y={y + 3}
                        fill="#787b86"
                        fontSize="10"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {priceAtY.toFixed(ticker.assetClass === 'forex' ? 4 : 2)}
                      </text>
                    </g>
                  );
                })}

                {/* Volume Bars */}
                {showVolume &&
                  candles.map((candle, idx) => {
                    const candleWidth = (chartWidth - 80) / candles.length;
                    const x = idx * candleWidth + candleWidth * 0.15;
                    const volBarHeight = (candle.volume / maxVolume) * 60;
                    const y = chartHeight - volBarHeight;
                    const isGreen = candle.close >= candle.open;

                    return (
                      <rect
                        key={`vol-${idx}`}
                        x={x}
                        y={y}
                        width={candleWidth * 0.7}
                        height={volBarHeight}
                        fill={isGreen ? '#089981' : '#f23645'}
                        opacity={0.25}
                      />
                    );
                  })}

                {/* Candlesticks OR Line OR Area Rendering */}
                {chartStyle === 'candles' &&
                  candles.map((candle, idx) => {
                    const candleWidth = (chartWidth - 80) / candles.length;
                    const xCenter = idx * candleWidth + candleWidth * 0.5;
                    const isGreen = candle.close >= candle.open;
                    const color = isGreen ? '#089981' : '#f23645';

                    const highY = chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
                    const lowY = chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;
                    const openY = chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight;
                    const closeY = chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;

                    const bodyTop = Math.min(openY, closeY);
                    const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);

                    return (
                      <g
                        key={`candle-${idx}`}
                        className="cursor-crosshair"
                        onMouseEnter={() => setHoveredCandle(candle)}
                      >
                        {/* Wick */}
                        <line
                          x1={xCenter}
                          y1={highY}
                          x2={xCenter}
                          y2={lowY}
                          stroke={color}
                          strokeWidth="1.2"
                        />
                        {/* Body */}
                        <rect
                          x={xCenter - (candleWidth * 0.68) / 2}
                          y={bodyTop}
                          width={candleWidth * 0.68}
                          height={bodyHeight}
                          fill={color}
                          rx="0.5"
                        />
                      </g>
                    );
                  })}

                {(chartStyle === 'line' || chartStyle === 'area') && (() => {
                  const candleWidth = (chartWidth - 80) / candles.length;
                  const points = candles.map((c, i) => {
                    const x = i * candleWidth + candleWidth * 0.5;
                    const y = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
                    return `${x},${y}`;
                  });
                  const pathD = `M ${points.join(' L ')}`;
                  const areaD = `${pathD} L ${(candles.length - 1) * candleWidth + candleWidth * 0.5},${chartHeight} L ${candleWidth * 0.5},${chartHeight} Z`;

                  return (
                    <g>
                      {chartStyle === 'area' && (
                        <path d={areaD} fill="url(#area-chart-grad)" />
                      )}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#2962ff"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })()}

                {/* SMA 14 Line */}
                {showSMA && (() => {
                  const candleWidth = (chartWidth - 80) / candles.length;
                  const pts: string[] = [];
                  smaPoints.forEach((val, i) => {
                    if (val !== null) {
                      const x = i * candleWidth + candleWidth * 0.5;
                      const y = chartHeight - ((val - minPrice) / priceRange) * chartHeight;
                      pts.push(`${x},${y}`);
                    }
                  });
                  return pts.length > 1 ? (
                    <path
                      d={`M ${pts.join(' L ')}`}
                      fill="none"
                      stroke="#2962ff"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                  ) : null;
                })()}

                {/* EMA 20 Line */}
                {showEMA && (() => {
                  const candleWidth = (chartWidth - 80) / candles.length;
                  const pts = emaPoints.map((val, i) => {
                    const x = i * candleWidth + candleWidth * 0.5;
                    const y = chartHeight - ((val - minPrice) / priceRange) * chartHeight;
                    return `${x},${y}`;
                  });
                  return (
                    <path
                      d={`M ${pts.join(' L ')}`}
                      fill="none"
                      stroke="#f7931a"
                      strokeWidth="1.5"
                    />
                  );
                })()}

                {/* Current Price Line & Badge */}
                {(() => {
                  const currentY = chartHeight - ((ticker.price - minPrice) / priceRange) * chartHeight;
                  return (
                    <g>
                      <line
                        x1="0"
                        y1={currentY}
                        x2={chartWidth - 70}
                        y2={currentY}
                        stroke={isUp ? '#089981' : '#f23645'}
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <rect
                        x={chartWidth - 70}
                        y={currentY - 10}
                        width="68"
                        height="20"
                        fill={isUp ? '#089981' : '#f23645'}
                        rx="3"
                      />
                      <text
                        x={chartWidth - 36}
                        y={currentY + 4}
                        fill="#ffffff"
                        fontSize="10"
                        textAnchor="middle"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {ticker.price.toFixed(ticker.assetClass === 'forex' ? 4 : 2)}
                      </text>
                    </g>
                  );
                })()}

                {/* RSI Sub-pane */}
                {showRSI && (() => {
                  const startY = chartHeight + 10;
                  const rsiInnerHeight = rsiHeight - 20;
                  const candleWidth = (chartWidth - 80) / candles.length;
                  const rsiPoints = rsiValues.map((val, i) => {
                    const x = i * candleWidth + candleWidth * 0.5;
                    const y = startY + rsiInnerHeight - (val / 100) * rsiInnerHeight;
                    return `${x},${y}`;
                  });

                  return (
                    <g>
                      <line
                        x1="0"
                        y1={startY}
                        x2={chartWidth}
                        y2={startY}
                        stroke="#2a2e39"
                        strokeWidth="1"
                      />
                      <text x="10" y={startY + 14} fill="#ba68c8" fontSize="10" fontWeight="bold">
                        RSI(14)
                      </text>
                      {/* Overbought 70 line */}
                      <line
                        x1="0"
                        y1={startY + rsiInnerHeight * 0.3}
                        x2={chartWidth - 65}
                        y2={startY + rsiInnerHeight * 0.3}
                        stroke="#ba68c8"
                        strokeDasharray="2 2"
                        strokeWidth="0.75"
                        opacity={0.4}
                      />
                      {/* Oversold 30 line */}
                      <line
                        x1="0"
                        y1={startY + rsiInnerHeight * 0.7}
                        x2={chartWidth - 65}
                        y2={startY + rsiInnerHeight * 0.7}
                        stroke="#ba68c8"
                        strokeDasharray="2 2"
                        strokeWidth="0.75"
                        opacity={0.4}
                      />
                      <path
                        d={`M ${rsiPoints.join(' L ')}`}
                        fill="none"
                        stroke="#ba68c8"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Time stamps on bottom axis */}
            <div className="flex justify-between px-2 pt-2 text-[10px] text-[#787b86] font-mono border-t border-[#2a2e39]">
              {candles
                .filter((_, i) => i % 10 === 0)
                .map((c, idx) => (
                  <span key={idx}>{c.time}</span>
                ))}
            </div>
          </div>

          {/* Side Panel: Fundamentals, Key Metrics & Paper Trade (1 col) */}
          <div className="p-4 bg-[#1e222d] flex flex-col gap-5 overflow-y-auto">
            {/* Paper Trading Execution Widget */}
            <div className="p-3.5 rounded-lg bg-[#131722] border border-[#2a2e39]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Paper Trade
                </span>
                <span className="text-[10px] text-[#089981] font-mono bg-[#089981]/15 px-1.5 py-0.5 rounded">
                  Demo Fill
                </span>
              </div>

              {/* Buy / Sell switch */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#1e222d] rounded-lg mb-3">
                <button
                  type="button"
                  onClick={() => setOrderSide('buy')}
                  className={`py-1.5 text-xs font-bold rounded transition-colors ${
                    orderSide === 'buy'
                      ? 'bg-[#089981] text-white shadow'
                      : 'text-[#787b86] hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('sell')}
                  className={`py-1.5 text-xs font-bold rounded transition-colors ${
                    orderSide === 'sell'
                      ? 'bg-[#f23645] text-white shadow'
                      : 'text-[#787b86] hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#787b86]">Order Type</span>
                  <div className="flex gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setOrderType('market')}
                      className={`px-2 py-0.5 rounded ${
                        orderType === 'market' ? 'bg-[#2a2e39] text-white font-medium' : 'text-[#787b86]'
                      }`}
                    >
                      Market
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('limit')}
                      className={`px-2 py-0.5 rounded ${
                        orderType === 'limit' ? 'bg-[#2a2e39] text-white font-medium' : 'text-[#787b86]'
                      }`}
                    >
                      Limit
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#787b86]">Quantity</span>
                    <span className="font-mono text-white">{quantity} units</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full accent-[#2962ff] cursor-pointer"
                  />
                </div>

                <div className="flex justify-between text-xs py-1.5 border-t border-[#2a2e39]">
                  <span className="text-[#787b86]">Estimated Total:</span>
                  <span className="font-mono font-bold text-white">
                    {formatPrice(ticker.price * quantity, ticker.symbol)}
                  </span>
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 rounded-lg text-xs font-bold text-white transition-opacity shadow ${
                    orderSide === 'buy' ? 'bg-[#089981] hover:opacity-90' : 'bg-[#f23645] hover:opacity-90'
                  }`}
                >
                  {orderSide.toUpperCase()} {quantity} {ticker.symbol}
                </button>
              </form>
            </div>

            {/* Key Statistics */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Key Statistics
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-[#131722] border border-[#2a2e39]">
                  <div className="text-[10px] text-[#787b86]">Day Range</div>
                  <div className="font-mono text-[11px] font-semibold text-white mt-0.5">
                    {formatPrice(ticker.low24h, ticker.symbol)} - {formatPrice(ticker.high24h, ticker.symbol)}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-[#131722] border border-[#2a2e39]">
                  <div className="text-[10px] text-[#787b86]">Volume (24h)</div>
                  <div className="font-mono text-[11px] font-semibold text-white mt-0.5">
                    {ticker.volume}
                  </div>
                </div>
                {ticker.marketCap && (
                  <div className="p-2.5 rounded bg-[#131722] border border-[#2a2e39]">
                    <div className="text-[10px] text-[#787b86]">Market Cap</div>
                    <div className="font-mono text-[11px] font-semibold text-white mt-0.5">
                      {ticker.marketCap}
                    </div>
                  </div>
                )}
                {ticker.peRatio && (
                  <div className="p-2.5 rounded bg-[#131722] border border-[#2a2e39]">
                    <div className="text-[10px] text-[#787b86]">P/E Ratio</div>
                    <div className="font-mono text-[11px] font-semibold text-white mt-0.5">
                      {ticker.peRatio}
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Rating Bar */}
              <div className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-[#787b86]">Technical Summary</span>
                  <span
                    className={`text-xs font-bold ${
                      ticker.technicalRating.includes('Buy')
                        ? 'text-[#089981]'
                        : ticker.technicalRating.includes('Sell')
                        ? 'text-[#f23645]'
                        : 'text-[#f7931a]'
                    }`}
                  >
                    {ticker.technicalRating}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#2a2e39] flex overflow-hidden">
                  <div className="w-1/5 bg-[#f23645]" />
                  <div className="w-1/5 bg-[#f23645]/50" />
                  <div className="w-1/5 bg-[#787b86]" />
                  <div className="w-1/5 bg-[#089981]/50" />
                  <div className="w-1/5 bg-[#089981]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
