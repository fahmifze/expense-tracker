import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface IncomeCategory {
  id: number;
  userId: number | null;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface IncomeCategoryPublic {
  id: number;
  userId: number | null;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface CreateIncomeCategoryData {
  userId: number;
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateIncomeCategoryData {
  name?: string;
  icon?: string;
  color?: string;
}

export function toIncomeCategoryPublic(category: IncomeCategory): IncomeCategoryPublic {
  return {
    id: category.id,
    userId: category.userId,
    name: category.name,
    icon: category.icon,
    color: category.color,
    isDefault: category.isDefault,
  };
}

export async function findAllForUser(userId: number): Promise<IncomeCategoryPublic[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      id,
      user_id as userId,
      name,
      icon,
      color,
      is_default as isDefault,
      created_at as createdAt
    FROM income_categories
    WHERE is_default = TRUE OR user_id = ?
    ORDER BY is_default DESC, name ASC`,
    [userId]
  );

  return rows.map((row) => toIncomeCategoryPublic(row as IncomeCategory));
}

export async function findDefaults(): Promise<IncomeCategoryPublic[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      id,
      user_id as userId,
      name,
      icon,
      color,
      is_default as isDefault,
      created_at as createdAt
    FROM income_categories
    WHERE is_default = TRUE
    ORDER BY name ASC`
  );

  return rows.map((row) => toIncomeCategoryPublic(row as IncomeCategory));
}

export async function findById(id: number): Promise<IncomeCategory | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      id,
      user_id as userId,
      name,
      icon,
      color,
      is_default as isDefault,
      created_at as createdAt
    FROM income_categories
    WHERE id = ?`,
    [id]
  );

  return rows.length > 0 ? (rows[0] as IncomeCategory) : null;
}

export async function canUserAccess(categoryId: number, userId: number): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM income_categories
     WHERE id = ? AND (is_default = TRUE OR user_id = ?)`,
    [categoryId, userId]
  );

  return rows.length > 0;
}

export async function isOwnedByUser(categoryId: number, userId: number): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM income_categories
     WHERE id = ? AND user_id = ? AND is_default = FALSE`,
    [categoryId, userId]
  );

  return rows.length > 0;
}

export async function create(data: CreateIncomeCategoryData): Promise<IncomeCategoryPublic> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO income_categories (user_id, name, icon, color, is_default)
     VALUES (?, ?, ?, ?, FALSE)`,
    [data.userId, data.name, data.icon ?? 'dollar-sign', data.color ?? '#10B981']
  );

  const category = await findById(result.insertId);
  return toIncomeCategoryPublic(category!);
}

export async function update(id: number, data: UpdateIncomeCategoryData): Promise<IncomeCategoryPublic | null> {
  const updates: string[] = [];
  const params: string[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }

  if (data.icon !== undefined) {
    updates.push('icon = ?');
    params.push(data.icon);
  }

  if (data.color !== undefined) {
    updates.push('color = ?');
    params.push(data.color);
  }

  if (updates.length === 0) {
    const category = await findById(id);
    return category ? toIncomeCategoryPublic(category) : null;
  }

  params.push(String(id));

  await pool.execute(`UPDATE income_categories SET ${updates.join(', ')} WHERE id = ?`, params);

  const category = await findById(id);
  return category ? toIncomeCategoryPublic(category) : null;
}

export async function deleteCategory(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM income_categories WHERE id = ? AND is_default = FALSE',
    [id]
  );

  return result.affectedRows > 0;
}

export async function nameExistsForUser(
  name: string,
  userId: number,
  excludeId?: number
): Promise<boolean> {
  const query = excludeId
    ? `SELECT id FROM income_categories WHERE name = ? AND (user_id = ? OR is_default = TRUE) AND id != ?`
    : `SELECT id FROM income_categories WHERE name = ? AND (user_id = ? OR is_default = TRUE)`;

  const params = excludeId ? [name, userId, excludeId] : [name, userId];
  const [rows] = await pool.execute<RowDataPacket[]>(query, params);

  return rows.length > 0;
}
