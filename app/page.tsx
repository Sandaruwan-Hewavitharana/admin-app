import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }
  
  // Redirect based on role
  if (session.user.role === "ADMIN") {
    redirect("/dashboard")
  } else {
    redirect("/my-account")
  }
}
