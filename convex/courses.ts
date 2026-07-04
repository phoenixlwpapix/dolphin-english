import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { difficultyValidator } from "./schema";
import type { Doc } from "./_generated/dataModel";
import {
  canPreviewCourse,
  canStudyCourse,
  isCourseEnrolled,
} from "./_lib/permissions";

// Validators (matching schema)
const bilingualObjectiveValidator = v.object({
  en: v.string(),
  zh: v.string(),
});

const languagePointValidator = v.object({
  point: v.string(),
  explanation: v.string(),
  explanationZH: v.string(),
  example: v.string(),
});

const paragraphValidator = v.object({
  index: v.number(),
  text: v.string(),
  summary: v.string(),
  summaryZH: v.string(),
  languagePoints: v.array(languagePointValidator),
});

const vocabularyValidator = v.object({
  word: v.string(),
  pronunciation: v.string(),
  definition: v.string(),
  definitionCN: v.optional(v.string()),
  originalSentence: v.string(),
  category: v.union(
    v.literal("essential"),
    v.literal("transferable"),
    v.literal("extended"),
  ),
});

const quizQuestionValidator = v.object({
  id: v.string(),
  type: v.union(
    v.literal("main-idea"),
    v.literal("detail"),
    v.literal("vocabulary"),
  ),
  question: v.string(),
  options: v.array(v.string()),
  correctAnswer: v.number(),
  sourceReference: v.string(),
});

const courseAnalysisValidator = v.object({
  learningObjectives: v.array(bilingualObjectiveValidator),
  paragraphs: v.array(paragraphValidator),
  vocabulary: v.array(vocabularyValidator),
  quizQuestions: v.array(quizQuestionValidator),
  dolphinSummary: v.optional(v.string()),
  dolphinSummaryEN: v.optional(v.string()),
});

function toCourseCardData(course: Doc<"courses">) {
  return {
    _id: course._id,
    _creationTime: course._creationTime,
    title: course.title,
    difficulty: course.difficulty,
    wordCount: course.wordCount,
    isPublic: course.isPublic,
    authorId: course.authorId,
  };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    const courses = await ctx.db.query("courses").order("desc").collect();

    if (!userId) return [];

    const visibleCourses: Array<Doc<"courses">> = [];
    for (const course of courses) {
      if (
        course.authorId === userId.toString() ||
        (await isCourseEnrolled(ctx, userId, course._id))
      ) {
        visibleCourses.push(course);
      }
    }

    const coursesWithProgress = await Promise.all(
      visibleCourses.map(async (course) => {
        const progress = await ctx.db
          .query("progress")
          .withIndex("by_userId_courseId", (q) =>
            q.eq("userId", userId.toString()).eq("courseId", course._id)
          )
          .first();
        return { ...course, progress };
      }),
    );

    return coursesWithProgress;
  },
});

export const get = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const course = await ctx.db.get(args.id);
    if (!course) return null;

    const canStudy = await canStudyCourse(ctx, course, userId);
    if (!canStudy) return null;

    return course;
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    title: v.string(),
    difficulty: difficultyValidator,
    wordCount: v.number(),
    analyzedData: v.optional(courseAnalysisValidator),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create a course");
    }

    // Check if user is admin (only admins can create public courses)
    const user = await ctx.db.get(userId);
    const isAdmin = user?.role === "admin";
    const isPublic = isAdmin && args.isPublic === true ? true : false;

    // Create the course
    const courseId = await ctx.db.insert("courses", {
      title: args.title,
      content: args.content,
      difficulty: args.difficulty,
      wordCount: args.wordCount,
      analyzedData: args.analyzedData,
      isPublic,
      authorId: userId.toString(),
    });

    // Auto-add to userCourses ONLY if it's a private course
    // If it's public, the creator (admin) can join it manually from the public list if they want to study it
    if (!isPublic) {
      await ctx.db.insert("userCourses", {
        userId: userId.toString(),
        courseId,
        addedAt: Date.now(),
      });
    }

    return courseId;
  },
});

export const updateAnalysis = mutation({
  args: {
    id: v.id("courses"),
    analyzedData: courseAnalysisValidator,
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const course = await ctx.db.get(args.id);
    if (!course) throw new Error("Course not found");

    const user = await ctx.db.get(userId);
    const isAdmin = user?.role === "admin";
    const isAuthor = course.authorId === userId.toString();
    if (!isAuthor && !isAdmin) {
      throw new Error("Course access denied");
    }

    await ctx.db.patch(args.id, { analyzedData: args.analyzedData });
  },
});

