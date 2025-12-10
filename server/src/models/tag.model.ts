import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface ExpenseTag {
  id: number;
  expenseId: number;
  tag: string;
  createdAt: Date;
}

export async function findByExpenseId(expenseId: number): Promise<string[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT tag FROM expense_tags WHERE expense_id = ? ORDER BY tag ASC`,
    [expenseId]
  );

  return rows.map((row) => row.tag);
}

export async function findByUserId(userId: number): Promise<string[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT DISTINCT et.tag
     FROM expense_tags et
     JOIN expenses e ON et.expense_id = e.id
     WHERE e.user_id = ?
     ORDER BY et.tag ASC`,
    [userId]
  );

  return rows.map((row) => row.tag);
}

export async function addTag(expenseId: number, tag: string): Promise<boolean> {
  try {
    await pool.execute<ResultSetHeader>(
      `INSERT IGNORE INTO expense_tags (expense_id, tag) VALUES (?, ?)`,
      [expenseId, tag.trim().toLowerCase()]
    );
    return true;
  } catch {
    return false;
  }
}

export async function addTags(expenseId: number, tags: string[]): Promise<void> {
  const uniqueTags = [...new Set(tags.map((t) => t.trim().toLowerCase()).filter((t) => t))];

  for (const tag of uniqueTags) {
    await addTag(expenseId, tag);
  }
}

export async function removeTag(expenseId: number, tag: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM expense_tags WHERE expense_id = ? AND tag = ?`,
    [expenseId, tag.trim().toLowerCase()]
  );

  return result.affectedRows > 0;
}

export async function removeAllTags(expenseId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM expense_tags WHERE expense_id = ?`,
    [expenseId]
  );

  return result.affectedRows > 0;
}

export async function setTags(expenseId: number, tags: string[]): Promise<string[]> {
  // Remove all existing tags
  await removeAllTags(expenseId);

  // Add new tags
  await addTags(expenseId, tags);

  // Return the current tags
  return findByExpenseId(expenseId);
}

export async function findExpensesByTag(userId: number, tag: string): Promise<number[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT DISTINCT e.id
     FROM expenses e
     JOIN expense_tags et ON e.id = et.expense_id
     WHERE e.user_id = ? AND et.tag = ?`,
    [userId, tag.trim().toLowerCase()]
  );

  return rows.map((row) => row.id);
}

export async function getPopularTags(userId: number, limit: number = 10): Promise<{ tag: string; count: number }[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT et.tag, COUNT(*) as count
     FROM expense_tags et
     JOIN expenses e ON et.expense_id = e.id
     WHERE e.user_id = ?
     GROUP BY et.tag
     ORDER BY count DESC, et.tag ASC
     LIMIT ${Number(limit)}`,
    [userId]
  );

  return rows as { tag: string; count: number }[];
}
