# Dolphin English

Turn every article into an English lesson.

An English learning app for A1-C2 learners that transforms real-world articles into structured 30-minute courses with AI-powered analysis and bilingual (English/Chinese) support.

## Features

### Six Learning Modules

1. **Learning Objectives** - Clear goals for each lesson
2. **Full Listening** - Complete article playback with TTS
3. **Paragraph Analysis** - Sentence-by-sentence breakdown with language points
4. **Vocabulary Learning** - Three-tier vocabulary (essential, transferable, extended)
5. **Comprehension Quiz** - Multiple-choice questions testing understanding
6. **Content Reproduction** - Timeline sorting + keyword retelling

### Core Capabilities

- **AI Analysis** - Automatic difficulty detection, vocabulary extraction, and quiz generation via Google Gemini
- **CEFR Levels** - Full support for A1 through C2 (11 levels including plus tiers)
- **Bilingual UI** - Switch between English and Chinese interface
- **Learning Paths** - Admins can group courses into ordered sequences; users join paths to auto-enroll in all courses
- **Analytics Dashboard** - Track study activity, quiz accuracy, vocabulary mastery, and weekly trends
- **Progress Tracking** - Real-time progress saving with resume support
- **TTS Playback** - Browser-native speech synthesis with sentence highlighting
- **Course Separation** - In-progress and completed courses displayed separately

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router), React 19, TypeScript
- **Database**: [Convex](https://convex.dev/) (real-time database + serverless functions)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/) (analytics dashboard)
- **AI**: Google Gemini 3 Flash (via @ai-sdk/google)
- **Auth**: @convex-dev/auth
- **Fonts**: Outfit (body) + Mali (English handwriting) + ZCOOL KuaiLe (Chinese handwriting)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Install Dependencies

```bash
pnpm install
```

### Configure Environment Variables

Create a `.env.local` file:

```env
# Convex
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Google AI (for article analysis)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
```

### Start Development Server

```bash
# Start both Next.js and Convex concurrently
pnpm dev

# Or start separately:
pnpm dev:next    # Next.js frontend only
pnpm dev:convex  # Convex backend only
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
dolphin-english/
├── convex/                  # Convex backend
│   ├── schema.ts            # Database schema (courses, progress, learningPaths, etc.)
│   ├── courses.ts           # Course CRUD
│   ├── userCourses.ts       # User enrollment
│   ├── progress.ts          # Progress tracking with timestamps
│   ├── analytics.ts         # Study analytics aggregation
│   ├── learningPaths.ts     # Learning path CRUD + join/leave
│   └── users.ts             # User management
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes (analyze, ocr)
│   │   ├── course/[id]/     # Course pages (learn + preview)
│   │   ├── path/[id]/       # Path pages (detail + preview)
│   │   └── page.tsx         # Homepage
│   ├── components/
│   │   ├── analytics/       # Analytics dashboard (6 chart components)
│   │   ├── course/          # Course creation modal
│   │   ├── home/            # Dashboard + landing page
│   │   ├── layout/          # Header + sidebar navigation
│   │   ├── modules/         # 6 learning module components
│   │   ├── paths/           # Learning paths (card, view, create modal)
│   │   └── ui/              # Shared UI (Button, Card, Modal, Icons, etc.)
│   └── lib/
│       ├── i18n/            # Internationalization (en + zh)
│       ├── schemas/         # Zod validation schemas
│       └── constants.ts     # Module timing, CEFR config, path gradients
└── public/                  # Static assets + fonts
```

## Usage

1. **Create a Course** - Paste an English article (100+ words) or upload an image
2. **AI Analysis** - The system analyzes the article and generates structured learning content
3. **Study** - Complete six learning modules in sequence
4. **Track Progress** - View your analytics dashboard for study insights

### Learning Paths (Admin)

1. Navigate to the Paths tab in the sidebar
2. Click "Create Path" to group public courses into an ordered sequence
3. Set bilingual titles, difficulty level, and cover gradient
4. Users can browse and join paths, auto-enrolling in all contained courses

## Internationalization

The app supports bilingual interface switching:

- Chinese - UI language + ZCOOL KuaiLe handwriting font
- English - UI language + Mali handwriting font

All AI-generated content (summaries, language points, vocabulary) is bilingual by design.

## License

MIT License
