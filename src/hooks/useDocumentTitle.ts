import { useEffect } from 'react'

const siteTitle = 'stArt'

export function useDocumentTitle(pageTitle?: string) {
  useEffect(() => {
    document.title = pageTitle
      ? `${pageTitle}｜${siteTitle}`
      : `${siteTitle}｜学生メディアアート展`
  }, [pageTitle])
}
