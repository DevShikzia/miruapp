export function nowISO(): string {
  return new Date().toISOString()
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function daysUntil(day: number): number {
  const today = new Date()
  const target = new Date(today.getFullYear(), today.getMonth(), day)
  if (target < today) {
    target.setMonth(target.getMonth() + 1)
  }
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
