# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dolphin English is an English learning application that transforms articles into structured 30-minute learning courses. It serves learners from A1 to C2 CEFR levels with AI-powered analysis and bilingual (English/Chinese) support.

## Development Commands

### Development
```bash
# Start both Next.js and Convex concurrently (recommended)
pnpm dev

# Or start separately in two terminals:
pnpm dev:next    # Next.js frontend only
pnpm dev:convex  # Convex backend only
```

### Build & Lint
```bash
pnpm build       # Build Next.js for production
pnpm lint        # Run ESLint
```

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Convex (real-time database and serverless functions)
- **Styling**: Tailwind CSS 4
- **Charts**: recharts (used in analytics dashboard)
- **AI**: Google Gemini 3 Flash (via @ai-sdk/google) for article analysis
- **Auth**: @convex-dev/auth
- **Validation**: Zod

## Architecture

### Data Model

#### Core Tables

1. **courses** - Article metadata and AI analysis
   - Contains article content, difficulty level, word count
   - Stores AI-analyzed data (learning objectives, paragraphs, vocabulary, quiz questions)
   - Can be public (admin-created) or private (user-created)

2. **userCourses** - User enrollment junction table
   - Links users to courses they've joined
   - Tracks when courses were added
   - Private courses auto-add creator; public courses require manual join

3. **progress** - Learning progress tracking
   - One progress record per course (not per user-course)
   - Tracks current module, completed modules, quiz results, vocabulary clicks
   - `moduleCompletions` (optional): array of `{ moduleNumber, completedAt }` timestamps
   - `lastStudiedAt` (optional): Unix timestamp of last activity

4. **learningPaths** - Course collections / learning paths
   - Bilingual titles and descriptions (titleEn/Zh, descriptionEn/Zh)
   - Ordered list of course IDs (`courseIds`)
   - Difficulty level (CEFR), optional cover gradient, author ID
   - Can be public (admin-created)

5. **userPaths** - User-path enrollment junction table
   - Links users to learning paths they've joined
   - Indexed by userId and userId+pathId
   - Joining a path auto-enrolls user in all contained courses

### Convex Backend Structure

All backend logic lives in `convex/`:
- `schema.ts` - Database schema definitions; exports shared `difficultyValidator`
- `courses.ts` - Course CRUD operations (create, list, listPublic, get, getPreview, delete, updateAnalysis)
- `userCourses.ts` - User course enrollment (addCourse, removeCourse, listMyCourses, isJoined)
- `progress.ts` - Progress tracking (get, create, updateCurrentModule, completeModule, saveQuizResults, recordVocabularyClick, reset); writes `moduleCompletions` and `lastStudiedAt` timestamps
- `analytics.ts` - Aggregates user study data: summary stats, quiz accuracy by question type, vocabulary mastery by CEFR level, daily activity heatmap, weekly trends
- `learningPaths.ts` - Learning path CRUD + join/leave; admin mutations (create, update, remove), user mutations (joinPath, leavePath), queries (listPublic, get, listMyPaths, isJoined)
- `auth.ts` / `auth.config.ts` - Authentication setup
- `users.ts` - User management

### Learning Module System

The app consists of 6 sequential learning modules defined in `src/lib/constants.ts`:
1. Learning Objectives (2 min)
2. Full Listening (6 min) - Complete article playback with TTS
3. Paragraph Analysis (12 min) - Detailed breakdown with language points
4. Vocabulary Learning (5 min) - Three-tier vocabulary (essential, transferable, extended)
5. Comprehension Quiz (5 min) - Multiple-choice questions testing understanding
6. Content Reproduction (2 min) - Timeline sorting + keyword retelling

Each module component lives in `src/components/modules/`.

### AI Analysis Pipeline

Article analysis happens via API route at `src/app/api/analyze/route.ts`:
1. User submits text (min 100 words)
2. Backend calls Google Gemini 3 Flash with structured prompt
3. AI generates bilingual content: learning objectives, paragraph summaries, language points, vocabulary, quiz questions
4. Response validated against Zod schema (`src/lib/schemas/article.ts`)
5. Client receives structured data and creates course via Convex mutation

The analysis is bilingual by design - all summaries, explanations, and learning objectives include both English and Chinese versions.

### Internationalization (i18n)

Located in `src/lib/i18n/`:
- `translations/zh.ts` - Chinese translations (also defines the `Translations` TypeScript interface)
- `translations/en.ts` - English translations
- `index.ts` - i18n context provider

Usage pattern: `const { t, language } = useI18n()`. Language switching affects all UI elements. Content (articles, AI analysis) is inherently bilingual.

### Authentication & Authorization

