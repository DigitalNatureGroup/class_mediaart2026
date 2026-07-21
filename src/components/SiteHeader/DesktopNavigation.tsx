import { Link, useLocation } from 'react-router-dom'
import type { NavigationItem } from '../../types/site'
import { InPageLink } from '../Navigation/InPageLink'
import styles from './SiteHeader.module.css'

interface DesktopNavigationProps {
  items: readonly NavigationItem[]
}

export function DesktopNavigation({ items }: DesktopNavigationProps) {
  const location = useLocation()

  return (
    <nav className={styles.desktopNavigation} aria-label="メインナビゲーション">
      <ul className={styles.navigationList}>
        {items.map((item) => (
          <li key={item.label}>
            {item.type === 'section' ? (
              <InPageLink
                className={styles.navigationLink}
                section={item.target}
              >
                {item.label}
              </InPageLink>
            ) : (
              <Link
                className={styles.navigationLink}
                to={item.target}
                aria-current={
                  location.pathname.startsWith('/works') ? 'page' : undefined
                }
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
