import pool from './db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface PortfolioHolding {
  id: number;
  userId: number;
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioTransaction {
  id: number;
  userId: number;
  holdingId: number;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  transactionDate: Date;
  notes?: string;
  createdAt: Date;
}

interface HoldingRow extends RowDataPacket {
  id: number;
  user_id: number;
  symbol: string;
  name: string;
  quantity: string;
  average_cost: string;
  created_at: Date;
  updated_at: Date;
}

interface TransactionRow extends RowDataPacket {
  id: number;
  user_id: number;
  holding_id: number;
  type: 'buy' | 'sell';
  quantity: string;
  price: string;
  transaction_date: Date;
  notes: string | null;
  created_at: Date;
}

function mapHoldingRow(row: HoldingRow): PortfolioHolding {
  return {
    id: row.id,
    userId: row.user_id,
    symbol: row.symbol,
    name: row.name,
    quantity: parseFloat(row.quantity),
    averageCost: parseFloat(row.average_cost),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTransactionRow(row: TransactionRow): PortfolioTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    holdingId: row.holding_id,
    type: row.type,
    quantity: parseFloat(row.quantity),
    price: parseFloat(row.price),
    transactionDate: row.transaction_date,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

// Holdings

export async function findAllHoldings(userId: number): Promise<PortfolioHolding[]> {
  const [rows] = await pool.execute<HoldingRow[]>(
    'SELECT * FROM portfolio_holdings WHERE user_id = ? AND quantity > 0 ORDER BY symbol',
    [userId]
  );
  return rows.map(mapHoldingRow);
}

export async function findHoldingBySymbol(userId: number, symbol: string): Promise<PortfolioHolding | null> {
  const [rows] = await pool.execute<HoldingRow[]>(
    'SELECT * FROM portfolio_holdings WHERE user_id = ? AND symbol = ?',
    [userId, symbol.toUpperCase()]
  );
  return rows.length > 0 ? mapHoldingRow(rows[0]) : null;
}

export async function findHoldingById(userId: number, holdingId: number): Promise<PortfolioHolding | null> {
  const [rows] = await pool.execute<HoldingRow[]>(
    'SELECT * FROM portfolio_holdings WHERE user_id = ? AND id = ?',
    [userId, holdingId]
  );
  return rows.length > 0 ? mapHoldingRow(rows[0]) : null;
}

export async function getHoldingSymbols(userId: number): Promise<string[]> {
  const [rows] = await pool.execute<HoldingRow[]>(
    'SELECT symbol FROM portfolio_holdings WHERE user_id = ? AND quantity > 0',
    [userId]
  );
  return rows.map(row => row.symbol);
}

// Create or update holding based on transaction
async function upsertHolding(
  userId: number,
  symbol: string,
  name: string,
  quantity: number,
  price: number,
  type: 'buy' | 'sell'
): Promise<PortfolioHolding> {
  const upperSymbol = symbol.toUpperCase();
  const existing = await findHoldingBySymbol(userId, upperSymbol);

  if (existing) {
    let newQuantity: number;
    let newAverageCost: number;

    if (type === 'buy') {
      const totalCost = existing.quantity * existing.averageCost + quantity * price;
      newQuantity = existing.quantity + quantity;
      newAverageCost = newQuantity > 0 ? totalCost / newQuantity : 0;
    } else {
      newQuantity = existing.quantity - quantity;
      newAverageCost = existing.averageCost; // Keep same average cost on sell
    }

    await pool.execute(
      'UPDATE portfolio_holdings SET quantity = ?, average_cost = ? WHERE id = ?',
      [newQuantity, newAverageCost, existing.id]
    );

    return {
      ...existing,
      quantity: newQuantity,
      averageCost: newAverageCost,
      updatedAt: new Date(),
    };
  } else {
    if (type === 'sell') {
      throw new Error('Cannot sell a stock you do not own');
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO portfolio_holdings (user_id, symbol, name, quantity, average_cost) VALUES (?, ?, ?, ?, ?)',
      [userId, upperSymbol, name, quantity, price]
    );

    return {
      id: result.insertId,
      userId,
      symbol: upperSymbol,
      name,
      quantity,
      averageCost: price,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// Transactions

export async function findTransactionsByHolding(
  userId: number,
  holdingId: number
): Promise<PortfolioTransaction[]> {
  const [rows] = await pool.execute<TransactionRow[]>(
    `SELECT * FROM portfolio_transactions
     WHERE user_id = ? AND holding_id = ?
     ORDER BY transaction_date DESC, created_at DESC`,
    [userId, holdingId]
  );
  return rows.map(mapTransactionRow);
}

export async function findAllTransactions(
  userId: number,
  options: { limit?: number; offset?: number } = {}
): Promise<{ transactions: PortfolioTransaction[]; total: number }> {
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  const [countRows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM portfolio_transactions WHERE user_id = ?',
    [userId]
  );
  const total = countRows[0].count;

  const [rows] = await pool.execute<TransactionRow[]>(
    `SELECT * FROM portfolio_transactions
     WHERE user_id = ?
     ORDER BY transaction_date DESC, created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  return {
    transactions: rows.map(mapTransactionRow),
    total,
  };
}

export async function addTransaction(data: {
  userId: number;
  symbol: string;
  name: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  transactionDate: Date;
  notes?: string;
}): Promise<{ holding: PortfolioHolding; transaction: PortfolioTransaction }> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Update or create holding
    const holding = await upsertHolding(
      data.userId,
      data.symbol,
      data.name,
      data.quantity,
      data.price,
      data.type
    );

    // Create transaction record
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO portfolio_transactions
       (user_id, holding_id, type, quantity, price, transaction_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.userId,
        holding.id,
        data.type,
        data.quantity,
        data.price,
        data.transactionDate.toISOString().split('T')[0],
        data.notes || null,
      ]
    );

    await connection.commit();

    const transaction: PortfolioTransaction = {
      id: result.insertId,
      userId: data.userId,
      holdingId: holding.id,
      type: data.type,
      quantity: data.quantity,
      price: data.price,
      transactionDate: data.transactionDate,
      notes: data.notes,
      createdAt: new Date(),
    };

    return { holding, transaction };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteHolding(userId: number, holdingId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM portfolio_holdings WHERE user_id = ? AND id = ?',
    [userId, holdingId]
  );
  return result.affectedRows > 0;
}

// Portfolio summary
export async function getPortfolioSummary(userId: number): Promise<{
  totalHoldings: number;
  totalInvested: number;
}> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       COUNT(*) as total_holdings,
       COALESCE(SUM(quantity * average_cost), 0) as total_invested
     FROM portfolio_holdings
     WHERE user_id = ? AND quantity > 0`,
    [userId]
  );

  return {
    totalHoldings: rows[0].total_holdings,
    totalInvested: parseFloat(rows[0].total_invested) || 0,
  };
}
