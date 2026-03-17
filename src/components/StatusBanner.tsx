interface StatusBannerProps {
  type: 'loading' | 'error'
}

function StatusBanner({ type }: StatusBannerProps) {
  const isLoading = type === 'loading'

  return (
    <div
      className={`status-banner ${
        isLoading ? 'status-banner--loading' : 'status-banner--error'
      }`}
    >
      {isLoading ? (
        <div className="status-banner__text">Секундочку, я гружусь...</div>
      ) : (
        <div className="status-banner__text">
          <span className="status-banner__line">
            Не могу обновить данные.
          </span>
          <span className="status-banner__line">
            Проверь соединение с интернетом.
          </span>
        </div>
      )}
    </div>
  )
}

export default StatusBanner