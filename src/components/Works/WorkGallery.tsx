import type { Work } from '../../types/work'
import { WorkMedia } from './WorkMedia'
import styles from './WorkDetail.module.css'

interface WorkGalleryProps {
  work: Work
}

export function WorkGallery({ work }: WorkGalleryProps) {
  if (!work.additionalImages?.length) {
    return null
  }

  return (
    <section className={styles.gallery} aria-labelledby="gallery-title">
      <h2 id="gallery-title" className={styles.subheading}>
        作品画像
      </h2>
      <div className={styles.galleryGrid}>
        {work.additionalImages.map((image, index) => (
          <WorkMedia
            key={`${image.src}-${index}`}
            workId={`${work.id}-gallery-${index}`}
            title={work.title}
            image={image}
            variant="gallery"
          />
        ))}
      </div>
    </section>
  )
}
