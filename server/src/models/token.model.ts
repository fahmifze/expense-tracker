import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export async function create(
  userId: number,
  token: string,
  expiresAt: Date
): Promise<RefreshToken> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES (?, ?, ?)`,
    [userId, token, expiresAt]
  );

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM refresh_tokens WHERE id = ?',
    [result.insertId]
  );

  return rows[0] as RefreshToken;
}

export async function findByToken(token: string): Promise<RefreshToken | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM refresh_tokens WHERE token = ?',
    [token]
  );
  return rows.length > 0 ? (rows[0] as RefreshToken) : null;
}

export async function deleteByToken(token: string): Promise<void> {
  await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
}

export async function deleteByUserId(userId: number): Promise<void> {
  await pool.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
}

export async function deleteExpired(): Promise<void> {
  await pool.execute('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
}
