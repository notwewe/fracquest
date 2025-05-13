"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckIcon, CopyIcon } from "lucide-react"

interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" className={className} onClick={handleCopy}>
      {copied ? <CheckIcon className="h-4 w-4 mr-2" /> : <CopyIcon className="h-4 w-4 mr-2" />}
      {copied ? "Copied!" : "Copy"}
    </Button>
  )
}
