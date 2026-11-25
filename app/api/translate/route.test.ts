import { describe,it,expect,vi,beforeEach } from "vitest"

const {mockCreate} = vi.hoisted(()=>({mockCreate:vi.fn()}))

vi.mock("@anthropic-ai/sdk",()=>({
    default:class{
        messages = {create: mockCreate}
    }
}))

import { POST } from "./route"
import { resetRateLimit, RATE_LIMIT } from "@/app/lib/guard"

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/translate", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

describe('POST /api/translate',()=>{
    beforeEach(()=>{
        mockCreate.mockReset()
        resetRateLimit()
    })

    it("returns 400 when text is missing", async()=>{
        const res = await POST(makeRequest({language:"frech"}))
        expect(res.status).toBe(400)
        expect(mockCreate).not.toHaveBeenCalled()
    })

    it("returns 400 when language is missing", async()=>{
        const res = await POST(makeRequest({text:"hello"}))
        expect(res.status).toBe(400)
        expect(mockCreate).not.toHaveBeenCalled()
    })

    it("returns the translation on success", async () => {
    mockCreate.mockResolvedValueOnce({ content: [{ type: "text", text: "Hola" }] })

    const res = await POST(makeRequest({ text: "hello", language: "spanish" }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ translation: "Hola" })
  })

  it("returns 500 when Claude does not reply with text", async () => {
    mockCreate.mockResolvedValueOnce({ content: [{ type: "tool_use"}] })

    const res = await POST(makeRequest({ text: "hello", language: "spanish" }))

    expect(res.status).toBe(500)
  })
  
  it("returns 500 when Anthropic throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    mockCreate.mockRejectedValueOnce(new Error("boom"))

    const res = await POST(makeRequest({ text: "hello", language: "spanish" }))

    expect(res.status).toBe(500)
  })

  it("returns 400 for a language that is not in the list", async () => {
    const res = await POST(makeRequest({ text: "hello", language: "klingon" }))
    expect(res.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("returns 400 when text is too long", async () => {
    const res = await POST(makeRequest({ text: "a".repeat(2001), language: "spanish" }))
    expect(res.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("returns 429 after too many requests from one IP", async () => {
    mockCreate.mockResolvedValue({ content: [{ type: "text", text: "Hola" }] })
    for (let i = 0; i < RATE_LIMIT; i++) {
      expect((await POST(makeRequest({ text: "hello", language: "spanish" }))).status).toBe(200)
    }
    const res = await POST(makeRequest({ text: "hello", language: "spanish" }))
    expect(res.status).toBe(429)
    expect(res.headers.get("Retry-After")).toBeTruthy()
    expect(mockCreate).toHaveBeenCalledTimes(RATE_LIMIT)
  })
})
