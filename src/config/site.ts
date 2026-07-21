import type { SiteConfig } from '../types/site'

export const siteConfig = {
  title: 'stArt',
  logo: {
    text: 'stArt',
  },
  event: {
    startDate: '2026-07-29',
    endDate: '2026-07-31',
    venueName: '筑波大学 春日エリア',
    venues: ['7A101', '7A202', '7A207'],
    organizer: 'GE72501 メディアアート',
  },
  statement: {
    short: 'はじまりの星たちが、わたしたちだけの星座をつくる。',
    full:
      '受講者ひとりひとりのメディアアート（art）作品は、千者万別の星（star）にあたります。はじまりの星たちは展示空間に配置され、わたしたちだけの『星座』をつくるでしょう。',
  },
  access: {
    summary: 'つくば駅から徒歩約10分',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2118.0466407728463!2d140.10467250745342!3d36.08615162220203!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60220c7a26c9d217%3A0x65d055c542420670!2z562R5rOi5aSn5a2mIOetkeazouOCreODo-ODs-ODkeOCueaYpeaXpeOCqOODquOCog!5e1!3m2!1sja!2sjp!4v1784222144037!5m2!1sja!2sjp',
    mapEmbedTitle: '筑波大学 7Aエリア周辺の地図',
  },
  socialAccounts: [{ label: 'X' }, { label: 'Instagram' }],
  navigation: [
    { label: 'コンセプト', type: 'section', target: 'concept' },
    { label: '開催情報', type: 'section', target: 'information' },
    { label: '作品', type: 'route', target: '/works' },
    { label: 'アクセス', type: 'section', target: 'access' },
  ],
  visualAssets: {},
} as const satisfies SiteConfig
