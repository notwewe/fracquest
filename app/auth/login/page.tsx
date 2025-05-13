import Image from "next/image"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background image - fills the entire viewport */}
      <div className="absolute inset-0 w-full h-full">
        <Image src="/login-book.png" alt="Login Book" fill className="object-cover" priority />
      </div>

      {/* Responsive container for the form */}
      <div className="relative w-full h-full flex">
        {/* Left half - empty */}
        <div className="w-1/2"></div>

        {/* Right half - contains the login form */}
        <div className="w-1/2 flex items-center justify-start pl-[2vw]">
          <div className="w-[25vw]">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
