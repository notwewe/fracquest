import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Trophy, Medal } from "lucide-react"

export default async function StudentLeaderboardPage() {
  const supabase = createClient()

  // Check if user is authenticated and is a student
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if student is enrolled in a class - do this first!
  const { data: studentClass, error: classError } = await supabase
    .from("student_classes")
    .select("class_id, classes(id, name)")
    .eq("student_id", user.id)
    .single()

  if (classError || !studentClass) {
    // Redirect to profile page with message if student isn't in a class
    redirect("/student/profile?message=join-class-required")
  }

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single()

  if (!profile || profile.role_id !== 1) {
    redirect("/auth/login")
  }

  // Get classmates
  const { data: classmates } = await supabase
    .from("student_classes")
    .select(`
student_id,
profiles:student_id (
  id,
  username,
  avatar_url
)
`)
    .eq("class_id", studentClass.class_id)

  // Get progress for all students in the class
  const studentIds = classmates?.map((c) => c.student_id) || []

  let leaderboardData: any[] = []

  if (studentIds.length > 0) {
    // Get all student progress
    const { data: progress } = await supabase
      .from("student_progress")
      .select("student_id, completed, score, mistakes")
      .in("student_id", studentIds)
      .eq("completed", true)

    // Calculate total scores and stats for each student
    const studentScores = studentIds.map((studentId) => {
      const studentProgress = progress?.filter((p) => p.student_id === studentId) || []
      const totalScore = studentProgress.reduce((sum, p) => sum + p.score, 0)
      const totalMistakes = studentProgress.reduce((sum, p) => sum + p.mistakes, 0)
      const completedLevels = studentProgress.length

      const student = classmates?.find((c) => c.student_id === studentId)

      return {
        id: studentId,
        username: student?.profiles.username || "Unknown",
        avatarUrl: student?.profiles.avatar_url,
        totalScore,
        totalMistakes,
        completedLevels,
        isCurrentUser: studentId === user.id,
      }
    })

    // Sort by score (descending)
    leaderboardData = studentScores.sort((a, b) => b.totalScore - a.totalScore)
  }

  // Find current user's rank
  const currentUserRank = leaderboardData.findIndex((student) => student.id === user.id) + 1

  return (
    <div
      className="min-h-screen p-4 overflow-y-auto flex flex-col items-center"
      style={{
        backgroundImage: "url('/dashboard/castle-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Back to Dashboard Button */}
      <div className="absolute top-4 left-4 z-20">
        <Link href="/student/dashboard">
          <div
            className="relative w-64 h-20 cursor-pointer hover:scale-105 transition-transform"
            style={{
              backgroundImage: "url('/dashboard/logout.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: "-4px" }}>
              <span className="text-amber-200 font-bold text-2xl" style={{ fontFamily: "var(--font-blaka)" }}>
                Dashboard
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Leaderboard Title */}
      <h1
        className="text-8xl font-bold text-center mt-8"
        style={{
          fontFamily: "var(--font-blaka)",
          color: "#FFFFFF", // White color
          WebkitTextStroke: "3px #000000", // Black outline (increased thickness)
          textStroke: "3px #000000", // Black outline (for non-webkit browsers)
          textShadow: "4px 4px 8px rgba(0, 0, 0, 0.5)", // Enhanced shadow for better visibility
        }}
      >
        Leaderboard
      </h1>

      {/* Combined Stats and Leaderboard Container with Scroll Background */}
      <div
        className="w-full mt-0 flex flex-col lg:flex-row gap-2 justify-center"
        style={{
          backgroundImage: "url('/dashboard/scroll.png')",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          minHeight: "800px",
          minWidth: "1600px",
          width: "1600px",
          height: "800px",
          paddingTop: "120px",
          paddingLeft: "64px",
          paddingRight: "64px",
          paddingBottom: "64px",
        }}
      >
        {/* Left Column: Stats */}
        <div className="w-full p-6 flex flex-col gap-6" style={{ width: "20%" }}>
          {" "}
          {/* Set to 15% width */}
          {/* Class info */}
          <div className="bg-amber-100/70 p-4 rounded-md border border-amber-200">
            <h2 className="text-2xl font-normal mb-2" style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}>
              {studentClass.classes?.name || "Your class"}
            </h2>
            <p className="text-xl font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}>
              {leaderboardData.length} students
            </p>
          </div>
          {/* Your Rank */}
          <div className="bg-amber-100/70 p-4 rounded-md border border-amber-200">
            <div className="flex items-center gap-3">
              <Trophy className="h-10 w-10" style={{ color: "#784D1B" }} />
              <div>
                <p className="text-2xl font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}>
                  Your Rank
                </p>
                <p className="text-4xl font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}>
                  #{currentUserRank}
                </p>
                <p className="text-lg font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}>
                  out of {leaderboardData.length} students
                </p>
              </div>
            </div>
          </div>
          {/* Your Score */}
          <div className="bg-amber-100/70 p-4 rounded-md border border-amber-200">
            <div className="flex items-center gap-3">
              <Medal className="h-10 w-10" style={{ color: "#784D1B" }} />
              <div>
                <p className="text-2xl font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}>
                  Your Score
                </p>
                <p className="text-4xl font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}>
                  {leaderboardData.find((s) => s.id === user.id)?.totalScore || 0}
                </p>
                <p className="text-lg font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}>
                  total points earned
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Leaderboard Table */}
        <div className="w-full p-6" style={{ width: "40%" }}>
          {" "}
          {/* Set to 40% width */}
          <div className="overflow-auto max-h-[650px] rounded-md border border-amber-200">
            {" "}
            {/* Increased max-h from 450px to 650px */}
            <table className="w-full border-collapse" style={{ borderSpacing: 0 }}>
              <thead className="bg-amber-100/70 sticky top-0 z-10">
                <tr>
                  <th
                    className="font-normal text-3xl w-16 px-2 py-3 text-left" // Adjusted font size and width
                    style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}
                  >
                    Rank
                  </th>
                  <th
                    className="font-normal text-3xl pl-2 pr-0 py-3 text-left" // Adjusted font size
                    style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}
                  >
                    Student
                  </th>
                  <th
                    className="font-normal text-3xl text-right w-12 pl-0 pr-2 py-3" // Adjusted font size
                    style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}
                  >
                    Score
                  </th>
                  <th
                    className="font-normal text-3xl text-right w-16 px-2 py-3" // Adjusted font size and width
                    style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}
                  >
                    Levels
                  </th>
                  <th
                    className="font-normal text-3xl text-right w-16 px-2 py-3" // Adjusted font size and width
                    style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}
                  >
                    Mistakes
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((student, index) => (
                  <tr key={student.id} className={student.isCurrentUser ? "bg-amber-100/70" : ""}>
                    <td
                      className="font-normal text-2xl px-2 py-2" // Adjusted font size
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      {index === 0 ? (
                        <Trophy className="h-8 w-8 text-yellow-400" /> // Adjusted icon size
                      ) : index === 1 ? (
                        <Medal className="h-8 w-8 text-slate-400" /> // Adjusted icon size
                      ) : index === 2 ? (
                        <Medal className="h-8 w-8 text-orange-400" /> // Adjusted icon size
                      ) : (
                        `#${index + 1}`
                      )}
                    </td>
                    <td
                      className="font-normal text-2xl pl-2 pr-0 py-2" // Adjusted font size
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      {student.username}
                      {student.isCurrentUser && " (You)"}
                    </td>
                    <td
                      className="text-right font-normal text-2xl pl-0 pr-2 py-2" // Adjusted font size
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      {student.totalScore}
                    </td>
                    <td
                      className="text-right font-normal text-2xl px-2 py-2" // Adjusted font size
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      {student.completedLevels}
                    </td>
                    <td
                      className="text-right font-normal text-2xl px-2 py-2" // Adjusted font size
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      {student.totalMistakes}
                    </td>
                  </tr>
                ))}
                {/* Placeholder rows for testing height with 10 students */}
                {Array.from({ length: Math.max(0, 10 - leaderboardData.length) }).map((_, i) => (
                  <tr key={`placeholder-${i}`}>
                    <td
                      className="font-normal text-2xl px-2 py-2"
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      #{leaderboardData.length + i + 1}
                    </td>
                    <td
                      className="font-normal text-2xl pl-2 pr-0 py-2"
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      Placeholder
                    </td>
                    <td
                      className="text-right font-normal text-2xl pl-0 pr-2 py-2"
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      0
                    </td>
                    <td
                      className="text-right font-normal text-2xl px-2 py-2"
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      0
                    </td>
                    <td
                      className="text-right font-normal text-2xl px-2 py-2"
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      0
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
