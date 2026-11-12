import React, { useState, useMemo } from 'react';
import { MOCK_HEATMAP_DATA } from '../data/mockMarketData';
import { useMarket } from '../context/MarketContext';
import { HeatmapItem } from '../types/market';
import { Search, Filter, Layers, Info } from 'lucide-react';

export const MarketHeatmap: React.FC = () => {
  const { openChartForSymbol, formatPrice, tickers } = useMarket();
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'stocks' | 'crypto'>('stocks');

  // Convert crypto tickers into heatmap items when in crypto mode
  const cryptoHeatmapData: HeatmapItem[] = useMemo(() => {
    return tickers
      .filter((t) => t.assetClass === 'crypto')
      .map((t) => ({
        symbol: t.symbol,
        name: t.name,
        marketCap: t.symbol.includes('BTC') ? 1810 : t.symbol.includes('ETH') ? 407 : t.symbol.includes('SOL') ? 102 : 50,
        changePercent: t.changePercent,
        price: t.price,
        sector: 'Crypto Assets',
      }));
  }, [tickers]);

  const activeData = viewMode === 'stocks' ? MOCK_HEATMAP_DATA : cryptoHeatmapData;

  const sectors = useMemo(() => {
    if (viewMode === 'crypto') return ['All'];
    const set = new Set<string>();
    MOCK_HEATMAP_DATA.forEach((item) => set.add(item.sector));
    return ['All', ...Array.from(set)];
  }, [viewMode]);

  const filteredItems = useMemo(() => {
    return activeData.filter((item) => {
      const matchesSector = selectedSector === 'All' || item.sector === selectedSector;
      const matchesSearch =
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSector && matchesSearch;
    });
  }, [activeData, selectedSector, searchQuery]);

  // Color generator based on TradingView heatmap scale
  const getColor = (pct: number) => {
    if (pct >= 3.0) return 'bg-[#089981] hover:brightness-110';
    if (pct >= 1.5) return 'bg-[#0e7465] hover:brightness-110';
    if (pct >= 0) return 'bg-[#1e4b44] hover:brightness-110';
    if (pct >= -1.5) return 'bg-[#5c242c] hover:brightness-110';
    if (pct >= -3.0) return 'bg-[#91232d] hover:brightness-110';
    return 'bg-[#f23645] hover:brightness-110';
  };

  // Group by sector for stocks
  const groupedBySector = useMemo(() => {
    const groups: Record<string, HeatmapItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.sector]) groups[item.sector] = [];
      groups[item.sector].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <div className="space-y-4">
      {/* Heatmap Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-[#131722] rounded-lg border border-[#2a2e39]">
            <button
              onClick={() => {
                setViewMode('stocks');
                setSelectedSector('All');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                viewMode === 'stocks'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#9598a1] hover:text-white'
              }`}
            >
              S&P 500 Stocks
            </button>
            <button
              onClick={() => {
                setViewMode('crypto');
                setSelectedSector('All');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                viewMode === 'crypto'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#9598a1] hover:text-white'
              }`}
            >
              Top Cryptocurrencies
            </button>
          </div>

          {/* Sector Filter for Stocks */}
          {viewMode === 'stocks' && (
            <div className="hidden sm:flex items-center gap-1 overflow-x-auto scrollbar-none">
              {sectors.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors ${
                    selectedSector === sec
                      ? 'bg-[#2a2e39] text-white font-medium'
                      : 'text-[#787b86] hover:text-white'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search & Legend */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#787b86] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search ticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#131722] border border-[#2a2e39] text-xs text-white placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
            />
          </div>

          {/* Color Scale Legend */}
          <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-[#787b86]">
            <span>-3%</span>
            <div className="flex h-3 w-28 rounded overflow-hidden">
              <div className="flex-1 bg-[#f23645]" />
              <div className="flex-1 bg-[#91232d]" />
              <div className="flex-1 bg-[#5c242c]" />
              <div className="flex-1 bg-[#1e4b44]" />
              <div className="flex-1 bg-[#0e7465]" />
              <div className="flex-1 bg-[#089981]" />
            </div>
            <span>+3%</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Layout */}
      <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        {Object.entries(groupedBySector).map(([sectorName, items]) => (
          <div key={sectorName} className="mb-6 last:mb-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {sectorName}
              </span>
              <span className="text-[11px] text-[#787b86] font-mono">
                {items.length} assets
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {items.map((item) => {
                const isBig = item.marketCap > 1000;
                const isMedium = item.marketCap > 300 && item.marketCap <= 1000;

                return (
                  <div
                    key={item.symbol}
                    onClick={() => openChartForSymbol(item.symbol)}
                    className={`${getColor(
                      item.changePercent
                    )} ${
                      isBig ? 'col-span-2 row-span-2 min-h-[140px]' : isMedium ? 'col-span-1 min-h-[90px]' : 'min-h-[80px]'
                    } p-3 rounded-lg flex flex-col justify-between cursor-pointer transition-transform duration-150 hover:scale-[1.02] shadow-sm text-white select-none relative overflow-hidden`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold tracking-wide text-sm drop-shadow-sm">
                          {item.symbol}
                        </span>
                        <span className="text-[10px] font-mono opacity-80">
                          ${item.marketCap}B
                        </span>
                      </div>
                      <div className="text-[11px] opacity-85 truncate mt-0.5">
                        {item.name}
                      </div>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between font-mono">
                      <span className="text-xs font-semibold tabular-nums">
                        {formatPrice(item.price, item.symbol)}
                      </span>
                      <span className="text-xs font-bold tabular-nums">
                        {item.changePercent >= 0 ? '+' : ''}
                        {item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-16 text-center text-sm text-[#787b86]">
            No assets found matching your filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
