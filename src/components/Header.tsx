import React from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetClass, Currency } from '../types/market';
import { Search, Bookmark, Sun, Moon, Radio, ChevronDown } from 'lucide-react';

const TABS: { id: AssetClass; label: string }[] = [
  { id: 'all', label: 'Overview' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'forex', label: 'Forex' },
  { id: 'indices', label: 'Indices' },
  { id: 'commodities', label: 'Futures & Commodities' },
  { id: 'bonds', label: 'Bonds' },
  { id: 'heatmap', label: 'Heatmap' },
];

export const Header: React.FC = () => {
  const {
    activeAssetClass,
    setActiveAssetClass,
    currency,
    setCurrency,
    isLive,
    setIsLive,
    watchlist,
    setIsWatchlistOpen,
    setIsSearchOpen,
    theme,
    setTheme,
  } = useMarket();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#131722] dark:bg-[#131722] border-b border-[#2a2e39] shadow-sm select-none">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveAssetClass('all');
            }}
            className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity"
          >
            {/* TradingView signature SVG glyph */}
            <div className="w-8 h-8 rounded-md bg-[#2962ff] flex items-center justify-center p-1.5 shadow-sm">
              <svg viewBox="0 0 28 28" fill="none" className="w-full h-full text-white" stroke="currentColor">
                <rect x="3" y="10" width="5" height="12" rx="1.5" fill="currentColor" strokeWidth="0" />
                <rect x="11.5" y="4" width="5" height="18" rx="1.5" fill="currentColor" strokeWidth="0" />
                <path d="M20 7L24.5 17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[17px] font-bold tracking-tight text-white whitespace-nowrap">
                TradingView
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#787b86] whitespace-nowrap">
                Markets
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Category Tabs */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {TABS.map((tab) => {
            const isActive = activeAssetClass === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAssetClass(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#2a2e39] text-white font-semibold'
                    : 'text-[#9598a1] hover:text-white hover:bg-[#1e222d]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Functional Interactive Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#1e222d] hover:bg-[#2a2e39] text-[#9598a1] hover:text-white border border-[#2a2e39] text-xs transition-colors"
            title="Search symbols, indices, crypto (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs text-[#787b86]">Search</span>
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono bg-[#131722] text-[#787b86] rounded border border-[#2a2e39]">
              ⌘K
            </kbd>
          </button>

          {/* Currency Dropdown */}
          <div className="relative group">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="appearance-none bg-[#1e222d] hover:bg-[#2a2e39] text-white border border-[#2a2e39] rounded px-2.5 py-1.5 pr-6 text-xs font-mono font-medium focus:outline-none cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#787b86] absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Real-time simulation stream toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors border ${
              isLive
                ? 'bg-[#089981]/15 text-[#089981] border-[#089981]/30 hover:bg-[#089981]/25'
                : 'bg-[#1e222d] text-[#787b86] border-[#2a2e39] hover:text-white'
            }`}
            title={isLive ? 'Live market simulation is active' : 'Click to resume live stream'}
          >
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-[#089981]' : 'text-[#787b86]'}`} />
            <span className="hidden sm:inline font-mono font-medium text-[11px]">
              {isLive ? 'LIVE' : 'PAUSED'}
            </span>
          </button>

          {/* Watchlist Drawer trigger */}
          <button
            onClick={() => setIsWatchlistOpen(true)}
            className="relative flex items-center justify-center p-2 rounded bg-[#1e222d] hover:bg-[#2a2e39] text-[#9598a1] hover:text-white border border-[#2a2e39] transition-colors"
            title="Open Watchlist"
          >
            <Bookmark className="w-4 h-4" />
            {watchlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2962ff] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {watchlist.length}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center p-2 rounded bg-[#1e222d] hover:bg-[#2a2e39] text-[#9598a1] hover:text-white border border-[#2a2e39] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#d1d4dc]" />
            ) : (
              <Moon className="w-4 h-4 text-[#d1d4dc]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Category Tab Strip */}
      <div className="flex md:hidden overflow-x-auto scrollbar-none px-4 py-2 border-t border-[#2a2e39] gap-1 bg-[#131722]">
        {TABS.map((tab) => {
          const isActive = activeAssetClass === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAssetClass(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#2a2e39] text-white font-semibold'
                  : 'text-[#9598a1] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
