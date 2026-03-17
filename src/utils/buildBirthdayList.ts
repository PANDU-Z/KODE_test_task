import type { User } from '../types/user'

export type BirthdayListItem =
  | { type: 'user'; user: User; birthdayLabel: string }
  | { type: 'divider'; year: number }

const MONTHS = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
]

export const getNextBirthdayDate = (birthday: string, now: Date) => {
  const birthDate = new Date(birthday)

  const currentYear = now.getFullYear()

  const nextBirthday = new Date(
    currentYear,
    birthDate.getMonth(),
    birthDate.getDate(),
  )

  nextBirthday.setHours(0, 0, 0, 0)

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  if (nextBirthday < today) {
    nextBirthday.setFullYear(currentYear + 1)
  }

  return nextBirthday
}

const formatBirthdayLabel = (date: Date) => {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export const buildBirthdayList = (users: User[]): BirthdayListItem[] => {
  const now = new Date()

  const sortedUsers = [...users].sort((a, b) => {
    const nextA = getNextBirthdayDate(a.birthday, now).getTime()
    const nextB = getNextBirthdayDate(b.birthday, now).getTime()

    return nextA - nextB
  })

  const result: BirthdayListItem[] = []
  let currentYear: number | null = null

  sortedUsers.forEach((user, index) => {
    const nextBirthday = getNextBirthdayDate(user.birthday, now)
    const year = nextBirthday.getFullYear()

    if (index !== 0 && currentYear !== year) {
      result.push({ type: 'divider', year })
    }

    result.push({
      type: 'user',
      user,
      birthdayLabel: formatBirthdayLabel(nextBirthday),
    })

    currentYear = year
  })

  return result
}