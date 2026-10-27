# PollyGlot — Test Report: Translation Feature

| | |
|---|---|
| **Feature** | Text translation (home page → Translate) |
| **Test plan** | [UAT Test Plan](./uat-test-plan.md) |
| **Build tested** | `main` @ `3d810a0` |
| **Test date** | 2026-10-26 |
| **Author** | Tianrui Zhu |

## 1. Summary

| Result | |
|---|---|
| Automated tests | **21 / 21 passed** (18 Vitest, 3 Playwright) |
| UAT test cases | **5 passed, 1 partially automated** (6 total) |
| Defects found and fixed | **4** (including Known Issue KI-1 from the test plan) |
| Open issues | **4** (see Section 6) |
| CI | All tests run on every pull request; merging requires a green check |

**Conclusion:** The translation feature meets all five acceptance criteria (AC-1 to AC-5). The remaining open issues do not block release; KI-2 (client-side usage limit) should be addressed before any high-traffic launch.

## 2. Test Environment

| Item | Version |
|---|---|
| Node.js | 22.23.2 (local), 22.x (CI) |
| Next.js | 16.2.4 |
| Vitest | 5.0.3 |
| Playwright | 1.64.1 (Chromium) |
| CI runner | GitHub Actions, `ubuntu-latest` |
| AI responses | Mocked in all automated tests (no real API calls) |

## 3. Results by Test Layer

| Layer | Tool | File(s) | Tests | Result | Duration |
|---|---|---|---|---|---|
| Unit — API routes | Vitest | `app/api/*/route.test.ts` | 10 | ✅ 10 passed | < 0.1 s |
| Component — home page | Vitest + React Testing Library (jsdom) | `app/page.test.tsx` | 8 | ✅ 8 passed | ~0.4 s |
| End-to-end — real browser | Playwright (Chromium) | `e2e/translate.spec.ts` | 3 | ✅ 3 passed | ~5.6 s |
| **Total** | | | **21** | **✅ 21 passed** | |

### 3.1 Unit tests — API routes (10)

| Route | Test | Result |
|---|---|---|
| `/api/translate` | returns 400 when text is missing | ✅ |
| `/api/translate` | returns 400 when language is missing | ✅ |
| `/api/translate` | returns the translation on success | ✅ |
| `/api/translate` | returns 500 when Claude does not reply with text | ✅ |
| `/api/translate` | returns 500 when Anthropic throws | ✅ |
| `/api/chatterbox` | returns 400 when messages is missing | ✅ |
| `/api/chatterbox` | returns 400 when language is missing | ✅ |
| `/api/chatterbox` | returns the reply on success | ✅ |
| `/api/chatterbox` | returns 500 when Claude does not reply with text | ✅ |
| `/api/chatterbox` | returns 500 when Anthropic throws | ✅ |

### 3.2 Component tests — home page (8)

| Test | Result |
|---|---|
| renders the title | ✅ |
| translates through our API when there is no key | ✅ |
| calls Anthropic directly with the user's key | ✅ |
| opens the key modal after 10 free uses | ✅ |
| shows an error message when the api returns an error | ✅ |
| asks for text and a language before translating | ✅ |
| translates into English when the dropdown is left on its default | ✅ |
| shows an error message when the network fails | ✅ |

### 3.3 End-to-end tests (3)

| Test | Result |
|---|---|
| shows a warning when the text is empty | ✅ |
| a user translates text into Spanish and sees the result screen | ✅ |
| if the API returns an error, the user is told and stays on the input screen | ✅ |

## 4. Results by UAT Test Case

| TC | Title | Covers | Automated by | Result |
|---|---|---|---|---|
| TC-01 | Translate successfully (free user) | AC-1 | Vitest + Playwright | ✅ Pass |
| TC-02 | Empty input is rejected | AC-2 | Vitest + Playwright | ✅ Pass |
| TC-03 | API returns an error | AC-3 | Vitest + Playwright | ✅ Pass (after fix D-4) |
| TC-04 | Network failure | AC-4 | Vitest | ✅ Pass |
| TC-05 | Free usage limit reached | AC-5 | Vitest | ✅ Pass |
| TC-06 | Own API key bypasses the limit | AC-5, AC-1 | Vitest (step 2 only) | ⚠️ Partial — step 1 (entering a key in the modal) is not automated |

