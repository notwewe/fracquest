import React from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const credits = [
  "",
  "",
  "FracQuest",
  "",
  "",
  "A Student Project",
  "Cebu Institute of Technology - University",
  "",
  "",
  "Team Members",
  "Francis Wedemeyer N. Dayagro",
  "Moriel Edgar Deandre A. Bien",
  "Felicity V. Orate",
  "Zedric Marc D. Tabinas",
  "",
  "",
  "Special Thanks",
  "To our mentors, instructors, and classmates",
  "for their guidance and support.",
  "",
  "",
  "FracQuest is a student project created as part of our coursework at CIT-U.",
  "Thank you for playing and supporting our journey in educational game development!",
  "",
  "",
  "All Rights Reserved",
  "",
  "The End",
  "",
  "",
]

export default function CreditsScroll() {
  const router = useRouter()
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-pixel text-center text-yellow-200 py-8 animate-credits-scroll"
          style={{
            animation: "credits-scroll 40s linear",
            animationFillMode: "forwards",
            fontSize: "1.4rem",
            width: "100%",
            maxWidth: 600,
            lineHeight: 2.2,
          }}
        >
          {credits.map((line, idx) => (
            <div
              key={idx}
              className={
                line === "FracQuest"
                  ? "text-4xl font-bold mb-8 mt-8"
                  : line === "Team Members" || line === "Special Thanks" || line === "A Student Project" || line === "Cebu Institute of Technology - University"
                  ? "text-2xl font-bold mt-8 mb-4"
                  : line === "The End"
                  ? "text-3xl font-bold mt-12 mb-8"
                  : "mb-2"
              }
            >
              {line}
            </div>
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes credits-scroll {
          0% {
            transform: translateY(100vh);
          }
          100% {
            transform: translateY(-120vh);
          }
        }
      `}</style>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <Button
          onClick={() => router.push("/student/game")}
          className="font-pixel bg-amber-600 text-white text-xl px-10 py-4 mt-4 border-none shadow-lg hover:bg-yellow-400 hover:text-black transition-colors duration-200"
        >
          Return to Game
        </Button>
      </div>
    </div>
  )
} 