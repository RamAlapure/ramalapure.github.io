# Learn · Playground — UX Implementation Strategy

Scope: `/learn/` (`src/learn/**`, mounted by `src/pages/learn/index.astro`).
Goal: split the product into two coherent experiences — a **child view** built for a 3–6 year old,
and a **parent view** where **analytics (read) and operations (write) are separated** — without
changing the local-first, no-backend architecture.

---

## 1. What exists today

### Screen model

`LearnScreen = 'welcome' | 'home' | 'activity' | 'result' | 'parent'` — a single React island
(`LearnApp.tsx`) with `useState` screen switching, no routing, no deep links.

| Screen | Audience | Content |
| --- | --- | --- |
| `welcome` | mixed | profile picker, name/avatar form, "New learner" (PIN-gated) |
| `home` | child | greeting, rewards chips, 7 subject cards |
| `activity` | child | instruction, renderer, session dots, streak, exit confirm |
| `result` | child | stars, score, points, badge unlock, play again |
| `parent` | parent | **11 stacked sections** behind a PIN |

### The parent screen today (`ParentScreen.tsx`, 397 lines)

In DOM order: today's learning → skills by subject → recommendations → weekly chart →
profile switcher + add learner → child profile editor + delete → app settings + PIN change →
feedback form → lifetime stat list → adaptive rules explainer → skill progress bars → badges →
subject catalogue.

That is **analytics, configuration, destructive actions, and support all interleaved in one
scroll**, with no tabs, no anchors, no per-section save model.

### Data available (`storage/types.ts`)

`activityResults[]` (per-attempt: skill, correct, responseTimeMs, completedAt), `skills{}`
(correct/attempts/lastPracticedAt), `rewards`, `sessions`, `settings`, `profile`. Analytics
derives today/weekly/mastery/recommendations in `parent/analytics.ts` and `progress/mastery.ts`.
The event log is rich enough for far more than the current dashboard shows — time-of-day, response
time distribution, accuracy trend, per-skill velocity are all computable with no schema change.

---

## 2. Problems worth fixing (evidence-based)

**Parent view**

1. **No separation of concerns.** A parent checking "how did she do today?" scrolls past a delete-
   profile button and a PIN field. A parent changing a setting scrolls past charts. Reading and
   configuring have opposite frequencies (daily vs. rarely) and opposite risk profiles.
2. **Dangerous actions sit in the reading path.** Delete profile, PIN change, and age-group change
   apply immediately (`handleAgeGroupChange`, `handleAvatarChange` write on change).
3. **Inconsistent save model.** Name uses an explicit *Save*; avatar and age group auto-save;
   settings auto-save; PIN uses *Update*. Three interaction models on one screen.
4. **Analytics are shallow and time-blind.** Only "today" and a 7-day activity-count bar chart.
   No accuracy trend, no per-session history, no time-of-day, no comparison across learners, no
   date-range control — despite the raw data supporting all of it.
5. **Duplicated surfaces.** Skills appear three times (`Skills by subject` stars,
   `Needs practice`, `All skills`), lifetime stats twice, subject counts twice.
6. **Multi-child is an afterthought.** Switching a learner from the parent screen resets
   `parentUnlocked` and throws the parent back to the child home — so comparing two children means
   re-entering the PIN twice.
7. **No exit/export.** Data lives in `localStorage` with no export, no reset, no "what is stored"
   view — weak for a privacy-first product promise.

**Child view**

8. **Child home is a flat 7-card grid** with no "continue where you left off", no daily goal, no
   visible path — every session starts as a cold choice.
9. **Rewards are numeric chips** (⭐ 0 / 🏆 0); a pre-reader cannot parse counts, and there is no
   progress-toward-next-reward feedback.
10. **Parent affordances live in the child header** (language select, theme toggles, lock icon) —
    three adult controls in a child's tap zone (`LearnHeaderActions`).
11. **No state persistence across reload** of an in-flight session; a refresh mid-round loses it.

---

## 3. UX principles

1. **One brain per view.** Child view: pictures, motion, one decision at a time. Parent view:
   density, text, tables, explicit saves.
2. **Read and write never mix.** Analytics surfaces are strictly read-only. Every mutation lives in
   Operations. Exactly one bridge is allowed: *Practice now* on a recommendation.
3. **Destructive actions are gated twice** — inside Operations, and behind a typed confirmation.
4. **Local-first stays.** No backend, no network analytics. Everything below is computable from the
   existing `localStorage` store.
5. **Child-first ergonomics.** ≥64px targets, no text-critical paths, audio-first instructions.
6. **Adult controls out of the child frame.** Language/theme/PIN move behind one parent affordance.

