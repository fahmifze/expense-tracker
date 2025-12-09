import { Router } from 'express';
import * as exportController from '../controllers/export.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All export routes require authentication
router.use(authenticate);

// GET /api/export/csv - Export expenses as CSV
router.get('/csv', exportController.exportCSV);

// GET /api/export/pdf - Export expenses as PDF
router.get('/pdf', exportController.exportPDF);

export default router;
