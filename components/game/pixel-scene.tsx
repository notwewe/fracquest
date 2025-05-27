import Image from "next/image"
import { DialogueBox } from "./dialogue-box"

interface Character {
  src: string
  alt: string
  position: string
  scale?: number
}

interface Dialog {
  character: string
  text: string
  portrait?: string
}

interface PixelSceneProps {
  backgroundSrc: string
  characters: Character[]
  dialog?: Dialog
  onDialogComplete?: () => void
}

export function PixelScene({ backgroundSrc, characters, dialog, onDialogComplete }: PixelSceneProps) {
  return (
    <div className="relative w-full h-[480px] overflow-hidden rounded-lg border-4 border-amber-900">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={backgroundSrc || "/placeholder.svg"}
          alt="Scene background"
          width={640}
          height={480}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Characters */}
      {characters.map((character, index) => (
        <div
          key={index}
          className={`absolute ${character.position}`}
          style={{ transform: `scale(${character.scale || 1})` }}
        >
          <Image
            src={character.src || "/placeholder.svg"}
            alt={character.alt}
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
      ))}

      {/* Dialog */}
      {dialog && (
        <div className="absolute bottom-0 left-0 right-0">
          <DialogueBox text={dialog.text} characterName={dialog.character} onComplete={onDialogComplete} />
        </div>
      )}
    </div>
  )
}
