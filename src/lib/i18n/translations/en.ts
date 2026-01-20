import type { Translations } from "./zh";

export const en: Translations = {
  // Common
  common: {
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    back: "Back",
    next: "Next",
    previous: "Previous",
    complete: "Complete",
    restart: "Restart",
    created: "Created",
    deleteCourse: "Delete Course",
    restartConfirm:
      "Are you sure you want to restart? This will lose all current progress.",
    deleteConfirm: "Are you sure you want to delete this course?",
  },

  // App
  app: {
    title: "Dolphin English",
    subtitle: "Turn every article into an English lesson",
  },

  // Homepage
  home: {
    myCourses: "My Courses",
    newCourse: "New Course",
    noCourses: "No courses yet",
    noCoursesDesc: "Create your first course to start learning",
    lastStudied: "Last studied",
    progress: "Progress",
    difficulty: "Difficulty",
    searchPlaceholder: "Search course titles...",
    allDifficulties: "All",
    sortByLastStudied: "Last Studied",
    sortByCreationDate: "Created",
    noResults: "No matching courses found",
    clearFilters: "Clear filters",
  },

  // Create Course
  create: {
    title: "Create New Course",
    textTab: "Paste Text",
    imageTab: "Upload Image",
    textPlaceholder:
      "Paste your English article here (350-600 words recommended)...",
    imageDropzone: "Drop image here or click to select",
    analyzing: "Analyzing article...",
    wordCount: "Word count",
    recommended: "Recommended: 350-600 words",
    tooShort: "Article too short, at least 350 words recommended",
    tooLong: "Article is quite long, under 600 words recommended",
    startLearning: "Start Learning",
    publicCourse: "Public Course",
    privateCourse: "My Course Only",
  },

  // Course Learning
  course: {
    module: "Module",
    totalTime: "Estimated time",
    minutes: "min",
    joinCourse: "Join Course",
    joined: "Joined",
  },

  // Module Names
  modules: {
    objectives: "Learning Objectives",
    listening: "Full Listening",
    analysis: "Paragraph Analysis",
    vocabulary: "Vocabulary",
    quiz: "Comprehension Quiz",
    reproduction: "Content Reproduction",
  },

  // Module 1: Objectives
  objectives: {
    title: "Learning Objectives",
    afterLearning: "After this lesson, you will be able to:",
  },

  // Module 2: Listening
  listening: {
    title: "Listen to Full Article",
    playAll: "Play All",
    pause: "Pause",
    resume: "Resume",
    speed: "Speed",
    slow: "Slow",
    normal: "Normal",
    fast: "Fast",
  },

  // Module 3: Analysis
  analysis: {
    title: "Paragraph Analysis",
    paragraph: "Paragraph",
    summary: "Key Point",
    languagePoints: "Language Points",
    practice: "Read Along",
    listenAgain: "Listen Again",
    stop: "Stop",
  },

  // Module 4: Vocabulary
  vocabulary: {
    title: "Vocabulary Learning",
    essential: "Essential",
    transferable: "Transferable",
    extended: "Extended",
    definition: "Definition",
    example: "Example from article",
    playPronunciation: "Play pronunciation",
    wordsReviewed: "words reviewed",
  },

  // Module 5: Quiz
  quiz: {
    title: "Comprehension Quiz",
    question: "Question",
    of: "/",
    checkAnswer: "Check Answer",
    correct: "Correct!",
    incorrect: "Try again",
    seeReference: "See reference",
    score: "Score",
    passed: "Passed",
    tryAgain: "Try Again",
    needsRetry: "Some questions need to be redone",
    wrongCount: "You got {count} question(s) wrong",
    retryWrong: "Retry Wrong Questions",
    allCorrect: "All Correct!",
    round: "Round",
    questionTypes: {
      mainIdea: "Main Idea",
      detail: "Detail",
      vocabulary: "Vocabulary",
    },
  },

  // Module 6: Reproduction
  reproduction: {
    title: "Content Reproduction",
    timeline: "Timeline Ordering",
    retelling: "Keyword Retelling",
    paraphrase: "Sentence Paraphrase",
    dragToSort: "Drag to sort",
    selectAnswer: "Select the correct paraphrase",
    keywordHint: "Use these keywords to retell the main ideas of the article:",
    keySummaries: "Key summaries from the article:",
    noContent: "No content to display",
    courseComplete:
      "Congratulations! You have completed all learning modules for this course.",
    backToHome: "Back to Home",
    tryAgain: "Try Again",
  },

  // Settings
  settings: {
    language: "Language",
    chinese: "中文",
    english: "English",
  },

  // Auth
  auth: {
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    signInTitle: "Welcome",
    email: "Email",
    password: "Password",
    signInError: "Invalid email or password",
    signUpError: "Could not create account",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
  },

  // Sidebar
  sidebar: {
    publicCourses: "Public Courses",
    myCourses: "My Courses",
    noPublicCourses: "No public courses",
    noMyCourses: "No courses yet",
  },

  // Landing Page
  landing: {
    heroTitle: "Dolphin English",
    heroSubtitle:
      "Improve your English reading and listening with real-world content. Tailored for A2-B1 learners.",
    startLearning: "Start Learning",
    learnMore: "Learn More",
    readyToStart: "Ready to start your journey?",
    features: {
      daily: {
        title: "30 Minutes a Day",
        desc: "Short, effective lessons designed for busy schedules.",
      },
      real: {
        title: "Real Articles",
        desc: "Learn from actual news and stories, not boring textbooks.",
      },
      level: {
        title: "A2-B1 Levels",
        desc: "Perfect difficulty curve to help you progress steadily.",
      },
      ai: {
        title: "AI Analysis",
        desc: "Deep analysis of vocabulary and sentence structure.",
      },
    },
  },
};
