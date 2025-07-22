import type React from "react"
import type { Metadata } from "next"
import { Inter, Blaka } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

// Load Blaka font properly using next/font/google
const blaka = Blaka({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-blaka",
})

export const metadata: Metadata = {
  title: "FracQuest",
  description: "Learn fractions through adventure",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${blaka.variable} min-h-screen bg-[#f5e9d0] overflow-y-auto`}>{children}</body>
    </html>
  )
}
