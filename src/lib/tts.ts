// TTS utility using Web Speech API

type TTSCallback = (event: 'start' | 'end' | 'word' | 'pause' | 'resume', data?: unknown) => void

interface TTSOptions {
    rate?: number // 0.1 to 10, default 1
    pitch?: number // 0 to 2, default 1
    volume?: number // 0 to 1, default 1
    lang?: string // default 'en-US'
    onBoundary?: (charIndex: number, charLength: number) => void
}

class TTSController {
    private synth: SpeechSynthesis | null = null
    private utterance: SpeechSynthesisUtterance | null = null
    private callback: TTSCallback | null = null
    private isPaused = false

    constructor() {
        if (typeof window !== 'undefined') {
            this.synth = window.speechSynthesis
        }
    }

    speak(text: string, options: TTSOptions = {}, callback?: TTSCallback): boolean {
        if (!this.synth) return false

        // Cancel any ongoing speech
        this.stop()

        this.callback = callback || null
        this.utterance = new SpeechSynthesisUtterance(text)

        // Configure options
        this.utterance.rate = options.rate ?? 1
        this.utterance.pitch = options.pitch ?? 1
        this.utterance.volume = options.volume ?? 1
        this.utterance.lang = options.lang ?? 'en-US'

        // Get English voice if available
        const voices = this.synth.getVoices()
        const englishVoice = voices.find(v => v.lang.startsWith('en'))
        if (englishVoice) {
            this.utterance.voice = englishVoice
        }

        // Event handlers
        this.utterance.onstart = () => {
            this.callback?.('start')
        }

        this.utterance.onend = () => {
            this.callback?.('end')
            this.utterance = null
        }

        this.utterance.onpause = () => {
            this.callback?.('pause')
        }

        this.utterance.onresume = () => {
            this.callback?.('resume')
        }

        this.utterance.onboundary = (event) => {
            if (event.name === 'word' && options.onBoundary) {
                options.onBoundary(event.charIndex, event.charLength ?? 0)
            }
            this.callback?.('word', { charIndex: event.charIndex, charLength: event.charLength })
        }

        this.synth.speak(this.utterance)
        this.isPaused = false
        return true
    }

    pause(): boolean {
        if (!this.synth) return false
        this.synth.pause()
        this.isPaused = true
        return true
    }

    resume(): boolean {
        if (!this.synth) return false
        this.synth.resume()
        this.isPaused = false
        return true
    }

    stop(): boolean {
        if (!this.synth) return false
        this.synth.cancel()
        this.utterance = null
        this.isPaused = false
        return true
    }

    get isSpeaking(): boolean {
        return this.synth?.speaking ?? false
    }

    get isPausedState(): boolean {
        return this.isPaused
    }

    // Get available voices
    getVoices(): SpeechSynthesisVoice[] {
        return this.synth?.getVoices() ?? []
    }

    // Preload voices (needed for some browsers)
    async preloadVoices(): Promise<SpeechSynthesisVoice[]> {
        return new Promise((resolve) => {
            if (!this.synth) {
                resolve([])
                return
            }

            const voices = this.synth.getVoices()
            if (voices.length > 0) {
                resolve(voices)
                return
            }

            this.synth.onvoiceschanged = () => {
                resolve(this.synth?.getVoices() ?? [])
            }
        })
    }
}

// Singleton instance
export const tts = new TTSController()

// Speed presets
export const TTS_SPEEDS = {
    slow: 0.75,
    normal: 1,
    fast: 1.25,
} as const

export type TTSSpeed = keyof typeof TTS_SPEEDS
