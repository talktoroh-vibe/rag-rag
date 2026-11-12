import React, { useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { Sparkline } from '../ui/Sparkline';
import { TrendingUp, TrendingDown, Bookmark, Globe } from 'lucide-react';

export const ForexScreen: React.FC = () => {
  const { tickers, flashMap, openChartForSymbol, toggleWatchlist, isInWatchlist } = useMarket();

  const forexTickers = useMemo(() => {
    return tickers.filter((t) => t.assetClass === 'forex');
  }, [tickers]);

  const centralBankRates = [
    { country: 'United States', bank: 'Federal Reserve', rate: '4.75%', nextMeeting: 'Dec 18, 2026', bias: 'Neutral' },
    { country: 'Eurozone', bank: 'European Central Bank', rate: '3.25%', nextMeeting: 'Dec 12, 2026', bias: 'Dovish' },
    { country: 'United Kingdom', bank: 'Bank of England', rate: '4.75%', nextMeeting: 'Dec 19, 2026', bias: 'Neutral' },
    { country: 'Japan', bank: 'Bank of Japan', rate: '0.25%', nextMeeting: 'Dec 19, 2026', bias: 'Hawkish' },
    { country: 'Switzerland', bank: 'Swiss National Bank', rate: '1.00%', nextMeeting: 'Dec 12, 2026', bias: 'Dovish' },
    { country: 'Australia', bank: 'Reserve Bank of Australia', rate: '4.35%', nextMeeting: 'Dec 10, 2026', bias: 'Neutral' },
  ];

  // Currency Cross Rates Matrix
  const matrixCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
  const matrixRates: Record<string, Record<string, number>> = {
    USD: { USD: 1.0, EUR: 0.9485, GBP: 0.7887, JPY: 154.68 },
    EUR: { USD: 1.0542, EUR: 1.0, GBP: 0.8315, JPY: 163.07 },
    GBP: { USD: 1.2678, EUR: 1.2025, GBP: 1.0, JPY: 196.10 },
    JPY: { USD: 0.00646, EUR: 0.00613, GBP: 0.00510, JPY: 1.0 },
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Currency Cross Rates Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Foreign Exchange Cross Rates Matrix
              </h2>
              <p className="text-xs text-[#787b86]">
                Real-time interbank currency spot exchange matrix
              </p>
            </div>
            <span className="text-xs text-[#787b86] font-mono">Quotes / Base</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono">
              <thead>
                <tr className="border-b border-[#2a2e39] text-[#787b86]">
                  <th className="py-2.5 px-3 text-left font-bold text-white">Base</th>
                  {matrixCurrencies.map((c) => (
                    <th key={c} className="py-2.5 px-3 font-bold text-white">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e39]/60">
                {matrixCurrencies.map((base) => (
                  <tr key={base} className="hover:bg-[#131722] transition-colors">
                    <td className="py-3 px-3 text-left font-bold text-white">{base}</td>
                    {matrixCurrencies.map((quote) => {
                      const rate = matrixRates[base]?.[quote] || 1;
                      const isSelf = base === quote;
                      return (
                        <td
                          key={quote}
                          className={`py-3 px-3 tabular-nums ${
                            isSelf ? 'text-[#787b86] bg-[#131722]/50' : 'text-white font-medium hover:text-[#2962ff]'
                          }`}
                        >
                          {isSelf ? '1.0000' : rate < 0.01 ? rate.toFixed(5) : rate < 10 ? rate.toFixed(4) : rate.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Central Bank Benchmark Rates */}
        <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Central Bank Rates
            </h2>
            <span className="text-xs text-[#787b86]">Policy Target</span>
          </div>

          <div className="space-y-3">
            {centralBankRates.map((cb) => (
              <div
                key={cb.country}
                className="p-2.5 rounded-lg bg-[#131722] border border-[#2a2e39] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{cb.country}</div>
                  <div className="text-[10px] text-[#787b86]">{cb.bank}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-[#089981]">{cb.rate}</div>
                  <div className="text-[10px] text-[#787b86]">{cb.bias}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: Major Currency Pairs Screener */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Major & Minor FX Pairs
            </h2>
            <p className="text-xs text-[#787b86]">
              Real-time pip changes, 24h range, and technical ratings
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-[#787b86] font-medium">
                <th className="pb-3 font-semibold">Currency Pair</th>
                <th className="pb-3 text-right font-semibold">Bid Price</th>
                <th className="pb-3 text-right font-semibold">Pip Change</th>
                <th className="pb-3 text-right font-semibold">Change %</th>
                <th className="pb-3 text-right font-semibold">24h High / Low</th>
                <th className="pb-3 text-right font-semibold hidden md:table-cell">Technical Rating</th>
                <th className="pb-3 text-center font-semibold w-24">Trend</th>
                <th className="pb-3 text-right font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {forexTickers.map((pair) => {
                const isUp = pair.changePercent >= 0;
                const flash = flashMap[pair.symbol];

                return (
                  <tr
                    key={pair.symbol}
                    onClick={() => openChartForSymbol(pair.symbol)}
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
                          {pair.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {pair.symbol.slice(0, 3)}/{pair.symbol.slice(3)}
                          </span>
                          <div className="text-[11px] text-[#787b86]">{pair.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-right font-mono font-semibold text-white tabular-nums">
                      {pair.price.toFixed(4)}
                    </td>

                    <td
                      className={`py-3.5 text-right font-mono font-medium tabular-nums ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {(pair.change * 10000).toFixed(1)} pips
                    </td>

                    <td className="py-3.5 text-right font-mono tabular-nums">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isUp ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {pair.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-mono text-[#787b86] text-[11px] tabular-nums">
                      {pair.low24h.toFixed(4)} / {pair.high24h.toFixed(4)}
                    </td>

                    <td className="py-3.5 text-right hidden md:table-cell">
                      <span
                        className={`text-xs font-semibold ${
                          pair.technicalRating.includes('Buy')
                            ? 'text-[#089981]'
                            : pair.technicalRating.includes('Sell')
                            ? 'text-[#f23645]'
                            : 'text-[#787b86]'
                        }`}
                      >
                        {pair.technicalRating}
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      <div className="w-20 h-6 mx-auto opacity-80">
                        <Sparkline
                          data={pair.sparkline}
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
                          toggleWatchlist(pair.symbol);
                        }}
                        className={`p-1.5 rounded-lg border border-[#2a2e39] text-[#787b86] hover:text-white hover:bg-[#131722] ${
                          isInWatchlist(pair.symbol) ? 'text-[#2962ff] bg-[#2962ff]/15' : ''
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
