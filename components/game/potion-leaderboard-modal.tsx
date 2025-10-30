"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { X, Trophy, Medal, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LeaderboardEntry {
  id: string
  username: string
  totalScore: number
  potionsBrewedCount: number
  isCurrentUser: boolean
}

interface PotionLeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PotionLeaderboardModal({ isOpen, onClose }: PotionLeaderboardModalProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserRank, setCurrentUserRank] = useState(0)
  const [className, setClassName] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboardData()
    }
  }, [isOpen])

  const fetchLeaderboardData = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      setClassName("Global Leaderboard")

      // Get all potion game progress (global)
      const { data: potionProgress, error: fetchError } = await supabase
        .from("potion_game_progress")
        .select("student_id, highest_score, potions_brewed")
        .gt("highest_score", 0)
        .order("highest_score", { ascending: false })
        .limit(100) // Get top 100 to calculate rank if user is outside top 10

      if (fetchError) {
        console.error("Error fetching potion progress:", fetchError)
        setIsLoading(false)
        return
      }

      if (!potionProgress || potionProgress.length === 0) {
        setIsLoading(false)
        return
      }

      // Get usernames for all students
      const studentIds = potionProgress.map(p => p.student_id)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", studentIds)

      // Create a map of student_id to username
      const usernameMap = new Map(profiles?.map(p => [p.id, p.username]) || [])

      // Calculate scores for each student
      const studentScores: LeaderboardEntry[] = potionProgress.map((progress) => {
        return {
          id: progress.student_id,
          username: usernameMap.get(progress.student_id) || "Unknown",
          totalScore: progress.highest_score || 0,
          potionsBrewedCount: progress.potions_brewed || 0,
          isCurrentUser: progress.student_id === user.id,
        }
      })

      // Find current user's rank
      const rank = studentScores.findIndex((student) => student.id === user.id) + 1
      setCurrentUserRank(rank)

      // Take top 10
      setLeaderboardData(studentScores.slice(0, 10))
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-6 w-6 text-yellow-400" />
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />
    if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />
    return <Trophy className="h-5 w-5 text-amber-700" />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-amber-50 border-4 border-amber-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-b from-amber-700 to-amber-600 p-6 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="absolute top-4 right-4 text-white hover:bg-amber-800/50 z-10"
          >
            <X className="h-6 w-6" />
          </Button>
          <h2 
            className="text-4xl text-center text-white font-bold drop-shadow-lg"
            style={{ 
              fontFamily: "var(--font-blaka)",
              textShadow: "3px 3px 6px rgba(0, 0, 0, 0.8), -1px -1px 0 rgba(0, 0, 0, 0.3)"
            }}
          >
            🏆 Potion Master Leaderboard
          </h2>
          <p className="text-center text-amber-100 mt-2 font-pixel text-lg drop-shadow-md">
            {className}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {isLoading ? (
            <div className="text-center py-8 text-amber-800">
              Loading leaderboard...
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-8 text-amber-800">
              <p className="font-pixel">No potion masters yet!</p>
              <p className="text-sm mt-2">Be the first to brew potions and claim your spot.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboardData.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-500 shadow-xl shadow-yellow-400/50 ring-2 ring-yellow-400/50"
                      : entry.isCurrentUser
                      ? "bg-blue-100 border-blue-500 shadow-lg scale-105"
                      : index === 1
                      ? "bg-gradient-to-r from-gray-100 to-slate-100 border-gray-400"
                      : index === 2
                      ? "bg-gradient-to-r from-orange-100 to-amber-100 border-amber-500"
                      : "bg-amber-50/50 border-amber-300"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(index)}
                  </div>

                  {/* Rank Number */}
                  <div className="text-2xl font-bold text-amber-900 w-8">
                    #{index + 1}
                  </div>

                  {/* Username */}
                  <div className="flex-1">
                    <p 
                      className="text-lg font-bold text-amber-900"
                      style={{ fontFamily: "var(--font-blaka)" }}
                    >
                      {entry.username}
                      {entry.isCurrentUser && (
                        <span className="ml-2 text-sm text-blue-600">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-amber-700">
                      🧪 {entry.potionsBrewedCount} potions brewed
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-900">
                      {entry.totalScore}
                    </p>
                    <p className="text-xs text-amber-700">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current User Rank (if not in top 10) */}
          {currentUserRank > 10 && (
            <div className="mt-6 pt-6 border-t-2 border-amber-300">
              <p className="text-center text-amber-700 font-pixel">
                Your rank: #{currentUserRank}
              </p>
              <p className="text-center text-sm text-amber-600 mt-1">
                Keep brewing to climb the leaderboard!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
