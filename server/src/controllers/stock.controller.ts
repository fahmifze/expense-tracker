import { Request, Response, NextFunction } from 'express';
import * as stockService from '../services/stock.service';
import * as watchlistModel from '../models/watchlist.model';
import * as portfolioModel from '../models/portfolio.model';
import * as priceAlertModel from '../models/priceAlert.model';
import { sendSuccess, sendCreated, sendNoContent, sendError, sendNotFound } from '../utils/response';

// ============ Stock Quotes & Data ============

// Get stock quote
export async function getQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return sendError(res, 'Symbol is required', 400);
    }

    const quote = await stockService.getQuote(symbol);

    // If user is logged in, check if in watchlist
    let isInWatchlist = false;
    if (req.user?.userId) {
      isInWatchlist = await watchlistModel.isInWatchlist(req.user.userId, symbol);
    }

    return sendSuccess(res, { ...quote, isInWatchlist });
  } catch (error) {
    next(error);
  }
}

// Get multiple quotes
export async function getQuotes(req: Request, res: Response, next: NextFunction) {
  try {
    const { symbols } = req.query;

    if (!symbols) {
      return sendError(res, 'Symbols are required', 400);
    }

    const symbolList = (symbols as string).split(',').map(s => s.trim().toUpperCase());
    const quotes = await stockService.getQuotes(symbolList);

    return sendSuccess(res, { quotes });
  } catch (error) {
    next(error);
  }
}

// Search stocks
export async function searchStocks(req: Request, res: Response, next: NextFunction) {
  try {
    const { q } = req.query;

    if (!q) {
      return sendError(res, 'Search query is required', 400);
    }

    const results = await stockService.searchStocks(q as string);
    return sendSuccess(res, { results });
  } catch (error) {
    next(error);
  }
}

// Get company profile
export async function getCompanyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return sendError(res, 'Symbol is required', 400);
    }

    const profile = await stockService.getCompanyProfile(symbol);
    return sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
}

// Get stock candles (chart data)
export async function getCandles(req: Request, res: Response, next: NextFunction) {
  try {
    const { symbol } = req.params;
    const { resolution = 'D', from, to } = req.query;

    if (!symbol) {
      return sendError(res, 'Symbol is required', 400);
    }

    const validResolutions = ['1', '5', '15', '30', '60', 'D', 'W', 'M'];
    if (!validResolutions.includes(resolution as string)) {
      return sendError(res, 'Invalid resolution', 400);
    }

    const candles = await stockService.getCandles(
      symbol,
      resolution as '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M',
      from ? parseInt(from as string) : undefined,
      to ? parseInt(to as string) : undefined
    );

    return sendSuccess(res, { candles });
  } catch (error) {
    next(error);
  }
}

// Get market overview
export async function getMarketOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const [quotes, marketStatus] = await Promise.all([
      stockService.getMarketOverview(),
      stockService.getMarketStatus(),
    ]);

    // If user is logged in, mark watchlist items
    let watchlistSymbols: string[] = [];
    if (req.user?.userId) {
      watchlistSymbols = await watchlistModel.getSymbols(req.user.userId);
    }

    const quotesWithWatchlist = quotes.map(quote => ({
      ...quote,
      isInWatchlist: watchlistSymbols.includes(quote.symbol),
    }));

    return sendSuccess(res, {
      quotes: quotesWithWatchlist,
      marketStatus,
    });
  } catch (error) {
    next(error);
  }
}

// Get rate limit status
export async function getRateLimitStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const status = stockService.getStockRateLimitStatus();
    return sendSuccess(res, status);
  } catch (error) {
    next(error);
  }
}

// ============ Watchlist ============

// Get user's watchlist with quotes
export async function getWatchlist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const watchlist = await watchlistModel.findAllByUser(userId);

    if (watchlist.length === 0) {
      return sendSuccess(res, { watchlist: [] });
    }

    // Get quotes for watchlist items
    const symbols = watchlist.map(item => item.symbol);
    const quotes = await stockService.getQuotes(symbols);

    const watchlistWithQuotes = watchlist.map(item => {
      const quote = quotes.find(q => q.symbol === item.symbol);
      return {
        ...item,
        quote: quote || null,
      };
    });

    return sendSuccess(res, { watchlist: watchlistWithQuotes });
  } catch (error) {
    next(error);
  }
}

