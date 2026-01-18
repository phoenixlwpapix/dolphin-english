import type { Translations } from './zh'

export const en: Translations = {
    // Common
    common: {
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Retry',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        complete: 'Complete',
        restart: 'Restart',
    },

    // App
    app: {
        title: 'Dolphin English',
        subtitle: 'Learn English through real articles',
    },

    // Homepage
    home: {
        myCourses: 'My Courses',
        newCourse: 'New Course',
        noCourses: 'No courses yet',
        noCoursesDesc: 'Create your first course to start learning',
        lastStudied: 'Last studied',
        progress: 'Progress',
        difficulty: 'Difficulty',
    },

    // Create Course
    create: {
        title: 'Create New Course',
        textTab: 'Paste Text',
        imageTab: 'Upload Image',
        textPlaceholder: 'Paste your English article here (350-600 words recommended)...',
        imageDropzone: 'Drop image here or click to select',
        analyzing: 'Analyzing article...',
        wordCount: 'Word count',
        recommended: 'Recommended: 350-600 words',
        tooShort: 'Article too short, at least 350 words recommended',
        tooLong: 'Article is quite long, under 600 words recommended',
        startLearning: 'Start Learning',
    },

    // Course Learning
    course: {
        module: 'Module',
        totalTime: 'Estimated time',
        minutes: 'min',
    },

    // Module Names
    modules: {
        objectives: 'Learning Objectives',
        listening: 'Full Listening',
        analysis: 'Paragraph Analysis',
        vocabulary: 'Vocabulary',
        quiz: 'Comprehension Quiz',
        reproduction: 'Content Reproduction',
    },

    // Module 1: Objectives
    objectives: {
        title: 'Learning Objectives',
        afterLearning: 'After this lesson, you will be able to:',
    },

    // Module 2: Listening
    listening: {
        title: 'Listen to Full Article',
        playAll: 'Play All',
        pause: 'Pause',
        resume: 'Resume',
        speed: 'Speed',
        slow: 'Slow',
        normal: 'Normal',
        fast: 'Fast',
    },

    // Module 3: Analysis
    analysis: {
        title: 'Paragraph Analysis',
        paragraph: 'Paragraph',
        summary: 'Key Point',
        languagePoints: 'Language Points',
        practice: 'Read Along',
        listenAgain: 'Listen Again',
    },

    // Module 4: Vocabulary
    vocabulary: {
        title: 'Vocabulary Learning',
        essential: 'Essential',
        transferable: 'Transferable',
        extended: 'Extended',
        definition: 'Definition',
        example: 'Example from article',
        playPronunciation: 'Play pronunciation',
    },

    // Module 5: Quiz
    quiz: {
        title: 'Comprehension Quiz',
        question: 'Question',
        of: '/',
        checkAnswer: 'Check Answer',
        correct: 'Correct!',
        incorrect: 'Try again',
        seeReference: 'See reference',
        score: 'Score',
        passed: 'Passed',
        tryAgain: 'Try Again',
    },

    // Module 6: Reproduction
    reproduction: {
        title: 'Content Reproduction',
        timeline: 'Timeline Ordering',
        retelling: 'Keyword Retelling',
        paraphrase: 'Sentence Paraphrase',
        dragToSort: 'Drag to sort',
        selectAnswer: 'Select the correct paraphrase',
    },

    // Settings
    settings: {
        language: 'Language',
        chinese: '中文',
        english: 'English',
    },
}
