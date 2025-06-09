"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, InfoIcon } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BackgroundSlideshow } from "./background-slideshow"
import { OrientationLock } from "@/components/shared/orientation-lock"
import Image from "next/image"

interface MobileLoginViewProps {
  message?: string | null;
}

export function MobileLoginView({ message }: MobileLoginViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // ... existing login logic ...
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <OrientationLock />
      <BackgroundSlideshow interval={8000} fadeTime={1500} />
      
      {/* Title Container with Book Banner */}
      <div className="relative w-[200px] h-[60px] mb-6 z-20">
        <Image
          src="/auth/header-banner.png"
          alt="Title banner"
          fill
          className="object-contain"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-2xl font-blaka text-[#8B3734]">Login</h1>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-20 w-full max-w-[330px] bg-gradient-to-b from-amber-800/90 to-amber-950/90 rounded-xl backdrop-blur-sm border-2 border-amber-700/50 shadow-xl p-6">
        {/* Alert Messages */}
        {message === "account-deactivated" && (
          <Alert className="mb-4 bg-red-900/50 border border-red-700 backdrop-blur-sm">
            <InfoIcon className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-xs font-blaka text-red-400">
              Account Deactivated
            </AlertTitle>
            <AlertDescription className="text-xs text-red-300">
              Contact administrator for help.
            </AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-blaka text-amber-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-amber-50/10 border-2 border-amber-700/50 rounded text-sm text-amber-100 placeholder:text-amber-300/30 focus:outline-none focus:border-amber-600"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-blaka text-amber-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-amber-50/10 border-2 border-amber-700/50 rounded text-sm text-amber-100 placeholder:text-amber-300/30 focus:outline-none focus:border-amber-600"
              placeholder="Enter your password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 text-sm font-blaka border border-amber-600/50 shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          {/* Links */}
          <div className="pt-4 text-center space-y-2 border-t border-amber-700/30">
            <Link
              href="/auth/register"
              className="block text-xs text-amber-400 hover:text-amber-300 font-blaka"
            >
              Don't have an account? Register
            </Link>
            <Link
              href="/auth/forgot-password"
              className="block text-xs text-amber-400 hover:text-amber-300 font-blaka"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
