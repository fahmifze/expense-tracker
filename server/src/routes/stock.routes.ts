import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import * as stockController from '../controllers/stock.controller';

const router = Router();

// ============ Public Routes (with optional auth for watchlist status) ============

// Market data
router.get('/overview', optionalAuthenticate, stockController.getMarketOverview);
router.get('/search', stockController.searchStocks);
router.get('/quotes', optionalAuthenticate, stockController.getQuotes);
router.get('/quote/:symbol', optionalAuthenticate, stockController.getQuote);
router.get('/profile/:symbol', stockController.getCompanyProfile);
router.get('/candles/:symbol', stockController.getCandles);
router.get('/rate-limit', stockController.getRateLimitStatus);

// ============ Protected Routes ============

// Watchlist
router.get('/watchlist', authenticate, stockController.getWatchlist);
router.post('/watchlist', authenticate, stockController.addToWatchlist);
router.delete('/watchlist/:symbol', authenticate, stockController.removeFromWatchlist);

// Portfolio
router.get('/portfolio', authenticate, stockController.getPortfolio);
router.get('/portfolio/transactions', authenticate, stockController.getTransactions);
router.get('/portfolio/:holdingId', authenticate, stockController.getHolding);
router.post('/portfolio/transactions', authenticate, stockController.addTransaction);
router.delete('/portfolio/:holdingId', authenticate, stockController.deleteHolding);

// Alerts
router.get('/alerts', authenticate, stockController.getAlerts);
router.post('/alerts', authenticate, stockController.createAlert);
router.put('/alerts/:alertId', authenticate, stockController.updateAlert);
router.delete('/alerts/:alertId', authenticate, stockController.deleteAlert);
router.post('/alerts/check', authenticate, stockController.checkAlerts);

export default router;
