import React, { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import {
  Globe2,
  Clock,
  Gauge,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  Flame,
} from 'lucide-react';

export const MacroScreen: React.FC = () => {
  const { tickers, formatPrice } = useMarket();
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const marketSessions = [
    { city: 'New York', exchange: 'NYSE / NASDAQ', status: 'OPEN', hours: '09:30 - 16:00 EST', closesIn: '3h 12m', flag: '🇺🇸', active: true },
    { city: 'London', exchange: 'LSE (UK)', status: 'CLOSED', hours: '08:00 - 16:30 GMT', opensIn: '7h 45m', flag: '🇬🇧', active: false },
    { city: 'Frankfurt', exchange: 'Deutsche Börse Xetra', status: 'CLOSED', hours: '09:00 - 17:30 CET', opensIn: '6h 45m', flag: '🇩🇪', active: false },
    { city: 'Tokyo', exchange: 'TSE (Japan)', status: 'CLOSED', hours: '09:00 - 15:00 JST', opensIn: '3h 15m', flag: '🇯🇵', active: false },
    { city: 'Sydney', exchange: 'ASX (Australia)', status: 'CLOSED', hours: '10:00 - 16:00 AEST', opensIn: '1h 30m', flag: '🇦🇺', active: false },
  ];

  const macroGauges = [
    { name: 'CBOE Volatility Index (VIX)', value: '14.82', change: '-0.38', changePct: '-2.50%', status: 'Low Volatility / Risk-On', sentiment: 'bullish' },
    { name: 'US Dollar Index (DXY)', value: '106.45', change: '+0.28', changePct: '+0.26%', status: 'Dollar Strengthening', sentiment: 'neutral' },
    { name: 'Gold / Oil Ratio', value: '38.08', change: '+0.45', changePct: '+1.20%', status: 'Precious Metals Overperforming', sentiment: 'bullish' },
    { name: 'US 10Y-2Y Yield Spread', value: '+12.7 bps', change: '+1.6 bps', changePct: '+14.4%', status: 'Normal Yield Curve', sentiment: 'bullish' },
  ];

  const fomcProbabilities = [
    { outcome: '25 bps Rate Cut (4.25% - 4.50%)', prob: 64.2 },
    { outcome: 'Maintain / Pause (4.50% - 4.75%)', prob: 35.8 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header with Live UTC Clock */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#2962ff]" />
            Global Macro & Intermarket Barometer
          </h1>
          <p className="text-xs text-[#787b86]">
            24-hour worldwide trading sessions, sovereign yield curves, and macroeconomic liquidity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131722] border border-[#2a2e39] font-mono text-xs">
            <Clock className="w-4 h-4 text-[#2962ff]" />
            <span className="text-white font-bold">{utcTime || '12:00:00 UTC'}</span>
          </div>
        </div>
      </div>

      {/* Global Trading Sessions Grid */}
      <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
          World Financial Trading Sessions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {marketSessions.map((session) => (
            <div
              key={session.city}
              className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between ${
                session.active
                  ? 'bg-[#089981]/10 border-[#089981]/40'
                  : 'bg-[#131722] border-[#2a2e39]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{session.flag}</span>
                    <span className="font-bold text-white">{session.city}</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      session.active ? 'bg-[#089981] text-white' : 'bg-[#2a2e39] text-[#787b86]'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
                <div className="text-[11px] text-[#787b86] mt-1 truncate">
                  {session.exchange}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#2a2e39]/50 font-mono text-[11px] text-[#787b86]">
                <div>{session.hours}</div>
                <div className="text-white font-semibold mt-0.5">
                  {session.active ? `Closes in: ${session.closesIn}` : `Opens in: ${session.opensIn}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Macro Indicators & Fed Policy Probabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Macro Gauge Cards (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
            Institutional Risk & Liquidity Gauges
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {macroGauges.map((gauge) => {
              const isUp = gauge.change.startsWith('+');
              return (
                <div key={gauge.name} className="p-4 rounded-lg bg-[#131722] border border-[#2a2e39] text-xs space-y-2">
                  <div className="text-[#787b86] font-medium">{gauge.name}</div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-xl font-bold text-white">{gauge.value}</span>
                    <span className={isUp ? 'text-[#089981] font-semibold' : 'text-[#f23645] font-semibold'}>
                      {gauge.change} ({gauge.changePct})
                    </span>
                  </div>
                  <div className="text-[11px] text-[#089981] font-semibold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    {gauge.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fed Funds Futures Probabilities (1 col) */}
        <div className="p-5 rounded-xl bg-[#1e222d] border border-[#2a2e39]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              CME FedWatch Futures
            </h2>
            <span className="text-xs text-[#787b86]">Dec 2026 FOMC</span>
          </div>

          <div className="space-y-4">
            {fomcProbabilities.map((fomc) => (
              <div key={fomc.outcome} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[#787b86]">
                  <span className="font-medium text-white">{fomc.outcome}</span>
                  <span className="font-mono font-bold text-[#2962ff]">{fomc.prob}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#131722] overflow-hidden flex">
                  <div className="bg-[#2962ff] h-full rounded-full" style={{ width: `${fomc.prob}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 rounded-lg bg-[#131722] border border-[#2a2e39] text-xs text-[#787b86] space-y-1">
            <span className="font-semibold text-white block">Market Consensus</span>
            <p>
              Hyperscale liquidity conditions remain accommodating with swaps pricing a high probability of easing into year-end.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
