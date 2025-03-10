"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

type AuthStep = "email" | "signin" | "signup" | "forgot-password"

export default function AuthForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authStep, setAuthStep] = useState<AuthStep>("email")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  })

  const checkEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to check email")
      }

      const data = await res.json()
      setAuthStep(data.exists ? "signin" : "signup")
    } catch (err) {
      console.error("Email check error:", err)
      setError(err instanceof Error ? err.message : "Failed to check email. Please try again.")
      // Reset to email step on error
      setAuthStep("email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (authStep === "signup") {
        // Handle Sign Up
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error)
        }
      }

      // Sign in for both new and existing users
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Check user role and redirect accordingly
      const session = await fetch('/api/auth/session')
      const sessionData = await session.json()

      if (sessionData?.user?.role === 'ADMIN') {
        router.push("/dashboard")
      } else {
        router.push("/unauthorized")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      toast.success(data.message)
      setAuthStep("email")
      setFormData({ ...formData, email: "" })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong")
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>
          {authStep === "signin" && "Sign In"}
          {authStep === "signup" && "Create Account"}
          {authStep === "email" && "Welcome"}
          {authStep === "forgot-password" && "Reset Password"}
        </CardTitle>
        <CardDescription>
          {authStep === "signin" && "Enter your password to continue"}
          {authStep === "signup" && "Create your account to continue"}
          {authStep === "email" && "Enter your email to continue"}
          {authStep === "forgot-password" && "Enter your email to reset your password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={
          authStep === "email" 
            ? checkEmail 
            : authStep === "forgot-password"
            ? handleForgotPassword
            : handleSubmit
        } className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={authStep === "signin"}
              required
            />
          </div>

          {authStep === "signin" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button 
                  type="button" 
                  variant="link" 
                  className="px-0"
                  onClick={() => setAuthStep("forgot-password")}
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          )}

          {authStep === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Choose a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : 
              authStep === "signin" ? "Sign In" :
              authStep === "signup" ? "Create Account" :
              authStep === "forgot-password" ? "Send Reset Link" :
              "Continue"
            }
          </Button>

          {authStep !== "email" && (
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => {
                setAuthStep("email")
                setFormData({ ...formData, password: "", username: "" })
              }}
            >
              Use a different email
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
} 