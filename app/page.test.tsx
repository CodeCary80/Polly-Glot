// @vitest-environment jsdom
import { describe, it, vi, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Home from "./page"


const fetchMock = vi.fn()

function jsonResponse(data: unknown){
    return new Response(JSON.stringify(data))
}

async function translate(text:string, language: string){
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText("How are you?"),text)
    await user.selectOptions(screen.getByRole("combobox"),language)
    await user.click(screen.getByRole("button",{name:"Translate"}))
}

describe("Home",()=>{
    beforeEach(()=>{
    localStorage.clear()
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
})
    it("renders the title",()=>{
        render(<Home />)
        expect(screen.getByRole("heading",{name:"PollyGlot"})).toBeInTheDocument()
    })

    it("translates through our API when there is no key", async()=>{
        fetchMock.mockResolvedValueOnce(jsonResponse({translation: "Hola"}))
        render(<Home />)
        await translate("Hello", "spanish")

        expect(await screen.findByDisplayValue("Hola")).toBeInTheDocument()
        expect(fetchMock).toHaveBeenCalledWith("/api/translate", expect.anything())
        expect(localStorage.getItem("usageCount")).toBe("1")
    })

    it("calls Anthropic directly with the user's key", async()=>{
        localStorage.setItem("userApiKey", "test-key")
        fetchMock.mockResolvedValueOnce(jsonResponse({ content: [{ type: "text", text: "Bonjour" }] }))

        render(<Home />)
        await translate("Hello", "french")

        expect(await screen.findByDisplayValue("Bonjour")).toBeInTheDocument()
        const[url,options] = fetchMock.mock.calls[0]
        expect(url).toBe("https://api.anthropic.com/v1/messages")
        expect(options.headers["x-api-key"]).toBe("test-key")
    })

    it("opens the key modal after 10 free uses", async()=>{
        localStorage.setItem("usageCount", "10")

        render(<Home />)
        await translate("Hello", "french")

        expect(screen.getByText("You've used your 10 free translations")).toBeInTheDocument()
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("shows an error message when the api returns an error", async()=>{
        fetchMock.mockResolvedValueOnce(jsonResponse({error: "Translation failed"}))

        render(<Home />)
        await translate("Hello", "french")

        expect(await screen.findByRole("alert")).toHaveTextContent("Translation failed. Please try again.")
        expect(screen.queryByText("You've used your 10 free translations")).toBeNull()
        expect(localStorage.getItem("usageCount")).toBeNull()
    })

    it("asks for text and a language before translating", async()=>{
        render(<Home />)
        const user = userEvent.setup()
        await user.click(screen.getByRole("button",{name:"Translate"}))

        expect(screen.getByText(/Please enter text and select a language/)).toBeInTheDocument()
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("translates into English when the dropdown is left on its default", async()=>{
        fetchMock.mockResolvedValueOnce(jsonResponse({translation: "Hello"}))

        render(<Home />)
        const user = userEvent.setup()
        await user.type(screen.getByPlaceholderText("How are you?"),"Hola")
        await user.click(screen.getByRole("button",{name:"Translate"}))

        expect(await screen.findByDisplayValue("Hello")).toBeInTheDocument()
        const body = JSON.parse(fetchMock.mock.calls[0][1].body)
        expect(body.language).toBe("english")
    })

    it("show an error message when the network fails", async()=>{
        vi.spyOn(console,"error").mockImplementation(()=>{})
        fetchMock.mockResolvedValueOnce(new TypeError("Failed to fetch"))

        render(<Home />)
        await translate("Hello","french")

        expect(await screen.findByRole("alert")).toHaveTextContent("Network error. Please check your connection")
        expect(localStorage.getItem("usageCount")).toBeNull()
    })
})


