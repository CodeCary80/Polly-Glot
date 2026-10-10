import { describe,it,expect,vi,beforeEach } from "vitest"

const {mockCreate} = vi.hoisted(()=>({mockCreate:vi.fn()}))

vi.mock("@anthropic-ai/sdk",()=>({
    default:class{
        messages = {create: mockCreate}
    }
}))

import { POST } from "./route"

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/translate", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

describe('POST /api/translate',()=>{
    beforeEach(()=>{
        mockCreate.mockReset()
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
})