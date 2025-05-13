import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, PlusIcon } from "lucide-react"

export default async function ClassesPage() {
  const supabase = createClient()

  // Check if user is authenticated and is a teacher
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get teacher's classes
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, description, class_code")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
          <Link href="/teacher/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-pixel text-amber-900">Your Classes</h1>
          <Button asChild className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
            <Link href="/teacher/classes/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Class
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes && classes.length > 0 ? (
            classes.map((cls) => (
              <Card key={cls.id} className="border-2 border-amber-800 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-xl font-pixel text-amber-900">{cls.name}</CardTitle>
                  <p className="text-sm text-amber-700">Code: {cls.class_code}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-700 mb-4">{cls.description || "No description"}</p>
                  <Button asChild className="w-full font-pixel bg-amber-600 hover:bg-amber-700 text-white">
                    <Link href={`/teacher/classes/${cls.id}`}>View Class</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="border-2 border-amber-800 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="font-pixel text-amber-700 mb-4">You haven't created any classes yet.</p>
                    <Button asChild className="font-pixel bg-amber-600 hover:bg-amber-700 text-white">
                      <Link href="/teacher/classes/new">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Your First Class
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
