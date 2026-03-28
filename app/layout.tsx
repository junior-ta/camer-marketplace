import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import { Toaster } from "@/components/ui/sonner"
import SessionProvider from "@/components/SessionProvider"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Camer-Market | Authentic Flavors of Africa",
  description: "Shop authentic African products imported straight from the motherland.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster position="top-right" richColors />
        </SessionProvider>
      </body>
    </html>
  )
}