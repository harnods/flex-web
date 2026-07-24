// Mock package store shared by the Packages list + create flow.
// Mirrors useEnrollments — replace with the real packages API.

export interface Package {
  id: string
  name: string
  cyclePeriod: string
  effectivePeriod: string
  overallBalance: number
  reimbursement: boolean
  // Monthly-only. topUpDay = day of month the balance tops up; carryOver = unused
  // balance rolls over instead of resetting. Undefined for custom-cycle packages.
  topUpDay?: number | 'last'
  carryOver?: boolean
  updatedAt: string
  updatedBy: string
}

// Reactive so a freshly-created package shows up in the list immediately.
const PACKAGES = reactive<Package[]>([
  { id: 'p-fulltime', name: 'Full-time benefit', cyclePeriod: 'Monthly', effectivePeriod: '1 Jan 2026 - 31 Dec 2026', overallBalance: 1500000, reimbursement: true, updatedAt: '14 Jun 2026', updatedBy: 'Andina Pramudita' },
  { id: 'p-intern', name: 'Intern allowance', cyclePeriod: 'Monthly', effectivePeriod: '1 Jan 2026 - 30 Jun 2026', overallBalance: 500000, reimbursement: false, updatedAt: '8 Mar 2026', updatedBy: 'Rizal Chandra' },
  { id: 'p-remote', name: 'Remote worker package', cyclePeriod: 'Custom', effectivePeriod: '1 Feb 2026 - 31 Dec 2026', overallBalance: 1000000, reimbursement: true, updatedAt: '2 Feb 2026', updatedBy: 'Andina Pramudita' },
])

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatToday(): string {
  const d = new Date()
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

let seq = 0

export function usePackages() {
  const packages = () => PACKAGES

  const addPackage = (input: {
    name: string
    cyclePeriod: string
    effectivePeriod: string
    overallBalance: number
    reimbursement: boolean
    topUpDay?: number | 'last'
    carryOver?: boolean
    updatedBy?: string
  }) => {
    const id = `p-new-${++seq}`
    PACKAGES.unshift({
      id,
      name: input.name,
      cyclePeriod: input.cyclePeriod,
      effectivePeriod: input.effectivePeriod,
      overallBalance: input.overallBalance,
      reimbursement: input.reimbursement,
      topUpDay: input.topUpDay,
      carryOver: input.carryOver,
      updatedAt: formatToday(),
      updatedBy: input.updatedBy ?? 'Rizal Chandra',
    })
    return id
  }

  const removePackage = (id: string) => {
    const i = PACKAGES.findIndex((p) => p.id === id)
    if (i !== -1) PACKAGES.splice(i, 1)
  }

  return { packages, addPackage, removePackage }
}
