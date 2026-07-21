import { useLayoutEffect, useRef, type MouseEvent } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { siteConfig } from '../../config/site'
import { BackToTopButton } from '../BackToTopButton/BackToTopButton'
import { InteractiveStarfield } from '../InteractiveStarfield/InteractiveStarfield'
import { SiteHeader } from '../SiteHeader/SiteHeader'
import { SiteFooter } from '../SiteFooter/SiteFooter'
import { StarJourney } from '../StarJourney/StarJourney'
import styles from './SiteLayout.module.css'

type RouteDirection = 'forward' | 'backward'

interface RouteState {
  routeDirection?: RouteDirection
}

function getRouteDepth(pathname: string) {
  if (pathname === '/') return 0
  if (pathname === '/works') return 1
  if (pathname.startsWith('/works/')) return 2
  return 1
}

function getRouteDirection(
  pathname: string,
  previousPathname: string | null,
  state: RouteState | null,
): RouteDirection | undefined {
  if (!previousPathname || pathname === previousPathname) {
    return undefined
  }

  if (state?.routeDirection) {
    return state.routeDirection
  }

  return getRouteDepth(pathname) >= getRouteDepth(previousPathname)
    ? 'forward'
    : 'backward'
}

export function SiteLayout() {
  const location = useLocation()
  const requestedDirection = (location.state as RouteState | null)
    ?.routeDirection
  const previousPathname = useRef(location.pathname)
  const routeSceneRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (previousPathname.current === location.pathname) {
      return
    }

    const direction = getRouteDirection(
      location.pathname,
      previousPathname.current,
      {
        routeDirection: requestedDirection,
      },
    )

    if (direction) {
      routeSceneRef.current?.setAttribute('data-route-direction', direction)
    }

    previousPathname.current = location.pathname
  }, [location.pathname, requestedDirection])

  const moveToMain = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const main = document.querySelector<HTMLElement>('main')
    main?.focus({ preventScroll: true })
    main?.scrollIntoView({ block: 'start' })
  }

  return (
    <div className={styles.site}>
      <InteractiveStarfield />
      {location.pathname === '/' ? <StarJourney /> : null}
      <a className={styles.skipLink} href="#main-content" onClick={moveToMain}>
        本文へ移動
      </a>
      <SiteHeader config={siteConfig} />
      <div
        ref={routeSceneRef}
        className={styles.routeScene}
        data-route-scene
        key={location.pathname}
      >
        <Outlet />
      </div>
      <SiteFooter config={siteConfig} />
      <BackToTopButton />
    </div>
  )
}
