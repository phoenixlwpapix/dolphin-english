'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Header } from '@/components/layout'
import { Button, Card, CardContent, ProgressBar } from '@/components/ui'
import { useI18n } from '@/lib/i18n'
import { CreateCourseModal } from '@/components/course/CreateCourseModal'

const TOTAL_MODULES = 6

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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
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
                <svg
                  className="w-10 h-10 text-primary-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t.home.noCourses}</h3>
              <p className="text-muted-foreground mb-6">{t.home.noCoursesDesc}</p>
              <Button size="lg" onClick={() => setIsCreateModalOpen(true)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
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

function CourseCard({ course, progress, t, formatDate }: CourseCardProps & { progress?: CourseWithProgress['progress'] }) {
  const progressPercent = getProgressPercentage(course.progress?.completedModules)

  const difficultyConfig = {
    A2: { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400', label: 'Elementary' },
    'A2+': { color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400', label: 'Upper Elementary' },
    B1: { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400', label: 'Intermediate' },
  }

  const config = difficultyConfig[course.difficulty]

  return (
    <a href={`/course/${course._id}`} className="block group">
      <Card interactive className="h-full border-transparent ring-1 ring-border transition-all duration-300 ease-out group-hover:shadow-xl group-hover:-translate-y-1 group-hover:border-primary/20 dark:group-hover:border-primary/40 overflow-hidden">
        <div className={`h-2 w-full ${course.difficulty === 'A2' ? 'bg-emerald-500' : course.difficulty === 'A2+' ? 'bg-amber-500' : 'bg-blue-500'}`} />
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 gap-4">
            <h3 className="text-lg font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <span
              className={`
                px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shrink-0
                ${config.color}
              `}
            >
              {course.difficulty}
            </span>
          </div>

          {/* Creation Date & Stats */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center text-xs text-muted-foreground font-medium">
              <svg className="w-3.5 h-3.5 mr-1.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{t.common?.created || 'Created'}: {formatDate(course._creationTime)}</span>
            </div>

            <div className="flex items-center text-xs text-muted-foreground font-medium">
              <svg className="w-3.5 h-3.5 mr-1.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>{course.wordCount} {t.create.wordCount}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-auto">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.home.progress}</span>
              <span className="text-sm font-bold text-foreground">{progressPercent}%</span>
            </div>
            <ProgressBar
              value={progressPercent}
              size="sm"
              variant={progressPercent === 100 ? 'success' : 'default'}
              className="h-1.5"
            />
          </div>
        </CardContent>
      </Card>
    </a>
  )
}
