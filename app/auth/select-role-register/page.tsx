"use client"

import { useRouter } from "next/navigation"
import { BookRoleSelector } from "@/components/auth/book-role-selector"

export default function SelectRoleRegisterPage() {
  const router = useRouter()

  const handleRoleSelect = (roleId: number) => {
    // Navigate to the registration page with the selected role
    router.push(`/auth/register?role=${roleId}`)
  }

  return (
    <div className="min-h-screen bg-[#8B3734] flex items-center justify-center p-4">
      <BookRoleSelector onRoleSelect={handleRoleSelect} />
    </div>
  )
}
