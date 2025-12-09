import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string | null;
  currency: string;
  profile_image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  currency: string;
  profileImageUrl: string | null;
  createdAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName?: string;
}

// Convert DB user to public user (camelCase, no password)
export function toUserPublic(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    currency: user.currency,
    profileImageUrl: user.profile_image_url,
    createdAt: user.created_at,
  };
}

export async function findByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
}

export async function findById(id: number): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
}

export async function create(data: CreateUserData): Promise<User> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (email, password_hash, first_name, last_name)
     VALUES (?, ?, ?, ?)`,
    [data.email, data.passwordHash, data.firstName, data.lastName || null]
  );

  const user = await findById(result.insertId);
  if (!user) {
    throw new Error('Failed to create user');
  }
  return user;
}

export async function updateProfile(
  id: number,
  data: { firstName?: string; lastName?: string; currency?: string }
): Promise<User | null> {
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.firstName) {
    updates.push('first_name = ?');
    values.push(data.firstName);
  }
  if (data.lastName !== undefined) {
    updates.push('last_name = ?');
    values.push(data.lastName);
  }
  if (data.currency) {
    updates.push('currency = ?');
    values.push(data.currency);
  }

  if (updates.length === 0) return findById(id);

  values.push(id);
  await pool.execute(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return findById(id);
}

export async function updatePassword(id: number, passwordHash: string): Promise<void> {
  await pool.execute(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [passwordHash, id]
  );
}

export async function deleteUser(id: number): Promise<void> {
  await pool.execute('DELETE FROM users WHERE id = ?', [id]);
}
