import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MarketTicker, AssetClass, Currency, WatchlistItem } from '../types/market';
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
        // Pick 2 to 4 random tickers to fluctuate
        const countToUpdate = Math.floor(Math.random() * 3) + 2;
        const indicesToUpdate = new Set<number>();
        while (indicesToUpdate.size < countToUpdate) {
          indicesToUpdate.add(Math.floor(Math.random() * prevTickers.length));
        }

        const newFlashMap: Record<string, 'up' | 'down'> = {};

        const nextTickers = prevTickers.map((ticker, idx) => {
          if (!indicesToUpdate.has(idx)) return ticker;

          // calculate realistic micro percentage delta
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
    // If it's a bond yield or forex pair, don't convert currency symbols
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
