import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Income {
  id: number;
  userId: number;
  categoryId: number | null;
  amount: number;
  description: string | null;
  notes: string | null;
  incomeDate: Date;
  isRecurring: boolean;
  recurringRuleId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeWithCategory extends Income {
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export interface CreateIncomeData {
  userId: number;
  categoryId?: number | null;
  amount: number;
  description?: string;
  notes?: string;
  incomeDate: Date;
  isRecurring?: boolean;
  recurringRuleId?: number | null;
}

export interface UpdateIncomeData {
  categoryId?: number | null;
  amount?: number;
  description?: string;
  notes?: string;
  incomeDate?: Date;
}

export interface IncomeFilters {
  userId: number;
  categoryId?: number;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'incomeDate' | 'amount' | 'createdAt';
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

export async function findAllByUser(filters: IncomeFilters): Promise<PaginatedResult<IncomeWithCategory>> {
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
    sortBy = 'incomeDate',
    sortOrder = 'desc',
  } = filters;

  const conditions: string[] = ['i.user_id = ?'];
  const params: (string | number | Date)[] = [userId];

  if (categoryId) {
    conditions.push('i.category_id = ?');
    params.push(categoryId);
  }

  if (startDate) {
    conditions.push('i.income_date >= ?');
    params.push(startDate);
  }

  if (endDate) {
    conditions.push('i.income_date <= ?');
    params.push(endDate);
  }

  if (minAmount !== undefined) {
    conditions.push('i.amount >= ?');
    params.push(minAmount);
  }

  if (maxAmount !== undefined) {
    conditions.push('i.amount <= ?');
    params.push(maxAmount);
  }

  if (search) {
    conditions.push('i.description LIKE ?');
    params.push(`%${search}%`);
  }

  const whereClause = conditions.join(' AND ');

  const sortColumn = {
    incomeDate: 'i.income_date',
    amount: 'i.amount',
    createdAt: 'i.created_at',
  }[sortBy];

  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const [countResult] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM incomes i WHERE ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      i.id,
      i.user_id as userId,
      i.category_id as categoryId,
      i.amount,
      i.description,
      i.notes,
      i.income_date as incomeDate,
      i.is_recurring as isRecurring,
      i.recurring_rule_id as recurringRuleId,
      i.created_at as createdAt,
      i.updated_at as updatedAt,
      c.name as categoryName,
      c.icon as categoryIcon,
      c.color as categoryColor
    FROM incomes i
    LEFT JOIN income_categories c ON i.category_id = c.id
    WHERE ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
    params
  );

  return {
    data: rows as IncomeWithCategory[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findById(id: number): Promise<IncomeWithCategory | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      i.id,
      i.user_id as userId,
      i.category_id as categoryId,
      i.amount,
      i.description,
      i.notes,
      i.income_date as incomeDate,
      i.is_recurring as isRecurring,
      i.recurring_rule_id as recurringRuleId,
      i.created_at as createdAt,
      i.updated_at as updatedAt,
      c.name as categoryName,
      c.icon as categoryIcon,
      c.color as categoryColor
    FROM incomes i
    LEFT JOIN income_categories c ON i.category_id = c.id
    WHERE i.id = ?`,
    [id]
  );

  return rows.length > 0 ? (rows[0] as IncomeWithCategory) : null;
}

export async function create(data: CreateIncomeData): Promise<IncomeWithCategory> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO incomes (user_id, category_id, amount, description, notes, income_date, is_recurring, recurring_rule_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.userId,
      data.categoryId ?? null,
      data.amount,
      data.description ?? null,
      data.notes ?? null,
      data.incomeDate,
      data.isRecurring ?? false,
      data.recurringRuleId ?? null,
    ]
  );

  const income = await findById(result.insertId);
  return income!;
}

export async function update(id: number, data: UpdateIncomeData): Promise<IncomeWithCategory | null> {
  const updates: string[] = [];
  const params: (string | number | Date | null)[] = [];

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

  if (data.notes !== undefined) {
    updates.push('notes = ?');
    params.push(data.notes);
  }

  if (data.incomeDate !== undefined) {
    updates.push('income_date = ?');
    params.push(data.incomeDate);
  }

  if (updates.length === 0) {
    return findById(id);
  }

  updates.push('updated_at = NOW()');
  params.push(id);

  await pool.execute(`UPDATE incomes SET ${updates.join(', ')} WHERE id = ?`, params);

  return findById(id);
}

export async function remove(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM incomes WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// Stats helpers
export async function getMonthlyTotal(userId: number, year: number, month: number): Promise<number> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM incomes
     WHERE user_id = ? AND YEAR(income_date) = ? AND MONTH(income_date) = ?`,
    [userId, year, month]
  );

  return Number(rows[0].total);
}

export async function getYearlyTotal(userId: number, year: number): Promise<number> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM incomes
     WHERE user_id = ? AND YEAR(income_date) = ?`,
    [userId, year]
  );

  return Number(rows[0].total);
}

export async function getMonthlyTrend(
  userId: number,
  months: number = 6
): Promise<{ month: string; year: number; total: number }[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      DATE_FORMAT(income_date, '%b') as month,
      YEAR(income_date) as year,
      MONTH(income_date) as monthNum,
      COALESCE(SUM(amount), 0) as total
    FROM incomes
    WHERE user_id = ?
      AND income_date >= DATE_SUB(CURDATE(), INTERVAL ${Number(months)} MONTH)
    GROUP BY YEAR(income_date), MONTH(income_date), DATE_FORMAT(income_date, '%b')
    ORDER BY year ASC, monthNum ASC`,
    [userId]
  );

  return rows as { month: string; year: number; total: number }[];
}

export async function getCategoryBreakdown(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<{ name: string; value: number; color: string }[]> {
  let query = `
    SELECT
      c.name as name,
      c.color as color,
      COALESCE(SUM(i.amount), 0) as value
    FROM income_categories c
    LEFT JOIN incomes i ON c.id = i.category_id AND i.user_id = ?
  `;

  const params: (number | Date)[] = [userId];

  if (startDate) {
    query += ' AND i.income_date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND i.income_date <= ?';
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

export async function getRecentIncomes(userId: number, limitCount: number = 5): Promise<IncomeWithCategory[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      i.id,
      i.user_id as userId,
      i.category_id as categoryId,
      i.amount,
      i.description,
      i.notes,
      i.income_date as incomeDate,
      i.is_recurring as isRecurring,
      i.recurring_rule_id as recurringRuleId,
      i.created_at as createdAt,
      i.updated_at as updatedAt,
      c.name as categoryName,
      c.icon as categoryIcon,
      c.color as categoryColor
    FROM incomes i
    LEFT JOIN income_categories c ON i.category_id = c.id
    WHERE i.user_id = ?
    ORDER BY i.income_date DESC, i.created_at DESC
    LIMIT ${Number(limitCount)}`,
    [userId]
  );

  return rows as IncomeWithCategory[];
}
