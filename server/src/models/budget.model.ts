import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Budget {
  id: number;
  userId: number;
  categoryId: number | null;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  alertAt80: boolean;
  alertAt100: boolean;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetWithCategory extends Budget {
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export interface BudgetWithStatus extends BudgetWithCategory {
  spent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
  isWarning: boolean;
}

export interface CreateBudgetData {
  userId: number;
  categoryId?: number | null;
  amount: number;
  period?: 'weekly' | 'monthly' | 'yearly';
  alertAt80?: boolean;
  alertAt100?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface UpdateBudgetData {
  categoryId?: number | null;
  amount?: number;
  period?: 'weekly' | 'monthly' | 'yearly';
  alertAt80?: boolean;
  alertAt100?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
}

export async function findAllByUser(userId: number): Promise<BudgetWithCategory[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      b.id,
      b.user_id as userId,
      b.category_id as categoryId,
      b.amount,
      b.period,
      b.alert_at_80 as alertAt80,
      b.alert_at_100 as alertAt100,
      b.start_date as startDate,
      b.end_date as endDate,
      b.is_active as isActive,
      b.created_at as createdAt,
      b.updated_at as updatedAt,
      c.name as categoryName,
      c.icon as categoryIcon,
      c.color as categoryColor
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.user_id = ? AND b.is_active = TRUE
    ORDER BY b.category_id IS NULL DESC, c.name ASC`,
    [userId]
  );

  return rows as BudgetWithCategory[];
}

export async function findById(id: number): Promise<BudgetWithCategory | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      b.id,
      b.user_id as userId,
      b.category_id as categoryId,
      b.amount,
      b.period,
      b.alert_at_80 as alertAt80,
      b.alert_at_100 as alertAt100,
      b.start_date as startDate,
      b.end_date as endDate,
      b.is_active as isActive,
      b.created_at as createdAt,
      b.updated_at as updatedAt,
      c.name as categoryName,
      c.icon as categoryIcon,
      c.color as categoryColor
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?`,
    [id]
  );

  return rows.length > 0 ? (rows[0] as BudgetWithCategory) : null;
}

export async function findByUserAndCategory(
  userId: number,
  categoryId: number | null,
  period: string
): Promise<BudgetWithCategory | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      b.id,
      b.user_id as userId,
      b.category_id as categoryId,
      b.amount,
      b.period,
      b.alert_at_80 as alertAt80,
      b.alert_at_100 as alertAt100,
      b.start_date as startDate,
      b.end_date as endDate,
      b.is_active as isActive,
      b.created_at as createdAt,
      b.updated_at as updatedAt,
      c.name as categoryName,
      c.icon as categoryIcon,
      c.color as categoryColor
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.user_id = ? AND ${categoryId === null ? 'b.category_id IS NULL' : 'b.category_id = ?'} AND b.period = ?`,
    categoryId === null ? [userId, period] : [userId, categoryId, period]
  );

  return rows.length > 0 ? (rows[0] as BudgetWithCategory) : null;
}

export async function create(data: CreateBudgetData): Promise<BudgetWithCategory> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO budgets (user_id, category_id, amount, period, alert_at_80, alert_at_100, start_date, end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.userId,
      data.categoryId ?? null,
      data.amount,
      data.period ?? 'monthly',
      data.alertAt80 ?? true,
      data.alertAt100 ?? true,
      data.startDate ?? null,
      data.endDate ?? null,
    ]
  );

  const budget = await findById(result.insertId);
  return budget!;
}

export async function update(id: number, data: UpdateBudgetData): Promise<BudgetWithCategory | null> {
  const updates: string[] = [];
  const params: (string | number | boolean | Date | null)[] = [];

  if (data.categoryId !== undefined) {
    updates.push('category_id = ?');
    params.push(data.categoryId);
  }

  if (data.amount !== undefined) {
    updates.push('amount = ?');
    params.push(data.amount);
  }

  if (data.period !== undefined) {
    updates.push('period = ?');
    params.push(data.period);
  }

  if (data.alertAt80 !== undefined) {
    updates.push('alert_at_80 = ?');
    params.push(data.alertAt80);
  }

  if (data.alertAt100 !== undefined) {
    updates.push('alert_at_100 = ?');
    params.push(data.alertAt100);
  }

  if (data.startDate !== undefined) {
    updates.push('start_date = ?');
    params.push(data.startDate);
  }

  if (data.endDate !== undefined) {
    updates.push('end_date = ?');
    params.push(data.endDate);
  }

  if (data.isActive !== undefined) {
    updates.push('is_active = ?');
    params.push(data.isActive);
  }

  if (updates.length === 0) {
    return findById(id);
  }

  updates.push('updated_at = NOW()');
  params.push(id);

  await pool.execute(`UPDATE budgets SET ${updates.join(', ')} WHERE id = ?`, params);

  return findById(id);
}

export async function remove(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM budgets WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// Get spent amount for a budget based on its period
export async function getSpentAmount(
  userId: number,
  categoryId: number | null,
  period: 'weekly' | 'monthly' | 'yearly'
): Promise<number> {
  let dateCondition = '';

  switch (period) {
    case 'weekly':
      dateCondition = 'AND expense_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)';
      break;
    case 'monthly':
      dateCondition = 'AND YEAR(expense_date) = YEAR(CURDATE()) AND MONTH(expense_date) = MONTH(CURDATE())';
      break;
    case 'yearly':
      dateCondition = 'AND YEAR(expense_date) = YEAR(CURDATE())';
      break;
  }

  const categoryCondition = categoryId === null ? '' : 'AND category_id = ?';
  const params = categoryId === null ? [userId] : [userId, categoryId];

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(amount), 0) as spent
     FROM expenses
     WHERE user_id = ? ${categoryCondition} ${dateCondition}`,
    params
  );

  return Number(rows[0].spent);
}

// Get all budgets with their current status
export async function getBudgetsWithStatus(userId: number): Promise<BudgetWithStatus[]> {
  const budgets = await findAllByUser(userId);
  const budgetsWithStatus: BudgetWithStatus[] = [];

  for (const budget of budgets) {
    const spent = await getSpentAmount(userId, budget.categoryId, budget.period);
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const remaining = budget.amount - spent;
    const isOverBudget = percentage >= 100;
    const isWarning = percentage >= 80 && percentage < 100;

    budgetsWithStatus.push({
      ...budget,
      spent,
      percentage,
      remaining,
      isOverBudget,
      isWarning,
    });
  }

  return budgetsWithStatus;
}

// Get alerts for budgets that are over threshold
export async function getBudgetAlerts(userId: number): Promise<BudgetWithStatus[]> {
  const budgets = await getBudgetsWithStatus(userId);

  return budgets.filter((budget) => {
    if (budget.isOverBudget && budget.alertAt100) return true;
    if (budget.isWarning && budget.alertAt80) return true;
    return false;
  });
}
