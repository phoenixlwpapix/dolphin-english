"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  Button,
  ClipboardIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { tts, TTS_SPEEDS } from "@/lib/tts";
import type { ParagraphAnalysis as ParagraphData } from "@/lib/schemas";
import { ArticleReference } from "@/components/course";

interface ParagraphAnalysisProps {
  paragraphs: ParagraphData[];
  articleContent: string;
  onComplete: () => void;
}

interface SentenceInfo {
  text: string;
  start: number;
  end: number;
  index: number;
}

export function ParagraphAnalysis({
  paragraphs,
  articleContent,
  onComplete,
}: ParagraphAnalysisProps) {
  const { t, language } = useI18n();
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
  const [completedParagraphs, setCompletedParagraphs] = useState<number[]>([]);
  const activeSentenceRef = useRef<HTMLSpanElement>(null);

  const paragraph = paragraphs[currentParagraph];
  const isLastParagraph = currentParagraph === paragraphs.length - 1;
  const allCompleted = completedParagraphs.length === paragraphs.length;

  // Pre-compute sentences for the current paragraph
  const sentences = useMemo(() => {
    const sentenceRegex = /[^.!?\n]+(?:[.!?]+["']?|$)/g;
    const result: SentenceInfo[] = [];
    let match;
    let index = 0;

    while ((match = sentenceRegex.exec(paragraph.text)) !== null) {
      const text = match[0].trim();
      if (text) {
        result.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          index: index++,
        });
      }
    }

    return result;
  }, [paragraph.text]);

  // Auto-scroll to active sentence
  useEffect(() => {
    if (activeSentenceIndex !== -1 && activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeSentenceIndex]);

  const handlePlayParagraph = useCallback(() => {
    if (isPaused) {
      tts.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    setIsPlaying(true);
    setActiveSentenceIndex(0);

    tts.speak(
      paragraph.text,
      {
        rate: TTS_SPEEDS.normal,
        onBoundary: (charIndex) => {
          const matchingSentence = sentences.find(
            (s) => charIndex >= s.start && charIndex < s.end
          );
          if (matchingSentence) {
            setActiveSentenceIndex(matchingSentence.index);
          }
        },
      },
      (event) => {
        if (event === "end") {
          setIsPlaying(false);
          setIsPaused(false);
          setActiveSentenceIndex(-1);
        }
      }
    );
  }, [paragraph.text, isPaused, sentences]);

  const handlePauseParagraph = useCallback(() => {
    tts.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const handleStopPlayback = useCallback(() => {
    tts.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSentenceIndex(-1);
  }, []);

  function markComplete() {
    if (!completedParagraphs.includes(currentParagraph)) {
      setCompletedParagraphs([...completedParagraphs, currentParagraph]);
    }
  }

  function changeParagraph(index: number) {
    // Stop playback before changing paragraph
    tts.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSentenceIndex(-1);
    setCurrentParagraph(index);
  }

  function handleNext() {
    markComplete();
    if (!isLastParagraph) {
      changeParagraph(currentParagraph + 1);
    }
  }

  function handlePrevious() {
    if (currentParagraph > 0) {
      changeParagraph(currentParagraph - 1);
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      tts.stop();
    };
  }, []);

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <ClipboardIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {t.analysis.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t.course.module} 3 · 12 {t.course.minutes}
              </p>
            </div>
          </div>
          <ArticleReference content={articleContent} />
        </div>

        {/* Paragraph navigation */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {paragraphs.map((_, index) => (
            <button
              key={index}
              onClick={() => changeParagraph(index)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium transition-colors shrink-0
                ${
                  currentParagraph === index
                    ? "bg-primary-500 text-white"
                    : completedParagraphs.includes(index)
                      ? "bg-success/20 text-success"
                      : "bg-surface text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {t.analysis.paragraph} {index + 1}
            </button>
          ))}
        </div>

        {/* Paragraph content */}
        <div className="space-y-6">
          {/* Original text with sentence highlighting */}
          <div className="bg-surface rounded-lg p-4">
            <p className="text-foreground leading-relaxed text-xl">
              {sentences.map((s) => {
                const isActive = s.index === activeSentenceIndex;
                return (
                  <span
                    key={s.index}
                    ref={isActive ? activeSentenceRef : null}
                    className={`transition-colors duration-200 ${
                      isActive
                        ? "bg-primary-100 dark:bg-primary-900/40 text-primary-900 dark:text-primary-100 rounded px-1 -mx-1 py-0.5"
                        : ""
                    }`}
                  >
                    {s.text}
                  </span>
                );
              })}
            </p>

            {/* Read along controls + Navigation */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                {!isPlaying && !isPaused ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePlayParagraph}
                  >
                    <PlayIcon className="w-4 h-4" />
                    {t.analysis.practice}
                  </Button>
                ) : isPlaying ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePauseParagraph}
                  >
                    <PauseIcon className="w-4 h-4" />
                    {t.listening.pause}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePlayParagraph}
                  >
                    <PlayIcon className="w-4 h-4" />
                    {t.listening.resume}
                  </Button>
                )}
                {(isPlaying || isPaused) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStopPlayback}
                  >
                    <StopIcon className="w-4 h-4" />
                    {t.analysis.stop}
                  </Button>
                )}
              </div>

              {/* Paragraph navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentParagraph === 0}
                  aria-label={t.common.previous}
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </Button>
                {isLastParagraph ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      markComplete();
                      onComplete();
                    }}
                    disabled={
                      !allCompleted &&
                      completedParagraphs.length < paragraphs.length - 1
                    }
                  >
                    {t.common.complete}
                    <CheckIcon className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    aria-label={t.common.next}
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Summary - displays Chinese or English based on current language */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {t.analysis.summary}
            </h3>
            <p className="text-foreground bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 border-l-4 border-primary-500 text-lg">
              {language === "zh" ? paragraph.summaryZH : paragraph.summary}
            </p>
          </div>

          {/* Language points */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {t.analysis.languagePoints}
            </h3>
            <div className="space-y-3">
              {paragraph.languagePoints.map((point, index) => (
                <div
                  key={index}
                  className="bg-surface rounded-lg p-4 border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-lg">
                        {point.point}
                      </h4>
                      <p className="text-base text-muted-foreground mt-1">
                        {language === "zh"
                          ? point.explanationZH
                          : point.explanation}
                      </p>
                      <p className="text-base text-primary-600 mt-2 italic">
                        &ldquo;{point.example}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
