import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './RouteEffects.module.css'

function routeLabel(pathname: string) {
  if (pathname === '/') return 'トップページ'
  if (pathname === '/works') return '作品一覧ページ'
  if (pathname.startsWith('/works/')) return '作品詳細ページ'
  return 'ページが見つかりません'
}

export function RouteEffects() {
  const location = useLocation()
  const previousPath = useRef(location.pathname)

  useEffect(() => {
    if (previousPath.current === location.pathname) return

    previousPath.current = location.pathname

    if (
      location.pathname === '/' &&
      new URLSearchParams(location.search).has('section')
    ) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname, location.search])

  return (
    <p className={styles.announcer} aria-live="polite" aria-atomic="true">
      {routeLabel(location.pathname)}を表示しました
    </p>
  )
}