- Uses @convex-dev/auth for authentication
- User roles: "user" (default) or "admin"
- Only admins can create public courses (`isPublic: true`) and learning paths
- Course deletion rules:
  - Public courses: Only admin author can delete
  - Private courses: Only author can delete
- Path deletion: Only admin author can delete; cascade-deletes all userPaths records

### Custom Fonts

Three custom fonts are used:
- **Outfit** - Main UI font (body text)
- **Mali** - English handwriting font
- **ZCOOL KuaiLe** - Chinese handwriting font

Fonts are loaded in `src/app/layout.tsx` and stored in `public/fonts/`.

## Key Files

### Routes
- `src/app/page.tsx` - Homepage with course list, path creation modal
- `src/app/course/[id]/page.tsx` - Main course learning interface
- `src/app/course/[id]/preview/page.tsx` - Public course preview (for non-enrolled users)
- `src/app/path/[id]/page.tsx` - Path detail page (enrolled) with vertical course timeline
- `src/app/path/[id]/preview/page.tsx` - Path preview page (browse/join)
- `src/app/api/analyze/route.ts` - AI article analysis endpoint (60s timeout)
- `src/app/api/ocr/route.ts` - OCR endpoint for image-to-text

### Components
- `src/components/modules/` - 6 learning module components
- `src/components/home/Dashboard.tsx` - Main dashboard with tab switching (my courses, public courses, paths, analytics, settings)
- `src/components/layout/Sidebar.tsx` - Sidebar navigation; defines `SidebarTab` type: `"public" | "my" | "settings" | "analytics" | "paths"`
- `src/components/analytics/` - Analytics dashboard: AnalyticsDashboard, SummaryCards, QuizAccuracyChart, VocabularyMasteryChart, ActivityHeatmap, StudyTimeTrends
- `src/components/paths/` - Learning paths: PathCard, PathsView, CreatePathModal
- `src/components/course/CreateCourseModal.tsx` - Course creation modal with text/image input
- `src/components/ui/` - Shared UI components (Button, Card, Modal, ConfirmModal, Icons, Progress, LanguageSwitcher)

### Config
- `src/lib/constants.ts` - Module timing, difficulty levels (`DIFFICULTY_CONFIG`), CEFR color schemes, `PATH_GRADIENTS`

## Important Patterns

### Convex Validators
Validators are duplicated in both `convex/schema.ts` and individual query/mutation files. This is intentional - schema validators define database structure, while function validators define API contracts. A shared `difficultyValidator` is exported from `schema.ts` for reuse across tables.

### Progress Management
- Progress is NOT tied to userId in the database
- Progress records are created when a course begins
- Filtering by user happens through the userCourses junction table
- Analytics query works around this by going through userCourses -> courseIds -> progress

### Dashboard Tab System
- `SidebarTab` type controls which view is displayed in the Dashboard
- Tabs: "my" (My Courses with in-progress/completed separation), "public" (Public Courses), "paths" (Learning Paths), "analytics" (Analytics Dashboard), "settings" (Account Settings)
- Mobile has a tab switcher with icon buttons for each tab

### Learning Paths
- Admins group public courses into ordered sequences
- Joining a path batch-enrolls user in all courses via `userCourses` (skipping already-joined)
- Leaving a path removes only the `userPaths` record; courses and progress are preserved
- Progress is derived: count courses where `completedModules.length === TOTAL_MODULES`
- PathCard links to `/path/[id]/preview` (browsing) or `/path/[id]` (enrolled)

### Word Count
Word counts are calculated at creation time using `.split(/\s+/)` and stored, not computed dynamically. This is done in `src/app/api/analyze/route.ts:62`.

### CEFR Difficulty Levels
11 levels supported: A1, A1+, A2, A2+, B1, B1+, B2, B2+, C1, C1+, C2. Each has associated color scheme, border, accent gradient, and label defined in `DIFFICULTY_CONFIG`.

## Development Notes

- This is a pnpm workspace project (see `pnpm-workspace.yaml`)
- Convex functions use the Edge Runtime (fast, globally distributed)
- TTS is browser-native (Web Speech API), not a cloud service
- All dates are stored as Unix timestamps (milliseconds)
- The app assumes authenticated users for most operations (uses `auth.getUserId(ctx)`)
- Icons: all icons come from lucide-react, wrapped in `src/components/ui/Icons.tsx`

## Deployment Reminders

- **Convex backend deployment**: If any files under `convex/` are modified (schema, mutations, queries, etc.), remind the user to run `npx convex deploy` to deploy changes to production. The dev environment (`pnpm dev:convex`) syncs automatically, but production requires manual deployment.
- **Frontend deployment**: Frontend code changes require a rebuild and redeployment (depends on the user's deployment platform, e.g. Vercel).
