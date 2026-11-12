import React, { useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { Sparkline } from './ui/Sparkline';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

export const TickerTape: React.FC = () => {
  const { tickers, formatPrice, flashMap, openChartForSymbol } = useMarket();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Selected top symbols for the marquee tape
  const tapeSymbols = [
    'SPX',
    'NDX',
    'BTCUSDT',
    'ETHUSDT',
    'XAUUSD',
    'USOIL',
    'EURUSD',
    'NVDA',
    'AAPL',
    'TSLA',
    'SOLUSDT',
    'DJI',
    'US10Y',
  ];

  const tapeItems = tapeSymbols
    .map((sym) => tickers.find((t) => t.symbol === sym))
    .filter(Boolean);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full bg-[#131722] border-b border-[#2a2e39] py-1.5 px-2 select-none group">
      {/* Scroll left button */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded bg-[#1e222d]/90 hover:bg-[#2a2e39] text-[#787b86] hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-[#2a2e39] shadow"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Scroll right button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded bg-[#1e222d]/90 hover:bg-[#2a2e39] text-[#787b86] hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-[#2a2e39] shadow"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Marquee Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto scrollbar-none px-4 scroll-smooth"
      >
        {tapeItems.map((item) => {
          if (!item) return null;
          const isUp = item.changePercent >= 0;
          const flash = flashMap[item.symbol];

          return (
            <div
              key={item.symbol}
              onClick={() => openChartForSymbol(item.symbol)}
              className={`flex items-center gap-2.5 px-2.5 py-1 rounded cursor-pointer transition-all duration-300 border border-transparent hover:border-[#2a2e39] hover:bg-[#1e222d] shrink-0 ${
                flash === 'up'
                  ? 'flash-up bg-[#089981]/20'
                  : flash === 'down'
                  ? 'flash-down bg-[#f23645]/20'
                  : ''
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white tracking-wide flex items-center gap-1">
                  {item.symbol}
                </span>
                <span className="text-[10px] text-[#787b86] truncate max-w-[80px]">
                  {item.name}
                </span>
              </div>

              <div className="flex flex-col items-end font-mono">
                <span className="text-xs font-medium text-white tabular-nums">
                  {formatPrice(item.price, item.symbol)}
                </span>
                <div
                  className={`flex items-center gap-0.5 text-[10px] font-medium tabular-nums ${
                    isUp ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-2.5 h-2.5" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5" />
                  )}
                  <span>
                    {isUp ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="w-14 h-6 opacity-75">
                <Sparkline
                  data={item.sparkline}
                  width={56}
                  height={24}
                  isPositive={isUp}
                  strokeWidth={1.5}
                  showGradient={false}
                />
              </div>

              <div className="h-4 w-px bg-[#2a2e39] ml-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
