"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface Plan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  isPopular: boolean
  stripePriceId?: string
  status: string
}

interface PlanDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<Plan>) => void
  plan: Plan | undefined
}

export function PlanDialog({ isOpen, onClose, onSubmit, plan }: PlanDialogProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    price: plan?.price || 0,
    features: plan?.features?.join("\n") || "",
    isPopular: plan?.isPopular || false,
    stripePriceId: plan?.stripePriceId || "",
    status: plan?.status || "active"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submissionData = {
      ...formData,
      features: formData.features.split("\n").filter(f => f.trim()),
      price: Number(formData.price),
      isPopular: Boolean(formData.isPopular),
      status: formData.status || 'active'
    }
    console.log('Submitting plan data:', submissionData) // Debug log
    onSubmit(submissionData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "Add New Plan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stripePriceId">Stripe Price ID</Label>
            <Input
              id="stripePriceId"
              value={formData.stripePriceId}
              onChange={(e) => setFormData({ ...formData, stripePriceId: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="isPopular"
              checked={formData.isPopular}
              onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
            />
            <Label htmlFor="isPopular">Mark as Popular</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {plan ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 