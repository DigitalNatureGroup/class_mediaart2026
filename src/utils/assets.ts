export function resolveAssetUrl(source: string) {
  if (/^(https?:|data:|blob:)/.test(source)) return source
  return `${import.meta.env.BASE_URL}${source.replace(/^\/+/, '')}`
}
