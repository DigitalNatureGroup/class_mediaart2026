# 実装タスク：学生メディアアート展「stArt」Webサイト

生成元：`.design/start-exhibition-site/DESIGN_BRIEF.md`  
情報設計：`.design/start-exhibition-site/INFORMATION_ARCHITECTURE.md`  
トークン：`.design/start-exhibition-site/DESIGN_TOKENS.css`  
作成日：2026-07-17

## 実装ルール

- 各タスクは構造、スタイル、操作、必要なテストをまとめた縦切りとして完了させる
- 完了したタスクだけを `[x]` にし、ブラウザまたはテストで確認してから次へ進む
- 既存コードはないため、すべてのアプリケーションコンポーネントは新規作成する
- 展示固有の情報、色、書体、画像パスをコンポーネントへ直接記述しない
- ユーザーの実装開始確認を得るまで、以下のタスクへ着手しない

## 基盤と最優先画面

- [x] **1. 設定から描画されるHeroを完成させる**：Vite + React + TypeScriptの最小構成、React Router、保守しやすいCSS、サイト設定型、日付フォーマッタを用意し、`Editorial Constellation` のトークンを実装用CSSへ移して、展示名、2026年7月29日〜31日、3会場、短いステートメントをHeroとして表示する。背景は点、細線、グリッドによるCSSプレースホルダーとし、背景アセットとロゴ画像を設定から差し替えられるようにする。`Zen Kaku Gothic New` と `Syne` を読み込み、`npm run build` が通る状態を完了条件とする。 _新規：App、AppRouter、HomePage、Hero、siteConfig、date formatter、global styles。再利用：DESIGN_TOKENS.css。_

- [x] **2. 共通ヘッダーとページ内移動を完成させる**：テキスト／画像ロゴ、5項目のデスクトップナビゲーション、HashRouter内の `?section=` を使うInPageLink、ScrollManagerを実装し、同一ページと別ページの両方から正しいセクションへ移動できるようにする。狭幅ではハンバーガーメニューへ変え、Escape、項目選択、ルート変更、外側操作で閉じ、`aria-expanded`、`aria-controls`、フォーカス移動・復帰をテストする。 _新規：SiteLayout、SiteHeader、SiteLogo、DesktopNavigation、MobileMenu、InPageLink、ScrollManager。依存：タスク1。_

## トップページ

- [x] **3. コンセプトと開催情報を完成させる**：Heroの下へコンセプト全文と開催情報を指定順で配置し、会期、`7A101 / 7A202 / 7A207`、主催を設定から表示する。開場時間は値がない場合にラベルごと生成せず、読みやすい行長、定義リスト、罫線と余白による編集的な階層を375px〜1440pxで確認する。 _新規：SectionHeading、ConceptSection、InformationSection。再利用：siteConfig、デザイントークン。依存：タスク1。_

- [x] **4. 作品データ層・プレビュー・一覧を完成させる**：Work型、公開状態、ローカルTypeScriptの明示的なダミーデータ6件程度、非同期のWorksRepository契約を実装する。トップには3〜4件のプレビュー、`/#/works` には全公開作品を表示し、作者名を出さず、画像がない作品にはidから安定して選ぶCSSプレースホルダーを使う。0件、読み込み中、取得失敗を別状態として扱い、コンポーネントがローカル配列を直接参照しないことをテストする。 _新規：Work型、worksデータ、WorksRepository、localWorksRepository、WorksPreview、WorksPage、WorkGrid、WorkItem、WorkMedia、EmptyState。依存：タスク1〜3。_

- [x] **5. アクセス・SNS・フッターを完成させる**：アクセス文と支給されたGoogle Maps埋め込みURLを設定から読み、`title`、遅延読み込み、referrer policyを備えたレスポンシブiframeを配置する。XとInstagramはURL未設定時にリンクを生成せず `準備中` と表示し、URL設定時だけ安全な外部リンクへ変える。主催とページ先頭への導線を含むフッターまでを追加し、トップページの7セクションを完成させる。 _新規：AccessSection、SocialSection、SiteFooter、ResponsiveMap。再利用：siteConfig、SectionHeading、InPageLink。依存：タスク2〜3。_

## 作品詳細と状態

