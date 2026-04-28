import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { text, language } = await request.json()

    if(!text || !language){return Response.json({error:"Missing text or language"},{status:400})}

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      temperature: 1,
      system: `
                You are a professional translator. Your task is to translate all input content into the language specified by the user. 

                Follow these strict rules:
                1. Accuracy: Maintain the original meaning, tone, and technical terminology.
                2. Formatting: Preserve all original Markdown formatting (headings, lists, bold text, etc.) in the translated output.
                3. No Conversational Filler: Do not respond with "Here is your translation" or "Sure, I can help." Output only the translated text.
                4. Context Preservation: If the input contains code snippets or variables, do not translate the code—only the comments or strings if applicable.
            `,
      messages: [{ role: "user", content: `trasnlate ${text} to ${language}`  }],
    })
      return Response.json({ translation: (msg.content[0] as any).text })
  } catch (error) {
    console.error("Anthropic error:", error)
  return Response.json({ error: "Translation failed" }, { status: 500 })
  }
}