// Stock Market Service using Finnhub API
// Free tier: 60 API calls/minute

interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

interface FinnhubSearchResult {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
}

interface FinnhubCandle {
  c: number[];  // Close prices
  h: number[];  // High prices
  l: number[];  // Low prices
  o: number[];  // Open prices
  s: string;    // Status
  t: number[];  // Timestamps
  v: number[];  // Volume
}

interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

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
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
}

export interface StockCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

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

// Cache configuration
const QUOTE_CACHE_DURATION = 60 * 1000; // 1 minute for quotes
const CANDLE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for candles
const PROFILE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for profiles
const SEARCH_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for search results

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const quoteCache = new Map<string, CacheEntry<StockQuote>>();
const candleCache = new Map<string, CacheEntry<StockCandle[]>>();
const profileCache = new Map<string, CacheEntry<CompanyProfile>>();
const searchCache = new Map<string, CacheEntry<StockSearchResult[]>>();

// Rate limiting
let requestCount = 0;
let requestWindowStart = Date.now();
const MAX_REQUESTS_PER_MINUTE = 55; // Stay under 60 limit

function checkRateLimit(): boolean {
  const now = Date.now();
  if (now - requestWindowStart > 60000) {
    requestCount = 0;
    requestWindowStart = now;
  }
  return requestCount < MAX_REQUESTS_PER_MINUTE;
}

function incrementRequestCount() {
  requestCount++;
}

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

async function finnhubFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!FINNHUB_API_KEY) {
    throw new Error('FINNHUB_API_KEY is not configured');
  }

  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again in a minute.');
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('token', FINNHUB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  incrementRequestCount();

  const response = await fetch(url.toString());

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Finnhub API rate limit exceeded');
    }
    throw new Error(`Finnhub API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// Get stock quote
export async function getQuote(symbol: string): Promise<StockQuote> {
  const upperSymbol = symbol.toUpperCase();
  const cached = quoteCache.get(upperSymbol);

  if (cached && Date.now() - cached.timestamp < QUOTE_CACHE_DURATION) {
    return cached.data;
  }

  const [quote, profile] = await Promise.all([
    finnhubFetch<FinnhubQuote>('/quote', { symbol: upperSymbol }),
    getCompanyProfile(upperSymbol).catch(() => null),
  ]);

  if (quote.c === 0 && quote.pc === 0) {
    throw new Error(`No data found for symbol: ${upperSymbol}`);
  }

  const stockQuote: StockQuote = {
    symbol: upperSymbol,
    name: profile?.name || upperSymbol,
    price: quote.c,
    change: quote.d,
    changePercent: quote.dp,
    high: quote.h,
    low: quote.l,
    open: quote.o,
    previousClose: quote.pc,
    timestamp: quote.t * 1000,
  };

  quoteCache.set(upperSymbol, { data: stockQuote, timestamp: Date.now() });
  return stockQuote;
}

// Get multiple quotes
export async function getQuotes(symbols: string[]): Promise<StockQuote[]> {
  const quotes = await Promise.all(
    symbols.map(symbol => getQuote(symbol).catch(() => null))
  );
  return quotes.filter((q): q is StockQuote => q !== null);
}

// Search stocks
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  const cacheKey = query.toLowerCase();
  const cached = searchCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_DURATION) {
    return cached.data;
  }

  const result = await finnhubFetch<FinnhubSearchResult>('/search', { q: query });

  const stocks: StockSearchResult[] = result.result
    .filter(item => item.type === 'Common Stock')
    .slice(0, 10)
    .map(item => ({
      symbol: item.symbol,
      name: item.description,
      type: item.type,
    }));

  searchCache.set(cacheKey, { data: stocks, timestamp: Date.now() });
  return stocks;
}

// Get company profile
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const upperSymbol = symbol.toUpperCase();
  const cached = profileCache.get(upperSymbol);

  if (cached && Date.now() - cached.timestamp < PROFILE_CACHE_DURATION) {
    return cached.data;
  }

  const profile = await finnhubFetch<FinnhubCompanyProfile>('/stock/profile2', { symbol: upperSymbol });

  if (!profile.name) {
    throw new Error(`No profile found for symbol: ${upperSymbol}`);
  }

  const companyProfile: CompanyProfile = {
    symbol: profile.ticker || upperSymbol,
    name: profile.name,
    country: profile.country,
    currency: profile.currency,
    exchange: profile.exchange,
    industry: profile.finnhubIndustry,
    logo: profile.logo,
    marketCap: profile.marketCapitalization,
    weburl: profile.weburl,
  };

  profileCache.set(upperSymbol, { data: companyProfile, timestamp: Date.now() });
  return companyProfile;
}

// Get stock candles (historical data)
export async function getCandles(
  symbol: string,
  resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M' = 'D',
  from?: number,
  to?: number
): Promise<StockCandle[]> {
  const upperSymbol = symbol.toUpperCase();
  const now = Math.floor(Date.now() / 1000);
  const fromTs = from || now - (resolution === 'D' ? 365 : 30) * 24 * 60 * 60;
  const toTs = to || now;

  const cacheKey = `${upperSymbol}-${resolution}-${fromTs}-${toTs}`;
  const cached = candleCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CANDLE_CACHE_DURATION) {
    return cached.data;
  }

  const candles = await finnhubFetch<FinnhubCandle>('/stock/candle', {
    symbol: upperSymbol,
    resolution,
    from: fromTs.toString(),
    to: toTs.toString(),
  });

  if (candles.s !== 'ok' || !candles.t || candles.t.length === 0) {
    return [];
  }

  const stockCandles: StockCandle[] = candles.t.map((timestamp, i) => ({
    timestamp: timestamp * 1000,
    open: candles.o[i],
    high: candles.h[i],
    low: candles.l[i],
    close: candles.c[i],
    volume: candles.v[i],
  }));

  candleCache.set(cacheKey, { data: stockCandles, timestamp: Date.now() });
  return stockCandles;
}

// Get market status
export async function getMarketStatus(): Promise<{ isOpen: boolean; holiday?: string }> {
  try {
    const now = new Date();
    const day = now.getUTCDay();
    const hour = now.getUTCHours();

    // Simple check: NYSE/NASDAQ are open Mon-Fri, 9:30 AM - 4:00 PM ET (14:30 - 21:00 UTC)
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = hour >= 14 && hour < 21;

    return {
      isOpen: isWeekday && isMarketHours,
    };
  } catch {
    return { isOpen: false };
  }
}

// Popular stocks for market overview
export const POPULAR_STOCKS = [
  'AAPL',  // Apple
  'MSFT',  // Microsoft
  'GOOGL', // Alphabet
  'AMZN',  // Amazon
  'NVDA',  // NVIDIA
  'META',  // Meta
  'TSLA',  // Tesla
  'JPM',   // JPMorgan
  'V',     // Visa
  'WMT',   // Walmart
];

// Get market overview with popular stocks
export async function getMarketOverview(): Promise<StockQuote[]> {
  return getQuotes(POPULAR_STOCKS);
}

// Get rate limit status
export function getStockRateLimitStatus() {
  const now = Date.now();
  const windowRemaining = Math.max(0, 60000 - (now - requestWindowStart));

  return {
    requestsUsed: requestCount,
    requestsRemaining: MAX_REQUESTS_PER_MINUTE - requestCount,
    windowResetMs: windowRemaining,
    isConfigured: !!FINNHUB_API_KEY,
  };
}

// Clear caches (useful for testing)
export function clearCaches() {
  quoteCache.clear();
  candleCache.clear();
  profileCache.clear();
  searchCache.clear();
}
