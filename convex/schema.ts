import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Bilingual learning objective validator
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

const quizResultValidator = v.object({
  questionId: v.string(),
  selectedAnswer: v.number(),
  isCorrect: v.boolean(),
});

const moduleCompletionValidator = v.object({
  moduleNumber: v.number(),
  completedAt: v.number(),
});

const difficultyValidator = v.union(
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
);

export { difficultyValidator };

export default defineSchema({
  ...authTables,

  // Custom users table for app-specific user data
  users: defineTable({
    email: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("by_email", ["email"]),

  courses: defineTable({
    title: v.string(),
    content: v.string(),
    difficulty: difficultyValidator,
    wordCount: v.number(),
    analyzedData: v.optional(courseAnalysisValidator),
    isPublic: v.optional(v.boolean()),
    authorId: v.optional(v.string()),
  }),

  userCourses: defineTable({
    userId: v.string(),
    courseId: v.id("courses"),
    addedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_courseId", ["userId", "courseId"]),

  progress: defineTable({
    courseId: v.id("courses"),
    currentModule: v.number(),
    completedModules: v.array(v.number()),
    moduleCompletions: v.optional(v.array(moduleCompletionValidator)),
    lastStudiedAt: v.optional(v.number()),
    quizResults: v.array(quizResultValidator),
    vocabularyClicks: v.array(v.string()),
  }).index("by_courseId", ["courseId"]),

  learningPaths: defineTable({
    titleEn: v.string(),
    titleZh: v.string(),
    descriptionEn: v.string(),
    descriptionZh: v.string(),
    difficulty: difficultyValidator,
    courseIds: v.array(v.id("courses")),
    coverGradient: v.optional(v.string()),
    authorId: v.string(),
    isPublic: v.boolean(),
  }),

  userPaths: defineTable({
    userId: v.string(),
    pathId: v.id("learningPaths"),
    addedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_pathId", ["userId", "pathId"]),
});
