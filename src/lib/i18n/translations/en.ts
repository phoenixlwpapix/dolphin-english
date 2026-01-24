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
    leaveCourse: "Leave Course",
    restartConfirm:
      "Are you sure you want to restart? This will lose all current progress.",
    deleteConfirm: "Are you sure you want to delete this course?",
    leaveConfirm: "Are you sure you want to leave this course? Your progress will be cleared.",
    public: "Public",
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
    sortByAddedDate: "Added",
    noResults: "No matching courses found",
    clearFilters: "Clear filters",
    accountSettings: "Manage your account preferences",
    loadingCourses: "Loading courses...",
    tryAdjusting: "Try adjusting your search or filters to find what you're looking for.",
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
    clickToChange: "Click to change",
    clickOrDrop: "Click to upload or drag and drop",
  },

  // Course Learning
  course: {
    module: "Module",
    totalTime: "Estimated time",
    minutes: "min",
    joinCourse: "Join Course",
    joined: "Joined",
    articlePreview: "Article Preview",
    startLearning: "Start Learning",
    pleaseSignIn: "Please sign in to join this course",
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
    settings: "Settings",
    navigation: "Navigation",
  },

  // Landing Page
  landing: {
    heroTitle: "Dolphin English",
    heroSubtitle:
      "Improve your English reading and listening with real-world content. All CEFR levels from A1 to C2.",
    startLearning: "Start Learning",
    learnMore: "Learn More",
    readyToStart: "Ready to start your journey?",
    featuresTitle: "Features",
    whyChoose: "Why Choose Dolphin English?",
    whyChooseDesc: "A modern approach to English learning with AI-powered tools and real-world content.",
    version: "v1.0 Public Beta",
    stats: {
      levels: "CEFR Levels",
      ai: "AI-Generated",
      free: "Free",
    },
    quote: {
      text1: "To have another language",
      text2: "is to possess a second soul.",
    },
    startToday: "Start Today",
    joinThousands: "Join thousands of learners improving their English skills with our AI-powered platform.",
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
        title: "A1-C2 Levels",
        desc: "Full CEFR coverage from beginner to advanced, meeting diverse learning needs.",
      },
      ai: {
        title: "AI Analysis",
        desc: "Deep analysis of vocabulary and sentence structure.",
      },
    },
  },

  // Footer
  footer: {
    product: "Product",
    features: "Features",
    pricing: "Pricing",
    resources: "Resources",
    blog: "Blog",
    community: "Community",
    help: "Help Center",
    company: "Company",
    about: "About Us",
    careers: "Careers",
    legal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    copyright: "© 2026 Dolphin English. All rights reserved.",
    slogan: "The next generation learning tool for English learners.",
  },
};
