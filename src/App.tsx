import React from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { StocksScreen } from './components/screens/StocksScreen';
import { CryptoScreen } from './components/screens/CryptoScreen';
import { ForexScreen } from './components/screens/ForexScreen';
import { IndicesScreen } from './components/screens/IndicesScreen';
import { CommoditiesScreen } from './components/screens/CommoditiesScreen';
import { BondsScreen } from './components/screens/BondsScreen';
import { PortfolioScreen } from './components/screens/PortfolioScreen';
import { MacroScreen } from './components/screens/MacroScreen';
import { MarketHeatmap } from './components/MarketHeatmap';
import { InteractiveChartModal } from './components/InteractiveChartModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { SearchModal } from './components/SearchModal';

const MainContent: React.FC = () => {
  const { activeAssetClass, selectedTicker, setSelectedTicker } = useMarket();

  const renderActiveScreen = () => {
    switch (activeAssetClass) {
      case 'stocks':
        return <StocksScreen />;
      case 'crypto':
        return <CryptoScreen />;
      case 'forex':
        return <ForexScreen />;
      case 'indices':
        return <IndicesScreen />;
      case 'commodities':
        return <CommoditiesScreen />;
      case 'bonds':
        return <BondsScreen />;
      case 'heatmap':
        return <MarketHeatmap />;
      case 'portfolio':
        return <PortfolioScreen />;
      case 'macro':
        return <MacroScreen />;
      case 'all':
      default:
        return <OverviewScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#131722] text-[#d1d4dc] flex flex-col font-sans selection:bg-[#2962ff] selection:text-white">
      {/* Top Bar Navigation */}
      <Header />

      {/* Live Market Ticker Tape */}
      <TickerTape />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 lg:px-6 py-6">
        {renderActiveScreen()}
      </main>

      {/* Financial Market Status & Institutional Footer */}
      <footer className="w-full bg-[#131722] border-t border-[#2a2e39] py-5 px-4 lg:px-6 select-none text-xs text-[#787b86]">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Market Trading Session Badges */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#089981]" />
              <span className="font-semibold text-white">NYSE / NASDAQ:</span>
              <span className="text-[#089981]">Open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#787b86]" />
              <span className="font-semibold text-white">London LSE:</span>
              <span>Closed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#787b86]" />
              <span className="font-semibold text-white">Tokyo TSE:</span>
              <span>Closed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#089981]" />
              <span className="font-semibold text-white">Crypto 24/7:</span>
              <span className="text-[#089981]">Active</span>
            </div>
          </div>

          {/* Legal / Terminal Notice */}
          <div className="flex items-center gap-2">
            <span>TradingView Pro Terminal</span>
            <span>·</span>
            <span>Real-time market data simulation & paper execution</span>
          </div>
        </div>
      </footer>

      {/* Pro Chart Modal */}
      {selectedTicker && (
        <InteractiveChartModal
          ticker={selectedTicker}
          onClose={() => setSelectedTicker(null)}
        />
      )}

      {/* Watchlist Slide-out Drawer */}
      <WatchlistDrawer />

      {/* Global Quick Search Modal */}
      <SearchModal />
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <MainContent />
    </MarketProvider>
  );
}
