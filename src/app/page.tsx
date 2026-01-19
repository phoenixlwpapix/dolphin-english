'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Header } from '@/components/layout'
import {
  Button,
  Card,
  CardContent,
  ProgressBar,
  PlusIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
} from '@/components/ui'
import { useI18n } from '@/lib/i18n'
import { CreateCourseModal } from '@/components/course/CreateCourseModal'
import { TOTAL_MODULES, DIFFICULTY_CONFIG } from '@/lib/constants'

function getProgressPercentage(completedModules: number[] | undefined): number {
  if (!completedModules) return 0
  return Math.round((completedModules.length / TOTAL_MODULES) * 100)
}

export default function HomePage() {
  const { t } = useI18n()
  const coursesData = useQuery(api.courses.list)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const isLoading = coursesData === undefined

  function formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="w-5 h-5" />
          {t.home.newCourse}
        </Button>
      </Header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">{t.home.myCourses}</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : coursesData.length === 0 ? (
          // Empty state
          <Card variant="outlined" className="py-16 text-center">
            <CardContent>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
                <BookOpenIcon className="w-10 h-10 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t.home.noCourses}</h3>
              <p className="text-muted-foreground mb-6">{t.home.noCoursesDesc}</p>
              <Button size="lg" onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon className="w-5 h-5" />
                {t.home.newCourse}
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Course grid
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coursesData.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                t={t}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </main>

      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          // Convex will automatically refetch due to real-time subscription
        }}
      />
    </div>
  )
}

interface CourseWithProgress {
  _id: string
  title: string
  difficulty: 'A2' | 'A2+' | 'B1'
  wordCount: number
  _creationTime: number
  progress: {
    currentModule: number
    completedModules: number[]
    _creationTime: number
  } | null
}

interface CourseCardProps {
  course: CourseWithProgress
  t: ReturnType<typeof useI18n>['t']
  formatDate: (timestamp: number) => string
}

function CourseCard({ course, t, formatDate }: CourseCardProps) {
  const progressPercent = getProgressPercentage(course.progress?.completedModules)
  const hasProgress = course.progress !== null

  // Border color based on difficulty
  const borderColor = course.difficulty === 'A2'
    ? 'border-l-emerald-500'
    : course.difficulty === 'A2+'
      ? 'border-l-amber-500'
      : 'border-l-blue-500'

  // Badge style based on difficulty (lighter, more readable)
  const badgeStyle = course.difficulty === 'A2'
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : course.difficulty === 'A2+'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-blue-700 bg-blue-50 border-blue-200'

  // Progress ring color
  const progressColor = progressPercent === 100
    ? 'stroke-success'
    : progressPercent > 0
      ? 'stroke-primary'
      : 'stroke-border'

  // SVG circle properties for progress ring
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <a href={`/course/${course._id}`} className="block group">
      <Card
        interactive
        className={`h-full border-l-4 ${borderColor} ring-1 ring-border/50 transition-all duration-300 ease-out group-hover:ring-2 group-hover:ring-primary/30 group-hover:-translate-y-1 overflow-hidden`}
      >
        <CardContent className="p-5">
          {/* Title section */}
          <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-border/50">
            <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold tracking-wide shrink-0 border ${badgeStyle}`}
            >
              {course.difficulty}
            </span>
          </div>

          {/* Content section with stats and progress */}
          <div className="flex items-end justify-between gap-4">
            {/* Left: Stats */}
            <div className="flex-1 space-y-2">
              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ChartBarIcon className="w-3.5 h-3.5" />
                  <span>{course.wordCount} {t.create.wordCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>{formatDate(course._creationTime).split(' ')[0]}</span>
                </div>
              </div>

              {/* Last studied time */}
              {hasProgress && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ClockIcon className="w-3.5 h-3.5 text-accent" />
                  <span>{t.home.lastStudied}: {formatDate(course.progress!._creationTime)}</span>
                </div>
              )}
            </div>

            {/* Right: Circular progress indicator */}
            <div className="relative w-11 h-11 shrink-0">
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 40 40">
                {/* Background circle */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  strokeWidth="3"
                  className="stroke-muted"
                />
                {/* Progress circle */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className={`${progressColor} transition-all duration-500`}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                  }}
                />
              </svg>
              {/* Percentage text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[10px] font-bold ${progressPercent === 100
                    ? 'text-success'
                    : progressPercent > 0
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}>
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}