// Add to watchlist
export async function addToWatchlist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { symbol, name } = req.body;

    if (!symbol || !name) {
      return sendError(res, 'Symbol and name are required', 400);
    }

    // Check if already in watchlist
    const isInList = await watchlistModel.isInWatchlist(userId, symbol);
    if (isInList) {
      return sendError(res, 'Stock already in watchlist', 400);
    }

    const item = await watchlistModel.add(userId, symbol, name);
    return sendCreated(res, item, 'Added to watchlist');
  } catch (error) {
    next(error);
  }
}

// Remove from watchlist
export async function removeFromWatchlist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { symbol } = req.params;

    const removed = await watchlistModel.remove(userId, symbol);

    if (!removed) {
      return sendNotFound(res, 'Stock not found in watchlist');
    }

    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

// ============ Portfolio ============

// Get portfolio holdings with current values
export async function getPortfolio(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const holdings = await portfolioModel.findAllHoldings(userId);

    if (holdings.length === 0) {
      return sendSuccess(res, {
        holdings: [],
        summary: {
          totalValue: 0,
          totalCost: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
        },
      });
    }

    // Get current quotes for all holdings
    const symbols = holdings.map(h => h.symbol);
    const quotes = await stockService.getQuotes(symbols);

    let totalValue = 0;
    let totalCost = 0;

    const holdingsWithValues = holdings.map(holding => {
      const quote = quotes.find(q => q.symbol === holding.symbol);
      const currentPrice = quote?.price || 0;
      const currentValue = holding.quantity * currentPrice;
      const costBasis = holding.quantity * holding.averageCost;
      const gainLoss = currentValue - costBasis;
      const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

      totalValue += currentValue;
      totalCost += costBasis;

      return {
        ...holding,
        currentPrice,
        currentValue,
        costBasis,
        gainLoss,
        gainLossPercent,
        quote,
      };
    });

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return sendSuccess(res, {
      holdings: holdingsWithValues,
      summary: {
        totalValue,
        totalCost,
        totalGainLoss,
        totalGainLossPercent,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get holding detail
export async function getHolding(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { holdingId } = req.params;

    const holding = await portfolioModel.findHoldingById(userId, parseInt(holdingId));

    if (!holding) {
      return sendNotFound(res, 'Holding not found');
    }

    const [quote, transactions] = await Promise.all([
      stockService.getQuote(holding.symbol).catch(() => null),
      portfolioModel.findTransactionsByHolding(userId, holding.id),
    ]);

    const currentPrice = quote?.price || 0;
    const currentValue = holding.quantity * currentPrice;
    const costBasis = holding.quantity * holding.averageCost;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    return sendSuccess(res, {
      holding: {
        ...holding,
        currentPrice,
        currentValue,
        costBasis,
        gainLoss,
        gainLossPercent,
      },
      transactions,
      quote,
    });
  } catch (error) {
    next(error);
  }
}

// Add transaction (buy/sell)
export async function addTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { symbol, name, type, quantity, price, transactionDate, notes } = req.body;

    if (!symbol || !name || !type || !quantity || !price || !transactionDate) {
      return sendError(res, 'Missing required fields', 400);
    }

    if (!['buy', 'sell'].includes(type)) {
      return sendError(res, 'Type must be buy or sell', 400);
    }

    if (quantity <= 0 || price <= 0) {
      return sendError(res, 'Quantity and price must be positive', 400);
    }

    // Validate sell quantity
    if (type === 'sell') {
      const holding = await portfolioModel.findHoldingBySymbol(userId, symbol);
      if (!holding || holding.quantity < quantity) {
        return sendError(res, 'Insufficient shares to sell', 400);
      }
    }

    const result = await portfolioModel.addTransaction({
      userId,
      symbol,
      name,
      type,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      transactionDate: new Date(transactionDate),
      notes,
    });

    return sendCreated(res, result, `${type === 'buy' ? 'Bought' : 'Sold'} ${quantity} shares of ${symbol}`);
  } catch (error) {
    next(error);
  }
}

// Get all transactions
export async function getTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offset = (pageNum - 1) * limitNum;

    const result = await portfolioModel.findAllTransactions(userId, { limit: limitNum, offset });

    return sendSuccess(res, {
      transactions: result.transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        totalPages: Math.ceil(result.total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

// Delete holding
export async function deleteHolding(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { holdingId } = req.params;

    const deleted = await portfolioModel.deleteHolding(userId, parseInt(holdingId));

    if (!deleted) {
      return sendNotFound(res, 'Holding not found');
    }

    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

// ============ Price Alerts ============

// Get all alerts
export async function getAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { activeOnly } = req.query;

    const alerts = await priceAlertModel.findAllByUser(userId, {
      activeOnly: activeOnly === 'true',
    });

    // Get current prices for all alert symbols
    const symbols = [...new Set(alerts.map(a => a.symbol))];
    const quotes = symbols.length > 0 ? await stockService.getQuotes(symbols) : [];

    const alertsWithPrices = alerts.map(alert => {
      const quote = quotes.find(q => q.symbol === alert.symbol);
      return {
        ...alert,
        currentPrice: quote?.price || null,
      };
    });

    return sendSuccess(res, { alerts: alertsWithPrices });
  } catch (error) {
    next(error);
  }
}

// Create alert
export async function createAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { symbol, name, conditionType, targetPrice } = req.body;

    if (!symbol || !name || !conditionType || !targetPrice) {
      return sendError(res, 'Missing required fields', 400);
    }

    if (!['above', 'below'].includes(conditionType)) {
      return sendError(res, 'Condition type must be above or below', 400);
    }

    if (targetPrice <= 0) {
      return sendError(res, 'Target price must be positive', 400);
    }

    const alert = await priceAlertModel.create({
      userId,
      symbol,
      name,
      conditionType,
      targetPrice: parseFloat(targetPrice),
    });

    return sendCreated(res, alert, 'Alert created');
  } catch (error) {
    next(error);
  }
}

// Update alert
export async function updateAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { alertId } = req.params;
    const { conditionType, targetPrice, isActive } = req.body;

    const alert = await priceAlertModel.update(userId, parseInt(alertId), {
      conditionType,
      targetPrice: targetPrice !== undefined ? parseFloat(targetPrice) : undefined,
      isActive,
    });

    if (!alert) {
      return sendNotFound(res, 'Alert not found');
    }

    return sendSuccess(res, alert);
  } catch (error) {
    next(error);
  }
}

