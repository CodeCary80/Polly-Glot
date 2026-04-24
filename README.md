# PollyGlot 🌐

An AI-powered translation app built with Next.js, TypeScript, and the Anthropic Claude API. Built as part of the Scrimba AI Engineering course.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **AI:** Anthropic Claude (`claude-haiku-4-5-20251001`)

## Features

- Translate text into 50+ languages
- Clean two-view flow: input → result
- Server-side API key handling (never exposed to the browser)
- Chatterbox *(in progress)* — multi-turn AI conversation in your target language

## Project Structure

```
app/
├── page.tsx                        # Home — controls view state (input | result)
├── components/
│   ├── OriginalSelections.tsx      # Input view (text + language selector)
│   └── TranslationOutput.tsx       # Result view (original + translated text)
├── api/
│   └── translate/
│       └── route.ts                # Server-side Anthropic API call
└── lib/
    └── translation.ts              # Languages data array (50 languages)
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

## Key Patterns

**Security** — The Anthropic API key stays server-side in `route.ts`. The frontend only calls `/api/translate` (its own Next.js route) and never touches the Anthropic API directly.

**Client vs Server Components** — `"use client"` is only added to interactive components that need `useState` or event handlers. Parent layout components remain Server Components.

**API Route** — `route.ts` replaces Express. No `app.listen()` or CORS setup needed — Next.js handles it.

## Data Flow

```
User types text + selects language
  → clicks Translate
  → onTranslate(text, language) called in Home
  → fetch POST /api/translate
  → route.ts calls Anthropic API
  → returns { translation: string }
  → view switches to TranslationOutput
```

## Roadmap

- [ ] Chatterbox — multi-turn conversation in target language (`/chatterbox`)
- [ ] Loading state while waiting for translation
- [ ] User-facing error messages
- [ ] Handle empty text submission
- [ ] UI polish

## Author

Cary Zhu — [caryzhu.com](https://caryzhu.com) | [GitHub: CodeCary80](https://github.com/CodeCary80)