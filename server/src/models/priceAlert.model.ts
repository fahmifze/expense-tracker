import pool from './db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface PriceAlert {
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

interface AlertRow extends RowDataPacket {
  id: number;
  user_id: number;
  symbol: string;
  name: string;
  condition_type: 'above' | 'below';
  target_price: string;
  is_triggered: number;
  is_active: number;
  triggered_at: Date | null;
  created_at: Date;
}

function mapRowToAlert(row: AlertRow): PriceAlert {
  return {
    id: row.id,
    userId: row.user_id,
    symbol: row.symbol,
    name: row.name,
    conditionType: row.condition_type,
    targetPrice: parseFloat(row.target_price),
    isTriggered: row.is_triggered === 1,
    isActive: row.is_active === 1,
    triggeredAt: row.triggered_at || undefined,
    createdAt: row.created_at,
  };
}

// Get all alerts for a user
export async function findAllByUser(
  userId: number,
  options: { activeOnly?: boolean } = {}
): Promise<PriceAlert[]> {
  let query = 'SELECT * FROM price_alerts WHERE user_id = ?';
  const params: (number | string)[] = [userId];

  if (options.activeOnly) {
    query += ' AND is_active = 1';
  }

  query += ' ORDER BY created_at DESC';

  const [rows] = await pool.execute<AlertRow[]>(query, params);
  return rows.map(mapRowToAlert);
}

// Get alerts by symbol
export async function findBySymbol(userId: number, symbol: string): Promise<PriceAlert[]> {
  const [rows] = await pool.execute<AlertRow[]>(
    'SELECT * FROM price_alerts WHERE user_id = ? AND symbol = ? ORDER BY created_at DESC',
    [userId, symbol.toUpperCase()]
  );
  return rows.map(mapRowToAlert);
}

// Get alert by ID
export async function findById(userId: number, alertId: number): Promise<PriceAlert | null> {
  const [rows] = await pool.execute<AlertRow[]>(
    'SELECT * FROM price_alerts WHERE user_id = ? AND id = ?',
    [userId, alertId]
  );
  return rows.length > 0 ? mapRowToAlert(rows[0]) : null;
}

// Create alert
export async function create(data: {
  userId: number;
  symbol: string;
  name: string;
  conditionType: 'above' | 'below';
  targetPrice: number;
}): Promise<PriceAlert> {
  const upperSymbol = data.symbol.toUpperCase();

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO price_alerts (user_id, symbol, name, condition_type, target_price)
     VALUES (?, ?, ?, ?, ?)`,
    [data.userId, upperSymbol, data.name, data.conditionType, data.targetPrice]
  );

  return {
    id: result.insertId,
    userId: data.userId,
    symbol: upperSymbol,
    name: data.name,
    conditionType: data.conditionType,
    targetPrice: data.targetPrice,
    isTriggered: false,
    isActive: true,
    createdAt: new Date(),
  };
}

// Update alert
export async function update(
  userId: number,
  alertId: number,
  data: {
    conditionType?: 'above' | 'below';
    targetPrice?: number;
    isActive?: boolean;
  }
): Promise<PriceAlert | null> {
  const updates: string[] = [];
  const params: (string | number | boolean)[] = [];

  if (data.conditionType !== undefined) {
    updates.push('condition_type = ?');
    params.push(data.conditionType);
  }

  if (data.targetPrice !== undefined) {
    updates.push('target_price = ?');
    params.push(data.targetPrice);
  }

  if (data.isActive !== undefined) {
    updates.push('is_active = ?');
    params.push(data.isActive ? 1 : 0);
    // Reset triggered status when reactivating
    if (data.isActive) {
      updates.push('is_triggered = 0');
      updates.push('triggered_at = NULL');
    }
  }

  if (updates.length === 0) {
    return findById(userId, alertId);
  }

  params.push(userId, alertId);

  await pool.execute(
    `UPDATE price_alerts SET ${updates.join(', ')} WHERE user_id = ? AND id = ?`,
    params
  );

  return findById(userId, alertId);
}

// Mark alert as triggered
export async function markTriggered(alertId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE price_alerts SET is_triggered = 1, triggered_at = NOW() WHERE id = ? AND is_active = 1',
    [alertId]
  );
  return result.affectedRows > 0;
}

// Delete alert
export async function remove(userId: number, alertId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM price_alerts WHERE user_id = ? AND id = ?',
    [userId, alertId]
  );
  return result.affectedRows > 0;
}

// Get active alerts that need to be checked
export async function getActiveAlertsForSymbols(symbols: string[]): Promise<PriceAlert[]> {
  if (symbols.length === 0) return [];

  const placeholders = symbols.map(() => '?').join(', ');
  const [rows] = await pool.execute<AlertRow[]>(
    `SELECT * FROM price_alerts
     WHERE symbol IN (${placeholders}) AND is_active = 1 AND is_triggered = 0`,
    symbols.map(s => s.toUpperCase())
  );

  return rows.map(mapRowToAlert);
}

// Get alert count for user
export async function getCount(userId: number, activeOnly: boolean = false): Promise<number> {
  let query = 'SELECT COUNT(*) as count FROM price_alerts WHERE user_id = ?';
  if (activeOnly) {
    query += ' AND is_active = 1';
  }

  const [rows] = await pool.execute<RowDataPacket[]>(query, [userId]);
  return rows[0].count;
}

// Get triggered alerts (for notification)
export async function getRecentlyTriggered(userId: number, since: Date): Promise<PriceAlert[]> {
  const [rows] = await pool.execute<AlertRow[]>(
    `SELECT * FROM price_alerts
     WHERE user_id = ? AND is_triggered = 1 AND triggered_at >= ?
     ORDER BY triggered_at DESC`,
    [userId, since.toISOString()]
  );
  return rows.map(mapRowToAlert);
}
