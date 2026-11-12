import React from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const PortfolioScreen: React.FC = () => {
  const {
    balance,
    portfolioNetWorth,
    totalUnrealizedPnl,
    totalUnrealizedPnlPercent,
    positions,
    orders,
    closePosition,
    openChartForSymbol,
    formatPrice,
    resetPortfolio,
  } = useMarket();

  const isProfitable = totalUnrealizedPnl >= 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="flex items-center justify-between text-xs text-[#787b86]">
            <span>Total Net Worth</span>
            <Wallet className="w-4 h-4 text-[#2962ff]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
            ${portfolioNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#787b86] mt-1">Cash + Equity Assets</div>
        </div>

        <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="flex items-center justify-between text-xs text-[#787b86]">
            <span>Cash / Buying Power</span>
            <DollarSign className="w-4 h-4 text-[#089981]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#787b86] mt-1">Available for order allocation</div>
        </div>

        <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="flex items-center justify-between text-xs text-[#787b86]">
            <span>Unrealized P&L</span>
            {isProfitable ? (
              <TrendingUp className="w-4 h-4 text-[#089981]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#f23645]" />
            )}
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-2 tabular-nums ${
              isProfitable ? 'text-[#089981]' : 'text-[#f23645]'
            }`}
          >
            {isProfitable ? '+' : ''}${totalUnrealizedPnl.toFixed(2)}
          </div>
          <div
            className={`text-[11px] font-mono mt-1 ${
              isProfitable ? 'text-[#089981]' : 'text-[#f23645]'
            }`}
          >
            {isProfitable ? '+' : ''}{totalUnrealizedPnlPercent.toFixed(2)}% overall return
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-col justify-between">
          <div>
            <div className="text-xs text-[#787b86]">Open Positions</div>
            <div className="text-2xl font-bold font-mono text-white mt-2">
              {positions.length} active
            </div>
          </div>
          <button
            onClick={resetPortfolio}
            className="mt-2 text-xs flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#131722] hover:bg-[#2a2e39] text-[#787b86] hover:text-white border border-[#2a2e39] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to $100K Paper Account
          </button>
        </div>
      </div>

      {/* Open Positions Table */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Active Portfolio Holdings
            </h2>
            <p className="text-xs text-[#787b86]">
              Real-time mark-to-market position performance
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {positions.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#787b86]">
              No active positions. Open any ticker from the market screener and click "BUY" to place your first trade!
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2a2e39] text-[#787b86] font-medium">
                  <th className="pb-3 font-semibold">Instrument</th>
                  <th className="pb-3 text-right font-semibold">Shares / Units</th>
                  <th className="pb-3 text-right font-semibold">Avg Entry Price</th>
                  <th className="pb-3 text-right font-semibold">Current Price</th>
                  <th className="pb-3 text-right font-semibold">Market Value</th>
                  <th className="pb-3 text-right font-semibold">Unrealized P&L</th>
                  <th className="pb-3 text-right font-semibold">Return %</th>
                  <th className="pb-3 text-right font-semibold w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e39]/60">
                {positions.map((pos) => {
                  const isPosUp = pos.unrealizedPnl >= 0;
                  const marketValue = pos.currentPrice * pos.shares;

                  return (
                    <tr key={pos.id} className="hover:bg-[#131722] transition-colors">
                      <td className="py-3.5">
                        <div
                          onClick={() => openChartForSymbol(pos.symbol)}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <div className="w-7 h-7 rounded bg-[#2962ff]/20 text-[#2962ff] font-bold text-xs flex items-center justify-center shrink-0">
                            {pos.symbol.slice(0, 2)}
                          </div>
                          <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {pos.symbol}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 text-right font-mono font-medium text-white tabular-nums">
                        {pos.shares}
                      </td>

                      <td className="py-3.5 text-right font-mono text-[#9598a1] tabular-nums">
                        ${pos.avgPrice.toFixed(2)}
                      </td>

                      <td className="py-3.5 text-right font-mono font-semibold text-white tabular-nums">
                        ${pos.currentPrice.toFixed(2)}
                      </td>

                      <td className="py-3.5 text-right font-mono font-semibold text-white tabular-nums">
                        ${marketValue.toFixed(2)}
                      </td>

                      <td
                        className={`py-3.5 text-right font-mono font-bold tabular-nums ${
                          isPosUp ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPosUp ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                      </td>

                      <td className="py-3.5 text-right font-mono tabular-nums">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            isPosUp ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                          }`}
                        >
                          {isPosUp ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => closePosition(pos.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-[#f23645]/20 text-[#f23645] hover:bg-[#f23645] hover:text-white transition-colors border border-[#f23645]/30"
                        >
                          Close / Sell
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Trade Orders Audit Log */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-wide">
            Execution Log & Order History
          </h2>
          <span className="text-xs text-[#787b86]">Audited Paper Trades</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-[#787b86] font-medium">
                <th className="pb-3 font-semibold">Time</th>
                <th className="pb-3 font-semibold">Symbol</th>
                <th className="pb-3 font-semibold">Side</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 text-right font-semibold">Shares</th>
                <th className="pb-3 text-right font-semibold">Price</th>
                <th className="pb-3 text-right font-semibold">Total Amount</th>
                <th className="pb-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#131722] transition-colors">
                  <td className="py-3 font-mono text-[#787b86]">
                    {new Date(ord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 font-bold text-white">{ord.symbol}</td>
                  <td className="py-3">
                    <span
                      className={`uppercase font-bold text-[10px] px-1.5 py-0.5 rounded ${
                        ord.side === 'buy' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'
                      }`}
                    >
                      {ord.side}
                    </span>
                  </td>
                  <td className="py-3 uppercase text-[#787b86]">{ord.type}</td>
                  <td className="py-3 text-right font-mono text-white tabular-nums">{ord.shares}</td>
                  <td className="py-3 text-right font-mono text-white tabular-nums">${ord.price.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono font-semibold text-white tabular-nums">
                    ${(ord.shares * ord.price).toFixed(2)}
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#089981]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Filled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
