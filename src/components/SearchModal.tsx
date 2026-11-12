import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { Search, X, TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, tickers, openChartForSymbol, formatPrice } = useMarket();
  const [query, setQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filtered = tickers.filter((t) => {
    const matchesQuery =
      t.symbol.toLowerCase().includes(query.toLowerCase()) ||
      t.name.toLowerCase().includes(query.toLowerCase());
    const matchesClass = filterClass === 'all' || t.assetClass === filterClass;
    return matchesQuery && matchesClass;
  });

  const handleSelect = (symbol: string) => {
    openChartForSymbol(symbol);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="p-4 bg-[#131722] border-b border-[#2a2e39] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#2962ff] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, company, crypto or commodity..."
            className="w-full bg-transparent text-sm text-white placeholder-[#787b86] focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded text-[#787b86] hover:text-white hover:bg-[#2a2e39]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter categories */}
        <div className="px-4 py-2 bg-[#171b26] border-b border-[#2a2e39] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {['all', 'stocks', 'crypto', 'forex', 'indices', 'commodities'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterClass(cat)}
              className={`px-2.5 py-1 rounded capitalize transition-colors ${
                filterClass === cat
                  ? 'bg-[#2962ff] text-white font-medium'
                  : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]/60">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#787b86]">
              No instruments found matching "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const isUp = item.changePercent >= 0;
              return (
                <div
                  key={item.symbol}
                  onClick={() => handleSelect(item.symbol)}
                  className="px-4 py-3 hover:bg-[#131722] transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#2a2e39] text-white font-bold text-xs flex items-center justify-center">
                      {item.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#2962ff] transition-colors">
                          {item.symbol}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#2a2e39] text-[#787b86]">
                          {item.assetClass}
                        </span>
                      </div>
                      <span className="text-xs text-[#787b86]">
                        {item.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <div className="text-xs font-semibold text-white">
                        {formatPrice(item.price, item.symbol)}
                      </div>
                      <div
                        className={`text-[11px] font-medium flex items-center justify-end gap-0.5 ${
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
                    <ArrowRight className="w-4 h-4 text-[#787b86] group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#131722] border-t border-[#2a2e39] flex items-center justify-between text-[11px] text-[#787b86]">
          <span>Select an instrument to open detailed interactive chart</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#1e222d] border border-[#2a2e39] font-mono">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
};
