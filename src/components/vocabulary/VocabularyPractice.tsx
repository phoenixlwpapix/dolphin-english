"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardContent,
  Button,
  BookAIcon,
  BookOpenIcon,
  VolumeHighIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  CheckFilledIcon,
  BrainIcon,
  LayersIcon,
  SparklesIcon,
} from "@/components/ui";
import { Shuffle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { tts } from "@/lib/tts";
import { VocabQuizMode } from "./VocabQuizMode";
import type { Id } from "../../../convex/_generated/dataModel";

const PRONUNCIATION_RATE = 0.8;

type CategoryFilter = "all" | "essential" | "transferable" | "extended";
type PracticeMode = "flashcard" | "quiz";

interface FlatVocabItem {
  word: string;
  pronunciation: string;
  definition: string;
  definitionCN?: string;
  originalSentence: string;
  category: "essential" | "transferable" | "extended";
  courseId: Id<"courses">;
  courseTitle: string;
  difficulty: string;
  isReviewed: boolean;
}

interface AiSentence {
  en: string;
  zh: string;
}

export function VocabularyPractice() {
  const { t } = useI18n();
  const vocabData = useQuery(api.courses.getMyVocabulary);
  const recordClick = useMutation(api.progress.recordVocabularyClick);

  const [mode, setMode] = useState<PracticeMode>("flashcard");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set());

  // AI sentences state
  const [aiSentences, setAiSentences] = useState<AiSentence[]>([]);
  const [aiSentencesLoading, setAiSentencesLoading] = useState(false);
  const [aiSentencesWord, setAiSentencesWord] = useState<string | null>(null);
  const [aiSentencesError, setAiSentencesError] = useState(false);

  // Flatten all vocabulary into a single list
  const allWords: FlatVocabItem[] = useMemo(() => {
    if (!vocabData) return [];
    return vocabData.flatMap((course) =>
      course.vocabulary.map((v) => ({
        ...v,
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        difficulty: course.difficulty,
        isReviewed: course.vocabularyClicks.includes(v.word),
      }))
    );
  }, [vocabData]);

  // Available courses for filter
  const courses = useMemo(() => {
    if (!vocabData) return [];
    return vocabData.map((c) => ({
      id: c.courseId,
      title: c.courseTitle,
      difficulty: c.difficulty,
      count: c.vocabulary.length,
    }));
  }, [vocabData]);

  // Filtered words
  const filteredWords = useMemo(() => {
    let words = allWords;
    if (courseFilter !== "all") {
      words = words.filter((w) => w.courseId === courseFilter);
    }
    if (categoryFilter !== "all") {
      words = words.filter((w) => w.category === categoryFilter);
    }
    if (isShuffled) {
      words = [...words].sort(() => Math.random() - 0.5);
    }
    return words;
  }, [allWords, courseFilter, categoryFilter, isShuffled]);

  // Stats
  const totalWords = allWords.length;
  const reviewedWords = allWords.filter((w) => w.isReviewed || knownWords.has(w.word)).length;

  const currentWord = filteredWords[currentIndex];

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setAiSentences([]);
    setAiSentencesWord(null);
    setCurrentIndex((i) => (i + 1) % filteredWords.length);
  }, [filteredWords.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setAiSentences([]);
    setAiSentencesWord(null);
    setCurrentIndex((i) => (i - 1 + filteredWords.length) % filteredWords.length);
  }, [filteredWords.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  const handlePlayPronunciation = useCallback((word: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    tts.speak(word, { rate: PRONUNCIATION_RATE });
  }, []);

  const handleMarkKnown = useCallback(async () => {
    if (!currentWord) return;
    setKnownWords((prev) => {
      const next = new Set(prev);
      if (next.has(currentWord.word)) {
        next.delete(currentWord.word);
      } else {
        next.add(currentWord.word);
      }
      return next;
    });
    if (!currentWord.isReviewed) {
      await recordClick({ courseId: currentWord.courseId, word: currentWord.word });
    }
  }, [currentWord, recordClick]);

  const handleShuffle = useCallback(() => {
    setIsShuffled((s) => !s);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  const handleCourseFilter = useCallback((id: string) => {
    setCourseFilter(id);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  const handleCategoryFilter = useCallback((cat: CategoryFilter) => {
    setCategoryFilter(cat);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  // AI Sentence generation
  const handleGenerateSentences = useCallback(
    async (word: string, definition: string, difficulty: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setAiSentencesLoading(true);
      setAiSentencesError(false);
      setAiSentencesWord(word);

      try {
        const res = await fetch("/api/vocab-sentences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word, definition, difficulty }),
        });

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        setAiSentences(data.sentences);
      } catch {
        setAiSentencesError(true);
        setAiSentences([]);
      } finally {
        setAiSentencesLoading(false);
      }
    },
    [],
  );

  const categoryLabels = {
    essential: { label: t.vocabulary.essential, color: "bg-error/20 text-error" },
    transferable: { label: t.vocabulary.transferable, color: "bg-success/20 text-success" },
    extended: { label: t.vocabulary.extended, color: "bg-info/20 text-info" },
  };

  if (vocabData === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      </div>
    );
  }

  if (allWords.length === 0) {
    return (
      <div className="text-center py-32 bg-surface rounded-3xl border border-dashed border-border animate-slide-up">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center animate-pulse-soft">
          <BookAIcon className="w-10 h-10 text-accent" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">
          {t.vocabPractice.noCourses}
        </h3>
        <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
          {t.vocabPractice.noCoursesDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-primary-100 text-primary-700">
          <BookAIcon className="w-6 h-6" />
        </div>
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-bold text-foreground">
            {t.vocabPractice.title}
          </h2>
          <span className="px-2.5 py-0.5 text-xs font-semibold text-accent bg-accent/10 rounded-full">
            {totalWords}
          </span>
        </div>
      </div>

      {/* Mode Switcher + Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Mode switcher */}
        <div className="flex items-center bg-muted/50 rounded-xl p-1">
          <button
            onClick={() => setMode("flashcard")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "flashcard"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayersIcon className="w-4 h-4" />
            {t.vocabPractice.flashcardMode}
          </button>
          <button
            onClick={() => setMode("quiz")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "quiz"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BrainIcon className="w-4 h-4" />
            {t.vocabPractice.quizMode}
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-sm">
            <BookOpenIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t.vocabPractice.totalWords}:</span>
            <span className="font-semibold text-foreground">{totalWords}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-sm">
            <CheckFilledIcon className="w-4 h-4 text-success" />
            <span className="text-muted-foreground">{t.vocabPractice.reviewedWords}:</span>
            <span className="font-semibold text-foreground">{reviewedWords}</span>
          </div>
          {mode === "flashcard" && (
            <>
              <div className="flex-1" />
              <button
                onClick={handleShuffle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isShuffled
                    ? "bg-accent/10 text-accent"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Shuffle className="w-4 h-4" />
                {t.vocabPractice.shuffleMode}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters (shared between modes) */}
      <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={courseFilter}
          onChange={(e) => handleCourseFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground transition-all cursor-pointer min-w-[160px]"
        >
          <option value="all">
            {t.vocabPractice.allCourses} ({totalWords})
          </option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              [{course.difficulty}] {course.title} ({course.count})
            </option>
          ))}
        </select>

        <div className="h-6 w-px bg-border hidden sm:block" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              categoryFilter === "all"
                ? "bg-accent text-white shadow-md shadow-accent/25"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t.vocabPractice.allCategories}
          </button>
          {(["essential", "transferable", "extended"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? "bg-accent text-white shadow-md shadow-accent/25"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {categoryLabels[cat].label}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Mode */}
      {mode === "quiz" && (
        <VocabQuizMode
          words={filteredWords.map((w) => ({
            word: w.word,
            definition: w.definition,
            definitionCN: w.definitionCN,
            category: w.category,
            difficulty: w.difficulty,
          }))}
          onBack={() => setMode("flashcard")}
        />
      )}

      {/* Flashcard Mode */}
      {mode === "flashcard" && (
        <>
          {filteredWords.length > 0 && currentWord ? (
            <div className="space-y-4">
              {/* Progress indicator */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {currentIndex + 1} / {filteredWords.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${categoryLabels[currentWord.category].color}`}>
                    {categoryLabels[currentWord.category].label}
                  </span>
                  <span className="text-xs">
                    {t.vocabPractice.fromCourse}: {currentWord.courseTitle}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / filteredWords.length) * 100}%` }}
                />
              </div>

              {/* Word Card (accordion style) */}
              <Card className={`border-2 transition-colors ${isFlipped ? "border-accent/30" : "border-border hover:border-accent/30"}`}>
                {/* Top: word + pronunciation + TTS (always visible) */}
                <CardContent
                  className="flex items-center gap-4 py-6 px-8 cursor-pointer select-none"
                  onClick={handleFlip}
                >
                  <div className="flex-1 flex items-center gap-3">
                    <h3 className="text-3xl font-bold text-foreground font-mali">
                      {currentWord.word}
                    </h3>
                    <p className="text-base text-muted-foreground">{currentWord.pronunciation}</p>
                    {(currentWord.isReviewed || knownWords.has(currentWord.word)) && (
                      <CheckFilledIcon className="w-5 h-5 text-success" />
                    )}
                  </div>
                  <button
                    onClick={(e) => handlePlayPronunciation(currentWord.word, e)}
                    className="p-2.5 rounded-full bg-primary-100 hover:bg-primary-200 transition-colors shrink-0"
                  >
                    <VolumeHighIcon className="w-5 h-5 text-primary-600" />
                  </button>
                  <ChevronDownIcon className={`w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0 ${isFlipped ? "rotate-180" : ""}`} />
                </CardContent>

                {/* Expandable: definition + example + AI sentences */}
                <div className={`grid transition-all duration-300 ${isFlipped ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="px-8 pb-6 space-y-4 border-t border-border pt-4">
                      {/* Definition */}
                      <div className="text-center space-y-1">
                        <p className="text-lg text-foreground">{currentWord.definition}</p>
                        {currentWord.definitionCN && (
                          <p className="text-base text-muted-foreground">{currentWord.definitionCN}</p>
                        )}
                      </div>

                      {/* Original sentence */}
                      <div className="p-3 bg-muted/30 rounded-xl text-center">
                        <p className="text-sm text-muted-foreground uppercase mb-1">{t.vocabulary.example}</p>
                        <p className="text-primary-600 italic">&ldquo;{currentWord.originalSentence}&rdquo;</p>
                      </div>

                      {/* AI Sentences Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleGenerateSentences(currentWord.word, currentWord.definition, currentWord.difficulty)}
                          disabled={aiSentencesLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-all disabled:opacity-50"
                        >
                          <SparklesIcon className="w-3.5 h-3.5" />
                          {aiSentencesLoading
                            ? t.vocabPractice.aiSentencesLoading
                            : aiSentencesWord === currentWord.word && aiSentences.length > 0
                              ? t.vocabPractice.moreSentences
                              : t.vocabPractice.aiSentences}
                        </button>
                      </div>

                      {/* AI Generated Sentences */}
                      {aiSentencesWord === currentWord.word && aiSentences.length > 0 && (
                        <div className="space-y-2 animate-slide-up">
                          {aiSentences.map((s, i) => (
                            <div key={i} className="p-3 bg-accent/5 rounded-lg border border-accent/10 text-left">
                              <p className="text-sm text-foreground mb-1">{s.en}</p>
                              <p className="text-xs text-muted-foreground">{s.zh}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {aiSentencesError && aiSentencesWord === currentWord.word && (
                        <p className="text-xs text-error text-center">{t.vocabPractice.aiSentencesError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  onClick={handlePrev}
                  className="rounded-xl"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  {t.vocabPractice.prevWord}
                </Button>

                <Button
                  variant={knownWords.has(currentWord.word) || currentWord.isReviewed ? "secondary" : "primary"}
                  onClick={handleMarkKnown}
                  className="rounded-xl px-6"
                >
                  <CheckFilledIcon className="w-4 h-4 mr-1" />
                  {knownWords.has(currentWord.word) || currentWord.isReviewed
                    ? t.vocabPractice.known
                    : t.vocabPractice.learning}
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleNext}
                  className="rounded-xl"
                >
                  {t.vocabPractice.nextWord}
                  <ChevronRightIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground">{t.vocabPractice.noCourses}</p>
            </div>
          )}

          {/* Word List (below flashcard) */}
          {filteredWords.length > 0 && (
            <div className="space-y-2 pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {t.vocabPractice.totalWords} ({filteredWords.length})
              </h3>
              <div className="grid gap-2 md:grid-cols-2">
                {filteredWords.map((vocab, index) => (
                  <button
                    key={`${vocab.courseId}-${vocab.word}`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsFlipped(false);
                      setAiSentences([]);
                      setAiSentencesWord(null);
                      handlePlayPronunciation(vocab.word);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      currentIndex === index
                        ? "border-accent bg-accent/5"
                        : "border-border bg-surface hover:border-accent/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-bold text-foreground">{vocab.word}</span>
                      <span className="text-sm text-muted-foreground truncate">{vocab.pronunciation}</span>
                      {(vocab.isReviewed || knownWords.has(vocab.word)) && (
                        <CheckFilledIcon className="w-4 h-4 text-success shrink-0" />
                      )}
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryLabels[vocab.category].color}`}>
                      {categoryLabels[vocab.category].label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
