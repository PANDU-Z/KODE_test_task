interface CallActionSheetProps {
  isOpen: boolean
  phone: string
  onClose: () => void
  onCall: () => void
}

function CallActionSheet({
  isOpen,
  phone,
  onClose,
  onCall,
}: CallActionSheetProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="call-sheet-overlay" onClick={onClose}>
      <div className="call-sheet" onClick={(event) => event.stopPropagation()}>
        <button className="call-sheet__action" type="button" onClick={onCall}>
          {phone}
        </button>

        <button className="call-sheet__cancel" type="button" onClick={onClose}>
          Отмена
        </button>
      </div>
    </div>
  )
}

export default CallActionSheet