---

## 4. Target information architecture

```
/learn/
├── Child view  (default, no PIN)
│   ├── Who's learning        profile picker (unchanged)
│   ├── Play Home             continue card · daily goal ring · subject grid
│   ├── Activity              renderer + progress dots (unchanged core)
│   └── Celebrate             stars, next-reward progress, play again
│
└── Parent Hub  (PIN, /learn/?parent=1)
    ├── INSIGHTS   (read-only)
    │   ├── Overview      today · streak · 7/30-day trend · time of day
    │   ├── Progress      subject mastery · skill bars · badges · milestones
    │   └── Focus         what adaptive picks next · needs-practice list → Practice now
    └── MANAGE     (write)
        ├── Learners          add / edit / switch / delete (double-gated)
        ├── Learning setup    session length · subjects on/off · difficulty · daily limit
        ├── App & audio       sound · slow speech · language · contrast · theme
        ├── Privacy & PIN     change PIN · export JSON · reset learner · reset all
        └── Support           feedback · content catalogue · version · install app
```

Two tabs, five sections each at most — everything a parent needs is ≤2 taps from the hub, and no
read screen contains a control that changes state.

### Cross-cutting parent header

A persistent bar in the Parent Hub (not repeated per section): **learner selector** (chips,
switching does *not* drop the PIN session) + **date range** (Today / 7d / 30d / All) that scopes
every Insights surface. Switching learners inside the hub must not navigate to the child home —
this is the single biggest workflow fix.

---

## 5. Child view — design spec

| Element | Behaviour |
| --- | --- |
| **Header** | Avatar + name only. One small `⚙︎` parent button (long-press or 3× tap on desktop: click) opens the PIN gate. Language/theme move into Parent Hub → App & audio. |
| **Daily goal ring** | Circular ring showing `activitiesToday / dailyGoal` (default 12, configurable in Learning setup). Fills with colour, celebrates at 100%. Replaces raw ⭐/🏆 counts as the primary child-facing metric. |
| **Continue card** | Full-width card at the top: last subject played + "Keep going" — resumes `sessions.lastSubject`. Removes the cold-start choice. |
| **Suggested next** | One highlighted subject card driven by `getPracticeRecommendations`, marked with a gentle pulse — the adaptive engine made visible to the child without words. |
| **Subject grid** | Unchanged 7 cards, but each shows a 5-dot mastery strip instead of "20 activities" (an activity count is meaningless to a 4-year-old). |
| **Rewards** | Stars shown as filled star glyphs (max 5 for the day) plus a "next badge" progress bar; absolute point totals move to the parent view. |
| **Activity screen** | Keep current layout. Add: session resume on reload (persist `{subjectId, index, answers}`), and a pause-safe exit. |
| **Celebrate screen** | Keep. Add "next reward in N ⭐" progress and a one-tap *Play again* as the primary button. |

Accessibility: every instruction already speaks via `speakInstruction`; keep audio as the primary
channel and text as secondary. Targets ≥64px, focus rings preserved, `prefers-reduced-motion`
honoured for the ring/pulse animations.

---

## 6. Parent view — analytics vs. operations

### INSIGHTS (read-only)

**Overview**
- KPI row: minutes, activities, accuracy %, day streak — each with a delta vs. the previous
  equivalent period.
- Activity + accuracy chart over the selected range (bars = activities, line = accuracy).
- Time-of-day histogram (when does this child actually learn?) — derived from `completedAt`.
- Session list: last N rounds (subject, score, duration, time) — the "what happened" log parents
  ask for, currently absent.

**Progress**
- Subject mastery table: subject · mastery % · stars · rounds · last practised.
- Skill mastery bars grouped by subject, sorted by weakest — replaces the three duplicated skill
  lists with one canonical view.
- Badges + milestones timeline.

**Focus**
- "What the next round will practise" — the adaptive plan reason, in plain language.
- Needs-practice list with *Practice now* (the single allowed write-action bridge; it starts a
  child session and drops the PIN session deliberately).
- Plain-language explainer of the three adaptive rules (moved out of the stats flow).

All Insights components take `(store, range, profileId)` and return derived view models — no
handlers, no setters. This is enforceable in review: **no `on*` props in `learn/parent/insights/**`
except navigation.**

### MANAGE (write)

- **Learners** — card per learner (avatar, name, age group, created, lifetime stars) with *Edit*
  and *Make active*. Add-learner is a form in a dialog, not inline. Delete moves here, requires
  typing the learner's name, and shows exactly what will be deleted.
- **Learning setup** — session length (4/6/8), daily goal, subjects on/off (child grid respects
  it), difficulty override (auto / easier / harder), daily time limit with a gentle stop screen.
