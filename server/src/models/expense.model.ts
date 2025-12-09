import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Expense {
  id: number;
  userId: number;
  categoryId: number;
  amount: number;
  description: string | null;
  expenseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseWithCategory extends Expense {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
}

export interface CreateExpenseData {
  userId: number;
  categoryId: number;
  amount: number;
  description?: string;
  expenseDate: Date;
}

export interface UpdateExpenseData {
  categoryId?: number;
  amount?: number;
  description?: string;
  expenseDate?: Date;
}

export interface ExpenseFilters {
  userId: number;
  categoryId?: number;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'expenseDate' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function findAllByUser(
  filters: ExpenseFilters
): Promise<PaginatedResult<ExpenseWithCategory>> {
  const {
    userId,
    categoryId,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    page = 1,
    limit = 10,
    sortBy = 'expenseDate',
    sortOrder = 'desc',
  } = filters;

  // Build WHERE clause
  const conditions: string[] = ['e.user_id = ?'];
  const params: (string | number | Date)[] = [userId];

  if (categoryId) {
    conditions.push('e.category_id = ?');
    params.push(categoryId);
  }

  if (startDate) {
    conditions.push('e.expense_date >= ?');
    params.push(startDate);
  }

  if (endDate) {
    conditions.push('e.expense_date <= ?');
    params.push(endDate);
  }

  if (minAmount !== undefined) {
    conditions.push('e.amount >= ?');
    params.push(minAmount);
  }

  if (maxAmount !== undefined) {
    conditions.push('e.amount <= ?');
    params.push(maxAmount);
  }

  if (search) {
    conditions.push('e.description LIKE ?');
    params.push(`%${search}%`);
  }

  const whereClause = conditions.join(' AND ');

  // Map sortBy to actual column names
  const sortColumn = {
    expenseDate: 'e.expense_date',
    amount: 'e.amount',
    createdAt: 'e.created_at',
  }[sortBy];

  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Get total count
  const [countResult] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM expenses e WHERE ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  // Get paginated data
  const offset = (page - 1) * limit;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      e.id,
      e.user_id as userId,
      e.category_id as categoryId,
      e.amount,
      e.description,
      e.expense_date as expenseDate,
      e.created_at as createdAt,
      e.updated_at as updatedAt,
      c.name as categoryName,
      c.icon as categoryIcon,
      c.color as categoryColor
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
    params
  );

  return {
    data: rows as ExpenseWithCategory[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findById(id: number): Promise<ExpenseWithCategory | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      e.id,
      e.user_id as userId,
      e.category_id as categoryId,
      e.amount,
      e.description,
      e.expense_date as expenseDate,
      e.created_at as createdAt,
      e.updated_at as updatedAt,
      c.name as categoryName,
      c.icon as categoryIcon,
      c.color as categoryColor
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?`,
    [id]
  );

  return rows.length > 0 ? (rows[0] as ExpenseWithCategory) : null;
}

export async function create(data: CreateExpenseData): Promise<ExpenseWithCategory> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO expenses (user_id, category_id, amount, description, expense_date)
     VALUES (?, ?, ?, ?, ?)`,
    [data.userId, data.categoryId, data.amount, data.description || null, data.expenseDate]
  );

  const expense = await findById(result.insertId);
  return expense!;
}

export async function update(
  id: number,
  data: UpdateExpenseData
): Promise<ExpenseWithCategory | null> {
  const updates: string[] = [];
  const params: (string | number | Date)[] = [];

  if (data.categoryId !== undefined) {
    updates.push('category_id = ?');
    params.push(data.categoryId);
  }

  if (data.amount !== undefined) {
    updates.push('amount = ?');
    params.push(data.amount);
  }

  if (data.description !== undefined) {
    updates.push('description = ?');
    params.push(data.description);
  }

  if (data.expenseDate !== undefined) {
    updates.push('expense_date = ?');
    params.push(data.expenseDate);
  }

  if (updates.length === 0) {
    return findById(id);
  }

  updates.push('updated_at = NOW()');
  params.push(id);

  await pool.execute(
    `UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  return findById(id);
}

export async function remove(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM expenses WHERE id = ?',
    [id]
  );

  return result.affectedRows > 0;
}

// Stats helpers
export async function getMonthlyTotal(
  userId: number,
  year: number,
  month: number
): Promise<number> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM expenses
     WHERE user_id = ? AND YEAR(expense_date) = ? AND MONTH(expense_date) = ?`,
    [userId, year, month]
  );

  return rows[0].total;
}

export async function getCategoryTotals(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<{ categoryId: number; categoryName: string; total: number }[]> {
  let query = `
    SELECT
      c.id as categoryId,
      c.name as categoryName,
      COALESCE(SUM(e.amount), 0) as total
    FROM categories c
    LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = ?
  `;

  const params: (number | Date)[] = [userId];

  if (startDate) {
    query += ' AND e.expense_date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND e.expense_date <= ?';
    params.push(endDate);
  }

  query += `
    WHERE c.is_default = 1 OR c.user_id = ?
    GROUP BY c.id, c.name
    ORDER BY total DESC
  `;
  params.push(userId);

  const [rows] = await pool.execute<RowDataPacket[]>(query, params);

  return rows as { categoryId: number; categoryName: string; total: number }[];
}

export async function getRecentExpenses(
  userId: number,
  limitCount: number = 5
): Promise<ExpenseWithCategory[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      e.id,
      e.user_id as userId,
      e.category_id as categoryId,
      e.amount,
      e.description,
      e.expense_date as expenseDate,
      e.created_at as createdAt,
      e.updated_at as updatedAt,
      c.name as categoryName,
      c.icon as categoryIcon,
      c.color as categoryColor
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = ?
    ORDER BY e.expense_date DESC, e.created_at DESC
    LIMIT ${Number(limitCount)}`,
    [userId]
  );

  return rows as ExpenseWithCategory[];
}

// Get monthly totals for the last N months
export async function getMonthlyTrend(
  userId: number,
  months: number = 6
): Promise<{ month: string; year: number; total: number }[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      DATE_FORMAT(expense_date, '%b') as month,
      YEAR(expense_date) as year,
      MONTH(expense_date) as monthNum,
      COALESCE(SUM(amount), 0) as total
    FROM expenses
    WHERE user_id = ?
      AND expense_date >= DATE_SUB(CURDATE(), INTERVAL ${Number(months)} MONTH)
    GROUP BY YEAR(expense_date), MONTH(expense_date), DATE_FORMAT(expense_date, '%b')
    ORDER BY year ASC, monthNum ASC`,
    [userId]
  );

  return rows as { month: string; year: number; total: number }[];
}

// Get daily totals for a specific month
export async function getDailyTotals(
  userId: number,
  year: number,
  month: number
): Promise<{ day: number; total: number }[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      DAY(expense_date) as day,
      COALESCE(SUM(amount), 0) as total
    FROM expenses
    WHERE user_id = ?
      AND YEAR(expense_date) = ?
      AND MONTH(expense_date) = ?
    GROUP BY DAY(expense_date)
    ORDER BY day ASC`,
    [userId, year, month]
  );

  return rows as { day: number; total: number }[];
}

// Get category totals with color for pie chart
export async function getCategoryBreakdown(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<{ name: string; value: number; color: string }[]> {
  let query = `
    SELECT
      c.name as name,
      c.color as color,
      COALESCE(SUM(e.amount), 0) as value
    FROM categories c
    LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = ?
  `;

  const params: (number | Date)[] = [userId];

  if (startDate) {
    query += ' AND e.expense_date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND e.expense_date <= ?';
    params.push(endDate);
  }

  query += `
    WHERE c.is_default = 1 OR c.user_id = ?
    GROUP BY c.id, c.name, c.color
    HAVING value > 0
    ORDER BY value DESC
  `;
  params.push(userId);

  const [rows] = await pool.execute<RowDataPacket[]>(query, params);

  return rows as { name: string; value: number; color: string }[];
}
