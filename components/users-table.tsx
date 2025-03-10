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
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  username: string
  email: string
  role: "ADMIN" | "USER"
  status: "ACTIVE" | "INACTIVE"
  createdAt: Date
}

export default function UsersTable({ users }: { users: User[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800">
            <TableHead className="text-gray-400">Name</TableHead>
            <TableHead className="text-gray-400">Email</TableHead>
            <TableHead className="text-gray-400">Role</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Created At</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-gray-800">
              <TableCell className="text-white">{user.username}</TableCell>
              <TableCell className="text-gray-400">{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={user.status === "ACTIVE" ? "success" : "destructive"}
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-400">
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-gray-400 hover:text-white"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1A1A1A] text-white border-gray-800">
                    <DropdownMenuItem className="hover:bg-gray-800">
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-800">
                      Change Role
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 hover:bg-gray-800">
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 