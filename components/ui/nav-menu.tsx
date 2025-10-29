// If this file exists, update the logout link
// If not, we'll create a simple version

"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, BookOpen, Users, Settings, Map, FlaskConical } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function NavMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <nav className="pixel-border bg-gray-900 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold pixel-text">
          FracQuest
        </Link>
        <div className="space-x-4">
          {/* Add your navigation links here */}
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded pixel-border">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
