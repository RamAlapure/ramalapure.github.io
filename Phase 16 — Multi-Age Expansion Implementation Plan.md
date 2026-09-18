# Phase 16 — Multi-Age Expansion (Nursery → Junior KG → Senior KG → Grade 1)

> Implementation plan derived from a code review of the shipped `/learn/` app (`src/learn/`, ~11.3k LOC, 88 nursery activities across 7 subject packs).
> **Headline recommendation: do not start Junior KG content first.** The current engine is nursery-hardwired in ~10 places. Ship a **Phase 16.0 "level foundations"** refactor first — it is roughly one session of work and it removes the cost multiplier from every grade that follows.

---

## 1. Where the code stands today

| Area | Today | Phase 16 impact |
|---|---|---|
| Content loading | `src/learn/content/load.ts` globs `./nursery/**/activities.json` only; everything is eager-imported into the client bundle | Hard blocker — no second level can exist |
| Level model | `AgeGroup = 'nursery' \| 'class1'` in `src/learn/storage/root-store.ts`; unknown values are silently coerced to `'nursery'` | Hard blocker + data-loss path |
| Level → content link | None. `ageGroup` is authored on every activity but never used to filter; it only grants a `+1` difficulty boost in `src/learn/adaptive/engine.ts` | Hard blocker |
| Subjects | Closed union `SubjectId` duplicated in ≥6 places (`app/types.ts`, `curriculum/subjects.ts`, `content/validate.ts`, `rewards/badges.ts`, `locales/*.json` × 2 sections, `LearnSessions.bySubject`) | Adding ~9 subjects means ~54 edits |
| Activity types | 7 types hard-coded in 3 unions + a `switch` in `ActivityEngine.tsx`, `compile.ts`, `localize.ts` | JKG/SKG need ~8 new types |
| Tracing | 22 hand-written point-array patterns (`tracing/paths.ts`, `paths-devanagari.ts`) | SKG writing (a–z, 0–100, words) cannot be hand-authored |
| Progress | Flat `subject:skill` mastery, no prerequisites, no level concept | No "ready to move up" signal |
| Rewards | `badges: SubjectId[]`, `sessions.bySubject` — not level-scoped | A nursery badge would block the JKG badge |
| i18n | 88 activity keys × en/hi/mr, plus bespoke hi/mr branching in `localize.ts`; loader **throws** if a pack fails validation | 3× cost per activity; reading/word content in Devanagari is a much larger lift |
| Tests | **None.** No test runner, no `npm test`; only `npm run validate-content` at build | Tripling content with zero regression safety |

---

## 2. Phase 16.0 — Level foundations (do this before any new content)

Eight changes, all mechanical, all shippable independently.

### 16.0.1 Make "level" a first-class data dimension

```ts
// src/learn/curriculum/levels.ts (new)
export const LEVELS = ['nursery', 'jkg', 'skg', 'grade1'] as const;
export type LevelId = (typeof LEVELS)[number];
export const LEVEL_ORDER: Record<LevelId, number> = { nursery: 0, jkg: 1, skg: 2, grade1: 3 };
```

- Replace `AgeGroup` with `LevelId`; keep `ageGroup` as the persisted field name to avoid a storage migration of key names.
- Migrate stored profiles: `'class1' → 'grade1'`, unknown → `'nursery'`. The current normalizer (`root-store.ts:124`, `:153`) silently collapses anything unrecognised — extend it to a lookup so the four new values survive a reload. Bump `learn-store-v3` → `v4` only if the shape changes; a value remap does not need it.
- Content moves to `src/learn/content/<level>/<subject>/activities.json`; `load.ts` globs `./*/**/activities.json` and keys packs by the directory-derived level, not the JSON field (directory is the source of truth; validation asserts the field matches).

### 16.0.2 Level-aware curriculum API

`src/learn/curriculum/nursery/index.ts` should become `src/learn/curriculum/activities.ts`:

```ts
getActivities(level: LevelId, language): Activity[]
getActivitiesForSubject(level, subjectId, language): Activity[]
getActivityCount(level, subjectId): number
```

Callers to update: `curriculum/session.ts`, `adaptive/engine.ts` (incl. `pickMicroTracing`), `components/HomeScreen.tsx`, `components/ParentScreen.tsx`. Level comes from `store.profile.ageGroup` — thread it through `buildAdaptiveSubjectSession` rather than reading the store in three places.

**Cross-level practice rule (decide now):** default session pool = current level, plus any skill from the previous level whose mastery is `needs-practice`. This is a few lines in the adaptive engine and prevents a child who moves up from losing weak-skill remediation.

### 16.0.3 Single subject registry

One definition replaces six lists:

```ts
// src/learn/curriculum/subjects.ts
export const SUBJECTS = [
  { id: 'alphabet', emoji: '🔤', levels: ['nursery', 'jkg'], badgeEmoji: '🔤' },
  { id: 'phonics',  emoji: '🗣️', levels: ['jkg', 'skg'],     badgeEmoji: '🗣️' },
  // …
] as const satisfies readonly SubjectDef[];
export type SubjectId = (typeof SUBJECTS)[number]['id'];
```

