// Mock enrollment store shared by the enrollments list + create flow.
// Replace with the real enrollments API.

// 'draft'      → saved as draft, not yet active
// 'processing' → just created; employees are being mapped to the enrollment in
//                the background. Resolves to active (no status) once mapping done.
export type EnrollmentStatus = 'draft' | 'processing'

export interface Enrollment {
  id: string
  name: string
  status?: EnrollmentStatus
  coveragePeriod: string
  updatedAt: string
  updatedBy: string
}

// Reactive so a freshly-created enrollment shows up in the list immediately.
const ENROLLMENTS = reactive<Enrollment[]>([
  { id: 'e-2026', name: 'FY2026 Rawat Inap', status: 'draft', coveragePeriod: '1 Jan - 31 Dec 2026', updatedAt: '12 Jun 2026', updatedBy: 'Andina Pramudita' },
  { id: 'e-dental', name: 'Dental Add-on 2026', coveragePeriod: '1 Jan - 31 Dec 2026', updatedAt: '10 Feb 2026', updatedBy: 'Rizal Chandra' },
  { id: 'e-2025', name: '2025 Health Enrollment', coveragePeriod: '1 Jan - 31 Dec 2025', updatedAt: '3 Jan 2025', updatedBy: 'Andina Pramudita' },
])

// How long the mock "mapping employees" step runs before the badge clears.
const MAPPING_DURATION_MS = 6000

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatToday(): string {
  const d = new Date()
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

let seq = 0

export function useEnrollments() {
  const enrollments = () => ENROLLMENTS

  // Add a newly-created enrollment to the top of the list. A published enrollment
  // starts in 'processing' while employees are mapped, then flips to active. A
  // draft is saved as 'draft' and does NOT run employee mapping.
  const addEnrollment = (input: { name: string; coveragePeriod: string; updatedBy?: string; asDraft?: boolean }) => {
    const id = `e-new-${++seq}`
    const asDraft = input.asDraft === true
    ENROLLMENTS.unshift({
      id,
      name: input.name,
      status: asDraft ? 'draft' : 'processing',
      coveragePeriod: input.coveragePeriod,
      updatedAt: formatToday(),
      updatedBy: input.updatedBy ?? 'Rizal Candra',
    })
    if (!asDraft && import.meta.client) {
      setTimeout(() => {
        const e = ENROLLMENTS.find((x) => x.id === id)
        if (e) e.status = undefined
      }, MAPPING_DURATION_MS)
    }
    return id
  }

  const removeEnrollment = (id: string) => {
    const i = ENROLLMENTS.findIndex((e) => e.id === id)
    if (i !== -1) ENROLLMENTS.splice(i, 1)
  }

  return { enrollments, addEnrollment, removeEnrollment }
}
