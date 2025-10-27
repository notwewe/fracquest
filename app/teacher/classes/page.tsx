"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ArrowRight, Loader2, BookOpen, Users } from "lucide-react"

export default function TeacherClassesPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single()
        if (!profile || profile.role_id !== 2) {
          // Assuming role_id 2 is for teachers
          router.push("/auth/login") // Or a more appropriate redirect
          return
        }

        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select("*, student_classes(count)") // Fetch student count
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false })

        if (classesError) throw classesError
        setClasses(classesData || [])
      } catch (err: any) {
        console.error("Error fetching classes:", err)
        setError(err.message || "Failed to load classes.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchClasses()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] p-4 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#8B4513]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] p-4 flex justify-center items-center">
        <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-sans font-bold text-[#8B4513]">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#8B4513] font-sans">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 w-full font-sans font-semibold bg-[#8B4513] hover:bg-[#a0522d] text-[#f5e9d0]"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] p-4 font-sans">
      <div className="container mx-auto">
        <div className="mb-8">
          <Button
            asChild
            variant="outline"
            className="border-[#a0522d] text-[#8B4513] hover:bg-[#f5e9d0] hover:text-[#8B4513] font-semibold"
          >
            <Link href="/teacher/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#8B4513]">Your Classes</h1>
          <Button asChild className="font-semibold bg-[#8B4513] hover:bg-[#a0522d] text-[#f5e9d0]">
            <Link href="/teacher/classes/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Class
            </Link>
          </Button>
        </div>

        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Card
                key={cls.id}
                className="border-2 border-[#a0522d] bg-[#f5e9d0] shadow-lg flex flex-col justify-between"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-[#8B4513] truncate">{cls.name}</CardTitle>
                  <CardDescription className="text-[#a0522d] h-10 line-clamp-2">
                    {cls.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-[#8B4513]">
                      <BookOpen className="mr-2 h-4 w-4 text-[#a0522d]" />
                      Class Code: <span className="font-semibold ml-1">{cls.class_code}</span>
                    </div>
                    <div className="flex items-center text-[#8B4513]">
                      <Users className="mr-2 h-4 w-4 text-[#a0522d]" />
                      Students: <span className="font-semibold ml-1">{cls.student_classes[0]?.count || 0}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full font-semibold bg-[#a0522d] hover:bg-[#8B4513] text-[#f5e9d0]">
                    <Link href={`/teacher/classes/${cls.id}`}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#f5e9d0] rounded-lg border-2 border-[#a0522d] shadow-lg">
            <BookOpen className="mx-auto h-16 w-16 text-[#a0522d] mb-4" />
            <h2 className="text-2xl font-bold text-[#8B4513] mb-2">No Classes Yet</h2>
            <p className="text-[#a0522d] mb-6">
              It looks like you haven't created any classes. Get started by creating your first one!
            </p>
            <Button asChild className="font-semibold bg-[#8B4513] hover:bg-[#a0522d] text-[#f5e9d0]">
              <Link href="/teacher/classes/new">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Your First Class
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
