import { describe, expect, it } from 'vitest'
import { resolveBasePath } from './basePath'

describe('resolveBasePath', () => {
  it('ローカルではルートを返す', () => {
    expect(resolveBasePath({ repository: 'owner/mediaartsite' })).toBe('/')
  })

  it('GitHub Actionsではリポジトリ名をbaseにする', () => {
    expect(
      resolveBasePath({
        repository: 'owner/mediaartsite',
        isGitHubActions: true,
      }),
    ).toBe('/mediaartsite/')
  })

  it('ユーザーサイト用リポジトリはルートを返す', () => {
    expect(
      resolveBasePath({
        repository: 'owner/owner.github.io',
        isGitHubActions: true,
      }),
    ).toBe('/')
  })

  it('明示したbaseを正規化する', () => {
    expect(resolveBasePath({ override: 'preview/site' })).toBe('/preview/site/')
  })
})
