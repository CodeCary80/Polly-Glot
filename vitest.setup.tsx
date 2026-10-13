import "@testing-library/jest-dom/vitest"
import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

afterEach(() => {
  cleanup()
})

type ImageProps = {
    src: string | {src:string}
    alt: string
    className?: string
}

vi.mock("next/image",()=>({
    default:({src,alt,className}: ImageProps)=>{
        const url = typeof src === "string" ? src: src.src
                // eslint-disable-next-line @next/next/no-img-element
        return <img src={url} alt={alt} className={className} />
    },
}))