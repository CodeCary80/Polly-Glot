import { MODEL, TRANSLATOR_PROMPT } from "@/app/lib/prompts"
import { badRequest, isKnownLanguage, MAX_TEXT_LENGTH, rateLimit } from "@/app/lib/guard"
import Anthropic from "@anthropic-ai/sdk"


const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  const limited = rateLimit(request)
  if (limited) return limited

  try {
    const { text, language } = await request.json()

    if(!text || !language){return Response.json({error:"Missing text or language"},{status:400})}
    if(typeof text !== "string" || text.length > MAX_TEXT_LENGTH){return badRequest(`Text must be at most ${MAX_TEXT_LENGTH} characters`)}
    if(!isKnownLanguage(language)){return badRequest("Unsupported language")}

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      temperature: 1,
      system: TRANSLATOR_PROMPT,
      messages: [{ role: "user", content: `translate ${text} to ${language}`  }],
    })
    const block = msg.content[0]
    if(block.type !== 'text'){ return Response.json({ error: "Unexpected response from Claude" }, { status: 500 })}
    return Response.json({ translation: block.text })
  } catch (error) {
    console.error("Anthropic error:", error)
  return Response.json({ error: "Translation failed" }, { status: 500 })
  }
}
