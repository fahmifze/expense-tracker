import pool from './db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface WatchlistItem {
  id: number;
  userId: number;
  symbol: string;
  name: string;
  addedAt: Date;
}

interface WatchlistRow extends RowDataPacket {
  id: number;
  user_id: number;
  symbol: string;
  name: string;
  added_at: Date;
}

function mapRowToItem(row: WatchlistRow): WatchlistItem {
  return {
    id: row.id,
    userId: row.user_id,
    symbol: row.symbol,
    name: row.name,
    addedAt: row.added_at,
  };
}

// Get all watchlist items for a user
export async function findAllByUser(userId: number): Promise<WatchlistItem[]> {
  const [rows] = await pool.execute<WatchlistRow[]>(
    'SELECT * FROM watchlist WHERE user_id = ? ORDER BY added_at DESC',
    [userId]
  );
  return rows.map(mapRowToItem);
}

// Get watchlist symbols for a user
export async function getSymbols(userId: number): Promise<string[]> {
  const [rows] = await pool.execute<WatchlistRow[]>(
    'SELECT symbol FROM watchlist WHERE user_id = ?',
    [userId]
  );
  return rows.map(row => row.symbol);
}

// Check if symbol is in watchlist
export async function isInWatchlist(userId: number, symbol: string): Promise<boolean> {
  const [rows] = await pool.execute<WatchlistRow[]>(
    'SELECT id FROM watchlist WHERE user_id = ? AND symbol = ?',
    [userId, symbol.toUpperCase()]
  );
  return rows.length > 0;
}

// Add to watchlist
export async function add(userId: number, symbol: string, name: string): Promise<WatchlistItem> {
  const upperSymbol = symbol.toUpperCase();

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO watchlist (user_id, symbol, name) VALUES (?, ?, ?)',
    [userId, upperSymbol, name]
  );

  return {
    id: result.insertId,
    userId,
    symbol: upperSymbol,
    name,
    addedAt: new Date(),
  };
}

// Remove from watchlist
export async function remove(userId: number, symbol: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM watchlist WHERE user_id = ? AND symbol = ?',
    [userId, symbol.toUpperCase()]
  );
  return result.affectedRows > 0;
}

// Get watchlist count
export async function getCount(userId: number): Promise<number> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM watchlist WHERE user_id = ?',
    [userId]
  );
  return rows[0].count;
}
