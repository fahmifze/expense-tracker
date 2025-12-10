import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface RecurringRule {
  id: number;
  userId: number;
  type: 'expense' | 'income';
  categoryId: number;
  amount: number;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  intervalValue: number;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  monthOfYear: number | null;
  startDate: Date;
  endDate: Date | null;
  nextOccurrence: Date;
  lastProcessed: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringRuleWithCategory extends RecurringRule {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
}

export interface CreateRecurringRuleData {
  userId: number;
  type: 'expense' | 'income';
  categoryId: number;
  amount: number;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  intervalValue?: number;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  monthOfYear?: number | null;
  startDate: Date;
  endDate?: Date | null;
}

export interface UpdateRecurringRuleData {
  categoryId?: number;
  amount?: number;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  intervalValue?: number;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  monthOfYear?: number | null;
  startDate?: Date;
  endDate?: Date | null;
  nextOccurrence?: Date;
  lastProcessed?: Date | null;
  isActive?: boolean;
}

function calculateNextOccurrence(
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  startDate: Date,
  intervalValue: number = 1,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null,
  monthOfYear?: number | null
): Date {
  const now = new Date();
  let next = new Date(startDate);

  // If start date is in the future, use it
  if (next > now) {
    return next;
  }

  switch (frequency) {
    case 'daily':
      while (next <= now) {
        next.setDate(next.getDate() + intervalValue);
      }
      break;

    case 'weekly':
      // If dayOfWeek is specified, adjust to that day
      if (dayOfWeek !== null && dayOfWeek !== undefined) {
        const currentDay = next.getDay();
        const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntil);
      }
      while (next <= now) {
        next.setDate(next.getDate() + 7 * intervalValue);
      }
      break;

    case 'monthly':
      if (dayOfMonth !== null && dayOfMonth !== undefined) {
        next.setDate(dayOfMonth);
      }
      while (next <= now) {
        next.setMonth(next.getMonth() + intervalValue);
      }
      break;

    case 'yearly':
      if (monthOfYear !== null && monthOfYear !== undefined) {
        next.setMonth(monthOfYear - 1);
      }
      if (dayOfMonth !== null && dayOfMonth !== undefined) {
        next.setDate(dayOfMonth);
      }
      while (next <= now) {
        next.setFullYear(next.getFullYear() + intervalValue);
      }
      break;
  }

  return next;
}

export async function findAllByUser(userId: number, type?: 'expense' | 'income'): Promise<RecurringRuleWithCategory[]> {
  const typeCondition = type ? 'AND r.type = ?' : '';
  const params = type ? [userId, type] : [userId];

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      r.id,
      r.user_id as userId,
      r.type,
      r.category_id as categoryId,
      r.amount,
      r.description,
      r.frequency,
      r.interval_value as intervalValue,
      r.day_of_week as dayOfWeek,
      r.day_of_month as dayOfMonth,
      r.month_of_year as monthOfYear,
      r.start_date as startDate,
      r.end_date as endDate,
      r.next_occurrence as nextOccurrence,
      r.last_processed as lastProcessed,
      r.is_active as isActive,
      r.created_at as createdAt,
      r.updated_at as updatedAt,
      COALESCE(c.name, ic.name) as categoryName,
      COALESCE(c.icon, ic.icon) as categoryIcon,
      COALESCE(c.color, ic.color) as categoryColor
    FROM recurring_rules r
    LEFT JOIN categories c ON r.type = 'expense' AND r.category_id = c.id
    LEFT JOIN income_categories ic ON r.type = 'income' AND r.category_id = ic.id
    WHERE r.user_id = ? ${typeCondition}
    ORDER BY r.next_occurrence ASC`,
    params
  );

  return rows as RecurringRuleWithCategory[];
}

export async function findById(id: number): Promise<RecurringRuleWithCategory | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      r.id,
      r.user_id as userId,
      r.type,
      r.category_id as categoryId,
      r.amount,
      r.description,
      r.frequency,
      r.interval_value as intervalValue,
      r.day_of_week as dayOfWeek,
      r.day_of_month as dayOfMonth,
      r.month_of_year as monthOfYear,
      r.start_date as startDate,
      r.end_date as endDate,
      r.next_occurrence as nextOccurrence,
      r.last_processed as lastProcessed,
      r.is_active as isActive,
      r.created_at as createdAt,
      r.updated_at as updatedAt,
      COALESCE(c.name, ic.name) as categoryName,
      COALESCE(c.icon, ic.icon) as categoryIcon,
      COALESCE(c.color, ic.color) as categoryColor
    FROM recurring_rules r
    LEFT JOIN categories c ON r.type = 'expense' AND r.category_id = c.id
    LEFT JOIN income_categories ic ON r.type = 'income' AND r.category_id = ic.id
    WHERE r.id = ?`,
    [id]
  );

  return rows.length > 0 ? (rows[0] as RecurringRuleWithCategory) : null;
}

