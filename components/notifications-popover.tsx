"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function NotificationsPopover() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <Badge 
            variant="secondary"
            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center"
          >
            3
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        <DropdownMenuItem>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">New user registered</span>
            <span className="text-xs text-muted-foreground">2 minutes ago</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">New order received</span>
            <span className="text-xs text-muted-foreground">1 hour ago</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">System update available</span>
            <span className="text-xs text-muted-foreground">3 hours ago</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 