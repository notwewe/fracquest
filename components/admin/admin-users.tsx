"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
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
import { Loader2, Pencil, Trash, Info, Search, GraduationCap, BookOpen } from "lucide-react"
import { motion } from "framer-motion"

type User = {
  id: string
  username: string
  role_id: number
  role_name: string
  created_at: string
  school_name?: string // School name
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
  const [showRoleConfirmation, setShowRoleConfirmation] = useState(false)
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string
    newRoleId: number
    newRoleName: string
  } | null>(null)
  const [roleFilter, setRoleFilter] = useState('all');
  const filteredUsers = users.filter(
    (user) => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role_name === roleFilter;
      return matchesSearch && matchesRole;
    }
  );
  const usersPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get roles first
        const { data: rolesData, error: rolesError } = await supabase.from("roles").select("*").order("id")

        if (rolesError) throw rolesError
        setRoles(rolesData || [])

        // Get all profiles except admins (role_id 3)
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .not("role_id", "eq", 3)
          .order("username")

        if (profilesError) throw profilesError

        // For each user, fetch their class/school name
        const usersWithDetails = profilesData.map((profile) => {
          const roleName = rolesData?.find((r) => r.id === profile.role_id)?.name || "unknown"
          return {
            id: profile.id,
            username: profile.username || "Unknown",
            role_id: profile.role_id,
            role_name: roleName,
            created_at: profile.created_at,
            school_name: profile.school_name || "-",
          }
        })
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

  const handleRoleChange = (newRoleId: string) => {
    if (!editUser) return

    const newRole = roles.find((r) => r.id === Number(newRoleId))
    if (!newRole) return

    setPendingRoleChange({
      userId: editUser.id,
      newRoleId: Number(newRoleId),
      newRoleName: newRole.name,
    })
    setShowRoleConfirmation(true)
  }

  const confirmRoleChange = () => {
    if (!editUser || !pendingRoleChange) return

    setEditUser({ ...editUser, role_id: pendingRoleChange.newRoleId })
    setShowRoleConfirmation(false)
    setPendingRoleChange(null)
  }

  const cancelRoleChange = () => {
    setShowRoleConfirmation(false)
    setPendingRoleChange(null)
  }

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

  // Filter out admin roles from the dropdown
  const nonAdminRoles = roles.filter((role) => role.id !== 3)

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
      <Card className="border-2 border-[#a0522d] bg-[#f5e9d0]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-sans text-[#8B4513]">Users Management</CardTitle>
          </div>

          <CardDescription className="flex items-center text-[#8B4513] mt-2">
            <Info className="h-4 w-4 mr-2" />
            Note: Email display is not available due to permission restrictions.
          </CardDescription>

          <div className="mt-4 relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B4513]" />
            <Input
              placeholder="Search users..."
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

        <CardContent>
          <div className="h-full border-2 border-[#a0522d] bg-white mx-6 mb-6 rounded-md flex flex-col">
            {/* Fixed Header */}
            <div className="bg-[#8B4513] rounded-t-md">
              <div className="grid grid-cols-4 gap-2 px-3 py-2">
                <div className="font-sans text-[#f5e9d0] font-semibold text-base">Username</div>
                <div className="font-sans text-[#f5e9d0] font-semibold text-base">Role</div>
                <div className="font-sans text-[#f5e9d0] font-semibold text-base">School</div>
                <div className="font-sans text-[#f5e9d0] font-semibold text-base text-right">Actions</div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div>
              {paginatedUsers.length === 0 ? (
                <div className="text-center py-8 text-[#8B4513] font-sans">No users found</div>
              ) : (
                paginatedUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="grid grid-cols-4 gap-2 px-3 py-2 border-b border-[#a0522d]/20 transition-colors hover:bg-[#FAF7F0] text-base"
                  >
                    <div className="font-medium font-sans text-[#8B4513] text-base">{user.username}</div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold font-sans ${
                          user.role_name === "teacher"
                            ? "bg-blue-100 text-blue-800"
                            : user.role_name === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role_name}
                      </span>
                    </div>
                    <div className="font-sans text-[#8B4513] text-base">{user.school_name || '-'}</div>
                    <div className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[#a0522d] text-[#8B4513] hover:bg-[#FAF7F0] h-8 w-8 p-0"
                              onClick={() => setEditUser(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </motion.button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#f5e9d0] border-2 border-[#a0522d]">
                            <DialogHeader>
                              <DialogTitle className="font-sans text-[#8B4513]">Edit User</DialogTitle>
                              <DialogDescription className="text-[#8B4513] font-sans">
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
                                  <Label htmlFor="edit-username" className="font-sans text-[#8B4513]">
                                    Username
                                  </Label>
                                  <Input
                                    id="edit-username"
                                    value={editUser.username}
                                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                                    className="border-[#a0522d] bg-white font-sans"
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <Label htmlFor="edit-role" className="font-sans text-[#8B4513]">
                                    Role
                                  </Label>
                                  <Select onValueChange={handleRoleChange} value={editUser.role_id.toString()}>
                                    <SelectTrigger className="border-[#a0522d] bg-white font-sans">
                                      <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#f5e9d0] border-[#a0522d]">
                                      {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()} className="font-sans">
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
                          {/* Role Change Confirmation Dialog */}
                          <AlertDialog open={showRoleConfirmation} onOpenChange={setShowRoleConfirmation}>
                            <AlertDialogContent className="bg-[#f5e9d0] border-2 border-[#a0522d]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-sans text-[#8B4513]">
                                  Confirm Role Change
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#8B4513] font-sans">
                                  Are you sure you want to change this user's role to{" "}
                                  <span className="font-semibold">{pendingRoleChange?.newRoleName}</span>?
                                  {pendingRoleChange?.newRoleName === "admin" && (
                                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-800">
                                      <strong>Warning:</strong> This will grant administrative privileges to this user.
                                    </div>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  className="border-[#a0522d] text-[#8B4513] font-sans"
                                  onClick={cancelRoleChange}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-[#8B4513] hover:bg-[#a0522d] text-white font-sans"
                                  onClick={confirmRoleChange}
                                >
                                  Yes, Change Role
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                              <AlertDialogTitle className="font-sans text-[#8B4513]">Delete User</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#8B4513] font-sans">
                                Are you sure you want to delete this user? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-[#a0522d] text-[#8B4513] font-sans">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white font-sans"
                                onClick={() => handleDeleteUser(user.id)}
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
