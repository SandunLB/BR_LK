"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Building2 } from "lucide-react"

interface PaymentProps {
  amount: number
  onComplete: (details: {
    method: string
    receiptUrl?: string
  }) => void
  onBack: () => void
}

export function Payment({ amount, onComplete, onBack }: PaymentProps) {
  const [method, setMethod] = useState("")
  const [receipt, setReceipt] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      onComplete({
        method,
        receiptUrl: receipt ? URL.createObjectURL(receipt) : undefined,
      })
    } catch (error) {
      console.error("Payment error:", error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payment</h2>
        <p className="text-gray-500 mt-2">Choose your payment method and complete the registration.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className={`cursor-pointer transition-colors ${
            method === "card" ? "border-indigo-600 bg-indigo-50" : "hover:border-gray-300"
          }`}
          onClick={() => setMethod("card")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Credit Card
            </CardTitle>
            <CardDescription>Pay with credit or debit card</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Secure payment processed by Stripe</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            method === "bank" ? "border-indigo-600 bg-indigo-50" : "hover:border-gray-300"
          }`}
          onClick={() => setMethod("bank")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Transfer
            </CardTitle>
            <CardDescription>Pay via bank transfer</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Manual verification required</p>
          </CardContent>
        </Card>
      </div>

      {method === "bank" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Payment Receipt</CardTitle>
            <CardDescription>Please upload your bank transfer receipt</CardDescription>
          </CardHeader>
          <CardContent>
            <Input type="file" accept="image/*,.pdf" onChange={(e) => setReceipt(e.target.files?.[0] || null)} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span className="font-bold">${amount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={!method || (method === "bank" && !receipt) || isSubmitting}>
            {isSubmitting ? "Processing..." : "Complete Registration"}
          </Button>
        </div>
      </div>
    </div>
  )
}

