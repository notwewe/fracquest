"use client"

import { Button } from "@/components/ui/button"

interface RoleSelectorProps {
  onRoleSelect: (roleId: number) => void
}

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-blaka text-[#323232] transform -rotate-3"></h1>

      <div className="space-y-4">
        <Button
          onClick={() => onRoleSelect(1)}
          className="w-full py-4 bg-[#e3c17d] border-2 border-black text-[#323232] font-blaka rounded-[15px] transform -rotate-3 hover:bg-[#d3b16d] transition-colors"
        >
          Student
        </Button>

        <Button
          onClick={() => onRoleSelect(2)}
          className="w-full py-4 bg-[#e3c17d] border-2 border-black text-[#323232] font-blaka rounded-[15px] transform -rotate-3 hover:bg-[#d3b16d] transition-colors"
        >
          Teacher
        </Button>
      </div>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => window.history.back()}
          className="font-blaka text-[#323232] hover:text-[#ba4c3c] transform -rotate-3"
        >
          Go Back
        </Button>
      </div>
    </div>
  )
}
