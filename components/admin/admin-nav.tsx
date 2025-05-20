"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Home, Users, BookOpen, Settings, Database, BarChart, UserPlus, FileText } from "lucide-react"

export function AdminNav() {
  const pathname = usePathname()

  const links = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: Home,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Bulk User Management",
      href: "/admin/users/bulk",
      icon: UserPlus,
    },
    {
      name: "Classes",
      href: "/admin/classes",
      icon: BookOpen,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
    },
    {
      name: "Database",
      href: "/admin/database",
      icon: Database,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: FileText,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
            pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
          )}
        >
          {pathname === link.href ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-3">
              <link.icon className="h-4 w-4" />
              <span>{link.name}</span>
            </motion.div>
          ) : (
            <>
              <link.icon className="h-4 w-4" />
              <span>{link.name}</span>
            </>
          )}
        </Link>
      ))}
    </nav>
  )
}
