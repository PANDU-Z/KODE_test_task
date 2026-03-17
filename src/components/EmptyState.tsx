import SearchIcon from '../assets/icons/placeholder.svg?react'

function EmptyState() {
  return (
    <div className="empty-state">
      <SearchIcon className="empty-state__icon" />
      <h2 className="empty-state__title">Мы никого не нашли</h2>
      <p className="empty-state__text">Попробуй скорректировать запрос</p>
    </div>
  )
}

export default EmptyState