"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart, ChevronDown, CreditCard, LayoutDashboard, LogOut, Menu, Settings, User, X } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsPopover } from "@/components/notifications-popover"
import { Sidebar } from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  isAdmin?: boolean
}

export function DashboardLayout({ children, isAdmin = false }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const { data: session } = useSession()

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const userNavItems = [
    {
      title: "Dashboard",
      href: "/my-account",
      icon: LayoutDashboard,
      isActive: pathname === "/my-account",
    },
    {
      title: "Billing",
      href: "/my-account/billing",
      icon: CreditCard,
      isActive: pathname === "/my-account/billing",
    },
    {
      title: "Settings",
      href: "/my-account/settings",
      icon: Settings,
      isActive: pathname === "/my-account/settings",
    },
  ]

  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Users",
      href: "/users",
      icon: User,
      isActive: pathname === "/users",
    },
    {
      title: "Billing",
      href: "/billing",
      icon: CreditCard,
      isActive: pathname === "/billing",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      isActive: pathname === "/settings",
    },
  ]

  const navItems = session?.user?.role === 'ADMIN' ? adminNavItems : userNavItems

  const NavContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2 font-semibold">
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-lg">{isAdmin ? "Admin Portal" : "Dashboard"}</span>
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="grid gap-1">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  item.isActive && "bg-accent text-accent-foreground",
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
                {item.badge && <Badge className="ml-auto h-5 w-5 justify-center rounded-full p-0">{item.badge}</Badge>}
              </Link>
            </motion.div>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto w-full justify-start gap-3 px-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User avatar" />
                <AvatarFallback>
                  {session?.user?.username?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{session?.user?.username || 'User'}</span>
                <span className="text-xs text-muted-foreground">{session?.user?.email || ''}</span>
              </div>
              <ChevronDown className="ml-auto h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[240px]">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="text-lg font-semibold">
            Welcome back, {session?.user?.username || 'Admin'}
          </div>
          <div className="flex items-center gap-4">
            <NotificationsPopover />
            <ThemeToggle />
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

