"use client"

import { useState } from "react"
import { CharacterSprite } from "@/components/game/character-sprite"
import { GameItem } from "@/components/game/game-item"
import { DialogueBox } from "@/components/game/dialogue-box"
import { GameScene } from "@/components/game/game-scene"

export default function GameDemo() {
  const [dialogueIndex, setDialogueIndex] = useState(0)

  const dialogues = [
    {
      text: "Welcome to Squeaks' Fraction Emporium! Ready to learn about the magic of fractions?",
      speaker: "Squeaks",
      portrait:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=48&width=48&query=pixel%20art%20small%20brown%20mouse%20with%20glasses%20and%20merchant%20apron",
    },
    {
      text: "I've heard this is where math meets magic. I'm trying to learn more about fractions to save the kingdom!",
      speaker: "Whiskers",
      portrait:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=64&width=64&query=pixel%20art%20orange%20cat%20adventurer%20with%20green%20tunic%20and%20small%20backpack",
    },
    {
      text: "Then you've come to the right place! Fractions are all about parts of a whole. Let me show you!",
      speaker: "Squeaks",
      portrait:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=48&width=48&query=pixel%20art%20small%20brown%20mouse%20with%20glasses%20and%20merchant%20apron",
    },
  ]

  const handleNextDialogue = () => {
    if (dialogueIndex < dialogues.length - 1) {
      setDialogueIndex(dialogueIndex + 1)
    } else {
      setDialogueIndex(0) // Loop back to the beginning
    }
  }

  return (
    <div className="p-4 bg-gradient-to-b from-amber-100 to-amber-200 min-h-screen">
      <h1 className="text-2xl font-bold text-amber-900 mb-6 text-center">FracQuest Game Demo</h1>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Character Sprites */}
        <section className="bg-amber-50 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Character Sprites</h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="text-center">
              <CharacterSprite
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=64&width=64&query=pixel%20art%20orange%20cat%20adventurer%20with%20green%20tunic%20and%20small%20backpack"
                alt="Whiskers the Cat"
              />
              <p className="mt-2 text-amber-800">Whiskers</p>
            </div>

            <div className="text-center">
              <CharacterSprite
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=48&width=48&query=pixel%20art%20small%20brown%20mouse%20with%20glasses%20and%20merchant%20apron"
                alt="Squeaks the Mouse"
              />
              <p className="mt-2 text-amber-800">Squeaks</p>
            </div>

            <div className="text-center">
              <CharacterSprite
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=64&width=64&query=pixel%20art%20shadowy%20purple%20ghost%20wizard%20with%20math%20symbols%20floating%20around"
                alt="Decimal Phantom"
              />
              <p className="mt-2 text-amber-800">Decimal Phantom</p>
            </div>

            <div className="text-center">
              <CharacterSprite
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=64&width=64&query=pixel%20art%20stone%20golem%20sage%20with%20glowing%20runes%20and%20wise%20expression"
                alt="Elder Pebble"
              />
              <p className="mt-2 text-amber-800">Elder Pebble</p>
            </div>
          </div>
        </section>

        {/* Game Items */}
        <section className="bg-amber-50 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Game Items</h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="text-center">
              <GameItem
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=64&width=64&query=pixel%20art%20glowing%20blue%20orb%20with%20fraction%20symbols%20inside"
                alt="Fraction Orb"
                interactive
              />
              <p className="mt-2 text-amber-800">Fraction Orb</p>
            </div>

            <div className="text-center">
              <GameItem
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=64&width=64&query=pixel%20art%20golden%20compass%20with%20fraction%20symbols%20and%20magic%20glow"
                alt="Fraction Compass"
                interactive
              />
              <p className="mt-2 text-amber-800">Fraction Compass</p>
            </div>

            <div className="text-center">
              <GameItem
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=48&width=48&query=pixel%20art%20round%20yellow%20cheese%20wheel%20cut%20into%20four%20quarters%20with%20one%20piece%20separated"
                alt="Cheese Wheel"
                interactive
              />
              <p className="mt-2 text-amber-800">Cheese Wheel</p>
            </div>

            <div className="text-center">
              <GameItem
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=48&width=48&query=pixel%20art%20glass%20bottle%20with%20colored%20liquid%20half%20full%20and%20fraction%20symbol%20on%20label"
                alt="Fraction Potion"
                interactive
              />
              <p className="mt-2 text-amber-800">Fraction Potion</p>
            </div>
          </div>
        </section>

        {/* Dialogue Box */}
        <section className="bg-amber-50 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Dialogue Box</h2>
          <DialogueBox
            text={dialogues[dialogueIndex].text}
            speaker={dialogues[dialogueIndex].speaker}
            portrait={dialogues[dialogueIndex].portrait}
            onComplete={handleNextDialogue}
          />
          <p className="mt-4 text-center text-amber-800 text-sm">Click the dialogue box to continue</p>
        </section>

        {/* Game Scene */}
        <section className="bg-amber-50 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Game Scene</h2>
          <GameScene
            backgroundSrc="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=320&width=480&query=pixel%20art%20interior%20of%20magic%20shop%20with%20potions%20cheese%20wheels%20and%20fraction%20symbols%20on%20shelves"
            characters={[
              {
                component: (
                  <CharacterSprite
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=64&width=64&query=pixel%20art%20orange%20cat%20adventurer%20with%20green%20tunic%20and%20small%20backpack"
                    alt="Whiskers"
                  />
                ),
                position: "bottom-10 left-1/4",
              },
              {
                component: (
                  <CharacterSprite
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=48&width=48&query=pixel%20art%20small%20brown%20mouse%20with%20glasses%20and%20merchant%20apron"
                    alt="Squeaks"
                  />
                ),
                position: "bottom-10 right-1/3",
              },
            ]}
            dialogue={{
              text: "Let me show you how fractions work with this cheese wheel!",
              speaker: "Squeaks",
              portrait:
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=48&width=48&query=pixel%20art%20small%20brown%20mouse%20with%20glasses%20and%20merchant%20apron",
            }}
          />
        </section>
      </div>
    </div>
  )
}
