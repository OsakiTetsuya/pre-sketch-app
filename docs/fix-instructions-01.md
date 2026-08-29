# 修正指示書 01 — Step 3〜4 レビュー結果

- **対象コミット**: 未コミットのワーキングツリー（Step 1〜4 相当の実装）
- **作成日**: 2026-08-29
- **前提**: `docs/requirements.md` を読んでいること。本書は差分の指示であり、仕様の本体ではない

## この指示書の使い方

**A から G まで、記載順に修正すること。** A→C→D→E は同じファイルを触るため、順序を入れ替えると衝突する。

各項目の「検証」を実施し、**すべて満たしてから次へ進む**こと。
最後に第9節「全体の検証」を実施する。

修正が完了するまで **Step 5 以降には進まないこと**。

| ID | 内容 | 深刻度 | 主な対象ファイル |
|---|---|---|---|
| A | 完成時に描いた線が消える | **致命** | `src/App.tsx` |
| B | 直線ステージが塗りつぶしでクリアできる | **重大**（仕様変更） | `constants.ts` / `types/game.ts` / `geometry.ts` |
| C | 描画中のリサイズ保留が配線されていない | **重大** | `src/App.tsx` / `DrawingCanvas.tsx` |
| D | state updater の中で副作用を起こしている | **重大** | `DrawingCanvas.tsx` |
| E | 全ガイドパスに同じ点を流している | 中 | `DrawingCanvas.tsx` |
| F | `h-screen`（100vh）が残っている | 中 | `src/App.tsx` / `src/index.css` |
| G | 粒子レイヤーの rAF ループが毎回張り直される | 中 | `ParticleCanvas.tsx` |

---

## A. 完成時に描いた線が消える 【致命】

### 現象

`isCompleted` が `false → true` になると `DrawingCanvas` の `key` が変わり、React がコンポーネントを破棄して作り直す。
その結果 `strokesRef.current` が空になり、**子どもが描いた線がすべて消えた状態で完成演出が走る。**
`traceStates` も初期化されるため、ガイド線の進捗表示も消える。

このアプリの達成感（第10.3節）の中核が機能していない。

### 修正

`src/App.tsx`

```diff
- <DrawingCanvas key={`${stage.id}-${isCompleted}`} ... />
+ <DrawingCanvas key={stage.id} ... />
```

ステージ切り替え時のリセットは `DrawingCanvas` 内の `useEffect(..., [stage])` がすでに担当しているため、
`key` に `isCompleted` を含める必要はない。

### 「やりなおし」ボタンへの影響

`key` から `isCompleted` を外すと、`handleReset` が `isCompleted` を false に戻しても
ストロークが消えなくなる。**`DrawingCanvas` にリセット手段を明示的に用意すること。**

`resetSignal: number` という prop を追加し、`App` 側で `handleReset` のたびに加算する。
`DrawingCanvas` 側は `useEffect(..., [resetSignal])` でストロークと `traceStates` を初期化する。

```tsx
// App.tsx
const [resetSignal, setResetSignal] = useState(0);
const handleReset = () => {
  setIsCompleted(false);
  setProgress(0);
  setResetSignal((n) => n + 1);
};
```

### 検証

1. ステージを1つなぞり切る → **描いた線が残ったまま**完成演出が走ること
2. 完成後に「やりなおし」→ 線が消えて最初からなぞれること
3. 「つぎへ」でステージを移動 → 前のステージの線が残っていないこと

---

## B. 直線ステージが塗りつぶしでクリアできる 【重大・仕様変更】

### 現象

`docs/requirements.md` 第17章 DoD 3番「画面をランダムに塗りつぶしてもクリアできない」が、
**直線を使うステージ（1-1 たてせん / 1-2 よこせん / 2-3 の光線4本）で満たされていない。**

実測値（ランダムウォークによる塗りつぶしのシミュレーション）:

