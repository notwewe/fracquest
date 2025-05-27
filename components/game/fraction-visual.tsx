import Image from "next/image"

interface FractionVisualProps {
  numerator: number
  denominator: number
  type: "cheese" | "potion" | "pie"
}

export function FractionVisual({ numerator, denominator, type }: FractionVisualProps) {
  // Determine which visual to use
  const getVisualSrc = () => {
    if (type === "cheese") {
      if (numerator === denominator) return "/pixel-items/cheese-wheel-whole.png"
      if (numerator === denominator / 2) return "/pixel-items/cheese-wheel-half.png"
      return "/pixel-items/cheese-wheel-quarters.png"
    } else if (type === "potion") {
      return "/pixel-items/fraction-potion.png"
    } else {
      return "/pixel-items/pie-whole.png"
    }
  }

  // Calculate if this is a proper or improper fraction
  const isImproper = numerator > denominator
  const wholeNumber = Math.floor(numerator / denominator)
  const remainingNumerator = numerator % denominator

  return (
    <div className="bg-gray-900 p-4 rounded-lg flex flex-col items-center">
      <div className="mb-4 flex items-center justify-center">
        {isImproper && wholeNumber > 0 && <div className="text-white text-2xl mr-2">{wholeNumber}</div>}
        <div className="flex flex-col items-center">
          <div className="text-white text-2xl">{isImproper ? remainingNumerator : numerator}</div>
          <div className="w-full h-0.5 bg-white my-1"></div>
          <div className="text-white text-2xl">{denominator}</div>
        </div>
      </div>

      <div className="relative w-24 h-24 flex items-center justify-center">
        <Image
          src={getVisualSrc() || "/placeholder.svg"}
          alt={`${numerator}/${denominator} visual representation`}
          width={96}
          height={96}
          className="object-contain"
        />

        {type === "potion" && (
          <div
            className="absolute inset-0 bg-blue-500 opacity-50"
            style={{
              height: `${(numerator / denominator) * 100}%`,
              top: "auto",
            }}
          ></div>
        )}
      </div>

      <div className="mt-4 text-white text-center">
        {isImproper ? `${wholeNumber} ${remainingNumerator}/${denominator}` : `${numerator}/${denominator}`}
      </div>
    </div>
  )
}
