import Image from "next/image"
import { RoleSelectorRegister } from "@/components/auth/role-selector-register"

export default function SelectRoleRegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background image - fills the entire viewport */}
      <div className="absolute inset-0 w-full h-full">
        <Image src="/register-book.png" alt="Register Book" fill className="object-cover pixelated" priority />
      </div>

      {/* Responsive container for the form */}
      <div className="relative w-full h-full flex">
        {/* Left half - contains the role selector */}
        <div className="flex items-start justify-end pb-[15vh] pr-[2vw] w-1/2">
          <div className="w-[25vw]">
            <RoleSelectorRegister />
          </div>
        </div>

        {/* Right half - empty */}
        <div className="w-1/2"></div>
      </div>
    </div>
  )
}
