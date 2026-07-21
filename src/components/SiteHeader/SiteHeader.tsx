import { useCallback, useEffect, useRef, useState } from 'react'
import type { SiteConfig } from '../../types/site'
import { DesktopNavigation } from './DesktopNavigation'
import { MobileMenu } from './MobileMenu'
import { SiteLogo } from './SiteLogo'
import styles from './SiteHeader.module.css'

interface SiteHeaderProps {
  config: SiteConfig
}

const mobileMenuId = 'mobile-navigation'

export function SiteHeader({ config }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setIsMenuOpen(false)

    if (restoreFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus())
    }
  }, [])

  useEffect(() => {
    const handleHashChange = () => setIsMenuOpen(false)
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const desktopLayout = window.matchMedia('(min-width: 48rem)')
    const handleLayoutChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeMenu(false)
      }
    }

    desktopLayout.addEventListener('change', handleLayoutChange)
    return () => desktopLayout.removeEventListener('change', handleLayoutChange)
  }, [closeMenu])

  return (
    <header className={styles.header}>
      <SiteLogo logo={config.logo} onNavigate={() => closeMenu(false)} />
      <DesktopNavigation items={config.navigation} />
      <button
        ref={menuButtonRef}
        className={styles.menuButton}
        type="button"
        aria-expanded={isMenuOpen}
        aria-controls={mobileMenuId}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <span className={styles.menuButtonLabel}>メニュー</span>
        <span className={styles.menuIcon} aria-hidden="true">
          <span />
          <span />
        </span>
      </button>
      <MobileMenu
        id={mobileMenuId}
        isOpen={isMenuOpen}
        items={config.navigation}
        onClose={closeMenu}
      />
    </header>
  )
}
