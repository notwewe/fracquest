"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface Fraction {
  numerator: number
  denominator: number
}

interface Recipe {
  pinkAmount: Fraction
  blueAmount: Fraction
}

interface DragItem {
  fraction: Fraction
  type: 'ladle'
  ingredient?: string
}

const LADLE_FRACTIONS: Fraction[] = [
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 3 },
  { numerator: 1, denominator: 4 },
  { numerator: 1, denominator: 6 },
  { numerator: 1, denominator: 8 }
]

export function PotionMasterGame() {
  const [recipe, setRecipe] = useState<Recipe>({ 
    pinkAmount: { numerator: 5, denominator: 6 }, 
    blueAmount: { numerator: 3, denominator: 4 } 
  })
  const [cauldronContents, setCauldronContents] = useState<{ ingredient: string, fraction: Fraction }[]>([])
  const [gameStatus, setGameStatus] = useState<"playing" | "success" | "error">("playing")
  const [score, setScore] = useState(0)
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)

  const generateNewRecipe = () => {
    const randomFraction1 = LADLE_FRACTIONS[Math.floor(Math.random() * LADLE_FRACTIONS.length)]
    const randomFraction2 = LADLE_FRACTIONS[Math.floor(Math.random() * LADLE_FRACTIONS.length)]
    setRecipe({ pinkAmount: randomFraction1, blueAmount: randomFraction2 })
    setCauldronContents([])
    setGameStatus("playing")
  }

  const checkRecipe = () => {
    const pinkContents = cauldronContents.filter(content => content.ingredient === 'pink')
    const blueContents = cauldronContents.filter(content => content.ingredient === 'blue')

    // Calculate total fractions for each ingredient
    const calculateTotal = (contents: { ingredient: string, fraction: Fraction }[]) => {
      if (contents.length === 0) return { numerator: 0, denominator: 1 }
      
      // Find common denominator
      const denominators = contents.map(c => c.fraction.denominator)
      const lcm = denominators.reduce((acc, val) => {
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
        return (acc * val) / gcd(acc, val)
      })
      
      // Sum numerators with common denominator
      const totalNumerator = contents.reduce((sum, content) => {
        return sum + (content.fraction.numerator * lcm / content.fraction.denominator)
      }, 0)
      
      // Simplify fraction
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
      const commonDivisor = gcd(totalNumerator, lcm)
      
      return {
        numerator: totalNumerator / commonDivisor,
        denominator: lcm / commonDivisor
      }
    }

    const pinkTotal = calculateTotal(pinkContents)
    const blueTotal = calculateTotal(blueContents)

    // Check if totals match recipe requirements
    const pinkMatch = pinkTotal.numerator === recipe.pinkAmount.numerator && 
                     pinkTotal.denominator === recipe.pinkAmount.denominator
    const blueMatch = blueTotal.numerator === recipe.blueAmount.numerator && 
                     blueTotal.denominator === recipe.blueAmount.denominator

    if (pinkMatch && blueMatch && pinkContents.length > 0 && blueContents.length > 0) {
      setGameStatus("success")
      setScore(prev => prev + 10)
    } else if (cauldronContents.length >= 8) { // Limit total attempts
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

  const handleDrop = (e: React.DragEvent, target: string) => {
    e.preventDefault()
    if (!draggedItem) return

    if (target === 'cauldron') {
      // Allow dropping in cauldron if ladle has an ingredient
      if (draggedItem.ingredient && cauldronContents.length < 8) {
        setCauldronContents(prev => [...prev, { 
          ingredient: draggedItem.ingredient!, 
          fraction: draggedItem.fraction 
        }])
      }
    }
    setDraggedItem(null)
  }

  const handleIngredientHover = (e: React.DragEvent, ingredientType: string) => {
    e.preventDefault()
    if (draggedItem && !draggedItem.ingredient) {
      setDraggedItem(prev => prev ? { ...prev, ingredient: ingredientType } : null)
    }
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
            <p className="text-purple-200 mb-2">Fraction Measuring Game</p>
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

        {/* Middle Section - Horizontal Layout with Ladles, Cauldron, and Recipe */}
        <div className="flex items-center justify-center gap-8 w-full max-w-6xl">
          {/* Magic Ladles - Left side */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-fit">
              <Image
                src="/dashboard/container.png"
                alt="Magic Ladles Container"
                width={500}
                height={600}
                className="w-full h-auto transform rotate-90"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <h3 className="text-lg font-bold text-white mb-3 text-center">🥄 Magic Ladles</h3>
                <div className="flex flex-col gap-2">
                  {LADLE_FRACTIONS.map((fraction, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, fraction)}
                      className="relative cursor-grab active:cursor-grabbing transition-all transform hover:scale-105 shadow-lg hover:shadow-xl w-16 h-16"
                    >
                      <Image
                        src="/potion-assets/ladle.png"
                        alt="Magic Ladle"
                        width={32}
                        height={32}
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white font-bold text-sm drop-shadow-lg bg-black/50 rounded px-1">
                          {fractionToString(fraction)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cauldron with Target Fractions */}
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col items-center justify-center">
              <div 
                className="relative w-80 h-80"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'cauldron')}
              >
                <Image
                  src="/potion-assets/cauldron.png"
                  alt="Magic Cauldron"
                  width={320}
                  height={320}
                  className="w-full h-full object-contain"
                />
                
                {/* Target Fractions Display */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-lg p-2">
                  <div className="text-white text-sm text-center">
                    <div>Target:</div>
                    <div className="text-pink-300">🌸 {fractionToString(recipe.pinkAmount)}</div>
                    <div className="text-blue-300">💎 {fractionToString(recipe.blueAmount)}</div>
                  </div>
                </div>

                {/* Cauldron Contents */}
                <div className="absolute inset-10 flex items-center justify-center">
                  <div className="text-center text-white text-lg drop-shadow-lg">
                    {cauldronContents.length === 0 && "Drop ingredients here!"}
                    {cauldronContents.length > 0 && (
                      <div className="max-h-40 overflow-y-auto">
                        <div className="mb-2 text-sm">Contents:</div>
                        {cauldronContents.map((content, index) => (
                          <div key={index} className="mb-1 bg-black/50 rounded px-2 py-1 text-xs">
                            {fractionToString(content.fraction)} {content.ingredient === 'pink' ? '🌸' : content.ingredient === 'blue' ? '💎' : '💧'}
                          </div>
                        ))}
                        
                        {/* Show current totals */}
                        <div className="mt-3 pt-2 border-t border-white/20">
                          <div className="text-xs text-gray-300">Current Totals:</div>
                          {(() => {
                            const pinkItems = cauldronContents.filter(c => c.ingredient === 'pink')
                            const blueItems = cauldronContents.filter(c => c.ingredient === 'blue')
                            
                            const calculateDisplayTotal = (items: typeof pinkItems) => {
                              if (items.length === 0) return "0"
                              return items.map(item => fractionToString(item.fraction)).join(" + ")
                            }
                            
                            return (
                              <>
                                {pinkItems.length > 0 && (
                                  <div className="text-xs text-pink-300">
                                    🌸 {calculateDisplayTotal(pinkItems)}
                                  </div>
                                )}
                                {blueItems.length > 0 && (
                                  <div className="text-xs text-blue-300">
                                    💎 {calculateDisplayTotal(blueItems)}
                                  </div>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recipe Scroll - Right side */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-96 h-fit flex items-center justify-center">
              <Image
                src="/dashboard/scroll.png"
                alt="Recipe Scroll"
                width={500}
                height={600}
                className="w-full h-auto transform -rotate-90"
              />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center">
                  <h3 className="text-amber-800 font-bold text-xl mb-4">📜 Recipe Scroll</h3>
                  <div className="space-y-2">
                    <p className="text-amber-700 font-semibold">Magic Potion Recipe:</p>
                    <p className="text-pink-600 font-bold">
                      Mix {fractionToString(recipe.pinkAmount)} of Pink Powder 🌸
                    </p>
                    <p className="text-blue-600 font-bold">
                      Mix {fractionToString(recipe.blueAmount)} of Blue Crystals 💎
                    </p>
                    <p className="text-amber-600 text-sm mt-3">
                      Use the correct ladle to measure each ingredient!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Ingredient Bowls */}
        <div className="flex justify-center gap-8">

          {/* Water Bowl */}
          <div className="p-4 text-center shadow-lg w-32">
            <Image
              src="/potion-assets/blue_potion.png"
              alt="Mystic Water"
              width={80}
              height={104}
              className="mx-auto mb-2"
            />
            <div className="text-cyan-100 font-bold text-xs">Mystic Water 💧</div>
            <div className="text-cyan-200 text-xs">(Not needed)</div>
          </div>

          {/* Blue Crystals Bowl */}
          <div 
            className="p-4 text-center shadow-lg w-32
                     hover:bg-blue-500/20 transition-all cursor-pointer transform hover:scale-105 rounded-lg"
            onDragOver={(e) => {
              handleDragOver(e)
              handleIngredientHover(e, 'blue')
            }}
          >
            <Image
              src="/potion-assets/green_potion.png"
              alt="Blue Crystals"
              width={80}
              height={104}
              className="mx-auto mb-2"
            />
            <div className="text-blue-100 font-bold text-xs">Blue Crystals 💎</div>
            <div className="text-blue-200 text-xs">Hover ladle to collect!</div>
          </div>

          {/* Pink Powder Bowl */}
          <div 
            className="p-4 text-center shadow-lg w-32
                     hover:bg-pink-500/20 transition-all cursor-pointer transform hover:scale-105 rounded-lg"
            onDragOver={(e) => {
              handleDragOver(e)
              handleIngredientHover(e, 'pink')
            }}
          >
            <Image
              src="/potion-assets/purple_potion.png"
              alt="Pink Powder"
              width={80}
              height={104}
              className="mx-auto mb-2"
            />
            <div className="text-pink-100 font-bold text-xs">Pink Powder 🌸</div>
            <div className="text-pink-200 text-xs">Hover ladle to collect!</div>
          </div>
        </div>

      </div>

      {/* Game Status Overlays */}
      {gameStatus === "success" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-green-600 text-white p-8 rounded-lg text-center shadow-2xl">
            <p className="text-3xl font-bold mb-4">🎉 Perfect Potion!</p>
            <p className="text-xl mb-4">You measured the fractions correctly! +10 Points!</p>
            <Button onClick={generateNewRecipe} className="bg-green-700 hover:bg-green-800">
              Brew Another Potion
            </Button>
          </div>
        </div>
      )}
      
      {gameStatus === "error" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-red-600 text-white p-8 rounded-lg text-center shadow-2xl">
            <p className="text-3xl font-bold mb-4">❌ Wrong Measurements!</p>
            <p className="text-lg mb-4">Check the recipe and use the correct ladle sizes</p>
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
                <span className="text-2xl">📜</span>
                <p>Read the recipe scroll to see what fractions you need</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥄</span>
                <p>Pick the ladle with the exact fraction you need</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌸💎</span>
                <p>Hover the ladle over an ingredient to collect it</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏺</span>
                <p>Drop the measured ingredient into the cauldron</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">➕</span>
                <p>Use multiple ladles to add fractions together</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔢</span>
                <p>Example: 1/4 + 1/4 = 1/2</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button 
                onClick={() => setShowInstructions(false)}
                className="bg-green-600 hover:bg-green-700 px-6"
              >
                Got it! Let's Start Measuring! 🧪
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
