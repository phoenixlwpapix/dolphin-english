# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dolphin English (海豚英语) is an English learning application that transforms articles into structured 30-minute learning courses. It serves learners from A1 to C2 CEFR levels with AI-powered analysis and bilingual (English/Chinese) support.

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
- **AI**: Google Gemini 3 Flash (via @ai-sdk/google) for article analysis
- **Auth**: @convex-dev/auth
- **Validation**: Zod

## Architecture

### Three-Tier Data Model

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

### Convex Backend Structure

All backend logic lives in `convex/`:
- `schema.ts` - Database schema definitions with Zod validators
- `courses.ts` - Course CRUD operations (create, list, get, delete, updateAnalysis)
- `userCourses.ts` - User course enrollment (addCourse, removeCourse, listMyCourses, isJoined)
- `progress.ts` - Progress tracking (get, create, updateCurrentModule, completeModule, saveQuizResults, recordVocabularyClick, reset)
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
- `translations/en.ts` - English translations
- `translations/zh.ts` - Chinese translations
- `index.ts` - i18n context provider

Language switching affects all UI elements. Content (articles, AI analysis) is inherently bilingual.

### Authentication & Authorization

- Uses @convex-dev/auth for authentication
- User roles: "user" (default) or "admin"
- Only admins can create public courses (isPublic: true)
- Course deletion rules:
  - Public courses: Only admin author can delete
  - Private courses: Only author can delete

### Custom Fonts

Three custom fonts are used:
- **Outfit** - Main UI font (body text)
- **Mali** - English handwriting font
- **ZCOOL KuaiLe** - Chinese handwriting font (中文手写)

Fonts are loaded in `src/app/layout.tsx` and stored in `public/fonts/`.

## Key Files

- `src/app/page.tsx` - Homepage with course list
- `src/app/course/[id]/page.tsx` - Main course learning interface
- `src/app/course/[id]/preview/page.tsx` - Public course preview (for non-enrolled users)
- `src/app/api/analyze/route.ts` - AI article analysis endpoint (60s timeout)
- `src/app/api/ocr/route.ts` - OCR endpoint for image-to-text
- `src/lib/constants.ts` - Module timing, difficulty levels, CEFR color schemes

## Important Patterns

### Convex Validators
Validators are duplicated in both `convex/schema.ts` and individual query/mutation files (e.g., `convex/courses.ts`). This is intentional - schema validators define database structure, while function validators define API contracts.

### Progress Management
- Progress is NOT tied to userId in the database
- Progress records are created when a course begins
- Filtering by user happens through the userCourses junction table

### Word Count
Word counts are calculated at creation time using `.split(/\s+/)` and stored, not computed dynamically. This is done in `src/app/api/analyze/route.ts:62`.

### CEFR Difficulty Levels
11 levels supported: A1, A1+, A2, A2+, B1, B1+, B2, B2+, C1, C1+, C2. Each has associated color scheme and label defined in `DIFFICULTY_CONFIG`.

## Development Notes

- This is a pnpm workspace project (see `pnpm-workspace.yaml`)
- Convex functions use the Edge Runtime (fast, globally distributed)
- TTS is browser-native (Web Speech API), not a cloud service
- All dates are stored as Unix timestamps (milliseconds)
- The app assumes authenticated users for most operations (uses `auth.getUserId(ctx)`)

## Deployment Reminders

- **Convex 后端部署**: 如果修改了 `convex/` 目录下的任何文件（schema、mutations、queries 等），需要提醒用户运行 `npx convex deploy` 将更改部署到生产环境。开发环境 (`pnpm dev:convex`) 会自动同步，但生产环境需要手动部署。
- **前端部署**: 前端代码修改后需要重新构建和部署（取决于用户的部署平台，如 Vercel 等）。
