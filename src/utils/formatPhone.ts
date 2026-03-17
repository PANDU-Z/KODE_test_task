export const normalizePhone = (phone: string) => {
  return phone.replace(/\D/g, '')
}

export const formatPhone = (phone: string) => {
  const digits = normalizePhone(phone)

  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    const normalized = `7${digits.slice(1)}`
    return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)} ${normalized.slice(7, 9)} ${normalized.slice(9, 11)}`
  }

  if (digits.length === 10) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`
  }

  return phone
}

export const getTelHref = (phone: string) => {
  const digits = normalizePhone(phone)

  if (digits.length === 11 && digits.startsWith('8')) {
    return `tel:+7${digits.slice(1)}`
  }

  if (digits.length === 11 && digits.startsWith('7')) {
    return `tel:+${digits}`
  }

  if (digits.length === 10) {
    return `tel:+7${digits}`
  }

  return `tel:${phone}`
}