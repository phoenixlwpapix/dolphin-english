"use client";

import { useState, useCallback, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardContent,
  Button,
  CheckIcon,
  WarningIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  CheckFilledIcon,
  XFilledIcon,
  RotateCwIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { QuizQuestion } from "@/lib/schemas";
import type { Id } from "../../../convex/_generated/dataModel";
import { ArticleReference } from "@/components/course";

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

interface ComprehensionQuizProps {
  questions: QuizQuestion[];
  courseId: Id<"courses">;
  articleContent: string;
  onComplete: () => void;
}

export function ComprehensionQuiz({
  questions,
  courseId,
  articleContent,
  onComplete,
}: ComprehensionQuizProps) {
  const { t } = useI18n();
  // Track which questions need to be answered (initially all)
  const [activeQuestionIds, setActiveQuestionIds] = useState<string[]>(() =>
    questions.map((q) => q.id),
  );
  // Current index within the active questions
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [showReference, setShowReference] = useState(false);
  // Track results for all questions across all rounds
  const [allResults, setAllResults] = useState<Map<string, QuizResult>>(
    new Map(),
  );
  // Track wrong answers in current round
  const [wrongInCurrentRound, setWrongInCurrentRound] = useState<string[]>([]);
  // Show retry screen between rounds
  const [showRetryScreen, setShowRetryScreen] = useState(false);
  // Final completion state
  const [isComplete, setIsComplete] = useState(false);
  // Round counter for display
  const [round, setRound] = useState(1);

  const saveQuizResultsMutation = useMutation(api.progress.saveQuizResults);

  // Get current active questions
  const activeQuestions = useMemo(
    () => questions.filter((q) => activeQuestionIds.includes(q.id)),
    [questions, activeQuestionIds],
  );

  const question = activeQuestions[currentIndex];
  const isCorrect = selectedAnswer === question?.correctAnswer;
  const isLastQuestion = currentIndex === activeQuestions.length - 1;

  const handleCheck = useCallback(() => {
    if (selectedAnswer === null || !question) return;
    setIsChecked(true);

    const result: QuizResult = {
      questionId: question.id,
      selectedAnswer,
      isCorrect: selectedAnswer === question.correctAnswer,
    };

    // Update all results
    setAllResults((prev) => {
      const newMap = new Map(prev);
      newMap.set(question.id, result);
      return newMap;
    });

    // Track wrong answers in current round
    if (!result.isCorrect) {
      setWrongInCurrentRound((prev) => [...prev, question.id]);
    }
  }, [selectedAnswer, question]);

  const handleNext = useCallback(async () => {
    if (isLastQuestion) {
      // Check if there are wrong answers in this round
      if (wrongInCurrentRound.length > 0) {
        // Show retry screen
        setShowRetryScreen(true);
      } else {
        // All correct! Save results and complete
        const finalResults = Array.from(allResults.values());
        await saveQuizResultsMutation({ courseId, results: finalResults });
        setIsComplete(true);
      }
    } else {
      // Move to next question
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsChecked(false);
      setShowReference(false);
    }
  }, [
    isLastQuestion,
    wrongInCurrentRound,
    allResults,
    courseId,
    currentIndex,
    saveQuizResultsMutation,
  ]);

  const handleRetry = useCallback(() => {
    // Set up next round with only wrong questions
    setActiveQuestionIds(wrongInCurrentRound);
    setWrongInCurrentRound([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsChecked(false);
    setShowReference(false);
    setShowRetryScreen(false);
    setRound((prev) => prev + 1);
  }, [wrongInCurrentRound]);

  // Calculate scores
  const totalQuestions = questions.length;
  const correctCount = Array.from(allResults.values()).filter(
    (r) => r.isCorrect,
  ).length;

  // Show retry screen
  if (showRetryScreen) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/20 flex items-center justify-center">
            <WarningIcon className="w-10 h-10 text-warning" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t.quiz.needsRetry}
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            {t.quiz.score}: {correctCount} / {totalQuestions}
          </p>
          <p className="text-base text-muted-foreground mb-6">
            {t.quiz.wrongCount.replace(
              "{count}",
              wrongInCurrentRound.length.toString(),
            )}
          </p>

          <Button onClick={handleRetry} size="lg">
            <RotateCwIcon className="w-5 h-5 mr-2" />
            {t.quiz.retryWrong}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show completion screen
  if (isComplete) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
            <CheckIcon className="w-10 h-10 text-success" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t.quiz.allCorrect}
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            {t.quiz.score}: {totalQuestions} / {totalQuestions}
          </p>

          <Button onClick={onComplete} size="lg">
            {t.common.next}
            <ChevronRightIcon className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Guard against undefined question
  if (!question) {
    return null;
  }

  const typeLabels: Record<string, string> = {
    "main-idea": t.quiz.questionTypes.mainIdea,
    detail: t.quiz.questionTypes.detail,
    vocabulary: t.quiz.questionTypes.vocabulary,
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <ClipboardListIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {t.quiz.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t.course.module} 5 · 5 {t.course.minutes}
              </p>
            </div>
          </div>
          <ArticleReference content={articleContent} />
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground">
          <span>
            {round > 1 && (
              <span className="text-warning mr-2">
                {t.quiz.round} {round}
              </span>
            )}
            {t.quiz.question} {currentIndex + 1} {t.quiz.of}{" "}
            {activeQuestions.length}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-surface text-xs">
            {typeLabels[question.type]}
          </span>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-xl font-medium text-foreground mb-4">
            {question.question}
          </h3>

          <div className="space-y-2">
            {question.options.map((option, index) => {
              let optionStyle =
                "border-border bg-surface hover:border-primary-300";
              if (isChecked) {
                if (index === question.correctAnswer) {
                  optionStyle = "border-success bg-success/10";
                } else if (index === selectedAnswer && !isCorrect) {
                  optionStyle = "border-error bg-error/10";
                }
              } else if (selectedAnswer === index) {
                optionStyle = "border-primary-500 bg-primary-50";
              }

              return (
                <button
                  key={index}
                  onClick={() => !isChecked && setSelectedAnswer(index)}
                  disabled={isChecked}
                  className={`
                    w-full p-4 rounded-lg border text-left transition-all
                    ${optionStyle}
                    ${isChecked ? "cursor-default" : "cursor-pointer"}
                  `}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-sm font-medium shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-foreground text-lg">{option}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        {isChecked && (
          <div
            className={`p-4 rounded-lg mb-6 ${isCorrect ? "bg-success/10" : "bg-error/10"}`}
          >
            <div className="flex items-center gap-2 font-medium">
              {isCorrect ? (
                <>
                  <CheckFilledIcon className="w-5 h-5 text-success" />
                  <span className="text-success">{t.quiz.correct}</span>
                </>
              ) : (
                <>
                  <XFilledIcon className="w-5 h-5 text-error" />
                  <span className="text-error">{t.quiz.incorrect}</span>
                </>
              )}
            </div>

            <button
              onClick={() => setShowReference(!showReference)}
              className="mt-2 text-sm text-primary-600 hover:underline"
            >
              {t.quiz.seeReference}
            </button>

            {showReference && (
              <div className="mt-3 p-3 bg-background rounded border border-border">
                <p className="text-base text-muted-foreground italic">
                  &ldquo;{question.sourceReference}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {!isChecked ? (
            <Button onClick={handleCheck} disabled={selectedAnswer === null}>
              {t.quiz.checkAnswer}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {isLastQuestion ? t.common.complete : t.common.next}
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
