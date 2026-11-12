import React, { useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { Sparkline } from '../ui/Sparkline';
import { TrendingUp, TrendingDown, Bookmark, Scale } from 'lucide-react';

export const BondsScreen: React.FC = () => {
  const { tickers, flashMap, openChartForSymbol, toggleWatchlist, isInWatchlist } = useMarket();

  const bondTickers = useMemo(() => {
    return tickers.filter((t) => t.assetClass === 'bonds');
  }, [tickers]);

  // US Treasury Yield Curve points
  const yieldCurveCurrent = [
    { maturity: '1M', yield: 4.65 },
    { maturity: '3M', yield: 4.58 },
    { maturity: '6M', yield: 4.49 },
    { maturity: '1Y', yield: 4.38 },
    { maturity: '2Y', yield: 4.315 },
    { maturity: '5Y', yield: 4.35 },
    { maturity: '10Y', yield: 4.442 },
    { maturity: '30Y', yield: 4.618 },
  ];

  const yieldCurveMonthAgo = [
    { maturity: '1M', yield: 4.85 },
    { maturity: '3M', yield: 4.76 },
    { maturity: '6M', yield: 4.62 },
    { maturity: '1Y', yield: 4.45 },
    { maturity: '2Y', yield: 4.22 },
    { maturity: '5Y', yield: 4.15 },
    { maturity: '10Y', yield: 4.28 },
    { maturity: '30Y', yield: 4.48 },
  ];

  return (
    <div className="space-y-6">
      {/* SECTION 1: Sovereign Yield Curve Chart */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              US Treasury Yield Curve (Benchmark Matrix)
            </h2>
            <p className="text-xs text-[#787b86]">
              Current sovereign term structure vs 1 month prior
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-white">
              <span className="w-3 h-1 bg-[#2962ff] rounded" />
              <span>Current Curve (10Y: 4.442%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#787b86]">
              <span className="w-3 h-1 bg-[#787b86] rounded" />
              <span>1 Month Ago</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#131722] text-[#089981] font-bold border border-[#2a2e39]">
              10Y-2Y Spread: +12.7 bps (Normal)
            </div>
          </div>
        </div>

        {/* SVG Yield Curve Graph */}
        <div className="w-full h-56 pt-2">
          <svg viewBox="0 0 800 200" className="w-full h-full block">
            {/* Grid lines */}
            {[4.0, 4.25, 4.5, 4.75, 5.0].map((rate, idx) => {
              const y = 170 - ((rate - 4.0) / 1.0) * 140;
              return (
                <g key={rate}>
                  <line x1="40" y1={y} x2="780" y2={y} stroke="#2a2e39" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="35" y={y + 3} fill="#787b86" fontSize="10" textAnchor="end" fontFamily="monospace">
                    {rate.toFixed(2)}%
                  </text>
                </g>
              );
            })}

            {/* Past Month Curve */}
            {(() => {
              const pts = yieldCurveMonthAgo.map((item, idx) => {
                const x = 70 + idx * 100;
                const y = 170 - ((item.yield - 4.0) / 1.0) * 140;
                return `${x},${y}`;
              });
              return (
                <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#787b86" strokeWidth="1.5" strokeDasharray="4 2" />
              );
            })()}

            {/* Current Curve */}
            {(() => {
              const pts = yieldCurveCurrent.map((item, idx) => {
                const x = 70 + idx * 100;
                const y = 170 - ((item.yield - 4.0) / 1.0) * 140;
                return `${x},${y}`;
              });
              return (
                <g>
                  <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#2962ff" strokeWidth="2.5" strokeLinecap="round" />
                  {yieldCurveCurrent.map((item, idx) => {
                    const x = 70 + idx * 100;
                    const y = 170 - ((item.yield - 4.0) / 1.0) * 140;
                    return (
                      <circle key={item.maturity} cx={x} cy={y} r="4" fill="#2962ff" stroke="#131722" strokeWidth="2" />
                    );
                  })}
                </g>
              );
            })()}

            {/* X-axis maturity labels */}
            {yieldCurveCurrent.map((item, idx) => {
              const x = 70 + idx * 100;
              return (
                <text key={item.maturity} x={x} y="192" fill="#d1d4dc" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                  {item.maturity}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* SECTION 2: Sovereign Bond Screener Table */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-wide">
            Global Government Bond Benchmarks
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-[#787b86] font-medium">
                <th className="pb-3 font-semibold">Bond / Term</th>
                <th className="pb-3 text-right font-semibold">Yield</th>
                <th className="pb-3 text-right font-semibold">Day Change</th>
                <th className="pb-3 text-right font-semibold">Change %</th>
                <th className="pb-3 text-right font-semibold">24h High / Low</th>
                <th className="pb-3 text-right font-semibold hidden md:table-cell">Rating</th>
                <th className="pb-3 text-center font-semibold w-24">Trend</th>
                <th className="pb-3 text-right font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {bondTickers.map((bond) => {
                const isUp = bond.changePercent >= 0;
                const flash = flashMap[bond.symbol];

                return (
                  <tr
                    key={bond.symbol}
                    onClick={() => openChartForSymbol(bond.symbol)}
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
                          {bond.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {bond.name}
                          </span>
                          <div className="text-[11px] font-mono text-[#787b86]">{bond.symbol}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-right font-mono font-semibold text-white tabular-nums">
                      {bond.price.toFixed(3)}%
                    </td>

                    <td
                      className={`py-3.5 text-right font-mono font-medium tabular-nums ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {(bond.change * 100).toFixed(1)} bps
                    </td>

                    <td className="py-3.5 text-right font-mono tabular-nums">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isUp ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {bond.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-mono text-[#787b86] text-[11px] tabular-nums">
                      {bond.low24h.toFixed(3)}% / {bond.high24h.toFixed(3)}%
                    </td>

                    <td className="py-3.5 text-right hidden md:table-cell">
                      <span
                        className={`text-xs font-semibold ${
                          bond.technicalRating.includes('Buy')
                            ? 'text-[#089981]'
                            : bond.technicalRating.includes('Sell')
                            ? 'text-[#f23645]'
                            : 'text-[#787b86]'
                        }`}
                      >
                        {bond.technicalRating}
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      <div className="w-20 h-6 mx-auto opacity-80">
                        <Sparkline
                          data={bond.sparkline}
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
                          toggleWatchlist(bond.symbol);
                        }}
                        className={`p-1.5 rounded-lg border border-[#2a2e39] text-[#787b86] hover:text-white hover:bg-[#131722] ${
                          isInWatchlist(bond.symbol) ? 'text-[#2962ff] bg-[#2962ff]/15' : ''
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
