"use client"

import { Table } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ResponsiveTable({ children, className, ...props }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full overflow-auto scrollbar-thin scrollbar-thumb-border", className)} {...props}>
      <div className="min-w-[640px]"> {/* Minimum width to prevent squishing */}
        <Table>{children}</Table>
      </div>
    </div>
  )
} 