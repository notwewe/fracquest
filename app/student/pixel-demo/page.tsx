"use client"

import { PixelSprite } from "@/components/game/pixel-sprite"
import { useState } from "react"

export default function PixelDemo() {
  const [selectedType, setSelectedType] = useState<"character" | "item" | "location" | "ui">("character")

  const characters = ["whiskers", "squeaks", "decimal-phantom", "king-equalis", "elder-pebble"]
  const items = ["fraction-orb", "fraction-compass", "cheese-wheel-whole", "cheese-wheel-half", "cheese-wheel-quarters"]
  const locations = ["arithmetown", "lessmoore-bridge", "fraction-forest", "dreadpoint-hollow", "realm-of-balance"]
  const uiElements = ["dialog-box", "button"]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">FracQuest Pixel Art Demo</h1>

      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${selectedType === "character" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setSelectedType("character")}
          >
            Characters
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedType === "item" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setSelectedType("item")}
          >
            Items
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedType === "location" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setSelectedType("location")}
          >
            Locations
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedType === "ui" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setSelectedType("ui")}
          >
            UI Elements
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {selectedType === "character" &&
          characters.map((character) => (
            <div key={character} className="flex flex-col items-center">
              <PixelSprite type="character" variant={character} size={96} />
              <p className="mt-2 text-center capitalize">{character}</p>
            </div>
          ))}

        {selectedType === "item" &&
          items.map((item) => (
            <div key={item} className="flex flex-col items-center">
              <PixelSprite type="item" variant={item} size={96} />
              <p className="mt-2 text-center capitalize">{item.replace(/-/g, " ")}</p>
            </div>
          ))}

        {selectedType === "location" &&
          locations.map((location) => (
            <div key={location} className="flex flex-col items-center">
              <PixelSprite type="location" variant={location} size={160} />
              <p className="mt-2 text-center capitalize">{location.replace(/-/g, " ")}</p>
            </div>
          ))}

        {selectedType === "ui" &&
          uiElements.map((ui) => (
            <div key={ui} className="flex flex-col items-center">
              <PixelSprite type="ui" variant={ui} size={ui === "dialog-box" ? 240 : 120} />
              <p className="mt-2 text-center capitalize">{ui.replace(/-/g, " ")}</p>
            </div>
          ))}
      </div>

      <div className="mt-12 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Game Scene Demo</h2>
        <div className="relative w-full h-[400px] bg-green-100 rounded-lg overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <PixelSprite
              type="location"
              variant="fraction-forest"
              size={400}
              className="w-full h-full"
              animate={false}
            />
          </div>

          {/* Characters */}
          <div className="absolute bottom-20 left-1/4 transform -translate-x-1/2">
            <PixelSprite type="character" variant="whiskers" size={80} />
          </div>
          <div className="absolute bottom-20 right-1/4 transform translate-x-1/2">
            <PixelSprite type="character" variant="squeaks" size={60} />
          </div>

          {/* Item */}
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
            <PixelSprite type="item" variant="fraction-orb" size={60} />
          </div>

          {/* Dialog */}
          <div className="absolute bottom-0 left-0 w-full p-4">
            <PixelSprite type="ui" variant="dialog-box" size={100} className="w-full h-[100px]" animate={false} />
          </div>
        </div>
      </div>
    </div>
  )
}
