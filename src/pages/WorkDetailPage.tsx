import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../components/Works/EmptyState'
import { WorkGallery } from '../components/Works/WorkGallery'
import { WorkMedia } from '../components/Works/WorkMedia'
import { WorkMetadata } from '../components/Works/WorkMetadata'
import { WorkPagination } from '../components/Works/WorkPagination'
import { usePublishedWorks } from '../hooks/usePublishedWorks'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { NotFoundPage } from './NotFoundPage'
import detailStyles from '../components/Works/WorkDetail.module.css'
import pageStyles from './Pages.module.css'

export function WorkDetailPage() {
  const { slug = '' } = useParams()
  const state = usePublishedWorks()
  const title = state.works.find((item) => item.slug === slug)?.title
  useDocumentTitle(title ?? '作品')

  if (state.status === 'loading') {
    return (
      <main className={pageStyles.page} id="main-content" tabIndex={-1}>
        <EmptyState title="作品を読み込んでいます" />
      </main>
    )
  }

  if (state.status === 'error') {
    return (
      <main className={pageStyles.page} id="main-content" tabIndex={-1}>
        <EmptyState title="作品を表示できませんでした" />
      </main>
    )
  }

  const work = state.works.find((item) => item.slug === slug)

  if (!work) {
    return <NotFoundPage kind="work" />
  }

  const workIndex = state.works.findIndex((item) => item.id === work.id)

  return (
    <main className={pageStyles.page} id="main-content" tabIndex={-1}>
      <Link
        className={detailStyles.backLink}
        to="/works"
        state={{ routeDirection: 'backward' }}
      >
        ← 作品一覧へ戻る
      </Link>
      <header className={detailStyles.detailHeader}>
        <p className={detailStyles.workIndex} aria-hidden="true">
          {String(workIndex + 1).padStart(2, '0')}
        </p>
        <h1 className={detailStyles.workTitle}>{work.title}</h1>
        {work.artistName ? (
          <p className={detailStyles.artistName}>{work.artistName}</p>
        ) : null}
      </header>

      <WorkMedia
        workId={work.id}
        title={work.title}
        image={work.mainImage}
        variant="detail"
      />

      <div className={detailStyles.detailBody}>
        {work.description ? (
          <p className={detailStyles.description}>{work.description}</p>
        ) : null}
        <WorkMetadata work={work} />
        {work.artistLinks?.length ? (
          <section
            className={detailStyles.artistLinks}
            aria-labelledby="artist-links-title"
          >
            <h2 id="artist-links-title" className={detailStyles.subheading}>
              作者リンク
            </h2>
            <ul className={detailStyles.linkList}>
              {work.artistLinks.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${link.label}を新しいタブで開く`}
                  >
                    <span>{link.label}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <WorkGallery work={work} />
      </div>

      <WorkPagination works={state.works} currentSlug={work.slug} />
    </main>
  )
}
