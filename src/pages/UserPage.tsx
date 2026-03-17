import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { User } from '../types/user'
import { getUsers } from '../api/usersApi'
import { normalizeUser } from '../utils/normalizeUser'
import BackIcon from '../assets/icons/back.svg?react'
import StarIcon from '../assets/icons/star.svg?react'
import PhoneIcon from '../assets/icons/phone.svg?react'
import { formatAge } from '../utils/formatAge'
import { formatPhone, getTelHref } from '../utils/formatPhone'
import Avatar from '../components/Avatar'
import StatusBanner from '../components/StatusBanner'
import CallActionSheet from '../components/CallActionSheet'

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const formatBirthday = (birthday: string) => {
  const [year, month, day] = birthday.split('-').map(Number)
  return `${day} ${MONTHS[month - 1]} ${year}`
}

const calculateAge = (birthday: string) => {
  const [year, month, day] = birthday.split('-').map(Number)
  const today = new Date()

  let age = today.getFullYear() - year
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()

  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age -= 1
  }

  return age
}

function UserPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [hasInitialError, setHasInitialError] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasRefreshError, setHasRefreshError] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [isCallSheetOpen, setIsCallSheetOpen] = useState(false)

  const isIos =
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  const fetchUsers = async (showRefreshState = false) => {
    if (showRefreshState && users.length > 0) {
      setIsRefreshing(true)
    }

    setHasInitialError(false)
    setHasRefreshError(false)

    try {
      const data = await getUsers()
      setUsers(data.map(normalizeUser))
      setIsOffline(false)
    } catch (err) {
      console.error(err)

      if (users.length === 0) {
        setHasInitialError(true)
      } else {
        setHasRefreshError(true)
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      fetchUsers(true)
    }

    const handleOffline = () => {
      setIsOffline(true)

      if (users.length > 0) {
        setHasRefreshError(true)
      } else {
        setHasInitialError(true)
        setLoading(false)
      }

      setIsRefreshing(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users.length])

  const user = useMemo(() => {
    return users.find((item) => item.id === id)
  }, [users, id])

  if (loading && users.length === 0) {
    return <div className="status">Загрузка...</div>
  }

  if (hasInitialError && users.length === 0) {
    return <div className="status">Ошибка загрузки данных</div>
  }

  if (!user) {
    return <div className="status">Пользователь не найден</div>
  }

  const fullName = `${user.firstName} ${user.lastName}`
  const age = calculateAge(user.birthday)
  const formattedPhone = formatPhone(user.phone)

  const handlePhoneClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isIos) {
      return
    }

    event.preventDefault()
    setIsCallSheetOpen(true)
  }

  return (
    <>
      {(isRefreshing || hasRefreshError || isOffline) && (
        <StatusBanner type={isRefreshing ? 'loading' : 'error'} />
      )}

      <div className={`user-page ${isIos ? 'user-page--ios' : ''}`}>
        <div className="user-page__header">
          <button
            className="user-page__back-button"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <BackIcon className="user-page__back-icon" />
          </button>

          <div className="user-page__profile">
            <Avatar
              src={user.avatarUrl}
              firstName={user.firstName}
              lastName={user.lastName}
              alt={fullName}
              wrapperClassName="user-page__avatar-wrapper"
              className="user-page__avatar"
              fallbackClassName="user-page__avatar-fallback"
            />

            <div className="user-page__name-row">
              <h1 className="user-page__name">{fullName}</h1>
              <span className="user-page__tag">{user.userTag}</span>
            </div>

            <div className="user-page__position">{user.position}</div>
          </div>
        </div>

        <div className="user-page__info">
          <div className="user-page__info-row">
            <div className="user-page__info-left">
              <StarIcon className="user-page__info-icon" />
              <span className="user-page__info-text">
                {formatBirthday(user.birthday)}
              </span>
            </div>

            <span className="user-page__info-right">{formatAge(age)}</span>
          </div>

          <a
            className="user-page__info-row user-page__info-link"
            href={getTelHref(user.phone)}
            onClick={handlePhoneClick}
          >
            <div className="user-page__info-left">
              <PhoneIcon className="user-page__info-icon" />
              <span className="user-page__info-text">{formattedPhone}</span>
            </div>
          </a>
        </div>
      </div>

      {isIos ? (
        <CallActionSheet
          isOpen={isCallSheetOpen}
          phone={formattedPhone}
          onClose={() => setIsCallSheetOpen(false)}
          onCall={() => {
            setIsCallSheetOpen(false)
            window.location.href = getTelHref(user.phone)
          }}
        />
      ) : null}
    </>
  )
}

export default UserPage