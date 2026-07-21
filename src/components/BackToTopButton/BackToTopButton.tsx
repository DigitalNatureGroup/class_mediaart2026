import { useEffect, useRef, useState } from 'react'
import styles from './BackToTopButton.module.css'

const visibilityThreshold = 400
const wheelIntentDuration = 800
const scrollCompletionTimeout = 2000
const settledFrameTarget = 6

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const lastScrollPosition = useRef(0)
  const lastWheelIntent = useRef(0)
  const frameId = useRef<number | null>(null)

  useEffect(() => {
    lastScrollPosition.current = window.scrollY

    const handleScroll = () => {
      if (frameId.current !== null) {
        return
      }

      frameId.current = window.requestAnimationFrame(() => {
        const currentScrollPosition = window.scrollY
        const scrollDelta = currentScrollPosition - lastScrollPosition.current
        const isScrollingUp = scrollDelta < -1

        if (performance.now() - lastWheelIntent.current > wheelIntentDuration) {
          setIsVisible(
            currentScrollPosition > visibilityThreshold && isScrollingUp,
          )
        }

        lastScrollPosition.current = currentScrollPosition
        frameId.current = null
      })
    }

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 1) {
        return
      }

      lastWheelIntent.current = performance.now()
      setIsVisible(window.scrollY > visibilityThreshold && event.deltaY < 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
      if (frameId.current !== null) {
        window.cancelAnimationFrame(frameId.current)
      }
    }
  }, [])

  const moveToTop = () => {
    document
      .querySelector<HTMLElement>('main')
      ?.focus({ preventScroll: true })

    const root = document.documentElement
    const isJourneyActive = root.classList.contains('starJourneyEnabled')
    const startedAt = performance.now()
    let settledFrames = 0

    if (isJourneyActive) {
      root.dataset.movingToTop = 'true'
    }

    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })

    if (!isJourneyActive) {
      return
    }

    const restoreJourneySnap = () => {
      if (window.scrollY <= 1) {
        settledFrames += 1
      } else {
        settledFrames = 0
      }

      if (settledFrames >= settledFrameTarget) {
        delete root.dataset.movingToTop
        return
      }

      if (performance.now() - startedAt >= scrollCompletionTimeout) {
        window.scrollTo({ top: 0, behavior: 'auto' })
        delete root.dataset.movingToTop
        return
      }

      window.requestAnimationFrame(restoreJourneySnap)
    }

    window.requestAnimationFrame(restoreJourneySnap)
  }

  return (
    <button
      className={styles.button}
      type="button"
      onClick={moveToTop}
      aria-label="ページの先頭へ戻る"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      data-visible={isVisible}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 11.5 12 4l7 7.5M12 4v16" />
      </svg>
    </button>
  )
}
