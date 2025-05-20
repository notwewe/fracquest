"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Pencil, Trash, Search } from "lucide-react"
import { motion } from "framer-motion"

type Class = {
  id: number
  name: string
  class_code: string
  description: string
  teacher_id: string
  teacher_name: string
  student_count: number
  created_at: string
}

export function AdminClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editClass, setEditClass] = useState<Class | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get all classes with teacher profiles
        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select("*, profiles:teacher_id(username)")
          .order("name")

        if (classesError) throw classesError

        // Get student counts for each class
        const classesWithStudentCounts = await Promise.all(
          (classesData || []).map(async (classItem) => {
            const { count: studentCount, error: countError } = await supabase
              .from("student_classes")
              .select("*", { count: "exact" })
              .eq("class_id", classItem.id)

            if (countError) {
              console.error("Error getting student count:", countError)
            }

            return {
              id: classItem.id,
              name: classItem.name,
              class_code: classItem.class_code,
              description: classItem.description,
              teacher_id: classItem.teacher_id,
              teacher_name: classItem.profiles?.username || "Unknown",
              student_count: studentCount || 0,
              created_at: classItem.created_at,
            }
          }),
        )

        setClasses(classesWithStudentCounts)
      } catch (error: any) {
        console.error("Error fetching classes:", error)
        setError(`Error loading classes: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClasses()
  }, [supabase])

  const handleEditClass = async () => {
    if (!editClass) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Update class
      const { error: classError } = await supabase
        .from("classes")
        .update({
          name: editClass.name,
          description: editClass.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editClass.id)

      if (classError) throw classError

      // Update classes list
      setClasses(
        classes.map((c) =>
          c.id === editClass.id
            ? {
                ...editClass,
              }
            : c,
        ),
      )

      setSuccess("Class updated successfully")
      setEditClass(null)
    } catch (error: any) {
      console.error("Error updating class:", error)
      setError(`Error updating class: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClass = async (classId: number) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Delete student_classes entries first
      const { error: studentClassesError } = await supabase.from("student_classes").delete().eq("class_id", classId)

      if (studentClassesError) throw studentClassesError

      // Delete class
      const { error: classError } = await supabase.from("classes").delete().eq("id", classId)

      if (classError) throw classError

      // Update classes list
      setClasses(classes.filter((c) => c.id !== classId))
      setSuccess("Class deleted successfully")
    } catch (error: any) {
      console.error("Error deleting class:", error)
      setError(`Error deleting class: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.class_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="border-2 border-amber-800 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-2xl font-pixel text-amber-900">Classes Management</CardTitle>
          <CardDescription className="text-amber-700">View and manage all classes in the system</CardDescription>

          <div className="mt-4 relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-amber-300 bg-amber-100 pl-8"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4"
            >
              {success}
            </motion.div>
          )}
        </CardHeader>

        <CardContent>
          <div className="rounded-md border border-amber-300">
            <Table>
              <TableHeader className="bg-amber-100">
                <TableRow>
                  <TableHead className="font-pixel text-amber-900">Name</TableHead>
                  <TableHead className="font-pixel text-amber-900">Code</TableHead>
                  <TableHead className="font-pixel text-amber-900">Teacher</TableHead>
                  <TableHead className="font-pixel text-amber-900">Students</TableHead>
                  <TableHead className="font-pixel text-amber-900">Created</TableHead>
                  <TableHead className="font-pixel text-amber-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-amber-700">
                      No classes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClasses.map((classItem, index) => (
                    <motion.tr
                      key={classItem.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-amber-900">{classItem.name}</TableCell>
                      <TableCell className="text-amber-700">
                        <code className="bg-amber-100 px-2 py-1 rounded">{classItem.class_code}</code>
                      </TableCell>
                      <TableCell className="text-amber-700">{classItem.teacher_name}</TableCell>
                      <TableCell className="text-amber-700">{classItem.student_count}</TableCell>
                      <TableCell className="text-amber-700">
                        {new Date(classItem.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-amber-300 text-amber-700 hover:bg-amber-100 h-8 w-8 p-0"
                                onClick={() => setEditClass(classItem)}
                              >
                                <Pencil className="h-4 w-4" />
                              </motion.button>
                            </DialogTrigger>
                            <DialogContent className="bg-amber-50 border-2 border-amber-800">
                              <DialogHeader>
                                <DialogTitle className="font-pixel text-amber-900">Edit Class</DialogTitle>
                                <DialogDescription className="text-amber-700">
                                  Make changes to the class details.
                                </DialogDescription>
                              </DialogHeader>

                              {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                                  {error}
                                </div>
                              )}

                              {success && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                                  {success}
                                </div>
                              )}

                              {editClass && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-name" className="font-pixel text-amber-900">
                                      Class Name
                                    </Label>
                                    <Input
                                      id="edit-name"
                                      value={editClass.name}
                                      onChange={(e) => setEditClass({ ...editClass, name: e.target.value })}
                                      className="border-amber-300 bg-amber-100"
                                    />
                                  </div>

                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-code" className="font-pixel text-amber-900">
                                      Class Code
                                    </Label>
                                    <Input
                                      id="edit-code"
                                      value={editClass.class_code}
                                      disabled
                                      className="border-amber-300 bg-amber-100 opacity-70"
                                    />
                                    <p className="text-xs text-amber-600">Class code cannot be changed</p>
                                  </div>

                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-description" className="font-pixel text-amber-900">
                                      Description
                                    </Label>
                                    <Input
                                      id="edit-description"
                                      value={editClass.description}
                                      onChange={(e) => setEditClass({ ...editClass, description: e.target.value })}
                                      className="border-amber-300 bg-amber-100"
                                    />
                                  </div>

                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-teacher" className="font-pixel text-amber-900">
                                      Teacher
                                    </Label>
                                    <Input
                                      id="edit-teacher"
                                      value={editClass.teacher_name}
                                      disabled
                                      className="border-amber-300 bg-amber-100 opacity-70"
                                    />
                                    <p className="text-xs text-amber-600">Teacher cannot be changed here</p>
                                  </div>
                                </div>
                              )}

                              <DialogFooter>
                                <Button
                                  type="submit"
                                  onClick={handleEditClass}
                                  disabled={isSubmitting}
                                  className="bg-amber-600 hover:bg-amber-700 font-pixel"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Save Changes"
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-300 text-red-700 hover:bg-red-100 h-8 w-8 p-0"
                              >
                                <Trash className="h-4 w-4" />
                              </motion.button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-amber-50 border-2 border-amber-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-pixel text-amber-900">Delete Class</AlertDialogTitle>
                                <AlertDialogDescription className="text-amber-700">
                                  Are you sure you want to delete this class? This will remove all student enrollments.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-amber-300 text-amber-700">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white font-pixel"
                                  onClick={() => handleDeleteClass(classItem.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
