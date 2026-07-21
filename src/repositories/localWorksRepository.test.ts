import { describe, expect, it } from 'vitest'
import type { Work } from '../types/work'
import {
  localWorksRepository,
  normalizeWork,
} from './localWorksRepository'

describe('localWorksRepository', () => {
  it('公開作品だけをsortOrder順で返す', async () => {
    const published = await localWorksRepository.getPublished()

    expect(published).toHaveLength(6)
    expect(published.every((work) => work.status === 'published')).toBe(true)
    expect(published.map((work) => work.sortOrder)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('非公開slugを公開取得しない', async () => {
    await expect(
      localWorksRepository.getBySlug('unpublished-sample'),
    ).resolves.toBeUndefined()
  })

  it('空の任意項目と危険な外部リンクを除去する', () => {
    const work: Work = {
      id: ' sample ',
      slug: ' sample ',
      title: ' ',
      artistName: ' ',
      technologies: [' ', '技術（仮）'],
      artistLinks: [
        { label: '危険なリンク', url: 'javascript:alert(1)' },
        { label: '安全なリンク', url: 'https://example.com' },
      ],
      status: 'published',
    }

    expect(normalizeWork(work)).toMatchObject({
      id: 'sample',
      slug: 'sample',
      title: '無題（仮）',
      artistName: undefined,
      technologies: ['技術（仮）'],
      artistLinks: [{ label: '安全なリンク', url: 'https://example.com' }],
    })
  })
})
