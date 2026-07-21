import type { SocialAccount } from '../../types/site'
import styles from './SiteFooter.module.css'

interface FooterSocialsProps {
  accounts: readonly SocialAccount[]
}

function SocialIcon({ label }: Pick<SocialAccount, 'label'>) {
  if (label === 'X') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.8-6.3L6.7 22H3.6l7.1-8.1L3 2h6.3l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.3 4.1H6.5l11.3 15.7Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle className={styles.iconFill} cx="17.4" cy="6.7" r="1" />
    </svg>
  )
}

export function FooterSocials({ accounts }: FooterSocialsProps) {
  return (
    <ul className={styles.socialList} aria-label="SNS">
      {accounts.map((account) => (
        <li key={account.label}>
          {account.url ? (
            <a
              className={styles.socialLink}
              href={account.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${account.label}を新しいタブで開く`}
            >
              <SocialIcon label={account.label} />
            </a>
          ) : (
            <span
              className={styles.socialPending}
              role="img"
              aria-label={`${account.label}（準備中）`}
              title={`${account.label}（準備中）`}
            >
              <SocialIcon label={account.label} />
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
