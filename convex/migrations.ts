import { internalMutation } from "./_generated/server"

// Maps + variants to their base level
const DIFFICULTY_DOWNGRADE: Record<string, string> = {
    "A1+": "A2",
    "A2+": "B1",
    "B1+": "B1",
    "B2+": "B2",
    "C1+": "C1",
}

export const fixDifficulty = internalMutation({
    args: {},
    handler: async (ctx) => {
        let coursesFixed = 0
        let pathsFixed = 0

        // Fix courses
        const courses = await ctx.db.query("courses").collect()
        for (const course of courses) {
            const mapped = DIFFICULTY_DOWNGRADE[course.difficulty]
            if (mapped) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await ctx.db.patch(course._id, { difficulty: mapped as any })
                coursesFixed++
            }
        }

        // Fix learningPaths
        const paths = await ctx.db.query("learningPaths").collect()
        for (const path of paths) {
            const mapped = DIFFICULTY_DOWNGRADE[path.difficulty]
            if (mapped) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await ctx.db.patch(path._id, { difficulty: mapped as any })
                pathsFixed++
            }
        }

        return { coursesFixed, pathsFixed }
    },
})
