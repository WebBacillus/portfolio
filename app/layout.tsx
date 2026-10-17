import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import AnimatedBackground from "@/components/animated-background"
import GSAPProvider from "@/components/gsap-provider"
import MobileMenu from "@/components/mobile-menu"
import PageTransition from "@/components/page-transition"
import BackgroundDebug from "@/components/background-debug"

const inter = Inter({ subsets: ["latin"] })

// Add viewport meta tag and PWA support
export const metadata: Metadata = {
  title: "Webbacillus-Portfolio",
  description: "Webbacillus-Portfolio",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover",
  themeColor: "#6b46c1",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
    generator: 'v0.app'
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
        </GSAPProvider>
      </body>
    </html>
  )
}
