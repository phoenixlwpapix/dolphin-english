// TTS utility using native Web Speech API

type TTSCallback = (event: 'start' | 'end' | 'word' | 'pause' | 'resume' | 'boundary', data?: unknown) => void

interface TTSOptions {
    rate?: number // Speech rate: 0.1 to 10, default 1
    onBoundary?: (charIndex: number, charLength: number) => void
}

class TTSController {
    private synth: SpeechSynthesis | null = null
    private currentUtterance: SpeechSynthesisUtterance | null = null
    private callback: TTSCallback | null = null
    private femaleVoice: SpeechSynthesisVoice | null = null
    private voicesLoaded = false

    private getSynth(): SpeechSynthesis | null {
        if (typeof window === 'undefined') return null
        if (!this.synth) {
            this.synth = window.speechSynthesis
        }
        return this.synth
    }

    private async loadVoices(): Promise<void> {
        const synth = this.getSynth()
        if (!synth || this.voicesLoaded) return

        return new Promise((resolve) => {
            const loadVoicesInternal = () => {
                const voices = synth.getVoices()
                if (voices.length > 0) {
                    // Prefer English female voices
                    const femaleVoices = voices.filter(voice =>
                        voice.lang.startsWith('en') &&
                        (voice.name.toLowerCase().includes('female') ||
                            voice.name.toLowerCase().includes('samantha') ||
                            voice.name.toLowerCase().includes('karen') ||
                            voice.name.toLowerCase().includes('victoria') ||
                            voice.name.toLowerCase().includes('zira') ||
                            voice.name.toLowerCase().includes('hazel') ||
                            voice.name.toLowerCase().includes('susan') ||
                            voice.name.toLowerCase().includes('kate') ||
                            voice.name.toLowerCase().includes('google us english') ||
                            voice.name.toLowerCase().includes('microsoft zira'))
                    )

                    // Use the first female voice found, or fallback to any English voice
                    this.femaleVoice = femaleVoices[0] ||
                        voices.find(v => v.lang.startsWith('en-US')) ||
                        voices.find(v => v.lang.startsWith('en')) ||
                        voices[0]

                    this.voicesLoaded = true
                    resolve()
                }
            }

            // Voices might already be loaded
            if (synth.getVoices().length > 0) {
                loadVoicesInternal()
            } else {
                // Wait for voices to load
                synth.onvoiceschanged = loadVoicesInternal
                // Fallback timeout
                setTimeout(() => {
                    if (!this.voicesLoaded) {
                        loadVoicesInternal()
                    }
                }, 1000)
            }
        })
    }

    speak(text: string, options: TTSOptions = {}, callback?: TTSCallback): boolean {
        const synth = this.getSynth()
        if (!synth) return false

        // Stop any ongoing speech
        this.stop()

        this.callback = callback || null

        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(text)

        // Set rate (0.1 to 10, default 1)
        utterance.rate = options.rate ?? 1

        // Load and set female voice
        this.loadVoices().then(() => {
            if (this.femaleVoice) {
                utterance.voice = this.femaleVoice
            }
        })

        // Event handlers
        utterance.onstart = () => {
            this.callback?.('start')
        }

        utterance.onend = () => {
            this.currentUtterance = null
            this.callback?.('end')
        }

        utterance.onpause = () => {
            this.callback?.('pause')
        }

        utterance.onresume = () => {
            this.callback?.('resume')
        }

        utterance.onboundary = (event) => {
            this.callback?.('boundary', {
                charIndex: event.charIndex,
                charLength: event.charLength ?? 1
            })
            options.onBoundary?.(event.charIndex, event.charLength ?? 1)
        }

        utterance.onerror = (event) => {
            console.error('TTS error:', event.error)
            this.currentUtterance = null
            this.callback?.('end')
        }

        this.currentUtterance = utterance
        synth.speak(utterance)

        return true
    }

    pause(): boolean {
        const synth = this.getSynth()
        if (!synth || !this.currentUtterance) return false

        synth.pause()
        return true
    }

    resume(): boolean {
        const synth = this.getSynth()
        if (!synth) return false

        synth.resume()
        return true
    }

    stop(): boolean {
        const synth = this.getSynth()
        if (!synth) return false

        synth.cancel()
        this.currentUtterance = null
        return true
    }

    get isSpeaking(): boolean {
        const synth = this.getSynth()
        return synth?.speaking ?? false
    }

    get isPausedState(): boolean {
        const synth = this.getSynth()
        return synth?.paused ?? false
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
