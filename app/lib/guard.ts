import { languages } from "@/app/lib/translatetion"

// Limits for the server routes that spend our own Anthropic key.
export const MAX_TEXT_LENGTH = 2000
export const MAX_MESSAGE_LENGTH = 2000
export const MAX_HISTORY = 20
export const RATE_LIMIT = 10
export const RATE_WINDOW_MS = 60_000

const languageIds = new Set(languages.map(l => l.id))

export function isKnownLanguage(language: unknown): language is string {
  return typeof language === "string" && languageIds.has(language)
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 })
}

// ---- Rate limiting -------------------------------------------------------
// Best effort: counts live in this server instance's memory, so they reset
// when Netlify starts a fresh instance. It still stops a script hammering a
// warm instance. The real cap is the spend limit on the API key.

const hits = new Map<string, number[]>()

function clientIp(request: Request) {
  return (
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  )
}

/** Returns a 429 response if this IP is over the limit, otherwise null. */
export function rateLimit(request: Request, now = Date.now()) {
  const ip = clientIp(request)
  const recent = (hits.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent)
    const retryAfter = Math.ceil((recent[0] + RATE_WINDOW_MS - now) / 1000)
    return Response.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    )
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 10_000) hits.clear() // keep memory bounded
  return null
}

export function resetRateLimit() {
  hits.clear()
}

// ---- Chat history ----------------------------------------------------------

export type ChatMessage = { role: "user" | "assistant"; content: string }

/**
 * Checks the chat history sent by the browser and keeps only the last
 * MAX_HISTORY messages, so one request can't send a huge conversation.
 * Returns the trimmed list, or an error message.
 */
export function checkMessages(messages: unknown): ChatMessage[] | string {
  if (!Array.isArray(messages) || messages.length === 0) return "Missing messages"
  for (const m of messages) {
    if (
      !m ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      m.content.length === 0 ||
      m.content.length > MAX_MESSAGE_LENGTH
    ) {
      return `Each message needs a role and 1-${MAX_MESSAGE_LENGTH} characters of text`
    }
  }
  if (messages[messages.length - 1].role !== "user") return "The last message must be from the user"
  return messages
    .slice(-MAX_HISTORY)
    .map(m => ({ role: m.role, content: m.content }))
}
