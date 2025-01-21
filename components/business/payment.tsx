import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Payment
        </h2>
        <p className="text-gray-500 mt-2">Choose your payment method and complete the registration.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className={`cursor-pointer transition-all relative overflow-hidden group h-full ${
            method === "card" 
              ? "ring-2 ring-indigo-600 border-transparent" 
              : "hover:border-gray-300 hover:shadow-md"
          }`}
          onClick={() => setMethod("card")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${method === "card" ? "bg-indigo-100" : "bg-gray-100"}`}>
                <CreditCard className={`h-5 w-5 ${method === "card" ? "text-indigo-600" : "text-gray-500"}`} />
              </div>
              <span>Credit Card</span>
            </CardTitle>
            <CardDescription>Pay with credit or debit card</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Secure payment processed by Stripe</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all relative overflow-hidden group h-full ${
            method === "bank" 
              ? "ring-2 ring-indigo-600 border-transparent" 
              : "hover:border-gray-300 hover:shadow-md"
          }`}
          onClick={() => setMethod("bank")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${method === "bank" ? "bg-indigo-100" : "bg-gray-100"}`}>
                <Building2 className={`h-5 w-5 ${method === "bank" ? "text-indigo-600" : "text-gray-500"}`} />
              </div>
              <span>Bank Transfer</span>
            </CardTitle>
            <CardDescription>Pay via bank transfer</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Manual verification required</p>
          </CardContent>
        </Card>
      </div>

      {method === "bank" && (
        <Card className="border border-indigo-100">
          <CardHeader>
            <CardTitle className="text-indigo-600">Upload Payment Receipt</CardTitle>
            <CardDescription>Please upload your bank transfer receipt</CardDescription>
          </CardHeader>
          <CardContent>
            <Input 
              type="file" 
              accept="image/*,.pdf" 
              onChange={(e) => setReceipt(e.target.files?.[0] || null)}
              className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
            />
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center text-xl">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center px-4">
            <span className="text-gray-600">Total Amount</span>
            <span className="text-3xl font-bold text-indigo-600">${amount}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="px-8"
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!method || (method === "bank" && !receipt) || isSubmitting}
          className="px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isSubmitting ? "Processing..." : "Complete Registration"}
        </Button>
      </div>
    </div>
  )
}