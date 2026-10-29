import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import AnimatedBackground from "@/components/animated-background"
import GSAPProvider from "@/components/gsap-provider"
import MobileMenu from "@/components/mobile-menu"
import PageTransition from "@/components/page-transition"
import BackgroundDebug from "@/components/background-debug"
import ChatDock from "@/components/chat/chat-dock"

const inter = Inter({ subsets: ["latin"] })

// Add viewport meta tag and PWA support
export const metadata: Metadata = {
  title: "Pasit Khumsena | AI Engineer Portfolio",
  description: "AI Engineer portfolio featuring practical AI projects, backend engineering, and event notes.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#6b46c1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white min-h-screen`}>
        <GSAPProvider>
          <AnimatedBackground />
          <BackgroundDebug />
          <PageTransition />
          <div className="relative z-10">
            <Header />
            <MobileMenu variant="sidebar" />
            {children}
          </div>
          <ChatDock />
        </GSAPProvider>
      </body>
    </html>
  )
}
