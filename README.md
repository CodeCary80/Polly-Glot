# PollyGlot 🌐

An AI-powered translation and conversation app built with Next.js, TypeScript, and the Anthropic Claude API. Built as part of the Scrimba AI Engineering course.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **AI:** Anthropic Claude (`claude-haiku-4-5-20251001`)
- **Extras:** `marked` (Markdown rendering), `@lottiefiles/dotlottie-react` (typing indicator)

## Features

- Translate text into 50+ languages
- **Chatterbox** — multi-turn AI conversation partner in your target language
- Grammar correction feedback in Chatterbox responses
- Markdown rendering for rich AI replies
- Lottie animation typing indicator while waiting for responses
- Chat history and language preference persisted via `localStorage`
- **10 free uses** (translation + chat combined) — then users supply their own Anthropic API key
- User API key stored in `localStorage` only — never sent to the server
- Error handling across all API routes and components

## Project Structure

```
app/
├── page.tsx                        # Home — controls view state (input | result | chat)
├── components/
│   ├── OriginalSelections.tsx      # Input view (text + language selector)
│   ├── TranslationOutput.tsx       # Result view (original + translated text)
│   ├── ChatterBox.tsx              # Multi-turn chat view
│   └── ApiKeyModal.tsx             # Modal shown after 10 free uses
├── api/
│   ├── translate/
│   │   └── route.ts                # Server-side translation API call
│   └── chatterbox/
│       └── route.ts                # Server-side chat API call (multi-turn)
├── lib/
│   └── translation.ts              # Languages data array (50 languages)
└── types/
    └── index.ts                    # Shared TypeScript types
```

## Getting Started

```bash
# Install dependencies
npm install

# Add your Anthropic API key
# Create .env.local in the project root:
ANTHROPIC_API_KEY=your_key_here

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Key & Free Tier

PollyGlot gives every visitor **10 free uses** (translations + chat messages combined). After that, a modal prompts the user to enter their own Anthropic API key.

**How the user key is handled:**
- Stored in the browser's `localStorage` only
- Used to call `api.anthropic.com` **directly from the browser** — it never touches this server
- Can be revoked anytime at [console.anthropic.com](https://console.anthropic.com)
- Don't have a key? [Create a free Anthropic account →](https://console.anthropic.com)

## Data Flow

**Free tier (< 10 uses)**
```
User input → fetch /api/translate or /api/chatterbox → route.ts → Anthropic API (server key)
```

**After 10 uses (user key)**
```
User input → fetch api.anthropic.com directly from browser (user's key, never hits server)
```

## Key Patterns

**Dual API path** — Free uses go through Next.js server routes (your key stays safe). After the free tier, requests go directly from the browser to Anthropic using the user's own key via the `anthropic-dangerous-direct-browser-access` header.

**View state machine** — `page.tsx` controls a single `view` state (`"input" | "result" | "chat"`), swapping components rather than navigating pages.

**localStorage persistence** — Chat messages and selected language survive page refreshes. Usage count and user API key also persist across sessions.

**Markdown in chat** — Chatterbox responses are rendered with `marked` inside `dangerouslySetInnerHTML`, styled with Tailwind Typography (`prose prose-invert`).

## Author

Cary Zhu — [caryzhu.com](https://caryzhu.com) | [GitHub: CodeCary80](https://github.com/CodeCary80)