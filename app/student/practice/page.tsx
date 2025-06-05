import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default async function StudentPracticePage() {
  const supabase = createClient()

  // Check if user is authenticated and is a student
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single()

  if (!profile || profile.role_id !== 1) {
    redirect("/auth/login")
  }

  // Get game sections
  const { data: sections } = await supabase.from("game_sections").select("*").order("order_index")

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
          <Link href="/student/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-blaka text-amber-900">Practice Area</h1>
          <p className="font-blaka text-amber-700">
            Practice your fraction skills without affecting your game progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections?.map((section) => (
            <Card key={section.id} className="border-2 border-amber-800 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-xl font-blaka text-amber-900">{section.name}</CardTitle>
                <CardDescription className="font-blaka text-amber-700">{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  <Button asChild className="w-full font-blaka bg-amber-600 hover:bg-amber-700 text-white">
                    <Link href={`/student/practice/${section.id}/intro`}>Review Lesson</Link>
                  </Button>
                  <Button asChild className="w-full font-blaka bg-amber-600 hover:bg-amber-700 text-white">
                    <Link href={`/student/practice/${section.id}/game`}>Practice Game</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
