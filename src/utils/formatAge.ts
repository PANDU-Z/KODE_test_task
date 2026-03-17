export const formatAge = (age: number) => {
  const mod10 = age % 10
  const mod100 = age % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `${age} год`
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${age} года`
  }

  return `${age} лет`
}