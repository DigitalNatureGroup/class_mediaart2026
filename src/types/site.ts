export const sectionIds = [
  'concept',
  'information',
  'works',
  'access',
] as const

export type SectionId = (typeof sectionIds)[number]

export type NavigationItem =
  | {
      label: string
      type: 'section'
      target: SectionId
    }
  | {
      label: string
      type: 'route'
      target: '/works'
    }

export interface SocialAccount {
  label: 'X' | 'Instagram'
  url?: string
}

export interface SiteConfig {
  title: string
  logo: {
    text: string
    imageSrc?: string
    imageAlt?: string
  }
  event: {
    startDate: string
    endDate: string
    venueName: string
    venues: readonly string[]
    openingHours?: string
    organizer: string
  }
  statement: {
    short: string
    full: string
  }
  access: {
    summary: string
    mapEmbedUrl?: string
    mapEmbedTitle?: string
  }
  socialAccounts: readonly SocialAccount[]
  navigation: readonly NavigationItem[]
  visualAssets: {
    heroBackgroundSrc?: string
  }
  credits?: readonly string[]
}