`badgesBySubject` and `validate.ts`'s `SUBJECT_IDS` derive from it; labels come from the locale catalog only. `HomeScreen` renders `SUBJECTS.filter(s => s.levels.includes(level))`.

### 16.0.4 Renderer + compiler registry instead of switches

Replace the `switch` in `ActivityEngine.tsx`, `compile.ts` and `localize.ts` with one registry per activity type so that adding a type is a single new folder:

```
src/learn/activities/types/<TYPE>/
  renderer.tsx   // React component
  compile.ts     // authoring JSON → runtime Activity
  validate.ts    // type-specific authoring checks
  index.ts       // registry entry
```

`ActivityEngine` becomes `const R = registry[activity.type].renderer`. Lazy-load renderers (`React.lazy`) so SKG clock/money widgets don't ship to a nursery child.

### 16.0.5 Tests + CI (prerequisite, not polish)

Add `vitest` and a `npm test` script; CI runs `test` + `validate-content` + `astro build`. Minimum bar before content work starts:

- `content/compile` and `content/validate` — one case per activity type, incl. failure cases
- `adaptive/engine` — focus-skill selection, freshness, level filtering, cross-level remediation
- `progress/mastery`, `rewards/stars`, `storage/root-store` migration (v2 → v3 → level remap)
- A content lint asserting: every activity's `skill` has a translation in all three locales, every `instructionKey` exists in all three locales, ids unique across levels, `difficulty ∈ 1..4`, subject is valid for the declared level.

### 16.0.6 Generated content, not hand-written JSON

Nursery's 88 activities were tractable by hand. JKG+SKG+Grade 1 is ~500+ and much of it is formulaic. Add deterministic generators under `scripts/generate/` that emit the same authoring JSON (committed, reviewable, diffable):

