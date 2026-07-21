interface BasePathOptions {
  repository?: string
  isGitHubActions?: boolean
  override?: string
}

function normalizeBasePath(value: string) {
  const trimmed = value.trim()

  if (!trimmed || trimmed === '/') return '/'

  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

export function resolveBasePath({
  repository,
  isGitHubActions = false,
  override,
}: BasePathOptions) {
  if (override) return normalizeBasePath(override)
  if (!isGitHubActions || !repository) return '/'

  const repositoryName = repository.split('/').at(-1)

  if (!repositoryName || repositoryName.endsWith('.github.io')) return '/'

  return normalizeBasePath(repositoryName)
}
