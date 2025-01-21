import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, FileUp } from "lucide-react"

interface Owner {
  id: string
  fullName: string
  ownership: string
  isCompany: boolean
  isCEO?: boolean
  birthDate?: string
  drivingLicense?: File | null
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
      isCompany: false,
      isCEO: false
    }])
  }

  const removeOwner = (id: string) => {
    if (owners.length > 1) {
      const ownerToRemove = owners.find(o => o.id === id)
      const updatedOwners = owners.filter(owner => owner.id !== id)
      
      // If removing CEO, assign to first non-company owner
      if (ownerToRemove?.isCEO) {
        const firstNonCompanyOwner = updatedOwners.find(o => !o.isCompany)
        if (firstNonCompanyOwner) {
          updatedOwners.forEach(owner => {
            owner.isCEO = owner.id === firstNonCompanyOwner.id
          })
        }
      }
      
      setOwners(updatedOwners)
    }
  }

  const updateOwner = (id: string, field: keyof Owner, value: string | boolean | File | null) => {
    setOwners(owners.map(owner => {
      if (owner.id === id) {
        const updatedOwner = { ...owner }

        if (field === 'ownership') {
          // Ensure ownership is a valid number between 0 and 100
          const numValue = value === '' ? '' : Math.min(100, Math.max(0, Number(value)))
          updatedOwner[field] = numValue.toString()
        } else if (field === 'isCompany' && value === true) {
          // If marking as company, remove CEO status
          updatedOwner.isCompany = true
          updatedOwner.isCEO = false
          // If this was the CEO, reassign CEO to another non-company owner
          if (owner.isCEO) {
            const newCEO = owners.find(o => !o.isCompany && o.id !== id)
            if (newCEO) {
              owners.forEach(o => {
                if (o.id === newCEO.id) o.isCEO = true
              })
            }
          }
        } else if (field === 'isCEO' && value === true) {
          // Remove CEO status from all other owners
          owners.forEach(o => {
            if (o.id !== id) o.isCEO = false
          })
          updatedOwner.isCEO = true
        } else {
          updatedOwner[field] = value as never
        }

        return updatedOwner
      }
      return owner
    }))
  }

  const validateOwners = (): boolean => {
    const totalOwnership = owners.reduce((sum, owner) => sum + (Number(owner.ownership) || 0), 0)
    
    // Enhanced ownership validation
    if (totalOwnership < 100) {
      const remaining = 100 - totalOwnership
      setValidationMessage(`Total ownership is ${totalOwnership}%. You need ${remaining}% more to reach 100%.`)
      return false
    } else if (totalOwnership > 100) {
      const excess = totalOwnership - 100
      setValidationMessage(`Total ownership is ${totalOwnership}%. Please reduce by ${excess}% to equal 100%.`)
      return false
    }

    // For multiple owners, validate CEO requirements
    if (owners.length > 1) {
      // Check exactly one CEO is designated
      const ceoCount = owners.filter(owner => owner.isCEO).length
      if (ceoCount !== 1) {
        setValidationMessage('Please designate exactly one owner as CEO')
        return false
      }

      // Check CEO has required fields
      const ceo = owners.find(owner => owner.isCEO)
      if (ceo && (!ceo.birthDate || !ceo.drivingLicense)) {
        setValidationMessage('Please complete all required CEO information (birth date and driving license)')
        return false
      }

      // Check only one company owner
      const companyCount = owners.filter(owner => owner.isCompany).length
      if (companyCount > 1) {
        setValidationMessage('Only one owner can be marked as a company')
        return false
      }
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

  const handleFileChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    updateOwner(id, 'drivingLicense', file)
  }

  const getOwnershipStatus = () => {
    const totalOwnership = owners.reduce((sum, owner) => sum + (Number(owner.ownership) || 0), 0)
    if (totalOwnership === 100) {
      return { color: 'text-green-600', message: `${totalOwnership}% (Valid)` }
    } else if (totalOwnership < 100) {
      return { color: 'text-orange-600', message: `${totalOwnership}% (Need ${100 - totalOwnership}% more)` }
    } else {
      return { color: 'text-red-600', message: `${totalOwnership}% (Exceeds by ${totalOwnership - 100}%)` }
    }
  }

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

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`isCompany-${owner.id}`}
                  checked={owner.isCompany}
                  onCheckedChange={(checked) => updateOwner(owner.id, 'isCompany', !!checked)}
                  disabled={owners.length > 1 && owners.some(o => o.isCompany && o.id !== owner.id)}
                />
                <label htmlFor={`isCompany-${owner.id}`} className="text-sm font-medium">
                  Owner is a company
                </label>
              </div>

              {owners.length > 1 && !owner.isCompany && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`isCEO-${owner.id}`}
                    checked={owner.isCEO}
                    onCheckedChange={(checked) => updateOwner(owner.id, 'isCEO', !!checked)}
                  />
                  <label htmlFor={`isCEO-${owner.id}`} className="text-sm font-medium">
                    CEO
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {owner.isCompany ? "Company Full Name" : "Full Name"}
              </label>
              <Input
                required
                value={owner.fullName}
                onChange={(e) => updateOwner(owner.id, 'fullName', e.target.value)}
                placeholder={owner.isCompany ? "Enter company full name" : "Enter full name"}
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

            {owner.isCEO && (
              <div className="space-y-4 pt-2 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Birth Date</label>
                  <Input
                    required
                    type="date"
                    value={owner.birthDate || ''}
                    onChange={(e) => updateOwner(owner.id, 'birthDate', e.target.value)}
                    className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Driving License</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      required
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(owner.id, e)}
                      className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
                    />
                    <FileUp className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Total Ownership: {' '}
              <span className={getOwnershipStatus().color}>
                {getOwnershipStatus().message}
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
            <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded-md border border-orange-200">
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