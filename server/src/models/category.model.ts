import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Category {
  id: number;
  user_id: number | null;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: Date;
}

export interface CategoryPublic {
  id: number;
  userId: number | null;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface CreateCategoryData {
  userId: number;
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryData {
  name?: string;
  icon?: string;
  color?: string;
}

export function toCategoryPublic(category: Category): CategoryPublic {
  return {
    id: category.id,
    userId: category.user_id,
    name: category.name,
    icon: category.icon,
    color: category.color,
    isDefault: category.is_default,
    createdAt: category.created_at,
  };
}

// Get all categories for a user (default + user's custom)
export async function findAllForUser(userId: number): Promise<Category[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM categories
     WHERE user_id IS NULL OR user_id = ?
     ORDER BY is_default DESC, name ASC`,
    [userId]
  );
  return rows as Category[];
}

// Get default categories only
export async function findDefaults(): Promise<Category[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM categories WHERE user_id IS NULL ORDER BY name ASC'
  );
  return rows as Category[];
}

// Get single category by ID
export async function findById(id: number): Promise<Category | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM categories WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? (rows[0] as Category) : null;
}

// Check if user owns category or it's a default
export async function canUserAccess(categoryId: number, userId: number): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM categories WHERE id = ? AND (user_id IS NULL OR user_id = ?)',
    [categoryId, userId]
  );
  return rows.length > 0;
}

// Check if user owns category (for update/delete)
export async function isOwnedByUser(categoryId: number, userId: number): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM categories WHERE id = ? AND user_id = ?',
    [categoryId, userId]
  );
  return rows.length > 0;
}

// Create custom category
export async function create(data: CreateCategoryData): Promise<Category> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO categories (user_id, name, icon, color, is_default)
     VALUES (?, ?, ?, ?, FALSE)`,
    [data.userId, data.name, data.icon || 'tag', data.color || '#6B7280']
  );

  const category = await findById(result.insertId);
  if (!category) {
    throw new Error('Failed to create category');
  }
  return category;
}

// Update category
export async function update(id: number, data: UpdateCategoryData): Promise<Category | null> {
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.name) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.icon) {
    updates.push('icon = ?');
    values.push(data.icon);
  }
  if (data.color) {
    updates.push('color = ?');
    values.push(data.color);
  }

  if (updates.length === 0) return findById(id);

  values.push(id);
  await pool.execute(
    `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return findById(id);
}

// Delete category
export async function deleteCategory(id: number): Promise<void> {
  await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
}

// Check if category name exists for user
export async function nameExistsForUser(name: string, userId: number, excludeId?: number): Promise<boolean> {
  let query = 'SELECT id FROM categories WHERE name = ? AND (user_id IS NULL OR user_id = ?)';
  const params: (string | number)[] = [name, userId];

  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const [rows] = await pool.execute<RowDataPacket[]>(query, params);
  return rows.length > 0;
}
