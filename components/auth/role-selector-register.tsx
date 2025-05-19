"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"

export function RoleSelectorRegister() {
  const router = useRouter()

  const handleRoleSelect = (roleId: number) => {
    router.push(`/auth/register?role=${roleId}`)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-[#323232] font-blaka text-[2vw] mb-[2vh] transform -rotate-3">Choose Your Role</h2>

      <div className="space-y-4">
        <button
          onClick={() => handleRoleSelect(1)}
          className="w-full bg-[#e3c17d] hover:bg-[#d3b16d] text-[#323232] font-blaka text-[1.5vw] py-[1vh] px-[1vw] rounded-[1vw] border-[0.2vw] border-black transition-colors duration-200 transform -rotate-3"
        >
          Student
        </button>

        <button
          onClick={() => handleRoleSelect(2)}
          className="w-full bg-[#e3c17d] hover:bg-[#d3b16d] text-[#323232] font-blaka text-[1.5vw] py-[1vh] px-[1vw] rounded-[1vw] border-[0.2vw] border-black transition-colors duration-200 transform -rotate-3"
        >
          Teacher
        </button>
      </div>

      <div className="text-center transform -rotate-3 mt-[2vh]">
        <Link href="/auth/login" className="text-[#ba4c3c] hover:text-[#a04234] font-blaka text-[1.2vw]">
          Back to Login
        </Link>
      </div>
    </div>
  )
}
