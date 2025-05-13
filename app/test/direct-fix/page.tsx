"use client"

import { DirectFix } from "@/components/game/direct-fix"
import { useRouter } from "next/navigation"

export default function DirectFixTestPage() {
  const router = useRouter()

  const testDialogue = [
    {
      speaker: "Whiskers",
      text: "Whew! That Sorting Table was no joke... but I've got these conversions down now!",
      background: "fraction-emporium-interior",
    },
    {
      speaker: "Squeaks",
      text: "The compass is ancient. Scattered. Broken into pieces that are—quite fittingly—fractions of a whole.",
      background: "fraction-emporium-interior",
    },
    {
      speaker: "Narrator",
      text: "He pulls a glowing gear-shaped fragment from under the counter and inserts it into the door.",
      background: "fraction-emporium-interior",
    },
  ]

  const handleComplete = () => {
    router.push("/")
  }

  return <DirectFix dialogue={testDialogue} onComplete={handleComplete} />
}
