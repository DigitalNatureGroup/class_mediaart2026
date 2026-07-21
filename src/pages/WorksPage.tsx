import { EmptyState } from '../components/Works/EmptyState'
import { WorkGrid } from '../components/Works/WorkGrid'
import { usePublishedWorks } from '../hooks/usePublishedWorks'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './Pages.module.css'

export function WorksPage() {
  const state = usePublishedWorks()
  useDocumentTitle('作品一覧')

  return (
    <main className={styles.page} id="main-content" tabIndex={-1}>
      <header className={styles.pageHeader}>
        <p className={styles.pageIndex}>
          <span className={styles.pageIndexNumber}>01 —</span>
          <span>作品</span>
        </p>
        <h1 className={styles.pageTitle}>作品一覧</h1>
      </header>
      <div className={styles.pageContent}>
        {state.status === 'loading' ? (
          <EmptyState title="作品を読み込んでいます" />
        ) : null}
        {state.status === 'error' ? (
          <EmptyState title="作品を表示できませんでした" />
        ) : null}
        {state.status === 'success' && state.works.length === 0 ? (
          <EmptyState title="作品情報は準備中です" />
        ) : null}
        {state.status === 'success' && state.works.length > 0 ? (
          <WorkGrid works={state.works} />
        ) : null}
      </div>
    </main>
  )
}
