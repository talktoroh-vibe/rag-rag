import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { Sparkline } from '../ui/Sparkline';
import { MOCK_NEWS, MOCK_ECONOMIC_EVENTS } from '../../data/mockMarketData';
import { MarketTicker } from '../../types/market';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Bookmark,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Flame,
  BarChart3,
  Globe2,
} from 'lucide-react';

export const OverviewScreen: React.FC = () => {
  const { tickers, formatPrice, flashMap, openChartForSymbol, toggleWatchlist, isInWatchlist } = useMarket();

  const [moverFilter, setMoverFilter] = useState<'active' | 'gainers' | 'losers' | 'largeCap'>('active');
  const [indexTimeframe, setIndexTimeframe] = useState<Record<string, string>>({
    SPX: '1D',
    NDX: '1D',
    BTCUSDT: '1D',
    XAUUSD: '1D',
  });

  // 4 Featured Market Banners
  const featuredSymbols = ['SPX', 'NDX', 'BTCUSDT', 'XAUUSD'];
  const featuredTickers = featuredSymbols
    .map((s) => tickers.find((t) => t.symbol === s))
    .filter(Boolean) as MarketTicker[];

  // Filter tickers for Market Movers
  const getMovers = () => {
    const list = [...tickers];
    switch (moverFilter) {
      case 'gainers':
        return list.sort((a, b) => b.changePercent - a.changePercent).slice(0, 7);
      case 'losers':
        return list.sort((a, b) => a.changePercent - b.changePercent).slice(0, 7);
      case 'largeCap':
        return list
          .filter((t) => t.marketCap)
          .sort((a, b) => {
            const capA = parseFloat(a.marketCap?.replace(/[^0-9.]/g, '') || '0');
            const capB = parseFloat(b.marketCap?.replace(/[^0-9.]/g, '') || '0');
            return capB - capA;
          })
          .slice(0, 7);
      case 'active':
      default:
        return list.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 7);
    }
  };

  // Sectors Barometer Data
  const sectors = [
    { name: 'Technology', change: +2.14, leader: 'NVDA +3.17%' },
    { name: 'Consumer Cyclical', change: +1.65, leader: 'TSLA +4.74%' },
    { name: 'Communication', change: +1.32, leader: 'META +1.45%' },
    { name: 'Financials', change: +0.28, leader: 'COIN +6.44%' },
    { name: 'Healthcare', change: -0.62, leader: 'UNH +0.35%' },
    { name: 'Energy', change: -1.04, leader: 'XOM -0.92%' },
  ];

  return (
    <div className="space-y-6">
      {/* SECTION 1: Featured 4 Major Markets Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Global Market Indices & Benchmarks
            </h2>
          </div>
          <span className="text-xs text-[#787b86]">
            Real-time multi-asset aggregation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredTickers.map((item) => {
            const isUp = item.changePercent >= 0;
            const flash = flashMap[item.symbol];

            return (
              <div
                key={item.symbol}
                className={`p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-col justify-between hover:border-[#434651] transition-all duration-200 cursor-pointer shadow-sm group ${
                  flash === 'up'
                    ? 'flash-up bg-[#089981]/10'
                    : flash === 'down'
                    ? 'flash-down bg-[#f23645]/10'
                    : ''
                }`}
                onClick={() => openChartForSymbol(item.symbol)}
              >
                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white group-hover:text-[#2962ff] transition-colors">
                        {item.symbol}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#131722] text-[#787b86]">
                        {item.assetClass}
                      </span>
                    </div>
                    <div className="text-xs text-[#787b86] font-medium truncate mt-0.5">
                      {item.name}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(item.symbol);
                    }}
                    className={`p-1.5 rounded-lg border border-[#2a2e39] ${
                      isInWatchlist(item.symbol)
                        ? 'bg-[#2962ff]/20 text-[#2962ff]'
                        : 'text-[#787b86] hover:text-white hover:bg-[#131722]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Price & Change */}
                <div className="my-3 font-mono">
                  <div className="text-2xl font-bold text-white tracking-tight tabular-nums">
                    {formatPrice(item.price, item.symbol)}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold tabular-nums mt-0.5 ${
                      isUp ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isUp ? '+' : ''}
                      {item.change.toFixed(2)} ({isUp ? '+' : ''}
                      {item.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* Interactive Mini Sparkline */}
                <div className="h-16 w-full my-1">
                  <Sparkline
                    data={item.sparkline}
                    width={260}
                    height={64}
                    isPositive={isUp}
                    strokeWidth={2}
                    showGradient={true}
                  />
                </div>

                {/* 24h High/Low bar */}
                <div className="pt-3 border-t border-[#2a2e39]/60 text-[11px] font-mono text-[#787b86]">
                  <div className="flex justify-between mb-1">
                    <span>L: {formatPrice(item.low24h, item.symbol)}</span>
                    <span>H: {formatPrice(item.high24h, item.symbol)}</span>
                  </div>
                  <div className="w-full h-1 bg-[#131722] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isUp ? 'bg-[#089981]' : 'bg-[#f23645]'}`}
                      style={{
                        width: `${Math.min(
                          Math.max(
                            ((item.price - item.low24h) / (item.high24h - item.low24h || 1)) * 100,
                            5
                          ),
                          95
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Market Movers Screener & Sector Barometer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Movers Table (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#f7931a]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Market Movers
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#131722] rounded-lg border border-[#2a2e39] text-xs">
              <button
                onClick={() => setMoverFilter('active')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  moverFilter === 'active'
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#787b86] hover:text-white'
                }`}
              >
                Most Active
              </button>
              <button
                onClick={() => setMoverFilter('gainers')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  moverFilter === 'gainers'
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#787b86] hover:text-white'
                }`}
              >
                Top Gainers
              </button>
              <button
                onClick={() => setMoverFilter('losers')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  moverFilter === 'losers'
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#787b86] hover:text-white'
                }`}
              >
                Top Losers
              </button>
              <button
                onClick={() => setMoverFilter('largeCap')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  moverFilter === 'largeCap'
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#787b86] hover:text-white'
                }`}
              >
                Large Cap
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2a2e39] text-[#787b86] font-medium">
                  <th className="pb-2.5 font-semibold">Symbol</th>
                  <th className="pb-2.5 text-right font-semibold">Last Price</th>
                  <th className="pb-2.5 text-right font-semibold">Chg $</th>
                  <th className="pb-2.5 text-right font-semibold">Chg %</th>
                  <th className="pb-2.5 text-right font-semibold hidden sm:table-cell">24h Vol</th>
                  <th className="pb-2.5 text-right font-semibold hidden md:table-cell">Rating</th>
                  <th className="pb-2.5 text-center font-semibold w-16">Trend</th>
                  <th className="pb-2.5 text-right font-semibold w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e39]/60">
                {getMovers().map((mover) => {
                  const isUp = mover.changePercent >= 0;
                  const flash = flashMap[mover.symbol];

                  return (
                    <tr
                      key={mover.symbol}
                      onClick={() => openChartForSymbol(mover.symbol)}
                      className={`hover:bg-[#131722] transition-colors cursor-pointer group ${
                        flash === 'up'
                          ? 'flash-up bg-[#089981]/15'
                          : flash === 'down'
                          ? 'flash-down bg-[#f23645]/15'
                          : ''
                      }`}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-[#131722] border border-[#2a2e39] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {mover.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                              {mover.symbol}
                            </span>
                            <div className="text-[11px] text-[#787b86] truncate max-w-[120px]">
                              {mover.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-right font-mono font-semibold text-white tabular-nums">
                        {formatPrice(mover.price, mover.symbol)}
                      </td>

                      <td
                        className={`py-3 text-right font-mono font-medium tabular-nums ${
                          isUp ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {mover.change.toFixed(2)}
                      </td>

                      <td className="py-3 text-right font-mono tabular-nums">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            isUp ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {mover.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-3 text-right font-mono text-[#787b86] hidden sm:table-cell tabular-nums">
                        {mover.volume}
                      </td>

                      <td className="py-3 text-right hidden md:table-cell">
                        <span
                          className={`text-[11px] font-semibold ${
                            mover.technicalRating.includes('Buy')
                              ? 'text-[#089981]'
                              : mover.technicalRating.includes('Sell')
                              ? 'text-[#f23645]'
                              : 'text-[#787b86]'
                          }`}
                        >
                          {mover.technicalRating}
                        </span>
                      </td>

                      <td className="py-3 text-center">
                        <div className="w-16 h-6 mx-auto opacity-75">
                          <Sparkline
                            data={mover.sparkline}
                            width={64}
                            height={24}
                            isPositive={isUp}
                            strokeWidth={1.5}
                            showGradient={false}
                          />
                        </div>
                      </td>

                      <td className="py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(mover.symbol);
                          }}
                          className={`p-1 rounded text-[#787b86] hover:text-white ${
                            isInWatchlist(mover.symbol) ? 'text-[#2962ff]' : ''
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sector Barometer & Market Temperature (1 Col) */}
        <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#2962ff]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Sector Performance
                </h2>
              </div>
              <span className="text-[11px] text-[#787b86] font-mono">1-Day Chg</span>
            </div>

            <div className="space-y-3.5">
              {sectors.map((sec) => {
                const isSecUp = sec.change >= 0;
                return (
                  <div key={sec.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">{sec.name}</span>
                      <span
                        className={`font-mono font-bold ${
                          isSecUp ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isSecUp ? '+' : ''}
                        {sec.change.toFixed(2)}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#131722] rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${isSecUp ? 'bg-[#089981]' : 'bg-[#f23645]'}`}
                        style={{ width: `${Math.min(Math.abs(sec.change) * 30 + 15, 100)}%` }}
                      />
                    </div>

                    <div className="text-[10px] text-[#787b86] flex justify-between">
                      <span>Leader: {sec.leader}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-[#131722] border border-[#2a2e39]">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Market Breadth (Advancers / Decliners)</span>
              <span className="font-mono text-[#089981]">62% Advancing</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#f23645] mt-2 overflow-hidden flex">
              <div className="w-[62%] bg-[#089981] h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Breaking Financial News & Economic Calendar Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curated Market News (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Live Market News & Editorial Stream
            </h2>
            <span className="text-xs text-[#787b86]">Updated continuously</span>
          </div>

          <div className="space-y-3.5">
            {MOCK_NEWS.map((news) => (
              <div
                key={news.id}
                className="p-3.5 rounded-lg bg-[#131722] border border-[#2a2e39] hover:border-[#434651] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-[#787b86] mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                      {news.source}
                    </span>
                    <span>·</span>
                    <span>{news.timeAgo}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                      news.sentiment === 'bullish'
                        ? 'bg-[#089981]/15 text-[#089981]'
                        : news.sentiment === 'bearish'
                        ? 'bg-[#f23645]/15 text-[#f23645]'
                        : 'bg-[#2a2e39] text-[#787b86]'
                    }`}
                  >
                    {news.sentiment}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-[#2962ff] transition-colors leading-snug">
                  {news.title}
                </h3>
                <p className="text-xs text-[#787b86] mt-1 line-clamp-2">
                  {news.summary}
                </p>

                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[10px] text-[#787b86]">Related:</span>
                  {news.relatedTickers.map((sym) => (
                    <button
                      key={sym}
                      onClick={(e) => {
                        e.stopPropagation();
                        openChartForSymbol(sym);
                      }}
                      className="px-1.5 py-0.5 rounded bg-[#1e222d] text-[#2962ff] text-[10px] font-mono font-semibold hover:bg-[#2962ff] hover:text-white transition-colors"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Economic Calendar (1 Col) */}
        <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2962ff]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Economic Calendar
              </h2>
            </div>
            <span className="text-xs text-[#787b86]">Today's Releases</span>
          </div>

          <div className="space-y-3">
            {MOCK_ECONOMIC_EVENTS.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39] text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-[#787b86]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{event.flag}</span>
                    <span className="font-semibold text-white">{event.country}</span>
                  </div>
                  <span className="font-mono text-[11px]">{event.time}</span>
                </div>

                <div className="font-semibold text-white">{event.title}</div>

                <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-[#2a2e39]/50 font-mono text-[11px]">
                  <div>
                    <span className="text-[#787b86] block text-[9px]">ACTUAL</span>
                    <span className="font-bold text-[#089981]">{event.actual || '--'}</span>
                  </div>
                  <div>
                    <span className="text-[#787b86] block text-[9px]">FORECAST</span>
                    <span className="text-[#9598a1]">{event.forecast}</span>
                  </div>
                  <div>
                    <span className="text-[#787b86] block text-[9px]">PREVIOUS</span>
                    <span className="text-[#787b86]">{event.previous}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
