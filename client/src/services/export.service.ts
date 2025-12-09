import api from './api';

interface ExportFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
}

function buildQueryString(filters: ExportFilters): string {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export async function exportCSV(filters: ExportFilters = {}): Promise<void> {
  const queryString = buildQueryString(filters);
  const response = await api.get(`/export/csv${queryString}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function exportPDF(filters: ExportFilters = {}): Promise<void> {
  const queryString = buildQueryString(filters);
  const response = await api.get(`/export/pdf${queryString}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
