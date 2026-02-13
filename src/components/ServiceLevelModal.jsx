import { useEffect, useRef } from 'react'
import { ServiceLevelMatrix } from './ServiceLevelMatrix'

function getFocusableElements(rootElement) {
  if (!rootElement) {
    return []
  }

  return Array.from(
    rootElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'))
}

export function ServiceLevelModal({ isOpen, onClose, ...matrixProps }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const dialog = dialogRef.current
    const focusables = getFocusableElements(dialog)
    focusables[0]?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const tabFocusables = getFocusableElements(dialog)
      if (tabFocusables.length === 0) {
        event.preventDefault()
        return
      }

      const currentIndex = tabFocusables.indexOf(document.activeElement)

      if (event.shiftKey) {
        if (currentIndex <= 0) {
          event.preventDefault()
          tabFocusables[tabFocusables.length - 1].focus()
        }
        return
      }

      if (currentIndex === tabFocusables.length - 1) {
        event.preventDefault()
        tabFocusables[0].focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Настройка уровней сервиса"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Настройка уровней сервиса</h2>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Отмена
          </button>
        </div>
        <ServiceLevelMatrix {...matrixProps} />
      </div>
    </div>
  )
}