export const remove = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to delete a course");
    }

    const course = await ctx.db.get(args.id);
    if (!course) {
      throw new Error("Course not found");
    }

    const user = await ctx.db.get(userId);
    const isAdmin = user?.role === "admin";
    const isAuthor = course.authorId === userId.toString();

    // Permission check:
    // - Public courses: only admin AND author can delete
    // - Private courses: only the author can delete
    if (course.isPublic) {
      if (!isAdmin || !isAuthor) {
        throw new Error("Only admin who created this public course can delete it");
      }
    } else {
      if (!isAuthor) {
        throw new Error("Only the course author can delete this course");
      }
    }

    // Delete associated userCourses
    const userCourses = await ctx.db
      .query("userCourses")
      .filter((q) => q.eq(q.field("courseId"), args.id))
      .collect();

    for (const uc of userCourses) {
      await ctx.db.delete(uc._id);
    }

    // Delete associated progress
    const progress = await ctx.db
      .query("progress")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.id))
      .collect();

    for (const p of progress) {
      await ctx.db.delete(p._id);
    }

    // Delete the course
    await ctx.db.delete(args.id);
  },
});

/**
 * List all public courses
 */
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .order("desc")
      .collect();

    return courses
      .filter((course) => course.isPublic === true)
      .map(toCourseCardData);
  },
});

/**
 * Get all vocabulary from user's enrolled courses
 */
export const getMyVocabulary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const userCourses = await ctx.db
      .query("userCourses")
      .withIndex("by_userId", (q) => q.eq("userId", userId.toString()))
      .collect();

    const results = await Promise.all(
      userCourses.map(async (uc) => {
        const course = await ctx.db.get(uc.courseId);
        if (!course || !course.analyzedData?.vocabulary?.length) return null;

        const progress = await ctx.db
          .query("progress")
          .withIndex("by_userId_courseId", (q) =>
            q.eq("userId", userId.toString()).eq("courseId", uc.courseId)
          )
          .first();

        return {
          courseId: course._id,
          courseTitle: course.title,
          difficulty: course.difficulty,
          vocabulary: course.analyzedData.vocabulary,
          vocabularyClicks: progress?.vocabularyClicks ?? [],
        };
      })
    );

    return results.filter((r) => r !== null);
  },
});

/**
 * List all public courses with enrollment stats (admin use)
 */
export const listPublicWithStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") return [];

    const courses = await ctx.db
      .query("courses")
      .order("desc")
      .collect();

    const publicCourses = courses.filter((c) => c.isPublic === true);

    const result = await Promise.all(
      publicCourses.map(async (course) => {
        const enrollments = await ctx.db
          .query("userCourses")
          .filter((q) => q.eq(q.field("courseId"), course._id))
          .collect();

        return {
          _id: course._id,
          title: course.title,
          difficulty: course.difficulty,
          wordCount: course.wordCount,
          _creationTime: course._creationTime,
          enrollmentCount: enrollments.length,
        };
      }),
    );

    return result;
  },
});

/**
 * Update course metadata (admin only)
 */
export const updateMeta = mutation({
  args: {
    id: v.id("courses"),
    title: v.optional(v.string()),
    difficulty: v.optional(difficultyValidator),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Admin only");

    const course = await ctx.db.get(args.id);
    if (!course) throw new Error("Course not found");
    if (!course.isPublic) throw new Error("Can only edit public courses");
    if (course.authorId !== userId.toString()) throw new Error("Only author can edit");

    const updates: Record<string, string> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.difficulty !== undefined) updates.difficulty = args.difficulty;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.id, updates);
    }
  },
});


/**
 * Get course preview (for non-enrolled users)
 */
export const getPreview = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) return null;

    const userId = await auth.getUserId(ctx);
    const canPreview = await canPreviewCourse(ctx, course, userId);
    if (!canPreview) return null;

    // Return limited info for preview
    return {
      _id: course._id,
      title: course.title,
      difficulty: course.difficulty,
      wordCount: course.wordCount,
      isPublic: course.isPublic,
      authorId: course.authorId,
      contentPreview: course.content.slice(0, 300) + (course.content.length > 300 ? "..." : ""),
      learningObjectives: course.analyzedData?.learningObjectives ?? [],
    };
  },
});
