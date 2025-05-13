import { PixelScene } from "@/components/game/pixel-scene"
import { PixelWorldMap } from "@/components/game/pixel-world-map"
import { FractionVisual } from "@/components/game/fraction-visual"
import { PixelMiniGame } from "@/components/game/pixel-mini-game"

// This is a demo page to showcase the pixel art components
export default function PixelGameDemo() {
  const locations = [
    {
      id: "fraction-emporium",
      name: "Fraction Emporium",
      position: "top-1/4 left-1/4",
      icon: "/pixel-items/cheese-wheel-whole.png",
      unlocked: true,
      completed: true,
    },
    {
      id: "lessmore-bridge",
      name: "Lessmore Bridge",
      position: "top-1/3 right-1/3",
      icon: "/pixel-items/fraction-compass.png",
      unlocked: true,
      completed: false,
    },
    {
      id: "fraction-forest",
      name: "Fraction Forest",
      position: "bottom-1/3 left-1/3",
      icon: "/pixel-items/fraction-potion.png",
      unlocked: false,
      completed: false,
    },
    {
      id: "decimal-dungeon",
      name: "Decimal Dungeon",
      position: "bottom-1/4 right-1/4",
      icon: "/pixel-items/fraction-orb-shattered.png",
      unlocked: false,
      completed: false,
    },
  ]

  const conversionGameQuestions = [
    {
      question: "Convert 7/4 to a mixed number",
      options: ["1 1/4", "1 3/4", "2 1/4", "1 2/4"],
      correctIndex: 1,
      visualAid: "/pixel-items/cheese-wheel-quarters.png",
    },
    // Add more questions as needed
  ]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">FracQuest Pixel Art Demo</h1>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Character Scene Example</h2>
        <PixelScene
          backgroundSrc="/pixel-locations/fraction-emporium-interior.png"
          characters={[
            {
              src: "/pixel-characters/whiskers.png",
              alt: "Whiskers the cat",
              position: "bottom-10 left-1/4",
              scale: 1.5,
            },
            {
              src: "/pixel-characters/squeaks.png",
              alt: "Squeaks the mouse",
              position: "bottom-10 right-1/3",
              scale: 1.2,
            },
          ]}
          dialog={{
            character: "Squeaks",
            text: "Welcome to the Fraction Emporium! Ready to learn about the magic of fractions?",
            portrait: "/pixel-characters/squeaks.png",
          }}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">World Map Example</h2>
        <PixelWorldMap locations={locations} currentLocationId="lessmore-bridge" />
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Fraction Visuals Example</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800 p-6 rounded-lg">
          <FractionVisual numerator={3} denominator={4} type="cheese" />
          <FractionVisual numerator={5} denominator={4} type="cheese" />
          <FractionVisual numerator={1} denominator={2} type="potion" />
          <FractionVisual numerator={7} denominator={4} type="cheese" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Mini-Game Example</h2>
        <PixelMiniGame
          title="Convert Fractions"
          background="/pixel-locations/fraction-emporium-interior.png"
          onComplete={(score) => alert(`Game complete! Score: ${score}`)}
          gameType="conversion"
          questions={conversionGameQuestions}
        />
      </section>
    </div>
  )
}
