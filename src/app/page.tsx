"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { formatTimeDifference } from "./utils/formatTime"

export default function CountUpTimer() {
  const [timeDifference, setTimeDifference] = useState("")
  const startDate = new Date("2025-01-22T00:00:00")

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const difference = now.getTime() - startDate.getTime()
      setTimeDifference(formatTimeDifference(difference))
    }, 1000)

    return () => clearInterval(timer)
  }, [startDate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4">
      <div className="text-center max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Days since Alex has not built his printer
        </h1>
        <div className="bg-white bg-opacity-10 p-10 rounded-2xl shadow-2xl backdrop-blur-sm mb-8">
          <div className="text-6xl font-mono font-bold text-blue-300 tabular-nums">{timeDifference}</div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
          <div className="relative w-64 h-64">
            <Image
              src="/images/printer_boxes.jpg"
              alt="Boxes"
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="rounded-lg object-cover"
            />
          </div>
          <div className="relative w-64 h-64">
            <Image
              src="/images/prusa_mk3s.jpg"
              alt="3D Printer"
              width={256}
              height={256}
              priority
              className="rounded-lg"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

