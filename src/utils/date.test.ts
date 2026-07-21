import { describe, expect, it } from 'vitest'
import { formatEventDateRange, getEventDateRangeParts } from './date'

describe('formatEventDateRange', () => {
  it('同じ月の会期を曜日付きで簡潔に表示する', () => {
    expect(formatEventDateRange('2026-07-29', '2026-07-31')).toBe(
      '2026年7月29日（水）—31日（金）',
    )
  })

  it('単日開催を一つの日付として表示する', () => {
    expect(formatEventDateRange('2026-07-29', '2026-07-29')).toBe(
      '2026年7月29日（水）',
    )
  })

  it('改行制御用に開始日と終了日を意味単位へ分ける', () => {
    expect(getEventDateRangeParts('2026-07-29', '2026-07-31')).toEqual({
      start: '2026年7月29日（水）',
      end: '31日（金）',
    })
  })

  it('不正な形式を受け取ると例外にする', () => {
    expect(() => formatEventDateRange('2026/07/29', '2026-07-31')).toThrow(
      'Invalid date',
    )
  })
})
