// Mock import-log store shared by the import-history list + detail pages.
// Replace with the real import-logs API.

export type ImportLogStatus = 'processing' | 'success' | 'failed'
export type ImportLogType = 'plan' | 'employee'

export interface ImportError {
  row: number
  column: string
  message: string
}

export interface ImportLog {
  id: string
  type: ImportLogType
  fileName: string
  importedBy: string
  importedAt: string
  status: ImportLogStatus
  totalRows: number
  successRows: number
  failedRows: number
  errors: ImportError[]
}

// Reactive so a freshly-submitted import shows up in the history immediately.
const LOGS = reactive<ImportLog[]>([
  {
    id: 'imp-20260612', type: 'plan',
    fileName: 'insurance-plans-2026.xlsx',
    importedBy: 'Andina Pramudita',
    importedAt: '12 Jun 2026, 09:24',
    status: 'success',
    totalRows: 25, successRows: 25, failedRows: 0,
    errors: [],
  },
  {
    id: 'imp-20260210', type: 'plan',
    fileName: 'plans-update-feb.csv',
    importedBy: 'Rizal Chandra',
    importedAt: '10 Feb 2026, 14:02',
    status: 'failed',
    totalRows: 18, successRows: 0, failedRows: 18,
    errors: [
      { row: 4, column: 'Premium', message: 'Premium must be a number' },
      { row: 9, column: 'Coverage period', message: 'Coverage period format is invalid. Use DD MMM YYYY' },
      { row: 12, column: 'Plan name', message: 'Plan name is required' },
    ],
  },
  {
    id: 'imp-20260103', type: 'plan',
    fileName: 'plans-q1.xlsx',
    importedBy: 'Andina Pramudita',
    importedAt: '3 Jan 2026, 08:10',
    status: 'failed',
    totalRows: 12, successRows: 0, failedRows: 12,
    errors: [
      { row: 1, column: 'Benefit type', message: 'Benefit type is not recognized' },
      { row: 1, column: 'Insurance provider', message: 'Insurance provider is required' },
      { row: 2, column: 'Premium', message: 'Premium must be a number' },
      { row: 2, column: 'Plan name', message: 'Plan name is required' },
      { row: 3, column: 'Coverage period', message: 'Coverage period format is invalid. Use DD MMM YYYY' },
    ],
  },
])

export const IMPORT_STATUS_META: Record<ImportLogStatus, { label: string; badge: string }> = {
  processing: { label: 'Processing', badge: 'information' },
  success: { label: 'Success', badge: 'completed' },
  failed: { label: 'Failed', badge: 'critical' },
}

export const IMPORT_TYPE_LABEL: Record<ImportLogType, string> = {
  plan: 'Insurance plan',
  employee: 'Employee',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatNow(): string {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`
}

let seq = 0

export function useInsuranceImportLogs() {
  const logs = () => LOGS
  const getLog = (id: string) => LOGS.find((l) => l.id === id)
  // Record a new import — lands at the top of the history as "Processing".
  const addLog = (input: { type: ImportLogType; fileName: string; importedBy?: string }) => {
    const id = `imp-new-${++seq}`
    LOGS.unshift({
      id,
      type: input.type,
      fileName: input.fileName,
      importedBy: input.importedBy ?? 'Rizal Candra',
      importedAt: formatNow(),
      status: 'processing',
      totalRows: 0, successRows: 0, failedRows: 0,
      errors: [],
    })
    return id
  }
  return { logs, getLog, addLog }
}
