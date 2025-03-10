"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  username: string
  email: string
  role: "ADMIN" | "USER"
  status: string
  createdAt: Date
}

interface UserDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  user?: User
  mode: 'add' | 'edit' | 'view' | 'role'
}

export function UserDialog({ isOpen, onClose, onSubmit, user, mode }: UserDialogProps) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "USER",
    status: user?.status || "active"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isViewOnly = mode === 'view'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' && "Add New User"}
            {mode === 'edit' && "Edit User"}
            {mode === 'view' && "User Details"}
            {mode === 'role' && "Change User Role"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode !== 'role' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  readOnly={isViewOnly}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  readOnly={isViewOnly}
                />
              </div>
              {(mode === 'add' || mode === 'edit') && (
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    {mode === 'add' ? 'Password' : 'New Password (leave empty to keep current)'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={mode === 'add'}
                  />
                </div>
              )}
            </>
          )}

          {(mode === 'role' || mode === 'add' || mode === 'edit') && (
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={isViewOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!isViewOnly && (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'add' ? 'Create User' : 'Save Changes'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
} 