# PollyGlot — UAT Test Plan: Translation Feature

| | |
|---|---|
| **Feature** | Text translation (home page → Translate) |
| **Version** | `main` as of 2026-10-22 |
| **Author** | Tianrui Zhu |

## 1. Scope

This plan covers the translation flow on the home page:

- Entering text and choosing a target language
- Translating through PollyGlot's server (`/api/translate`) for free users
- Translating directly with the user's own Anthropic API key
- The 10-use free tier and the API key modal
- Error handling for API errors and network failures

**Out of scope:** Chatterbox (chat mode), visual design, performance.

## 2. How translation works (summary)

| User state | Where the request goes |
|---|---|
| No API key, fewer than 10 uses | PollyGlot server → Anthropic (`POST /api/translate`) |
| No API key, 10 or more uses | No request. The API key modal opens. |
| Has own API key | Browser → Anthropic directly (`api.anthropic.com/v1/messages`) |

The usage count (`usageCount`) and the user's key (`userApiKey`) are stored in the browser's `localStorage`.

## 3. Acceptance Criteria

Written as **Given / When / Then**.

### AC-1 — Normal input
- **Given** the user has free uses left and no API key saved
- **When** they enter text, choose a language, and click **Translate**
- **Then** the result screen shows the original text and the translation, and the usage count increases by 1

### AC-2 — Empty input
- **Given** the text box is empty or contains only spaces
- **When** the user clicks **Translate**
- **Then** the warning "⚠️ Please enter text and select a language." appears, and no request is sent

### AC-3 — API error
- **Given** the translation service returns an error
- **When** the user clicks **Translate**
- **Then** the user is told the translation failed, the result screen is not shown, and no free use is consumed

### AC-4 — Network failure
- **Given** the user's device cannot reach the server (offline)
- **When** the user clicks **Translate**
- **Then** the alert "⚠️ Network error. Please check your connection." appears below the header, no free use is consumed, and the alert disappears after a later successful translation

### AC-5 — Usage limit
- **Given** the user has used 10 free translations and has no API key
- **When** the user clicks **Translate**
- **Then** the API key modal opens, and no request is sent to the server

## 4. Test Environment & Data

| Item | Value |
|---|---|
| Browser | Chrome (latest) |
| App | `npm run dev` → http://localhost:3000 |
| AI responses | **Mocked** in automated tests, so results are stable and free |
| Reset state | DevTools → Application → Local Storage → clear `usageCount` and `userApiKey` |
| Simulate offline | DevTools → Network → throttling set to **Offline** |

## 5. Test Cases

### TC-01 — Translate successfully (free user)
| | |
|---|---|
| **Covers** | AC-1 |
| **Preconditions** | No `userApiKey`; `usageCount` is empty |
| **Steps** | 1. Type `Hello` in the text box<br>2. Select **Spanish**<br>3. Click **Translate** |
| **Expected** | Result screen shows `Hello` as the original and the translation below it; request goes to `/api/translate`; `usageCount` = `1` |
| **Automated** | Vitest: `translates through our API when there is no key` |

### TC-02 — Empty input is rejected
| | |
|---|---|
| **Covers** | AC-2 |
| **Preconditions** | Home page open |
| **Steps** | 1. Leave the text box empty<br>2. Click **Translate**<br>3. Type only spaces, click **Translate** again |
| **Expected** | Both times: warning "⚠️ Please enter text and select a language." appears; no request is sent; page stays on the input screen |
| **Automated** | Vitest: `asks for text and a language before translating` |

### TC-03 — API returns an error
| | |
|---|---|
| **Covers** | AC-3 |
| **Preconditions** | No `userApiKey`; `/api/translate` responds with `{ "error": "Translation failed" }` (mocked) |
| **Steps** | 1. Type `Hello`, select **French**<br>2. Click **Translate** |
| **Expected** | User is told the translation failed; result screen not shown; `usageCount` unchanged |
| **Automated** | Vitest: `opens the key modal when the api returns an error` |
| **Note** | See Known Issue KI-1 |

### TC-04 — Network failure
| | |
|---|---|
| **Covers** | AC-4 |
| **Preconditions** | No `userApiKey`; browser set to **Offline** |
| **Steps** | 1. Type `Hello`, select **French**<br>2. Click **Translate**<br>3. Switch back online, click **Translate** again |
| **Expected** | Step 2: alert "⚠️ Network error. Please check your connection." appears; `usageCount` unchanged<br>Step 3: alert disappears and the translation is shown |
| **Automated** | Vitest: `shows an error message when the network fails` |

### TC-05 — Free usage limit reached
| | |
|---|---|
| **Covers** | AC-5 |
| **Preconditions** | `usageCount` = `10`; no `userApiKey` |
| **Steps** | 1. Type `Hello`, select **Spanish**<br>2. Click **Translate** |
| **Expected** | API key modal opens; no request is sent |
| **Automated** | Vitest: `opens the key modal after 10 free uses` |

### TC-06 — Own API key bypasses the limit
| | |
|---|---|
| **Covers** | AC-5 (and AC-1 for key users) |
| **Preconditions** | `usageCount` = `10`; modal open from TC-05 |
| **Steps** | 1. Enter an API key in the modal, click **Confirm**<br>2. Type `Hello`, select **French**, click **Translate** |
| **Expected** | Modal closes; request goes directly to `api.anthropic.com/v1/messages` with the key in the `x-api-key` header; translation is shown |
| **Automated** | Vitest: `calls Anthropic directly with the user's key` (covers step 2) |

## 6. Traceability

| AC | Test cases |
|---|---|
| AC-1 Normal input | TC-01, TC-06 |
| AC-2 Empty input | TC-02 |
| AC-3 API error | TC-03 |
| AC-4 Network failure | TC-04 |
| AC-5 Usage limit | TC-05, TC-06 |

## 7. Known Issues

| ID | Issue | Affects |
|---|---|---|
| KI-1 | On an API error, the app opens the API key modal, whose heading says "You've used your 10 free translations", even when the user has used 0. The user is not clearly told the translation failed. | AC-3, TC-03 |
| KI-2 | The 10-use limit is enforced only in the browser (`localStorage`). Clearing storage resets it, and `/api/translate` does not check it. | AC-5 |

## 8. Automation Plan

| Layer | Tool | Status |
|---|---|---|
| Unit — API routes | Vitest | ✅ 10 tests |
| Component — home page | Vitest + React Testing Library | ✅ 8 tests |
| End-to-end — real browser | Playwright | Planned: TC-01, TC-02, TC-03 |

All tests run in GitHub Actions on every pull request.