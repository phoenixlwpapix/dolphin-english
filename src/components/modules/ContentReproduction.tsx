"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Button,
  CheckCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  EditIcon,
  HomeIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { ParagraphAnalysis as ParagraphData } from "@/lib/schemas";

/** Maximum number of keywords to display */
const MAX_KEYWORDS = 6;

/** Fixed number of timeline items for sorting exercise */
const TIMELINE_ITEMS_COUNT = 6;

interface ContentReproductionProps {
  paragraphs: ParagraphData[];
  onComplete: () => void;
  onFinish?: () => void;
}

export function ContentReproduction({
  paragraphs,
  onComplete,
  onFinish,
}: ContentReproductionProps) {
  const { t, language } = useI18n();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Generate timeline items from paragraphs - fixed to 6 items for consistent difficulty
  const timelineItems = useMemo(() => {
    const totalParagraphs = paragraphs.length;

    if (totalParagraphs <= TIMELINE_ITEMS_COUNT) {
      // Use all paragraphs if 6 or fewer
      return paragraphs.map((p, i) => ({
        id: i,
        summary: p.summary,
      }));
    }

    // Evenly select 6 paragraphs from the article
    const selectedIndices: number[] = [];
    const step = totalParagraphs / TIMELINE_ITEMS_COUNT;

    for (let i = 0; i < TIMELINE_ITEMS_COUNT; i++) {
      const index = Math.min(Math.floor(i * step), totalParagraphs - 1);
      if (!selectedIndices.includes(index)) {
        selectedIndices.push(index);
      }
    }

    // Fill in missing slots if needed (due to rounding)
    let nextIndex = 0;
    while (selectedIndices.length < TIMELINE_ITEMS_COUNT && nextIndex < totalParagraphs) {
      if (!selectedIndices.includes(nextIndex)) {
        selectedIndices.push(nextIndex);
      }
      nextIndex++;
    }

    // Sort indices to maintain order and create items with sequential IDs
    selectedIndices.sort((a, b) => a - b);

    return selectedIndices.map((originalIndex, newId) => ({
      id: newId,
      summary: paragraphs[originalIndex].summary,
    }));
  }, [paragraphs]);

  const exercises = [
    { type: "timeline" as const, title: t.reproduction.timeline },
    { type: "keywords" as const, title: t.reproduction.retelling },
  ];

  const handleExerciseComplete = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircleIcon className="w-10 h-10 text-success" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t.common.complete}!
          </h2>
          <p className="text-muted-foreground mb-6">
            {t.reproduction.courseComplete}
          </p>

          <Button
            onClick={() => {
              onComplete();
              onFinish?.();
            }}
            size="lg"
          >
            {t.reproduction.backToHome}
            <HomeIcon className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <EditIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {t.reproduction.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t.course.module} 6 · 2 {t.course.minutes}
            </p>
          </div>
        </div>

        {/* Exercise tabs */}
        <div className="flex gap-2 mb-6">
          {exercises.map((ex, i) => (
            <span
              key={i}
              className={`
                px-3 py-1 rounded-full text-sm
                ${
                  i === currentExercise
                    ? "bg-primary-500 text-white"
                    : i < currentExercise
                      ? "bg-success/20 text-success"
                      : "bg-surface text-muted-foreground"
                }
              `}
            >
              {ex.title}
            </span>
          ))}
        </div>

        {currentExercise === 0 && (
          <TimelineExercise
            items={timelineItems}
            onComplete={handleExerciseComplete}
            t={t}
          />
        )}
        {currentExercise === 1 && (
          <KeywordExercise
            paragraphs={paragraphs}
            onComplete={handleExerciseComplete}
            t={t}
            language={language}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Timeline ordering exercise
interface TimelineExerciseProps {
  items: { id: number; summary: string }[];
  onComplete: () => void;
  t: ReturnType<typeof useI18n>["t"];
}

function TimelineExercise({ items, onComplete, t }: TimelineExerciseProps) {
  const [orderedItems, setOrderedItems] = useState(() => {
    // Shuffle items
    return [...items].sort(() => Math.random() - 0.5);
  });
  const [isChecked, setIsChecked] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isCorrect = orderedItems.every((item, index) => item.id === index);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...orderedItems];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setOrderedItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleCheck = () => {
    setIsChecked(true);
  };

  const handleRetry = () => {
    // Re-shuffle items and reset checked state
    setOrderedItems([...items].sort(() => Math.random() - 0.5));
    setIsChecked(false);
  };

  return (
    <div>
      <p className="text-muted-foreground mb-4">{t.reproduction.dragToSort}</p>

      <div className="space-y-2 mb-6">
        {orderedItems.map((item, index) => {
          let itemStyle = "border-border bg-surface";
          if (isChecked) {
            itemStyle =
              item.id === index
                ? "border-success bg-success/10"
                : "border-error bg-error/10";
          }

          return (
            <div
              key={item.id}
              draggable={!isChecked}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                p-3 rounded-lg border flex items-center gap-3 transition-colors
                ${itemStyle}
                ${!isChecked ? "cursor-grab active:cursor-grabbing" : ""}
              `}
            >
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold shrink-0">
                {index + 1}
              </span>
              <span className="text-foreground text-base">{item.summary}</span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3">
        {!isChecked ? (
          <Button onClick={handleCheck}>{t.quiz.checkAnswer}</Button>
        ) : isCorrect ? (
          <Button onClick={onComplete}>
            {t.common.next}
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleRetry} variant="secondary">
            {t.reproduction.tryAgain}
          </Button>
        )}
      </div>
    </div>
  );
}

// Keyword-based retelling exercise
interface KeywordExerciseProps {
  paragraphs: ParagraphData[];
  onComplete: () => void;
  t: ReturnType<typeof useI18n>["t"];
  language: "zh" | "en";
}

function KeywordExercise({
  paragraphs,
  onComplete,
  t,
  language,
}: KeywordExerciseProps) {
  // Helper function to get summary based on current language
  const getSummary = (p: ParagraphData): string => {
    return language === "zh" ? p.summaryZH : p.summary;
  };

  // Extract keywords from language points
  const keywords = useMemo(() => {
    const words: string[] = [];
    paragraphs.forEach((p) => {
      p.languagePoints.forEach((lp) => {
        // Extract the first word/phrase from each language point
        const match = lp.point.match(/\b\w+\b/);
        if (match) words.push(match[0]);
      });
    });
    return words.slice(0, MAX_KEYWORDS);
  }, [paragraphs]);

  return (
    <div>
      <p className="text-muted-foreground mb-4">{t.reproduction.keywordHint}</p>

      <div className="flex flex-wrap gap-2 mb-6 p-4 bg-surface rounded-lg">
        {keywords.map((keyword, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-base font-medium"
          >
            {keyword}
          </span>
        ))}
      </div>

      <div className="bg-surface rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground mb-2">
          {t.reproduction.keySummaries}
        </p>
        <ul className="space-y-2">
          {paragraphs.map((p, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-base text-foreground"
            >
              <span className="text-primary-500">•</span>
              <span>{getSummary(p)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end">
        <Button onClick={onComplete}>
          {t.common.complete}
          <CheckIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
