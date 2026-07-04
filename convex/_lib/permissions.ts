import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

type DbCtx = QueryCtx | MutationCtx;

export async function isCourseEnrolled(
  ctx: DbCtx,
  userId: Id<"users">,
  courseId: Id<"courses">,
) {
  const enrollment = await ctx.db
    .query("userCourses")
    .withIndex("by_userId_courseId", (q) =>
      q.eq("userId", userId.toString()).eq("courseId", courseId),
    )
    .first();

  return enrollment !== null;
}

export function isCourseAuthor(
  course: Doc<"courses">,
  userId: Id<"users">,
) {
  return course.authorId === userId.toString();
}

export async function canPreviewCourse(
  ctx: DbCtx,
  course: Doc<"courses">,
  userId: Id<"users"> | null,
) {
  if (course.isPublic === true) return true;
  if (!userId) return false;
  if (isCourseAuthor(course, userId)) return true;
  return await isCourseEnrolled(ctx, userId, course._id);
}

export async function canStudyCourse(
  ctx: DbCtx,
  course: Doc<"courses">,
  userId: Id<"users">,
) {
  if (isCourseAuthor(course, userId)) return true;
  return await isCourseEnrolled(ctx, userId, course._id);
}

export async function requireCourseStudyAccess(
  ctx: DbCtx,
  courseId: Id<"courses">,
  userId: Id<"users">,
) {
  const course = await ctx.db.get(courseId);
  if (!course) throw new Error("Course not found");

  const canStudy = await canStudyCourse(ctx, course, userId);
  if (!canStudy) throw new Error("Course access denied");

  return course;
}
