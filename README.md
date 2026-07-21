# stArt 展示会Webサイト

筑波大学の授業「GE72501 メディアアート」で開催する、学生メディアアート展 `stArt` のWebサイトです。

トップページで開催情報と展示コンセプトを案内し、作品一覧と作品個別ページをHashRouterで提供します。開催情報、作品データ、色、書体、ロゴ、背景素材は表示コンポーネントから分離しています。

トップページは各セクションを一つの星として扱い、縦スクロールに合わせて背景の星座が横方向へ移動する構成です。右側（モバイルでは画面下部）の星ナビゲーションから、各セクションへ直接移動できます。

背景の星空は [src/components/InteractiveStarfield](src/components/InteractiveStarfield) のCanvasで生成しています。星は自律的に漂い、ポインター付近で一時的な星座をつくり、クリック位置から波紋が広がります。スクロール速度と現在セクションも星の動きへ反映されます。`prefers-reduced-motion` が有効な環境では連続アニメーションと波紋を停止し、スクロールスナップも弱めます。

## 必要な環境

- Node.js 24
- npm 11以降
- Playwrightの画面テストを行う場合はGoogle Chrome

## ローカルで起動する

```bash
npm install
npm run dev
```

表示された `http://localhost:5173/` をブラウザで開きます。

依存関係を `package-lock.json` と完全に一致させたい場合は、`npm install` の代わりに次を使います。

```bash
npm ci
```

## 検証とビルド

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

- `npm test`：日付表示、作品Repository、GitHub Pagesのbase計算を検証
- `npm run test:e2e`：Chromeを使い、375px、768px、1440pxで星ナビゲーション、作品遷移、Not Found、基本アクセシビリティを検証
- `npm run build`：`dist/`へproduction buildを生成

ビルド結果をローカルで確認する場合は次を使います。

```bash
npm run preview
```

## GitHub Pagesへ公開する

1. GitHub上にリポジトリを作成し、このプロジェクトを`main`ブランチへpushします。
2. リポジトリの「Settings → Pages」を開きます。
3. 「Build and deployment」のSourceで「GitHub Actions」を選択します。
4. `main`へのpush、またはActions画面からの手動実行で `.github/workflows/deploy.yml` が動作します。

ワークフローはlint、単体テスト、型チェックを含むビルドを実行し、`dist/`をGitHub Pagesへ公開します。

Viteの `base` は `vite.config.ts` で `GITHUB_REPOSITORY` から自動生成します。例えばリポジトリ名が `mediaartsite` なら、公開時のbaseは `/mediaartsite/`、ローカルでは `/` です。URLはHashRouterを使うため次の形式になります。

```text
https://ユーザー名.github.io/mediaartsite/#/
https://ユーザー名.github.io/mediaartsite/#/works
https://ユーザー名.github.io/mediaartsite/#/works/display-sample-01
```

## 開催情報を変更する

開催情報とトップページの文言は [src/config/site.ts](src/config/site.ts) に集約しています。

変更できる主な項目：

- `title`：展示タイトル
- `event.startDate`、`event.endDate`：`YYYY-MM-DD`形式の会期
- `event.venueName`：大学・エリア名
- `event.venues`：教室番号の配列
- `event.openingHours`：開場時間
- `event.organizer`：主催
- `statement.short`：Heroの短文
- `statement.full`：コンセプト全文
- `access.summary`：アクセス文
- `access.mapEmbedUrl`：Google Mapsの埋め込みURL
- `socialAccounts`：X、InstagramのURL
- `navigation`：ヘッダーのナビゲーション

`event.openingHours` は省略されている間、項目名を含めて表示されません。

SNSはフッター右下にアイコンで表示します。`url` がない間は「準備中」として読み上げられる非リンク表示になり、開設後は次のようにURLを追加するとリンクへ切り替わります。

```ts
socialAccounts: [
  { label: 'X', url: 'https://x.com/...' },
  { label: 'Instagram', url: 'https://www.instagram.com/...' },
]
```

## ロゴと背景素材を差し替える

素材は `public/assets/` に配置します。設定内のパスには先頭の `/` を付けないでください。GitHub Pagesのリポジトリbaseが自動で付与されます。

