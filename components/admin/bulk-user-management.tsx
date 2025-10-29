"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function BulkUserManagement() {
  const [emailList, setEmailList] = useState("")
  const [role, setRole] = useState<number>(1) // Default to student
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ success: string[]; errors: string[] }>({
    success: [],
    errors: [],
  })
  const [showResults, setShowResults] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setShowResults(false)

    // Parse emails (split by commas, newlines, or spaces)
    const emails = emailList
      .split(/[\s,]+/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0)

    const successEmails: string[] = []
    const errorEmails: string[] = []

    // This is a mock implementation since we can't actually create users in bulk
    // In a real implementation, you would use admin APIs to create users
    for (const email of emails) {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 200))

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error("Invalid email format")
        }

        // Randomly succeed or fail for demo purposes
        if (Math.random() > 0.2) {
          successEmails.push(email)
        } else {
          throw new Error("Random error")
        }
      } catch (error) {
        errorEmails.push(email)
      }
    }

    setResults({
      success: successEmails,
      errors: errorEmails,
    })

    setLoading(false)
    setShowResults(true)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Bulk User Management</CardTitle>
            <CardDescription>
              Create multiple user accounts at once by providing a list of email addresses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">User Role</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 1}
                      onChange={() => setRole(1)}
                      className="h-4 w-4"
                    />
                    <span>Student</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 2}
                      onChange={() => setRole(2)}
                      className="h-4 w-4"
                    />
                    <span>Teacher</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email Addresses</label>
                <Textarea
                  value={emailList}
                  onChange={(e) => setEmailList(e.target.value)}
                  placeholder="Enter email addresses (separated by commas, spaces, or new lines)"
                  rows={6}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Example: user1@example.com, user2@example.com, user3@example.com
                </p>
              </div>

              <Button type="submit" disabled={loading || !emailList.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Create Users"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {showResults && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>Summary of the bulk user creation process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.success.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Successfully Created ({results.success.length})
                  </h3>
                  <ul className="mt-2 text-sm space-y-1">
                    {results.success.map((email, index) => (
                      <motion.li
                        key={email}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-muted-foreground"
                      >
                        {email}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {results.errors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Failed ({results.errors.length})
                  </h3>
                  <ul className="mt-2 text-sm space-y-1">
                    {results.errors.map((email, index) => (
                      <motion.li
                        key={email}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-muted-foreground"
                      >
                        {email}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Note: This is a simulated demonstration. In a production environment, you would need admin privileges to
                create users in bulk.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
