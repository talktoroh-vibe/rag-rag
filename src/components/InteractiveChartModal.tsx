import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MarketTicker, Candle, Level2Item, TradeTapeItem } from '../types/market';
import { useMarket } from '../context/MarketContext';
import { generateCandles, generateLevel2Book, generateTradeTape } from '../data/mockMarketData';
import {
  X,
  TrendingUp,
  TrendingDown,
  Bookmark,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  Crosshair,
  TrendingUp as TrendLineIcon,
  Minus,
  Percent,
  Trash2,
  BarChart2,
  Layers,
  BookOpen,
  Sliders,
  DollarSign,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface InteractiveChartModalProps {
  ticker: MarketTicker | null;
  onClose: () => void;
}

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W';
type ChartStyle = 'candles' | 'line' | 'area';
type DrawingTool = 'crosshair' | 'trendline' | 'horizontal' | 'fibonacci' | 'measure';

interface DrawnLine {
  id: string;
  type: 'trendline' | 'horizontal' | 'fibonacci';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  price1: number;
  price2: number;
}

export const InteractiveChartModal: React.FC<InteractiveChartModalProps> = ({
  ticker,
  onClose,
}) => {
  const {
    formatPrice,
    toggleWatchlist,
    isInWatchlist,
    executeTrade,
    soundEnabled,
    setSoundEnabled,
  } = useMarket();

  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('candles');
  const [showSMA, setShowSMA] = useState<boolean>(true);
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(true);
  const [showMACD, setShowMACD] = useState<boolean>(false);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeSideTab, setActiveSideTab] = useState<'trade' | 'orderbook' | 'fundamentals'>('trade');

  // Drawing tools state
  const [activeTool, setActiveTool] = useState<DrawingTool>('crosshair');
  const [drawings, setDrawings] = useState<DrawnLine[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number; price: number } | null>(null);

  // Paper Trade State
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState<string>(ticker?.price.toFixed(2) || '0');
  const [quantity, setQuantity] = useState<number>(10);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [orderNotice, setOrderNotice] = useState<{ text: string; success: boolean } | null>(null);

  // Level 2 Order Book & Trade Tape
  const [level2, setLevel2] = useState(() => generateLevel2Book(ticker?.price || 100));
  const [tradeTape, setTradeTape] = useState<TradeTapeItem[]>(() => generateTradeTape(ticker?.price || 100));

  // Sync Level 2 & Trade Tape on live ticks
  useEffect(() => {
    if (!ticker) return;
    const interval = setInterval(() => {
      setLevel2(generateLevel2Book(ticker.price));
      setTradeTape((prev) => {
        const newTape = generateTradeTape(ticker.price);
        return [newTape[0], ...prev.slice(0, 8)];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [ticker?.price]);

  // Generate dynamic candles
  const candles = useMemo(() => {
    if (!ticker) return [];
    const count = 65;
    const vol = timeframe === '1m' ? 0.005 : timeframe === '1D' ? 0.025 : 0.012;
    return generateCandles(ticker.price, count, vol);
  }, [ticker?.symbol, ticker?.price, timeframe]);

  const activeCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  // Dimensions
  const chartHeight = 330;
  const chartWidth = 760;
  const subPaneHeight = showRSI || showMACD ? 75 : 0;

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

  const maxVolume = useMemo(() => {
    return Math.max(...candles.map((c) => c.volume), 1);
  }, [candles]);

  // Technical Indicators calculations
  const smaPoints = useMemo(() => {
    const period = 14;
    return candles.map((_, i) => {
      if (i < period - 1) return null;
      const slice = candles.slice(i - period + 1, i + 1);
      return slice.reduce((sum, c) => sum + c.close, 0) / period;
    });
  }, [candles]);

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

  // Bollinger Bands (20, 2)
  const bollingerBands = useMemo(() => {
    const period = 20;
    return candles.map((_, i) => {
      if (i < period - 1) return null;
      const slice = candles.slice(i - period + 1, i + 1);
      const mean = slice.reduce((sum, c) => sum + c.close, 0) / period;
      const variance = slice.reduce((sum, c) => sum + Math.pow(c.close - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      return {
        upper: mean + 2 * stdDev,
        middle: mean,
        lower: mean - 2 * stdDev,
      };
    });
  }, [candles]);

  // RSI(14)
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
        gains = gains * 0.9 + (diff > 0 ? diff : 0) * 0.1;
        losses = losses * 0.9 + (diff < 0 ? Math.abs(diff) : 0) * 0.1;
      } else {
        rsis.push(50);
      }
    }
    return [50, ...rsis];
  }, [candles]);

  // Canvas drawing handler
  const handleChartMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'crosshair') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * chartWidth;
    const y = ((e.clientY - rect.top) / rect.height) * chartHeight;
    const price = maxPrice - (y / chartHeight) * priceRange;

    if (activeTool === 'horizontal') {
      const newLine: DrawnLine = {
        id: `line-${Date.now()}`,
        type: 'horizontal',
        x1: 0,
        y1: y,
        x2: chartWidth - 70,
        y2: y,
        price1: price,
        price2: price,
      };
      setDrawings((prev) => [...prev, newLine]);
      setActiveTool('crosshair');
    } else {
      setIsDrawing(true);
      setDrawStart({ x, y, price });
    }
  };

  const handleChartMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !drawStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * chartWidth;
    const y = ((e.clientY - rect.top) / rect.height) * chartHeight;
    const price = maxPrice - (y / chartHeight) * priceRange;

    const newLine: DrawnLine = {
      id: `line-${Date.now()}`,
      type: activeTool === 'fibonacci' ? 'fibonacci' : 'trendline',
      x1: drawStart.x,
      y1: drawStart.y,
      x2: x,
      y2: y,
      price1: drawStart.price,
      price2: price,
    };
    setDrawings((prev) => [...prev, newLine]);
    setIsDrawing(false);
    setDrawStart(null);
    setActiveTool('crosshair');
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;
    const price = orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : ticker.price;
    const res = executeTrade(ticker.symbol, orderSide, quantity, price);
    setOrderNotice({ text: res.message, success: res.success });
    setTimeout(() => setOrderNotice(null), 4000);
  };

  if (!ticker) return null;

  const isUp = ticker.changePercent >= 0;
  const inWatchlist = isInWatchlist(ticker.symbol);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className={`bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isExpanded
            ? 'w-full h-full max-w-[99vw] max-h-[98vh]'
            : 'w-full max-w-7xl max-h-[92vh]'
        }`}
      >
        {/* Top Bar */}
        <div className="px-5 py-2.5 border-b border-[#2a2e39] bg-[#131722] flex flex-wrap items-center justify-between gap-4 select-none">
          {/* Symbol Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2962ff]/20 text-[#2962ff] border border-[#2962ff]/30 flex items-center justify-center font-bold text-sm">
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
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#2a2e39] text-[#089981] font-bold">
                  PRO LEVEL 2
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
                <span className="text-[#787b86] hidden sm:inline">·</span>
                <span className="text-[#787b86] hidden sm:inline">Vol: {ticker.volume}</span>
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

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border border-[#2a2e39] text-xs transition-colors ${
                soundEnabled ? 'text-[#089981] bg-[#089981]/15' : 'text-[#787b86] hover:text-white'
              }`}
              title={soundEnabled ? 'Terminal audio feedback active' : 'Audio feedback muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

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
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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

        {/* Indicators and Chart Tools Toolbar */}
        <div className="px-5 py-2 bg-[#171b26] border-b border-[#2a2e39] flex flex-wrap items-center justify-between gap-3 text-xs select-none">
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
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-0.5 rounded ${
                showBollinger ? 'bg-[#00bcd4]/20 text-[#00bcd4] font-medium' : 'text-[#787b86] hover:text-white'
              }`}
            >
              BB(20,2)
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-0.5 rounded ${
                showVolume ? 'bg-[#2a2e39] text-white font-medium' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Vol
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

        {/* Modal Main Content: Chart + Left Drawing Toolbar + Right Pro Panel */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Left Vertical Drawing Tools Palette (TradingView Signature) */}
          <div className="hidden sm:flex flex-col items-center gap-1 p-2 bg-[#171b26] border-r border-[#2a2e39] w-12 shrink-0 select-none">
            <button
              onClick={() => setActiveTool('crosshair')}
              className={`p-2 rounded transition-colors ${
                activeTool === 'crosshair' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
              }`}
              title="Crosshair pointer"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTool('trendline')}
              className={`p-2 rounded transition-colors ${
                activeTool === 'trendline' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
              }`}
              title="Draw Trendline (Click & Drag)"
            >
              <TrendLineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTool('horizontal')}
              className={`p-2 rounded transition-colors ${
                activeTool === 'horizontal' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
              }`}
              title="Horizontal Support / Resistance Ray (Click on Chart)"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTool('fibonacci')}
              className={`p-2 rounded transition-colors ${
                activeTool === 'fibonacci' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
              }`}
              title="Fibonacci Retracement Grid (Click & Drag)"
            >
              <Percent className="w-4 h-4" />
            </button>
            <div className="h-px w-6 bg-[#2a2e39] my-1" />
            <button
              onClick={() => setDrawings([])}
              className="p-2 rounded text-[#787b86] hover:text-[#f23645] hover:bg-[#2a2e39] transition-colors"
              title="Clear all drawings"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Main Chart Canvas Area (8 cols on lg) */}
          <div className="lg:col-span-8 p-4 flex flex-col border-b lg:border-b-0 lg:border-r border-[#2a2e39] bg-[#131722] relative">
            {orderNotice && (
              <div
                className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 text-xs font-semibold rounded-lg shadow-xl flex items-center gap-2 ${
                  orderNotice.success ? 'bg-[#089981] text-white' : 'bg-[#f23645] text-white'
                }`}
              >
                {orderNotice.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {orderNotice.text}
              </div>
            )}

            {/* Interactive SVG Chart */}
            <div className="w-full flex-1 min-h-[380px] relative select-none">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight + subPaneHeight}`}
                className="w-full h-full block cursor-crosshair"
                preserveAspectRatio="none"
                onMouseDown={handleChartMouseDown}
                onMouseUp={handleChartMouseUp}
                onMouseLeave={() => setHoveredCandle(null)}
              >
                <defs>
                  <linearGradient id="pro-area-grad" x1="0" y1="0" x2="0" y2="1">
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

                {/* Volume Profile Bars */}
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

                {/* Bollinger Bands */}
                {showBollinger && (() => {
                  const candleWidth = (chartWidth - 80) / candles.length;
                  const upperPts: string[] = [];
                  const lowerPts: string[] = [];
                  bollingerBands.forEach((bb, i) => {
                    if (bb) {
                      const x = i * candleWidth + candleWidth * 0.5;
                      const uY = chartHeight - ((bb.upper - minPrice) / priceRange) * chartHeight;
                      const lY = chartHeight - ((bb.lower - minPrice) / priceRange) * chartHeight;
                      upperPts.push(`${x},${uY}`);
                      lowerPts.push(`${x},${lY}`);
                    }
                  });
                  return (
                    <g>
                      <path d={`M ${upperPts.join(' L ')}`} fill="none" stroke="#00bcd4" strokeWidth="1" strokeDasharray="2 2" opacity={0.6} />
                      <path d={`M ${lowerPts.join(' L ')}`} fill="none" stroke="#00bcd4" strokeWidth="1" strokeDasharray="2 2" opacity={0.6} />
                    </g>
                  );
                })()}

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
                        onMouseEnter={() => setHoveredCandle(candle)}
                      >
                        <line x1={xCenter} y1={highY} x2={xCenter} y2={lowY} stroke={color} strokeWidth="1.2" />
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
                      {chartStyle === 'area' && <path d={areaD} fill="url(#pro-area-grad)" />}
                      <path d={pathD} fill="none" stroke="#2962ff" strokeWidth="2" strokeLinecap="round" />
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
                    <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#2962ff" strokeWidth="1.5" strokeDasharray="4 2" />
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
                  return <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#f7931a" strokeWidth="1.5" />;
                })()}

                {/* User Drawn Objects (Trendlines, Horizontal rays, Fibonacci) */}
                {drawings.map((draw) => {
                  if (draw.type === 'horizontal') {
                    return (
                      <g key={draw.id}>
                        <line x1="0" y1={draw.y1} x2={chartWidth - 65} y2={draw.y1} stroke="#f7931a" strokeWidth="1.5" />
                        <text x={chartWidth - 70} y={draw.y1 - 4} fill="#f7931a" fontSize="10" textAnchor="end" fontFamily="monospace">
                          Ray: {draw.price1.toFixed(2)}
                        </text>
                      </g>
                    );
                  }
                  if (draw.type === 'trendline') {
                    return (
                      <line
                        key={draw.id}
                        x1={draw.x1}
                        y1={draw.y1}
                        x2={draw.x2}
                        y2={draw.y2}
                        stroke="#00e676"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    );
                  }
                  if (draw.type === 'fibonacci') {
                    const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
                    const yDiff = draw.y2 - draw.y1;
                    return (
                      <g key={draw.id}>
                        {fibLevels.map((lvl) => {
                          const lvlY = draw.y1 + yDiff * lvl;
                          return (
                            <g key={lvl}>
                              <line x1="0" y1={lvlY} x2={chartWidth - 65} y2={lvlY} stroke="#ffd600" strokeWidth="1" strokeDasharray="3 3" opacity={0.7} />
                              <text x="10" y={lvlY - 3} fill="#ffd600" fontSize="9" fontFamily="monospace">
                                Fib {(lvl * 100).toFixed(1)}%
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  }
                  return null;
                })}

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
                  const rsiInnerHeight = subPaneHeight - 20;
                  const candleWidth = (chartWidth - 80) / candles.length;
                  const rsiPoints = rsiValues.map((val, i) => {
                    const x = i * candleWidth + candleWidth * 0.5;
                    const y = startY + rsiInnerHeight - (val / 100) * rsiInnerHeight;
                    return `${x},${y}`;
                  });

                  return (
                    <g>
                      <line x1="0" y1={startY} x2={chartWidth} y2={startY} stroke="#2a2e39" strokeWidth="1" />
                      <text x="10" y={startY + 14} fill="#ba68c8" fontSize="10" fontWeight="bold">
                        RSI(14)
                      </text>
                      <line x1="0" y1={startY + rsiInnerHeight * 0.3} x2={chartWidth - 65} y2={startY + rsiInnerHeight * 0.3} stroke="#ba68c8" strokeDasharray="2 2" strokeWidth="0.75" opacity={0.4} />
                      <line x1="0" y1={startY + rsiInnerHeight * 0.7} x2={chartWidth - 65} y2={startY + rsiInnerHeight * 0.7} stroke="#ba68c8" strokeDasharray="2 2" strokeWidth="0.75" opacity={0.4} />
                      <path d={`M ${rsiPoints.join(' L ')}`} fill="none" stroke="#ba68c8" strokeWidth="1.5" />
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

          {/* Right Panel: Pro Tabs (Trading / Level 2 Order Book / Fundamentals) */}
          <div className="lg:col-span-4 p-4 bg-[#1e222d] flex flex-col gap-4 overflow-y-auto">
            {/* Pro Tab Selector */}
            <div className="flex items-center p-1 bg-[#131722] rounded-lg border border-[#2a2e39] text-xs">
              <button
                onClick={() => setActiveSideTab('trade')}
                className={`flex-1 py-1.5 font-bold rounded transition-colors text-center ${
                  activeSideTab === 'trade' ? 'bg-[#2962ff] text-white shadow' : 'text-[#787b86] hover:text-white'
                }`}
              >
                Trade
              </button>
              <button
                onClick={() => setActiveSideTab('orderbook')}
                className={`flex-1 py-1.5 font-bold rounded transition-colors text-center ${
                  activeSideTab === 'orderbook' ? 'bg-[#2962ff] text-white shadow' : 'text-[#787b86] hover:text-white'
                }`}
              >
                Level 2 Book
              </button>
              <button
                onClick={() => setActiveSideTab('fundamentals')}
                className={`flex-1 py-1.5 font-bold rounded transition-colors text-center ${
                  activeSideTab === 'fundamentals' ? 'bg-[#2962ff] text-white shadow' : 'text-[#787b86] hover:text-white'
                }`}
              >
                Valuation
              </button>
            </div>

            {/* TAB 1: Paper Trading Order Entry */}
            {activeSideTab === 'trade' && (
              <div className="p-3.5 rounded-lg bg-[#131722] border border-[#2a2e39] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Institutional Order Entry
                  </span>
                  <span className="text-[10px] text-[#089981] font-mono bg-[#089981]/15 px-1.5 py-0.5 rounded">
                    Simulated Fill
                  </span>
                </div>

                {/* Buy / Sell switch */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#1e222d] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setOrderSide('buy')}
                    className={`py-1.5 text-xs font-bold rounded transition-colors ${
                      orderSide === 'buy' ? 'bg-[#089981] text-white shadow' : 'text-[#787b86] hover:text-white'
                    }`}
                  >
                    BUY / LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderSide('sell')}
                    className={`py-1.5 text-xs font-bold rounded transition-colors ${
                      orderSide === 'sell' ? 'bg-[#f23645] text-white shadow' : 'text-[#787b86] hover:text-white'
                    }`}
                  >
                    SELL / SHORT
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

                  {orderType === 'limit' && (
                    <div>
                      <span className="text-[10px] text-[#787b86] block mb-1">Limit Price</span>
                      <input
                        type="number"
                        step="0.01"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-[#1e222d] border border-[#2a2e39] text-xs font-mono text-white focus:outline-none focus:border-[#2962ff]"
                      />
                    </div>
                  )}

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

                  {/* Stop Loss & Take Profit Triggers */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#787b86] block mb-0.5">Stop Loss (optional)</span>
                      <input
                        type="number"
                        placeholder="Stop $"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-[#1e222d] border border-[#2a2e39] font-mono text-[11px] text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#787b86] block mb-0.5">Take Profit (optional)</span>
                      <input
                        type="number"
                        placeholder="Target $"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-[#1e222d] border border-[#2a2e39] font-mono text-[11px] text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs py-2 border-t border-[#2a2e39]">
                    <span className="text-[#787b86]">Order Value:</span>
                    <span className="font-mono font-bold text-white">
                      {formatPrice(
                        (orderType === 'limit' ? parseFloat(limitPrice) || ticker.price : ticker.price) * quantity,
                        ticker.symbol
                      )}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition-opacity shadow ${
                      orderSide === 'buy' ? 'bg-[#089981] hover:opacity-90' : 'bg-[#f23645] hover:opacity-90'
                    }`}
                  >
                    SUBMIT {orderSide.toUpperCase()} ORDER
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: Level 2 Order Book & Trade Tape */}
            {activeSideTab === 'orderbook' && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39]">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-bold text-white">Level 2 Depth</span>
                    <span className="font-mono text-[#787b86] text-[11px]">
                      Spread: ${level2.spread}
                    </span>
                  </div>

                  {/* Asks (Red) */}
                  <div className="space-y-1 font-mono text-[11px]">
                    {level2.asks.slice().reverse().map((ask, idx) => (
                      <div key={idx} className="relative flex justify-between px-1 py-0.5">
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-[#f23645]/15"
                          style={{ width: `${Math.min((ask.total / 3000) * 100, 100)}%` }}
                        />
                        <span className="text-[#f23645] font-semibold z-10">{ask.price.toFixed(2)}</span>
                        <span className="text-[#787b86] z-10">{ask.size}</span>
                      </div>
                    ))}
                  </div>

                  {/* Current Mid Price Banner */}
                  <div className="my-2 py-1 bg-[#1e222d] text-center font-mono text-xs font-bold text-white border-y border-[#2a2e39]">
                    {formatPrice(ticker.price, ticker.symbol)}
                  </div>

                  {/* Bids (Green) */}
                  <div className="space-y-1 font-mono text-[11px]">
                    {level2.bids.map((bid, idx) => (
                      <div key={idx} className="relative flex justify-between px-1 py-0.5">
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-[#089981]/15"
                          style={{ width: `${Math.min((bid.total / 3000) * 100, 100)}%` }}
                        />
                        <span className="text-[#089981] font-semibold z-10">{bid.price.toFixed(2)}</span>
                        <span className="text-[#787b86] z-10">{bid.size}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time & Sales Feed */}
                <div className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39]">
                  <span className="text-xs font-bold text-white block mb-2">Time & Sales (Tape)</span>
                  <div className="space-y-1 font-mono text-[11px]">
                    {tradeTape.map((trade) => (
                      <div key={trade.id} className="flex justify-between items-center text-[#787b86]">
                        <span>{trade.time}</span>
                        <span className={trade.side === 'buy' ? 'text-[#089981]' : 'text-[#f23645]'}>
                          {trade.price.toFixed(2)}
                        </span>
                        <span className="text-white">{trade.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Valuation & Multi-Period Returns */}
            {activeSideTab === 'fundamentals' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39] space-y-2 text-xs">
                  <span className="font-bold text-white block uppercase tracking-wider text-[11px]">
                    Performance Returns
                  </span>
                  <div className="grid grid-cols-3 gap-2 font-mono text-center">
                    <div className="p-1.5 rounded bg-[#1e222d]">
                      <span className="text-[#787b86] block text-[10px]">1-WEEK</span>
                      <span className={ticker.change1W && ticker.change1W >= 0 ? 'text-[#089981] font-bold' : 'text-[#f23645] font-bold'}>
                        {ticker.change1W ? `${ticker.change1W > 0 ? '+' : ''}${ticker.change1W}%` : '--'}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-[#1e222d]">
                      <span className="text-[#787b86] block text-[10px]">1-MONTH</span>
                      <span className={ticker.change1M && ticker.change1M >= 0 ? 'text-[#089981] font-bold' : 'text-[#f23645] font-bold'}>
                        {ticker.change1M ? `${ticker.change1M > 0 ? '+' : ''}${ticker.change1M}%` : '--'}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-[#1e222d]">
                      <span className="text-[#787b86] block text-[10px]">YTD</span>
                      <span className={ticker.changeYTD && ticker.changeYTD >= 0 ? 'text-[#089981] font-bold' : 'text-[#f23645] font-bold'}>
                        {ticker.changeYTD ? `${ticker.changeYTD > 0 ? '+' : ''}${ticker.changeYTD}%` : '--'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39] space-y-2 text-xs">
                  <span className="font-bold text-white block uppercase tracking-wider text-[11px]">
                    Valuation & Profile
                  </span>
                  <div className="divide-y divide-[#2a2e39]/50 font-mono text-[11px]">
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#787b86]">Market Cap</span>
                      <span className="text-white">{ticker.marketCap || '--'}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#787b86]">P/E Ratio</span>
                      <span className="text-white">{ticker.peRatio || '--'}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#787b86]">EPS</span>
                      <span className="text-white">{ticker.eps ? `$${ticker.eps}` : '--'}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#787b86]">All-Time High</span>
                      <span className="text-[#f7931a]">{ticker.ath ? `$${ticker.ath}` : '--'}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#787b86]">RSI (14)</span>
                      <span className="text-white font-bold">{ticker.rsi || 58.4}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