- number sequence & counting 1–20 / 1–100
- addition/subtraction fact families within 10 / 20
- clock times (o'clock, half past, quarter)
- money combinations (₹1/2/5/10 coins)
- pattern sequences (ABAB, AABB, ABC, growing)

Hand-author only what needs editorial judgement: vocabulary, reading words, phonics sets, logical reasoning.

### 16.0.7 Bundle and load strategy

`load.ts` currently uses `import.meta.glob(..., { eager: true })` **and** re-runs full validation in the browser on every load. With four levels × three languages this becomes the biggest page-weight regression risk in the phase.

- Validation stays build-time (`npm run validate-content`); the runtime path trusts the compiled output and only guards with a cheap shape check behind `import.meta.env.DEV`.
- Switch to per-level lazy `import()` keyed by the active profile's level; keep nursery eager only if measurement says the extra request hurts.
- Track `/learn/` JS size in CI with a size budget (fail over, say, +25 % vs. main).

### 16.0.8 Level-scope the progress, rewards and parent surfaces

- `badges: SubjectId[]` → `badges: string[]` of `` `${level}:${subject}` `` (migrate existing entries to `nursery:*`).
- `sessions.bySubject` → `bySubject[level][subject]`.
- `ParentDashboard`: level filter, per-level totals, and the promotion signal below.

---

## 3. Skill graph and promotion (the part Phase 16 actually needs new)

Phase 16's value is the **ladder**, not just more activities. Add an explicit skill graph so progression is data, not vibes:

```ts
interface SkillDef {
  id: string;              // 'addition-within-10'
  subjectId: SubjectId;
  level: LevelId;
  prerequisites: string[]; // ['count-objects', 'number-sequence-20']
  strand: string;          // 'number', 'literacy', 'reasoning', 'writing'
}
```

- Adaptive engine gates an activity whose prerequisite skills are below `learning` (< 50 %), so a child never meets `addition-within-10` before counting is solid.
- **Promotion rule (deterministic, no LLM):** suggest the next level when ≥ 80 % of the current level's skills are at `good` (≥ 75 %) or better, with ≥ 3 attempts each, over ≥ 5 distinct days. Surface it in the parent dashboard as a suggestion with a one-tap "Move to Junior KG" — never auto-promote.
- Strands (`number`, `literacy`, `writing`, `reasoning`) let the parent dashboard show a readable picture once skills go from 19 to ~70, and they become the natural join key for Phase 17 curriculum packs.

---

## 4. Content plan per level

### 16.1 Junior KG (~130 activities)

| Skill area | New subject / reuse | New activity types |
|---|---|---|
| Alphabet sounds | `phonics` | `LETTER_SOUND` (audio prompt → letter), `BEGINNING_SOUND` (picture → sound) |
| Simple words | `words` | `WORD_BUILD` (drag letters into slots), reuse `IMAGE_CHOICE` (word → picture) |
| Numbers 1–20 | `numbers` (extend) | reuse `COUNTING`, `MULTIPLE_CHOICE`; add `NUMBER_LINE` (place/select on a line) |
| Addition foundations | `math` | `ADDITION` rendered as ten-frame / object groups, sums ≤ 10 |
| Complex patterns | `patterns` | `PATTERN_COMPLETE` (AB, AAB, ABC, growing) |
| Vocabulary | `games` (extend) | reuse `IMAGE_CHOICE`, `MATCHING` |
| Pre-writing | `writing` (extend) | reuse `TRACING` with full a–z / 0–9 pattern set |

New types: `LETTER_SOUND`, `WORD_BUILD`, `NUMBER_LINE`, `ADDITION`, `PATTERN_COMPLETE` (5).
Blockers to clear first: audio for phonics (pre-recorded clips per the plan's no-TTS-dependency stance — budget ~60 clips × 3 languages, or ship English-only phonics and state it), and the tracing rewrite below.

### 16.2 Senior KG (~170 activities)

| Skill area | Subject | New activity types |
|---|---|---|
| Word formation | `words` | reuse `WORD_BUILD`; add `WORD_SORT` (by sound/family) |
| Reading | `reading` | `SENTENCE_READ` (read + pick matching picture), `READ_COMPREHEND` (2-line passage, 1 question) |
| Writing | `writing` | needs the tracing rewrite (letters, digits, short words, stroke order) |
| Numbers 1–100 | `numbers` | reuse `NUMBER_LINE`, add `PLACE_VALUE` (tens/ones) |
| Add/subtract | `math` | extend `ADDITION` with subtraction + missing-addend |
| Time | `time` | `CLOCK_READ` (analogue face, interactive hands) |
| Money | `money` | `COIN_COUNT` (pick coins to make an amount) |
| Logical reasoning | `reasoning` | `ODD_ONE_OUT`, `SORT_CATEGORY`, `SEQUENCE_ORDER` |

New types: ~8. **Tracing rewrite is the long pole**: replace hand-typed point arrays with SVG path data sampled via `Path2D`/`getTotalLength`, with per-stroke ordering and direction. That converts "author 26 letters × 3 scripts by hand" into "supply a path string per glyph" and is the only way SKG writing is feasible.

### 16.3 Grade 1 (~200 activities, school-aligned)

Do **not** invent a curriculum here. Grade 1 is where Phase 16 should hand over to Phase 17:

- Define the curriculum-pack manifest now (`pack.json`: id, level, board, subjects, skill graph, activity file list) and express Grade 1 as the first pack that is *not* hard-coded into the app.
- Map skills to a named framework (NCERT/CBSE foundational stage or NCF-FS outcomes) so each activity carries an outcome code; that code is what makes "school-aligned" auditable.
- Grade 1 also introduces things the current engine has no answer for: multi-step problems, text input (typing/spelling), and timed practice. Scope those as explicit sub-decisions, not surprises.

---

## 5. Suggested sequencing

| Step | Content | Rough effort |
|---|---|---|
| 16.0 Foundations (levels, registries, tests, CI, generators, lazy load, level-scoped rewards) | no new activities | 1–2 sessions |
| 16.1a Skill graph + promotion rule + parent surfacing | — | ~0.5 session |
| 16.1b Junior KG types + content + audio | ~130 activities | 1–2 sessions |
| 16.2a Tracing rewrite (SVG-path driven) | — | ~0.5–1 session |
| 16.2b Senior KG types + content | ~170 activities | 2 sessions |
| 16.3 Curriculum-pack manifest + Grade 1 pack | ~200 activities | 2+ sessions, gated on a chosen framework |

Each step is independently shippable; the app stays usable for a nursery child throughout.

---

## 6. Decisions needed before 16.1 starts

1. **Languages for new levels** — is English-only acceptable for JKG/SKG reading and phonics (hi/mr deferred), or must all three ship together? This roughly doubles content effort and decides whether the loader should *skip* untranslated activities instead of throwing.
2. **Phonics audio** — pre-recorded clips (recorded by whom, how many) vs. relying on the existing speech layer in `src/learn/audio/speech.ts`.
3. **Grade 1 framework** — CBSE / NCF-FS / state board / generic. Everything "school-aligned" depends on this.
4. **Reading script for Devanagari** — matras and conjuncts are a genuine curriculum design problem, not a translation task; worth deciding whether hi/mr reading is in scope at all for SKG.
5. **Promotion UX** — parent-approved only (recommended) vs. automatic.

---

## 7. Two risks worth naming

- **Content volume without tests is the real risk**, not engine complexity. Going from 88 to ~600 activities with no test suite and browser-side validation means silent breakage will surface as a child seeing a broken screen. 16.0.5 is the cheapest insurance in this phase.
- **Per-level bundle growth** will quietly undo the offline/PWA work from Phases 12–13 if all levels ship eagerly in all languages. Set the size budget before the content lands, not after.
