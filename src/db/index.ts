import Dexie, { type EntityTable } from 'dexie'

// Course data structure
export interface Course {
  id?: number
  title: string
  content: string
  difficulty: 'A2' | 'A2+' | 'B1'
  wordCount: number
  createdAt: Date
  analyzedData: CourseAnalysis | null
}

// AI-generated course analysis
export interface CourseAnalysis {
  learningObjectives: string[]
  paragraphs: ParagraphAnalysis[]
  vocabulary: VocabularyItem[]
  quizQuestions: QuizQuestion[]
}

export interface ParagraphAnalysis {
  index: number
  text: string
  summary: string
  languagePoints: LanguagePoint[]
}

export interface LanguagePoint {
  point: string
  explanation: string
  example: string
}

export interface VocabularyItem {
  word: string
  pronunciation: string
  definition: string
  originalSentence: string
  category: 'essential' | 'transferable' | 'extended'
}

export interface QuizQuestion {
  id: string
  type: 'main-idea' | 'detail' | 'vocabulary'
  question: string
  options: string[]
  correctAnswer: number
  sourceReference: string
}

// Learning progress
export interface Progress {
  id?: number
  courseId: number
  currentModule: number
  completedModules: number[]
  quizResults: QuizResult[]
  vocabularyClicks: string[]
  lastAccessedAt: Date
}

export interface QuizResult {
  questionId: string
  selectedAnswer: number
  isCorrect: boolean
}

// Database class
class DolphinDatabase extends Dexie {
  courses!: EntityTable<Course, 'id'>
  progress!: EntityTable<Progress, 'id'>

  constructor() {
    super('DolphinEnglish')
    
    this.version(1).stores({
      courses: '++id, title, difficulty, createdAt',
      progress: '++id, courseId, lastAccessedAt'
    })
  }
}

export const db = new DolphinDatabase()
