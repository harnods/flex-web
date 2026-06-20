// Mock import-log store shared by the import-history list + detail pages.
// Replace with the real import-logs API.

export type ImportLogStatus = 'processing' | 'success' | 'partial' | 'failed'

export interface ImportError {
  row: number
  column: string
  message: string
}

export interface ImportLog {
  id: string
  fileName: string
  importedBy: string
  importedAt: string
  status: ImportLogStatus
  totalRows: number
  successRows: number
  failedRows: number
  errors: ImportError[]
}

const LOGS: ImportLog[] = [
  {
    id: 'imp-20260620',
    fileName: 'insurance-plans-2026-q2.csv',
    importedBy: 'Rizal Chandra',
    importedAt: '20 Jun 2026, 11:30',
    status: 'processing',
    totalRows: 0, successRows: 0, failedRows: 0,
    errors: [],
  },
  {
    id: 'imp-20260612',
    fileName: 'insurance-plans-2026.xlsx',
    importedBy: 'Andina Pramudita',
    importedAt: '12 Jun 2026, 09:24',
    status: 'success',
    totalRows: 25, successRows: 25, failedRows: 0,
    errors: [],
  },
  {
    id: 'imp-20260210',
    fileName: 'plans-update-feb.csv',
    importedBy: 'Rizal Chandra',
    importedAt: '10 Feb 2026, 14:02',
    status: 'partial',
    totalRows: 18, successRows: 15, failedRows: 3,
    errors: [
      { row: 4, column: 'Premium', message: 'Premium must be a number' },
      { row: 9, column: 'Coverage period', message: 'Coverage period format is invalid. Use DD MMM YYYY' },
      { row: 12, column: 'Plan name', message: 'Plan name is required' },
    ],
  },
  {
    id: 'imp-20260103',
    fileName: 'plans-q1.xlsx',
    importedBy: 'Andina Pramudita',
    importedAt: '3 Jan 2026, 08:10',
    status: 'failed',
    totalRows: 12, successRows: 0, failedRows: 12,
    errors: [
      { row: 1, column: 'Benefit type', message: 'Benefit type is not recognized' },
      { row: 2, column: 'Insurance provider', message: 'Insurance provider is required' },
      { row: 3, column: 'Premium', message: 'Premium must be a number' },
      { row: 4, column: 'Plan name', message: 'Plan name is required' },
      { row: 5, column: 'Coverage period', message: 'Coverage period format is invalid. Use DD MMM YYYY' },
    ],
  },
]

export const IMPORT_STATUS_META: Record<ImportLogStatus, { label: string; badge: string }> = {
  processing: { label: 'Processing', badge: 'information' },
  success: { label: 'Success', badge: 'completed' },
  partial: { label: 'Partially failed', badge: 'warning' },
  failed: { label: 'Failed', badge: 'critical' },
}

export function useInsuranceImportLogs() {
  const logs = () => LOGS
  const getLog = (id: string) => LOGS.find((l) => l.id === id)
  return { logs, getLog }
}
