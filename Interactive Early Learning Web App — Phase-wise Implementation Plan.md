# Interactive Early Learning Web App

> A playful, interactive, privacy-first web learning platform for Nursery to early-KG children, initially built for my children and designed to eventually support other children. Ships at **`alapureram.com/learn/`** inside the existing Astro portfolio repo — promoted via Projects / Lab, not a separate app or host.

## 1. Product Vision

Build a **100% browser-based early-learning application** where children learn through short, interactive activities instead of passive video consumption.

### Core principles

- 🎮 Learning through interaction
- 🧒 Child-first, simple UI
- 🎨 Visual and audio-heavy experience
- ⏱️ Short learning sessions
- 🧠 Adaptive learning using deterministic rules
- 🔒 No backend
- 🚫 No LLM
- 🚫 No advertisements
- 🚫 No child tracking
- 💾 Learning progress stored locally
- 🌐 Static web application
- 📱 Responsive across desktop, tablet and mobile
- 🌍 Architecture ready for multiple languages and curricula

---

# 2. Initial Target

## Primary audience

### V1

**Nursery / age 3–5**

### Future

- Nursery
- Junior KG
- Senior KG
- Grade 1 foundation

---

# 3. Technology Strategy

The application should remain completely frontend-based. It ships **inside the existing [alapureram.com](https://alapureram.com) Astro site** — same repo, same build, same GitHub Pages deploy — not as a separate Vite project or separate host.

```text
                    Web Browser
                         │
                         ▼
              ┌─────────────────────┐
              │  Astro (static)     │  ← portfolio shell, SEO, deploy
              │  alapureram.com     │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  /learn/ route      │  ← early-learning app entry
              │  React + TypeScript │
              │                     │
              │  UI / Activities    │
              │  Learning Engine    │
              │  Progress Engine    │
              │  Curriculum Engine  │
              └──────────┬──────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      JSON Content   Media Assets   Local Storage
          │              │              │
          └──────────────┴──────────────┘
                         │
                         ▼
                  Child's Browser
```

## Recommended stack

| Component | Technology |
|---|---|
| Site shell | Astro 5 (existing `ramalapure.github.io` repo) |
| App route | `/learn/` (mini-SPA under Astro) |
| Interactive UI | React via `@astrojs/react` |
| Language | TypeScript (already in repo) |
| Build | Astro build (Vite under the hood — no second toolchain) |
| Styling | Child-friendly CSS tokens under `/learn/`; portfolio `global.css` unchanged |
| State | React state / lightweight store |
| Persistence | localStorage initially |
| Larger local data | IndexedDB later |
| Drawing | HTML Canvas |
| Audio | HTML5 Audio / Web Audio API |
| Voice instructions | Pre-recorded audio initially |
| Hosting | GitHub Pages via existing deploy workflow |
| Backend | None |
| Database | None |
| LLM | None |
| Authentication | None initially |

## Same-site integration (alapureram.com)

The learning app and the portfolio share one static site:

```text
alapureram.com/                 ← existing Astro portfolio (unchanged)
alapureram.com/learn/           ← early-learning app (React)
alapureram.com/projects/...     ← promote as a Lab project page
```

**Promotion, not nav merge.** The portfolio nav stays frozen (Writing · Projects · About). Surface the app through a **Projects / Lab** case study and links to `/learn/` — same pattern as OpenLifeOps, except the learning app runs on the same static host (no separate subdomain required for V1).

**Isolation.** `/learn/` uses its own layout (minimal chrome, child-first UI) and does not inherit portfolio navigation or theme tokens. The homepage and flagship case studies stay untouched.

## What stays stack-agnostic

These plan sections do **not** depend on a standalone React repo:

- Activity types and renderer-per-type engine (Phase 2)
- `Activity` / curriculum JSON model
- Progress in localStorage → IndexedDB (Phases 5, 12)
- PWA / offline (Phases 12–13) — via Vite PWA plugin in the Astro build
- Deterministic adaptive rules (Phase 6) — no LLM
- Content folders (`content/nursery/alphabet/…`)
- Multi-language keys (Phase 11)

## What requires a client UI framework

Drag-drop, memory games, tracing, multi-screen routing, and the activity engine need a SPA-style layer. **React inside Astro** is the right choice; pure Astro pages or vanilla TS alone will not scale past a toy prototype.

## When a separate app would be needed (defer)

Only consider a standalone Vite + React repo or subdomain (e.g. `learn.alapureram.com`) if:

- Release cadence must diverge from the portfolio site
- The app outgrows a single Astro build artifact
- A dedicated team or product boundary appears

None of these apply to V0.1.

---

# 4. Product Architecture

```text
┌──────────────────────────────────────────────────┐
│                    Web App                       │
│                                                  │
│  ┌────────────┐    ┌─────────────────────────┐  │
│  │ Child UI   │───▶│     Activity Engine     │  │
│  └────────────┘    └────────────┬────────────┘  │
│                                 │               │
│                  ┌──────────────┼────────────┐  │
│                  ▼              ▼            ▼  │
│             Curriculum      Evaluation    Rewards│
│                  │              │            │  │
│                  └──────────────┼────────────┘  │
│                                 ▼               │
│                         Progress Engine         │
│                                 │               │
│                                 ▼               │
│                         Local Storage           │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │                Parent Mode                 │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

# Phase 0 — Product Discovery & Foundation

## Goal

Define what should be built before implementing the application.

### Deliverables

- Product vision
- Target age group
- Initial curriculum
- Activity taxonomy
- UX principles
- Application architecture
- Data model
- Content structure
- Design system

### Define initial learning areas

```text
Alphabet
Numbers
Colors
Shapes
Animals
Fruits & Vegetables
Body Parts
Family
Everyday Objects
Vocabulary
Memory
Logic
Pre-writing
```

### Define activity types

```text
IMAGE_CHOICE
MULTIPLE_CHOICE
COUNTING
MATCHING
DRAG_DROP
SORTING
MEMORY
SEQUENCE
ODD_ONE_OUT
COLOR_MATCH
SHAPE_MATCH
TRACING
LISTEN_AND_SELECT
```

### Exit criteria

- V1 curriculum defined
- Activity types defined
- Technical architecture documented (Astro + React on `/learn/`, same GitHub Pages deploy)
- Same-site promotion path agreed (Lab project page, no main-nav change)
- Initial UI wireframes ready
- Data model finalized

---

# Phase 1 — Web Application Foundation

## Goal

Create the basic application shell.

### Features

- `/learn/` route in the existing Astro repo (`@astrojs/react` integration)
- React + TypeScript app shell (no separate Vite project)
- Dedicated `/learn/` layout — child-first, no portfolio nav
- Responsive layout
- Child-friendly design system (separate from portfolio styles)
- Home screen
- In-app navigation (subject selection, activity flow)
- Basic activity screen
- Results screen
- Local storage abstraction
- Lab project page under `/projects/` linking to `/learn/`

### Initial screens

```text
Home
 ├── Alphabet
 ├── Numbers
 ├── Colors
 ├── Shapes
 ├── Animals
 └── Games

Activity
 └── Question

Result
 └── Stars / encouragement

Parent
 └── Progress
```

### Architecture

```text
src/
├── pages/
│   └── learn/
│       └── [...slug].astro          # Astro shell → mounts React app
├── learn/                            # React app (activity engine lives here)
│   ├── app/
│   ├── components/
│   ├── activities/
│   ├── curriculum/
│   ├── learning/
│   ├── progress/
│   ├── rewards/
│   ├── audio/
│   └── storage/
├── content/
│   └── projects/
│       └── early-learning.md        # Lab promotion page
└── public/
    └── learn/                        # static assets (images, audio)
```

### Exit criteria

Child can:

1. Open application
2. Select a subject
3. Start an activity
4. Answer it
5. Receive feedback
6. Complete a session
7. See basic progress

---

# Phase 2 — Activity Engine

## Goal

Create a reusable engine capable of rendering different learning activities from data.

## Core model

```typescript
interface Activity {
    id: string;
    type: ActivityType;
    skill: string;
    ageGroup: string;
    difficulty: number;
    instruction: string;
    content: unknown;
}
```

## Activity lifecycle

```text
Load Activity
      ↓
Render
      ↓
Child Interaction
      ↓
Evaluate
      ↓
Feedback
      ↓
Record Result
      ↓
Next Activity
```

## Renderer architecture

```text
ActivityEngine
     │
     ├── MultipleChoiceRenderer
     ├── ImageChoiceRenderer
     ├── CountingRenderer
     ├── MatchingRenderer
     ├── DragDropRenderer
     ├── MemoryRenderer
     ├── SortingRenderer
     ├── SequenceRenderer
     └── TracingRenderer
```

## Initial implementation

Build these first:

1. Image choice
2. Multiple choice
3. Counting
4. Matching
5. Color selection
6. Shape selection

### Exit criteria

At least **6 reusable activity types** work from configuration/data rather than hard-coded pages.

---

# Phase 3 — Nursery Curriculum V1

## Goal

Create enough high-quality content for real daily use.

### Alphabet

```text
A–Z recognition
Letter → picture
Picture → letter
Uppercase recognition
Basic letter sounds
```

### Numbers

```text
1–5
6–10
Counting objects
Number recognition
Number → quantity
Quantity → number
```

### Colors

```text
Red
Blue
Yellow
Green
Orange
Purple
Black
White
```

### Shapes

```text
Circle
Square
Triangle
Rectangle
Oval
```

### Animals

```text
Dog
Cat
Cow
Horse
Lion
Tiger
Elephant
Monkey
Bird
Fish
Rabbit
```

### Vocabulary

```text
Food
Toys
Vehicles
Body parts
Family
Clothes
Everyday objects
```

## Content target

Initial target:

**50–100 activities**

Do not optimize for quantity.

Optimize for:

- Clear instructions
- Large visuals
- Appropriate difficulty
- Short interaction
- Immediate feedback
- Repetition without boredom

### Exit criteria

A child can complete approximately **10–15 minutes of meaningful learning** without running out of activities.

---

# Phase 4 — Child Experience & Gamification

## Goal

Make the application genuinely enjoyable for young children.

### Feedback

Correct:

```text
🎉 Great job!
⭐ +10
```

Incorrect:

```text
😊 Almost!
Let's try again.
```

Avoid negative language such as:

- Wrong
- Failed
- Bad
- You lost

### Rewards

```text
Stars
Points
Badges
Streaks
Completed lessons
Unlocked activities
```

### Example

```text
🎉 Amazing!

You completed Animals!

⭐⭐⭐⭐⭐

New badge unlocked:

🐾 Animal Explorer
```

### Animation

Use lightweight animations for:

- Correct answer
- Star collection
- Badge unlock
- Level completion
- Celebration

Keep animations short so they don't distract from learning.

### Exit criteria

The child should understand the interaction without requiring a parent to operate the application.

---

# Phase 5 — Progress & Local Learning Profile

## Goal

Track learning progress entirely on the child's device.

## Local data

```typescript
interface ChildProfile {
    id: string;
    name: string;
    ageGroup: string;
    createdAt: string;
}
```

```typescript
interface ActivityResult {
    activityId: string;
    skill: string;
    correct: boolean;
    attempts: number;
    responseTime: number;
    completedAt: string;
}
```

## Store

```text
localStorage
     │
     ├── Child Profile
     ├── Activity Results
     ├── Skill Progress
     ├── Rewards
     └── Settings
```

Move to IndexedDB if data volume grows.

## Skill mastery

Example:

```text
Counting
──────────────

Correct: 18
Attempts: 22

Mastery: 82%

Status:
🟢 Good
```

### Mastery levels

```text
0–49%    → Needs Practice
50–74%   → Learning
75–89%   → Good
90%+     → Mastered
```

### Exit criteria

Parent can see what the child has practiced and which skills need additional practice.

---

# Phase 6 — Adaptive Learning Engine

## Goal

Make the application adapt to the child's performance without AI or LLM.

## Basic rules

```text
High mastery
     ↓
Increase difficulty
```

```text
Low mastery
     ↓
Reduce difficulty
     ↓
Provide additional practice
```

### Example

```text
Skill: Counting 1–5

90%+
  ↓
Counting 1–10

70–90%
  ↓
Continue current level

<70%
  ↓
More 1–5 activities
```

## Difficulty model

```text
Level 1
  ↓
Level 2
  ↓
Level 3
  ↓
Level 4
```

Difficulty can vary based on:

- Number of choices
- Number of objects
- Visual similarity
- Time pressure
- Number range
- Distractor complexity
- Number of steps

### Important principle

The adaptive engine must remain:

> **Deterministic + explainable + testable**

No AI is required.

---

# Phase 7 — Audio & Accessibility

## Goal

Make the application usable by children who cannot read instructions independently.

### Audio

Each activity can have:

```text
instruction.mp3
success.mp3
try-again.mp3
completion.mp3
```

Example:

```text
🔊 "Which one is a cat?"
```

Child selects:

🐱

```text
🔊 "Great job!"
```

### Controls

```text
🔊 Repeat
🔇 Mute
🐢 Slow
```

### Accessibility

Support:

- Large touch targets
- High contrast
- Keyboard navigation
- Reduced motion
- Screen reader-friendly labels
- No tiny text
- No complex menus

---

# Phase 8 — Tracing & Pre-Writing

## Goal

Introduce early writing skills.

Use HTML Canvas.

### Activities

```text
Straight lines
Curves
Circles
Zig-zag
Letters
Numbers
Shapes
```

Example:

```text
        A

       ╱╲
      ╱  ╲
     ╱────╲

Trace the letter A
```

## Evaluation

Initially use simple deterministic checks:

```text
Path starts near expected point
        +
Path stays within tolerance
        +
Path reaches expected endpoint
```

Do not attempt sophisticated handwriting recognition in V1.

### Exit criteria

Child can practice basic pre-writing patterns interactively.

---

# Phase 9 — Parent Mode

## Goal

Provide parents with useful insights without requiring an account or backend.

## Parent access

```text
Home
  ↓
🔒 Parent Mode
  ↓
PIN
```

## Dashboard

```text
Child: Anvi

Today's Learning
────────────────
18 minutes

Activities
24

Correct
21 / 24
```

### Skill view

```text
Alphabet       ⭐⭐⭐⭐⭐
Numbers        ⭐⭐⭐⭐
Colors         ⭐⭐⭐⭐⭐
Shapes         ⭐⭐⭐
Animals        ⭐⭐⭐⭐⭐
```

### Recommended practice

```text
Needs Practice

🔺 Shapes

Suggested:
5 shape-matching activities
```

### Weekly summary

```text
Mon  █████
Tue  ███████
Wed  ████
Thu  ████████
Fri  █████
```

---

# Phase 10 — Content Authoring System

## Goal

Make adding activities easy without modifying application logic.

Instead of coding:

```typescript
createNewAnimalQuestion()
```

store content as JSON.

Example:

```json
{
  "id": "animal-001",
  "type": "IMAGE_CHOICE",
  "skill": "animal-recognition",
  "difficulty": 1,
  "instruction": "Find the cat",
  "options": [
    "cat",
    "dog",
    "cow"
  ],
  "answer": "cat"
}
```

## Content structure

```text
content/
├── nursery/
│   ├── alphabet/
│   ├── numbers/
│   ├── colors/
│   ├── shapes/
│   ├── animals/
│   └── vocabulary/
│
├── junior-kg/
└── senior-kg/
```

This allows the product to scale through **content expansion rather than code duplication**.

---

# Phase 11 — Multi-Language Foundation

## Goal

Prepare the application for Indian and international users.

Do not implement every language immediately.

Build the architecture first.

```text
English
Hindi
Marathi
```

### Separate content from language

Instead of:

```json
{
  "instruction": "Find the cat"
}
```

use:

```json
{
  "instructionKey": "animal.find.cat"
}
```

Translations:

```text
English → Find the cat
Hindi   → बिल्ली ढूंढो
Marathi → मांजर शोधा
```

Images and activities remain reusable.

### Exit criteria

Adding another language does not require rewriting the activity engine.

---

# Phase 12 — Offline-First Web App

## Goal

Make the application usable even without an internet connection after the initial load.

Implement:

- PWA
- Service worker
- Cached application assets
- Cached curriculum
- Cached images
- Cached audio
- Local progress

Architecture:

```text
Internet
   │
   ▼
Initial Load
   │
   ▼
Browser Cache
   │
   ▼
Offline Learning
```

This is especially valuable for tablets and unreliable connections.

### Status: ✅ Complete (2026-09-14)

- `@vite-pwa/astro` with service worker, precache, and `/learn/` scoped manifest
- Offline banner + install hint UI
- Progress remains in `localStorage` offline

---

# Phase 13 — Installable PWA

> **Status: 🔮 Future scope — not implementing now.**
>
> Phase 12 already delivers the essentials (manifest, icons, standalone display, offline). Remaining installable-app polish (custom splash screen, refined home-screen flow) is deferred until after child testing and V1.

## Goal

Make the website feel like a native children's application.

Support:

```text
Add to Home Screen
        ↓
     Kids App
        ↓
Full-screen experience
```

Features:

- App icon
- Splash screen
- Full-screen mode
- Offline support
- Responsive touch UI

No app-store submission is required initially.

---

# Phase 14 — Quality & Child Testing

## Goal

Validate the product with real children before expanding.

Use the application with my children and observe:

### Measure

- Which activities do they enjoy?
- Which activities confuse them?
- Where do they need help?
- How long do they stay engaged?
- Which instructions aren't clear?
- Do they understand the icons?
- Are activities too easy?
- Are activities too difficult?
- Do rewards motivate them?

### Important

Do not rely only on analytics.

For a young-child product:

> **Watching a child use the application is more valuable than looking at a dashboard.**

Iterate based on actual behavior.

### Status: 🔄 In progress (2026-09-14)

**Testers**

| Child | Age | Class | Fit |
|-------|-----|-------|-----|
| Atharv | 4 | Jr. KG | Primary target (nursery curriculum) |
| Anvi | 6 | Class 1 | Above nursery level — useful for “too easy?” signal |

**How to export session data**

On `/learn/`, open DevTools → Console:

```js
copy(localStorage.getItem('learn-store-v2'))
```

Save to `learn-session-export.json` (repo root, gitignored), then:

```bash
npm run analyze-session
```

**Observations from build + prior sessions** (to validate against export)

| Area | Atharv (4) | Anvi (6) | Improvise |
|------|------------|----------|-----------|
| Session length (6 activities) | Likely long — watch for drop-off after activity 3–4 | May finish quickly | Shorten default round to 4 for nursery; optional “longer round” in parent settings |
| Writing / tracing | Letter B falsely marked wrong (fixed); tracing needs largest touch targets | Easier | Keep tracing hints visual; add “show me” demo stroke before free trace |
| Parent PIN | Blank screen after PIN (fixed) | — | — |
| Audio (TTS) | Language now follows setting | — | Localize option labels in JSON; auto-play instruction on activity start |
| Subject pickers | Emoji + label — verify 4yo reads vs taps by picture | May want reading challenges | Add optional picture-only mode for youngest |
| Rewards | Stars/points — observe if Atharv cares by activity 6 | May find nursery rewards shallow | Celebrate mid-round (after 3rd activity), not only at end |
| Difficulty | Nursery default | Likely too easy on alphabet/numbers | Use Anvi sessions to flag skills at 90%+ mastery → skip or harder variants |
| Engagement | Watch which subjects they reopen unprompted | Compare `bySubject` counts in export | Double content in top 2 subjects; simplify or split bottom 2 |

**Exit criteria**

- [ ] Export analyzed for both children (separate profiles or noted sessions)
- [ ] Top 3 friction points documented from watching (not only dashboard)
- [ ] At least one curriculum/UI change shipped per friction point
- [ ] Re-test with children after changes

---

# Phase 15 — Public V1

## Goal

Release the first version to a small group of families.

### V1 scope

```text
Age: 3–5

Subjects:
✓ Alphabet
✓ Numbers
✓ Colors
✓ Shapes
✓ Animals
✓ Basic vocabulary

Activities:
✓ Multiple choice
✓ Image selection
✓ Counting
✓ Matching
✓ Drag/drop
✓ Memory

Platform:
✓ Web
✓ Mobile browser
✓ Tablet
✓ PWA

Backend:
None

LLM:
None

AI:
None
```

### Product promise

> **Short, playful learning sessions for young children — simple enough for kids, useful enough for parents.**

---

# Phase 16 — Expansion to Other Ages

After Nursery is stable:

```text
Nursery
   ↓
Junior KG
   ↓
Senior KG
   ↓
Grade 1
```

Add:

### Junior KG

- Alphabet sounds
- Simple words
- Numbers 1–20
- Addition foundations
- More complex patterns
- Vocabulary
- Pre-writing

### Senior KG

- Word formation
- Reading
- Writing
- Numbers 1–100
- Basic addition/subtraction
- Time
- Money
- Logical reasoning

### Grade 1

Move toward structured curriculum and school-aligned learning.

---

# Phase 17 — Curriculum Packs

Make curriculum modular.

```text
Learning Platform
       │
       ├── Generic Foundation
       │
       ├── India
       │    ├── CBSE
       │    ├── ICSE
       │    └── State Boards
       │
       └── International
            └── Foundation Skills
```

A curriculum pack should define:

```text
Age
Subjects
Skills
Difficulty
Learning sequence
Activities
Assessment
```

This allows the same application engine to support different curricula.

---

# Phase 18 — Content Platform

Only after the core application is proven should this become a larger platform.

Potential future capability:

```text
Content Creator
      ↓
Create Lesson
      ↓
Create Activities
      ↓
Preview
      ↓
Publish Curriculum Pack
      ↓
Children use it
```

This could eventually allow:

- Teachers
- Schools
- Parents
- Educational content creators

to create learning material.

This phase may eventually require a backend, but it should **not influence the architecture of the initial product**.

---

# Phase 19 — Optional Backend Later

A backend should only be introduced when there is a real business requirement.

Possible reasons:

```text
Multiple devices
       ↓
Cloud sync
```

```text
Parent account
       ↓
Cross-device progress
```

```text
Teacher dashboard
       ↓
Class management
```

```text
Subscription
       ↓
Payments / entitlements
```

Until then:

> **Keep everything local.**

---

# 5. Recommended MVP Boundary

Do NOT build all phases initially.

The first real milestone should be:

```text
                 V0.1
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
    Child UI            Activity Engine
       │                     │
       └──────────┬──────────┘
                  ▼
             5 Subjects
                  │
                  ▼
          ~50 Activities
                  │
                  ▼
          Progress Tracking
                  │
                  ▼
             Local Storage
```

## V0.1 subjects

1. 🔤 Alphabet
2. 🔢 Numbers 1–10
3. 🎨 Colors
4. 🔺 Shapes
5. 🐶 Animals

## V0.1 activity types

1. Image choice
2. Multiple choice
3. Counting
4. Matching
5. Drag & drop
6. Memory

---

# 6. Definition of Done for MVP

The MVP is successful when a child can:

```text
Open website
    ↓
Select their profile
    ↓
Choose a subject
    ↓
Start a lesson
    ↓
Complete 5–10 activities
    ↓
Receive visual/audio feedback
    ↓
Earn stars
    ↓
See completion
    ↓
Return later
    ↓
Continue from previous progress
```

And a parent can:

```text
Enter Parent Mode
       ↓
View progress
       ↓
Identify weak skills
       ↓
See recommended practice
```

All without:

```text
❌ Backend
❌ Database
❌ Login
❌ LLM
❌ AI API
❌ Subscription
❌ Ads
```

---

# 7. Long-Term Product Architecture

The final architecture can evolve toward:

```text
                    Learning Platform
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   Curriculum         Activity Engine    Progress Engine
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                     Adaptive Engine
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
         Child Experience          Parent Mode
              │
              ▼
         PWA / Web App
```

The core remains **deterministic and frontend-first**.

---

# 8. Guiding Product Principles

### Principle 1 — Learning over screen time

Optimize for:

> "What did the child learn?"

not:

> "How long did the child stay?"

### Principle 2 — Interaction over passive content

Prefer:

```text
Tap
Drag
Match
Count
Speak
Trace
Choose
Sort
```

over long videos.

### Principle 3 — Encourage, don't punish

Every mistake should become another learning opportunity.

### Principle 4 — Privacy by design

Child data should remain on the device whenever possible.

### Principle 5 — Content should be data

New activities should not require new application code.

### Principle 6 — Deterministic learning engine

Learning decisions should be explainable and testable.

### Principle 7 — Build for your children first

Use real usage to validate the product before attempting to serve a large audience.

---

# 9. Overall Roadmap

```text
PHASE 0
Product & Curriculum
       ↓
PHASE 1
Web Foundation
       ↓
PHASE 2
Activity Engine
       ↓
PHASE 3
Nursery Content
       ↓
PHASE 4
Gamification
       ↓
PHASE 5
Progress
       ↓
PHASE 6
Adaptive Learning
       ↓
PHASE 7
Audio & Accessibility
       ↓
PHASE 8
Tracing
       ↓
PHASE 9
Parent Dashboard
       ↓
PHASE 10
Content Authoring
       ↓
PHASE 11
Multi-language
       ↓
PHASE 12
Offline PWA
       ↓
PHASE 13
Installable App
       ↓
PHASE 14
Real Child Testing
       ↓
PHASE 15
Public V1
       ↓
PHASE 16
More Age Groups
       ↓
PHASE 17
Curriculum Packs
       ↓
PHASE 18
Content Platform
       ↓
PHASE 19
Backend — ONLY IF NEEDED
```

---

# 10. First Development Milestone

The immediate implementation target should be:

## "Nursery Learning Playground V0.1"

### Scope

```text
Astro site (existing ramalapure.github.io repo)
        +
/learn/ route + @astrojs/react
        +
Child-friendly UI (isolated from portfolio)
        +
Activity Engine
        +
6 Activity Types
        +
5 Subjects
        +
50+ Activities
        +
Stars / Rewards
        +
Local Progress
        +
Parent Mode
        +
Lab project page → /learn/
```

### Explicitly out of scope

```text
Backend
Database
Authentication
LLM
Generative AI
Cloud synchronization
Payments
Social features
Teacher accounts
Complex analytics
```

This keeps the first version **small enough to actually finish**, while ensuring the architecture is strong enough to evolve into a real learning platform.