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

  const difficultyColors = {
    A2: 'bg-success/20 text-success',
    'A2+': 'bg-warning/20 text-warning',
    B1: 'bg-info/20 text-info',
  }

  return (
    <a href={`/course/${course._id}`}>
      <Card interactive className="h-full">
        <CardContent>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-foreground line-clamp-2 flex-1 pr-2">
              {course.title}
            </h3>
            <span
              className={`
                px-2 py-0.5 rounded-full text-xs font-medium shrink-0
                ${difficultyColors[course.difficulty]}
              `}
            >
              {course.difficulty}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span>{course.wordCount} {t.create.wordCount}</span>
            {course.progress && (
              <span>
                {t.home.lastStudied}: {formatDate(course.progress._creationTime)}
              </span>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t.home.progress}</span>
              <span>{progressPercent}%</span>
            </div>
            <ProgressBar
              value={progressPercent}
              size="sm"
              variant={progressPercent === 100 ? 'success' : 'default'}
            />
          </div>
        </CardContent>
      </Card>
    </a>
  )
}