| Acceptance criterion | Status |
|---|---|
| AC-1 Normal input | ✅ Met |
| AC-2 Empty input | ✅ Met |
| AC-3 API error | ✅ Met (was not met before D-4 fix) |
| AC-4 Network failure | ✅ Met (was not met before D-3 fix) |
| AC-5 Usage limit | ✅ Met (client-side only, see KI-2) |

## 5. Defects Found and Fixed

Each defect was fixed test-first: a failing test was written to reproduce the bug, then the code was changed until it passed. The test now guards against regression.

| ID | Defect | How found | Fix | PR |
|---|---|---|---|---|
| D-1 | 6 lint errors, including `setState` inside `useEffect` (extra render on load) and unsafe `as any` casts | Adding lint to CI | Lazy `useState` initializers; type narrowing on API responses | #1 |
| D-2 | Dropdown shows English by default, but translating without changing it shows "Please enter text and select a language." | Reading code while writing component tests | Language state starts as the first language in the list | #6 |
| D-3 | Network failure is silent: no message, user sees nothing happen | Writing test cases for the UAT plan (AC-4) | Show alert "Network error. Please check your connection." | #7 |
| D-4 | **KI-1:** API error opens the key modal saying "You've used your 10 free translations", even at 0 uses | UAT plan review (AC-3) | Show alert "Translation failed. Please try again."; modal kept for the usage limit only | #11 |

Also caught during development, before merge:

- `next/image` runtime error ("missing required width") when an image was passed as `Logo.src` instead of the imported object — found during manual browser check (#2).
- Page title fell back to a default font after moving to `next/font` — found in code review (#3).

## 6. Open Issues

| ID | Issue | Severity | Recommendation |
|---|---|---|---|
| KI-2 | The 10-use free limit is enforced only in the browser (`localStorage`). Clearing storage resets it, and `/api/translate` does not check it, so the limit can be bypassed at the owner's API cost. | Medium | Enforce a limit on the server (e.g. per IP) |
| OI-1 | Users **with their own key**: an API error still opens the modal with the "10 free translations" heading. Likely correct intent (re-enter key), but the wording is misleading. | Low | Separate heading for "Your API key was rejected" |
| OI-2 | No automated test for a **wrong user API key**, or for TC-06 step 1 (entering a key in the modal). | Low | Add Vitest + Playwright tests |
| OI-3 | Chatterbox (chat mode) has no component or end-to-end tests. | Low (out of scope) | Separate test cycle |

## 7. Lessons from Building the Test Suite

| Problem | Cause | Resolution |
|---|---|---|
| Vitest could not resolve `@/app/...` imports | Vitest does not read `tsconfig.json` paths by default | `resolve.tsconfigPaths: true` in `vitest.config.mts` |
| A test failed although the route handled the error | Vitest 5: persistent `mockRejectedValue` combined with `mockReset()` | Use `mockResolvedValueOnce` / `mockRejectedValueOnce` |
| Vitest tried to run the Playwright file | Both tools match `*.spec.ts` | Exclude `e2e/**` in Vitest config |
| `getByRole("alert")` found 2 elements in Playwright | Next.js adds a hidden route announcer with `role="alert"` (not present in jsdom) | Find the message by text in e2e tests |

## 8. CI Integration

**Workflow:** `.github/workflows/ci.yml`, runs on every pull request and every push to `main`.

| Step | Typical duration |
|---|---|
| Install dependencies (`npm ci`) | ~15 s |
| Lint (`--max-warnings=0`) | ~3 s |
| Unit + component tests (`npm test`) | ~2 s |
| Production build | ~8 s |
| Install Chromium (`playwright install --with-deps`) | ~25 s (one run took 8 min due to slow package mirrors) |
| End-to-end tests (`npm run test:e2e`) | ~6 s |
| **Total** | **~1–1.5 min** |

**Safeguards:**
- Branch protection on `main`: changes only through pull requests, and the `check` job must pass.
- Lint warnings fail the build (`--max-warnings=0`).
- Job timeout of 20 minutes (`timeout-minutes: 20`) stops stuck runs.