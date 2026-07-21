import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { sectionIds, type SectionId } from '../../types/site'

function isSectionId(value: string | null): value is SectionId {
  return value !== null && sectionIds.some((section) => section === value)
}

function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
}

export function ScrollManager() {
  const location = useLocation()

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const section = new URLSearchParams(location.search).get('section')

      if (location.pathname === '/' && isSectionId(section)) {
        const target = document.getElementById(section)

        if (target) {
          target.scrollIntoView({
            behavior: getScrollBehavior(),
            block: 'start',
          })
          target.focus({ preventScroll: true })
          return
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location.key, location.pathname, location.search])

  return null
}
