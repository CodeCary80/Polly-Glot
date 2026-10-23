import { test, expect } from "@playwright/test"

test.describe("Translation",()=>{
    test("show a warning when the text is empty", async({page})=>{
        let requests = 0
        await page.route("**/api/translate", (route)=>{
            requests++
            return route.fulfill({json:{translation:"should not happen"}})
        })

        await page.goto("/")
        await page.getByRole("button",{name: "Translate"}).click()

        await expect(page.getByText("Please enter text and select a language")).toBeVisible()
        expect(requests).toBe(0)
    })
})