- **App & audio** — sound, slow speech, speech rate, language, high contrast, theme.
- **Privacy & PIN** — change PIN (current + new, explicit *Update*), export all data as JSON,
  reset one learner, reset everything. Plus a "what's stored on this device" disclosure.
- **Support** — feedback form (existing), content catalogue (subject → activity counts), app
  version, install PWA.

Uniform save model in Manage: **every section is a form with an explicit primary button and a
toast confirmation**; no auto-save on change, no silent writes. Unsaved-change guard on tab switch.

---

## 7. Implementation plan (maps to existing code)

### New/changed modules

```
src/learn/app/types.ts         + LearnScreen 'parent' → 'parentHub'; ParentTab = 'insights' | 'manage'
src/learn/app/LearnApp.tsx     keep PIN unlock state across learner switches; read ?parent= deep link
src/learn/parent/
  ParentHub.tsx                header (learner chips + range) + tab shell   [new]
  insights/OverviewPanel.tsx   KPI row, trend chart, time-of-day, session log [new]
  insights/ProgressPanel.tsx   subject table + skill bars + badges           [new, absorbs SkillProgressSection]
  insights/FocusPanel.tsx      adaptive plan + recommendations                [new, absorbs AdaptiveInfoSection]
  manage/LearnersPanel.tsx     profile CRUD                                   [new, extracted from ParentScreen]
  manage/LearningSetupPanel.tsx session/goal/subjects/difficulty              [new]
  manage/AppSettingsPanel.tsx  audio/language/contrast/theme                  [new]
  manage/PrivacyPanel.tsx      PIN, export, reset                             [new]
  manage/SupportPanel.tsx      feedback + catalogue + version                 [new, absorbs FeedbackForm]
  analytics.ts                 + range-aware selectors (see below)
src/learn/storage/types.ts     + LearnSettings: sessionLength, dailyGoal, enabledSubjects,
                               difficultyMode, dailyLimitMinutes
src/learn/storage/store.ts     + exportStore(), resetProfile(), resetAll()
ParentScreen.tsx               deleted once panels land (keeps the diff reviewable)
```

### Analytics selectors to add (`parent/analytics.ts`)

```ts
type Range = 'today' | '7d' | '30d' | 'all';
getRangeStats(store, range): { minutes; activities; correct; accuracy; delta }
getDailySeries(store, range): Array<{ day; activities; accuracy }>
getTimeOfDayHistogram(store, range): Array<{ hourBucket; activities }>
getRecentSessions(store, limit): Array<{ subjectId; score; total; durationMs; at }>
getSubjectMastery(store, lang): Array<{ subjectId; masteryPercent; stars; rounds; lastPracticedAt }>
```

All are pure functions over `activityResults` + `skills`; each gets a unit test with a fixture
store (the existing test setup already covers `mastery.ts`-style logic).

### Phasing

| Phase | Content | Size |
| --- | --- | --- |
| **P0 — Split** | ParentHub shell with Insights/Manage tabs; move existing sections into panels with zero new features; keep PIN across learner switches; deep link `?parent=`. Pure refactor, immediately shippable. | 1 session |
| **P1 — Operations hygiene** | Uniform explicit-save forms, double-gated delete, Learning setup (session length, daily goal, subjects on/off), Privacy panel (export/reset). | 1 session |
| **P2 — Analytics depth** | Range selector + the five new selectors, trend chart, time-of-day, recent-session log, unified subject/skill tables, multi-learner compare. | 1 session |
| **P3 — Child view** | Daily goal ring, continue card, suggested-next, mastery dots on cards, adult controls out of the child header, session resume on reload. | 1 session |

Each phase is an independent PR; P0 must land first because everything else hangs off the panel
boundaries.

### Guardrails

- `insights/**` imports no store mutators — a lint boundary rule (`no-restricted-imports` on
  `../storage/store` writers) makes the read/write split structural, not conventional.
- Every new string goes through `tUi` and lands in `en/hi/mr` locale files in the same PR.
- New settings are additive with defaults so existing `localStorage` stores upgrade silently
  (the store already tolerates missing fields via `??` fallbacks).

## 8. Success criteria

- A parent can answer "how is she doing this week?" without seeing a single control that mutates
  state, in ≤2 taps from the child home.
- A parent can change a setting or delete a learner without scrolling past a chart.
- Switching learners inside the hub requires 1 tap and no PIN re-entry.
- No section of the parent view exceeds one screen of scroll on a 390×844 viewport.
- Child home shows a resumable path and a daily goal; zero adult-only controls remain in it.
