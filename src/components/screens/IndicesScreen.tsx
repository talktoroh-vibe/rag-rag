import React, { useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { Sparkline } from '../ui/Sparkline';
import { TrendingUp, TrendingDown, Bookmark, Globe2 } from 'lucide-react';

export const IndicesScreen: React.FC = () => {
  const { tickers, formatPrice, flashMap, openChartForSymbol, toggleWatchlist, isInWatchlist } = useMarket();

  const indexTickers = useMemo(() => {
    return tickers.filter((t) => t.assetClass === 'indices');
  }, [tickers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">
            Global Equity Indices
          </h1>
          <p className="text-xs text-[#787b86]">
            Real-time performance benchmarks across Americas, Europe, and Asia-Pacific
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-[#787b86] font-medium">
                <th className="pb-3 font-semibold">Index Symbol / Name</th>
                <th className="pb-3 text-right font-semibold">Current Value</th>
                <th className="pb-3 text-right font-semibold">Net Change</th>
                <th className="pb-3 text-right font-semibold">Change %</th>
                <th className="pb-3 text-right font-semibold">24h High / Low</th>
                <th className="pb-3 text-right font-semibold hidden sm:table-cell">Trading Volume</th>
                <th className="pb-3 text-right font-semibold hidden md:table-cell">Technical Rating</th>
                <th className="pb-3 text-center font-semibold w-24">Trend</th>
                <th className="pb-3 text-right font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {indexTickers.map((idx) => {
                const isUp = idx.changePercent >= 0;
                const flash = flashMap[idx.symbol];

                return (
                  <tr
                    key={idx.symbol}
                    onClick={() => openChartForSymbol(idx.symbol)}
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
                          {idx.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {idx.symbol}
                          </span>
                          <div className="text-[11px] text-[#787b86]">{idx.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-right font-mono font-semibold text-white tabular-nums">
                      {formatPrice(idx.price, idx.symbol)}
                    </td>

                    <td
                      className={`py-3.5 text-right font-mono font-medium tabular-nums ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {idx.change.toFixed(2)}
                    </td>

                    <td className="py-3.5 text-right font-mono tabular-nums">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isUp ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {idx.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-mono text-[#787b86] text-[11px] tabular-nums">
                      {formatPrice(idx.low24h, idx.symbol)} / {formatPrice(idx.high24h, idx.symbol)}
                    </td>

                    <td className="py-3.5 text-right font-mono text-[#787b86] hidden sm:table-cell tabular-nums">
                      {idx.volume}
                    </td>

                    <td className="py-3.5 text-right hidden md:table-cell">
                      <span
                        className={`text-xs font-semibold ${
                          idx.technicalRating.includes('Buy')
                            ? 'text-[#089981]'
                            : idx.technicalRating.includes('Sell')
                            ? 'text-[#f23645]'
                            : 'text-[#787b86]'
                        }`}
                      >
                        {idx.technicalRating}
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      <div className="w-20 h-6 mx-auto opacity-80">
                        <Sparkline
                          data={idx.sparkline}
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
                          toggleWatchlist(idx.symbol);
                        }}
                        className={`p-1.5 rounded-lg border border-[#2a2e39] text-[#787b86] hover:text-white hover:bg-[#131722] ${
                          isInWatchlist(idx.symbol) ? 'text-[#2962ff] bg-[#2962ff]/15' : ''
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
