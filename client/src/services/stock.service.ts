import api from './api';
import {
  StockQuote,
  StockSearchResult,
  StockCandle,
  CompanyProfile,
  MarketOverviewResponse,
  WatchlistResponse,
  WatchlistItem,
  PortfolioResponse,
  HoldingDetailResponse,
  TransactionsResponse,
  AlertsResponse,
  PriceAlert,
  TransactionFormData,
  AlertFormData,
  StockRateLimitStatus,
} from '../types/stock.types';

// ============ Market Data ============

export async function getMarketOverview(): Promise<MarketOverviewResponse> {
  const response = await api.get('/stocks/overview');
  return response.data.data;
}

export async function getQuote(symbol: string): Promise<StockQuote> {
  const response = await api.get(`/stocks/quote/${symbol}`);
  return response.data.data;
}

export async function getQuotes(symbols: string[]): Promise<{ quotes: StockQuote[] }> {
  const response = await api.get('/stocks/quotes', {
    params: { symbols: symbols.join(',') },
  });
  return response.data.data;
}

export async function searchStocks(query: string): Promise<{ results: StockSearchResult[] }> {
  const response = await api.get('/stocks/search', {
    params: { q: query },
  });
  return response.data.data;
}

export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const response = await api.get(`/stocks/profile/${symbol}`);
  return response.data.data;
}

export async function getCandles(
  symbol: string,
  resolution: string = 'D',
  from?: number,
  to?: number
): Promise<{ candles: StockCandle[] }> {
  const response = await api.get(`/stocks/candles/${symbol}`, {
    params: { resolution, from, to },
  });
  return response.data.data;
}

export async function getRateLimitStatus(): Promise<StockRateLimitStatus> {
  const response = await api.get('/stocks/rate-limit');
  return response.data.data;
}

// ============ Watchlist ============

export async function getWatchlist(): Promise<WatchlistResponse> {
  const response = await api.get('/stocks/watchlist');
  return response.data.data;
}

export async function addToWatchlist(symbol: string, name: string): Promise<WatchlistItem> {
  const response = await api.post('/stocks/watchlist', { symbol, name });
  return response.data.data;
}

export async function removeFromWatchlist(symbol: string): Promise<void> {
  await api.delete(`/stocks/watchlist/${symbol}`);
}

// ============ Portfolio ============

export async function getPortfolio(): Promise<PortfolioResponse> {
  const response = await api.get('/stocks/portfolio');
  return response.data.data;
}

export async function getHolding(holdingId: number): Promise<HoldingDetailResponse> {
  const response = await api.get(`/stocks/portfolio/${holdingId}`);
  return response.data.data;
}

export async function getTransactions(
  page: number = 1,
  limit: number = 50
): Promise<TransactionsResponse> {
  const response = await api.get('/stocks/portfolio/transactions', {
    params: { page, limit },
  });
  return response.data.data;
}

export async function addTransaction(data: TransactionFormData): Promise<{
  holding: any;
  transaction: any;
}> {
  const response = await api.post('/stocks/portfolio/transactions', data);
  return response.data.data;
}

export async function deleteHolding(holdingId: number): Promise<void> {
  await api.delete(`/stocks/portfolio/${holdingId}`);
}

// ============ Price Alerts ============

export async function getAlerts(activeOnly: boolean = false): Promise<AlertsResponse> {
  const response = await api.get('/stocks/alerts', {
    params: { activeOnly },
  });
  return response.data.data;
}

export async function createAlert(data: AlertFormData): Promise<PriceAlert> {
  const response = await api.post('/stocks/alerts', data);
  return response.data.data;
}

export async function updateAlert(
  alertId: number,
  data: Partial<{
    conditionType: 'above' | 'below';
    targetPrice: number;
    isActive: boolean;
  }>
): Promise<PriceAlert> {
  const response = await api.put(`/stocks/alerts/${alertId}`, data);
  return response.data.data;
}

export async function deleteAlert(alertId: number): Promise<void> {
  await api.delete(`/stocks/alerts/${alertId}`);
}

export async function checkAlerts(): Promise<{ triggered: PriceAlert[] }> {
  const response = await api.post('/stocks/alerts/check');
  return response.data.data;
}
