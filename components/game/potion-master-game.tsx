"use client"

import React, { useState, useEffect } from "react"
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
      content.ingredient === "pink" && 
      content.fraction.numerator === recipe.ingredient1.numerator && 
      content.fraction.denominator === recipe.ingredient1.denominator
    ) && cauldronContents.some(content => 
      content.ingredient === "blue" && 
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
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header with Score */}
      <div className="text-center mb-6">
        <div className="bg-purple-900/50 backdrop-blur-md border border-purple-500/30 rounded-lg p-4 inline-block">
          <h2 className="text-2xl font-bold text-white mb-2">🧪 Potion Master</h2>
          <p className="text-purple-200 mb-2">Drag & Drop Fraction Game</p>
          <div className="text-yellow-400 font-bold">Score: {score}</div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Panel - Magic Ladles */}
        <div className="bg-purple-900/30 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center">🥄 Magic Ladles</h3>
          <div className="grid grid-cols-2 gap-3">
            {LADLE_FRACTIONS.map((fraction, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, fraction)}
                className="bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 
                         border-2 border-amber-700 rounded-lg p-4 text-center cursor-grab active:cursor-grabbing
                         transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="text-amber-900 font-bold text-lg">
                  {fractionToString(fraction)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Cauldron & Recipe */}
        <div className="space-y-6">
          {/* Recipe Scroll */}
          <div className="bg-gradient-to-br from-yellow-100 to-amber-100 border-4 border-amber-600 rounded-lg p-6 shadow-lg transform rotate-1">
            <div className="text-center">
              <h3 className="text-amber-800 font-bold text-xl mb-4">📜 Recipe Scroll</h3>
              <div className="space-y-2">
                <p className="text-amber-700 font-semibold">Strength Potion Recipe:</p>
                <p className="text-pink-600 font-bold">
                  • {fractionToString(recipe.ingredient1)} of Pink Powder ✨
                </p>
                <p className="text-blue-600 font-bold">
                  • {fractionToString(recipe.ingredient2)} of Blue Crystals 💎
                </p>
              </div>
            </div>
          </div>

          {/* Cauldron */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full border-8 border-gray-600 shadow-2xl">
              {/* Cauldron Contents */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 opacity-80 flex items-center justify-center">
                <div className="text-center text-white text-sm">
                  {cauldronContents.length === 0 && "Empty Cauldron"}
                  {cauldronContents.map((content, index) => (
                    <div key={index} className="mb-1">
                      {fractionToString(content.fraction)} {content.ingredient === 'pink' ? '✨' : '💎'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Fire */}
            <div className="mt-2 text-orange-500 text-2xl animate-pulse">🔥🔥🔥</div>
          </div>
        </div>

        {/* Right Panel - Ingredient Bowls */}
        <div className="bg-purple-900/30 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center">🧪 Ingredients</h3>
          <div className="space-y-4">
            
            {/* Mystic Water Bowl (not used in current recipe) */}
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 border-4 border-cyan-600 rounded-lg p-6 text-center shadow-lg">
              <div className="text-cyan-100 text-3xl mb-2">💧</div>
              <div className="text-cyan-100 font-bold">Mystic Water</div>
              <div className="text-cyan-200 text-sm">(Not needed)</div>
            </div>

            {/* Blue Crystals Bowl */}
            <div 
              className="bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-blue-700 rounded-lg p-6 text-center shadow-lg 
                       hover:from-blue-300 hover:to-blue-500 transition-all cursor-pointer transform hover:scale-105
                       border-dashed border-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'blue')}
            >
              <div className="text-blue-100 text-3xl mb-2">💎</div>
              <div className="text-blue-100 font-bold">Blue Crystals</div>
              <div className="text-blue-200 text-sm">Drop ladle here!</div>
            </div>

            {/* Pink Powder Bowl */}
            <div 
              className="bg-gradient-to-br from-pink-400 to-pink-600 border-4 border-pink-700 rounded-lg p-6 text-center shadow-lg 
                       hover:from-pink-300 hover:to-pink-500 transition-all cursor-pointer transform hover:scale-105
                       border-dashed border-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'pink')}
            >
              <div className="text-pink-100 text-3xl mb-2">✨</div>
              <div className="text-pink-100 font-bold">Pink Powder</div>
              <div className="text-pink-200 text-sm">Drop ladle here!</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button onClick={resetGame} className="bg-red-600 hover:bg-red-700">
          🔄 Reset Cauldron
        </Button>
        <Button onClick={generateNewRecipe} className="bg-green-600 hover:bg-green-700">
          📜 New Recipe
        </Button>
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

      {/* Instructions */}
      <div className="mt-8 bg-purple-900/30 backdrop-blur-md border border-purple-500/30 rounded-lg p-4">
        <h4 className="text-white font-bold mb-2">🎯 How to Play:</h4>
        <div className="text-purple-200 space-y-1">
          <p>1. 📖 Read the recipe scroll to see what fractions you need</p>
          <p>2. 🥄 Drag a magic ladle with the correct fraction</p>
          <p>3. 🎯 Drop it on the right ingredient bowl</p>
          <p>4. 🏺 Complete the recipe to brew a perfect potion!</p>
        </div>
      </div>
    </div>
  )
}
