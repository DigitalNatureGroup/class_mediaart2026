import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  journeyChangeEventName,
  type JourneyChangeDetail,
} from '../../utils/journeyEvents'
import styles from './StarJourney.module.css'

const journeyLabels = ['stArt', 'コンセプト', '開催情報', '作品', 'アクセス']
const starYPositions = [28, 68, 36, 66, 30]
const panelXPositions = [0, 14, -11, 13, -8]
const starSegmentWidth = 54
const focusY = 26

type StarStyle = CSSProperties & {
  '--star-offset-x': string
  '--star-y': string
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function interpolate(start: number, end: number, amount: number) {
  return start + (end - start) * amount
}

function smoothStep(value: number) {
  return value * value * (3 - 2 * value)
}

export function StarJourney() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-journey-stop]'),
    )

    if (!track || elements.length === 0) {
      return
    }

    document.documentElement.classList.add('starJourneyEnabled')

    let frameId: number | null = null
    let hasDispatchedInitialPosition = false

    const getJourneyProgress = () => {
      const viewportCenter = window.scrollY + window.innerHeight / 2
      const centers = elements.map(
        (element) => element.offsetTop + element.offsetHeight / 2,
      )

      if (viewportCenter <= centers[0]) {
        return 0
      }

      const lastIndex = centers.length - 1

      if (viewportCenter >= centers[lastIndex]) {
        return lastIndex
      }

      for (let index = 0; index < lastIndex; index += 1) {
        const start = centers[index]
        const end = centers[index + 1]

        if (viewportCenter <= end) {
          const localProgress = clamp(
            (viewportCenter - start) / Math.max(end - start, 1),
            0,
            1,
          )

          return index + smoothStep(localProgress)
        }
      }

      return lastIndex
    }

    const updateJourney = () => {
      const progress = getJourneyProgress()
      const startIndex = Math.floor(progress)
      const endIndex = Math.min(startIndex + 1, elements.length - 1)
      const localProgress = progress - startIndex
      const closestIndex = Math.round(progress)
      const cameraX = interpolate(
        panelXPositions[startIndex],
        panelXPositions[endIndex],
        localProgress,
      )
      const cameraY = interpolate(
        starYPositions[startIndex],
        starYPositions[endIndex],
        localProgress,
      )

      elements.forEach((element, index) => {
        const distance = Math.abs(index - progress)
        const mobileScale = window.innerWidth < 768 ? 0.24 : 1
        const panelShift =
          clamp(panelXPositions[index] - cameraX, -32, 32) * mobileScale
        const panelScale = 1 - Math.min(distance, 1) * 0.015

        element.style.setProperty('--journey-panel-x', `${panelShift}vw`)
        element.style.setProperty('--journey-panel-scale', String(panelScale))
        element.dataset.journeyActive = String(index === closestIndex)
      })

      track.style.setProperty(
        '--journey-track-x',
        `${progress * -starSegmentWidth}vw`,
      )
      track.style.setProperty('--journey-track-y', `${focusY - cameraY}vh`)

      const activeIndexChanged = activeIndexRef.current !== closestIndex

      if (activeIndexChanged) {
        activeIndexRef.current = closestIndex
        setActiveIndex(closestIndex)
      }

      if (activeIndexChanged || !hasDispatchedInitialPosition) {
        hasDispatchedInitialPosition = true
        window.dispatchEvent(
          new CustomEvent<JourneyChangeDetail>(journeyChangeEventName, {
            detail: { index: closestIndex },
          }),
        )
      }

      frameId = null
    }

    const requestUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateJourney)
      }
    }

    updateJourney()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      document.documentElement.classList.remove('starJourneyEnabled')
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      elements.forEach((element) => {
        delete element.dataset.journeyActive
        element.style.removeProperty('--journey-panel-x')
        element.style.removeProperty('--journey-panel-scale')
      })

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return (
    <div className={styles.field} aria-hidden="true">
      <div ref={trackRef} className={styles.track} data-journey-track>
        <svg
          className={styles.connections}
          viewBox="0 0 248 100"
          preserveAspectRatio="none"
        >
          <polyline points="0,28 62,68 124,36 186,66 248,30" />
        </svg>
        {journeyLabels.map((label, index) => {
          const starStyle: StarStyle = {
            '--star-offset-x': `${index * starSegmentWidth}vw`,
            '--star-y': `${starYPositions[index]}vh`,
          }

          return (
            <span
              className={styles.star}
              data-active={index === activeIndex}
              key={label}
              style={starStyle}
            />
          )
        })}
        <span className={`${styles.dust} ${styles.dustOne}`} />
        <span className={`${styles.dust} ${styles.dustTwo}`} />
        <span className={`${styles.dust} ${styles.dustThree}`} />
        <span className={`${styles.dust} ${styles.dustFour}`} />
      </div>
      <span className={styles.focusAura} />
      <span className={styles.focusRing} />
    </div>
  )
}
