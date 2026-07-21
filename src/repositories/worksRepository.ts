import type { Work } from '../types/work'

export interface WorksRepository {
  getPublished(): Promise<Work[]>
  getBySlug(slug: string): Promise<Work | undefined>
}
