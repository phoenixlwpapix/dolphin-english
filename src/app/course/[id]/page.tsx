"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import {
  Button,
  Card,
  ModuleSteps,
  ConfirmModal,
  ChevronLeftIcon,
  ClockIcon,
  RotateCwIcon,
  TrashIcon,
  LogOutIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  MODULE_TIMES,
  TOTAL_MODULES,
  DIFFICULTY_CONFIG,
} from "@/lib/constants";
import {
  LearningObjectives,
  FullListening,
  ParagraphAnalysis,
  VocabularyLearning,
  ComprehensionQuiz,
  ContentReproduction,
} from "@/components/modules";

// Module components

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const courseId = params.id as Id<"courses">;

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: "restart" | "delete" | "leave" | null;
  }>({ isOpen: false, type: null });

  const [isActionLoading, setIsActionLoading] = useState(false);

  const course = useQuery(api.courses.get, { id: courseId });
  const progress = useQuery(api.progress.get, { courseId });
  const currentUser = useQuery(api.users.getCurrentUser);

  const completeModuleMutation = useMutation(api.progress.completeModule);
  const resetProgressMutation = useMutation(api.progress.reset);
  const updateCurrentModuleMutation = useMutation(
    api.progress.updateCurrentModule,
  );
  const deleteCourseMutation = useMutation(api.courses.remove);
  const removeCourseMutation = useMutation(api.userCourses.removeCourse);

  const moduleNames = [
    t.modules.objectives,
    t.modules.listening,
    t.modules.analysis,
    t.modules.vocabulary,
    t.modules.quiz,
    t.modules.reproduction,
  ];

  const isLoading = course === undefined || progress === undefined;

  async function handleModuleComplete(moduleNumber: number) {
    await completeModuleMutation({ courseId, moduleNumber });
  }

  function handleRestart() {
    setConfirmState({ isOpen: true, type: "restart" });
  }

  function handleDelete() {
    setConfirmState({ isOpen: true, type: "delete" });
  }

  function handleLeave() {
    setConfirmState({ isOpen: true, type: "leave" });
  }

  async function handleConfirm() {
    if (!confirmState.type) return;

    setIsActionLoading(true);
    try {
      if (confirmState.type === "restart") {
        await resetProgressMutation({ courseId });
        setConfirmState({ isOpen: false, type: null });
      } else if (confirmState.type === "delete") {
        await deleteCourseMutation({ id: courseId });
        router.push("/");
      } else if (confirmState.type === "leave") {
        await removeCourseMutation({ courseId });
        router.push("/");
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsActionLoading(false);
    }
  }

  function handleModuleClick(moduleNumber: number) {
    if (progress && moduleNumber <= progress.currentModule) {
      updateCurrentModuleMutation({ courseId, moduleNumber });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!course || !course.analyzedData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="py-16 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Course not ready
            </h2>
            <p className="text-muted-foreground mb-4">
              The course could not be loaded or is still being analyzed.
            </p>
            <Button onClick={() => router.push("/")}>{t.common.back}</Button>
          </Card>
        </main>
      </div>
    );
  }

  const currentModule = progress?.currentModule ?? 1;
  const isComplete = progress?.completedModules.length === TOTAL_MODULES;
  const hasProgress =
    (progress?.currentModule ?? 1) > 1 ||
    (progress?.completedModules.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-8 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 mb-2"
                onClick={() => router.push("/")}
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                {t.common.back}
              </Button>

              <Card padding="lg" className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-foreground mb-3 leading-tight">
                    {course.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                    <span
                      className={`px-2 py-0.5 rounded-full ${DIFFICULTY_CONFIG[course.difficulty].color}`}
                    >
                      {course.difficulty}
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {MODULE_TIMES.reduce((a, b) => a + b, 0)}{" "}
                      {t.course.minutes}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {course.wordCount} words
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 pl-1">
                    Course Progress
                  </h3>
                  <ModuleSteps
                    currentModule={currentModule}
                    completedModules={progress?.completedModules ?? []}
                    moduleNames={moduleNames}
                    moduleTimes={MODULE_TIMES}
                    onModuleClick={handleModuleClick}
                    orientation="vertical"
                  />
                </div>

                <div className="border-t border-border/50 pt-6 space-y-3">
                  {hasProgress && (
                    <Button
                      variant="secondary"
                      className="w-full justify-center"
                      onClick={handleRestart}
                    >
                      <RotateCwIcon className="w-4 h-4 mr-2" />
                      {t.common.restart}
                    </Button>
                  )}

                  {course.isPublic ? (
                    <Button
                      variant="secondary"
                      className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleLeave}
                    >
                      <LogOutIcon className="w-4 h-4 mr-2" />
                      {t.common.leaveCourse}
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      className="w-full justify-center"
                      onClick={handleDelete}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      {t.common.deleteCourse}
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-1 lg:col-span-9">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-2"
                  onClick={() => router.push("/")}
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-bold text-foreground text-center flex-1 mx-2 truncate">
                  {course.title}
                </h1>
                <div className="flex items-center gap-1">
                  {hasProgress && (
                    <Button variant="ghost" size="sm" onClick={handleRestart}>
                      <RotateCwIcon className="w-5 h-5" />
                    </Button>
                  )}
                  {course.isPublic ? (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={handleLeave}>
                      <LogOutIcon className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button variant="danger" size="sm" onClick={handleDelete}>
                      <TrashIcon className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              <Card padding="md" className="mb-6">
                <ModuleSteps
                  currentModule={currentModule}
                  completedModules={progress?.completedModules ?? []}
                  moduleNames={moduleNames}
                  onModuleClick={handleModuleClick}
                  orientation="horizontal"
                />
              </Card>
            </div>

            {/* Active Module Content */}
            <div className="w-full">
              {currentModule === 1 && (
                <LearningObjectives
                  objectives={course.analyzedData.learningObjectives}
                  onComplete={() => handleModuleComplete(1)}
                />
              )}
              {currentModule === 2 && (
                <FullListening
                  content={course.content}
                  vocabulary={course.analyzedData.vocabulary}
                  onComplete={() => handleModuleComplete(2)}
                />
              )}
              {currentModule === 3 && (
                <ParagraphAnalysis
                  paragraphs={course.analyzedData.paragraphs}
                  onComplete={() => handleModuleComplete(3)}
                />
              )}
              {currentModule === 4 && (
                <VocabularyLearning
                  vocabulary={course.analyzedData.vocabulary}
                  courseId={courseId}
                  onComplete={() => handleModuleComplete(4)}
                />
              )}
              {currentModule === 5 && (
                <ComprehensionQuiz
                  questions={course.analyzedData.quizQuestions}
                  courseId={courseId}
                  onComplete={() => handleModuleComplete(5)}
                />
              )}
              {currentModule === 6 && (
                <ContentReproduction
                  paragraphs={course.analyzedData.paragraphs}
                  onComplete={() => handleModuleComplete(6)}
                  onFinish={() => router.push("/")}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={handleConfirm}
        title={
          confirmState.type === "restart"
            ? t.common.restart
            : confirmState.type === "leave"
              ? t.common.leaveCourse
              : t.common.delete
        }
        description={
          confirmState.type === "restart"
            ? t.common.restartConfirm
            : confirmState.type === "leave"
              ? t.common.leaveConfirm
              : t.common.deleteConfirm
        }
        confirmText={t.common.confirm}
        cancelText={t.common.cancel}
        variant={confirmState.type === "delete" || confirmState.type === "leave" ? "destructive" : "default"}
        isLoading={isActionLoading}
      />
    </div>
  );
}
