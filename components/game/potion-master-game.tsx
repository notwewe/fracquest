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
  { numerator: 1, denominator: 5 },
  { numerator: 1, denominator: 6 },
  { numerator: 1, denominator: 7 },
  { numerator: 1, denominator: 8 },
  { numerator: 1, denominator: 9 }
]

// Helper function to simplify fractions to lowest terms
const simplifyFraction = (fraction: Fraction): Fraction => {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const divisor = gcd(fraction.numerator, fraction.denominator)
  return {
    numerator: fraction.numerator / divisor,
    denominator: fraction.denominator / divisor
  }
}

// Possible target fractions that can be made by adding ladle fractions
// ALL fractions are pre-simplified to lowest terms
const TARGET_FRACTIONS_UNSIMPLIFIED: Fraction[] = [
  { numerator: 1, denominator: 2 },    // 1/2
  { numerator: 2, denominator: 3 },    // 2/3
  { numerator: 3, denominator: 4 },    // 3/4
  { numerator: 5, denominator: 6 },    // 5/6
  { numerator: 7, denominator: 8 },    // 7/8
  { numerator: 5, denominator: 8 },    // 5/8
  { numerator: 1, denominator: 1 },    // 1/1
  { numerator: 3, denominator: 8 },    // 3/8
  { numerator: 5, denominator: 12 },   // 5/12
  { numerator: 11, denominator: 12 },  // 11/12
  { numerator: 1, denominator: 3 },    // 1/3
  { numerator: 1, denominator: 4 },    // 1/4
  { numerator: 2, denominator: 5 },    // 2/5
  { numerator: 3, denominator: 5 },    // 3/5
  { numerator: 4, denominator: 5 },    // 4/5
  { numerator: 1, denominator: 6 },    // 1/6
  { numerator: 7, denominator: 12 },   // 7/12
  { numerator: 1, denominator: 8 },    // 1/8
  { numerator: 4, denominator: 7 },    // 4/7
]

// Simplify all target fractions to ensure they're in lowest terms
const TARGET_FRACTIONS = TARGET_FRACTIONS_UNSIMPLIFIED.map(f => simplifyFraction(f))

