'use client'

import { Card, CardContent, Button } from '@/components/ui'
import { useI18n } from '@/lib/i18n'

interface LearningObjectivesProps {
    objectives: string[]
    onComplete: () => void
}

export function LearningObjectives({ objectives, onComplete }: LearningObjectivesProps) {
    const { t } = useI18n()

    return (
        <Card>
            <CardContent>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{t.objectives.title}</h2>
                        <p className="text-sm text-muted">{t.course.module} 1 · 2 {t.course.minutes}</p>
                    </div>
                </div>

                <p className="text-muted mb-6">{t.objectives.afterLearning}</p>

                <ul className="space-y-4 mb-8">
                    {objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium shrink-0 mt-0.5">
                                {index + 1}
                            </div>
                            <span className="text-foreground leading-relaxed">{objective}</span>
                        </li>
                    ))}
                </ul>

                <div className="flex justify-end">
                    <Button onClick={onComplete}>
                        {t.common.next}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