| 対象 | 入力点数 | 現在の実装 | 順序を見ない素朴な実装 |
|---|---|---|---|
| 直線 | 1000 | **71.4%（クリア成立）** | 71.4% |
| 直線 | 3000 | 71.4% | 71.4% |
| 円 | 3000 | 9.5% | 90.5% |
| 円 | 10000 | 73.8%（クリア成立） | 100% |

円では順序判定が有効に働いているが、**直線では順序判定の効果がゼロ**である。
直線上のチェックポイントは一列に並んでいるため、指が線の上を往復すれば必然的に順序どおり通過するため。

**これは実装のミスではなく、`docs/requirements.md` 第6.3節のアルゴリズム自体の限界である。**

### 修正方針：on-path 率のゲートを追加する

進行度とは別に「**入力点がガイド上にあった割合**」を指数移動平均で持ち、
完成条件を `進行度 >= 0.7` かつ `on-path率 >= 0.5` の二つにする。

実測した分離は明確である。

| 入力の種類 | on-path 率 |
|---|---|
| ぐしゃぐしゃ描き（直線） | 5.9 〜 15.3% |
| ぐしゃぐしゃ描き（円） | 23.0 〜 30.3% |
| なぞり σ=0.02（ていねい） | 100% |
| なぞり σ=0.04 | 89.3 〜 96.4% |
| なぞり σ=0.06 | 76.2 〜 87.5% |
| **なぞり σ=0.08（かなり雑）** | **66.7 〜 71.4%** |

しきい値 0.5 は、塗りつぶしの最大 30.3% と、雑ななぞりの最小 66.7% のほぼ中間にある。

**指数移動平均（累積平均ではない）を使うこと。** 累積平均だと
「最初にさんざん塗りつぶした子が、その後まじめになぞっても率が回復せず永久にクリアできない」
という失敗状態が生まれ、第2章 決定7（失敗体験を作らない）に反する。

### 修正 B-1: `src/constants.ts`

```diff
  export const COMPLETION_THRESHOLD = 0.7;  // クリア閾値
+ export const ON_PATH_THRESHOLD = 0.5;     // ガイド上に居た割合の下限（塗りつぶし対策）
+ export const ON_PATH_ALPHA = 0.02;        // on-path 率の指数移動平均の係数
```

### 修正 B-2: `src/types/game.ts`

```diff
  export type TraceState = {
    cursor: number;
    passed: boolean[];
    started: boolean;
+   /** 入力点がガイド上にあった割合の指数移動平均。初期値 1.0 */
+   onPathRate: number;
  };
```

### 修正 B-3: `src/utils/geometry.ts`

```ts
export const createTraceState = (n: number): TraceState => ({
  cursor: 0,
  passed: new Array(n).fill(false),
  started: false,
  onPathRate: 1,          // 追加
});

export const advanceTrace = (
  state: TraceState,
  checkpoints: Point[],
  p: Point,
  tolerance = DEFAULT_TOLERANCE
): TraceState => {
  if (checkpoints.length === 0) return state;

  // --- 開始判定: 始点付近に触れるまで何も進めない ---
  if (!state.started) {
    if (dist(p, checkpoints[0]) > tolerance) return state;
    return advanceTrace({ ...state, started: true }, checkpoints, p, tolerance);
  }

  // --- on-path 率の更新（開始以降のすべての点が対象） ---
  // パス全体のどのチェックポイントかに近ければ on-path とみなす。
  // 「カーソル近傍のみ」にすると、仕様で許容している逆走が off-path 扱いになってしまう。
  const onPath = checkpoints.some((c) => dist(p, c) <= tolerance) ? 1 : 0;
  const counted: TraceState = {
    ...state,
    onPathRate: state.onPathRate * (1 - ON_PATH_ALPHA) + onPath * ON_PATH_ALPHA,
  };

  if (counted.cursor >= checkpoints.length) return counted;

  // --- 進行判定: cursor から LOOKAHEAD 先までを順に見る ---
  const end = Math.min(counted.cursor + LOOKAHEAD, checkpoints.length - 1);
  for (let i = counted.cursor; i <= end; i++) {
    if (dist(p, checkpoints[i]) <= tolerance) {
      const passed = [...counted.passed];
      for (let j = counted.cursor; j <= i; j++) passed[j] = true;
      return { ...counted, passed, cursor: i + 1 };
    }
  }
  return counted;
};

/** 1つのパスが完了しているか（進行度と on-path 率の両方を満たすこと） */
export const isPathComplete = (
  s: TraceState,
  threshold = COMPLETION_THRESHOLD
): boolean => traceProgress(s) >= threshold && s.onPathRate >= ON_PATH_THRESHOLD;

export const isStageComplete = (
  states: TraceState[],
  threshold = COMPLETION_THRESHOLD
): boolean => states.length > 0 && states.every((s) => isPathComplete(s, threshold));
```

