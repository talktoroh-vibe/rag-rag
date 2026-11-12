import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  MarketTicker,
  AssetClass,
  Currency,
  WatchlistItem,
  PortfolioPosition,
  TradeOrder,
} from '../types/market';
import { INITIAL_TICKERS } from '../data/mockMarketData';

interface MarketContextType {
  tickers: MarketTicker[];
  activeAssetClass: AssetClass;
  setActiveAssetClass: (tab: AssetClass) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (price: number, symbol?: string) => string;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  selectedTicker: MarketTicker | null;
  setSelectedTicker: (ticker: MarketTicker | null) => void;
  openChartForSymbol: (symbol: string) => void;
  watchlist: WatchlistItem[];
  toggleWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  isWatchlistOpen: boolean;
  setIsWatchlistOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  flashMap: Record<string, 'up' | 'down'>;
  
  // PRO FEATURES
  viewMode: 'standard' | 'terminal';
  setViewMode: (mode: 'standard' | 'terminal') => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playProSound: (type: 'fill' | 'alert' | 'tick') => void;
  
  // Paper Trading Portfolio
  balance: number;
  positions: PortfolioPosition[];
  orders: TradeOrder[];
  executeTrade: (symbol: string, side: 'buy' | 'sell', shares: number, price: number) => { success: boolean; message: string };
  closePosition: (positionId: string) => void;
  portfolioNetWorth: number;
  totalUnrealizedPnl: number;
  totalUnrealizedPnlPercent: number;
  resetPortfolio: () => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

const CURRENCY_RATES: Record<Currency, { rate: number; symbol: string }> = {
  USD: { rate: 1, symbol: '$' },
  EUR: { rate: 0.95, symbol: '€' },
  GBP: { rate: 0.79, symbol: '£' },
  JPY: { rate: 154.5, symbol: '¥' },
};

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { symbol: 'SPX', addedAt: Date.now() - 100000 },
  { symbol: 'NVDA', addedAt: Date.now() - 90000 },
  { symbol: 'BTCUSDT', addedAt: Date.now() - 80000 },
  { symbol: 'TSLA', addedAt: Date.now() - 70000 },
  { symbol: 'XAUUSD', addedAt: Date.now() - 60000 },
  { symbol: 'PLTR', addedAt: Date.now() - 50000 },
];

