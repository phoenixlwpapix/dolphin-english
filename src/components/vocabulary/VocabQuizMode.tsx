"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  Button,
  BrainIcon,
  SparklesIcon,
  CheckFilledIcon,
  XFilledIcon,
  ChevronRightIcon,
  RotateCwIcon,
  LayersIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { tts } from "@/lib/tts";

interface VocabWord {
  word: string;
  definition: string;
  definitionCN?: string;
  category: "essential" | "transferable" | "extended";
  difficulty?: string;
}

interface QuizQuestion {
  type: "definition" | "fillBlank" | "translate";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  explanationCN: string;
  targetWord: string;
}

interface VocabQuizModeProps {
  words: VocabWord[];
  onBack: () => void;
}

type QuizPhase = "setup" | "loading" | "active" | "result";

export function VocabQuizMode({ words, onBack }: VocabQuizModeProps) {
  const { t, language } = useI18n();

  const [phase, setPhase] = useState<QuizPhase>("setup");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<{ questionIndex: number; selected: number; correct: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(Math.min(words.length, 10));

  const hasEnoughWords = words.length >= 4;

  // Determine the most common difficulty level
  const avgDifficulty = useMemo(() => {
    const diffs = words.map((w) => w.difficulty).filter(Boolean);
    if (diffs.length === 0) return "B1";
    // Return the most frequent difficulty
    const freq: Record<string, number> = {};
    for (const d of diffs) {
      freq[d!] = (freq[d!] || 0) + 1;
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  }, [words]);

  const startQuiz = useCallback(async () => {
    setPhase("loading");
    setError(null);

    try {
      // Select random words for the quiz
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      const selectedWords = shuffled.slice(0, questionCount);

      const res = await fetch("/api/vocab-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: selectedWords.map((w) => ({
            word: w.word,
            definition: w.definition,
            definitionCN: w.definitionCN,
            category: w.category,
          })),
          difficulty: avgDifficulty,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await res.json();
      setQuestions(data.questions);
      setCurrentQ(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setResults([]);
      setPhase("active");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quiz generation failed");
      setPhase("setup");
    }
  }, [words, questionCount, avgDifficulty]);

  const handleSelectOption = useCallback((index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  }, [isAnswered]);

  const handleCheckAnswer = useCallback(() => {
    if (selectedOption === null) return;
    setIsAnswered(true);

    const question = questions[currentQ];
    setResults((prev) => [
      ...prev,
      {
        questionIndex: currentQ,
        selected: selectedOption,
        correct: question.correctIndex,
      },
    ]);

    // Play pronunciation of the target word
    tts.speak(question.targetWord, { rate: 0.8 });
  }, [selectedOption, questions, currentQ]);

  const handleNextQuestion = useCallback(() => {
    if (currentQ + 1 >= questions.length) {
      setPhase("result");
    } else {
      setCurrentQ((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  }, [currentQ, questions.length]);

  const handleRetry = useCallback(() => {
    setPhase("setup");
    setQuestions([]);
    setResults([]);
    setCurrentQ(0);
    setSelectedOption(null);
    setIsAnswered(false);
  }, []);

  const score = results.filter((r) => r.selected === r.correct).length;
  const wrongAnswers = results.filter((r) => r.selected !== r.correct);

  // Setup phase
  if (phase === "setup") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-2 border-dashed border-accent/30">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center">
              <BrainIcon className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t.vocabPractice.quizTitle}
              </h3>
              <p className="text-muted-foreground">
                {t.vocabPractice.quizDesc}
              </p>
            </div>

            {!hasEnoughWords ? (
              <p className="text-sm text-warning bg-warning/10 px-4 py-2 rounded-xl">
                {t.vocabPractice.needMoreWords}
              </p>
            ) : (
              <>
                {/* Question count selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t.vocabPractice.quizWordCount}
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[5, 10, 15].filter((n) => n <= words.length).map((n) => (
                      <button
                        key={n}
                        onClick={() => setQuestionCount(n)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          questionCount === n
                            ? "bg-accent text-white shadow-md shadow-accent/25"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    {words.length > 15 && (
                      <button
                        onClick={() => setQuestionCount(words.length)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          questionCount === words.length
                            ? "bg-accent text-white shadow-md shadow-accent/25"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {language === "zh" ? "全部" : "All"} ({words.length})
                      </button>
                    )}
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-error bg-error/10 px-4 py-2 rounded-xl">
                    {error}
                  </p>
                )}

                <Button variant="primary" onClick={startQuiz} className="rounded-xl px-8">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  {t.vocabPractice.startQuiz}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading phase
  if (phase === "loading") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center animate-pulse-soft">
              <SparklesIcon className="w-8 h-8 text-accent" />
            </div>
            <p className="text-lg font-medium text-foreground">
              {t.vocabPractice.generating}
            </p>
            <div className="w-48 h-1.5 mx-auto bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full animate-shimmer" style={{ width: "60%" }} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Result phase
  if (phase === "result") {
    const percentage = Math.round((score / questions.length) * 100);
    const gradeColor = percentage >= 80 ? "text-success" : percentage >= 50 ? "text-warning" : "text-error";

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score card */}
        <Card className="border-2 border-accent/20">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <span className={`text-3xl font-bold ${gradeColor}`}>
                {percentage}%
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {t.vocabPractice.quizComplete}
            </h3>
            <p className="text-lg text-muted-foreground">
              {t.vocabPractice.quizScore
                .replace("{score}", String(score))
                .replace("{total}", String(questions.length))}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="primary" onClick={handleRetry} className="rounded-xl">
                <RotateCwIcon className="w-4 h-4 mr-2" />
                {t.vocabPractice.retryQuiz}
              </Button>
              <Button variant="secondary" onClick={onBack} className="rounded-xl">
                <LayersIcon className="w-4 h-4 mr-2" />
                {t.vocabPractice.backToCards}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wrong answers review */}
        {wrongAnswers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t.vocabPractice.quizReview} ({wrongAnswers.length})
            </h4>
            {wrongAnswers.map((r) => {
              const q = questions[r.questionIndex];
              return (
                <Card key={r.questionIndex} className="border border-error/20 bg-error/5">
                  <CardContent className="p-4 space-y-2">
                    <p className="font-medium text-foreground">{q.question}</p>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2">
                        <XFilledIcon className="w-4 h-4 text-error shrink-0" />
                        <span className="text-error">
                          {t.vocabPractice.yourAnswer}: {q.options[r.selected]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckFilledIcon className="w-4 h-4 text-success shrink-0" />
                        <span className="text-success">
                          {t.vocabPractice.correctAnswer}: {q.options[r.correct]}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                      {language === "zh" ? q.explanationCN : q.explanation}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Active quiz phase
  const question = questions[currentQ];
  const isCorrect = isAnswered && selectedOption === question.correctIndex;

  const typeLabel = {
    definition: language === "zh" ? "释义选择" : "Definition",
    fillBlank: language === "zh" ? "填空题" : "Fill in the Blank",
    translate: language === "zh" ? "中英匹配" : "Translation",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">
            {t.vocabPractice.questionOf
              .replace("{current}", String(currentQ + 1))
              .replace("{total}", String(questions.length))}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
            {typeLabel[question.type]}
          </span>
        </div>
        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <Card className="border-2 border-border">
        <CardContent className="p-6 space-y-6">
          {/* Question text */}
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground leading-relaxed">
              {question.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid gap-3">
            {question.options.map((option, index) => {
              let optionStyle = "border-border bg-surface hover:border-accent/40 hover:bg-accent/5 cursor-pointer";

              if (isAnswered) {
                if (index === question.correctIndex) {
                  optionStyle = "border-success bg-success/10 text-success";
                } else if (index === selectedOption && index !== question.correctIndex) {
                  optionStyle = "border-error bg-error/10 text-error";
                } else {
                  optionStyle = "border-border bg-muted/30 text-muted-foreground opacity-50";
                }
              } else if (index === selectedOption) {
                optionStyle = "border-accent bg-accent/10 ring-2 ring-accent/20 cursor-pointer";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full border-2 border-current/30 flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm font-medium">{option}</span>
                    {isAnswered && index === question.correctIndex && (
                      <CheckFilledIcon className="w-5 h-5 text-success ml-auto shrink-0" />
                    )}
                    {isAnswered && index === selectedOption && index !== question.correctIndex && (
                      <XFilledIcon className="w-5 h-5 text-error ml-auto shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {isAnswered && (
            <div
              className={`p-4 rounded-xl ${
                isCorrect ? "bg-success/10 border border-success/20" : "bg-error/10 border border-error/20"
              } animate-slide-up`}
            >
              <p className={`font-semibold mb-1 ${isCorrect ? "text-success" : "text-error"}`}>
                {isCorrect ? t.vocabPractice.correct : t.vocabPractice.incorrect}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "zh" ? question.explanationCN : question.explanation}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-center gap-3">
            {!isAnswered ? (
              <Button
                variant="primary"
                onClick={handleCheckAnswer}
                disabled={selectedOption === null}
                className="rounded-xl px-8"
              >
                {t.vocabPractice.checkAnswer}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNextQuestion}
                className="rounded-xl px-8"
              >
                {currentQ + 1 >= questions.length
                  ? t.vocabPractice.quizComplete
                  : t.vocabPractice.nextQuestion}
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
