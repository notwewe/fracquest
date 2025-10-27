"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
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
  }, [])

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

  const classesPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredClasses.length / classesPerPage);
  const paginatedClasses = filteredClasses.slice((currentPage - 1) * classesPerPage, currentPage * classesPerPage);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B4513]" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="border-2 border-[#a0522d] bg-[#f5e9d0] h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-2xl font-sans text-[#8B4513]">Classes Management</CardTitle>
          <CardDescription className="text-[#8B4513] font-sans">
            View and manage all classes in the system
          </CardDescription>

          <div className="mt-4 relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B4513]" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-[#a0522d] bg-white pl-8 font-sans"
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

        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="h-full border-2 border-[#a0522d] bg-white mx-6 mb-6 rounded-md flex flex-col">
            {/* Fixed Header */}
            <div className="bg-[#8B4513] rounded-t-md">
              <div className="grid grid-cols-6 gap-2 px-3 py-2">
                <div className="font-sans text-[#f5e9d0] font-semibold text-base">Name</div>
                <div className="font-sans text-[#f5e9d0] font-semibold text-base">Code</div>
                <div className="font-sans text-[#f5e9d0] font-semibold text-base">Teacher</div>
                <div className="font-sans text-[#f5e9d0] font-semibold text-base">Students</div>
                <div className="font-sans text-[#f5e9d0] font-semibold text-base">Created</div>
                <div className="font-sans text-[#f5e9d0] font-semibold text-base text-right">Actions</div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {paginatedClasses.length === 0 ? (
                <div className="text-center py-8 text-[#8B4513] font-sans">No classes found</div>
              ) : (
                paginatedClasses.map((classItem, index) => (
                  <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="grid grid-cols-6 gap-2 px-3 py-2 border-b border-[#a0522d]/20 transition-colors hover:bg-[#FAF7F0] text-base"
                  >
                    <div className="font-medium text-[#8B4513] font-sans text-base">{classItem.name}</div>
                    <div className="text-[#8B4513]">
                      <code className="bg-[#FAF7F0] px-2 py-1 rounded border border-[#a0522d]/30 font-sans text-sm">
                        {classItem.class_code}
                      </code>
                    </div>
                    <div className="text-[#8B4513] font-sans text-base">{classItem.teacher_name}</div>
                    <div className="text-[#8B4513] font-sans text-base">{classItem.student_count}</div>
                    <div className="text-[#8B4513] font-sans text-base">
                      {new Date(classItem.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[#a0522d] text-[#8B4513] hover:bg-[#FAF7F0] h-8 w-8 p-0"
                              onClick={() => setEditClass(classItem)}
                            >
                              <Pencil className="h-4 w-4" />
                            </motion.button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#f5e9d0] border-2 border-[#a0522d]">
                            <DialogHeader>
                              <DialogTitle className="font-sans text-[#8B4513]">Edit Class</DialogTitle>
                              <DialogDescription className="text-[#8B4513] font-sans">
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
                                  <Label htmlFor="edit-name" className="font-sans text-[#8B4513]">
                                    Class Name
                                  </Label>
                                  <Input
                                    id="edit-name"
                                    value={editClass.name}
                                    onChange={(e) => setEditClass({ ...editClass, name: e.target.value })}
                                    className="border-[#a0522d] bg-white font-sans"
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <Label htmlFor="edit-code" className="font-sans text-[#8B4513]">
                                    Class Code
                                  </Label>
                                  <Input
                                    id="edit-code"
                                    value={editClass.class_code}
                                    disabled
                                    className="border-[#a0522d] bg-gray-100 opacity-70 font-sans"
                                  />
                                  <p className="text-xs text-[#8B4513]">Class code cannot be changed</p>
                                </div>

                                <div className="grid gap-2">
                                  <Label htmlFor="edit-description" className="font-sans text-[#8B4513]">
                                    Description
                                  </Label>
                                  <Input
                                    id="edit-description"
                                    value={editClass.description}
                                    onChange={(e) => setEditClass({ ...editClass, description: e.target.value })}
                                    className="border-[#a0522d] bg-white font-sans"
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <Label htmlFor="edit-teacher" className="font-sans text-[#8B4513]">
                                    Teacher
                                  </Label>
                                  <Input
                                    id="edit-teacher"
                                    value={editClass.teacher_name}
                                    disabled
                                    className="border-[#a0522d] bg-gray-100 opacity-70 font-sans"
                                  />
                                  <p className="text-xs text-[#8B4513]">Teacher cannot be changed here</p>
                                </div>
                              </div>
                            )}

                            <DialogFooter>
                              <Button
                                type="submit"
                                onClick={handleEditClass}
                                disabled={isSubmitting}
                                className="bg-[#8B4513] hover:bg-[#a0522d] font-sans"
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
                          <AlertDialogContent className="bg-[#f5e9d0] border-2 border-[#a0522d]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-sans text-[#8B4513]">Delete Class</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#8B4513] font-sans">
                                Are you sure you want to delete this class? This will remove all student enrollments.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-[#a0522d] text-[#8B4513] font-sans">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white font-sans"
                                onClick={() => handleDeleteClass(classItem.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <div className="flex justify-center items-center py-3 gap-2 bg-[#f5e9d0] border-t border-[#a0522d]/30">
            <Button size="sm" variant="outline" className="font-sans" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
              Previous
            </Button>
            <span className="font-sans text-[#8B4513]">Page {currentPage} of {totalPages}</span>
            <Button size="sm" variant="outline" className="font-sans" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
              Next
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