const INITIAL_POSITIONS: PortfolioPosition[] = [
  {
    id: 'pos-1',
    symbol: 'NVDA',
    shares: 50,
    avgPrice: 142.50,
    currentPrice: 148.88,
    unrealizedPnl: 319.00,
    unrealizedPnlPercent: 4.48,
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: 'pos-2',
    symbol: 'BTCUSDT',
    shares: 0.5,
    avgPrice: 88500.00,
    currentPrice: 91420.50,
    unrealizedPnl: 1460.25,
    unrealizedPnlPercent: 3.30,
    timestamp: Date.now() - 86400000,
  },
];

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickers, setTickers] = useState<MarketTicker[]>(INITIAL_TICKERS);
  const [activeAssetClass, setActiveAssetClass] = useState<AssetClass>('all');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isLive, setIsLive] = useState<boolean>(true);
  const [selectedTicker, setSelectedTicker] = useState<MarketTicker | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('tv_markets_watchlist');
      return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  });
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down'>>({});

  // Pro features state
  const [viewMode, setViewMode] = useState<'standard' | 'terminal'>('standard');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(75000.00);
  const [positions, setPositions] = useState<PortfolioPosition[]>(INITIAL_POSITIONS);
  const [orders, setOrders] = useState<TradeOrder[]>([
    {
      id: 'ord-1',
      symbol: 'NVDA',
      side: 'buy',
      type: 'market',
      shares: 50,
      price: 142.50,
      status: 'filled',
      timestamp: Date.now() - 86400000 * 2,
    },
    {
      id: 'ord-2',
      symbol: 'BTCUSDT',
      side: 'buy',
      type: 'market',
      shares: 0.5,
      price: 88500.00,
      status: 'filled',
      timestamp: Date.now() - 86400000,
    },
  ]);

  // Web Audio synthesizer for institutional trading audio feedback
  const playProSound = useCallback((type: 'fill' | 'alert' | 'tick') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'fill') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.08); // C6
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  // Recalculate portfolio values continuously based on current prices
  const updatedPositions = useMemo(() => {
    return positions.map((pos) => {
      const currentTicker = tickers.find((t) => t.symbol === pos.symbol);
      const currentPrice = currentTicker ? currentTicker.price : pos.currentPrice;
      const unrealizedPnl = (currentPrice - pos.avgPrice) * pos.shares;
      const unrealizedPnlPercent = ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100;
      return {
        ...pos,
        currentPrice,
        unrealizedPnl,
        unrealizedPnlPercent,
      };
    });
  }, [positions, tickers]);

  const portfolioEquity = useMemo(() => {
    return updatedPositions.reduce((sum, pos) => sum + pos.currentPrice * pos.shares, 0);
  }, [updatedPositions]);

  const portfolioNetWorth = useMemo(() => {
    return balance + portfolioEquity;
  }, [balance, portfolioEquity]);

  const totalUnrealizedPnl = useMemo(() => {
    return updatedPositions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
  }, [updatedPositions]);

  const totalCostBasis = useMemo(() => {
    return updatedPositions.reduce((sum, pos) => sum + pos.avgPrice * pos.shares, 0);
  }, [updatedPositions]);

  const totalUnrealizedPnlPercent = useMemo(() => {
    return totalCostBasis > 0 ? (totalUnrealizedPnl / totalCostBasis) * 100 : 0;
  }, [totalUnrealizedPnl, totalCostBasis]);

  const executeTrade = useCallback(
    (symbol: string, side: 'buy' | 'sell', shares: number, price: number): { success: boolean; message: string } => {
      const cost = shares * price;

      if (side === 'buy') {
        if (cost > balance) {
          return { success: false, message: `Insufficient buying power ($${balance.toFixed(2)}) for order ($${cost.toFixed(2)})` };
        }

        setBalance((prev) => prev - cost);
        setPositions((prev) => {
          const existing = prev.find((p) => p.symbol === symbol);
          if (existing) {
            const totalShares = existing.shares + shares;
            const newAvgPrice = (existing.shares * existing.avgPrice + cost) / totalShares;
            return prev.map((p) =>
              p.symbol === symbol
                ? {
                    ...p,
                    shares: totalShares,
                    avgPrice: newAvgPrice,
                    currentPrice: price,
                    unrealizedPnl: (price - newAvgPrice) * totalShares,
                    unrealizedPnlPercent: ((price - newAvgPrice) / newAvgPrice) * 100,
                  }
                : p
            );
          } else {
            return [
              ...prev,
              {
                id: `pos-${Date.now()}`,
                symbol,
                shares,
                avgPrice: price,
                currentPrice: price,
                unrealizedPnl: 0,
                unrealizedPnlPercent: 0,
                timestamp: Date.now(),
              },
            ];
          }
        });
      } else {
        // Sell
        const existing = positions.find((p) => p.symbol === symbol);
        if (!existing || existing.shares < shares) {
          return { success: false, message: `Cannot sell ${shares} shares (Only hold ${existing?.shares || 0})` };
        }

        setBalance((prev) => prev + cost);
        setPositions((prev) => {
          if (existing.shares === shares) {
            return prev.filter((p) => p.symbol !== symbol);
          } else {
            const remShares = existing.shares - shares;
            return prev.map((p) =>
              p.symbol === symbol
                ? {
                    ...p,
                    shares: remShares,
                    unrealizedPnl: (price - p.avgPrice) * remShares,
                    unrealizedPnlPercent: ((price - p.avgPrice) / p.avgPrice) * 100,
                  }
                : p
            );
          }
        });
      }

      // Add to orders
      const newOrder: TradeOrder = {
        id: `ord-${Date.now()}`,
        symbol,
        side,
        type: 'market',
        shares,
        price,
        status: 'filled',
        timestamp: Date.now(),
      };
      setOrders((prev) => [newOrder, ...prev]);

      playProSound('fill');
      return { success: true, message: `Executed: ${side.toUpperCase()} ${shares} ${symbol} @ $${price.toFixed(2)}` };
    },
    [balance, positions, playProSound]
  );

  const closePosition = useCallback(
    (positionId: string) => {
      const pos = updatedPositions.find((p) => p.id === positionId);
      if (!pos) return;
      executeTrade(pos.symbol, 'sell', pos.shares, pos.currentPrice);
    },
    [updatedPositions, executeTrade]
  );

  const resetPortfolio = useCallback(() => {
    setBalance(100000.00);
    setPositions([]);
    setOrders([]);
  }, []);

  // Keyboard shortcut Ctrl+K or / for quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync theme with html root
  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Save watchlist
  useEffect(() => {
    try {
      localStorage.setItem('tv_markets_watchlist', JSON.stringify(watchlist));
    } catch {
      // ignore
    }
  }, [watchlist]);

  // Live price simulator
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setTickers((prevTickers) => {
        const countToUpdate = Math.floor(Math.random() * 3) + 2;
        const indicesToUpdate = new Set<number>();
        while (indicesToUpdate.size < countToUpdate) {
          indicesToUpdate.add(Math.floor(Math.random() * prevTickers.length));
        }

        const newFlashMap: Record<string, 'up' | 'down'> = {};

        const nextTickers = prevTickers.map((ticker, idx) => {
          if (!indicesToUpdate.has(idx)) return ticker;

          const isForex = ticker.assetClass === 'forex';
          const isBond = ticker.assetClass === 'bonds';
          const isCrypto = ticker.assetClass === 'crypto';

          const pctDelta = (Math.random() - 0.49) * (isCrypto ? 0.003 : isForex ? 0.0004 : isBond ? 0.002 : 0.0015);
          const priceDelta = ticker.price * pctDelta;
          const newPrice = Number(Math.max(ticker.price + priceDelta, 0.0001).toFixed(isForex ? 4 : isBond ? 3 : ticker.price < 5 ? 3 : 2));
          const newChg = Number((ticker.change + priceDelta).toFixed(isForex ? 4 : 2));
          const newChgPct = Number(((newChg / (newPrice - newChg)) * 100).toFixed(2));

          const direction = priceDelta >= 0 ? 'up' : 'down';
          newFlashMap[ticker.symbol] = direction;

          const updatedSparkline = [...ticker.sparkline.slice(1), newPrice];

          return {
            ...ticker,
            price: newPrice,
            change: newChg,
            changePercent: newChgPct,
            high24h: Math.max(ticker.high24h, newPrice),
            low24h: Math.min(ticker.low24h, newPrice),
            sparkline: updatedSparkline,
            lastUpdated: Date.now(),
          };
        });

        setFlashMap(newFlashMap);
        setTimeout(() => setFlashMap({}), 900);

        return nextTickers;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [isLive]);

  // Price formatter with currency conversion
  const formatPrice = useCallback((price: number, symbol?: string): string => {
    if (symbol?.endsWith('Y') || (symbol && ['US10Y', 'US02Y', 'US30Y', 'DE10Y'].includes(symbol))) {
      return `${price.toFixed(3)}%`;
    }
    if (symbol && ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'].includes(symbol)) {
      return price.toFixed(4);
    }

    const { rate, symbol: currSym } = CURRENCY_RATES[currency];
    const converted = price * rate;

    if (converted >= 1000) {
      return `${currSym}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (converted < 1 && converted > 0) {
      return `${currSym}${converted.toFixed(4)}`;
    }
    return `${currSym}${converted.toFixed(2)}`;
  }, [currency]);

  const openChartForSymbol = useCallback((symbol: string) => {
    const found = tickers.find((t) => t.symbol === symbol);
    if (found) {
      setSelectedTicker(found);
    }
  }, [tickers]);

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      const exists = prev.some((item) => item.symbol === symbol);
      if (exists) {
        return prev.filter((item) => item.symbol !== symbol);
      } else {
        return [...prev, { symbol, addedAt: Date.now() }];
      }
    });
  }, []);

  const isInWatchlist = useCallback((symbol: string) => {
    return watchlist.some((item) => item.symbol === symbol);
  }, [watchlist]);

  return (
    <MarketContext.Provider
      value={{
        tickers,
        activeAssetClass,
        setActiveAssetClass,
        currency,
        setCurrency,
        formatPrice,
        isLive,
        setIsLive,
        selectedTicker,
        setSelectedTicker,
        openChartForSymbol,
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        isWatchlistOpen,
        setIsWatchlistOpen,
        isSearchOpen,
        setIsSearchOpen,
        theme,
        setTheme,
        flashMap,
        viewMode,
        setViewMode,
        soundEnabled,
        setSoundEnabled,
        playProSound,
        balance,
        positions: updatedPositions,
        orders,
        executeTrade,
        closePosition,
        portfolioNetWorth,
        totalUnrealizedPnl,
        totalUnrealizedPnlPercent,
        resetPortfolio,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
