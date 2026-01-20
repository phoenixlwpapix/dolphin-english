import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const imageFile = formData.get('image') as File | null

        if (!imageFile) {
            return Response.json({ error: 'No image provided' }, { status: 400 })
        }

        // Convert file to base64
        const bytes = await imageFile.arrayBuffer()
        const base64 = Buffer.from(bytes).toString('base64')
        const mimeType = imageFile.type || 'image/png'

        // Use Gemini's vision capability to extract text
        const { text } = await generateText({
            model: google('gemini-3-flash-preview'),
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            image: `data:${mimeType};base64,${base64}`,
                        },
                        {
                            type: 'text',
                            text: `Extract the main English article text from this image.

CRITICAL RULES:
- Output ONLY the extracted text as plain text
- Do NOT use any Markdown formatting (no **, ##, *, _, etc.)
- Do NOT add bold markers, headers, or any special symbols
- Preserve the original paragraph structure
- Ignore any handwritten notes, scribbles, margin comments, or non-article text
- Focus only on the printed article content
- If there is no English text in the image, respond with "NO_TEXT_FOUND"
- Do not add any commentary, headers, or explanations`,
                        },
                    ],
                },
            ],
        })

        if (!text || text === 'NO_TEXT_FOUND') {
            return Response.json({ error: 'No text found in image' }, { status: 400 })
        }

        return Response.json({ text: text.trim() })
    } catch (error) {
        console.error('OCR error:', error)
        return Response.json(
            { error: error instanceof Error ? error.message : 'OCR failed' },
            { status: 500 }
        )
    }
}
