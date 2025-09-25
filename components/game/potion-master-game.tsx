"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface Fraction {
  numerator: number
  denominator: number
}

interface Recipe {
  ingredient1: Fraction
  ingredient2: Fraction
}

interface DragItem {
  fraction: Fraction
  type: 'ladle'
}

const LADLE_FRACTIONS: Fraction[] = [
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 3 },
  { numerator: 1, denominator: 4 },
  { numerator: 1, denominator: 6 },
  { numerator: 1, denominator: 8 },
  { numerator: 2, denominator: 3 },
  { numerator: 3, denominator: 4 },
  { numerator: 5, denominator: 6 }
]

export function PotionMasterGame() {
  const [recipe, setRecipe] = useState({ 
    ingredient1: { numerator: 5, denominator: 6 }, 
    ingredient2: { numerator: 3, denominator: 4 } 
  })
  const [cauldronContents, setCauldronContents] = useState<{ ingredient: string, fraction: Fraction }[]>([])
  const [gameStatus, setGameStatus] = useState<"playing" | "success" | "error">("playing")
  const [score, setScore] = useState(0)
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)

  const generateNewRecipe = () => {
    const randomFraction1 = LADLE_FRACTIONS[Math.floor(Math.random() * LADLE_FRACTIONS.length)]
    const randomFraction2 = LADLE_FRACTIONS[Math.floor(Math.random() * LADLE_FRACTIONS.length)]
    setRecipe({ ingredient1: randomFraction1, ingredient2: randomFraction2 })
    setCauldronContents([])
    setGameStatus("playing")
  }

  const checkRecipe = () => {
    if (cauldronContents.length !== 2) return

    const hasCorrectIngredients = cauldronContents.some(content => 
      content.ingredient === "purple" && 
      content.fraction.numerator === recipe.ingredient1.numerator && 
      content.fraction.denominator === recipe.ingredient1.denominator
    ) && cauldronContents.some(content => 
      content.ingredient === "green" && 
      content.fraction.numerator === recipe.ingredient2.numerator && 
      content.fraction.denominator === recipe.ingredient2.denominator
    )

    if (hasCorrectIngredients) {
      setGameStatus("success")
      setScore(prev => prev + 10)
    } else {
      setGameStatus("error")
    }
  }

  useEffect(() => {
    checkRecipe()
  }, [cauldronContents, recipe])

  const handleDragStart = (e: React.DragEvent, fraction: Fraction) => {
    setDraggedItem({ fraction, type: 'ladle' })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, ingredientType: string) => {
    e.preventDefault()
    if (draggedItem && cauldronContents.length < 2) {
      setCauldronContents(prev => [...prev, { ingredient: ingredientType, fraction: draggedItem.fraction }])
    }
    setDraggedItem(null)
  }

  const resetGame = () => {
    setCauldronContents([])
    setGameStatus("playing")
    setDraggedItem(null)
  }

  const fractionToString = (fraction: Fraction) => `${fraction.numerator}/${fraction.denominator}`

  return (
    <div className="w-full p-4">
      {/* Content Container */}
      <div>
        {/* Header with Score */}
        <div className="text-center mb-6 relative">
          <div className="bg-black/50 backdrop-blur-md border border-purple-500/30 rounded-lg p-4 inline-block">
            <h2 className="text-2xl font-bold text-white mb-2">🧪 Potion Master</h2>
            <p className="text-purple-200 mb-2">Drag & Drop Fraction Game</p>
            <div className="text-yellow-400 font-bold">Score: {score}</div>
          </div>
          
          {/* Top Left Back Button */}
          <div className="absolute top-0 left-0">
            <a
              href="/student/dashboard"
              className="w-10 h-10 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white font-bold transition-colors shadow-lg"
            >
              ← 
            </a>
          </div>

          {/* Top Right Buttons */}
          <div className="absolute top-0 right-0 flex gap-2">
            {/* Reset Button */}
            <button
              type="button"
              onClick={resetGame}
              className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white font-bold transition-colors shadow-lg"
            >
              ↻
            </button>
            
            {/* New Recipe Button */}
            <button
              type="button"
              onClick={generateNewRecipe}
              className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white font-bold transition-colors shadow-lg"
            >
              📜
            </button>
            
            {/* Help Button */}
            <button
              type="button"
              onClick={() => setShowInstructions(true)}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white font-bold transition-colors shadow-lg"
            >
              ?
            </button>
          </div>
        </div>

      {/* Main Game Area */}
      <div className="flex flex-col items-center space-y-8">
        
        {/* Top Section - Placeholder for moved ladles */}

        {/* Middle Section - Horizontal Layout with Ladles, Cauldron, and Recipe */}
        <div className="flex items-center justify-center gap-8">
          {/* Magic Ladles - Left side of cauldron */}
          <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-lg p-4 w-fit">
            <h3 className="text-lg font-bold text-white mb-3 text-center">🥄 Magic Ladles</h3>
            <div className="grid grid-cols-2 gap-2">
              {LADLE_FRACTIONS.map((fraction, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, fraction)}
                  className="relative cursor-grab active:cursor-grabbing transition-all transform hover:scale-105 shadow-lg hover:shadow-xl w-12 h-12"
                >
                  <Image
                    src="/potion-assets/ladle.png"
                    alt="Magic Ladle"
                    width={20}
                    height={20}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white font-bold text-xs drop-shadow-lg">
                      {fractionToString(fraction)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cauldron */}
          <div className="flex flex-col items-center">
            <div className="relative w-80 h-80">
              <Image
                src="/potion-assets/cauldron.png"
                alt="Magic Cauldron"
                width={320}
                height={320}
                className="w-full h-full object-contain"
              />
              {/* Cauldron Contents */}
              <div className="absolute inset-10 flex items-center justify-center">
                <div className="text-center text-white text-lg drop-shadow-lg">
                  {cauldronContents.length === 0 && "Empty Cauldron"}
                  {cauldronContents.map((content, index) => (
                    <div key={index} className="mb-3 bg-black/50 rounded px-4 py-3">
                      {fractionToString(content.fraction)} {content.ingredient === 'purple' ? '🟣' : content.ingredient === 'green' ? '🟢' : '�'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Fire */}
            <div className="mt-4 text-orange-500 text-4xl animate-pulse">🔥🔥🔥</div>
          </div>

          {/* Recipe Scroll - Right side of cauldron */}
          <div className="bg-gradient-to-br from-yellow-100 to-amber-100 border-4 border-amber-600 rounded-lg p-6 shadow-lg transform rotate-1 w-64">
            <div className="text-center">
              <h3 className="text-amber-800 font-bold text-xl mb-4">📜 Recipe Scroll</h3>
              <div className="space-y-2">
                <p className="text-amber-700 font-semibold">Strength Potion Recipe:</p>
                <p className="text-purple-600 font-bold">
                  • {fractionToString(recipe.ingredient1)} of Purple Power 🟣
                </p>
                <p className="text-green-600 font-bold">
                  • {fractionToString(recipe.ingredient2)} of Emerald Mist 🟢
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Ingredient Bowls */}
        <div className="flex justify-center gap-6">

          {/* Mystic Water Bowl (not used in current recipe) */}
          <div className="bg-black/40 backdrop-blur-md border-4 border-cyan-600 rounded-lg p-4 text-center shadow-lg w-24">
            <Image
              src="/potion-assets/blue_potion.png"
              alt="Mystic Water"
              width={50}
              height={65}
              className="mx-auto mb-2"
            />
            <div className="text-cyan-100 font-bold text-xs">Mystic Water</div>
            <div className="text-cyan-200 text-xs">(Not needed)</div>
          </div>

          {/* Emerald Mist Bowl */}
          <div 
            className="bg-black/40 backdrop-blur-md border-4 border-green-600 rounded-lg p-4 text-center shadow-lg w-24
                     hover:bg-black/60 transition-all cursor-pointer transform hover:scale-105
                     border-dashed border-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'green')}
          >
            <Image
              src="/potion-assets/green_potion.png"
              alt="Emerald Mist"
              width={50}
              height={65}
              className="mx-auto mb-2"
            />
            <div className="text-green-100 font-bold text-xs">Emerald Mist</div>
            <div className="text-green-200 text-xs">Drop ladle here!</div>
          </div>

          {/* Purple Power Bowl */}
          <div 
            className="bg-black/40 backdrop-blur-md border-4 border-purple-600 rounded-lg p-4 text-center shadow-lg w-24
                     hover:bg-black/60 transition-all cursor-pointer transform hover:scale-105
                     border-dashed border-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'purple')}
          >
            <Image
              src="/potion-assets/purple_potion.png"
              alt="Purple Power"
              width={50}
              height={65}
              className="mx-auto mb-2"
            />
            <div className="text-purple-100 font-bold text-xs">Purple Power</div>
            <div className="text-purple-200 text-xs">Drop ladle here!</div>
          </div>
        </div>

      </div>



      {/* Game Status Overlays */}
      {gameStatus === "success" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-green-600 text-white p-8 rounded-lg text-center shadow-2xl">
            <p className="text-3xl font-bold mb-4">🎉 Perfect Potion!</p>
            <p className="text-xl mb-4">+10 Points!</p>
            <Button onClick={generateNewRecipe} className="bg-green-700 hover:bg-green-800">
              Brew Another Potion
            </Button>
          </div>
        </div>
      )}
      
      {gameStatus === "error" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-red-600 text-white p-8 rounded-lg text-center shadow-2xl">
            <p className="text-3xl font-bold mb-4">❌ Recipe Failed!</p>
            <p className="text-lg mb-4">Check the recipe and try again</p>
            <Button onClick={resetGame} className="bg-red-700 hover:bg-red-800">
              Try Again
            </Button>
          </div>
        </div>
      )}

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-800 to-indigo-900 border-4 border-purple-500 rounded-lg p-8 max-w-md mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-white">🎯 How to Play</h4>
                <button
                  type="button"
                  onClick={() => setShowInstructions(false)}
                  className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white font-bold transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="text-purple-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📖</span>
                  <p>Read the recipe scroll to see what fractions you need</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🥄</span>
                  <p>Drag a magic ladle with the correct fraction</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <p>Drop it on the right ingredient bowl</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏺</span>
                  <p>Complete the recipe to brew a perfect potion!</p>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => setShowInstructions(false)}
                  className="bg-green-600 hover:bg-green-700 px-6"
                >
                  Got it! Let's Start Brewing! 🧪
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
