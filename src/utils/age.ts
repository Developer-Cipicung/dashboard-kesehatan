export function calculateAgeInMonths(birthDate?: string | Date | null, referenceDate: string | Date = new Date()) {
  if (!birthDate) return 0
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return 0
  const reference = new Date(referenceDate)
  let months = (reference.getFullYear() - birth.getFullYear()) * 12
  months += reference.getMonth() - birth.getMonth()

  if (reference.getDate() < birth.getDate()) {
    months--
  }

  return Math.max(0, months)
}

export function calculateAgeInWeeks(birthDate?: string | Date | null, referenceDate: string | Date = new Date()) {
  if (!birthDate) return 0
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return 0
  const reference = new Date(referenceDate)
  
  birth.setHours(0, 0, 0, 0)
  reference.setHours(0, 0, 0, 0)

  const diffTime = reference.getTime() - birth.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, Math.floor(diffDays / 7))
}

export function isBadutaByBirthDate(birthDate: string | Date, referenceDate: string | Date = new Date()) {
  return calculateAgeInMonths(birthDate, referenceDate) < 24
}

export function isBalitaByBirthDate(birthDate: string | Date, referenceDate: string | Date = new Date()) {
  const ageMonths = calculateAgeInMonths(birthDate, referenceDate)
  return ageMonths >= 24 && ageMonths < 60
}
