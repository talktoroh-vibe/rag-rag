import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { Sparkline } from '../ui/Sparkline';
import { MOCK_EARNINGS } from '../../data/mockMarketData';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Bookmark,
  Calendar,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';

export const StocksScreen: React.FC = () => {
  const { tickers, formatPrice, flashMap, openChartForSymbol, toggleWatchlist, isInWatchlist } = useMarket();

  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortBy, setSortBy] = useState<'marketCap' | 'changePercent' | 'volume' | 'peRatio'>('marketCap');

  const stockTickers = useMemo(() => {
    return tickers.filter((t) => t.assetClass === 'stocks');
  }, [tickers]);

  const sectors = ['All', 'Technology', 'Communication', 'Consumer Cyclical', 'Financials', 'Healthcare'];

  const filteredStocks = useMemo(() => {
    return stockTickers
      .filter((s) => {
        const matchesSector = selectedSector === 'All' || s.sector === selectedSector;
        const matchesSearch =
          s.symbol.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase());
        return matchesSector && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'changePercent') return b.changePercent - a.changePercent;
        if (sortBy === 'peRatio') return (b.peRatio || 0) - (a.peRatio || 0);
        if (sortBy === 'volume') return parseFloat(b.volume) - parseFloat(a.volume);
        // default market cap
        const capA = parseFloat(a.marketCap?.replace(/[^0-9.]/g, '') || '0');
        const capB = parseFloat(b.marketCap?.replace(/[^0-9.]/g, '') || '0');
        return capB - capA;
      });
  }, [stockTickers, selectedSector, search, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">
            Global Stocks Screener
          </h1>
          <p className="text-xs text-[#787b86]">
            Real-time equity quotes, technical indicators, and fundamental metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#787b86] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter stocks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#131722] border border-[#2a2e39] text-xs text-white placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
            />
          </div>

          {/* Sector filter */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                  selectedSector === sec
                    ? 'bg-[#2962ff] text-white font-medium'
                    : 'text-[#787b86] hover:text-white bg-[#131722] border border-[#2a2e39]'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-[#787b86] font-medium">
                <th className="pb-3 font-semibold">Ticker / Company</th>
                <th className="pb-3 text-right font-semibold">Price</th>
                <th className="pb-3 text-right font-semibold">Change</th>
                <th className="pb-3 text-right font-semibold">Change %</th>
                <th className="pb-3 text-right font-semibold">Market Cap</th>
                <th className="pb-3 text-right font-semibold hidden md:table-cell">P/E Ratio</th>
                <th className="pb-3 text-right font-semibold hidden lg:table-cell">EPS</th>
                <th className="pb-3 text-right font-semibold hidden sm:table-cell">Volume</th>
                <th className="pb-3 text-right font-semibold hidden md:table-cell">Technical Rating</th>
                <th className="pb-3 text-center font-semibold w-24">7-Day Trend</th>
                <th className="pb-3 text-right font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {filteredStocks.map((stock) => {
                const isUp = stock.changePercent >= 0;
                const flash = flashMap[stock.symbol];

                return (
                  <tr
                    key={stock.symbol}
                    onClick={() => openChartForSymbol(stock.symbol)}
                    className={`hover:bg-[#131722] transition-colors cursor-pointer group ${
                      flash === 'up'
                        ? 'flash-up bg-[#089981]/15'
                        : flash === 'down'
                        ? 'flash-down bg-[#f23645]/15'
                        : ''
                    }`}
                  >
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#131722] border border-[#2a2e39] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {stock.symbol}
                          </span>
                          <div className="text-[11px] text-[#787b86]">{stock.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-right font-mono font-semibold text-white tabular-nums">
                      {formatPrice(stock.price, stock.symbol)}
                    </td>

                    <td
                      className={`py-3.5 text-right font-mono font-medium tabular-nums ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {stock.change.toFixed(2)}
                    </td>

                    <td className="py-3.5 text-right font-mono tabular-nums">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isUp ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-mono text-white tabular-nums">
                      {stock.marketCap}
                    </td>

                    <td className="py-3.5 text-right font-mono text-[#9598a1] hidden md:table-cell tabular-nums">
                      {stock.peRatio ? stock.peRatio.toFixed(1) : '--'}
                    </td>

                    <td className="py-3.5 text-right font-mono text-[#9598a1] hidden lg:table-cell tabular-nums">
                      ${stock.eps ? stock.eps.toFixed(2) : '--'}
                    </td>

                    <td className="py-3.5 text-right font-mono text-[#787b86] hidden sm:table-cell tabular-nums">
                      {stock.volume}
                    </td>

                    <td className="py-3.5 text-right hidden md:table-cell">
                      <span
                        className={`text-xs font-semibold ${
                          stock.technicalRating.includes('Buy')
                            ? 'text-[#089981]'
                            : stock.technicalRating.includes('Sell')
                            ? 'text-[#f23645]'
                            : 'text-[#787b86]'
                        }`}
                      >
                        {stock.technicalRating}
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      <div className="w-20 h-6 mx-auto opacity-80">
                        <Sparkline
                          data={stock.sparkline}
                          width={80}
                          height={24}
                          isPositive={isUp}
                          strokeWidth={1.5}
                          showGradient={false}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(stock.symbol);
                        }}
                        className={`p-1.5 rounded-lg border border-[#2a2e39] text-[#787b86] hover:text-white hover:bg-[#131722] ${
                          isInWatchlist(stock.symbol) ? 'text-[#2962ff] bg-[#2962ff]/15' : ''
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

      {/* Upcoming Earnings Calendar */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2962ff]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Upcoming Earnings Announcements
            </h2>
          </div>
          <span className="text-xs text-[#787b86]">Q3/Q4 Reporting Schedule</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_EARNINGS.map((earn) => (
            <div
              key={earn.symbol}
              onClick={() => openChartForSymbol(earn.symbol)}
              className="p-4 rounded-lg bg-[#131722] border border-[#2a2e39] hover:border-[#434651] transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-bold text-white group-hover:text-[#2962ff] transition-colors">
                    {earn.symbol}
                  </span>
                  <div className="text-xs text-[#787b86]">{earn.name}</div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2a2e39] text-[#9598a1]">
                  {earn.timing}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-[#2a2e39]/60 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[#787b86] block text-[10px]">EST. EPS</span>
                  <span className="font-bold text-white">${earn.epsEstimate.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[#787b86] block text-[10px]">EST. REVENUE</span>
                  <span className="font-bold text-white">{earn.revenueEstimate}</span>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-[#787b86] flex items-center justify-between">
                <span>Date: {earn.reportDate}</span>
                <span className="text-[#2962ff]">View Chart →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
