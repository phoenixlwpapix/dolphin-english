"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
  courseFilter: string;
  categoryFilter: string;
  courses: Array<{ id: string; title: string; difficulty: string; count: number }>;
  onBack: () => void;
}

type QuizPhase = "setup" | "loading" | "active" | "result";

export function VocabQuizMode({
  words,
  courseFilter,
  categoryFilter,
  courses,
  onBack,
}: VocabQuizModeProps) {
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

  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (phase !== "loading") {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((s) => (s < 4 ? s + 1 : s));
    }, 1500);
    return () => clearInterval(interval);
  }, [phase]);

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
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        <Card className="border border-border/70 shadow-lg shadow-accent/5 rounded-2xl overflow-hidden">
          <CardContent className="p-10 text-center space-y-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/15 flex items-center justify-center border border-accent/20 animate-float-slow">
              <BrainIcon className="w-8 h-8 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground tracking-tight">
                {t.vocabPractice.quizTitle}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                {t.vocabPractice.quizDesc}
              </p>
            </div>

            {!hasEnoughWords ? (
              <p className="text-sm text-warning bg-warning/10 border border-warning/20 px-4 py-3 rounded-xl max-w-md mx-auto font-medium">
                {t.vocabPractice.needMoreWords}
              </p>
            ) : (
              <div className="space-y-6">
                {/* Quiz Configuration Summary */}
                <div className="bg-muted/40 border border-border/60 rounded-2xl p-5 max-w-md mx-auto space-y-2.5 text-left text-sm">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center mb-2">
                    {language === "zh" ? "当前测验范围" : "Quiz Configuration"}
                  </p>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground text-xs">{language === "zh" ? "筛选课文" : "Course"}:</span>
                    <span className="font-semibold text-foreground truncate max-w-[240px]">
                      {courseFilter === "all" 
                        ? (language === "zh" ? "全部课程" : "All Courses") 
                        : courses.find(c => c.id === courseFilter)?.title || "Selected Course"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4 border-t border-border/40 pt-2">
                    <span className="text-muted-foreground text-xs">{language === "zh" ? "词汇分类" : "Category"}:</span>
                    <span className="font-semibold text-foreground">
                      {categoryFilter === "all" 
                        ? (language === "zh" ? "全部分类" : "All Categories") 
                        : categoryFilter === "essential" 
                        ? t.vocabulary.essential 
                        : categoryFilter === "transferable" 
                        ? t.vocabulary.transferable 
                        : t.vocabulary.extended}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4 border-t border-border/40 pt-2">
                    <span className="text-muted-foreground text-xs">{language === "zh" ? "符合条件单词数" : "Matched Words"}:</span>
                    <span className="font-bold text-accent">{words.length}</span>
                  </div>
                </div>

                {/* Question count selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    {t.vocabPractice.quizWordCount}
                  </label>
                  <div className="flex items-center justify-center gap-3">
                    {[5, 10, 15].filter((n) => n <= words.length).map((n) => (
                      <button
                        key={n}
                        onClick={() => setQuestionCount(n)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                          questionCount === n
                            ? "bg-accent text-white shadow-md shadow-accent/25 scale-105"
                            : "bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    {words.length > 15 && (
                      <button
                        onClick={() => setQuestionCount(words.length)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                          questionCount === words.length
                            ? "bg-accent text-white shadow-md shadow-accent/25 scale-105"
                            : "bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground"
                        }`}
                      >
                        {language === "zh" ? "全部" : "All"} ({words.length})
                      </button>
                    )}
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-error bg-error/10 border border-error/20 px-4 py-2.5 rounded-xl max-w-md mx-auto">
                    {error}
                  </p>
                )}

                <Button variant="primary" onClick={startQuiz} className="rounded-xl px-10 py-3.5 shadow-lg shadow-accent/15 cursor-pointer hover:shadow-accent/25 transition-all">
                  <SparklesIcon className="w-4 h-4 mr-2 animate-pulse" />
                  {t.vocabPractice.startQuiz}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading phase
  if (phase === "loading") {
    const loadingStepsZH = [
      "AI 正在挑选你已复习的单词...",
      "正在匹配适合你的难度级别...",
      "正在使用 Gemini 构思针对性题目...",
      "正在生成选项并编写双语解析...",
      "答卷生成完毕，即将开始测试..."
    ];
    const loadingStepsEN = [
      "AI is selecting your reviewed words...",
      "Matching your difficulty level...",
      "Crafting targeted questions with Gemini...",
      "Generating options and bilingual explanations...",
      "Quiz is ready! Getting prepared..."
    ];

    return (
      <div className="max-w-2xl mx-auto animate-slide-up">
        <Card className="overflow-hidden border-border/70 shadow-xl shadow-accent/5">
          <CardContent className="p-16 text-center space-y-8">
            {/* Spinning & Pulsing glowing ring */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {/* Outer rotating dashed ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-accent/40 animate-spin [animation-duration:15s]" />
              {/* Inner glowing pulsing ring */}
              <div className="absolute -inset-2 rounded-full bg-accent/5 animate-pulse-soft" />
              {/* Central solid circle */}
              <div className="relative w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center shadow-lg shadow-accent/5 border border-accent/20">
                <SparklesIcon className="w-8 h-8 text-accent animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-foreground tracking-tight">
                {t.vocabPractice.generating}
              </h3>
              <p className="text-sm text-muted-foreground font-medium h-5 flex items-center justify-center animate-pulse transition-all duration-300">
                {language === "zh" ? loadingStepsZH[loadingStep] : loadingStepsEN[loadingStep]}
              </p>
            </div>

            <div className="space-y-2 max-w-xs mx-auto">
              {/* Shifting loading bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${(loadingStep + 1) * 20}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold tracking-wider">
                <span>{(loadingStep + 1) * 20}%</span>
                <span>100%</span>
              </div>
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
      <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
        {/* Score card */}
        <Card className="border border-border/70 shadow-lg shadow-accent/5 rounded-2xl overflow-hidden">
          <CardContent className="p-10 text-center space-y-6">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {/* Glowing circular progress border */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent via-primary-500 to-accent animate-pulse opacity-15" />
              <div className="absolute inset-1.5 rounded-full bg-card flex items-center justify-center shadow-sm border border-border">
                <span className={`text-4xl font-extrabold tracking-tight ${gradeColor}`}>
                  {percentage}%
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold text-foreground">
                {t.vocabPractice.quizComplete}
              </h3>
              <p className="text-lg text-muted-foreground font-medium">
                {t.vocabPractice.quizScore
                  .replace("{score}", String(score))
                  .replace("{total}", String(questions.length))}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="primary" onClick={handleRetry} className="rounded-xl cursor-pointer">
                <RotateCwIcon className="w-4 h-4 mr-2" />
                {t.vocabPractice.retryQuiz}
              </Button>
              <Button variant="secondary" onClick={onBack} className="rounded-xl cursor-pointer">
                <LayersIcon className="w-4 h-4 mr-2" />
                {t.vocabPractice.backToCards}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wrong answers review */}
        {wrongAnswers.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
              {t.vocabPractice.quizReview} ({wrongAnswers.length})
            </h4>
            <div className="space-y-4">
              {wrongAnswers.map((r) => {
                const q = questions[r.questionIndex];
                return (
                  <Card key={r.questionIndex} className="border border-error/15 bg-error/5/10 rounded-2xl shadow-sm overflow-hidden animate-slide-up">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-error/15 text-error uppercase shrink-0 mt-0.5">
                          {language === "zh" ? "错题" : "Incorrect"}
                        </span>
                        <p className="font-semibold text-foreground leading-snug text-base">{q.question}</p>
                      </div>

                      <div className="grid gap-2.5 text-sm pl-1 bg-muted/40 p-4 rounded-xl border border-border/30">
                        <div className="flex items-center gap-2">
                          <XFilledIcon className="w-4 h-4 text-error shrink-0" />
                          <span className="text-muted-foreground">{t.vocabPractice.yourAnswer}:</span>
                          <span className="text-error font-medium">{q.options[r.selected]}</span>
                        </div>
                        <div className="flex items-center gap-2 border-t border-border/30 pt-2.5 mt-0.5">
                          <CheckFilledIcon className="w-4 h-4 text-success shrink-0" />
                          <span className="text-muted-foreground">{t.vocabPractice.correctAnswer}:</span>
                          <span className="text-success font-medium">{q.options[r.correct]}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed pl-1">
                        {language === "zh" ? q.explanationCN : q.explanation}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-semibold">
            {t.vocabPractice.questionOf
              .replace("{current}", String(currentQ + 1))
              .replace("{total}", String(questions.length))}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/10 text-accent">
            {typeLabel[question.type]}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden relative">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <Card className="border border-border/70 shadow-lg shadow-accent/5 rounded-2xl overflow-hidden">
        <CardContent className="p-8 space-y-6">
          {/* Question text */}
          <div className="text-center py-4 px-2">
            <p className="text-xl md:text-2xl font-bold text-foreground leading-relaxed font-sans">
              {question.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid gap-3.5">
            {question.options.map((option, index) => {
              let optionStyle = "border-border bg-surface hover:border-accent/40 hover:bg-accent/5 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm";

              if (isAnswered) {
                if (index === question.correctIndex) {
                  optionStyle = "border-success bg-success/5 text-success font-semibold cursor-default";
                } else if (index === selectedOption && index !== question.correctIndex) {
                  optionStyle = "border-error bg-error/5 text-error font-semibold cursor-default";
                } else {
                  optionStyle = "border-border bg-muted/20 text-muted-foreground opacity-50 scale-[0.98] cursor-default";
                }
              } else if (index === selectedOption) {
                optionStyle = "border-accent bg-accent/5 ring-2 ring-accent/20 cursor-pointer";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4.5 rounded-2xl border-2 transition-all duration-200 ${optionStyle}`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-8 h-8 rounded-full border-2 border-current/25 flex items-center justify-center text-sm font-extrabold shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-lg font-medium">{option}</span>
                    {isAnswered && index === question.correctIndex && (
                      <CheckFilledIcon className="w-5 h-5 text-success ml-auto shrink-0 animate-scale-in" />
                    )}
                    {isAnswered && index === selectedOption && index !== question.correctIndex && (
                      <XFilledIcon className="w-5 h-5 text-error ml-auto shrink-0 animate-scale-in" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {isAnswered && (
            <div
              className={`p-5 rounded-2xl border ${
                isCorrect ? "bg-success/5 border-success/20 text-foreground" : "bg-error/5 border-error/20 text-foreground"
              } animate-slide-up space-y-2`}
            >
              <div className="flex items-center gap-2.5 font-bold text-base">
                {isCorrect ? (
                  <>
                    <CheckFilledIcon className="w-5 h-5 text-success shrink-0" />
                    <span className="text-success">{t.vocabPractice.correct}</span>
                  </>
                ) : (
                  <>
                    <XFilledIcon className="w-5 h-5 text-error shrink-0" />
                    <span className="text-error">{t.vocabPractice.incorrect}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                {language === "zh" ? question.explanationCN : question.explanation}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-center gap-3 pt-2">
            {!isAnswered ? (
              <Button
                variant="primary"
                onClick={handleCheckAnswer}
                disabled={selectedOption === null}
                className="rounded-xl px-10 py-3 cursor-pointer shadow-md"
              >
                {t.vocabPractice.checkAnswer}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNextQuestion}
                className="rounded-xl px-10 py-3 cursor-pointer shadow-md"
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
