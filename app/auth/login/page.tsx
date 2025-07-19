"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BookLoginForm } from "@/components/auth/book-login-form"
import { BackgroundSlideshow } from "@/components/auth/background-slideshow"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

function LoginContent() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setMessage(searchParams.get("message"))
  }, [searchParams])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundSlideshow />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {message === "account-deactivated" && (
            <Alert className="mb-6 bg-orange-100 border-orange-400 text-orange-800">
              <InfoIcon className="h-5 w-5" />
              <AlertTitle>Account Deactivated</AlertTitle>
              <AlertDescription>
                Your account has been deactivated. You will not be able to log in. Please contact an administrator if
                you believe this is an error or need to reactivate your account.
              </AlertDescription>
            </Alert>
          )}
          {message === "account-deleted" && (
            <Alert className="mb-6 bg-green-100 border-green-400 text-green-700">
              <InfoIcon className="h-5 w-5" />
              <AlertTitle>Account Deleted</AlertTitle>
              <AlertDescription>Your account has been successfully deleted.</AlertDescription>
            </Alert>
          )}
          <BookLoginForm />
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setMessage(searchParams.get("message"))
  }, [searchParams])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
