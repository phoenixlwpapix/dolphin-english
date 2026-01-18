// Type-safe translation structure
export interface Translations {
    common: {
        loading: string
        error: string
        retry: string
        cancel: string
        confirm: string
        save: string
        delete: string
        back: string
        next: string
        previous: string
        complete: string
        restart: string
        created: string
        deleteCourse: string
    }
    app: {
        title: string
        subtitle: string
    }
    home: {
        myCourses: string
        newCourse: string
        noCourses: string
        noCoursesDesc: string
        lastStudied: string
        progress: string
        difficulty: string
    }
    create: {
        title: string
        textTab: string
        imageTab: string
        textPlaceholder: string
        imageDropzone: string
        analyzing: string
        wordCount: string
        recommended: string
        tooShort: string
        tooLong: string
        startLearning: string
    }
    course: {
        module: string
        totalTime: string
        minutes: string
    }
    modules: {
        objectives: string
        listening: string
        analysis: string
        vocabulary: string
        quiz: string
        reproduction: string
    }
    objectives: {
        title: string
        afterLearning: string
    }
    listening: {
        title: string
        playAll: string
        pause: string
        resume: string
        speed: string
        slow: string
        normal: string
        fast: string
    }
    analysis: {
        title: string
        paragraph: string
        summary: string
        languagePoints: string
        practice: string
        listenAgain: string
    }
    vocabulary: {
        title: string
        essential: string
        transferable: string
        extended: string
        definition: string
        example: string
        playPronunciation: string
    }
    quiz: {
        title: string
        question: string
        of: string
        checkAnswer: string
        correct: string
        incorrect: string
        seeReference: string
        score: string
        passed: string
        tryAgain: string
    }
    reproduction: {
        title: string
        timeline: string
        retelling: string
        paraphrase: string
        dragToSort: string
        selectAnswer: string
    }
    settings: {
        language: string
        chinese: string
        english: string
    }
}

export const zh: Translations = {
    // Common
    common: {
        loading: '加载中...',
        error: '发生错误',
        retry: '重试',
        cancel: '取消',
        confirm: '确认',
        save: '保存',
        delete: '删除',
        back: '返回',
        next: '下一步',
        previous: '上一步',
        complete: '完成',
        restart: '重新开始',
        created: '创建时间',
        deleteCourse: '删除课程',
    },

    // App
    app: {
        title: 'Dolphin English',
        subtitle: '通过真实文章学习英语',
    },

    // Homepage
    home: {
        myCourses: '我的课程',
        newCourse: '新建课程',
        noCourses: '还没有课程',
        noCoursesDesc: '创建你的第一个课程开始学习',
        lastStudied: '上次学习',
        progress: '进度',
        difficulty: '难度',
    },

    // Create Course
    create: {
        title: '创建新课程',
        textTab: '粘贴文字',
        imageTab: '上传图片',
        textPlaceholder: '在此粘贴英文文章（建议350-600词）...',
        imageDropzone: '拖拽图片到此处，或点击选择',
        analyzing: '正在分析文章...',
        wordCount: '词数',
        recommended: '推荐范围：350-600词',
        tooShort: '文章太短，建议至少350词',
        tooLong: '文章较长，建议不超过600词',
        startLearning: '开始学习',
    },

    // Course Learning
    course: {
        module: '模块',
        totalTime: '预计时长',
        minutes: '分钟',
    },

    // Module Names
    modules: {
        objectives: '学习目标',
        listening: '整体听读',
        analysis: '分段精讲',
        vocabulary: '词汇学习',
        quiz: '理解检测',
        reproduction: '内容复现',
    },

    // Module 1: Objectives
    objectives: {
        title: '本课学习目标',
        afterLearning: '完成本课后，你将能够：',
    },

    // Module 2: Listening
    listening: {
        title: '听读全文',
        playAll: '播放全文',
        pause: '暂停',
        resume: '继续',
        speed: '语速',
        slow: '慢速',
        normal: '正常',
        fast: '快速',
    },

    // Module 3: Analysis
    analysis: {
        title: '分段精讲',
        paragraph: '段落',
        summary: '本段要点',
        languagePoints: '语言点',
        practice: '跟读练习',
        listenAgain: '再听一次',
    },

    // Module 4: Vocabulary
    vocabulary: {
        title: '词汇学习',
        essential: '必须理解',
        transferable: '可迁移使用',
        extended: '拓展了解',
        definition: '释义',
        example: '原文例句',
        playPronunciation: '播放发音',
    },

    // Module 5: Quiz
    quiz: {
        title: '理解检测',
        question: '问题',
        of: '/',
        checkAnswer: '检查答案',
        correct: '正确！',
        incorrect: '再想想',
        seeReference: '查看原文',
        score: '得分',
        passed: '通过',
        tryAgain: '再试一次',
    },

    // Module 6: Reproduction
    reproduction: {
        title: '内容复现',
        timeline: '时间线排序',
        retelling: '关键词复述',
        paraphrase: '句型改写',
        dragToSort: '拖拽排序',
        selectAnswer: '选择正确的改写',
    },

    // Settings
    settings: {
        language: '语言',
        chinese: '中文',
        english: 'English',
    },
}
