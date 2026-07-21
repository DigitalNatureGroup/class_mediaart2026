import { Link } from 'react-router-dom'
import pageStyles from './Pages.module.css'
import styles from './NotFoundPage.module.css'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

interface NotFoundPageProps {
  kind?: 'page' | 'work'
}

export function NotFoundPage({ kind = 'page' }: NotFoundPageProps) {
  const isWork = kind === 'work'
  useDocumentTitle(isWork ? '作品が見つかりません' : 'ページが見つかりません')

  return (
    <main
      className={`${pageStyles.page} ${styles.notFound}`}
      id="main-content"
      tabIndex={-1}
    >
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>
        {isWork ? '作品が見つかりません' : 'ページが見つかりません'}
      </h1>
      <p className={styles.description}>
        {isWork
          ? 'この作品は存在しないか、現在は公開されていません。'
          : 'URLをご確認いただくか、トップページへお戻りください。'}
      </p>
      <div className={styles.links}>
        {isWork ? <Link to="/works">作品一覧へ戻る</Link> : null}
        <Link to="/">トップへ戻る</Link>
      </div>
    </main>
  )
}
