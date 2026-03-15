"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useI18n } from "@/lib/i18n";
import { DIFFICULTY_CONFIG } from "@/lib/constants";
import {
    Button,
    Card,
    CardContent,
    ShieldIcon,
    PlusIcon,
    EditIcon,
    TrashIcon,
    SearchIcon,
    UsersIcon,
    RouteIcon,
    LibraryIcon,
    BookOpenIcon,
    CheckIcon,
} from "@/components/ui";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type AdminSubTab = "courses" | "paths";

interface AdminViewProps {
    onCreateCourse: () => void;
    onCreatePath: () => void;
    onEditPath: (pathId: string) => void;
}

export function AdminView({ onCreateCourse, onCreatePath, onEditPath }: AdminViewProps) {
    const { t, language } = useI18n();
    const publicCoursesWithStats = useQuery(api.courses.listPublicWithStats);
    const pathsWithStats = useQuery(api.learningPaths.listPublicWithStats);
    const removeCourse = useMutation(api.courses.remove);
    const updateMeta = useMutation(api.courses.updateMeta);
    const removePath = useMutation(api.learningPaths.remove);

    const [subTab, setSubTab] = useState<AdminSubTab>("courses");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDifficulty, setEditDifficulty] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<{ type: "course" | "path"; id: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const CEFR_LEVELS = ["A1", "A1+", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C1+", "C2"] as const;

    // Filter courses by search
    const filteredCourses = useMemo(() => {
        if (!publicCoursesWithStats) return [];
        if (!searchQuery.trim()) return publicCoursesWithStats;
        const query = searchQuery.toLowerCase();
        return publicCoursesWithStats.filter((c) =>
            c.title.toLowerCase().includes(query),
        );
    }, [publicCoursesWithStats, searchQuery]);

    // Filter paths by search
    const filteredPaths = useMemo(() => {
        if (!pathsWithStats) return [];
        if (!searchQuery.trim()) return pathsWithStats;
        const query = searchQuery.toLowerCase();
        return pathsWithStats.filter(
            (p) =>
                p.titleEn.toLowerCase().includes(query) ||
                p.titleZh.toLowerCase().includes(query),
        );
    }, [pathsWithStats, searchQuery]);

    // Summary stats
    const totalEnrollments = useMemo(() => {
        const courseEnrollments = publicCoursesWithStats?.reduce((sum, c) => sum + c.enrollmentCount, 0) ?? 0;
        const pathEnrollments = pathsWithStats?.reduce((sum, p) => sum + p.enrollmentCount, 0) ?? 0;
        return courseEnrollments + pathEnrollments;
    }, [publicCoursesWithStats, pathsWithStats]);

    function startEditCourse(courseId: string, title: string, difficulty: string) {
        setEditingCourseId(courseId);
        setEditTitle(title);
        setEditDifficulty(difficulty);
    }

    async function saveEditCourse() {
        if (!editingCourseId) return;
        await updateMeta({
            id: editingCourseId as Id<"courses">,
            title: editTitle.trim() || undefined,
            difficulty: editDifficulty as typeof CEFR_LEVELS[number],
        });
        setEditingCourseId(null);
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            if (deleteTarget.type === "course") {
                await removeCourse({ id: deleteTarget.id as Id<"courses"> });
            } else {
                await removePath({ id: deleteTarget.id as Id<"learningPaths"> });
            }
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    }

    function formatDate(timestamp: number): string {
        return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(new Date(timestamp));
    }

    const isLoading = subTab === "courses"
        ? publicCoursesWithStats === undefined
        : pathsWithStats === undefined;

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary-100 text-primary-700">
                        <ShieldIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                        {t.admin.title}
                    </h2>
                </div>
                <Button
                    onClick={subTab === "courses" ? onCreateCourse : onCreatePath}
                    size="sm"
                >
                    <PlusIcon className="w-4 h-4 mr-1.5" />
                    {subTab === "courses" ? t.home.newCourse : t.paths.createPath}
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <Card className="border-border">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                            <LibraryIcon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {publicCoursesWithStats?.length ?? 0}
                            </p>
                            <p className="text-xs text-muted-foreground">{t.admin.totalPublicCourses}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                            <RouteIcon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {pathsWithStats?.length ?? 0}
                            </p>
                            <p className="text-xs text-muted-foreground">{t.admin.totalPaths}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                            <UsersIcon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {totalEnrollments}
                            </p>
                            <p className="text-xs text-muted-foreground">{t.admin.totalEnrollments}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sub-tab Switcher */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex bg-muted/50 p-1 rounded-xl">
                    <button
                        onClick={() => { setSubTab("courses"); setSearchQuery(""); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            subTab === "courses"
                                ? "bg-surface text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <BookOpenIcon className="w-4 h-4" />
                            {t.admin.courses}
                        </span>
                    </button>
                    <button
                        onClick={() => { setSubTab("paths"); setSearchQuery(""); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            subTab === "paths"
                                ? "bg-surface text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <RouteIcon className="w-4 h-4" />
                            {t.admin.paths}
                        </span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t.home.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                    <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin mb-4" />
                    <p className="text-muted-foreground text-sm">{t.common.loading}</p>
                </div>
            ) : subTab === "courses" ? (
                /* Courses Table */
                filteredCourses.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-border">
                        <LibraryIcon className="w-10 h-10 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">{t.admin.noCourses}</p>
                    </div>
                ) : (
                    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">
                                        {t.admin.courseTitle}
                                    </th>
                                    <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3 w-20">
                                        {t.home.difficulty}
                                    </th>
                                    <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-3 w-20">
                                        {t.create.wordCount}
                                    </th>
                                    <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-3 w-24">
                                        <span className="flex items-center justify-center gap-1">
                                            <UsersIcon className="w-3.5 h-3.5" />
                                            {t.admin.enrollments}
                                        </span>
                                    </th>
                                    <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3 w-28">
                                        {t.admin.created}
                                    </th>
                                    <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3 w-28">
                                        {t.admin.actions}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.map((course) => {
                                    const isEditing = editingCourseId === course._id;
                                    const diffConfig = DIFFICULTY_CONFIG[course.difficulty as keyof typeof DIFFICULTY_CONFIG];
                                    return (
                                        <tr key={course._id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                                            <td className="px-5 py-3.5">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="w-full px-2 py-1 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="text-sm font-medium text-foreground line-clamp-1">
                                                        {course.title}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3.5">
                                                {isEditing ? (
                                                    <select
                                                        value={editDifficulty}
                                                        onChange={(e) => setEditDifficulty(e.target.value)}
                                                        className="px-2 py-1 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground"
                                                    >
                                                        {CEFR_LEVELS.map((level) => (
                                                            <option key={level} value={level}>{level}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${diffConfig?.color ?? "text-gray-500"}`}>
                                                        {course.difficulty}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3.5 text-center">
                                                <span className="text-sm text-muted-foreground">
                                                    {course.wordCount}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 text-center">
                                                <span className="inline-flex items-center gap-1 text-sm text-foreground font-medium">
                                                    {course.enrollmentCount}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(course._creationTime)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {isEditing ? (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setEditingCourseId(null)}
                                                            >
                                                                {t.common.cancel}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={saveEditCourse}
                                                            >
                                                                <CheckIcon className="w-3.5 h-3.5 mr-1" />
                                                                {t.common.save}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => startEditCourse(course._id, course.title, course.difficulty)}
                                                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                                title={t.admin.editMeta}
                                                            >
                                                                <EditIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteTarget({ type: "course", id: course._id })}
                                                                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                                title={t.common.delete}
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                /* Paths Table */
                filteredPaths.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-border">
                        <RouteIcon className="w-10 h-10 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">{t.admin.noPaths}</p>
                    </div>
                ) : (
                    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">
                                        {language === "zh" ? "路径名称" : "Path Name"}
                                    </th>
                                    <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3 w-20">
                                        {t.home.difficulty}
                                    </th>
                                    <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-3 w-20">
                                        {t.paths.courses}
                                    </th>
                                    <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-3 w-24">
                                        <span className="flex items-center justify-center gap-1">
                                            <UsersIcon className="w-3.5 h-3.5" />
                                            {t.admin.enrollments}
                                        </span>
                                    </th>
                                    <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3 w-28">
                                        {t.admin.created}
                                    </th>
                                    <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3 w-28">
                                        {t.admin.actions}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPaths.map((path) => {
                                    const title = language === "zh" ? path.titleZh : path.titleEn;
                                    const diffConfig = DIFFICULTY_CONFIG[path.difficulty as keyof typeof DIFFICULTY_CONFIG];
                                    return (
                                        <tr key={path._id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <span className="text-sm font-medium text-foreground line-clamp-1">
                                                    {title}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${diffConfig?.color ?? "text-gray-500"}`}>
                                                    {path.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 text-center">
                                                <span className="text-sm text-muted-foreground">
                                                    {path.courseIds.length}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 text-center">
                                                <span className="text-sm text-foreground font-medium">
                                                    {path.enrollmentCount}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(path._creationTime)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => onEditPath(path._id)}
                                                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                        title={t.admin.editPath}
                                                    >
                                                        <EditIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget({ type: "path", id: path._id })}
                                                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                        title={t.common.delete}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title={deleteTarget?.type === "course" ? t.common.deleteCourse : t.paths.deletePath}
                description={deleteTarget?.type === "course" ? t.common.deleteConfirm : t.paths.deletePathConfirm}
                variant="destructive"
                isLoading={isDeleting}
            />
        </>
    );
}
