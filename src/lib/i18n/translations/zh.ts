// Type-safe translation structure
export interface Translations {
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    back: string;
    next: string;
    previous: string;
    complete: string;
    restart: string;
    created: string;
    deleteCourse: string;
    leaveCourse: string;
    restartConfirm: string;
    deleteConfirm: string;
    leaveConfirm: string;
    public: string;
  };
  app: {
    title: string;
    subtitle: string;
  };
  home: {
    myCourses: string;
    newCourse: string;
    noCourses: string;
    noCoursesDesc: string;
    lastStudied: string;
    progress: string;
    difficulty: string;
    searchPlaceholder: string;
    allDifficulties: string;
    sortByLastStudied: string;
    sortByAddedDate: string;
    noResults: string;
    clearFilters: string;
    accountSettings: string;
    loadingCourses: string;
    tryAdjusting: string;
  };
  create: {
    title: string;
    textTab: string;
    imageTab: string;
    textPlaceholder: string;
    imageDropzone: string;
    analyzing: string;
    wordCount: string;
    recommended: string;
    tooShort: string;
    tooLong: string;
    startLearning: string;
    publicCourse: string;
    privateCourse: string;
    clickToChange: string;
    clickOrDrop: string;
  };
  course: {
    module: string;
    totalTime: string;
    minutes: string;
    joinCourse: string;
    joined: string;
    articlePreview: string;
    startLearning: string;
    pleaseSignIn: string;
  };
  modules: {
    objectives: string;
    listening: string;
    analysis: string;
    vocabulary: string;
    quiz: string;
    reproduction: string;
  };
  objectives: {
    title: string;
    afterLearning: string;
  };
  listening: {
    title: string;
    playAll: string;
    pause: string;
    resume: string;
    speed: string;
    slow: string;
    normal: string;
    fast: string;
  };
  analysis: {
    title: string;
    paragraph: string;
    summary: string;
    languagePoints: string;
    practice: string;
    listenAgain: string;
    stop: string;
  };
  vocabulary: {
    title: string;
    essential: string;
    transferable: string;
    extended: string;
    definition: string;
    example: string;
    playPronunciation: string;
    wordsReviewed: string;
  };
  quiz: {
    title: string;
    question: string;
    of: string;
    checkAnswer: string;
    correct: string;
    incorrect: string;
    seeReference: string;
    score: string;
    passed: string;
    tryAgain: string;
    needsRetry: string;
    wrongCount: string;
    retryWrong: string;
    allCorrect: string;
    round: string;
    questionTypes: {
      mainIdea: string;
      detail: string;
      vocabulary: string;
    };
  };
  reproduction: {
    title: string;
    timeline: string;
    retelling: string;
    paraphrase: string;
    dragToSort: string;
    selectAnswer: string;
    keywordHint: string;
    keySummaries: string;
    noContent: string;
    courseComplete: string;
    backToHome: string;
    tryAgain: string;
  };
  settings: {
    language: string;
    chinese: string;
    english: string;
  };
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    signInTitle: string;
    email: string;
    password: string;
    signInError: string;
    signUpError: string;
    noAccount: string;
    hasAccount: string;
  };
  sidebar: {
    publicCourses: string;
    myCourses: string;
    noPublicCourses: string;
    noMyCourses: string;
    settings: string;
    navigation: string;
  };
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    startLearning: string;
    learnMore: string;
    readyToStart: string;
    featuresTitle: string;
    whyChoose: string;
    whyChooseDesc: string;
    version: string;
    stats: {
      levels: string;
      ai: string;
      free: string;
    };
    quote: {
      text1: string;
      text2: string;
    };
    startToday: string;
    joinThousands: string;
    features: {
      daily: { title: string; desc: string };
      real: { title: string; desc: string };
      level: { title: string; desc: string };
      ai: { title: string; desc: string };
    };
  };
  footer: {
    product: string;
    features: string;
    pricing: string;
    resources: string;
    blog: string;
    community: string;
    help: string;
    company: string;
    about: string;
    careers: string;
    legal: string;
    privacy: string;
    terms: string;
    copyright: string;
    slogan: string;
  };
}

