import type { MouseEvent, ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { SectionId } from '../../types/site'

interface InPageLinkProps {
  section: SectionId
  children: ReactNode
  className?: string
  onNavigate?: () => void
}

function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
}

export function InPageLink({
  section,
  children,
  className,
  onNavigate,
}: InPageLinkProps) {
  const location = useLocation()
  const search = `?section=${section}`

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.()

    if (location.pathname !== '/' || location.search !== search) {
      return
    }

    const target = document.getElementById(section)

    if (target) {
      event.preventDefault()
      target.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' })
      window.requestAnimationFrame(() => {
        target.focus({ preventScroll: true })
      })
    }
  }

  return (
    <Link
      className={className}
      to={{ pathname: '/', search }}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}
