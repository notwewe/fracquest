"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Loader2, Pencil, Trash, Info, Search } from "lucide-react"
import { motion } from "framer-motion"

type User = {
  id: string
  username: string
  role_id: number
  role_name: string
  created_at: string
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([])
  const [editUser, setEditUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get roles first
        const { data: rolesData, error: rolesError } = await supabase.from("roles").select("*").order("id")

        if (rolesError) throw rolesError
        setRoles(rolesData || [])

        // Get all profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .order("username")

        if (profilesError) throw profilesError

        // Map profiles to users with role names
        const usersWithDetails = profilesData
          .map((profile) => {
            const roleName = rolesData?.find((r) => r.id === profile.role_id)?.name || "unknown"

            return {
              id: profile.id,
              username: profile.username || "Unknown",
              role_id: profile.role_id,
              role_name: roleName,
              created_at: profile.created_at,
            }
          })
          // Filter out admin users
          .filter((user) => user.role_id !== 3)

        setUsers(usersWithDetails)
      } catch (error: any) {
        console.error("Error fetching users:", error)
        setError(`Error loading users: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [supabase])

  const handleEditUser = async () => {
    if (!editUser) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: editUser.username,
          role_id: editUser.role_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editUser.id)

      if (profileError) throw profileError

      // Update users list
      setUsers(
        users.map((user) =>
          user.id === editUser.id
            ? {
                ...editUser,
                role_name: roles.find((r) => r.id === editUser.role_id)?.name || "unknown",
              }
            : user,
        ),
      )

      setSuccess("User updated successfully")
      setEditUser(null)
    } catch (error: any) {
      console.error("Error updating user:", error)
      setError(`Error updating user: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Delete profile
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

      if (profileError) throw profileError

      // Update users list
      setUsers(users.filter((user) => user.id !== userId))
      setSuccess("User deleted successfully")
    } catch (error: any) {
      console.error("Error deleting user:", error)
      setError(`Error deleting user: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role_name.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-pixel text-amber-900">Users Management</CardTitle>
          </div>

          <CardDescription className="flex items-center text-amber-700 mt-2">
            <Info className="h-4 w-4 mr-2" />
            Note: Email display is not available due to permission restrictions. Only students and teachers are shown.
          </CardDescription>

          <div className="mt-4 relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
            <Input
              placeholder="Search users..."
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
                  <TableHead className="font-pixel text-amber-900">Username</TableHead>
                  <TableHead className="font-pixel text-amber-900">Role</TableHead>
                  <TableHead className="font-pixel text-amber-900">Created</TableHead>
                  <TableHead className="font-pixel text-amber-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-amber-700">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role_name === "teacher" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role_name}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-amber-300 text-amber-700 hover:bg-amber-100 h-8 w-8 p-0"
                                onClick={() => setEditUser(user)}
                              >
                                <Pencil className="h-4 w-4" />
                              </motion.button>
                            </DialogTrigger>
                            <DialogContent className="bg-amber-50 border-2 border-amber-800">
                              <DialogHeader>
                                <DialogTitle className="font-pixel text-amber-900">Edit User</DialogTitle>
                                <DialogDescription className="text-amber-700">
                                  Make changes to the user account.
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

                              {editUser && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-username" className="font-pixel text-amber-900">
                                      Username
                                    </Label>
                                    <Input
                                      id="edit-username"
                                      value={editUser.username}
                                      onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                                      className="border-amber-300 bg-amber-100"
                                    />
                                  </div>

                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-role" className="font-pixel text-amber-900">
                                      Role
                                    </Label>
                                    <Select
                                      onValueChange={(value) => setEditUser({ ...editUser, role_id: Number(value) })}
                                      value={editUser.role_id.toString()}
                                    >
                                      <SelectTrigger className="border-amber-300 bg-amber-100">
                                        <SelectValue placeholder="Select a role" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-amber-50 border-amber-300">
                                        {roles
                                          .filter((role) => role.id !== 3) // Filter out admin role
                                          .map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                              {role.name}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}

                              <DialogFooter>
                                <Button
                                  type="submit"
                                  onClick={handleEditUser}
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
                                <AlertDialogTitle className="font-pixel text-amber-900">Delete User</AlertDialogTitle>
                                <AlertDialogDescription className="text-amber-700">
                                  Are you sure you want to delete this user? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-amber-300 text-amber-700">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white font-pixel"
                                  onClick={() => handleDeleteUser(user.id)}
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
