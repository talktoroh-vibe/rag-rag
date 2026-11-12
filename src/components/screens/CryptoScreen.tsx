import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { Sparkline } from '../ui/Sparkline';
import {
  TrendingUp,
  TrendingDown,
  Bookmark,
  Search,
  Zap,
  ShieldAlert,
  Gauge,
  Coins,
} from 'lucide-react';

export const CryptoScreen: React.FC = () => {
  const { tickers, formatPrice, flashMap, openChartForSymbol, toggleWatchlist, isInWatchlist } = useMarket();
  const [search, setSearch] = useState('');
  const [cryptoCategory, setCryptoCategory] = useState<'all' | 'l1' | 'defi' | 'meme'>('all');

  const cryptoTickers = useMemo(() => {
    return tickers.filter((t) => t.assetClass === 'crypto');
  }, [tickers]);

  const filteredCryptos = useMemo(() => {
    return cryptoTickers.filter((c) => {
      const matchesSearch =
        c.symbol.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [cryptoTickers, search]);

  return (
    <div className="space-y-6">
      {/* SECTION 1: Global Crypto Market Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="text-xs text-[#787b86]">Total Crypto Market Cap</div>
          <div className="text-lg font-bold text-white font-mono mt-1">$2.84 Trillion</div>
          <div className="text-[11px] font-mono text-[#089981] font-medium mt-0.5">+3.67% (24h)</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="text-xs text-[#787b86]">24h Total Volume</div>
          <div className="text-lg font-bold text-white font-mono mt-1">$94.2 Billion</div>
          <div className="text-[11px] font-mono text-[#787b86] mt-0.5">Across 850+ exchanges</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="text-xs text-[#787b86]">Bitcoin Dominance</div>
          <div className="text-lg font-bold text-[#f7931a] font-mono mt-1">56.8%</div>
          <div className="text-[11px] font-mono text-[#787b86] mt-0.5">ETH Dominance: 14.5%</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="text-xs text-[#787b86]">Crypto Fear & Greed</div>
          <div className="text-lg font-bold text-[#089981] font-mono mt-1">74 · Greed</div>
          <div className="w-full h-1.5 bg-[#2a2e39] rounded-full overflow-hidden mt-1.5">
            <div className="w-[74%] h-full bg-[#089981]" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1e222d] border border-[#2a2e39] col-span-2 lg:col-span-1">
          <div className="text-xs text-[#787b86]">DeFi TVL</div>
          <div className="text-lg font-bold text-white font-mono mt-1">$108.4 Billion</div>
          <div className="text-[11px] font-mono text-[#089981] font-medium mt-0.5">+1.82% weekly</div>
        </div>
      </div>

      {/* SECTION 2: Top Crypto Assets Table */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Top Cryptocurrencies by Market Capitalization
            </h2>
            <p className="text-xs text-[#787b86]">
              Real-time spot prices, 24-hour volume, and technical evaluations
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#787b86] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search coin or pair..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#131722] border border-[#2a2e39] text-xs text-white placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-[#787b86] font-medium">
                <th className="pb-3 font-semibold">Coin / Symbol</th>
                <th className="pb-3 text-right font-semibold">Price</th>
                <th className="pb-3 text-right font-semibold">24h Chg $</th>
                <th className="pb-3 text-right font-semibold">24h Chg %</th>
                <th className="pb-3 text-right font-semibold">24h High / Low</th>
                <th className="pb-3 text-right font-semibold">Market Cap</th>
                <th className="pb-3 text-right font-semibold hidden md:table-cell">24h Volume</th>
                <th className="pb-3 text-right font-semibold hidden sm:table-cell">Rating</th>
                <th className="pb-3 text-center font-semibold w-24">7-Day Trend</th>
                <th className="pb-3 text-right font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {filteredCryptos.map((coin) => {
                const isUp = coin.changePercent >= 0;
                const flash = flashMap[coin.symbol];

                return (
                  <tr
                    key={coin.symbol}
                    onClick={() => openChartForSymbol(coin.symbol)}
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
                        <div className="w-8 h-8 rounded-full bg-[#131722] border border-[#2a2e39] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {coin.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {coin.name}
                          </span>
                          <div className="text-[11px] font-mono text-[#787b86]">{coin.symbol}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-right font-mono font-semibold text-white tabular-nums">
                      {formatPrice(coin.price, coin.symbol)}
                    </td>

                    <td
                      className={`py-3.5 text-right font-mono font-medium tabular-nums ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {coin.change.toFixed(coin.price < 5 ? 4 : 2)}
                    </td>

                    <td className="py-3.5 text-right font-mono tabular-nums">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isUp ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {coin.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-mono text-[#787b86] text-[11px] tabular-nums">
                      {formatPrice(coin.low24h, coin.symbol)} / {formatPrice(coin.high24h, coin.symbol)}
                    </td>

                    <td className="py-3.5 text-right font-mono text-white tabular-nums">
                      {coin.marketCap}
                    </td>

                    <td className="py-3.5 text-right font-mono text-[#787b86] hidden md:table-cell tabular-nums">
                      {coin.volume}
                    </td>

                    <td className="py-3.5 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${
                          coin.technicalRating.includes('Buy')
                            ? 'text-[#089981]'
                            : coin.technicalRating.includes('Sell')
                            ? 'text-[#f23645]'
                            : 'text-[#787b86]'
                        }`}
                      >
                        {coin.technicalRating}
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      <div className="w-20 h-6 mx-auto opacity-80">
                        <Sparkline
                          data={coin.sparkline}
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
                          toggleWatchlist(coin.symbol);
                        }}
                        className={`p-1.5 rounded-lg border border-[#2a2e39] text-[#787b86] hover:text-white hover:bg-[#131722] ${
                          isInWatchlist(coin.symbol) ? 'text-[#2962ff] bg-[#2962ff]/15' : ''
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
