import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import * as ExpenseModel from '../models/expense.model';
import * as CategoryModel from '../models/category.model';

interface ExportFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
}

interface ExpenseExportData {
  date: string;
  description: string;
  category: string;
  amount: string;
}

export async function exportToCSV(userId: number, filters: ExportFilters): Promise<string> {
  const expenses = await getExpensesForExport(userId, filters);

  if (expenses.length === 0) {
    return 'Date,Description,Category,Amount\nNo expenses found';
  }

  const fields = ['date', 'description', 'category', 'amount'];
  const opts = { fields };
  const parser = new Parser(opts);
  const csv = parser.parse(expenses);

  return csv;
}

export async function exportToPDF(userId: number, filters: ExportFilters): Promise<Buffer> {
  const expenses = await getExpensesForExport(userId, filters);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Expense Report', { align: 'center' });
    doc.moveDown();

    // Date range
    const dateRange = getDateRangeText(filters);
    doc.fontSize(12).font('Helvetica').text(dateRange, { align: 'center' });
    doc.moveDown(2);

    if (expenses.length === 0) {
      doc.fontSize(14).text('No expenses found for the selected period.', { align: 'center' });
    } else {
      // Calculate total
      const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.replace(/[^0-9.-]+/g, '')), 0);

      // Summary
      doc.fontSize(12).font('Helvetica-Bold').text('Summary');
      doc.font('Helvetica');
      doc.text(`Total Expenses: ${expenses.length}`);
      doc.text(`Total Amount: $${total.toFixed(2)}`);
      doc.moveDown(2);

      // Table header
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 130;
      const col3 = 280;
      const col4 = 380;

      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Date', col1, tableTop);
      doc.text('Description', col2, tableTop);
      doc.text('Category', col3, tableTop);
      doc.text('Amount', col4, tableTop);

      doc.moveTo(col1, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table rows
      doc.font('Helvetica').fontSize(9);
      let y = tableTop + 25;

      for (const expense of expenses) {
        // Check if we need a new page
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(expense.date, col1, y, { width: 70 });
        doc.text(expense.description.substring(0, 25), col2, y, { width: 140 });
        doc.text(expense.category.substring(0, 15), col3, y, { width: 90 });
        doc.text(expense.amount, col4, y, { width: 60 });

        y += 20;
      }

      // Footer with total
      doc.moveDown(2);
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text(`Total: $${total.toFixed(2)}`, { align: 'right' });
    }

    // Generated timestamp
    doc.moveDown(3);
    doc.fontSize(8).font('Helvetica').fillColor('gray');
    doc.text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();
  });
}

async function getExpensesForExport(userId: number, filters: ExportFilters): Promise<ExpenseExportData[]> {
  // Get all expenses (no pagination for export)
  const result = await ExpenseModel.findAllByUser({
    userId,
    page: 1,
    limit: 10000, // Large limit to get all
    sortBy: 'expenseDate',
    sortOrder: 'desc',
    startDate: filters.startDate ? new Date(filters.startDate) : undefined,
    endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    categoryId: filters.categoryId,
  });

  // Transform expenses for export (they already have category info from the join)
  return result.data.map((expense) => ({
    date: new Date(expense.expenseDate).toLocaleDateString('en-US'),
    description: expense.description || '',
    category: expense.categoryName,
    amount: `$${Number(expense.amount).toFixed(2)}`,
  }));
}

function getDateRangeText(filters: ExportFilters): string {
  if (filters.startDate && filters.endDate) {
    return `Period: ${filters.startDate} to ${filters.endDate}`;
  } else if (filters.startDate) {
    return `From: ${filters.startDate}`;
  } else if (filters.endDate) {
    return `Until: ${filters.endDate}`;
  }
  return 'All Time';
}
