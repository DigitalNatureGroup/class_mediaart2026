export type WorkStatus = 'draft' | 'published'

export interface WorkImage {
  src: string
  alt: string
  caption?: string
}

export interface ExternalLink {
  label: string
  url: string
}

export interface Work {
  id: string
  slug: string
  title: string
  artistName?: string
  mainImage?: WorkImage
  additionalImages?: readonly WorkImage[]
  description?: string
  technologies?: readonly string[]
  materials?: readonly string[]
  media?: readonly string[]
  exhibitionLocation?: string
  artistLinks?: readonly ExternalLink[]
  status: WorkStatus
  sortOrder?: number
}