```ts
logo: {
  text: 'stArt',
  imageSrc: 'assets/logo.svg',
  imageAlt: 'stArt',
},
visualAssets: {
  heroBackgroundSrc: 'assets/hero-background.webp',
},
```

- ロゴ画像がない場合は `logo.text` が表示されます。
- 背景素材にはポスターから切り出した背景、図形、模様だけを使用してください。
- 展示名、会期、会場などの文字は画像へ焼き込まず、HTMLのまま保ちます。
- 背景の位置やサイズは [src/styles/tokens.css](src/styles/tokens.css) の `--hero-background-position` と `--hero-background-size` で調整できます。

## 色とフォントを変更する

色、余白、書体、画像比率、モーションは [src/styles/tokens.css](src/styles/tokens.css) に集約しています。初期版は暗色テーマを `index.html` の `data-theme="dark"` で指定しています。

- `--font-family-display`：タイトル・強調用のSyne
- `--font-family-body`：本文・UI用のIBM Plex Sans JP
- `--palette-*`：明色・暗色パレット
- `--color-*`：コンポーネントが参照する意味ベースの色
- `--section-space`、`--page-gutter`：余白
- `--duration-*`：操作時のモーション

Google Fontsの読み込み設定は `index.html` にあります。ポスターの書体へ変更する場合は、読み込み先と2つのフォントトークンを合わせて変更します。

## 作品を追加する

初期作品データは [src/data/works.ts](src/data/works.ts) にあります。現在のデータはすべて表示確認用のダミーです。

```ts
{
  id: 'stable-work-id',
  slug: 'url-friendly-slug',
  title: '作品名',
  artistName: '作者名',
  mainImage: {
    src: 'assets/works/example/main.webp',
    alt: '作品の外観を説明する代替テキスト',
  },
  additionalImages: [
    {
      src: 'assets/works/example/detail.webp',
      alt: '作品の細部を説明する代替テキスト',
      caption: '任意のキャプション',
    },
  ],
  description: '作品説明',
  technologies: ['使用技術'],
  materials: ['素材'],
  media: ['メディウム'],
  exhibitionLocation: '7A101',
  artistLinks: [
    { label: '作者Webサイト', url: 'https://example.com' },
  ],
  status: 'published',
  sortOrder: 1,
}
```

運用上の注意：

- `id` は一度公開した後に変更しないでください。
- `slug` は小文字英数字とハイフンを基本とし、重複させないでください。
- `status: 'draft'` は一覧・詳細・前後移動に表示されません。
- `sortOrder` の小さい作品から表示されます。
- 作者名などの任意項目がない場合、その項目全体が非表示になります。
- `mainImage` がない、または読み込みに失敗した場合はCSSプレースホルダーが表示されます。
- 一覧とトップの作品プレビューには作者名を表示しません。

## CSV・JSON・Googleスプレッドシートへ移行する

画面は作品配列を直接参照せず、[src/repositories/worksRepository.ts](src/repositories/worksRepository.ts) の契約を経由しています。

将来の移行手順：

1. CSV、JSON、またはGoogleスプレッドシートの公開データを読み込むRepositoryを新しく作ります。
2. 外部データの列を `Work` 型へ変換し、空文字・配列・公開状態を正規化します。
3. `getPublished()` と `getBySlug(slug)` を実装します。
4. [src/hooks/usePublishedWorks.ts](src/hooks/usePublishedWorks.ts) が参照するRepositoryを差し替えます。
5. CORS、取得失敗、キャッシュ、非公開データがレスポンスに含まれないことを確認します。

Googleスプレッドシートを使う場合は、公開CSVを直接読む方法か、Apps Scriptなどで必要な列だけをJSONとして返す方法が考えられます。学生の個人情報や下書きを含むシートを、そのままWeb公開しないでください。

## 主なディレクトリ

```text
.design/start-exhibition-site/  デザインブリーフ、情報設計、トークン案、タスク
.github/workflows/             GitHub Pages自動デプロイ
public/assets/                 ロゴ、背景、作品画像
src/components/                共通UIと各セクション
src/config/site.ts             開催情報とサイト設定
src/data/works.ts              ローカル作品データ
src/repositories/              作品データ取得境界
src/styles/tokens.css          色、書体、余白、モーション
tests/e2e/                     Playwright画面テスト
```