`constants.ts` からの import に `ON_PATH_THRESHOLD` と `ON_PATH_ALPHA` を追加すること。

### 修正 B-4: `TraceState` を手で組み立てている箇所を `createTraceState` に置き換える

`src/components/canvas/DrawingCanvas.tsx` の**2箇所**（`useState` の初期化と `useEffect([stage])` の中）で
`{ cursor: 0, passed: [...], started: false }` を直接書いている。`onPathRate` が欠けるため必ず置き換えること。

```diff
- stage.guidePaths.map((p) => ({ cursor: 0, passed: new Array(p.points.length).fill(false), started: false }))
+ stage.guidePaths.map((p) => createTraceState(p.points.length))
```

### 修正 B-5: テストを追加する

`src/utils/__tests__/geometry.test.ts` の case 3 は、**現在の実装と素朴な実装を区別できていない。**
パスから遠い4点しか試しておらず、順序判定の有無にかかわらず 0% になるため。

以下を追加すること。

```ts
it('case 6: ぐしゃぐしゃ描きではクリアできない（DoD #3）', () => {
  // 決定論的な擬似乱数でランダムウォークを生成する
  let s = 42;
  const rnd = () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let state = createTraceState(line.length);
  let x = 0.5, y = 0.5;
  for (let i = 0; i < 3000; i++) {
    const a = rnd() * Math.PI * 2;
    x = Math.min(1, Math.max(0, x + Math.cos(a) * 0.03));
    y = Math.min(1, Math.max(0, y + Math.sin(a) * 0.03));
    state = advanceTrace(state, line, { x, y }, tolerance);
  }
  // 進行度は上がってもよいが、on-path 率が低いので完了してはならない
  expect(isPathComplete(state)).toBe(false);
});

it('case 7: ていねいになぞればクリアできる（甘口判定の維持）', () => {
  let state = createTraceState(line.length);
  for (const pt of line) {
    // 各チェックポイントで少し揺れながら通過する
    state = advanceTrace(state, line, { x: pt.x, y: pt.y + 0.02 }, tolerance);
    state = advanceTrace(state, line, { x: pt.x, y: pt.y - 0.02 }, tolerance);
  }
  expect(isPathComplete(state)).toBe(true);
});
```

### 検証

- `npx vitest run` が全件パスすること（既存8件 + 追加2件）
- ブラウザで Stage 1-2（よこせん）を開き、**線を無視して画面をぐるぐる塗りつぶしてもクリアしないこと**
- 同じステージを素直になぞればクリアすること

---

## C. 描画中のリサイズ保留が配線されていない 【重大】

### 現象

`useCanvasSize` は `isDrawingRef` を受け取る設計だが、`App.tsx` が渡していない。

```ts
if (isDrawingRef?.current) {   // undefined → 常に falsy
  pendingResizeRef.current = true;
  return;                      // ← 到達しない
}
```

`pendingResizeRef` は永久に `false` のままで、`onPointerRelease()` は何もしない。
第5.4節の対策（落とし穴 #7）が**まるごと死んでいる**。
Android Chrome でアドレスバーが出入りすると、描画中でも 150ms 後にキャンバスが作り直される。

