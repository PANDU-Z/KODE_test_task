import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import UserCard from '../components/UserCard'
import type { User } from '../types/user'
import { normalizeUser } from '../utils/normalizeUser'
import SearchIcon from '../assets/icons/search.svg?react'
import FilterIcon from '../assets/icons/filter.svg?react'
import CloseIcon from '../assets/icons/close.svg?react'
import SortModal from '../components/SortModal'
import { buildBirthdayList } from '../utils/buildBirthdayList'
import EmptyState from '../components/EmptyState'
import StatusBanner from '../components/StatusBanner'
import CriticalErrorState from '../components/CriticalErrorState'
import { getUsers } from '../api/usersApi'

const departmentTabs = [
  { label: 'Все', value: 'all' },
  { label: 'Designers', value: 'design' },
  { label: 'Analysts', value: 'analytics' },
  { label: 'Managers', value: 'management' },
  { label: 'QA', value: 'qa' },
  { label: 'Back Office', value: 'back_office' },
  { label: 'Frontend', value: 'frontend' },
  { label: 'HR', value: 'hr' },
  { label: 'PR', value: 'pr' },
  { label: 'Backend', value: 'backend' },
  { label: 'Support', value: 'support' },
  { label: 'iOS', value: 'ios' },
  { label: 'Android', value: 'android' },
]

type SortType = 'alphabet' | 'birthday'

