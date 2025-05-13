import Image from "next/image"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image with improved responsive handling */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/register-book.png"
          alt="Register Book"
          fill
          className="object-cover md:object-contain lg:object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {/* Responsive container */}
      <div className="relative w-full h-full flex justify-center items-center">
        <div className="w-full max-w-7xl h-full flex flex-col md:flex-row px-4 md:px-6 lg:px-8">
          {/* Left half - contains the register form with responsive adjustments */}
          <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end py-8 md:py-0 md:pr-4 lg:pr-12">
            <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[250px] lg:max-w-[280px]">
              <RegisterForm />
            </div>
          </div>

          {/* Right half - empty but maintained for layout */}
          <div className="hidden md:block md:w-1/2"></div>
        </div>
      </div>
    </div>
  )
}
