import { useEffect, useRef, useState } from 'react'
import BackIcon from '../assets/icons/back.svg?react'
import CloseIcon from '../assets/icons/close.svg?react'
import SelectedIcon from '../assets/icons/selected.svg?react'
import UnselectedIcon from '../assets/icons/unselected.svg?react'

type SortType = 'alphabet' | 'birthday'

interface SortModalProps {
  isOpen: boolean
  sortType: SortType
  onClose: () => void
  onChangeSort: (value: SortType) => void
  isIos?: boolean
}

function SortModal({
  isOpen,
  sortType,
  onClose,
  onChangeSort,
  isIos = false,
}: SortModalProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const startYRef = useRef<number | null>(null)
  const draggingRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false)
      setDragOffset(0)
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isIos) return

    startYRef.current = event.clientY
    draggingRef.current = true
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isIos || !draggingRef.current || startYRef.current === null) return

    const delta = event.clientY - startYRef.current

    if (!isExpanded) {
      setDragOffset(Math.min(0, Math.max(delta, -260)))
    } else {
      setDragOffset(Math.max(0, Math.min(delta, 260)))
    }
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isIos || !draggingRef.current || startYRef.current === null) return

    const delta = event.clientY - startYRef.current

    if (!isExpanded && delta < -60) {
      setIsExpanded(true)
    } else if (isExpanded && delta > 60) {
      setIsExpanded(false)
    }

    draggingRef.current = false
    startYRef.current = null
    setDragOffset(0)
  }

  const translateY = dragOffset

  return (
    <div
      className={`sort-sheet-overlay ${
        isIos ? 'sort-sheet-overlay--ios' : ''
      }`}
      onClick={onClose}
    >
      <div
        className={`sort-sheet ${
          isIos ? 'sort-sheet--ios' : ''
        } ${isExpanded ? 'sort-sheet--expanded' : ''}`}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={isIos ? { transform: `translateY(${translateY}px)` } : undefined}
      >
        <div className="sort-sheet__handle" />

        <div className="sort-sheet__header">
          {isIos && isExpanded ? (
            <button
              className="sort-sheet__back"
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <BackIcon className="sort-sheet__back-icon" />
            </button>
          ) : null}

          <h2 className="sort-sheet__title">Сортировка</h2>

          {!isIos ? (
            <button
              className="sort-sheet__close"
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <CloseIcon className="sort-sheet__close-icon" />
            </button>
          ) : null}
        </div>

        <button
          className="sort-sheet__option"
          type="button"
          onClick={() => {
            onChangeSort('alphabet')
            onClose()
          }}
        >
          <span className="sort-sheet__radio">
            {sortType === 'alphabet' ? (
              <SelectedIcon className="sort-sheet__radio-icon" />
            ) : (
              <UnselectedIcon className="sort-sheet__radio-icon" />
            )}
          </span>
          <span className="sort-sheet__option-text">По алфавиту</span>
        </button>

        <button
          className="sort-sheet__option"
          type="button"
          onClick={() => {
            onChangeSort('birthday')
            onClose()
          }}
        >
          <span className="sort-sheet__radio">
            {sortType === 'birthday' ? (
              <SelectedIcon className="sort-sheet__radio-icon" />
            ) : (
              <UnselectedIcon className="sort-sheet__radio-icon" />
            )}
          </span>
          <span className="sort-sheet__option-text">По дню рождения</span>
        </button>
      </div>
    </div>
  )
}

export default SortModal