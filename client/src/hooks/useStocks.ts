import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stockService from '../services/stock.service';
import { TransactionFormData, AlertFormData } from '../types/stock.types';
import { useToast } from '../components/ui/Toast';

// Query keys
export const stockKeys = {
  all: ['stocks'] as const,
  overview: () => [...stockKeys.all, 'overview'] as const,
  quote: (symbol: string) => [...stockKeys.all, 'quote', symbol] as const,
  quotes: (symbols: string[]) => [...stockKeys.all, 'quotes', symbols.join(',')] as const,
  search: (query: string) => [...stockKeys.all, 'search', query] as const,
  profile: (symbol: string) => [...stockKeys.all, 'profile', symbol] as const,
  candles: (symbol: string, resolution: string) =>
    [...stockKeys.all, 'candles', symbol, resolution] as const,
  watchlist: () => [...stockKeys.all, 'watchlist'] as const,
  portfolio: () => [...stockKeys.all, 'portfolio'] as const,
  holding: (id: number) => [...stockKeys.all, 'holding', id] as const,
  transactions: (page: number) => [...stockKeys.all, 'transactions', page] as const,
  alerts: (activeOnly: boolean) => [...stockKeys.all, 'alerts', activeOnly] as const,
  rateLimit: () => [...stockKeys.all, 'rate-limit'] as const,
};

// ============ Market Data Hooks ============

export function useMarketOverview() {
  return useQuery({
    queryKey: stockKeys.overview(),
    queryFn: stockService.getMarketOverview,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useStockQuote(symbol: string | undefined) {
  return useQuery({
    queryKey: stockKeys.quote(symbol || ''),
    queryFn: () => stockService.getQuote(symbol!),
    enabled: !!symbol,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useStockQuotes(symbols: string[]) {
  return useQuery({
    queryKey: stockKeys.quotes(symbols),
    queryFn: () => stockService.getQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: stockKeys.search(query),
    queryFn: () => stockService.searchStocks(query),
    enabled: query.length >= 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCompanyProfile(symbol: string | undefined) {
  return useQuery({
    queryKey: stockKeys.profile(symbol || ''),
    queryFn: () => stockService.getCompanyProfile(symbol!),
    enabled: !!symbol,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useStockCandles(
  symbol: string | undefined,
  resolution: string = 'D',
  from?: number,
  to?: number
) {
  return useQuery({
    queryKey: stockKeys.candles(symbol || '', resolution),
    queryFn: () => stockService.getCandles(symbol!, resolution, from, to),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRateLimitStatus() {
  return useQuery({
    queryKey: stockKeys.rateLimit(),
    queryFn: stockService.getRateLimitStatus,
    staleTime: 10 * 1000, // 10 seconds
  });
}

// ============ Watchlist Hooks ============

export function useWatchlist() {
  return useQuery({
    queryKey: stockKeys.watchlist(),
    queryFn: stockService.getWatchlist,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ symbol, name }: { symbol: string; name: string }) =>
      stockService.addToWatchlist(symbol, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.watchlist() });
      queryClient.invalidateQueries({ queryKey: stockKeys.overview() });
      showToast('Added to watchlist', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to add to watchlist', 'error');
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (symbol: string) => stockService.removeFromWatchlist(symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.watchlist() });
      queryClient.invalidateQueries({ queryKey: stockKeys.overview() });
      showToast('Removed from watchlist', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to remove from watchlist', 'error');
    },
  });
}

// ============ Portfolio Hooks ============

export function usePortfolio() {
  return useQuery({
    queryKey: stockKeys.portfolio(),
    queryFn: stockService.getPortfolio,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useHolding(holdingId: number | undefined) {
  return useQuery({
    queryKey: stockKeys.holding(holdingId || 0),
    queryFn: () => stockService.getHolding(holdingId!),
    enabled: !!holdingId,
    staleTime: 30 * 1000,
  });
}

export function useTransactions(page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: stockKeys.transactions(page),
    queryFn: () => stockService.getTransactions(page, limit),
    staleTime: 30 * 1000,
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: TransactionFormData) => stockService.addTransaction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: stockKeys.portfolio() });
      queryClient.invalidateQueries({ queryKey: stockKeys.transactions(1) });
      const action = variables.type === 'buy' ? 'Bought' : 'Sold';
      showToast(`${action} ${variables.quantity} shares of ${variables.symbol}`, 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Transaction failed', 'error');
    },
  });
}

export function useDeleteHolding() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (holdingId: number) => stockService.deleteHolding(holdingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.portfolio() });
      showToast('Holding deleted', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to delete holding', 'error');
    },
  });
}

// ============ Alert Hooks ============

export function useAlerts(activeOnly: boolean = false) {
  return useQuery({
    queryKey: stockKeys.alerts(activeOnly),
    queryFn: () => stockService.getAlerts(activeOnly),
    staleTime: 30 * 1000,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: AlertFormData) => stockService.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts(false) });
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts(true) });
      showToast('Alert created', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to create alert', 'error');
    },
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      alertId,
      data,
    }: {
      alertId: number;
      data: Partial<{ conditionType: 'above' | 'below'; targetPrice: number; isActive: boolean }>;
    }) => stockService.updateAlert(alertId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts(false) });
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts(true) });
      showToast('Alert updated', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to update alert', 'error');
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (alertId: number) => stockService.deleteAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts(false) });
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts(true) });
      showToast('Alert deleted', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to delete alert', 'error');
    },
  });
}

export function useCheckAlerts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stockService.checkAlerts,
    onSuccess: (data) => {
      if (data.triggered.length > 0) {
        queryClient.invalidateQueries({ queryKey: stockKeys.alerts(false) });
        queryClient.invalidateQueries({ queryKey: stockKeys.alerts(true) });
      }
    },
  });
}
