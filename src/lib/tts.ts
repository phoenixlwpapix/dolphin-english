// TTS utility using Google Gemini AI TTS API

type TTSCallback = (event: 'start' | 'end' | 'word' | 'pause' | 'resume' | 'progress', data?: unknown) => void

interface TTSOptions {
    rate?: number // Speed multiplier: < 1 slow, 1 normal, > 1 fast
    voice?: string // Voice name: Aoede, Charon, Fenrir, Kore, Puck, etc.
    onBoundary?: (charIndex: number, charLength: number) => void
}

// Audio context for decoding PCM audio
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new AudioContext({ sampleRate: 24000 })
    }
    return audioContext
}

class TTSController {
    private currentSource: AudioBufferSourceNode | null = null
    private callback: TTSCallback | null = null
    private isPaused = false
    private isCurrentlySpeaking = false
    private pausedAt = 0
    private startedAt = 0
    private currentBuffer: AudioBuffer | null = null
    private abortController: AbortController | null = null
    private progressInterval: number | null = null

    async speak(text: string, options: TTSOptions = {}, callback?: TTSCallback): Promise<boolean> {
        // Stop any ongoing speech
        this.stop()

        this.callback = callback || null

        try {
            this.abortController = new AbortController()

            // Call the TTS API
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voice: options.voice || 'Kore',
                    rate: options.rate ?? 1,
                }),
                signal: this.abortController.signal,
            })

            if (!response.ok) {
                console.error('TTS API error:', await response.text())
                return false
            }

            const { audio } = await response.json()
            if (!audio) {
                console.error('No audio data received')
                return false
            }

            // Decode base64 PCM audio
            const audioBuffer = this.base64ToArrayBuffer(audio)
            const ctx = getAudioContext()

            // Create WAV from PCM data
            const wavBuffer = this.pcmToWav(audioBuffer)
            this.currentBuffer = await ctx.decodeAudioData(wavBuffer)

            // Play the audio
            this.playBuffer(this.currentBuffer)

            return true
        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                return false
            }
            console.error('TTS error:', error)
            return false
        }
    }

    private playBuffer(buffer: AudioBuffer, offset = 0) {
        const ctx = getAudioContext()

        // Resume audio context if suspended
        if (ctx.state === 'suspended') {
            ctx.resume()
        }

        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.connect(ctx.destination)

        source.onended = () => {
            if (!this.isPaused) {
                this.stopProgressMonitor()
                this.isCurrentlySpeaking = false
                this.currentSource = null
                this.callback?.('end')
            }
        }

        this.currentSource = source
        this.isCurrentlySpeaking = true
        this.startedAt = ctx.currentTime - offset

        // Pass total duration
        this.callback?.('start', { duration: buffer.duration })

        source.start(0, offset)
        this.startProgressMonitor()
    }

    private startProgressMonitor() {
        this.stopProgressMonitor()
        const ctx = getAudioContext()

        const checkProgress = () => {
            if (!this.isCurrentlySpeaking || this.isPaused) return

            const currentTime = ctx.currentTime - this.startedAt
            this.callback?.('progress', { currentTime })

            this.progressInterval = requestAnimationFrame(checkProgress)
        }

        this.progressInterval = requestAnimationFrame(checkProgress)
    }

    private stopProgressMonitor() {
        if (this.progressInterval) {
            cancelAnimationFrame(this.progressInterval)
            this.progressInterval = null
        }
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        return bytes.buffer
    }

    private pcmToWav(pcmData: ArrayBuffer): ArrayBuffer {
        const pcmBytes = new Uint8Array(pcmData)
        const numChannels = 1
        const sampleRate = 24000
        const bitsPerSample = 16
        const bytesPerSample = bitsPerSample / 8
        const blockAlign = numChannels * bytesPerSample

        // Create WAV header
        const wavHeader = new ArrayBuffer(44)
        const view = new DataView(wavHeader)

        // "RIFF" chunk descriptor
        this.writeString(view, 0, 'RIFF')
        view.setUint32(4, 36 + pcmBytes.length, true)
        this.writeString(view, 8, 'WAVE')

        // "fmt " sub-chunk
        this.writeString(view, 12, 'fmt ')
        view.setUint32(16, 16, true) // Subchunk1Size
        view.setUint16(20, 1, true) // AudioFormat (PCM)
        view.setUint16(22, numChannels, true)
        view.setUint32(24, sampleRate, true)
        view.setUint32(28, sampleRate * blockAlign, true) // ByteRate
        view.setUint16(32, blockAlign, true)
        view.setUint16(34, bitsPerSample, true)

        // "data" sub-chunk
        this.writeString(view, 36, 'data')
        view.setUint32(40, pcmBytes.length, true)

        // Combine header and PCM data
        const wav = new Uint8Array(44 + pcmBytes.length)
        wav.set(new Uint8Array(wavHeader), 0)
        wav.set(pcmBytes, 44)

        return wav.buffer
    }

    private writeString(view: DataView, offset: number, str: string) {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i))
        }
    }

    pause(): boolean {
        if (!this.currentSource || !this.isCurrentlySpeaking) return false

        this.stopProgressMonitor()
        const ctx = getAudioContext()
        this.pausedAt = ctx.currentTime - this.startedAt
        this.currentSource.stop()
        this.currentSource = null
        this.isPaused = true
        this.isCurrentlySpeaking = false
        this.callback?.('pause')
        return true
    }

    resume(): boolean {
        if (!this.isPaused || !this.currentBuffer) return false

        this.isPaused = false
        this.playBuffer(this.currentBuffer, this.pausedAt)
        this.callback?.('resume')
        return true
    }

    stop(): boolean {
        this.stopProgressMonitor()

        // Abort any pending API request
        if (this.abortController) {
            this.abortController.abort()
            this.abortController = null
        }

        if (this.currentSource) {
            try {
                this.currentSource.stop()
            } catch {
                // Ignore errors if already stopped
            }
            this.currentSource = null
        }

        this.isCurrentlySpeaking = false
        this.isPaused = false
        this.pausedAt = 0
        this.currentBuffer = null
        return true
    }

    get isSpeaking(): boolean {
        return this.isCurrentlySpeaking
    }

    get isPausedState(): boolean {
        return this.isPaused
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
