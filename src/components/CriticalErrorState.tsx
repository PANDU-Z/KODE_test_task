import UfoIcon from '../assets/icons/ufo.svg?react'

interface CriticalErrorStateProps {
  onRetry: () => void
}

function CriticalErrorState({ onRetry }: CriticalErrorStateProps) {
  return (
    <div className="critical-error">
      <div className="critical-error__icon">
        <UfoIcon className="critical-error__icon-svg" />
      </div>

      <div className="critical-error__title">
        Какой-то сверхразум все сломал
      </div>

      <div className="critical-error__text">
        Постараемся быстро починить
      </div>

      <button
        className="critical-error__retry"
        type="button"
        onClick={onRetry}
      >
        Попробовать снова
      </button>
    </div>
  )
}

export default CriticalErrorState