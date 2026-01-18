import { db, type Course, type Progress, type CourseAnalysis } from '@/db'

// Course service functions

export async function createCourse(
    content: string,
    title: string,
    difficulty: 'A2' | 'A2+' | 'B1',
    wordCount: number,
    analyzedData: CourseAnalysis | null = null
): Promise<number> {
    const id = await db.courses.add({
        title,
        content,
        difficulty,
        wordCount,
        createdAt: new Date(),
        analyzedData,
    })
    return id as number
}

export async function getCourse(id: number): Promise<Course | undefined> {
    return db.courses.get(id)
}

export async function updateCourseAnalysis(
    id: number,
    analyzedData: CourseAnalysis
): Promise<void> {
    await db.courses.update(id, { analyzedData })
}

export async function listCourses(): Promise<Course[]> {
    return db.courses.orderBy('createdAt').reverse().toArray()
}

export async function deleteCourse(id: number): Promise<void> {
    await db.courses.delete(id)
    // Also delete associated progress
    await db.progress.where('courseId').equals(id).delete()
}

export async function getCoursesWithProgress(): Promise<Array<Course & { progress?: Progress }>> {
    const courses = await listCourses()
    const courseIds = courses.map(c => c.id).filter((id): id is number => id !== undefined)
    const progressRecords = await db.progress.where('courseId').anyOf(courseIds).toArray()

    const progressMap = new Map(progressRecords.map(p => [p.courseId, p]))

    return courses.map(course => ({
        ...course,
        progress: course.id ? progressMap.get(course.id) : undefined,
    }))
}
