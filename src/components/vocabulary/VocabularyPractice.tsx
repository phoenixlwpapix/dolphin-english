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
  ClipboardListIcon,
  SearchIcon,
  ShuffleIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { tts } from "@/lib/tts";
import { VocabQuizMode } from "./VocabQuizMode";
import type { Id } from "../../../convex/_generated/dataModel";

const PRONUNCIATION_RATE = 0.8;

type CategoryFilter = "all" | "essential" | "transferable" | "extended";
type PracticeMode = "list" | "flashcard" | "quiz";

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
  const { t, language } = useI18n();
  const vocabData = useQuery(api.courses.getMyVocabulary);
  const recordClick = useMutation(api.progress.recordVocabularyClick);

  const [mode, setMode] = useState<PracticeMode>("list");
  const [listSearchQuery, setListSearchQuery] = useState("");
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

  // Search filtered words (only for the word list tab)
  const searchedListWords = useMemo(() => {
    let words = filteredWords;
    if (listSearchQuery.trim() !== "") {
      const q = listSearchQuery.toLowerCase();
      words = words.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.definition.toLowerCase().includes(q) ||
          (w.definitionCN && w.definitionCN.toLowerCase().includes(q))
      );
    }
    return words;
  }, [filteredWords, listSearchQuery]);

  // Review checkers/helpers
  const isWordReviewed = useCallback((w: FlatVocabItem) => {
    return w.isReviewed || knownWords.has(w.word);
  }, [knownWords]);

  const toggleWordReview = useCallback(async (w: FlatVocabItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setKnownWords((prev) => {
      const next = new Set(prev);
      if (next.has(w.word)) {
        next.delete(w.word);
      } else {
        next.add(w.word);
      }
      return next;
    });
    if (!w.isReviewed) {
      await recordClick({ courseId: w.courseId, word: w.word });
    }
  }, [recordClick]);

  // Stats
  const totalWords = allWords.length;
  const reviewedWords = allWords.filter(isWordReviewed).length;

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
    <div className="w-full space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
            <BookAIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              {t.vocabPractice.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === "zh" ? "背单词、看例句、进行 AI 智能测验，巩固你的英语词汇" : "Review words, read examples, and take AI-powered quizzes to boost your English"}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMode("list")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-950/60 rounded-xl border border-primary-100 dark:border-primary-900 text-sm font-semibold transition-all cursor-pointer"
          >
            <BookOpenIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-muted-foreground">{t.vocabPractice.totalWords}:</span>
            <span className="text-primary-700 dark:text-primary-300">{totalWords}</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-success/5 rounded-xl border border-success/15 text-sm font-semibold">
            <CheckFilledIcon className="w-4 h-4 text-success" />
            <span className="text-muted-foreground">{t.vocabPractice.reviewedWords}:</span>
            <span className="text-success">{reviewedWords}</span>
          </div>
        </div>
      </div>

      {/* Mode Switcher + Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex bg-muted/60 p-1 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setMode("list")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              mode === "list"
                ? "bg-surface text-foreground shadow-sm scale-[1.02]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardListIcon className="w-4 h-4" />
            {t.vocabPractice.listMode}
          </button>
          <button
            onClick={() => setMode("flashcard")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              mode === "flashcard"
                ? "bg-surface text-foreground shadow-sm scale-[1.02]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayersIcon className="w-4 h-4" />
            {t.vocabPractice.flashcardMode}
          </button>
          <button
            onClick={() => setMode("quiz")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              mode === "quiz"
                ? "bg-surface text-foreground shadow-sm scale-[1.02]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BrainIcon className="w-4 h-4" />
            {t.vocabPractice.quizMode}
          </button>
        </div>

        {mode === "flashcard" && (
          <button
            onClick={handleShuffle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              isShuffled
                ? "bg-accent/10 text-accent border border-accent/20"
                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <ShuffleIcon className="w-4 h-4" />
            {t.vocabPractice.shuffleMode}
          </button>
        )}
      </div>

      {/* Filters (shared between modes, hidden in AI Quiz) */}
      {mode !== "quiz" && (
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {mode === "list" ? (
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.vocabPractice.searchWords}
                value={listSearchQuery}
                onChange={(e) => setListSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground placeholder:text-muted-foreground transition-all"
              />
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <div className="flex flex-wrap items-center gap-3">
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

            <div className="h-6 w-px bg-border hidden md:block" />

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => handleCategoryFilter("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
        </div>
      )}

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
          courseFilter={courseFilter}
          categoryFilter={categoryFilter}
          courses={courses}
          onBack={() => setMode("flashcard")}
        />
      )}

      {/* Word List Mode */}
      {mode === "list" && (
        <div className="space-y-4">
          {searchedListWords.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {searchedListWords.map((vocab) => {
                const reviewed = isWordReviewed(vocab);
                // Categorized color theme
                const catTheme = vocab.category === "essential" 
                  ? { border: "border-l-[6px] border-l-error/70", bg: "bg-error/5/5" }
                  : vocab.category === "transferable"
                  ? { border: "border-l-[6px] border-l-success/70", bg: "bg-success/5/5" }
                  : { border: "border-l-[6px] border-l-info/70", bg: "bg-info/5/5" };

                return (
                  <Card 
                    key={`${vocab.courseId}-${vocab.word}`} 
                    className={`border border-border/70 hover:border-accent/40 bg-surface hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden ${catTheme.border}`}
                  >
                    <CardContent className="p-6 space-y-4 flex-1">
                      {/* Card Header: Word, Pronunciation, Action Buttons */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-2xl font-bold text-foreground font-sans tracking-tight">
                            {vocab.word}
                          </h4>
                          <p className="text-sm text-muted-foreground font-medium">{vocab.pronunciation}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Audio TTS button */}
                          <button
                            onClick={(e) => handlePlayPronunciation(vocab.word, e)}
                            className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950 hover:bg-primary-100 dark:hover:bg-primary-900 text-primary-600 dark:text-primary-400 transition-colors cursor-pointer border border-primary-100 dark:border-primary-800"
                            title={t.vocabulary.playPronunciation}
                          >
                            <VolumeHighIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${categoryLabels[vocab.category].color}`}>
                          {categoryLabels[vocab.category].label}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full font-medium">
                          <BookOpenIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[120px]" title={vocab.courseTitle}>{vocab.courseTitle}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full border border-border text-[10px] font-bold text-muted-foreground uppercase">
                          {vocab.difficulty}
                        </span>
                      </div>

                      {/* Definitions */}
                      <div className="space-y-1.5 border-t border-border/50 pt-3">
                        <p className="text-base text-foreground font-semibold leading-snug">{vocab.definition}</p>
                        {vocab.definitionCN && (
                          <p className="text-sm text-muted-foreground font-medium leading-snug">{vocab.definitionCN}</p>
                        )}
                      </div>

                      {/* Example sentence */}
                      <div className="p-3 bg-accent/5 rounded-xl border-l-2 border-accent/40 border border-border/30">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{t.vocabulary.example}</p>
                        <p className="text-sm text-primary-900/90 dark:text-primary-300 italic leading-relaxed font-handwriting">
                          &ldquo;{vocab.originalSentence}&rdquo;
                        </p>
                      </div>

                      {/* AI sentences container */}
                      <div className="pt-1">
                        {aiSentencesWord === vocab.word && aiSentences.length > 0 ? (
                          <div className="space-y-2 border-t border-dashed border-border pt-3 animate-slide-up">
                            {aiSentences.map((s, i) => (
                              <div key={i} className="p-2.5 bg-accent/5 rounded-lg border border-accent/10">
                                <p className="text-xs text-foreground font-medium mb-0.5">{s.en}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">{s.zh}</p>
                              </div>
                            ))}
                            <button
                              onClick={() => handleGenerateSentences(vocab.word, vocab.definition, vocab.difficulty)}
                              disabled={aiSentencesLoading}
                              className="text-[10px] text-accent hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <SparklesIcon className="w-3.5 h-3.5" />
                              {aiSentencesLoading ? t.vocabPractice.aiSentencesLoading : t.vocabPractice.moreSentences}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateSentences(vocab.word, vocab.definition, vocab.difficulty)}
                            disabled={aiSentencesLoading && aiSentencesWord === vocab.word}
                            className="flex items-center gap-1 text-[10px] font-semibold text-accent hover:underline cursor-pointer disabled:opacity-50"
                          >
                            <SparklesIcon className="w-3.5 h-3.5" />
                            {aiSentencesLoading && aiSentencesWord === vocab.word ? t.vocabPractice.aiSentencesLoading : t.vocabPractice.aiSentences}
                          </button>
                        )}
                      </div>
                    </CardContent>

                    {/* Footer Mastery Indicator Bar */}
                    <div className="px-6 py-3 bg-muted/40 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-semibold">掌握状态</span>
                      <button
                        onClick={(e) => toggleWordReview(vocab, e)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          reviewed
                            ? "bg-success/15 text-success border border-success/30 hover:bg-success/20"
                            : "bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground"
                        }`}
                      >
                        {reviewed ? t.vocabPractice.known : t.vocabPractice.learning}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-border w-full">
              <SearchIcon className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">{t.home.noResults}</p>
            </div>
          )}
        </div>
      )}

      {/* Flashcard Mode */}
      {mode === "flashcard" && (
        <div className="max-w-2xl mx-auto w-full">
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
                    {isWordReviewed(currentWord) && (
                      <CheckFilledIcon className="w-5 h-5 text-success" />
                    )}
                  </div>
                  <button
                    onClick={(e) => handlePlayPronunciation(currentWord.word, e)}
                    className="p-2.5 rounded-full bg-primary-100 hover:bg-primary-200 transition-colors shrink-0 cursor-pointer"
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
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-all disabled:opacity-50 cursor-pointer"
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
                  className="rounded-xl cursor-pointer"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  {t.vocabPractice.prevWord}
                </Button>

                <Button
                  variant={isWordReviewed(currentWord) ? "secondary" : "primary"}
                  onClick={() => toggleWordReview(currentWord)}
                  className="rounded-xl px-6 cursor-pointer"
                >
                  <CheckFilledIcon className="w-4 h-4 mr-1" />
                  {isWordReviewed(currentWord)
                    ? t.vocabPractice.known
                    : t.vocabPractice.learning}
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleNext}
                  className="rounded-xl cursor-pointer"
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
        </div>
      )}
    </div>
  );
}
