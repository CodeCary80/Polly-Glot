import "./globals.css";
import { ReactNode } from "react"
import { Poppins, Big_Shoulders } from "next/font/google"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-big-shoulders",
})

export default function RootLayout({ children }:{ children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${bigShoulders.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}