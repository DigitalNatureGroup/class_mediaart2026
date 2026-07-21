import type { CSSProperties, PointerEvent } from 'react'
import type { SiteConfig } from '../../types/site'
import { resolveAssetUrl } from '../../utils/assets'
import { EventDateRange } from '../EventDateRange/EventDateRange'
import styles from './Hero.module.css'

interface HeroProps {
  config: SiteConfig
}

type HeroStyle = CSSProperties & {
  '--hero-background-image'?: string
  '--letter-index'?: number
}

function getBackgroundStyle(backgroundSrc?: string): HeroStyle | undefined {
  if (!backgroundSrc) {
    return undefined
  }

  const safeSource = resolveAssetUrl(backgroundSrc).replaceAll('"', '\\"')

  return {
    '--hero-background-image': `url("${safeSource}")`,
  }
}

function ConstellationA() {
  return (
    <svg
      className={styles.constellationA}
      viewBox="0 0 120 150"
      aria-hidden="true"
    >
      <g className={styles.constellationALines}>
        <path d="M9 140 58 17l53 123" />
        <path d="M29 91h62" />
        <path d="m9 140 82-49M29 91l82 49" />
      </g>
      <g className={styles.constellationANodes}>
        <circle cx="9" cy="140" r="3" />
        <circle cx="29" cy="91" r="2.5" />
        <circle cx="91" cy="91" r="2.5" />
        <circle cx="111" cy="140" r="3" />
      </g>
      <circle className={styles.constellationAOrbit} cx="58" cy="17" r="13" />
      <path
        className={styles.constellationAStar}
        d="m58 0 4.2 12.8L75 17l-12.8 4.2L58 34l-4.2-12.8L41 17l12.8-4.2L58 0Z"
      />
    </svg>
  )
}

export function Hero({ config }: HeroProps) {
  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5
    const y = (event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5

    event.currentTarget.style.setProperty('--hero-pointer-x', `${x * 2}`)
    event.currentTarget.style.setProperty('--hero-pointer-y', `${y * 2}`)
  }

  const resetPointer = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--hero-pointer-x', '0')
    event.currentTarget.style.setProperty('--hero-pointer-y', '0')
  }

  return (
    <section
      className={styles.hero}
      aria-labelledby="hero-title"
      data-journey-stop
      data-journey-label="stArt"
      style={getBackgroundStyle(config.visualAssets.heroBackgroundSrc)}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className={styles.backdrop} aria-hidden="true">
        <span className={styles.grid} />
        <span className={styles.horizon} />
        <svg
          className={styles.orbitMap}
          viewBox="0 0 1000 620"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="624" cy="277" r="168" />
          <circle cx="624" cy="277" r="104" />
          <ellipse cx="624" cy="277" rx="278" ry="76" />
          <path d="M95 485 272 386 442 432 624 277 818 354 956 163" />
          <path d="M624 36V518M342 277H906" />
          <g className={styles.orbitNodes}>
            <circle cx="272" cy="386" r="5" />
            <circle cx="442" cy="432" r="4" />
            <circle cx="624" cy="277" r="7" />
            <circle cx="818" cy="354" r="4" />
            <circle cx="956" cy="163" r="5" />
          </g>
        </svg>
      </div>

      <div className={styles.titleArea}>
        <p className={styles.titleCoordinate} aria-hidden="true">
          07.29 — 07.31
        </p>
        <h1
          id="hero-title"
          className={styles.title}
          aria-label={config.title}
        >
          {Array.from(config.title).map((letter, index) => (
            <span
              className={`${styles.letter} ${letter === 'A' ? styles.starLetter : ''}`}
              aria-hidden="true"
              key={`${letter}-${index}`}
              style={{ '--letter-index': index } as HeroStyle}
            >
              {letter === 'A' ? <ConstellationA /> : letter}
            </span>
          ))}
        </h1>
        <p className={styles.journeyCue} aria-hidden="true">
          <span>次の星へ</span>
          <span className={styles.journeyLine} />
        </p>
      </div>

      <div className={styles.details}>
        <div className={styles.detailBlock}>
          <p className={styles.label}>会期</p>
          <p className={styles.date}>
            <EventDateRange
              startDate={config.event.startDate}
              endDate={config.event.endDate}
            />
          </p>
        </div>

        <div className={styles.detailBlock}>
          <p className={styles.label}>会場</p>
          <p className={styles.venueName}>{config.event.venueName}</p>
          <ul className={styles.venues} aria-label="展示会場">
            {config.event.venues.map((venue) => (
              <li key={venue}>{venue}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