### 修正

`App.tsx` で ref を1つ作り、`useCanvasSize` と `DrawingCanvas` の両方に渡す。

```tsx
// App.tsx
const isDrawingRef = useRef(false);
const { side, dpr, onPointerRelease } = useCanvasSize({
  headerHeight: 80,
  padding: 16,
  isDrawingRef,          // 追加
});

<DrawingCanvas
  isDrawingRef={isDrawingRef}   // 追加
  ...
/>
```

`DrawingCanvas` 側は prop に `isDrawingRef?: React.RefObject<boolean>` を追加し、
ポインタの開始と終了で更新する。

```tsx
// handlePointerDown の中
activeId.current = e.pointerId;
if (isDrawingRef) isDrawingRef.current = true;      // 追加

// handlePointerUpOrCancel の中
activeId.current = null;
if (isDrawingRef) isDrawingRef.current = false;     // 追加（onPointerRelease を呼ぶ前に）
```

**順序が重要。** `isDrawingRef.current = false` を `onPointerRelease()` より**前**に置くこと。
逆にすると保留していたリサイズが適用されない。

### 検証

- デスクトップのブラウザで、線を描いている最中にウィンドウをリサイズする
  → **指を離すまでキャンバスのサイズが変わらず、描いた線も消えないこと**
- 指を離した瞬間に新しいサイズへ切り替わること

---

## D. state updater の中で副作用を起こしている 【重大】

### 現象

`DrawingCanvas.tsx` の `processPoint` が、`setTraceStates` の updater 関数の中で
`setLastCheckpointPos` / `setCheckpointTimestamp` / `onCheckpointHit` / `onTraceUpdate` / `onComplete` を呼んでいる。

updater 関数は純粋でなければならない。`src/main.tsx` で **StrictMode が有効**であり、
StrictMode は不純な updater を検出するために **updater を2回実行する**。

現時点では見た目に影響が出にくいが、**Step 6 で音を接続した瞬間に
「チェックポイント音が毎回2回鳴る」という形で表面化する。**
原因が音のコードにあるように見えるため、デバッグが長引きやすい。

### 修正

`traceStates` の真の値を `useRef` に持ち、`setState` には**計算済みの値を渡すだけ**にする。
副作用は updater の外で実行する。

```tsx
const traceStatesRef = useRef<TraceState[]>([]);
const [traceStates, setTraceStates] = useState<TraceState[]>([]);

// 初期化とステージ切替（B-4 と統合すること）
useEffect(() => {
  const init = stage.guidePaths.map((p) => createTraceState(p.points.length));
  traceStatesRef.current = init;
  setTraceStates(init);
  strokesRef.current = [];
  currentStrokeRef.current = [];
  redrawAllStrokes();
}, [stage, resetSignal]);

const processPoint = (p: Point) => {
  if (isCompleted) return;
  onStrokeMove?.();

  const prev = traceStatesRef.current;
  const idx = activePathIdxRef.current;        // E で導入する
  if (idx < 0 || idx >= prev.length) return;

  const path = stage.guidePaths[idx];
  const tolerance = path.toleranceRadius ?? DEFAULT_TOLERANCE;
  const nextState = advanceTrace(prev[idx], path.points, p, tolerance);

  // 参照が変わらない＝何も起きていない
  if (nextState === prev[idx]) return;

  const next = [...prev];
  next[idx] = nextState;
  traceStatesRef.current = next;
  setTraceStates(next);                        // 値を渡すだけ。updater は使わない

  // --- ここから副作用（updater の外） ---
  if (nextState.cursor > prev[idx].cursor) {
    const hit = path.points[nextState.cursor - 1];
    setLastCheckpointPos(hit);
    setCheckpointTimestamp(Date.now());
    onCheckpointHit?.(hit, nextState.cursor - 1);
  }

  const totalPassed = next.reduce((sum, s) => sum + s.passed.filter(Boolean).length, 0);
  const totalPoints = stage.guidePaths.reduce((sum, gp) => sum + gp.points.length, 0);
  onTraceUpdate?.(next, totalPassed / Math.max(1, totalPoints));

  if (isStageComplete(next)) onComplete?.();
};
```

