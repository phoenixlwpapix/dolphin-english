import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

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
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").order("desc").collect();

    // Get progress for each course
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await ctx.db
          .query("progress")
          .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
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
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    title: v.string(),
    difficulty: v.union(
      v.literal("A1"),
      v.literal("A1+"),
      v.literal("A2"),
      v.literal("A2+"),
      v.literal("B1"),
      v.literal("B1+"),
      v.literal("B2"),
      v.literal("B2+"),
      v.literal("C1"),
      v.literal("C1+"),
      v.literal("C2"),
    ),
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

    // Filter for public courses only
    return courses.filter((course) => course.isPublic === true);
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
