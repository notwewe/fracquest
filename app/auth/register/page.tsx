import Image from "next/image"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background image - fills the entire viewport */}
      <div className="absolute inset-0 w-full h-full">
        <Image src="/register-book.png" alt="Register Book" fill className="object-cover pixelated" priority />
      </div>

      {/* Responsive container for the form */}
      <div className="relative w-full h-full flex">
        {/* Left half - contains the register form */}
        <div className="flex item-center justify-end pb-[12vh] pr-[2vw] w-1/2">
          <div className="w-[25vw]">
            <RegisterForm />
          </div>
        </div>

        {/* Right half - empty */}
        <div className="w-1/2"></div>
      </div>
    </div>
  )
}