`advanceTrace` は変化がないとき `state` をそのまま返すため、`nextState === prev[idx]` の
参照比較で「何も起きていない」を判定できる。

### 検証

- ブラウザのコンソールに React の警告が出ないこと
- `onCheckpointHit` に `console.count('checkpoint')` を仕込み、チェックポイント1つの通過で
  **カウントが1つだけ増えること**（2つ増えたら修正できていない）。確認後は削除する

---

## E. 全ガイドパスに同じ点を流している 【中】

### 現象

`docs/requirements.md` 第6.5節は
「`pointerdown` の位置から、未完成パスのうち始点が最も近いものを判定対象として選ぶ」
と定めているが、実装は毎点をすべてのパスに適用している。

図形が重なるステージで、なぞっていないパスが勝手に進む。実測値:

| ステージ | なぞった対象 | 巻き添えで進む量 |
|---|---|---|
| 3-3 おうち | 屋根 | 壁が 5.1%（実害なし） |
| **4-3 ねこさん** | 顔 | **左耳が 60.0%** |

ねこの耳は顔の円をなぞるだけで 60% 進む。閾値 70% なので、**耳をほとんど描かずにクリアできる。**

### 修正

`pointerdown` の時点で対象パスを1つ選び、そのストロークの間はそのパスだけを進める。

```tsx
const activePathIdxRef = useRef<number>(-1);

/** 未完成パスのうち、指の位置に最も近いものを選ぶ */
const pickPath = (p: Point): number => {
  const states = traceStatesRef.current;
  let best = -1;
  let bestD = Infinity;
  stage.guidePaths.forEach((path, i) => {
    const st = states[i];
    if (!st || isPathComplete(st)) return;              // 完成済みは対象外
    // 開始済みなら現在のカーソル位置、未開始なら始点を基準に測る
    const anchor = st.started
      ? path.points[Math.min(st.cursor, path.points.length - 1)]
      : path.points[0];
    const d = dist(p, anchor);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
};

// handlePointerDown の中、processPoint を呼ぶ前に
activePathIdxRef.current = pickPath(normPt);
```

`st.started` のときにカーソル位置を基準にするのは、**指を離して再開する動作を素直に扱うため**である
（第6.4節「指を離してよい」）。

### 検証

- Stage 4-3（ねこさん）で顔の円だけをなぞる → **耳の進捗が 0% のままであること**
- Stage 1-1（たてせん）で3本の線を順に描ける（どの線から始めてもよい）こと
- 1本描いて指を離し、その線の途中から再開できること

---

## F. `h-screen`（100vh）が残っている 【中】

### 現象

`docs/requirements.md` 第5.4節・落とし穴 #6 で `100vh` を禁止しているが、`App.tsx` のルート要素が
Tailwind の `h-screen`（= `100vh`）を使っている。`index.css` 側は `100dvh` になっているため不整合。
Android Chrome でアドレスバーの高さ分ずれる。

### 修正

`src/App.tsx`

```diff
- <div className="w-screen h-screen flex flex-col ...">
+ <div className="w-full h-dvh flex flex-col ...">
```

`src/index.css`

```diff
  #root {
    height: 100dvh;
-   width: 100vw;
+   width: 100%;
  }
```

`100vw` はスクロールバーの幅を含むため、デスクトップで横方向にはみ出す原因になる。

### 検証

- Android Chrome で、ページを上下にスワイプしてアドレスバーを出入りさせても
  **レイアウトが跳ねず、キャンバスがはみ出さないこと**
- デスクトップで横スクロールバーが出ないこと

---

## G. 粒子レイヤーの rAF ループが毎回張り直される 【中】

### 現象

