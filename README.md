# PreSketch（プレデッサン）🎨

> **2〜3歳向け プレデッサン・お絵かき学習 Web アプリケーション**  
> 「すべての絵は ○・△・□ の基本のかたちからできている」ゲシュタルト把握（形態認知）を、指でなぞって遊びながら体感する知育アプリです。

[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-brightgreen?style=flat-square&logo=github)](https://osakitetsuya.github.io/pre-sketch-app/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38b2ac?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🚀 公開 URL（今すぐあそぶ）

👉 **[https://osakitetsuya.github.io/pre-sketch-app/](https://osakitetsuya.github.io/pre-sketch-app/)**

* **最初から全15ステージを選択可能**です。お好きな絵から自由に遊べます。
* **iPad / iPhone (Safari)**: 共有ボタン ➔ **「ホーム画面に追加」** で全画面アプリとして起動できます。
* **Android (Chrome)**: メニュー ➔ **「ホーム画面に追加」** または **「アプリをインストール」** で全画面アプリとして起動できます。
* **PC (Chrome / Edge / Safari)**: マウスドラッグでそのまま遊べます。

---

## ✨ 特徴とこだわり

### 1. 2〜3歳児に寄り添った体験設計
* **最初から全ステージ開放**: 好きなモチーフをいつでも自由に選べます。
* **失敗体験を作らない**: ゲームオーバー、制限時間、減点、否定的な効果音は一切ありません。
* **達成感（見立て遊び）**: ガイド線をなぞり終えると自動で色が付き、紙吹雪とファンファーレで絵に命が吹き込まれます。
* **文字を使わない直感 UI**: すべてのボタンは 64×64px 以上の巨大な図形・アイコンで構成。
* **ペアレンタルゲート**: 設定やリセットなどの管理操作は「3秒長押し」で保護されています。

### 2. 独自のなぞり判定アルゴリズム
* **順序付きカーソル + 指数移動平均ゲート (`advanceTrace`)**:
  * 画面をぐしゃぐしゃに塗りつぶすだけではクリアできません。
  * 始点から終点近くまでしっかりなぞり切ることで完成し、達成感が得られます。
  * 子どもの逆走・指離し・多少の飛ばしには寛容に反応します。
* **正方形キャンバス**: 距離計算の歪みを防ぎ、縦持ち・横持ちどちらでも同じ精度で判定します。

### 3. 完全ゼロアセット＆軽量・高速
* 外部画像・音声ファイル・サーバー・データベースは一切使用していません。
* 図形・アニメーションは **HTML5 Canvas 2D** でリアルタイム描画。
* 効果音（クレヨンなぞり音、音階上昇チャイム、ファンファーレ）は **Web Audio API** によるリアルタイム周波数合成。

### 4. モバイル・ブラウザ最適化
* **マルチタッチ・パームリジェクション**: 最初に触れた指のみを追跡し、手のひらが画面に触れても誤動作しません。
* **Android Chrome 対策**: アドレスバー出入り時のリサイズ保留、余白スワイプでの誤リロード防止、戻るジェスチャによるアプリ誤離脱防止（`history.pushState`）。

---

## 📚 カリキュラム（全15ステージ）

| ステージ | テーマ | モチーフ | 演出種別 |
|---|---|---|---|
| **Stage 1-1** | たてせん | あめが ざーざー 🌧️ | モチーフ（雨粒ポップアップ） |
| **Stage 1-2** | よこせん | くるまが びゅーん 🚗 | モチーフ（ミニバン登場） |
| **Stage 1-3** | ぐるぐるせん | キャンディ ぺろぺろ 🍭 | モチーフ（キャンディ） |
| **Stage 2-1** | おおきなまる | あかい りんご 🍎 | 自動塗りつぶし |
| **Stage 2-2** | まるふたつ | ゆきだるま ⛄ | 自動塗りつぶし |
| **Stage 2-3** | まる＋せん | ぽかぽか たいよう ☀️ | 自動塗りつぶし |
| **Stage 3-1** | さんかく | おいしい おにぎり 🍙 | 自動塗りつぶし |
| **Stage 3-2** | しかく | プレゼント ばこ 🎁 | 自動塗りつぶし |
| **Stage 3-3** | さんかく＋しかく | とんがり おうち 🏠 | 自動塗りつぶし |
| **Stage 4-1** | △＋○ | アイスクリーム 🍦 | 自動塗りつぶし |
| **Stage 4-2** | □＋○＋○ | ぶーぶー くるま 🚙 | 自動塗りつぶし |
| **Stage 4-3** | ○＋△＋△ | かわいい ねこさん 🐱 | 自動塗りつぶし |
| **Stage 5-1** | ○＋○＋△ | かわいい ぺんぎん 🐧 | 自動塗りつぶし |
| **Stage 5-2** | ○＋○＋○＋○ | もりの くまさん 🐻 | 自動塗りつぶし |
| **Stage 5-3** | □＋△＋せん | かっこいい しんかんせん 🚅 | 自動塗りつぶし |

---

## 🛠 技術スタック

* **フロントエンド**: React 19, TypeScript, Vite
* **スタイリング**: Tailwind CSS v4
* **描画エンジン**: HTML5 Canvas 2D (Vanilla) - 3層レイヤー構成（ガイド層 / 描画層 / 演出層）
* **音声合成**: Web Audio API (シングルトン構成)
* **パーティクル・演出**: canvas-confetti, 独自 Canvas 粒子エンジン
* **アイコン**: lucide-react
* **永続化**: Web Storage (localStorage)
* **テスト**: Vitest
* **デプロイ**: GitHub Actions ➔ GitHub Pages

---

## 💻 ローカル開発手順

### 前提条件
* Node.js 20 以降
* npm 10 以降

### セットアップ
```bash
# リポジトリのクローン
git clone https://github.com/OsakiTetsuya/pre-sketch-app.git
cd pre-sketch-app

# 依存パッケージのインストール
npm install

# 開発サーバー起動（LAN 内の端末からも接続可能）
npm run dev -- --host
```

### テスト・ビルド
```bash
# 単体テスト実行
npm test

# プロダクションビルド
npm run build
```

---

## 📄 ライセンス

MIT License
