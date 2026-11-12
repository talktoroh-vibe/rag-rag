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
  Download,
  CheckCircle2,
} from 'lucide-react';

export const StocksScreen: React.FC = () => {
  const { tickers, formatPrice, flashMap, openChartForSymbol, toggleWatchlist, isInWatchlist } = useMarket();

  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [filterPreset, setFilterPreset] = useState<'all' | 'megaCap' | 'oversold' | 'overbought' | 'ath'>('all');
  const [sortBy, setSortBy] = useState<'marketCap' | 'changePercent' | 'change1W' | 'change1M' | 'changeYTD' | 'peRatio' | 'rsi'>('marketCap');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

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

        let matchesPreset = true;
        if (filterPreset === 'megaCap') {
          matchesPreset = s.marketCap?.includes('T') || false;
        } else if (filterPreset === 'oversold') {
          matchesPreset = (s.rsi || 50) < 45;
        } else if (filterPreset === 'overbought') {
          matchesPreset = (s.rsi || 50) > 70;
        } else if (filterPreset === 'ath') {
          matchesPreset = s.ath ? (s.price / s.ath) >= 0.95 : false;
        }

        return matchesSector && matchesSearch && matchesPreset;
      })
      .sort((a, b) => {
        if (sortBy === 'changePercent') return b.changePercent - a.changePercent;
        if (sortBy === 'change1W') return (b.change1W || 0) - (a.change1W || 0);
        if (sortBy === 'change1M') return (b.change1M || 0) - (a.change1M || 0);
        if (sortBy === 'changeYTD') return (b.changeYTD || 0) - (a.changeYTD || 0);
        if (sortBy === 'rsi') return (b.rsi || 0) - (a.rsi || 0);
        if (sortBy === 'peRatio') return (b.peRatio || 0) - (a.peRatio || 0);
        
        // default market cap
        const capA = parseFloat(a.marketCap?.replace(/[^0-9.]/g, '') || '0') * (a.marketCap?.includes('T') ? 1000 : 1);
        const capB = parseFloat(b.marketCap?.replace(/[^0-9.]/g, '') || '0') * (b.marketCap?.includes('T') ? 1000 : 1);
        return capB - capA;
      });
  }, [stockTickers, selectedSector, search, filterPreset, sortBy]);

  const handleExportCSV = () => {
    const headers = ['Symbol,Name,Price,ChangePct,1W_Pct,1M_Pct,YTD_Pct,MarketCap,PE,RSI,Rating\n'];
    const rows = filteredStocks.map(
      (s) =>
        `${s.symbol},"${s.name}",${s.price},${s.changePercent}%,${s.change1W || 0}%,${s.change1M || 0}%,${s.changeYTD || 0}%,${s.marketCap || ''},${s.peRatio || ''},${s.rsi || ''},${s.technicalRating}`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradingView_Stock_Screener_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Exported screener CSV successfully!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-wide">
              Global Equities Screener
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2962ff]/20 text-[#2962ff] border border-[#2962ff]/30">
              PRO
            </span>
          </div>
          <p className="text-xs text-[#787b86]">
            Real-time multi-period returns, valuation multiples, RSI oscillator, and ATH metrics
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

          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131722] hover:bg-[#2a2e39] text-xs text-white border border-[#2a2e39] transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#2962ff]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-[#089981]/15 border border-[#089981]/30 text-[#089981] text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {exportNotice}
        </div>
      )}

      {/* Preset Filters Strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#787b86] font-medium mr-1">Pro Presets:</span>
        <button
          onClick={() => setFilterPreset('all')}
          className={`px-3 py-1 rounded transition-colors ${
            filterPreset === 'all' ? 'bg-[#2962ff] text-white font-medium' : 'bg-[#1e222d] text-[#787b86] hover:text-white border border-[#2a2e39]'
          }`}
        >
          All Equities ({stockTickers.length})
        </button>
        <button
          onClick={() => setFilterPreset('megaCap')}
          className={`px-3 py-1 rounded transition-colors ${
            filterPreset === 'megaCap' ? 'bg-[#2962ff] text-white font-medium' : 'bg-[#1e222d] text-[#787b86] hover:text-white border border-[#2a2e39]'
          }`}
        >
          Trillion Dollar Club (&gt; $1T)
        </button>
        <button
          onClick={() => setFilterPreset('oversold')}
          className={`px-3 py-1 rounded transition-colors ${
            filterPreset === 'oversold' ? 'bg-[#2962ff] text-white font-medium' : 'bg-[#1e222d] text-[#787b86] hover:text-white border border-[#2a2e39]'
          }`}
        >
          RSI Oversold (&lt;45)
        </button>
        <button
          onClick={() => setFilterPreset('overbought')}
          className={`px-3 py-1 rounded transition-colors ${
            filterPreset === 'overbought' ? 'bg-[#2962ff] text-white font-medium' : 'bg-[#1e222d] text-[#787b86] hover:text-white border border-[#2a2e39]'
          }`}
        >
          Momentum Overbought (&gt;70)
        </button>
        <button
          onClick={() => setFilterPreset('ath')}
          className={`px-3 py-1 rounded transition-colors ${
            filterPreset === 'ath' ? 'bg-[#2962ff] text-white font-medium' : 'bg-[#1e222d] text-[#787b86] hover:text-white border border-[#2a2e39]'
          }`}
        >
          Near 52W High (&lt;5% off ATH)
        </button>
      </div>

      {/* Main Stock Table */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-[#787b86] font-medium">
                <th className="pb-3 font-semibold">Ticker / Company</th>
                <th className="pb-3 text-right font-semibold">Price</th>
                <th
                  onClick={() => setSortBy('changePercent')}
                  className="pb-3 text-right font-semibold cursor-pointer hover:text-white"
                >
                  Day Chg % {sortBy === 'changePercent' ? '▼' : ''}
                </th>
                <th
                  onClick={() => setSortBy('change1W')}
                  className="pb-3 text-right font-semibold cursor-pointer hover:text-white hidden sm:table-cell"
                >
                  1-Week {sortBy === 'change1W' ? '▼' : ''}
                </th>
                <th
                  onClick={() => setSortBy('change1M')}
                  className="pb-3 text-right font-semibold cursor-pointer hover:text-white hidden md:table-cell"
                >
                  1-Month {sortBy === 'change1M' ? '▼' : ''}
                </th>
                <th
                  onClick={() => setSortBy('changeYTD')}
                  className="pb-3 text-right font-semibold cursor-pointer hover:text-white hidden lg:table-cell"
                >
                  YTD {sortBy === 'changeYTD' ? '▼' : ''}
                </th>
                <th
                  onClick={() => setSortBy('marketCap')}
                  className="pb-3 text-right font-semibold cursor-pointer hover:text-white"
                >
                  Market Cap {sortBy === 'marketCap' ? '▼' : ''}
                </th>
                <th
                  onClick={() => setSortBy('peRatio')}
                  className="pb-3 text-right font-semibold cursor-pointer hover:text-white hidden md:table-cell"
                >
                  P/E {sortBy === 'peRatio' ? '▼' : ''}
                </th>
                <th
                  onClick={() => setSortBy('rsi')}
                  className="pb-3 text-right font-semibold cursor-pointer hover:text-white hidden xl:table-cell"
                >
                  RSI(14) {sortBy === 'rsi' ? '▼' : ''}
                </th>
                <th className="pb-3 text-right font-semibold hidden md:table-cell">Technical Rating</th>
                <th className="pb-3 text-center font-semibold w-24">Trend</th>
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

                    <td className="py-3.5 text-right font-mono tabular-nums hidden sm:table-cell">
                      <span className={stock.change1W && stock.change1W >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}>
                        {stock.change1W ? `${stock.change1W > 0 ? '+' : ''}${stock.change1W.toFixed(1)}%` : '--'}
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-mono tabular-nums hidden md:table-cell">
                      <span className={stock.change1M && stock.change1M >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}>
                        {stock.change1M ? `${stock.change1M > 0 ? '+' : ''}${stock.change1M.toFixed(1)}%` : '--'}
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-mono tabular-nums hidden lg:table-cell">
                      <span className={stock.changeYTD && stock.changeYTD >= 0 ? 'text-[#089981] font-semibold' : 'text-[#f23645] font-semibold'}>
                        {stock.changeYTD ? `${stock.changeYTD > 0 ? '+' : ''}${stock.changeYTD.toFixed(1)}%` : '--'}
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-mono text-white tabular-nums">
                      {stock.marketCap}
                    </td>

                    <td className="py-3.5 text-right font-mono text-[#9598a1] hidden md:table-cell tabular-nums">
                      {stock.peRatio ? stock.peRatio.toFixed(1) : '--'}
                    </td>

                    <td className="py-3.5 text-right font-mono text-white hidden xl:table-cell tabular-nums">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          (stock.rsi || 50) > 70
                            ? 'bg-[#f23645]/20 text-[#f23645] font-bold'
                            : (stock.rsi || 50) < 45
                            ? 'bg-[#089981]/20 text-[#089981] font-bold'
                            : 'text-[#9598a1]'
                        }`}
                      >
                        {stock.rsi?.toFixed(1) || '55.0'}
                      </span>
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
