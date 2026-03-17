import type { User } from '../types/user'

const isPlaceholder = (value: string): boolean => {
  return !value.trim() || value.trim().toLowerCase() === 'string'
}

const isLikelyUserTag = (value: string): boolean => {
  const trimmed = value.trim().toLowerCase()
  return /^[a-zа-яё]{1,4}$/i.test(trimmed)
}

const isLikelyPosition = (value: string): boolean => {
  const trimmed = value.trim().toLowerCase()

  if (!trimmed || trimmed === 'string') {
    return false
  }

  return trimmed.includes(' ') || trimmed.length > 4
}

const toTitleCase = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const normalizeDisplayValue = (value: string): string => {
  if (isPlaceholder(value)) {
    return 'не указано'
  }

  return value.trim()
}

export const normalizeUser = (user: User): User => {
  const rawUserTag = user.userTag ?? ''
  const rawPosition = user.position ?? ''

  let finalUserTag = rawUserTag
  let finalPosition = rawPosition

  if (
    isLikelyPosition(rawUserTag) &&
    (isPlaceholder(rawPosition) || isLikelyUserTag(rawPosition))
  ) {
    finalUserTag = rawPosition
    finalPosition = rawUserTag
  }

  finalUserTag = normalizeDisplayValue(finalUserTag)
  finalPosition = normalizeDisplayValue(finalPosition)

  if (finalPosition !== 'Не указано') {
    finalPosition = toTitleCase(finalPosition)
  }

  return {
    ...user,
    userTag: finalUserTag,
    position: finalPosition,
  }
}