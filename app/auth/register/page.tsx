import { Suspense } from "react"
import { BookRegisterForm } from "@/components/auth/book-register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#8B3734] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white text-xl">Loading registration form...</div>}>
        <BookRegisterForm />
      </Suspense>
    </div>
  )
}