function HomePage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [activeDepartment, setActiveDepartment] = useState('all')

  const [initialLoading, setInitialLoading] = useState(true)
  const [hasInitialError, setHasInitialError] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasRefreshError, setHasRefreshError] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const [sortType, setSortType] = useState<SortType>('alphabet')
  const [isSortModalOpen, setIsSortModalOpen] = useState(false)

  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [showPullSpinner, setShowPullSpinner] = useState(false)

  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const touchStartYRef = useRef<number | null>(null)
  const isPullToRefreshActiveRef = useRef(false)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const searchRowRef = useRef<HTMLDivElement | null>(null)

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  const isIos =
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  const isAndroid = /Android/i.test(navigator.userAgent)

  const fetchUsers = async (showRefreshState = false) => {
    if (showRefreshState && users.length > 0) {
      setIsRefreshing(true)
    }

    setHasInitialError(false)
    setHasRefreshError(false)

    try {
      const data = await getUsers()
      const normalized = data.map(normalizeUser)

      setUsers(normalized)
      setIsOffline(false)
    } catch (err) {
      console.error(err)

      if (users.length === 0) {
        setHasInitialError(true)
      } else {
        setHasRefreshError(true)
      }
    } finally {
      setInitialLoading(false)
      setIsRefreshing(false)
      setShowPullSpinner(false)
      setPullDistance(0)
      setIsPulling(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true)
      setIsRefreshing(false)
      setShowPullSpinner(false)
    }

    const handleOnline = () => {
      setIsOffline(false)
      fetchUsers(true)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users.length])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!searchRowRef.current) return
      const target = event.target as Node

      if (!searchRowRef.current.contains(target)) {
        searchInputRef.current?.blur()
        setIsSearchFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const activeButton = tabRefs.current[activeDepartment]
      if (!activeButton) return

      const horizontalPadding = 8
      const left = activeButton.offsetLeft - horizontalPadding
      const width = activeButton.offsetWidth + horizontalPadding * 2

      setIndicatorStyle({ left, width })
    }

    updateIndicator()
    const rafId = window.requestAnimationFrame(updateIndicator)
    window.addEventListener('resize', updateIndicator)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [activeDepartment, initialLoading])

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (window.scrollY > 0 || isRefreshing) return

    touchStartYRef.current = event.touches[0].clientY
    isPullToRefreshActiveRef.current = true
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isPullToRefreshActiveRef.current || touchStartYRef.current === null) {
      return
    }

    const currentY = event.touches[0].clientY
    const delta = currentY - touchStartYRef.current

    if (delta <= 0) return

    const limitedPull = Math.min(delta * 0.45, 90)
    setIsPulling(true)
    setPullDistance(limitedPull)
  }

  const handleTouchEnd = async () => {
    if (!isPullToRefreshActiveRef.current) return

    isPullToRefreshActiveRef.current = false
    touchStartYRef.current = null

    if (pullDistance >= 52) {
      setShowPullSpinner(true)
      await fetchUsers(true)
    } else {
      setPullDistance(0)
      setIsPulling(false)
    }
  }

  const normalizePhone = (value: string) => value.replace(/\D/g, '')

  const filteredUsers = useMemo(() => {
    const result = [...users]

    const filteredByDepartment =
      activeDepartment !== 'all'
        ? result.filter((user) => user.department === activeDepartment)
        : result

    let filtered = filteredByDepartment

    if (search.trim()) {
      const query = search.toLowerCase()
      const normalizedQueryPhone = normalizePhone(search)

      filtered = filtered.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
        const userTag = user.userTag.toLowerCase()
        const normalizedUserPhone = normalizePhone(user.phone ?? '')

        const matchesText =
          fullName.includes(query) || userTag.includes(query)

        const matchesPhone =
          normalizedQueryPhone.length > 0 &&
          normalizedUserPhone.includes(normalizedQueryPhone)

        return matchesText || matchesPhone
      })
    }

    if (sortType === 'alphabet') {
      filtered.sort((a, b) => {
        const first = `${a.firstName} ${a.lastName}`.toLowerCase()
        const second = `${b.firstName} ${b.lastName}`.toLowerCase()
        return first.localeCompare(second)
      })
    }

    return filtered
  }, [users, search, activeDepartment, sortType])

  const birthdayList = useMemo(() => {
    if (sortType !== 'birthday') return []
    return buildBirthdayList(filteredUsers)
  }, [filteredUsers, sortType])

  if (initialLoading && users.length === 0) {
    return <div className="status">Загрузка...</div>
  }

  if (hasInitialError && users.length === 0) {
    return <CriticalErrorState onRetry={() => fetchUsers()} />
  }

  return (
    <>
      {(isRefreshing || hasRefreshError || isOffline) && users.length > 0 && (
        <StatusBanner type={isRefreshing ? 'loading' : 'error'} />
      )}

      <div
        ref={searchRowRef}
        className={`homepage ${isIos ? 'homepage--ios' : ''} ${
          isAndroid ? 'homepage--android' : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <h1 className="homepage__title">Поиск</h1>

        <div className={`search-row ${isSearchFocused ? 'search-row--focused' : ''}`}>
          <div className="search-box">
            <SearchIcon className="search-box__icon" />

            <input
              ref={searchInputRef}
              className="search-box__input"
              type="text"
              placeholder="Введи имя, тег, почту..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                window.setTimeout(() => {
                  setIsSearchFocused(false)
                }, 100)
              }}
            />

            {search.length > 0 ? (
              <button
                className="search-box__clear-button"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setSearch('')
                  searchInputRef.current?.focus()
                }}
                aria-label="Очистить поиск"
              >
                <CloseIcon className="search-box__clear-icon" />
              </button>
            ) : (
              <button
                className="search-box__filter-button"
                type="button"
                onClick={() => setIsSortModalOpen(true)}
                aria-label="Открыть сортировку"
              >
                <FilterIcon className="search-box__filter-icon" />
              </button>
            )}
          </div>

          <button
            className={`search-row__cancel ${
              isSearchFocused ? 'search-row__cancel--visible' : ''
            }`}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              searchInputRef.current?.blur()
              setIsSearchFocused(false)
            }}
          >
            Отмена
          </button>
        </div>

        <div className="tabs">
          <div className="tabs__track">
            {departmentTabs.map((tab) => (
              <button
                key={tab.value}
                ref={(element) => {
                  tabRefs.current[tab.value] = element
                }}
                className={`tabs__button ${
                  activeDepartment === tab.value ? 'tabs__button--active' : ''
                }`}
                onClick={() => setActiveDepartment(tab.value)}
                type="button"
              >
                {tab.label}
              </button>
            ))}

            <span
              className="tabs__indicator"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />
          </div>
        </div>

        <div
          className={`pull-refresh ${
            isPulling || showPullSpinner ? 'pull-refresh--visible' : ''
          }`}
          style={{
            height: `${showPullSpinner ? 40 : pullDistance}px`,
          }}
        >
          <div
            className={`pull-refresh__spinner ${
              showPullSpinner ? 'pull-refresh__spinner--spinning' : ''
            }`}
          />
        </div>

        {users.length > 0 && filteredUsers.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="users-list">
            {sortType === 'birthday'
              ? birthdayList.map((item, index) => {
                  if (item.type === 'divider') {
                    return (
                      <li
                        key={`divider-${item.year}-${index}`}
                        className="users-list__year-divider"
                      >
                        {item.year}
                      </li>
                    )
                  }

                  return (
                    <UserCard
                      key={item.user.id}
                      user={item.user}
                      birthdayLabel={item.birthdayLabel}
                    />
                  )
                })
              : filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
          </ul>
        )}

        <SortModal
          isOpen={isSortModalOpen}
          sortType={sortType}
          onClose={() => setIsSortModalOpen(false)}
          onChangeSort={(value) => {
            setSortType(value)
            setIsSortModalOpen(false)
          }}
          isIos={isIos}
        />
      </div>
    </>
  )
}

export default HomePage