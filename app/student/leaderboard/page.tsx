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
  let currentUserRank = 0
  let allStudentsSorted: any[] = []

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

    // Calculate current user's rank among ALL students before slicing to top 5
    allStudentsSorted = studentScores.sort((a, b) => b.totalScore - a.totalScore)
    currentUserRank = allStudentsSorted.findIndex((student) => student.id === user.id) + 1

    // Sort by score (descending) and take only top 5
    leaderboardData = allStudentsSorted.slice(0, 5)
  }

  // Get current user's score for display
  const currentUserData = allStudentsSorted.find((s) => s.id === user.id)

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
          backgroundSize: "100% 100%", // Make background cover the new smaller dimensions
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          minHeight: "600px", // Reduced height
          minWidth: "1200px", // Reduced width
          width: "1400px", // Reduced width
          height: "600px", // Reduced height
          paddingTop: "80px", // Reduced top padding
          paddingLeft: "48px", // Reduced left padding
          paddingRight: "48px", // Reduced right padding
          paddingBottom: "60px", // Reduced bottom padding
        }}
      >
        {/* Left Column: Stats */}
        <div className="w-full p-4 flex flex-col gap-4" style={{ width: "15%" }}>
          {" "}
          {/* Reduced padding and gap */}
          {/* Class info */}
          <div className="bg-amber-100/70 p-3 rounded-md border-2 border-amber-800">
            {" "}
            {/* Changed border color */}
            <h2 className="text-xl font-normal mb-1" style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}>
              {" "}
              {/* Reduced font size from 2xl to xl */}
              {studentClass.classes?.name || "Your class"}
            </h2>
            <p className="text-lg font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}>
              Top 5 students
            </p>
          </div>
          {/* Your Rank */}
          <div className="bg-amber-100/70 p-3 rounded-md border-2 border-amber-800">
            {" "}
            {/* Changed border color */}
            <div className="flex items-center gap-2">
              {" "}
              {/* Reduced gap */}
              <Trophy className="h-8 w-8" style={{ color: "#784D1B" }} /> {/* Reduced icon size */}
              <div>
                <p className="text-xl font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}>
                  {" "}
                  {/* Reduced font size from 2xl to xl */}
                  Your Rank
                </p>
                <p className="text-3xl font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}>
                  {" "}
                  {/* Reduced font size from 4xl to 3xl */}#{currentUserRank}
                </p>
                <p className="text-base font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}>
                  {" "}
                  {/* Reduced font size from lg to base */}
                  out of {allStudentsSorted.length} students
                </p>
              </div>
            </div>
          </div>
          {/* Your Score */}
          <div className="bg-amber-100/70 p-3 rounded-md border-2 border-amber-800">
            {" "}
            {/* Changed border color */}
            <div className="flex items-center gap-2">
              {" "}
              {/* Reduced gap */}
              <Medal className="h-8 w-8" style={{ color: "#784D1B" }} /> {/* Reduced icon size */}
              <div>
                <p className="text-xl font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}>
                  {" "}
                  {/* Reduced font size from 2xl to xl */}
                  Your Score
                </p>
                <p className="text-3xl font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}>
                  {currentUserData?.totalScore || 0}
                </p>
                <p className="text-base font-normal" style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}>
                  {" "}
                  {/* Reduced font size from lg to base */}
                  total points
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Leaderboard Table */}
        <div className="w-full p-4" style={{ width: "45%" }}>
          {" "}
          {/* Reduced padding */}
          <div className="overflow-auto max-h-[450px] rounded-md border-2 border-amber-800">
            {" "}
            {/* Changed border color */}
            <table className="w-full border-collapse" style={{ borderSpacing: 0 }}>
              <thead className="bg-amber-100/70 sticky top-0 z-10">
                <tr>
                  <th
                    className="font-normal text-3xl w-16 px-4 py-3 text-left"
                    style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}
                  >
                    Rank
                  </th>
                  <th
                    className="font-normal text-3xl pl-4 pr-0 py-3 text-left"
                    style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}
                  >
                    Student
                  </th>
                  <th
                    className="font-normal text-3xl text-center w-24 pl-0 pr-4 py-3"
                    style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}
                  >
                    Score
                  </th>
                  <th
                    className="font-normal text-3xl text-center w-24 px-4 py-3"
                    style={{ fontFamily: "var(--font-blaka)", color: "#4A2C0D" }}
                  >
                    Levels
                  </th>
                  <th
                    className="font-normal text-3xl text-center w-24 px-4 py-3"
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
                      className="font-normal text-xl px-4 py-3"
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      {index === 0 ? (
                        <Trophy className="h-8 w-8 text-yellow-400" />
                      ) : index === 1 ? (
                        <Medal className="h-8 w-8 text-slate-400" />
                      ) : index === 2 ? (
                        <Medal className="h-8 w-8 text-orange-400" />
                      ) : (
                        `#${index + 1}`
                      )}
                    </td>
                    <td
                      className="font-normal text-xl pl-4 pr-0 py-3"
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      {student.username}
                      {student.isCurrentUser && " (You)"}
                    </td>
                    <td
                      className="text-center font-normal text-xl pl-0 pr-4 py-3"
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      {student.totalScore}
                    </td>
                    <td
                      className="text-center font-normal text-xl px-4 py-3"
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      {student.completedLevels}
                    </td>
                    <td
                      className="text-center font-normal text-xl px-4 py-3"
                      style={{ fontFamily: "var(--font-blaka)", color: "#784D1B" }}
                    >
                      {student.totalMistakes}
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
