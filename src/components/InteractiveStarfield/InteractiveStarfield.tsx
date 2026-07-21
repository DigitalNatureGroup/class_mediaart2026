import { useEffect, useRef } from 'react'
import {
  journeyChangeEventName,
  type JourneyChangeDetail,
} from '../../utils/journeyEvents'
import styles from './InteractiveStarfield.module.css'

interface Star {
  x: number
  y: number
  depth: number
  radius: number
  phase: number
  speed: number
  signal: boolean
}

interface ProjectedStar {
  x: number
  y: number
  radius: number
  depth: number
  signal: boolean
  twinkle: number
}

interface Ripple {
  x: number
  y: number
  startedAt: number
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

const nebulaStops = [
  { x: 0, y: 0, rotation: -3, hue: 0 },
  { x: -7, y: 5, rotation: 1, hue: -4 },
  { x: 6, y: -4, rotation: 4, hue: 3 },
  { x: -4, y: -6, rotation: -1, hue: 6 },
  { x: 5, y: 4, rotation: 3, hue: -2 },
] as const

function createRandom(seed: number) {
  let value = seed >>> 0

  return () => {
    value += 0x6d2b79f5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function getToken(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()

  return value || fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function InteractiveStarfield() {
  const fieldRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const field = fieldRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!field || !canvas || !context) {
      return
    }

    const motionPreference = window.matchMedia(reducedMotionQuery)
    const pointer = { x: 0, y: 0, active: false }
    let width = window.innerWidth
    let height = window.innerHeight
    let pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    let stars: Star[] = []
    let ripples: Ripple[] = []
    let animationFrame: number | null = null
    let activeSection = 0
    let scrollVelocity = 0
    let lastScrollPosition = window.scrollY
    let isReducedMotion = motionPreference.matches
    let isPageVisible = !document.hidden
    let starColor = '#e8eee7'
    let starMutedColor = '#809087'
    let signalColor = '#d8e36e'
    let connectionColor = '#9fafa6'

    const applyNebulaStop = (index: number) => {
      const stop = nebulaStops[index] ?? nebulaStops[0]

      field.style.setProperty('--nebula-section-x', `${stop.x}vw`)
      field.style.setProperty('--nebula-section-y', `${stop.y}vh`)
      field.style.setProperty('--nebula-rotation', `${stop.rotation}deg`)
      field.style.setProperty('--nebula-hue', `${stop.hue}deg`)
      field.dataset.nebulaSection = String(index)
    }

    const buildStars = () => {
      const random = createRandom(0x57a72026 + Math.round(width + height))
      const starCount = width < 640 ? 84 : width < 1024 ? 128 : 184

      stars = Array.from({ length: starCount }, (_, index) => ({
        x: random(),
        y: random(),
        depth: 0.25 + random() * 0.75,
        radius: 0.42 + random() * 1.18,
        phase: random() * Math.PI * 2,
        speed: 0.12 + random() * 0.34,
        signal: index % 29 === 0,
      }))
    }

    const projectStars = (time: number): ProjectedStar[] => {
      const pointerOffsetX = pointer.active ? pointer.x - width / 2 : 0
      const pointerOffsetY = pointer.active ? pointer.y - height / 2 : 0
      const sectionPhase = activeSection * 0.72

      return stars.map((star) => {
        const horizontalDrift =
          Math.sin(time * star.speed + star.phase + sectionPhase) *
          10 *
          star.depth
        const verticalDrift =
          Math.cos(time * star.speed * 0.73 + star.phase) *
          7 *
          star.depth
        const x =
          star.x * width +
          horizontalDrift -
          pointerOffsetX * 0.018 * star.depth
        const y =
          star.y * height +
          verticalDrift -
          pointerOffsetY * 0.012 * star.depth -
          scrollVelocity * 0.36 * star.depth

        return {
          x: ((x % width) + width) % width,
          y: ((y % height) + height) % height,
          radius: star.radius * (0.55 + star.depth * 0.7),
          depth: star.depth,
          signal: star.signal,
          twinkle: 0.62 + Math.sin(time * 1.3 + star.phase) * 0.28,
        }
      })
    }

    const drawConnections = (projectedStars: ProjectedStar[]) => {
      const connectionDistance = width < 640 ? 82 : 112
      const connectionDistanceSquared = connectionDistance ** 2

      context.lineWidth = 0.55
      context.strokeStyle = connectionColor

      for (let first = 0; first < projectedStars.length; first += 1) {
        const star = projectedStars[first]

        for (
          let second = first + 1;
          second < projectedStars.length;
          second += 1
        ) {
          const candidate = projectedStars[second]
          const distanceX = star.x - candidate.x
          const distanceY = star.y - candidate.y
          const distanceSquared = distanceX ** 2 + distanceY ** 2

          if (distanceSquared > connectionDistanceSquared) {
            continue
          }

          const distance = Math.sqrt(distanceSquared)

          context.globalAlpha =
            (1 - distance / connectionDistance) *
            0.2 *
            Math.min(star.depth, candidate.depth)
          context.beginPath()
          context.moveTo(star.x, star.y)
          context.lineTo(candidate.x, candidate.y)
          context.stroke()
        }
      }
    }

    const drawPointerConstellation = (projectedStars: ProjectedStar[]) => {
      if (!pointer.active) {
        return
      }

      const pointerRadius = width < 640 ? 132 : 196
      const nearest = projectedStars
        .map((star) => ({
          star,
          distance: Math.hypot(star.x - pointer.x, star.y - pointer.y),
        }))
        .filter(({ distance }) => distance < pointerRadius)
        .sort((first, second) => first.distance - second.distance)
        .slice(0, 12)

      context.strokeStyle = signalColor
      context.lineWidth = 0.8

      nearest.forEach(({ star, distance }) => {
        context.globalAlpha = (1 - distance / pointerRadius) * 0.46
        context.beginPath()
        context.moveTo(pointer.x, pointer.y)
        context.lineTo(star.x, star.y)
        context.stroke()
      })

      context.globalAlpha = 0.92
      context.fillStyle = signalColor
      context.beginPath()
      context.arc(pointer.x, pointer.y, 2.1, 0, Math.PI * 2)
      context.fill()

      context.globalAlpha = 0.42
      context.strokeStyle = signalColor
      context.beginPath()
      context.moveTo(pointer.x - 9, pointer.y)
      context.lineTo(pointer.x + 9, pointer.y)
      context.moveTo(pointer.x, pointer.y - 9)
      context.lineTo(pointer.x, pointer.y + 9)
      context.stroke()
    }

    const drawRipples = (time: number) => {
      ripples = ripples.filter((ripple) => time - ripple.startedAt < 1.35)

      ripples.forEach((ripple) => {
        const progress = clamp((time - ripple.startedAt) / 1.35, 0, 1)
        const easedProgress = 1 - (1 - progress) ** 3

        context.globalAlpha = (1 - progress) * 0.5
        context.strokeStyle = signalColor
        context.lineWidth = 0.8
        context.beginPath()
        context.arc(
          ripple.x,
          ripple.y,
          easedProgress * Math.min(width, height) * 0.32,
          0,
          Math.PI * 2,
        )
        context.stroke()
      })
    }

    const draw = (timestamp: number) => {
      const time = timestamp / 1000
      const projectedStars = projectStars(time)

      context.clearRect(0, 0, width, height)
      drawConnections(projectedStars)

      projectedStars.forEach((star) => {
        context.globalAlpha = clamp(
          star.twinkle * (0.28 + star.depth * 0.64),
          0.16,
          0.94,
        )
        context.fillStyle = star.signal ? signalColor : starColor

        if (star.signal) {
          context.shadowBlur = 10
          context.shadowColor = signalColor
        }

        context.beginPath()
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        context.fill()
        context.shadowBlur = 0

        if (star.depth < 0.42) {
          context.globalAlpha *= 0.55
          context.fillStyle = starMutedColor
          context.fill()
        }
      })

      drawPointerConstellation(projectedStars)
      drawRipples(time)
      context.globalAlpha = 1
      scrollVelocity *= 0.92
    }

    const animate = (timestamp: number) => {
      draw(timestamp)

      if (!isReducedMotion && isPageVisible) {
        animationFrame = window.requestAnimationFrame(animate)
      }
    }

    const startAnimation = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }

      animationFrame = null

      if (isReducedMotion || !isPageVisible) {
        draw(performance.now())
        return
      }

      animationFrame = window.requestAnimationFrame(animate)
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      starColor = getToken('--color-star-primary', '#e8eee7')
      starMutedColor = getToken('--color-star-secondary', '#809087')
      signalColor = getToken('--color-star-signal', '#d8e36e')
      connectionColor = getToken('--color-star-line', '#9fafa6')

      buildStars()
      draw(performance.now())
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
      field.dataset.pointerActive = 'true'
      field.style.setProperty('--field-pointer-x', `${event.clientX}px`)
      field.style.setProperty('--field-pointer-y', `${event.clientY}px`)

      if (!isReducedMotion) {
        const normalizedX = event.clientX / Math.max(width, 1) - 0.5
        const normalizedY = event.clientY / Math.max(height, 1) - 0.5
        field.style.setProperty(
          '--nebula-pointer-x',
          `${normalizedX * -28}px`,
        )
        field.style.setProperty(
          '--nebula-pointer-y',
          `${normalizedY * -18}px`,
        )
      }

      if (isReducedMotion) {
        draw(performance.now())
      }
    }

    const handlePointerLeave = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        pointer.active = false
        field.dataset.pointerActive = 'false'
        field.style.setProperty('--nebula-pointer-x', '0px')
        field.style.setProperty('--nebula-pointer-y', '0px')
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (isReducedMotion || event.button !== 0) {
        return
      }

      ripples.push({
        x: event.clientX,
        y: event.clientY,
        startedAt: performance.now() / 1000,
      })
      ripples = ripples.slice(-4)
    }

