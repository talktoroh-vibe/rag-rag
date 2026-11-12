import React, { useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { Sparkline } from '../ui/Sparkline';
import { TrendingUp, TrendingDown, Bookmark, Flame, Shield, Wheat } from 'lucide-react';

export const CommoditiesScreen: React.FC = () => {
  const { tickers, formatPrice, flashMap, openChartForSymbol, toggleWatchlist, isInWatchlist } = useMarket();

  const commodityTickers = useMemo(() => {
    return tickers.filter((t) => t.assetClass === 'commodities');
  }, [tickers]);

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">
            Futures & Global Commodities
          </h1>
          <p className="text-xs text-[#787b86]">
            Real-time energy, precious metals, industrial resources, and agricultural contracts
          </p>
        </div>
      </div>

      {/* Main Commodities Table */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-[#787b86] font-medium">
                <th className="pb-3 font-semibold">Commodity / Contract</th>
                <th className="pb-3 text-right font-semibold">Settlement Price</th>
                <th className="pb-3 text-right font-semibold">Change $</th>
                <th className="pb-3 text-right font-semibold">Change %</th>
                <th className="pb-3 text-right font-semibold">24h High / Low</th>
                <th className="pb-3 text-right font-semibold hidden sm:table-cell">Volume</th>
                <th className="pb-3 text-right font-semibold hidden md:table-cell">Rating</th>
                <th className="pb-3 text-center font-semibold w-24">Trend</th>
                <th className="pb-3 text-right font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {commodityTickers.map((item) => {
                const isUp = item.changePercent >= 0;
                const flash = flashMap[item.symbol];

                return (
                  <tr
                    key={item.symbol}
                    onClick={() => openChartForSymbol(item.symbol)}
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
                          {item.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {item.name}
                          </span>
                          <div className="text-[11px] font-mono text-[#787b86]">{item.symbol}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-right font-mono font-semibold text-white tabular-nums">
                      {formatPrice(item.price, item.symbol)}
                    </td>

                    <td
                      className={`py-3.5 text-right font-mono font-medium tabular-nums ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {item.change.toFixed(2)}
                    </td>

                    <td className="py-3.5 text-right font-mono tabular-nums">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isUp ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {item.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-mono text-[#787b86] text-[11px] tabular-nums">
                      {formatPrice(item.low24h, item.symbol)} / {formatPrice(item.high24h, item.symbol)}
                    </td>

                    <td className="py-3.5 text-right font-mono text-[#787b86] hidden sm:table-cell tabular-nums">
                      {item.volume}
                    </td>

                    <td className="py-3.5 text-right hidden md:table-cell">
                      <span
                        className={`text-xs font-semibold ${
                          item.technicalRating.includes('Buy')
                            ? 'text-[#089981]'
                            : item.technicalRating.includes('Sell')
                            ? 'text-[#f23645]'
                            : 'text-[#787b86]'
                        }`}
                      >
                        {item.technicalRating}
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      <div className="w-20 h-6 mx-auto opacity-80">
                        <Sparkline
                          data={item.sparkline}
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
                          toggleWatchlist(item.symbol);
                        }}
                        className={`p-1.5 rounded-lg border border-[#2a2e39] text-[#787b86] hover:text-white hover:bg-[#131722] ${
                          isInWatchlist(item.symbol) ? 'text-[#2962ff] bg-[#2962ff]/15' : ''
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
    </div>
  );
};
