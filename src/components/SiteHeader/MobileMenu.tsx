import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { NavigationItem } from '../../types/site'
import { InPageLink } from '../Navigation/InPageLink'
import styles from './SiteHeader.module.css'

interface MobileMenuProps {
  id: string
  isOpen: boolean
  items: readonly NavigationItem[]
  onClose: (restoreFocus: boolean) => void
}

const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function MobileMenu({
  id,
  isOpen,
  items,
  onClose,
}: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const panel = panelRef.current
    const main = document.querySelector('main')
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    main?.setAttribute('inert', '')

    const frame = window.requestAnimationFrame(() => {
      panel?.querySelector<HTMLElement>('nav a[href]')?.focus({
        preventScroll: true,
      })
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose(true)
        return
      }

      if (event.key !== 'Tab' || !panel) {
        return
      }

      const focusableElements = Array.from(
        panel.querySelectorAll<HTMLElement>(focusableSelector),
      )
      const first = focusableElements[0]
      const last = focusableElements.at(-1)

      if (!first || !last) {
        return
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      main?.removeAttribute('inert')
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const closeWithoutRestore = () => onClose(false)

  return (
    <div className={styles.mobileMenuRoot}>
      <div
        className={styles.mobileBackdrop}
        aria-hidden="true"
        onClick={() => onClose(true)}
      />
      <div
        ref={panelRef}
        className={styles.mobilePanel}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="メニュー"
      >
        <div className={styles.mobilePanelHeader}>
          <span>メニュー</span>
          <button
            className={styles.closeButton}
            type="button"
            onClick={() => onClose(true)}
          >
            <span aria-hidden="true">×</span>
            <span className={styles.visuallyHidden}>閉じる</span>
          </button>
        </div>
        <nav aria-label="モバイルナビゲーション">
          <ul className={styles.mobileNavigationList}>
            {items.map((item, index) => (
              <li key={item.label}>
                {item.type === 'section' ? (
                  <InPageLink
                    className={styles.mobileNavigationLink}
                    section={item.target}
                    onNavigate={closeWithoutRestore}
                  >
                    <span aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {item.label}
                  </InPageLink>
                ) : (
                  <Link
                    className={styles.mobileNavigationLink}
                    to={item.target}
                    onClick={closeWithoutRestore}
                  >
                    <span aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