export function PotionMasterGame() {
  const [recipe, setRecipe] = useState<Recipe>({ 
    pinkAmount: { numerator: 1, denominator: 2 }, 
    blueAmount: { numerator: 1, denominator: 4 } 
  })
  const [cauldronContents, setCauldronContents] = useState<{ ingredient: string, fraction: Fraction }[]>([])
  const [gameStatus, setGameStatus] = useState<"playing" | "success" | "error">("playing")
  const [score, setScore] = useState(0)
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)
  const [questionType, setQuestionType] = useState<"addition" | "subtraction">("addition")
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
  const [tutorialMode, setTutorialMode] = useState(true)
  const [interactiveTutorialRecipe, setInteractiveTutorialRecipe] = useState<Recipe | null>(null)
  const [interactiveTutorialComplete, setInteractiveTutorialComplete] = useState(false)

  const instructionDialogues = [
    "Hey there, adventurer! Welcome to Squeaks Emporium: Cauldron Corner. I'm Squeaks! Let's brew some magical fractions!",
    "Check the Recipe Scroll — it shows how much Pink Powder 🌸 and Blue Crystals 💎 you need.",
    "Use the Magic Ladles to scoop the right fractions — ½, ⅓, ¼, and more! Drop them into the cauldron to start mixing.",
    "Need to add more? Use multiple ladles!",
    "Oops, too much? Don't worry! Use Mystic Water 💧 to subtract Pink Powder, or Magic Goo 🧫 to subtract Blue Crystals.",
    "Sometimes the potion starts with too much! That's a Dilution Challenge — fix it with the diluters!",
    "Match the fractions perfectly and your potion will sparkle! Ready to start measuring?"
  ]
  
  const handleDialogueProgress = () => {
    // For interactive tutorials, check if the recipe is complete
    if (currentDialogueIndex === 3 && interactiveTutorialRecipe) {
      // Addition tutorial - check if recipe is complete
      if (!checkTutorialRecipe()) {
        return // Don't advance if not complete
      }
      setInteractiveTutorialRecipe(null)
      setCauldronContents([])
    } else if (currentDialogueIndex === 4 && interactiveTutorialRecipe) {
      // Subtraction tutorial - check if recipe is complete
      if (!checkTutorialRecipe()) {
        return // Don't advance if not complete
      }
      setInteractiveTutorialRecipe(null)
      setCauldronContents([])
    }

    if (currentDialogueIndex < instructionDialogues.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1)
      
      // Set up interactive tutorial recipes
      if (currentDialogueIndex === 2) {
        // Dialogue 3: Addition tutorial - using 2/5 and 1/2 (already simplified)
        setInteractiveTutorialRecipe({
          pinkAmount: simplifyFraction({ numerator: 2, denominator: 5 }),
          blueAmount: simplifyFraction({ numerator: 1, denominator: 2 })
        })
        setCauldronContents([])
        setGameStatus("playing")
      } else if (currentDialogueIndex === 3) {
        // Dialogue 4: Subtraction tutorial - using 1/2 and 1/3
        setInteractiveTutorialRecipe({
          pinkAmount: simplifyFraction({ numerator: 1, denominator: 2 }),
          blueAmount: simplifyFraction({ numerator: 1, denominator: 3 })
        })
        // Start with excess in cauldron
        setCauldronContents([
          { ingredient: 'pink', fraction: simplifyFraction({ numerator: 3, denominator: 4 }) },
          { ingredient: 'blue', fraction: simplifyFraction({ numerator: 2, denominator: 3 }) }
        ])
        setGameStatus("playing")
      }
    } else {
      // Tutorial completed, start the game
      setShowInstructions(false)
      setTutorialMode(false)
      setInteractiveTutorialRecipe(null)
      generateNewRecipe()
    }
  }

  const checkTutorialRecipe = () => {
    if (!interactiveTutorialRecipe) return false

    const pinkContents = cauldronContents.filter(content => content.ingredient === 'pink')
    const blueContents = cauldronContents.filter(content => content.ingredient === 'blue')

    const calculateTotal = (contents: { ingredient: string, fraction: Fraction }[]) => {
      if (contents.length === 0) return { numerator: 0, denominator: 1 }
      
      const denominators = contents.map(c => c.fraction.denominator)
      const lcm = denominators.reduce((acc, val) => {
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
        return (acc * val) / gcd(acc, val)
      })
      
      const totalNumerator = contents.reduce((sum, content) => {
        return sum + (content.fraction.numerator * lcm / content.fraction.denominator)
      }, 0)
      
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
      const commonDivisor = gcd(totalNumerator, lcm)
      
      return {
        numerator: totalNumerator / commonDivisor,
        denominator: lcm / commonDivisor
      }
    }

    const pinkTotal = calculateTotal(pinkContents)
    const blueTotal = calculateTotal(blueContents)

    const pinkMatch = pinkTotal.numerator === interactiveTutorialRecipe.pinkAmount.numerator && 
                     pinkTotal.denominator === interactiveTutorialRecipe.pinkAmount.denominator
    const blueMatch = blueTotal.numerator === interactiveTutorialRecipe.blueAmount.numerator && 
                     blueTotal.denominator === interactiveTutorialRecipe.blueAmount.denominator

    return pinkMatch && blueMatch && pinkContents.length > 0 && blueContents.length > 0
  }

  const generateNewRecipe = () => {
    // Ensure fractions are different and simplified
    let randomFraction1 = TARGET_FRACTIONS[Math.floor(Math.random() * TARGET_FRACTIONS.length)]
    let randomFraction2 = TARGET_FRACTIONS[Math.floor(Math.random() * TARGET_FRACTIONS.length)]
    
    // Ensure the fractions are different
    let attempts = 0
    while (randomFraction2.numerator === randomFraction1.numerator && 
           randomFraction2.denominator === randomFraction1.denominator && 
           attempts < 10) {
      randomFraction2 = TARGET_FRACTIONS[Math.floor(Math.random() * TARGET_FRACTIONS.length)]
      attempts++
    }
    
    // Simplify both fractions to ensure lowest terms
    const simplifiedFraction1 = simplifyFraction(randomFraction1)
    const simplifiedFraction2 = simplifyFraction(randomFraction2)
    
    // 30% chance for subtraction question, 70% for addition
    const isSubtractionQuestion = Math.random() < 0.3
    setQuestionType(isSubtractionQuestion ? "subtraction" : "addition")
    
    setRecipe({ 
      pinkAmount: simplifiedFraction1, 
      blueAmount: simplifiedFraction2 
    })
    
    if (isSubtractionQuestion) {
      // For subtraction questions, start with excess ingredients in the cauldron
      const generateExcessFraction = (target: Fraction) => {
        // Create a fraction that's larger than the target
        const possibleExcess = LADLE_FRACTIONS.filter(f => 
          (f.numerator / f.denominator) > (target.numerator / target.denominator)
        )
        
        if (possibleExcess.length > 0) {
          return simplifyFraction(possibleExcess[Math.floor(Math.random() * possibleExcess.length)])
        } else {
          // If no single ladle is larger, add the target + a small fraction
          const smallFraction = LADLE_FRACTIONS[Math.floor(Math.random() * 3)] // Use 1/2, 1/3, or 1/4
          const lcm = (target.denominator * smallFraction.denominator) / 
                     (() => {
                       const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                       return gcd(target.denominator, smallFraction.denominator)
                     })()
          
          const result = {
            numerator: (target.numerator * lcm / target.denominator) + (smallFraction.numerator * lcm / smallFraction.denominator),
            denominator: lcm
          }
          
          return simplifyFraction(result)
        }
      }
      
      const excessPink = generateExcessFraction(simplifiedFraction1)
      const excessBlue = generateExcessFraction(simplifiedFraction2)
      
      setCauldronContents([
        { ingredient: 'pink', fraction: excessPink },
        { ingredient: 'blue', fraction: excessBlue }
      ])
    } else {
      setCauldronContents([])
    }
    
    setGameStatus("playing")
  }

  // Initialize with random recipe on first load (but not during tutorial)
  useEffect(() => {
    if (!tutorialMode && !interactiveTutorialRecipe) {
      generateNewRecipe()
    }
  }, [tutorialMode])

  // Check for tutorial recipe completion
  useEffect(() => {
    if (interactiveTutorialRecipe) {
      if (checkTutorialRecipe()) {
        // Recipe complete! Show success indicator
        setGameStatus("success")
      } else {
        setGameStatus("playing")
      }
    }
  }, [cauldronContents, interactiveTutorialRecipe])

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
    } 
  }

  useEffect(() => {
    if (!interactiveTutorialRecipe) {
      checkRecipe()
    }
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
      if (draggedItem.ingredient) {
        if (draggedItem.ingredient === 'water') {
          // Mystic water subtracts from pink powder
          const pinkItems = cauldronContents.filter(c => c.ingredient === 'pink')
          if (pinkItems.length > 0) {
            // Calculate current pink total
            const calculateTotal = (items: typeof pinkItems) => {
              if (items.length === 0) return { numerator: 0, denominator: 1 }
              
              const denominators = items.map(c => c.fraction.denominator)
              const lcm = denominators.reduce((acc, val) => {
                const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                return (acc * val) / gcd(acc, val)
              })
              
              const totalNumerator = items.reduce((sum, item) => {
                return sum + (item.fraction.numerator * lcm / item.fraction.denominator)
              }, 0)
              
              const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
              const commonDivisor = gcd(totalNumerator, lcm)
              
              return {
                numerator: totalNumerator / commonDivisor,
                denominator: lcm / commonDivisor
              }
            }

            const pinkTotal = calculateTotal(pinkItems)
            
            // Subtract water fraction from pink total
            const waterFraction = draggedItem.fraction
            
            // Find common denominator for subtraction
            const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
            const lcm = (pinkTotal.denominator * waterFraction.denominator) / gcd(pinkTotal.denominator, waterFraction.denominator)
            
            const pinkNumerator = (pinkTotal.numerator * lcm) / pinkTotal.denominator
            const waterNumerator = (waterFraction.numerator * lcm) / waterFraction.denominator
            
            const resultNumerator = Math.max(0, pinkNumerator - waterNumerator) // Don't go below 0
            
            // Simplify result
            const commonDivisor = gcd(resultNumerator, lcm)
            const finalFraction = {
              numerator: resultNumerator / commonDivisor,
              denominator: lcm / commonDivisor
            }
            
            // Remove all pink items and add the result as a single item (if > 0)
            const otherItems = cauldronContents.filter(c => c.ingredient !== 'pink')
            if (finalFraction.numerator > 0) {
              setCauldronContents([...otherItems, { ingredient: 'pink', fraction: simplifyFraction(finalFraction) }])
            } else {
              setCauldronContents(otherItems)
            }
          }
        } else if (draggedItem.ingredient === 'green') {
          // Green blob subtracts from blue crystals
          const blueItems = cauldronContents.filter(c => c.ingredient === 'blue')
          if (blueItems.length > 0) {
            // Calculate current blue total
            const calculateTotal = (items: typeof blueItems) => {
              if (items.length === 0) return { numerator: 0, denominator: 1 }
              
              const denominators = items.map(c => c.fraction.denominator)
              const lcm = denominators.reduce((acc, val) => {
                const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                return (acc * val) / gcd(acc, val)
              })
              
              const totalNumerator = items.reduce((sum, item) => {
                return sum + (item.fraction.numerator * lcm / item.fraction.denominator)
              }, 0)
              
              const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
              const commonDivisor = gcd(totalNumerator, lcm)
              
              return {
                numerator: totalNumerator / commonDivisor,
                denominator: lcm / commonDivisor
              }
            }

            const blueTotal = calculateTotal(blueItems)
            
            // Subtract green blob fraction from blue total
            const greenFraction = draggedItem.fraction
            
            // Find common denominator for subtraction
            const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
            const lcm = (blueTotal.denominator * greenFraction.denominator) / gcd(blueTotal.denominator, greenFraction.denominator)
            
            const blueNumerator = (blueTotal.numerator * lcm) / blueTotal.denominator
            const greenNumerator = (greenFraction.numerator * lcm) / greenFraction.denominator
            
            const resultNumerator = Math.max(0, blueNumerator - greenNumerator) // Don't go below 0
            
            // Simplify result
            const commonDivisor = gcd(resultNumerator, lcm)
            const finalFraction = {
              numerator: resultNumerator / commonDivisor,
              denominator: lcm / commonDivisor
            }
            
            // Remove all blue items and add the result as a single item (if > 0)
            const otherItems = cauldronContents.filter(c => c.ingredient !== 'blue')
            if (finalFraction.numerator > 0) {
              setCauldronContents([...otherItems, { ingredient: 'blue', fraction: simplifyFraction(finalFraction) }])
            } else {
              setCauldronContents(otherItems)
            }
          }
        } else {
          // Regular ingredient addition - simplify the fraction before adding
          setCauldronContents(prev => [...prev, { 
            ingredient: draggedItem.ingredient!, 
            fraction: simplifyFraction(draggedItem.fraction)
          }])
        }
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

  // Get current recipe (either interactive tutorial or main game)
  const currentRecipe = interactiveTutorialRecipe || recipe

  return (
    <div className="w-full p-4">
      <div>
        {/* Main Game Area - Show during tutorial and normal game */}
        {showInstructions ? (
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
                    <div className="grid grid-cols-2 gap-2">
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
                              {draggedItem?.fraction === fraction && draggedItem.ingredient && (
                                <div className="mt-1 text-xs">
                                  {draggedItem.ingredient === 'pink' ? '🌸' : 
                                   draggedItem.ingredient === 'blue' ? '💎' : 
                                   draggedItem.ingredient === 'green' ? '🟢' :
                                   '💧'}
                                </div>
                              )}
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
                    width={400}   // increase this
                    height={400}  // increase this
                    className="object-contain w-[400px] h-[400px] mt-20" // mt-10 moves it lower
                  />


                    {/* Cauldron Contents */}
                    <div className="absolute inset-10 flex items-center justify-center">
                      <div className="text-center text-white text-lg drop-shadow-lg">
                        {cauldronContents.length === 0 && interactiveTutorialRecipe && "Drop ingredients here!"}
                        {cauldronContents.length > 0 && (
                          <div className="max-h-40 overflow-y-auto">
                            {(() => {
                              const pinkItems = cauldronContents.filter(c => c.ingredient === 'pink')
                              const blueItems = cauldronContents.filter(c => c.ingredient === 'blue')
                              
                              const calculateTotal = (items: typeof pinkItems) => {
                                if (items.length === 0) return { numerator: 0, denominator: 1 }
                                
                                const denominators = items.map(c => c.fraction.denominator)
                                const lcm = denominators.reduce((acc, val) => {
                                  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                                  return (acc * val) / gcd(acc, val)
                                })
                                
                                const totalNumerator = items.reduce((sum, item) => {
                                  return sum + (item.fraction.numerator * lcm / item.fraction.denominator)
                                }, 0)
                                
                                const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                                const commonDivisor = gcd(totalNumerator, lcm)
                                
                                return {
                                  numerator: totalNumerator / commonDivisor,
                                  denominator: lcm / commonDivisor
                                }
                              }

                              const pinkTotal = calculateTotal(pinkItems)
                              const blueTotal = calculateTotal(blueItems)
                              
                              return (
                                <div>
                                  <div className="mb-2 text-sm">Current Amounts:</div>
                                  
                                  {pinkItems.length > 0 && (
                                    <div className="mb-3 bg-pink-900/40 rounded px-3 py-2">
                                      <div className="text-pink-300 font-bold text-base">
                                        🌸 Pink Powder: {pinkTotal.denominator === 1 ? pinkTotal.numerator : fractionToString(pinkTotal)}
                                      </div>
                                      <div className="text-xs text-pink-200 mt-1">
                                        ({pinkItems.map(item => fractionToString(item.fraction)).join(" + ")})
                                      </div>
                                    </div>
                                  )}
                                  
                                  {blueItems.length > 0 && (
                                    <div className="mb-3 bg-blue-900/40 rounded px-3 py-2">
                                      <div className="text-blue-300 font-bold text-base">
                                        💎 Blue Crystals: {blueTotal.denominator === 1 ? blueTotal.numerator : fractionToString(blueTotal)}
                                      </div>
                                      <div className="text-xs text-blue-200 mt-1">
                                        ({blueItems.map(item => fractionToString(item.fraction)).join(" + ")})
                                      </div>
                                    </div>
                                  )}
                                  
                                  {pinkItems.length === 0 && blueItems.length === 0 && (
                                    <div className="text-gray-400 text-sm">Drop ingredients to start mixing!</div>
                                  )}
                                </div>
                              )
                            })()}
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
                      {interactiveTutorialRecipe && (
                        <div className="space-y-2">
                        
                          <p className="text-pink-600 font-bold text-lg">
                            🌸 Pink Powder: {fractionToString(currentRecipe.pinkAmount)}
                          </p>
                          <p className="text-blue-600 font-bold text-lg">
                            💎 Blue Crystals: {fractionToString(currentRecipe.blueAmount)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Ingredient Bowls */}
            {currentDialogueIndex >= 3 && (
              <div className="flex justify-center gap-6">
                {/* Water Bowl */}
                <div 
                  className={`p-4 text-center shadow-lg w-32 rounded-lg transition-all cursor-pointer transform hover:scale-105 ${
                    draggedItem && !draggedItem.ingredient ? 'hover:bg-cyan-500/20 border-2 border-dashed border-cyan-400' : 
                    draggedItem?.ingredient === 'water' ? 'bg-cyan-500/30 border-2 border-solid border-cyan-400' : 
                    'hover:bg-cyan-500/10'
                  }`}
                  onDragOver={(e) => {
                    handleDragOver(e)
                    handleIngredientHover(e, 'water')
                  }}
                >
                  <Image
                    src="/potion-assets/blue_potion.png"
                    alt="Mystic Water"
                    width={80}
                    height={104}
                    className="mx-auto mb-2"
                  />
                  <div className="text-cyan-100 font-bold text-xs">Mystic Water 💧</div>
                  <div className="text-cyan-200 text-xs">
                    {draggedItem?.ingredient === 'water' ? 'Collected! Drop to subtract' : 'Hover ladle to collect!'}
                  </div>
                </div>

                {/* Blue Crystals Bowl */}
                <div 
                  className={`p-4 text-center shadow-lg w-32 rounded-lg transition-all cursor-pointer transform hover:scale-105 ${
                    draggedItem && !draggedItem.ingredient ? 'hover:bg-blue-500/20 border-2 border-dashed border-blue-400' : 
                    draggedItem?.ingredient === 'blue' ? 'bg-blue-500/30 border-2 border-solid border-blue-400' : 
                    'hover:bg-blue-500/10'
                  }`}
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
                  <div className="text-blue-200 text-xs">
                    {draggedItem?.ingredient === 'blue' ? 'Collected! Drop in cauldron' : 'Hover ladle to collect!'}
                  </div>
                </div>

                {/* Green Blob Bowl */}
                <div 
                  className={`p-4 text-center shadow-lg w-32 rounded-lg transition-all cursor-pointer transform hover:scale-105 ${
                    draggedItem && !draggedItem.ingredient ? 'hover:bg-green-500/20 border-2 border-dashed border-green-400' : 
                    draggedItem?.ingredient === 'green' ? 'bg-green-500/30 border-2 border-solid border-green-400' : 
                    'hover:bg-green-500/10'
                  }`}
                  onDragOver={(e) => {
                    handleDragOver(e)
                    handleIngredientHover(e, 'green')
                  }}
                >
                  <Image
                    src="/potion-assets/green_potion.png"
                    alt="Green Blob"
                    width={80}
                    height={104}
                    className="mx-auto mb-2"
                  />
                  <div className="text-green-100 font-bold text-xs">Green Blob 🟢</div>
                  <div className="text-green-200 text-xs">
                    {draggedItem?.ingredient === 'green' ? 'Collected! Drop to subtract' : 'Hover ladle to collect!'}
                  </div>
                </div>

                {/* Pink Powder Bowl */}
                <div 
                  className={`p-4 text-center shadow-lg w-32 rounded-lg transition-all cursor-pointer transform hover:scale-105 ${
                    draggedItem && !draggedItem.ingredient ? 'hover:bg-pink-500/20 border-2 border-dashed border-pink-400' : 
                    draggedItem?.ingredient === 'pink' ? 'bg-pink-500/30 border-2 border-solid border-pink-400' : 
                    'hover:bg-pink-500/10'
                  }`}
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
                  <div className="text-pink-200 text-xs">
                    {draggedItem?.ingredient === 'pink' ? 'Collected! Drop in cauldron' : 'Hover ladle to collect!'}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Normal game view
          <>
             {/* Top Navigation Buttons */}
             {!tutorialMode && (
               <div className="mb-6 relative">
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
              )}

           {/* Main Game Area - Only show when not in tutorial */}
           {!tutorialMode && (
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
                     <h3 className="text-lg font-bold text-white mb-3 text-center">�� Magic Ladles</h3>
                     <div className="grid grid-cols-2 gap-2">
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
                               {draggedItem?.fraction === fraction && draggedItem.ingredient && (
                                 <div className="mt-1 text-xs">
                                   {draggedItem.ingredient === 'pink' ? '🌸' : 
                                    draggedItem.ingredient === 'blue' ? '💎' : 
                                    draggedItem.ingredient === 'green' ? '🟢' :
                                    '💧'}
                                 </div>
                               )}
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

                     {/* Cauldron Contents */}
                     <div className="absolute inset-10 flex items-center justify-center">
                       <div className="text-center text-white text-lg drop-shadow-lg">
                         {cauldronContents.length === 0 && "Drop ingredients here!"}
                         {cauldronContents.length > 0 && (
                           <div className="max-h-40 overflow-y-auto">
                             {(() => {
                               const pinkItems = cauldronContents.filter(c => c.ingredient === 'pink')
                               const blueItems = cauldronContents.filter(c => c.ingredient === 'blue')
                               
                               const calculateTotal = (items: typeof pinkItems) => {
                                 if (items.length === 0) return { numerator: 0, denominator: 1 }
                                 
                                 const denominators = items.map(c => c.fraction.denominator)
                                 const lcm = denominators.reduce((acc, val) => {
                                   const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                                   return (acc * val) / gcd(acc, val)
                                 })
                                 
                                 const totalNumerator = items.reduce((sum, item) => {
                                   return sum + (item.fraction.numerator * lcm / item.fraction.denominator)
                                 }, 0)
                                 
                                 const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                                 const commonDivisor = gcd(totalNumerator, lcm)
                                 
                                 return {
                                   numerator: totalNumerator / commonDivisor,
                                   denominator: lcm / commonDivisor
                                 }
                               }

                               const pinkTotal = calculateTotal(pinkItems)
                               const blueTotal = calculateTotal(blueItems)
                               
                               return (
                                 <div>
                                   <div className="mb-2 text-sm">Current Amounts:</div>
                                   
                                   {pinkItems.length > 0 && (
                                     <div className="mb-3 bg-pink-900/40 rounded px-3 py-2">
                                       <div className="text-pink-300 font-bold text-base">
                                         �� Pink Powder: {pinkTotal.denominator === 1 ? pinkTotal.numerator : fractionToString(pinkTotal)}
                                       </div>
                                       <div className="text-xs text-pink-200 mt-1">
                                         ({pinkItems.map(item => fractionToString(item.fraction)).join(" + ")})
                                       </div>
                                     </div>
                                   )}
                                   
                                   {blueItems.length > 0 && (
                                     <div className="mb-3 bg-blue-900/40 rounded px-3 py-2">
                                       <div className="text-blue-300 font-bold text-base">
                                         💎 Blue Crystals: {blueTotal.denominator === 1 ? blueTotal.numerator : fractionToString(blueTotal)}
                                       </div>
                                       <div className="text-xs text-blue-200 mt-1">
                                         ({blueItems.map(item => fractionToString(item.fraction)).join(" + ")})
                                       </div>
                                     </div>
                                   )}
                                   
                                   {pinkItems.length === 0 && blueItems.length === 0 && (
                                     <div className="text-gray-400 text-sm">Drop ingredients to start mixing!</div>
                                   )}
                                 </div>
                               )
                             })()}
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
                       <h3 className="text-amber-800 font-bold text-xl mb-4">Recipe Scroll</h3>
                       <div className="space-y-2">
                         <p className="text-amber-700 font-semibold mb-2">Magic Potion Recipe:</p>
                         <p className="text-pink-600 font-bold text-lg">
                           🌸 Pink Powder: {fractionToString(recipe.pinkAmount)}
                         </p>
                         <p className="text-blue-600 font-bold text-lg">
                           💎 Blue Crystals: {fractionToString(recipe.blueAmount)}
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Bottom Section - Ingredient Bowls */}
             <div className="flex justify-center gap-6">

               {/* Water Bowl */}
               <div 
                 className={`p-4 text-center shadow-lg w-32 rounded-lg transition-all cursor-pointer transform hover:scale-105 ${
                   draggedItem && !draggedItem.ingredient ? 'hover:bg-cyan-500/20 border-2 border-dashed border-cyan-400' : 
                   draggedItem?.ingredient === 'water' ? 'bg-cyan-500/30 border-2 border-solid border-cyan-400' : 
                   'hover:bg-cyan-500/10'
                 }`}
                 onDragOver={(e) => {
                   handleDragOver(e)
                   handleIngredientHover(e, 'water')
                 }}
               >
                 <Image
                   src="/potion-assets/blue_potion.png"
                   alt="Mystic Water"
                   width={80}
                   height={104}
                   className="mx-auto mb-2"
                 />
                 <div className="text-cyan-100 font-bold text-xs">Mystic Water 💧</div>
                 <div className="text-cyan-200 text-xs">
                   {draggedItem?.ingredient === 'water' ? 'Collected! Drop to subtract' : 'Hover ladle to collect!'}
                 </div>
               </div>

               {/* Blue Crystals Bowl */}
               <div 
                 className={`p-4 text-center shadow-lg w-32 rounded-lg transition-all cursor-pointer transform hover:scale-105 ${
                   draggedItem && !draggedItem.ingredient ? 'hover:bg-blue-500/20 border-2 border-dashed border-blue-400' : 
                   draggedItem?.ingredient === 'blue' ? 'bg-blue-500/30 border-2 border-solid border-blue-400' : 
                   'hover:bg-blue-500/10'
                 }`}
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
                 <div className="text-blue-200 text-xs">
                   {draggedItem?.ingredient === 'blue' ? 'Collected! Drop in cauldron' : 'Hover ladle to collect!'}
                 </div>
               </div>

               {/* Green Blob Bowl */}
               <div 
                 className={`p-4 text-center shadow-lg w-32 rounded-lg transition-all cursor-pointer transform hover:scale-105 ${
                   draggedItem && !draggedItem.ingredient ? 'hover:bg-green-500/20 border-2 border-dashed border-green-400' : 
                   draggedItem?.ingredient === 'green' ? 'bg-green-500/30 border-2 border-solid border-green-400' : 
                   'hover:bg-green-500/10'
                 }`}
                 onDragOver={(e) => {
                   handleDragOver(e)
                   handleIngredientHover(e, 'green')
                 }}
               >
                 <Image
                   src="/potion-assets/green_potion.png"
                   alt="Green Blob"
                   width={80}
                   height={104}
                   className="mx-auto mb-2"
                 />
                 <div className="text-green-100 font-bold text-xs">Green Blob 🟢</div>
                 <div className="text-green-200 text-xs">
                   {draggedItem?.ingredient === 'green' ? 'Collected! Drop to subtract' : 'Hover ladle to collect!'}
                 </div>
               </div>

               {/* Pink Powder Bowl */}
               <div 
                 className={`p-4 text-center shadow-lg w-32 rounded-lg transition-all cursor-pointer transform hover:scale-105 ${
                   draggedItem && !draggedItem.ingredient ? 'hover:bg-pink-500/20 border-2 border-dashed border-pink-400' : 
                   draggedItem?.ingredient === 'pink' ? 'bg-pink-500/30 border-2 border-solid border-pink-400' : 
                   'hover:bg-pink-500/10'
                 }`}
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
                 <div className="text-pink-200 text-xs">
                   {draggedItem?.ingredient === 'pink' ? 'Collected! Drop in cauldron' : 'Hover ladle to collect!'}
                 </div>
               </div>
             </div>
           </div>
           )}
          </>
        )}

        {/* Game Status Overlays */}
        {!tutorialMode && gameStatus === "success" && (
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
        
        {!tutorialMode && gameStatus === "error" && (
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

        {/* Tutorial Success Overlay */}
        {interactiveTutorialRecipe && gameStatus === "success" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
            <div className="bg-green-600 text-white p-8 rounded-lg text-center shadow-2xl">
              <p className="text-3xl font-bold mb-4">🎉 Perfect!</p>
              <p className="text-xl mb-4">You got the recipe right! Click to continue.</p>
            </div>
          </div>
        )}

        {/* Instructions Modal - Dialogue Style */}
        {showInstructions && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {/* Squeaks character image */}
            <img
              src="/game characters/Squeaks.png"
              alt="Squeaks"
              style={{
                imageRendering: "pixelated",
                filter: "drop-shadow(0 0 12px #000)",
                transform: "scaleX(-1)",
                left: "15%",
                bottom: "1%",
                position: "absolute",
                width: "400px",
                height: "400px",
                zIndex: 51
              }}
              className="pointer-events-none"
            />
            
            {/* Smaller Dialogue box */}
            <div 
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-90 border-4 border-amber-800 rounded-lg p-4 w-full max-w-2xl mx-auto z-50 cursor-pointer pointer-events-auto" 
              onClick={handleDialogueProgress}
            >
              <div className="text-amber-300 font-pixel text-base mb-1">Squeaks</div>
              <div className="text-white font-pixel text-base mb-2 whitespace-pre-wrap">
                {instructionDialogues[currentDialogueIndex]}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-amber-400 text-xs">
                  {currentDialogueIndex + 1} / {instructionDialogues.length}
                </div>
                {checkTutorialRecipe() ? (
                  <div className="text-green-400 text-xs">✅ Great! Click to continue</div>
                ) : interactiveTutorialRecipe ? (
                  <div className="text-amber-400 text-xs">🎯 Try it yourself!</div>
                ) : (
                  <div className="text-amber-400 text-xs">▼ Click to continue</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}