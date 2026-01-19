import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

// Available voice names for Gemini TTS
// Aoede, Charon, Fenrir, Kore, Puck, etc.
const DEFAULT_VOICE = 'Kore'

export async function POST(request: NextRequest) {
    try {
        const { text, voice = DEFAULT_VOICE, rate = 1 } = await request.json()

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            )
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            )
        }

        const ai = new GoogleGenAI({ apiKey })

        // Build the prompt with rate instruction
        let prompt = text
        if (rate < 1) {
            prompt = `Say slowly and clearly: ${text}`
        } else if (rate > 1) {
            prompt = `Say quickly: ${text}`
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        })

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
        if (!audioData) {
            return NextResponse.json(
                { error: 'No audio data returned' },
                { status: 500 }
            )
        }

        // Return the base64 audio data
        return NextResponse.json({ audio: audioData })
    } catch (error) {
        console.error('TTS API error:', error)
        return NextResponse.json(
            { error: 'Failed to generate audio' },
            { status: 500 }
        )
    }
}
