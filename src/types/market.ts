export type AssetClass = 'all' | 'stocks' | 'crypto' | 'forex' | 'indices' | 'commodities' | 'bonds' | 'heatmap';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface MarketTicker {
  symbol: string;
  name: string;
  assetClass: 'stocks' | 'crypto' | 'forex' | 'indices' | 'commodities' | 'bonds';
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  marketCap?: string;
  peRatio?: number;
  eps?: number;
  dividendYield?: number;
  sector?: string;
  country?: string;
  sparkline: number[];
  technicalRating: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
  lastUpdated?: number;
}

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  timeAgo: string;
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relatedTickers: string[];
  url?: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  flag: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  actual?: string;
  forecast: string;
  previous: string;
}

export interface EarningsReport {
  symbol: string;
  name: string;
  reportDate: string;
  timing: 'BMO' | 'AMC'; // Before Market Open / After Market Close
  epsEstimate: number;
  epsReported?: number;
  revenueEstimate: string;
  marketCap: string;
}

export interface HeatmapItem {
  symbol: string;
  name: string;
  marketCap: number; // in billions
  changePercent: number;
  price: number;
  sector: string;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: number;
  alertPrice?: number;
}
