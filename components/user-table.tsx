"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, UserCog } from "lucide-react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  username: string
  email: string
  role: "ADMIN" | "USER"
  status: "ACTIVE" | "INACTIVE"
  createdAt: Date
}

export default function UserTable({ users }: { users: User[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (userId: string, newStatus: "ACTIVE" | "INACTIVE") => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update user")
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "USER") => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) throw new Error("Failed to update user")
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.username}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.status === "ACTIVE" ? "success" : "destructive"}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(user.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isLoading}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleRoleChange(
                      user.id, 
                      user.role === "ADMIN" ? "USER" : "ADMIN"
                    )}
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    Make {user.role === "ADMIN" ? "User" : "Admin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(
                      user.id,
                      user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                    )}
                  >
                    {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 