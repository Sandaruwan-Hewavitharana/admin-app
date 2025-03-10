"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  CreditCard
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings
  },
]

interface SidebarContentProps {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  isMobile?: boolean
}

const SidebarContent = ({ isCollapsed, setIsCollapsed, isMobile }: SidebarContentProps) => {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-[60px] items-center justify-between px-6 py-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">Admin Portal</span>
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180"
            )} />
          </Button>
        )}
      </div>

      <div className="flex-1 px-4">
        <nav className="space-y-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
    return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all group",
                  isActive 
                    ? "bg-white text-black" 
                    : "text-gray-400 hover:text-white hover:bg-gray-900",
                  isCollapsed && "justify-center"
                )}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span>{link.name}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 p-2 bg-popover rounded-md invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all">
                    {link.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto px-4 pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn(
              "w-full flex items-center gap-2 px-2",
              isCollapsed ? "justify-center" : "justify-start"
            )}>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.png" alt={session?.user?.username || ""} />
                <AvatarFallback>
                  {session?.user?.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">
                    {session?.user?.username || "User"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {session?.user?.email}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-500 focus:text-red-500" 
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Mobile sidebar
  if (isMobile) {
  return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
    </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0 bg-background">
            <SidebarContent 
              isCollapsed={false} 
              setIsCollapsed={setIsCollapsed} 
              isMobile={true}
            />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={cn(
        "hidden md:flex h-screen border-r border-border bg-background",
        isCollapsed ? "w-20" : "w-[280px]"
      )}
    >
      <SidebarContent 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
      />
    </motion.div>
  )
}