export async function create(data: CreateRecurringRuleData): Promise<RecurringRuleWithCategory> {
  const nextOccurrence = calculateNextOccurrence(
    data.frequency,
    data.startDate,
    data.intervalValue,
    data.dayOfWeek,
    data.dayOfMonth,
    data.monthOfYear
  );

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO recurring_rules (
      user_id, type, category_id, amount, description, frequency,
      interval_value, day_of_week, day_of_month, month_of_year,
      start_date, end_date, next_occurrence, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [
      data.userId,
      data.type,
      data.categoryId,
      data.amount,
      data.description ?? null,
      data.frequency,
      data.intervalValue ?? 1,
      data.dayOfWeek ?? null,
      data.dayOfMonth ?? null,
      data.monthOfYear ?? null,
      data.startDate,
      data.endDate ?? null,
      nextOccurrence,
    ]
  );

  const rule = await findById(result.insertId);
  return rule!;
}

export async function update(id: number, data: UpdateRecurringRuleData): Promise<RecurringRuleWithCategory | null> {
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

  if (data.description !== undefined) {
    updates.push('description = ?');
    params.push(data.description);
  }

  if (data.frequency !== undefined) {
    updates.push('frequency = ?');
    params.push(data.frequency);
  }

  if (data.intervalValue !== undefined) {
    updates.push('interval_value = ?');
    params.push(data.intervalValue);
  }

  if (data.dayOfWeek !== undefined) {
    updates.push('day_of_week = ?');
    params.push(data.dayOfWeek);
  }

  if (data.dayOfMonth !== undefined) {
    updates.push('day_of_month = ?');
    params.push(data.dayOfMonth);
  }

  if (data.monthOfYear !== undefined) {
    updates.push('month_of_year = ?');
    params.push(data.monthOfYear);
  }

  if (data.startDate !== undefined) {
    updates.push('start_date = ?');
    params.push(data.startDate);
  }

  if (data.endDate !== undefined) {
    updates.push('end_date = ?');
    params.push(data.endDate);
  }

  if (data.nextOccurrence !== undefined) {
    updates.push('next_occurrence = ?');
    params.push(data.nextOccurrence);
  }

  if (data.lastProcessed !== undefined) {
    updates.push('last_processed = ?');
    params.push(data.lastProcessed);
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

  await pool.execute(`UPDATE recurring_rules SET ${updates.join(', ')} WHERE id = ?`, params);

  return findById(id);
}

export async function remove(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM recurring_rules WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// Get rules that need to be processed (nextOccurrence <= today and active)
export async function getDueRules(): Promise<RecurringRuleWithCategory[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      r.id,
      r.user_id as userId,
      r.type,
      r.category_id as categoryId,
      r.amount,
      r.description,
      r.frequency,
      r.interval_value as intervalValue,
      r.day_of_week as dayOfWeek,
      r.day_of_month as dayOfMonth,
      r.month_of_year as monthOfYear,
      r.start_date as startDate,
      r.end_date as endDate,
      r.next_occurrence as nextOccurrence,
      r.last_processed as lastProcessed,
      r.is_active as isActive,
      r.created_at as createdAt,
      r.updated_at as updatedAt,
      COALESCE(c.name, ic.name) as categoryName,
      COALESCE(c.icon, ic.icon) as categoryIcon,
      COALESCE(c.color, ic.color) as categoryColor
    FROM recurring_rules r
    LEFT JOIN categories c ON r.type = 'expense' AND r.category_id = c.id
    LEFT JOIN income_categories ic ON r.type = 'income' AND r.category_id = ic.id
    WHERE r.is_active = TRUE
      AND r.next_occurrence <= CURDATE()
      AND (r.end_date IS NULL OR r.end_date >= CURDATE())
    ORDER BY r.next_occurrence ASC`
  );

  return rows as RecurringRuleWithCategory[];
}

// Mark rule as processed and calculate next occurrence
export async function markProcessed(id: number): Promise<RecurringRuleWithCategory | null> {
  const rule = await findById(id);
  if (!rule) return null;

  const nextOccurrence = calculateNextOccurrence(
    rule.frequency,
    rule.nextOccurrence,
    rule.intervalValue,
    rule.dayOfWeek,
    rule.dayOfMonth,
    rule.monthOfYear
  );

  // Check if next occurrence is beyond end date
  let isActive = rule.isActive;
  if (rule.endDate && nextOccurrence > new Date(rule.endDate)) {
    isActive = false;
  }

  await pool.execute(
    `UPDATE recurring_rules
     SET next_occurrence = ?, last_processed = CURDATE(), is_active = ?, updated_at = NOW()
     WHERE id = ?`,
    [nextOccurrence, isActive, id]
  );

  return findById(id);
}
