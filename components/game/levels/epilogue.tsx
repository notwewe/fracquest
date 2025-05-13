"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export function Epilogue() {
  const [currentPage, setCurrentPage] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  const epiloguePages = [
    {
      text: "And so, with courage in his paws and fractions in his heart, Whiskers the Brave stood atop the cliffs of Dreadpoint Hollow. Above him, the restored Fraction Orb pulsed with radiant energy — no longer shattered, but whole once more.",
      image: "/pixel-items/fraction-orb-whole.png",
    },
    {
      text: "As its light spread across the land, Numeria began to heal. The trees of Fraction Forest straightened their branches. The scales of the Realm of Balance shimmered with harmony. Even the once-shadowed paths of Dreadpoint Hollow grew warm with morning light.",
      image: "/pixel-locations/numeria-kingdom.png",
    },
    {
      text: "Whiskers returns to the village where the journey began. The villagers — rabbits, owls, hedgehogs, and more — gather in awe and cheer.",
      image: "/pixel-locations/arithmetown.png",
    },
    {
      text: "\"You've done more than defeat the Decimal Phantom, young Whiskers. You've restored knowledge, courage, and clarity to all corners of our world.\" - King Equalis",
      image: "/pixel-characters/king-equalis.png",
    },
    {
      text: "A grand festival is held: Lanterns shaped like fractions float into the night sky. Children play games balancing equal parts of pie. Whiskers is crowned Guardian of the Fraction Orb.",
      image: "/pixel-locations/arithmetown.png",
    },
    {
      text: '"Fractions helped me see the world in parts... but they also taught me how everything fits together." - Whiskers',
      image: "/pixel-characters/whiskers.png",
    },
    {
      text: "When the world falls out of balance... remember: even the smallest piece has a place in the whole.",
      image: "/pixel-items/fraction-orb-whole.png",
      final: true,
    },
  ]

  useEffect(() => {
    if (currentPage < epiloguePages.length) {
      const timer = setTimeout(() => {
        setFadeIn(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentPage, epiloguePages.length])

  const handleNextPage = () => {
    if (currentPage < epiloguePages.length - 1) {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
      }, 500)
    }
  }

  const currentPageData = epiloguePages[currentPage]

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 bg-gradient-to-b from-indigo-900 to-black text-white">
      <div className={`transition-opacity duration-500 ${fadeIn ? "opacity-100" : "opacity-0"} text-center max-w-3xl`}>
        <div className="mb-8 relative w-64 h-64 mx-auto">
          <Image
            src={currentPageData.image || "/placeholder.svg"}
            alt="Epilogue scene"
            width={256}
            height={256}
            className="object-contain"
          />
        </div>

        <p className="text-xl mb-12 leading-relaxed">{currentPageData.text}</p>

        {currentPageData.final ? (
          <div className="mt-8">
            <h2 className="text-3xl font-bold mb-6 text-yellow-300">The End</h2>
            <div className="flex justify-center space-x-4">
              <Link href="/student/dashboard">
                <Button className="bg-purple-600 hover:bg-purple-700">Return to Dashboard</Button>
              </Link>
              <Link href="/student/map">
                <Button className="bg-blue-600 hover:bg-blue-700">View World Map</Button>
              </Link>
            </div>
          </div>
        ) : (
          <Button onClick={handleNextPage} className="bg-blue-600 hover:bg-blue-700 px-8 py-2 text-lg">
            Continue
          </Button>
        )}
      </div>
    </div>
  )
}
