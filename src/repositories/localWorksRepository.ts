import { works } from '../data/works'
import type { ExternalLink, Work, WorkImage } from '../types/work'
import type { WorksRepository } from './worksRepository'

function optionalText(value?: string) {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function textList(values?: readonly string[]) {
  const normalized = values?.map((value) => value.trim()).filter(Boolean)
  return normalized?.length ? normalized : undefined
}

function imageList(values?: readonly WorkImage[]) {
  const normalized = values
    ?.map((image) => ({
      src: image.src.trim(),
      alt: image.alt.trim(),
      caption: optionalText(image.caption),
    }))
    .filter((image) => image.src && image.alt)

  return normalized?.length ? normalized : undefined
}

function linkList(values?: readonly ExternalLink[]) {
  const normalized = values
    ?.map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
    .filter((link) => {
      if (!link.label || !link.url) {
        return false
      }

      try {
        const protocol = new URL(link.url).protocol
        return protocol === 'https:' || protocol === 'http:'
      } catch {
        return false
      }
    })

  return normalized?.length ? normalized : undefined
}

export function normalizeWork(work: Work): Work {
  return {
    ...work,
    id: work.id.trim(),
    slug: work.slug.trim(),
    title: work.title.trim() || '無題（仮）',
    artistName: optionalText(work.artistName),
    mainImage: imageList(work.mainImage ? [work.mainImage] : undefined)?.[0],
    additionalImages: imageList(work.additionalImages),
    description: optionalText(work.description),
    technologies: textList(work.technologies),
    materials: textList(work.materials),
    media: textList(work.media),
    exhibitionLocation: optionalText(work.exhibitionLocation),
    artistLinks: linkList(work.artistLinks),
  }
}

function compareWorks(first: Work, second: Work) {
  return (
    (first.sortOrder ?? Number.MAX_SAFE_INTEGER) -
    (second.sortOrder ?? Number.MAX_SAFE_INTEGER)
  )
}

function publishedWorks() {
  return works
    .filter((work) => work.status === 'published')
    .map(normalizeWork)
    .sort(compareWorks)
}

export const localWorksRepository: WorksRepository = {
  async getPublished() {
    return publishedWorks()
  },

  async getBySlug(slug) {
    return publishedWorks().find((work) => work.slug === slug)
  },
}
