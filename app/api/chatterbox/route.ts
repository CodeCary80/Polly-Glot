import Anthropic from "@anthropic-ai/sdk"
import { chatPrompt, MODEL } from "@/app/lib/prompts"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {

  try {
    const { messages, language } = await request.json()

    if(!messages || !language){return Response.json({error:"Missing messages or language"},{status:400})}

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      temperature: 1,
      system: chatPrompt(language),
      messages: messages,
    })
    const block = msg.content[0]
    if(block.type !== 'text'){ return Response.json({ error: "Unexpected response from Claude" }, { status: 500 })}
    return Response.json({ reply: block.text })
  } catch (error) {
    console.error("Anthropic error:", error)
  return Response.json({ error: "Chat failed. Please try again." }, { status: 500 })
  }
}