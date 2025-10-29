"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw, Scroll, HelpCircle, Crown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PotionLeaderboardModal } from "@/components/game/potion-leaderboard-modal"

// Add glow effects as CSS-in-JS styles
const glowStyles = `
  .glow-cyan {
    box-shadow: 0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.3);
  }
  .glow-blue {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
  }
  .glow-green {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.3);
  }
  .glow-pink {
    box-shadow: 0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3);
  }
`

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
const TARGET_FRACTIONS: Fraction[] = [
  { numerator: 1, denominator: 2 },    // 1/2
  { numerator: 2, denominator: 3 },    // 1/3 + 1/3
  { numerator: 3, denominator: 4 },    // 1/4 + 1/4 + 1/4
  { numerator: 5, denominator: 6 },    // 1/6 + 1/6 + 1/6 + 1/6 + 1/6 or 1/2 + 1/3
  { numerator: 7, denominator: 8 },    // 1/8 + 1/8 + ... (7 times)
  { numerator: 5, denominator: 8 },    // 1/8 + 1/8 + 1/8 + 1/8 + 1/8 or 1/2 + 1/8
  { numerator: 1, denominator: 1 },    // 1/2 + 1/2 or 1/3 + 1/3 + 1/3
  { numerator: 3, denominator: 8 },    // 1/8 + 1/8 + 1/8 or 1/4 + 1/8
  { numerator: 5, denominator: 12 },   // 1/3 + 1/12 or 1/4 + 1/6
  { numerator: 11, denominator: 12 },  // More complex combinations
]

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
  const [hideDialogueForInteraction, setHideDialogueForInteraction] = useState(false)
  const [isLoadingTutorialStatus, setIsLoadingTutorialStatus] = useState(true)
  const [potionsBrewedCount, setPotionsBrewedCount] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now())
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)

  // Initialize or load player's potion game progress
  useEffect(() => {
    const initializeProgress = async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoadingTutorialStatus(false)
        return
      }

      // Check if user has potion game progress
      const { data: progressData, error } = await supabase
        .from("potion_game_progress")
        .select("*")
        .eq("student_id", user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - it's ok if user doesn't have progress yet
        console.error("Error checking potion game progress:", error)
      }

      if (progressData) {
        // Load high scores only (not current session stats)
        setHighScore(progressData.highest_score || 0)
        setLongestStreak(progressData.highest_streak || 0)
        
        // Reset current session stats
        setScore(0)
        setPotionsBrewedCount(0)
        setCurrentStreak(0)
        
        if (progressData.has_seen_tutorial) {
          // User has seen the tutorial, skip it
          setTutorialMode(false)
          setShowInstructions(false)
        }
      } else {
        // Create new progress record for user
        const { error: insertError } = await supabase
          .from("potion_game_progress")
          .insert({
            student_id: user.id,
            has_seen_tutorial: false,
            total_score: 0,
            potions_brewed: 0,
            perfect_potions: 0,
            failed_attempts: 0,
            highest_streak: 0,
            current_streak: 0,
            highest_score: 0,
            total_time_played: 0
          })

        if (insertError) {
          console.error("Error creating potion game progress:", insertError)
        }
      }

      setIsLoadingTutorialStatus(false)
      setGameStartTime(Date.now())
    }

    initializeProgress()
  }, [])

  // Update player progress in database
  const updateProgress = async (updates: {
    total_score?: number
    potions_brewed?: number
    perfect_potions?: number
    failed_attempts?: number
    current_streak?: number
    highest_streak?: number
    highest_score?: number
  }) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    // Calculate time played (in seconds)
    const timePlayedSeconds = Math.floor((Date.now() - gameStartTime) / 1000)

    // Use upsert to handle both insert and update cases
    const { error } = await supabase
      .from("potion_game_progress")
      .upsert({
        student_id: user.id,
        ...updates,
        last_played_at: new Date().toISOString(),
        total_time_played: timePlayedSeconds
      }, {
        onConflict: 'student_id'
      })

    if (error) {
      console.error("Error updating potion game progress:", error)
    }
  }

  // Mark tutorial as seen when user completes it
  const markTutorialAsSeen = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase
      .from("potion_game_progress")
      .update({ has_seen_tutorial: true })
      .eq("student_id", user.id)

    if (error) {
      console.error("Error updating tutorial status:", error)
    }
  }

  // Tutorial dialogue lines
  const instructionDialogues = [
    "Hey there, adventurer! Welcome to Squeaks Emporium: Cauldron Corner. I'm Squeaks! Let's brew some magical fractions!",
    "Check the Recipe Scroll — it shows how much Pink Powder 🌸 and Blue Crystals 💎 you need.",
    "Use the Magic Ladles to scoop the right fractions — ½, ⅓, ¼, and more! Drop them into the cauldron to start mixing.",
    "Need to add more? Use multiple ladles!",
    "Oops, too much? Don't worry! Use Mystic Water 💧 to subtract Pink Powder, or Green Blob 🟢 to subtract Blue Crystals.",
    "Sometimes the potion starts with too much! That's a Dilution Challenge — fix it with the diluters!",
    "Match the fractions perfectly and your potion will sparkle! Ready to start measuring?"
  ]

  // Handle dialogue progression and interactive tutorial
  const handleDialogueProgress = () => {
    // For interactive tutorials, check if the recipe is complete
    if (currentDialogueIndex === 3 && interactiveTutorialRecipe) {
      // Addition tutorial - check if recipe is complete
      if (!checkTutorialRecipe()) {
        return // Don't advance if not complete
      }
      setInteractiveTutorialRecipe(null)
      setCauldronContents([])
      setHideDialogueForInteraction(false)
    } else if (currentDialogueIndex === 4 && interactiveTutorialRecipe) {
      // Subtraction tutorial - check if recipe is complete
      if (!checkTutorialRecipe()) {
        return // Don't advance if not complete
      }
      setInteractiveTutorialRecipe(null)
      setCauldronContents([])
      setHideDialogueForInteraction(false)
    }

    if (currentDialogueIndex < instructionDialogues.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1)
      
      // Set up interactive tutorial recipes
      if (currentDialogueIndex === 2) {
        // Dialogue 3: Addition tutorial - using 2/5 and 1/2
        setInteractiveTutorialRecipe({
          pinkAmount: simplifyFraction({ numerator: 2, denominator: 5 }),
          blueAmount: simplifyFraction({ numerator: 1, denominator: 2 })
        })
        setCauldronContents([])
        setGameStatus("playing")
        // Don't hide dialogue yet - wait for user to click "Try it yourself"
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
        // Don't hide dialogue yet - wait for user to click "Try it yourself"
      }
    } else {
      // Tutorial completed, start the game
      setShowInstructions(false)
      setTutorialMode(false)
      setInteractiveTutorialRecipe(null)
      markTutorialAsSeen() // Mark tutorial as seen in database
      generateNewRecipe()
    }
  }

  // Check if tutorial recipe is complete
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
    const randomFraction1 = TARGET_FRACTIONS[Math.floor(Math.random() * TARGET_FRACTIONS.length)]
    const randomFraction2 = TARGET_FRACTIONS[Math.floor(Math.random() * TARGET_FRACTIONS.length)]
    
    // Ensure the fractions are different for more variety
    let attempts = 0
    let fraction2 = randomFraction2
    while (fraction2.numerator === randomFraction1.numerator && 
           fraction2.denominator === randomFraction1.denominator && 
           attempts < 10) {
      fraction2 = TARGET_FRACTIONS[Math.floor(Math.random() * TARGET_FRACTIONS.length)]
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
      const newScore = score + 10
      setScore(newScore)
      
      // Update streak
      const newStreak = currentStreak + 1
      setCurrentStreak(newStreak)
      
      // Update potions brewed count
      const newPotionsBrewedCount = potionsBrewedCount + 1
      setPotionsBrewedCount(newPotionsBrewedCount)
      
      // Check if this is a new high score or longest streak
      const newHighScore = Math.max(newScore, highScore)
      const newLongestStreak = Math.max(newStreak, longestStreak)
      
      if (newHighScore > highScore) {
        setHighScore(newHighScore)
      }
      if (newLongestStreak > longestStreak) {
        setLongestStreak(newLongestStreak)
      }
      
      // Update progress in database
      updateProgress({
        total_score: newScore,
        potions_brewed: newPotionsBrewedCount,
        perfect_potions: newPotionsBrewedCount, // All completed potions are perfect
        current_streak: newStreak,
        highest_streak: newLongestStreak,
        highest_score: newHighScore
      })
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
    
    // Reset streak on failure
    setCurrentStreak(0)
    
    // Update failed attempts in database
    updateProgress({
      failed_attempts: 1, // Increment by 1
      current_streak: 0
    })
  }

  const fractionToString = (fraction: Fraction) => `${fraction.numerator}/${fraction.denominator}`

  // Get current recipe (either interactive tutorial or main game)
  const currentRecipe = interactiveTutorialRecipe || recipe

  // Show loading state while checking tutorial status
  if (isLoadingTutorialStatus) {
    return (
      <div className="relative h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden flex items-center justify-center" 
           style={{ backgroundImage: "url('/potion-assets/BG_Potion.png')" }}>
        <div className="bg-gray-900 bg-opacity-95 border-4 border-amber-800 rounded-lg p-8 text-center">
          <p className="text-xl font-pixel text-amber-100">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Inject glow effect styles */}
      <style dangerouslySetInnerHTML={{ __html: glowStyles }} />
      
      <div className="relative h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden" 
           style={{ backgroundImage: "url('/potion-assets/BG_Potion.png')" }}>
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Content Container */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col">
        {/* Top Navigation - Only show when not in tutorial mode */}
        {!tutorialMode && (
          <div className="relative flex items-center mb-3 w-full min-h-[60px]">
            {/* Left Side - High Scores */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex gap-2">
              {/* High Score */}
              <div className="bg-black/70 backdrop-blur-md border-2 border-purple-600/50 rounded-xl p-3 shadow-2xl flex flex-col items-center justify-center min-w-[140px]">
                <div className="text-purple-300 text-sm font-pixel mb-1">👑 High Score</div>
                <div className="font-pixel text-2xl font-bold text-purple-400">
                  {highScore}
                </div>
              </div>

              {/* Longest Streak */}
              <div className="bg-black/70 backdrop-blur-md border-2 border-pink-600/50 rounded-xl p-3 shadow-2xl flex flex-col items-center justify-center min-w-[140px]">
                <div className="text-pink-300 text-sm font-pixel mb-1">🏆 Best Streak</div>
                <div className="font-pixel text-2xl font-bold text-pink-400">
                  {longestStreak}
                </div>
              </div>
            </div>

            {/* Center Title and Score */}
            <div className="flex justify-center w-full gap-4">
              {/* Main Game Info */}
              <div className="bg-black/70 backdrop-blur-md border-2 border-amber-600/50 rounded-xl p-3 shadow-2xl">
                <h1 className="text-2xl font-pixel text-amber-200 mb-1 text-center tracking-wider">Potion Master</h1>
                <p className="text-amber-100 text-sm font-pixel text-center mb-1">Fraction Measuring Game</p>
                <div className="text-yellow-400 font-bold font-pixel text-lg text-center">Score: {score}</div>
              </div>

              {/* Streak Counter */}
              <div className="bg-black/70 backdrop-blur-md border-2 border-amber-600/50 rounded-xl p-3 shadow-2xl flex flex-col items-center justify-center min-w-[140px]">
                <div className="text-amber-200 text-sm font-pixel mb-1">🔥 Streak</div>
                <div className={`font-pixel text-3xl font-bold transition-all ${
                  currentStreak >= 5 ? 'text-orange-400 animate-pulse' : 
                  currentStreak >= 3 ? 'text-yellow-400' : 
                  'text-amber-100'
                }`}>
                  {currentStreak}
                </div>
                {currentStreak >= 3 && (
                  <div className="text-xs font-pixel text-green-400 mt-1">On Fire!</div>
                )}
              </div>

              {/* Potions Brewed Counter */}
              <div className="bg-black/70 backdrop-blur-md border-2 border-amber-600/50 rounded-xl p-3 shadow-2xl flex flex-col items-center justify-center min-w-[140px]">
                <div className="text-amber-200 text-sm font-pixel mb-1">🧪 Brewed</div>
                <div className="font-pixel text-3xl font-bold text-green-400">
                  {potionsBrewedCount}
                </div>
              </div>
            </div>

            {/* All Buttons - Right Side */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex gap-2">
              {/* Exit Button */}
              <Button
                variant="outline"
                size="icon"
                asChild
                className="font-pixel border-amber-600 text-amber-200 bg-black/50 hover:bg-amber-600 hover:text-black hover:border-amber-600"
                title="Exit Potion Master"
              >
                <a href="/student/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </a>
              </Button>
              {/* Reset Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={resetGame}
                className="font-pixel border-amber-600 text-amber-200 bg-black/50 hover:bg-red-600 hover:text-white hover:border-red-600"
                title="Reset Game"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              {/* New Recipe Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={generateNewRecipe}
                className="font-pixel border-amber-600 text-amber-200 bg-black/50 hover:bg-green-600 hover:text-white hover:border-green-600"
                title="New Recipe"
              >
                <Scroll className="h-4 w-4" />
              </Button>
              
              {/* Help Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setShowInstructions(true)
                  setTutorialMode(true)
                  setCurrentDialogueIndex(0)
                }}
                className="font-pixel border-amber-600 text-amber-200 bg-black/50 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                title="Instructions"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              
              {/* Leaderboard Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowLeaderboard(true)}
                className="font-pixel border-amber-600 text-amber-200 bg-black/50 hover:bg-purple-600 hover:text-white hover:border-purple-600"
                title="View Leaderboard"
              >
                <Crown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-start space-y-1 overflow-visible">

        {/* Middle Section - Dynamic Responsive Layout */}
        <div className="flex items-stretch justify-center gap-2 w-full max-w-6xl min-h-0 flex-1">
          {/* Magic Ladles - Left side */}
          <div className="flex-shrink-0 flex justify-center items-center" style={{ minWidth: '340px', maxWidth: '440px' }}>
            <div className="relative" style={{ width: '400px', height: '400px' }}>
              <Image
                src="/dashboard/container.png"
                alt="Magic Ladles Container"
                width={900}
                height={1080}
                className="transform rotate-90 opacity-95"
                style={{ width: '400px', height: '400px', objectFit: 'contain' }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <h3 className="text-lg font-bold font-pixel text-amber-200 mb-4 text-center drop-shadow-lg">Magic Ladles</h3>
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  {LADLE_FRACTIONS.map((fraction, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, fraction)}
                      className="relative cursor-grab active:cursor-grabbing transition-all transform hover:scale-110 shadow-lg hover:shadow-2xl w-16 h-16 flex items-center justify-center"
                    >
                      <Image
                        src="/potion-assets/ladle.png"
                        alt="Magic Ladle"
                        width={48}
                        height={48}
                        className="w-full h-auto drop-shadow-lg"
                        style={{ transform: 'rotate(18deg)' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white font-bold text-sm font-pixel drop-shadow-lg bg-black/70 rounded-lg px-1 py-0.5 border border-amber-600/50">
                          {fractionToString(fraction)}
                        </div>
                      </div>
                      {/* Show ingredient emoji in the center of ladle bowl if picked up */}
                      {draggedItem?.fraction === fraction && draggedItem.ingredient && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 pointer-events-none">
                          <div className="text-base drop-shadow-lg">
                            {draggedItem.ingredient === 'pink' ? '🌸' : 
                             draggedItem.ingredient === 'blue' ? '💎' : 
                             draggedItem.ingredient === 'green' ? '🟢' :
                             '💧'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center Section - Cauldron with Target Above */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            {/* Target Fractions Display - Positioned above cauldron */}
            <div className="mb-4 bg-black/80 rounded-xl p-4 border-2 border-amber-600/50 shadow-xl">
              <div className="text-amber-200 text-base text-center font-pixel">
                <div className="text-amber-300 text-lg mb-2">Target Recipe</div>
                <div className="text-pink-300 text-base mb-1">🌸 {fractionToString(currentRecipe.pinkAmount)}</div>
                <div className="text-blue-300 text-base">💎 {fractionToString(currentRecipe.blueAmount)}</div>
              </div>
            </div>

            {/* Cauldron */}
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
                className="w-full h-full object-contain drop-shadow-2xl"
              />

              {/* Cauldron Contents */}
              <div className="absolute inset-10 flex items-center justify-center">
                <div className="text-center text-white text-lg drop-shadow-lg">
                  {cauldronContents.length === 0 && (
                    <div className="bg-amber-800/80 border border-amber-600 rounded-lg p-3">
                      <div className="text-amber-200 font-pixel font-bold text-sm mb-1">Brewing Cauldron</div>
                      <div className="text-amber-300 font-pixel text-xs">Drag ingredients with ladles here!</div>
                    </div>
                  )}
                  {cauldronContents.length > 0 && (
                    <div className="max-h-40 overflow-y-auto">
                      {(() => {
                        const pinkItems = cauldronContents.filter(c => c.ingredient === 'pink')
                        const blueItems = cauldronContents.filter(c => c.ingredient === 'blue')
                        
                        const calculateTotal = (items: typeof pinkItems) => {
                          if (items.length === 0) return { numerator: 0, denominator: 1 }
                          
                          // Find common denominator
                          const denominators = items.map(c => c.fraction.denominator)
                          const lcm = denominators.reduce((acc, val) => {
                            const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                            return (acc * val) / gcd(acc, val)
                          })
                          
                          // Sum numerators with common denominator
                          const totalNumerator = items.reduce((sum, item) => {
                            return sum + (item.fraction.numerator * lcm / item.fraction.denominator)
                          }, 0)
                          
                          // Simplify fraction
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
                          <div className="w-full max-w-xs">
                            {pinkItems.length > 0 && (
                              <div className="mb-2 bg-pink-800 border border-pink-500 rounded p-2">
                                <div className="text-center">
                                  <div className="text-pink-200 font-pixel font-bold text-xs mb-1">
                                    🌸 Pink Powder: {pinkTotal.denominator === 1 ? pinkTotal.numerator : fractionToString(pinkTotal)}
                                  </div>
                                  <div className="text-xs text-pink-300 font-pixel">
                                    ({pinkItems.map(item => fractionToString(item.fraction)).join(" + ")})
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {blueItems.length > 0 && (
                              <div className="mb-2 bg-blue-800 border border-blue-500 rounded p-2">
                                <div className="text-center">
                                  <div className="text-blue-200 font-pixel font-bold text-xs mb-1">
                                    💎 Blue Crystals: {blueTotal.denominator === 1 ? blueTotal.numerator : fractionToString(blueTotal)}
                                  </div>
                                  <div className="text-xs text-blue-300 font-pixel">
                                    ({blueItems.map(item => fractionToString(item.fraction)).join(" + ")})
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {pinkItems.length === 0 && blueItems.length === 0 && (
                              <div className="text-center bg-amber-800 border border-amber-600 rounded p-2">
                                <div className="text-amber-200 text-xs font-pixel">Drop ingredients here!</div>
                              </div>
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

          {/* Recipe Scroll - Right side */}
          <div className="flex-shrink-0 flex justify-center items-center" style={{ minWidth: '340px', maxWidth: '440px' }}>
            <div className="relative" style={{ width: '400px', height: '400px' }}>
              <Image
                src="/dashboard/scroll.png"
                alt="Recipe Scroll"
                width={380}
                height={450}
                className="transform -rotate-90 opacity-95"
                style={{ width: '400px', height: '400px', objectFit: 'contain' }}
              />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="text-center w-full flex flex-col items-center justify-center ml-3">
                  <h3 className="text-amber-800 font-bold font-pixel text-base mb-3 drop-shadow-lg">Recipe Scroll</h3>
                  <div className="space-y-2 flex flex-col items-center">
                    {questionType === "addition" ? (
                      <>
                        <p className="text-amber-700 font-semibold font-pixel text-xs">Magic Potion Recipe:</p>
                        <div className="bg-pink-100/80 rounded-lg p-1.5 border-2 border-pink-300">
                          <p className="text-pink-700 font-bold font-pixel text-xs">
                            Mix {fractionToString(currentRecipe.pinkAmount)} of Pink Powder 🌸
                          </p>
                        </div>
                        <div className="bg-blue-100/80 rounded-lg p-1.5 border-2 border-blue-300">
                          <p className="text-blue-700 font-bold font-pixel text-xs">
                            Mix {fractionToString(currentRecipe.blueAmount)} of Blue Crystals 💎
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-amber-700 font-semibold font-pixel text-sm">Dilution Challenge:</p>
                        <div className="bg-red-100/80 rounded-lg p-2 border-2 border-red-300">
                          <p className="text-red-700 font-bold font-pixel text-xs mb-1">
                            Too much in the cauldron!
                          </p>
                        </div>
                        <div className="bg-pink-100/80 rounded-lg p-2 border-2 border-pink-300">
                          <p className="text-pink-700 font-bold font-pixel text-xs">
                            Target: {fractionToString(currentRecipe.pinkAmount)} Pink Powder 🌸
                          </p>
                        </div>
                        <div className="bg-blue-100/80 rounded-lg p-2 border-2 border-blue-300">
                          <p className="text-blue-700 font-bold font-pixel text-xs">
                            Target: {fractionToString(currentRecipe.blueAmount)} Blue Crystals 💎
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Ingredient Bowls */}
        {(currentDialogueIndex >= 2 || !tutorialMode) && (
          <div className="flex justify-center gap-14 mt-4">
            <h3 className="sr-only">Ingredient Collection Area</h3>

            {/* Water Bowl - Diluter */}
            <div 
              className={`p-4 text-center shadow-2xl w-32 rounded-xl transition-all cursor-pointer transform hover:scale-110 border-2 relative ${
                draggedItem && !draggedItem.ingredient ? 'hover:bg-cyan-500/20 border-dashed border-cyan-400 glow-cyan' : 
                draggedItem?.ingredient === 'water' ? 'bg-cyan-500/30 border-solid border-cyan-400 glow-cyan' : 
                'border-cyan-600/30 bg-black/50 backdrop-blur-md hover:bg-cyan-500/10'
              }`}
              onDragOver={(e) => {
                handleDragOver(e)
                handleIngredientHover(e, 'water')
              }}
            >
              {/* Diluter Tag */}
              <div className="absolute top-3 left-3 bg-red-600 text-white font-pixel px-1 py-0.5 rounded shadow-lg border border-red-800 z-10 transform -rotate-[35deg] origin-center -translate-x-1/2 -translate-y-1/2">
                <div className="text-[9px] leading-tight">Diluter</div>
              </div>
              <Image
                src="/potion-assets/mystic_water.png"
                alt="Mystic Water"
                width={64}
                height={82}
                className="mx-auto mb-2 drop-shadow-lg"
              />
              <div className="text-cyan-100 font-bold font-pixel text-xs">Mystic</div>
              <div className="text-cyan-100 font-bold font-pixel text-xs">Water</div>
              <div className="text-cyan-200 text-lg">💧</div>
            </div>

            {/* Green Blob Bowl - Diluter */}
            <div 
              className={`p-4 text-center shadow-2xl w-32 rounded-xl transition-all cursor-pointer transform hover:scale-110 border-2 relative ${
                draggedItem && !draggedItem.ingredient ? 'hover:bg-green-500/20 border-dashed border-green-400 glow-green' : 
                draggedItem?.ingredient === 'green' ? 'bg-green-500/30 border-solid border-green-400 glow-green' : 
                'border-green-600/30 bg-black/50 backdrop-blur-md hover:bg-green-500/10'
              }`}
              onDragOver={(e) => {
                handleDragOver(e)
                handleIngredientHover(e, 'green')
              }}
            >
              {/* Diluter Tag */}
              <div className="absolute top-3 left-3 bg-red-600 text-white font-pixel px-1 py-0.5 rounded shadow-lg border border-red-800 z-10 transform -rotate-[35deg] origin-center -translate-x-1/2 -translate-y-1/2">
                <div className="text-[9px] leading-tight">Diluter</div>
              </div>
              <Image
                src="/potion-assets/green_slime.png"
                alt="Green Blob"
                width={64}
                height={82}
                className="mx-auto mb-2 drop-shadow-lg"
              />
              <div className="text-green-100 font-bold font-pixel text-xs">Green</div>
              <div className="text-green-100 font-bold font-pixel text-xs">Blob</div>
              <div className="text-green-200 text-lg">🟢</div>
            </div>

            {/* Pink Powder Bowl - Concentrate */}
            <div 
              className={`p-4 text-center shadow-2xl w-32 rounded-xl transition-all cursor-pointer transform hover:scale-110 border-2 relative ${
                draggedItem && !draggedItem.ingredient ? 'hover:bg-pink-500/20 border-dashed border-pink-400 glow-pink' : 
                draggedItem?.ingredient === 'pink' ? 'bg-pink-500/30 border-solid border-pink-400 glow-pink' : 
                'border-pink-600/30 bg-black/50 backdrop-blur-md hover:bg-pink-500/10'
              }`}
              onDragOver={(e) => {
                handleDragOver(e)
                handleIngredientHover(e, 'pink')
              }}
            >
              {/* Concentrate Tag */}
              <div className="absolute top-3 left-3 bg-green-600 text-white font-pixel px-1 py-0.5 rounded shadow-lg border border-green-800 z-10 transform -rotate-[35deg] origin-center -translate-x-1/2 -translate-y-1/2">
                <div className="text-[9px] leading-tight">Concentrate</div>
              </div>
              <Image
                src="/potion-assets/pink_powder.png"
                alt="Pink Powder"
                width={64}
                height={82}
                className="mx-auto mb-2 drop-shadow-lg"
              />
              <div className="text-pink-100 font-bold font-pixel text-xs">Pink</div>
              <div className="text-pink-100 font-bold font-pixel text-xs">Powder</div>
              <div className="text-pink-200 text-lg">🌸</div>
            </div>

            {/* Blue Crystals Bowl - Concentrate */}
            <div 
              className={`p-4 text-center shadow-2xl w-32 rounded-xl transition-all cursor-pointer transform hover:scale-110 border-2 relative ${
                draggedItem && !draggedItem.ingredient ? 'hover:bg-blue-500/20 border-dashed border-blue-400 glow-blue' : 
                draggedItem?.ingredient === 'blue' ? 'bg-blue-500/30 border-solid border-blue-400 glow-blue' : 
                'border-blue-600/30 bg-black/50 backdrop-blur-md hover:bg-blue-500/10'
              }`}
              onDragOver={(e) => {
                handleDragOver(e)
                handleIngredientHover(e, 'blue')
              }}
            >
              {/* Concentrate Tag */}
              <div className="absolute top-3 left-3 bg-green-600 text-white font-pixel px-1 py-0.5 rounded shadow-lg border border-green-800 z-10 transform -rotate-[35deg] origin-center -translate-x-1/2 -translate-y-1/2">
                <div className="text-[9px] leading-tight">Concentrate</div>
              </div>
              <Image
                src="/potion-assets/blue_crystal.png"
                alt="Blue Crystals"
                width={64}
                height={82}
                className="mx-auto mb-2 drop-shadow-lg"
              />
              <div className="text-blue-100 font-bold font-pixel text-xs">Blue</div>
              <div className="text-blue-100 font-bold font-pixel text-xs">Crystal</div>
              <div className="text-blue-200 text-lg">💎</div>
            </div>
          </div>
        )}

      </div>

      {/* Game Status Overlays */}
      {!tutorialMode && gameStatus === "success" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="relative bg-gray-900 bg-opacity-95 border-4 border-amber-800 rounded-lg p-12 text-center shadow-2xl max-w-lg animate-in zoom-in-95 duration-500">
            {/* Success icon */}
            <div className="mb-4 text-8xl">🎉</div>
            
            {/* Title */}
            <p className="text-6xl font-pixel font-bold mb-6 text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Perfect Potion!
            </p>
            
            {/* Success message */}
            <p className="text-xl font-pixel mb-6 text-amber-100">You measured the fractions correctly!</p>
            
            {/* Score display */}
            <div className="bg-amber-900/40 rounded-lg px-6 py-3 mb-8 inline-block border-2 border-amber-700">
              <p className="text-2xl font-pixel font-bold text-yellow-400">+10 Points! 🏆</p>
            </div>
            
            {/* Button */}
            <Button 
              onClick={generateNewRecipe} 
              className="font-pixel bg-amber-800 hover:bg-amber-700 text-white px-10 py-5 text-xl rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-amber-600 active:scale-95"
            >
              Brew Another Potion 🧪
            </Button>
          </div>
        </div>
      )}
      
      {!tutorialMode && gameStatus === "error" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-12 rounded-2xl text-center shadow-2xl border-4 border-red-400">
            <p className="text-5xl font-pixel font-bold mb-6 text-red-100 drop-shadow-lg">❌ Wrong Measurements!</p>
            <p className="text-xl font-pixel mb-8 text-red-200">Check the recipe and use the correct ladle sizes</p>
            <Button 
              onClick={resetGame} 
              className="font-pixel bg-red-800 hover:bg-red-900 text-white px-8 py-4 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Try Again 🔄
            </Button>
          </div>
        </div>
      )}

      {/* Tutorial Success Overlay */}
      {interactiveTutorialRecipe && gameStatus === "success" && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 cursor-pointer animate-in fade-in duration-300"
          onClick={() => {
            setHideDialogueForInteraction(false)
            handleDialogueProgress()
          }}
        >
          <div className="relative bg-gray-900 bg-opacity-95 border-4 border-amber-800 rounded-lg p-10 text-center shadow-2xl max-w-md animate-in zoom-in-95 duration-500">
            {/* Success icon */}
            <div className="mb-4 text-7xl">🎉</div>
            
            {/* Title */}
            <p className="text-5xl font-pixel font-bold mb-6 text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Perfect!
            </p>
            
            {/* Description */}
            <p className="text-xl font-pixel mb-6 text-amber-100">You got the recipe right!</p>
            
            {/* Click indicator */}
            <div className="mt-4 bg-amber-900/40 rounded-lg px-4 py-2 inline-block border-2 border-amber-700">
              <p className="text-sm font-pixel text-amber-300">Click anywhere to continue</p>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Dialogue Modal with Squeaks */}
      {tutorialMode && showInstructions && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Squeaks character image - always visible during tutorial */}
          <img
            src="/game characters/Squeaks.png"
            alt="Squeaks"
            style={{
              imageRendering: "pixelated",
              filter: "drop-shadow(0 0 12px #000)",
              transform: "scaleX(-1)",
              left: "12%",
              bottom: "1%",
              position: "absolute",
              width: "200px",
              height: "200px",
              zIndex: 51
            }}
            className="pointer-events-none"
          />
          
          {/* Dialogue box - hide during interaction */}
          {!hideDialogueForInteraction && (
            <div 
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-90 border-4 border-amber-800 rounded-lg p-4 w-full max-w-2xl mx-auto z-50 cursor-pointer pointer-events-auto" 
              onClick={() => {
                // If it's an interactive tutorial and user hasn't started yet, hide the dialogue
                if (interactiveTutorialRecipe && !checkTutorialRecipe()) {
                  setHideDialogueForInteraction(true)
                } else {
                  handleDialogueProgress()
                }
              }}
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
                  <div className="text-green-400 text-xs">Great! Click to continue</div>
                ) : interactiveTutorialRecipe ? (
                  <div className="text-amber-400 text-xs">Try it yourself!</div>
                ) : (
                  <div className="text-amber-400 text-xs">▼ Click to continue</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
      
      {/* Leaderboard Modal */}
      <PotionLeaderboardModal 
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
    </>
  )
}