`ParticleCanvas.tsx` の描画ループの `useEffect` 依存配列に
`traceStates` と `currentPointerPos` が入っている。どちらもポインタ移動のたびに変わるため、
**指を動かすたびに `cancelAnimationFrame` → `requestAnimationFrame` が実行される。**

DoD 20番（Android 実機で 60fps 維持）に対する直接のリスク。

### 修正

高頻度に変わる props を ref に写し、ループ本体は ref を読む。依存配列は `[side, dpr]` だけにする。

```tsx
// 毎フレーム読む値を ref に保持する
const propsRef = useRef({ stage, traceStates, currentPointerPos, isDrawing, isCompleted });
propsRef.current = { stage, traceStates, currentPointerPos, isDrawing, isCompleted };

useEffect(() => {
  let animId: number;
  const render = (now: number) => {
    const { stage, traceStates, currentPointerPos, isDrawing, isCompleted } = propsRef.current;
    // ... 既存の描画処理をそのまま（参照先を propsRef 経由に変えるだけ）
    animId = requestAnimationFrame(render);
  };
  animId = requestAnimationFrame(render);
  return () => cancelAnimationFrame(animId);
}, [side, dpr]);        // ← 高頻度に変わるものを外す
```

`propsRef.current = {...}` をレンダー本体に直接書くのは React の推奨パターンではないが、
**canvas の rAF ループに最新値を渡す用途では実務上の定石**である。
気になる場合は `useEffect(() => { propsRef.current = {...}; })`（依存配列なし）に置き換えてよい。

あわせて `DrawingCanvas.redrawAllStrokes` が毎移動で全ストロークを描き直している点も、
線が長くなると重くなる。**本修正指示では変更しないが、Step 7 の実機確認で 60fps を割る場合は
「確定したストロークを別の下地キャンバスに焼き込み、描画中のストロークだけ毎回描く」方式に変えること。**

### 検証

- Chrome DevTools の Performance でなぞり中を記録し、フレーム落ちがないこと
- `chrome://inspect` で Android 実機を接続し、なぞり中に 60fps を維持すること

---

## 9. 全体の検証

A〜G をすべて適用したあと、以下を順に実施すること。

```bash
npx tsc --noEmit     # エラー 0
npx vitest run       # 既存8件 + 追加2件 = 10件すべてパス
npm run build        # 成功
npm run dev -- --host
```

### 手で確認する項目

1. ステージをなぞり切ると、**描いた線が残ったまま**完成演出が走る（A）
2. 画面をぐるぐる塗りつぶしても**クリアしない**（B）
3. 素直になぞればクリアする（B）
4. 描画中にウィンドウをリサイズしても、指を離すまでキャンバスが変わらない（C）
5. コンソールに React の警告が出ない（D）
6. Stage 4-3 で顔だけなぞっても耳の進捗が 0% のまま（E）
7. デスクトップで横スクロールバーが出ない（F）
8. なぞり中にフレーム落ちがない（G）

### 実機で確認する項目（Android Chrome）

要件定義書 第17章の 12〜14 番。**マウスでも iPad でも再現しないため、Android 実機が必須。**

- キャンバス外の余白を下に引っぱってもリロードされない
- アドレスバーを出入りさせながら描いても線が消えない
- 戻るジェスチャでアプリから離脱しない（**第8.4節の `history.pushState` は未実装。Step 5 で実装する**）

---

## 10. この修正では扱わないもの

以下は既知だが、本指示書の範囲外である。Step 5・6 で対応する。

| 項目 | 対応時期 |
|---|---|
| 完成時バウンドが `scale-105`（仕様は 1.15） | Step 6 |
| ヘッダーボタンが `min-h-[48px]`（仕様は 64px 以上） | Step 5（本UIは暫定のため） |
| `storage.ts` が未使用 | Step 5 |
| `history.pushState` による戻る操作の吸収（第8.4節） | Step 5 |
| 音声・紙吹雪・ペアレンタルゲート | Step 6 |
| favicon が `/vite.svg` を参照している | Step 8（GitHub Pages 公開時） |
