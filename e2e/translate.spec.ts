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

    test("A user types text, picks Spanish and clicks Translate. The result screen shows the translation", async({page})=>{
        await page.route("**/api/translate", (route)=>{
            return route.fulfill({json:{translation:"Hola"}})
        })

        await page.goto("/")
        await page.getByPlaceholder("How are you?").fill("Hello")
        await page.getByRole("combobox").selectOption("spanish")
        await page.getByRole("button",{name: "Translate"}).click()

        await expect(page.getByText("Your translation 👇")).toBeVisible()
        await expect(page.locator("textarea").nth(1)).toHaveValue("Hola")
    })

    test("If the API returns an error, the user is told and stays on the input screen", async({page})=>{
        await page.route("**/api/translate", (route)=>{
            return route.fulfill({status:500,json:{error:"Translation failed"}})
        })

        await page.goto("/")
        await page.getByPlaceholder("How are you?").fill("Hello")
        await page.getByRole("combobox").selectOption("spanish")
        await page.getByRole("button",{name: "Translate"}).click()

        await expect(page.getByText("You've used your 10 free translations")).toBeVisible()
        await expect(page.getByPlaceholder("How are you?")).toHaveValue("Hello")
    })
})