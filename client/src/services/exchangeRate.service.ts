import api from './api';
import { ApiResponse } from '../types/api.types';

export interface ExchangeRatesResponse {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
  lastUpdated?: number;
}

export interface ConvertResponse {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: number;
}

export interface RateLimitStatus {
  used: number;
  remaining: number;
  resetTime: number;
}

export async function getExchangeRates(): Promise<ExchangeRatesResponse> {
  const response = await api.get<ApiResponse<any>>('/exchange-rates');
  const data = response.data.data;
  // Map backend response (timestamp) to frontend expected format (lastUpdated)
  return {
    base: data?.base || 'USD',
    rates: data?.rates || {},
    timestamp: data?.timestamp || Date.now() / 1000,
    lastUpdated: data?.timestamp ? data.timestamp * 1000 : Date.now(), // Convert unix seconds to milliseconds
  };
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<ConvertResponse> {
  const response = await api.get<ApiResponse<any>>('/exchange-rates/convert', {
    params: { amount, from, to },
  });
  const data = response.data.data;
  // Map backend response (result) to frontend expected format (convertedAmount)
  return {
    from: data?.from || from,
    to: data?.to || to,
    amount: data?.amount || amount,
    convertedAmount: data?.result || 0, // Backend sends 'result', frontend expects 'convertedAmount'
    rate: data?.rate || 0,
    timestamp: data?.timestamp || Date.now() / 1000,
  };
}

export async function getRateLimitStatus(): Promise<RateLimitStatus> {
  const response = await api.get<ApiResponse<any>>('/exchange-rates/status');
  // Map from backend structure to frontend structure
  const data = response.data.data;
  return {
    used: data?.data?.usage?.requests || 0,
    remaining: data?.data?.usage?.requestsRemaining || 1000,
    resetTime: Date.now() + 3600000,
  };
}
