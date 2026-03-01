"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { formatTimeDifference } from "./utils/formatTime"

const ScrollAnimation = dynamic(
  () => import("../components/ScrollAnimation").then((m) => m.ScrollAnimation),
  { ssr: false }
)

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

export default function CountUpTimer() {
  const [timeDifference, setTimeDifference] = useState("")

  const evidence = useInView()
  const footer = useInView()

  useEffect(() => {
    const startDate = new Date("2025-01-22T00:00:00")
    const timer = setInterval(() => {
      const now = new Date()
      const difference = now.getTime() - startDate.getTime()
      setTimeDifference(formatTimeDifference(difference))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <main className="bg-gradient-to-b from-gray-950 via-gray-900 to-black min-w-0" style={{ overflowClipMargin: 'content-box', overflowX: 'clip' }}>
      {/* ── Section 1: Hero ── */}
      <section className="min-h-screen flex flex-col items-center justify-center text-white px-4 py-16 relative">
        <div className="text-center max-w-3xl w-full animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-glow leading-tight">
            Days Since Alex Has Not Built His Printer
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl mb-10 italic">
            At this rate, the printer will be vintage before it&apos;s assembled
          </p>

          <div className="bg-white/[0.06] p-8 sm:p-12 rounded-3xl shadow-2xl backdrop-blur-md border border-white/[0.08] mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-purple-500/[0.05] pointer-events-none" />
            <div className="text-[clamp(1.75rem,5vw,4.5rem)] font-mono font-bold text-blue-300 tabular-nums text-glow-subtle relative z-10 whitespace-nowrap">
              {timeDifference}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-sm tracking-wider uppercase">Scroll to witness the dream</span>
          <svg
            className="w-5 h-5 animate-bounce-slow"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ── Section 2: The Evidence ── */}
      <section className="py-24 sm:py-32 px-4">
        <div
          ref={evidence.ref}
          className={`max-w-5xl mx-auto transition-all duration-1000 ${
            evidence.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-16">
            The Evidence
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-16">
            {/* Exhibit A */}
            <div className="group">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl shadow-black/40">
                <Image
                  src="/images/printer_boxes.jpg"
                  alt="Boxes containing the unbuilt 3D printer"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="text-gray-400 text-sm sm:text-base mt-4 italic text-center">
                Exhibit A: The boxes. Collecting dust since January 2025.
              </p>
            </div>

            {/* Exhibit B */}
            <div className="group">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl shadow-black/40">
                <Image
                  src="/images/prusa_mk3s.jpg"
                  alt="What the assembled Prusa MK3S looks like"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-contain bg-white/5 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="text-gray-400 text-sm sm:text-base mt-4 italic text-center">
                Exhibit B: What it&apos;s supposed to look like. One day. Maybe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Cinematic Scroll Animation ── */}
      <ScrollAnimation />

      {/* ── Section 4: Footer / CTA ── */}
      <section className="py-24 sm:py-32 px-4">
        <div
          ref={footer.ref}
          className={`max-w-2xl mx-auto text-center transition-all duration-1000 delay-200 ${
            footer.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-2xl sm:text-3xl font-light text-gray-300 leading-relaxed mb-6">
            The printer believes in you, Alex.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Even from inside the box.
            </span>
          </p>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mx-auto" />
        </div>
      </section>
    </main>
  )
}