// Delete alert
export async function deleteAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { alertId } = req.params;

    const deleted = await priceAlertModel.remove(userId, parseInt(alertId));

    if (!deleted) {
      return sendNotFound(res, 'Alert not found');
    }

    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

// Check alerts (can be called periodically)
export async function checkAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    // Get all active alerts for user
    const alerts = await priceAlertModel.findAllByUser(userId, { activeOnly: true });

    if (alerts.length === 0) {
      return sendSuccess(res, { triggered: [] });
    }

    // Get current prices
    const symbols = [...new Set(alerts.map(a => a.symbol))];
    const quotes = await stockService.getQuotes(symbols);

    const triggered: PriceAlert[] = [];

    for (const alert of alerts) {
      if (alert.isTriggered) continue;

      const quote = quotes.find(q => q.symbol === alert.symbol);
      if (!quote) continue;

      const shouldTrigger =
        (alert.conditionType === 'above' && quote.price >= alert.targetPrice) ||
        (alert.conditionType === 'below' && quote.price <= alert.targetPrice);

      if (shouldTrigger) {
        await priceAlertModel.markTriggered(alert.id);
        triggered.push({ ...alert, isTriggered: true });
      }
    }

    return sendSuccess(res, { triggered });
  } catch (error) {
    next(error);
  }
}

interface PriceAlert {
  id: number;
  userId: number;
  symbol: string;
  name: string;
  conditionType: 'above' | 'below';
  targetPrice: number;
  isTriggered: boolean;
  isActive: boolean;
  triggeredAt?: Date;
  createdAt: Date;
}
