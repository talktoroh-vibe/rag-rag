import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Sparkline } from './ui/Sparkline';
import { X, Trash2, Bell, TrendingUp, TrendingDown, Plus, ExternalLink } from 'lucide-react';

export const WatchlistDrawer: React.FC = () => {
  const {
    isWatchlistOpen,
    setIsWatchlistOpen,
    watchlist,
    toggleWatchlist,
    tickers,
    formatPrice,
    openChartForSymbol,
    flashMap,
  } = useMarket();

  const [alertTarget, setAlertTarget] = useState<string | null>(null);
  const [alertPrice, setAlertPrice] = useState<string>('');
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  if (!isWatchlistOpen) return null;

  const watchlistTickers = watchlist
    .map((item) => tickers.find((t) => t.symbol === item.symbol))
    .filter(Boolean);

  const handleSetAlert = (symbol: string) => {
    if (!alertPrice) return;
    setAlertSuccess(`Alert active for ${symbol} @ $${alertPrice}`);
    setAlertTarget(null);
    setAlertPrice('');
    setTimeout(() => setAlertSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#1e222d] border-l border-[#2a2e39] h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#2a2e39] bg-[#131722] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wide">
              Personal Watchlist
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#2a2e39] text-[#787b86]">
              {watchlist.length}
            </span>
          </div>
          <button
            onClick={() => setIsWatchlistOpen(false)}
            className="p-1.5 rounded-lg text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {alertSuccess && (
          <div className="p-2.5 mx-4 mt-3 bg-[#089981]/20 border border-[#089981]/40 text-[#089981] text-xs font-medium rounded-lg">
            {alertSuccess}
          </div>
        )}

        {/* Watchlist Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]">
          {watchlistTickers.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#787b86]">
              <p>Your watchlist is empty.</p>
              <p className="text-xs mt-1 text-[#787b86]">
                Click the bookmark icon on any ticker to save it here for quick tracking.
              </p>
            </div>
          ) : (
            watchlistTickers.map((ticker) => {
              if (!ticker) return null;
              const isUp = ticker.changePercent >= 0;
              const flash = flashMap[ticker.symbol];

              return (
                <div
                  key={ticker.symbol}
                  className={`p-3.5 hover:bg-[#131722] transition-colors flex items-center justify-between gap-3 group ${
                    flash === 'up'
                      ? 'flash-up bg-[#089981]/15'
                      : flash === 'down'
                      ? 'flash-down bg-[#f23645]/15'
                      : ''
                  }`}
                >
                  {/* Left: Symbol & Name */}
                  <div
                    onClick={() => {
                      openChartForSymbol(ticker.symbol);
                      setIsWatchlistOpen(false);
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {ticker.symbol}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1 rounded bg-[#2a2e39] text-[#787b86]">
                        {ticker.assetClass}
                      </span>
                    </div>
                    <div className="text-xs text-[#787b86] truncate max-w-[150px]">
                      {ticker.name}
                    </div>
                  </div>

                  {/* Middle: Sparkline */}
                  <div className="w-16 h-7 opacity-80">
                    <Sparkline
                      data={ticker.sparkline}
                      width={64}
                      height={28}
                      isPositive={isUp}
                      strokeWidth={1.5}
                      showGradient={false}
                    />
                  </div>

                  {/* Right: Price & % Change */}
                  <div className="text-right font-mono">
                    <div className="text-xs font-semibold text-white tabular-nums">
                      {formatPrice(ticker.price, ticker.symbol)}
                    </div>
                    <div
                      className={`text-[11px] font-medium tabular-nums flex items-center justify-end gap-0.5 ${
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
                        {ticker.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setAlertTarget(ticker.symbol)}
                      className="p-1 text-[#787b86] hover:text-[#f7931a] transition-colors"
                      title="Set Price Alert"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleWatchlist(ticker.symbol)}
                      className="p-1 text-[#787b86] hover:text-[#f23645] transition-colors"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Price Alert Dialog */}
        {alertTarget && (
          <div className="p-4 border-t border-[#2a2e39] bg-[#131722]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">
                Set Price Alert for {alertTarget}
              </span>
              <button
                onClick={() => setAlertTarget(null)}
                className="text-[#787b86] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Alert target price..."
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded bg-[#1e222d] border border-[#2a2e39] text-xs text-white focus:outline-none focus:border-[#2962ff]"
              />
              <button
                onClick={() => handleSetAlert(alertTarget)}
                className="px-3 py-1.5 rounded bg-[#2962ff] text-white text-xs font-bold hover:bg-[#2962ff]/90"
              >
                Set Alert
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
