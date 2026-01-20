"use client";

import {
  Card,
  CardContent,
  Button,
  ClipboardCheckIcon,
  ChevronRightIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { BilingualObjective } from "@/lib/schemas";

interface LearningObjectivesProps {
  objectives: BilingualObjective[];
  onComplete: () => void;
}

export function LearningObjectives({
  objectives,
  onComplete,
}: LearningObjectivesProps) {
  const { t, language } = useI18n();

  // Get the text for an objective based on current language
  const getObjectiveText = (objective: BilingualObjective): string => {
    return language === "zh" ? objective.zh : objective.en;
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <ClipboardCheckIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {t.objectives.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t.course.module} 1 · 2 {t.course.minutes}
            </p>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">
          {t.objectives.afterLearning}
        </p>

        <ul className="space-y-4 mb-8">
          {objectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium shrink-0 mt-0.5">
                {index + 1}
              </div>
              <span className="text-foreground leading-relaxed text-lg">
                {getObjectiveText(objective)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex justify-end">
          <Button onClick={onComplete}>
            {t.common.next}
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
