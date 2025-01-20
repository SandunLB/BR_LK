import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"

interface Owner {
  id: string
  fullName: string
  ownership: string
  isCompany: boolean
}

interface OwnerInformationProps {
  onNext: (owners: Owner[]) => void
  onBack: () => void
}

export function OwnerInformation({ onNext, onBack }: OwnerInformationProps) {
  const [owners, setOwners] = useState<Owner[]>([
    { id: '1', fullName: '', ownership: '', isCompany: false }
  ])
  const [validationMessage, setValidationMessage] = useState<string>('')

  const addOwner = () => {
    setOwners([...owners, { 
      id: Date.now().toString(),
      fullName: '',
      ownership: '',
      isCompany: false
    }])
  }

  const removeOwner = (id: string) => {
    if (owners.length > 1) {
      setOwners(owners.filter(owner => owner.id !== id))
    }
  }

  const updateOwner = (id: string, field: keyof Owner, value: string | boolean) => {
    setOwners(owners.map(owner => {
      if (owner.id === id) {
        if (field === 'ownership') {
          // Ensure ownership is a valid number between 0 and 100
          const numValue = value === '' ? '' : Math.min(100, Math.max(0, Number(value)))
          return { ...owner, [field]: numValue.toString() }
        }
        return { ...owner, [field]: value }
      }
      return owner
    }))
  }

  const validateOwners = (): boolean => {
    const totalOwnership = owners.reduce((sum, owner) => sum + (Number(owner.ownership) || 0), 0)
    
    if (totalOwnership < 100) {
      setValidationMessage(`Total ownership is ${totalOwnership}%. Please ensure it equals 100%.`)
      return false
    } else if (totalOwnership > 100) {
      setValidationMessage(`Total ownership is ${totalOwnership}%. Please ensure it does not exceed 100%.`)
      return false
    }
    
    setValidationMessage('')
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateOwners()) {
      onNext(owners)
    }
  }

  const totalOwnership = owners.reduce((sum, owner) => sum + (Number(owner.ownership) || 0), 0)

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Owner Information
        </h2>
        <p className="text-gray-500 mt-2">Add all owners and their ownership percentages.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {owners.map((owner, index) => (
          <div key={owner.id} className="space-y-4 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Owner {index + 1}</h3>
              {owners.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOwner(owner.id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`isCompany-${owner.id}`}
                checked={owner.isCompany}
                onCheckedChange={(checked) => updateOwner(owner.id, 'isCompany', !!checked)}
              />
              <label htmlFor={`isCompany-${owner.id}`} className="text-sm font-medium">
                Owner is a company
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                required
                value={owner.fullName}
                onChange={(e) => updateOwner(owner.id, 'fullName', e.target.value)}
                placeholder={owner.isCompany ? "Enter company name" : "Enter full name"}
                className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ownership Percentage</label>
              <Input
                required
                type="number"
                min="0"
                max="100"
                value={owner.ownership}
                onChange={(e) => updateOwner(owner.id, 'ownership', e.target.value)}
                placeholder="Enter ownership percentage"
                className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>
          </div>
        ))}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Total Ownership: <span className={totalOwnership === 100 ? "text-green-600" : "text-orange-600"}>
                {totalOwnership}%
              </span>
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={addOwner}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Another Owner
            </Button>
          </div>

          {validationMessage && (
            <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              {validationMessage}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="px-8"
          >
            Back
          </Button>
          <Button 
            type="submit"
            disabled={owners.some(owner => !owner.fullName || !owner.ownership)}
            className="px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}