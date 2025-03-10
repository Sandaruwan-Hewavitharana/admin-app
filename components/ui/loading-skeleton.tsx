import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Skeleton className="h-[400px] lg:col-span-4" />
        <Skeleton className="h-[400px] lg:col-span-3" />
      </div>
    </div>
  )
}

// Users table skeleton
export function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-[200px]" />
      <div className="border rounded-lg">
        <div className="p-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Settings skeleton
export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-[250px]" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    </div>
  )
}

// Billing skeleton
export function BillingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-[500px] w-full" />
    </div>
  )
} 