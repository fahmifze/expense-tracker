// Stock Quote
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
  isInWatchlist?: boolean;
}

// Stock Search Result
export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
}

// Stock Candle (chart data)
export interface StockCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Company Profile
export interface CompanyProfile {
  symbol: string;
  name: string;
  country: string;
  currency: string;
  exchange: string;
  industry: string;
  logo: string;
  marketCap: number;
  weburl: string;
}

// Watchlist Item
export interface WatchlistItem {
  id: number;
  userId: number;
  symbol: string;
  name: string;
  addedAt: string;
  quote?: StockQuote | null;
}

// Portfolio Holding
export interface PortfolioHolding {
  id: number;
  userId: number;
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  createdAt: string;
  updatedAt: string;
  // Computed values
  currentPrice?: number;
  currentValue?: number;
  costBasis?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  quote?: StockQuote | null;
}

// Portfolio Transaction
export interface PortfolioTransaction {
  id: number;
  userId: number;
  holdingId: number;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  transactionDate: string;
  notes?: string;
  createdAt: string;
}

// Portfolio Summary
export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

// Price Alert
export interface PriceAlert {
  id: number;
  userId: number;
  symbol: string;
  name: string;
  conditionType: 'above' | 'below';
  targetPrice: number;
  isTriggered: boolean;
  isActive: boolean;
  triggeredAt?: string;
  createdAt: string;
  currentPrice?: number | null;
}

// Market Status
export interface MarketStatus {
  isOpen: boolean;
  holiday?: string;
}

// API Response Types
export interface MarketOverviewResponse {
  quotes: StockQuote[];
  marketStatus: MarketStatus;
}

export interface WatchlistResponse {
  watchlist: WatchlistItem[];
}

export interface PortfolioResponse {
  holdings: PortfolioHolding[];
  summary: PortfolioSummary;
}

export interface HoldingDetailResponse {
  holding: PortfolioHolding;
  transactions: PortfolioTransaction[];
  quote: StockQuote | null;
}

export interface TransactionsResponse {
  transactions: PortfolioTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AlertsResponse {
  alerts: PriceAlert[];
}

export interface StockRateLimitStatus {
  requestsUsed: number;
  requestsRemaining: number;
  windowResetMs: number;
  isConfigured: boolean;
}

// Form Types
export interface TransactionFormData {
  symbol: string;
  name: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  transactionDate: string;
  notes?: string;
}

export interface AlertFormData {
  symbol: string;
  name: string;
  conditionType: 'above' | 'below';
  targetPrice: number;
}
