"use client"

import { useState } from "react"

export default function BackgroundTest() {
  const [showTest, setShowTest] = useState(false)

  if (process.env.NODE_ENV !== "development") return null

  return (
    <>
      <button
        onClick={() => setShowTest(!showTest)}
        className="fixed bottom-16 right-4 z-50 bg-red-500 text-white px-3 py-2 rounded text-xs"
      >
        Test BG
      </button>

      {showTest && (
        <div className="bg-debug">
          <div className="text-white text-xs p-2">Test Square</div>
        </div>
      )}
    </>
  )
}
