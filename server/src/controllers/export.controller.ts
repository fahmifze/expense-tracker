import { Request, Response, NextFunction } from 'express';
import * as exportService from '../services/export.service';

export async function exportCSV(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate, categoryId } = req.query;

    const csv = await exportService.exportToCSV(userId, {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
    });

    const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

export async function exportPDF(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate, categoryId } = req.query;

    const pdfBuffer = await exportService.exportToPDF(userId, {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
    });

    const filename = `expenses_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}