export const zh: Translations = {
  // Common
  common: {
    loading: "加载中...",
    error: "发生错误",
    retry: "重试",
    cancel: "取消",
    confirm: "确认",
    save: "保存",
    delete: "删除",
    back: "返回",
    next: "下一步",
    previous: "上一步",
    complete: "完成",
    restart: "重新开始",
    created: "创建时间",
    deleteCourse: "删除课程",
    leaveCourse: "退出课程",
    restartConfirm: "确定要重新开始吗？这将丢失当前的课程进度。",
    deleteConfirm: "确定要删除这个课程吗？",
    leaveConfirm: "确定要退出这个课程吗？你的学习进度将被清除。",
    public: "公开",
  },

  // App
  app: {
    title: "海豚英语",
    subtitle: "让每篇文章都变成一堂英语课",
  },

  // Homepage
  home: {
    myCourses: "我的课程",
    newCourse: "新建课程",
    noCourses: "还没有课程",
    noCoursesDesc: "创建你的第一个课程开始学习",
    lastStudied: "上次学习",
    progress: "进度",
    difficulty: "难度",
    searchPlaceholder: "搜索课程标题...",
    allDifficulties: "全部",
    sortByLastStudied: "最近学习",
    sortByAddedDate: "加入时间",
    noResults: "没有找到匹配的课程",
    clearFilters: "清空筛选",
    accountSettings: "管理您的账户偏好",
    loadingCourses: "正在加载课程...",
    tryAdjusting: "尝试调整搜索或筛选条件。",
  },

  // Create Course
  create: {
    title: "创建新课程",
    textTab: "粘贴文字",
    imageTab: "上传图片",
    textPlaceholder: "在此粘贴英文文章（建议350-600词）...",
    imageDropzone: "拖拽图片到此处，或点击选择",
    analyzing: "正在分析文章...",
    wordCount: "词数",
    recommended: "推荐范围：350-600词",
    tooShort: "文章太短，建议至少350词",
    tooLong: "文章较长，建议不超过600词",
    startLearning: "开始学习",
    publicCourse: "公开课程",
    privateCourse: "仅我的课程",
    clickToChange: "点击更换",
    clickOrDrop: "点击上传或拖拽文件至此",
  },

  // Course Learning
  course: {
    module: "模块",
    totalTime: "预计时长",
    minutes: "分钟",
    joinCourse: "加入课程",
    joined: "已加入",
    articlePreview: "文章预览",
    startLearning: "开始学习",
    pleaseSignIn: "请先登录以加入课程",
  },

  // Module Names
  modules: {
    objectives: "学习目标",
    listening: "整体听读",
    analysis: "分段精讲",
    vocabulary: "词汇学习",
    quiz: "理解检测",
    reproduction: "内容复现",
  },

  // Module 1: Objectives
  objectives: {
    title: "本课学习目标",
    afterLearning: "完成本课后，你将能够：",
  },

  // Module 2: Listening
  listening: {
    title: "听读全文",
    playAll: "播放全文",
    pause: "暂停",
    resume: "继续",
    speed: "语速",
    slow: "慢速",
    normal: "正常",
    fast: "快速",
  },

  // Module 3: Analysis
  analysis: {
    title: "分段精讲",
    paragraph: "段落",
    summary: "本段要点",
    languagePoints: "语言点",
    practice: "跟读练习",
    listenAgain: "再听一次",
    stop: "停止",
  },

  // Module 4: Vocabulary
  vocabulary: {
    title: "词汇学习",
    essential: "必须理解",
    transferable: "可迁移使用",
    extended: "拓展了解",
    definition: "释义",
    example: "原文例句",
    playPronunciation: "播放发音",
    wordsReviewed: "已复习单词",
  },

  // Module 5: Quiz
  quiz: {
    title: "理解检测",
    question: "问题",
    of: "/",
    checkAnswer: "检查答案",
    correct: "正确！",
    incorrect: "再想想",
    seeReference: "查看原文",
    score: "得分",
    passed: "通过",
    tryAgain: "再试一次",
    needsRetry: "还有错题需要重做",
    wrongCount: "你有 {count} 道题答错了",
    retryWrong: "重做错题",
    allCorrect: "全部正确！",
    round: "第",
    questionTypes: {
      mainIdea: "主旨理解",
      detail: "细节定位",
      vocabulary: "词义理解",
    },
  },

  // Module 6: Reproduction
  reproduction: {
    title: "内容复现",
    timeline: "时间线排序",
    retelling: "关键词复述",
    paraphrase: "句型改写",
    dragToSort: "拖拽排序",
    selectAnswer: "选择正确的改写",
    keywordHint: "使用这些关键词复述文章主旨：",
    keySummaries: "文章关键要点：",
    noContent: "没有可显示的内容",
    courseComplete: "恭喜！你已完成本课程的所有学习模块。",
    backToHome: "返回主页",
    tryAgain: "重新排序",
  },

  // Settings
  settings: {
    language: "语言",
    chinese: "中文",
    english: "English",
  },

  // Auth
  auth: {
    signIn: "登录",
    signUp: "注册",
    signOut: "退出",
    signInTitle: "欢迎",
    email: "邮箱",
    password: "密码",
    signInError: "邮箱或密码错误",
    signUpError: "无法创建账户",
    noAccount: "还没有账户？",
    hasAccount: "已有账户？",
  },

  // Sidebar
  sidebar: {
    publicCourses: "公共课程",
    myCourses: "我的课程",
    noPublicCourses: "暂无公共课程",
    noMyCourses: "暂无课程",
    settings: "设置",
    navigation: "导航",
  },

  // Landing Page
  landing: {
    heroTitle: "Dolphin English",
    heroSubtitle: "通过真实文章提升你的英语听说读写能力。覆盖 A1-C2 全 CEFR 等级。",
    startLearning: "开始学习",
    learnMore: "了解更多",
    readyToStart: "准备好开启你的旅程了吗？",
    featuresTitle: "功能特点",
    whyChoose: "为什么选择海豚英语？",
    whyChooseDesc: "AI 赋能的现代英语学习方式，基于真实世界内容。",
    version: "v1.0 公测版",
    stats: {
      levels: "CEFR 等级",
      ai: "AI 生成",
      free: "免费",
    },
    quote: {
      text1: "拥有另一种语言",
      text2: "就是拥有第二个灵魂。",
    },
    startToday: "即刻开始",
    joinThousands: "加入成千上万的学习者，通过我们的 AI 平台提升英语技能。",
    features: {
      daily: {
        title: "每天 30 分钟",
        desc: "短小精悍的课程，专为忙碌的你设计。",
      },
      real: {
        title: "真实文章",
        desc: "告别枯燥教科书，从真实新闻和故事中学习。",
      },
      level: {
        title: "A1-C2 全等级",
        desc: "覆盖全 CEFR 等级，从入门到精通，满足不同阶段学习需求。",
      },
      ai: {
        title: "AI 深度分析",
        desc: "对文章词汇和句式的深度解析。",
      },
    },
  },

  // Footer
  footer: {
    product: "产品",
    features: "功能",
    pricing: "定价",
    resources: "资源",
    blog: "博客",
    community: "社区",
    help: "帮助中心",
    company: "公司",
    about: "关于我们",
    careers: "加入我们",
    legal: "法律",
    privacy: "隐私政策",
    terms: "服务条款",
    copyright: "© 2024 海豚英语。保留所有权利。",
    slogan: "为英语学习者打造的下一代学习工具。",
  },
};