    const handleScroll = () => {
      const currentScrollPosition = window.scrollY
      scrollVelocity = clamp(
        currentScrollPosition - lastScrollPosition,
        -48,
        48,
      )
      lastScrollPosition = currentScrollPosition
    }

    const handleJourneyChange = (event: Event) => {
      activeSection = (event as CustomEvent<JourneyChangeDetail>).detail.index
      applyNebulaStop(activeSection)
    }

    const handleMotionPreference = () => {
      isReducedMotion = motionPreference.matches
      ripples = []

      if (isReducedMotion) {
        field.style.setProperty('--nebula-pointer-x', '0px')
        field.style.setProperty('--nebula-pointer-y', '0px')
      }

      startAnimation()
    }

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden
      startAnimation()
    }

    applyNebulaStop(0)
    resize()
    pointer.x = width * 0.5
    pointer.y = height * 0.5
    startAnimation()

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerout', handlePointerLeave)
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener(journeyChangeEventName, handleJourneyChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    motionPreference.addEventListener('change', handleMotionPreference)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerout', handlePointerLeave)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener(journeyChangeEventName, handleJourneyChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      motionPreference.removeEventListener('change', handleMotionPreference)

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  return (
    <div
      ref={fieldRef}
      className={styles.field}
      data-interactive-starfield-root
      data-nebula-section="0"
      data-pointer-active="false"
      aria-hidden="true"
    >
      <div className={styles.atmosphere} data-nebula-atmosphere>
        <span className={`${styles.cloud} ${styles.cloudOne}`} />
        <span className={`${styles.cloud} ${styles.cloudTwo}`} />
        <span className={`${styles.cloud} ${styles.cloudThree}`} />
      </div>
      <canvas ref={canvasRef} data-interactive-starfield />
      <span className={styles.instrument} />
      <div className={styles.grain} />
      <div className={styles.vignette} />
    </div>
  )
}
