import { useEffect, useState } from 'react'
import { localWorksRepository } from '../repositories/localWorksRepository'
import type { Work } from '../types/work'

type WorksState =
  | { status: 'loading'; works: Work[]; error: null }
  | { status: 'success'; works: Work[]; error: null }
  | { status: 'error'; works: Work[]; error: Error }

export function usePublishedWorks() {
  const [state, setState] = useState<WorksState>({
    status: 'loading',
    works: [],
    error: null,
  })

  useEffect(() => {
    let isCurrent = true

    localWorksRepository
      .getPublished()
      .then((publishedWorks) => {
        if (isCurrent) {
          setState({ status: 'success', works: publishedWorks, error: null })
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setState({
            status: 'error',
            works: [],
            error: error instanceof Error ? error : new Error('作品を取得できませんでした'),
          })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  return state
}