- [x] **6. 作品個別ページを完成させる**：`/#/works/:slug` の動的ルートで作品名、作者名、メイン画像、追加画像、説明、使用技術、素材、メディウム、展示場所、作者リンクを項目ごとに条件表示する。一覧へ戻る導線と、公開作品だけを対象にした前後ナビゲーションを設け、最初・最後の存在しない側は表示しない。任意項目がほぼ空の作品と情報量の多い作品の双方で自然に見えることを確認する。 _新規：WorkDetailPage、WorkMetadata、WorkGallery、WorkPagination。再利用：WorksRepository、WorkMedia、EmptyState。依存：タスク4。_

- [x] **7. Not Foundとデータ境界の異常系を完成させる**：不正ルート、存在しないslug、非公開作品へのアクセスでは内容を漏らさず、トップまたは作品一覧へ復帰できるNot Found状態を表示する。長い作品名、長文説明、壊れた画像、空配列、空文字を正規化し、UIが破綻しないことを自動テストとブラウザで確認する。 _新規：NotFoundPage、データ正規化・エラー処理。再利用：EmptyState、WorksRepository。依存：タスク4〜6。_

## レスポンシブ・アクセシビリティ

- [x] **8. 375px・768px・1440pxのレイアウトを仕上げる**：各幅でHeroの文字組み、ページ余白、セクション間隔、作品グリッド、画像比率、作品詳細、Google Maps、ナビゲーションを再構成する。横方向の意図しないスクロール、極端な行長、単なる拡大縮小をなくし、スクリーンショットで差分を確認する。 _変更：全ページとスタイル。再利用：レイアウト・タイプ・間隔トークン。依存：タスク1〜7。_

- [x] **9. キーボード操作と基本アクセシビリティを仕上げる**：見出し階層、ランドマーク、ページタイトル、ルート変更後のフォーカス、画像の代替テキスト、外部リンク、iframe title、タップ領域、`:focus-visible`、色コントラストを確認する。Tab／Shift+Tab／Enter／Space／Escapeで主要フローを操作し、`prefers-reduced-motion` でスクロールと遷移を抑制する。可能な範囲で自動アクセシビリティ検査を追加する。 _変更：SiteHeader、ScrollManager、各ページ・共有コンポーネント。再利用：フォーカス・色・モーショントークン。依存：タスク2〜8。_

## 公開・運用・検証

- [x] **10. GitHub Pages自動デプロイを完成させる**：GitHub Actionsで依存関係の固定インストール、型チェック、ビルド、Pages artifactのアップロード、デプロイを行う。ViteのbaseはActions上でリポジトリ名から決め、ローカルでは `/` を使い、HashRouterのトップ、作品一覧、作品詳細がリポジトリ配下URLで成立することをビルド成果物とURL生成テストで確認する。 _新規：Vite base設定、GitHub Actions workflow。変更：package scripts。依存：タスク1、4、6。_

- [x] **11. 運用READMEを完成させる**：ローカル起動、型チェック・テスト・ビルド、GitHub Pages公開、開催情報の変更場所、開場時間の条件表示、背景素材とロゴの差し替え、作品の追加・公開状態・並び順、画像配置、CSV／JSON／Googleスプレッドシート用Repositoryへの将来移行を具体的なファイルパス付きで説明する。 _新規：README.md。再利用：実装済み設定・データ構造。依存：タスク1〜10。_

- [x] **12. 最終回帰確認を完了する**：開発サーバーを起動し、トップ内スクロール、別ページからのセクション移動、モバイルメニュー、一覧から詳細、詳細から一覧と前後作品、画像なし、0件、長文、不正slug、GitHub Pages相当のbaseを確認する。375px、768px、1440pxの各画面とキーボード操作をブラウザで検証し、全テスト、型チェック、lint、`npm run build` の結果を記録する。 _変更：検証で見つかった範囲内の修正。依存：タスク1〜11。_

## 最終検証記録

- 2026-07-17：`npm run lint`、`npm run typecheck`、`npm run test`（10件）成功
- 2026-07-17：Playwrightを375px・768px・1440pxで実行し、空間移動と星景の操作を含む31件成功・画面幅に該当しないモバイル専用2件は対象外
- 2026-07-17：axe-coreでWCAG 2.0／2.1 A・AA対象の重大な違反なし
- 2026-07-17：`/mediaartsite/` 配下の本番ビルドを配信し、同じE2E結果を確認
- 2026-07-17：375px・768px・1440pxの全ページスクリーンショットを目視確認

## フロー完了後

- [x] **デザインレビュー**：ブリーフとの一致、視覚階層、一貫性、レスポンシブ、アクセシビリティを12枚のスクリーンショットと自動検査で評価した。 _成果物：DESIGN_REVIEW.mdとscreenshots。依存：タスク12。_
