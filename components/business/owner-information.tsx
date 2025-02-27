import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, FileUp, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { uploadDocument, deleteDocument } from "@/utils/firebase"

interface Owner {
  id: string
  fullName: string
  ownership: string
  isCEO?: boolean
  birthDate?: string
  document?: File | null
  documentUrl?: string
  documentName?: string
}

interface OwnerInformationProps {
  onNext: (owners: Owner[]) => void
  onBack: () => void
  initialData?: Owner[]
}

export function OwnerInformation({ onNext, onBack, initialData }: OwnerInformationProps) {
  const [owners, setOwners] = useState<Owner[]>(initialData || [{ id: "1", fullName: "", ownership: "" }])
  const [validationMessage, setValidationMessage] = useState<string>("")
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({})
  const { user } = useAuth()

  const addOwner = () => {
    setOwners(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        fullName: "",
        ownership: "",
        isCEO: false,
      },
    ])
  }

  const removeOwner = (id: string) => {
    if (owners.length > 1) {
      setOwners(prev => {
        const ownerToRemove = prev.find((o) => o.id === id)
        const updatedOwners = prev.filter((owner) => owner.id !== id)

        if (ownerToRemove?.isCEO && updatedOwners.length > 0) {
          updatedOwners[0].isCEO = true
        }

        return updatedOwners
      })
    }
  }

  const updateOwner = (
    id: string, 
    field: keyof Owner, 
    value: string | boolean | File | null
  ) => {
    setOwners(prev => prev.map(owner => {
      if (owner.id === id) {
        const updatedOwner = { ...owner };
  
        if (field === "ownership") {
          const numValue = value === "" ? "" : Math.min(100, Math.max(0, Number(value)));
          updatedOwner[field] = numValue.toString();
        } else if (field === "isCEO" && typeof value === "boolean") {
          prev.forEach((o) => {
            if (o.id !== id) o.isCEO = false;
          });
          updatedOwner.isCEO = value;
        } else {
          // Type assertion to handle all possible field types
          (updatedOwner[field] as typeof value) = value;
        }
  
        return updatedOwner;
      }
      return owner;
    }));
  };

  const handleFileChange = async (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert("Please upload a file smaller than 5MB")
      return
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF, JPG, or PNG file")
      return
    }

    setUploadingFiles(prev => ({ ...prev, [id]: true }))

    try {
      const currentOwner = owners.find(owner => owner.id === id)
      const currentDocumentUrl = currentOwner?.documentUrl

      if (currentDocumentUrl) {
        try {
          await deleteDocument(currentDocumentUrl)
        } catch (error) {
          console.error("Error deleting old document:", error)
        }
      }

      const documentUrl = await uploadDocument(user.uid, file)
      
      setOwners(prev => prev.map(owner => {
        if (owner.id === id) {
          return {
            ...owner,
            document: file,
            documentUrl: documentUrl,
            documentName: file.name
          }
        }
        return owner
      }))

    } catch (error) {
      console.error("Error uploading file:", error)
      alert("There was an error uploading your file")
    } finally {
      setUploadingFiles(prev => ({ ...prev, [id]: false }))
    }
  }

  const validateOwners = (): boolean => {
    const totalOwnership = owners.reduce((sum, owner) => sum + (Number(owner.ownership) || 0), 0)

    if (totalOwnership < 100) {
      const remaining = 100 - totalOwnership
      setValidationMessage(`Total ownership is ${totalOwnership}%. You need ${remaining}% more to reach 100%.`)
      return false
    } else if (totalOwnership > 100) {
      const excess = totalOwnership - 100
      setValidationMessage(`Total ownership is ${totalOwnership}%. Please reduce by ${excess}% to equal 100%.`)
      return false
    }

    if (owners.length === 1) {
      const owner = owners[0]
      if (!owner.birthDate) {
        setValidationMessage("Please enter the birth date")
        return false
      }
      
      if (!owner.documentUrl) {
        setValidationMessage("Please upload an identification document")
        return false
      }
    } else {
      const ceoCount = owners.filter((owner) => owner.isCEO).length
      if (ceoCount !== 1) {
        setValidationMessage("Please designate exactly one owner as CEO")
        return false
      }

      const ceo = owners.find((owner) => owner.isCEO)
      if (ceo) {
        if (!ceo.birthDate) {
          setValidationMessage("Please enter the CEO's birth date")
          return false
        }
        
        if (!ceo.documentUrl) {
          setValidationMessage("Please upload the CEO's identification document")
          return false
        }
      }
    }

    setValidationMessage("")
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateOwners()) {
      onNext(owners)
    }
  }

  const getOwnershipStatus = () => {
    const totalOwnership = owners.reduce((sum, owner) => sum + (Number(owner.ownership) || 0), 0)
    if (totalOwnership === 100) {
      return { color: "text-green-600", message: `${totalOwnership}% (Valid)` }
    } else if (totalOwnership < 100) {
      return { color: "text-orange-600", message: `${totalOwnership}% (Need ${100 - totalOwnership}% more)` }
    } else {
      return { color: "text-red-600", message: `${totalOwnership}% (Exceeds by ${totalOwnership - 100}%)` }
    }
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3659fb] to-[#6384ff] bg-clip-text text-transparent">
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

            {owners.length > 1 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`isCEO-${owner.id}`}
                  checked={owner.isCEO}
                  onCheckedChange={(checked) => updateOwner(owner.id, "isCEO", !!checked)}
                />
                <label htmlFor={`isCEO-${owner.id}`} className="text-sm font-medium">
                  CEO
                </label>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                required
                value={owner.fullName}
                onChange={(e) => updateOwner(owner.id, "fullName", e.target.value)}
                placeholder="Enter full name"
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
                onChange={(e) => updateOwner(owner.id, "ownership", e.target.value)}
                placeholder="Enter ownership percentage"
                className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>

            {(owners.length === 1 || owner.isCEO) && (
              <div className="space-y-4 pt-2 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Birth Date</label>
                  <Input
                    required
                    type="date"
                    value={owner.birthDate || ""}
                    onChange={(e) => updateOwner(owner.id, "birthDate", e.target.value)}
                    className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">ID Document</label>
                    <p className="text-sm text-gray-500">
                      Please upload either your <span className="font-medium text-indigo-600">Driving License</span> or{" "}
                      <span className="font-medium text-indigo-600">Passport</span>
                    </p>
                  </div>

                  <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Input
                        required={!owner.documentUrl}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(owner.id, e)}
                        disabled={uploadingFiles[owner.id]}
                        className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
                      />
                      {uploadingFiles[owner.id] ? (
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                      ) : (
                        <FileUp className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    {owner.documentName && (
                      <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                        <span>Current file: {owner.documentName}</span>
                        {owner.documentUrl && (
                          <a
                            href={owner.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            View
                          </a>
                        )}
                      </div>
                    )}

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <span className="inline-block w-1.5 h-1.5 bg-indigo-600 rounded-full mr-1"></span>
                        Max size: 5MB
                      </span>
                      <span className="flex items-center">
                        <span className="inline-block w-1.5 h-1.5 bg-indigo-600 rounded-full mr-1"></span>
                        Accepted formats: PDF, JPG, PNG
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Total Ownership: <span className={getOwnershipStatus().color}>{getOwnershipStatus().message}</span>
            </span>
            <Button type="button" variant="outline" onClick={addOwner} className="flex items-center gap-2">
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
          <Button type="button" variant="outline" onClick={onBack} className="px-8">
            Back
          </Button>
          <Button
            type="submit"
            disabled={owners.some((owner) => !owner.fullName || !owner.ownership) || Object.values(uploadingFiles).some(Boolean)}
            className="px-8 bg-[#3659fb] hover:bg-[#4b6bff] text-white transition-colors duration-200"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}