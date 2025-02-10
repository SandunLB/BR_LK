"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  Search, 
  FileText, 
  X, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react";

interface Document {
  url: string;
  name: string;
}

interface Owner {
  id: string;
  fullName: string;
  ownership: number;
  birthDate: string;
  documentUrl?: string;
  documentName?: string;
}

interface PaymentDetails {
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  stripePaymentIntentId: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

interface Business {
  id: string;
  userId: string;
  userEmail: string;
  status: 'completed' | 'draft';
  company?: {
    name: string;
    type: string;
    industry: string;
  };
  country?: {
    name: string;
  };
  package?: {
    name: string;
    price: number;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentDetails?: PaymentDetails;
  documents?: Record<string, Document>;
  owner?: Owner[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

interface EditBusinessProps {
  business: Business;
  onClose: () => void;
  onUpdate: (updatedBusiness: Business) => void;
}

interface DocumentType {
  key: string;
  name: string;
}

interface DocumentTypes {
  [key: string]: string;
}


const getRequiredDocuments = (country: string, packageName: string): DocumentTypes => {
  if (country === "United Kingdom") {
    return {
      businessRegistration: 'Business Registration'
    };
  }

  if (country === "United States") {
    const docs: DocumentTypes = {
      filedArticlesAndOrganizer: 'Filed Articles & Statement of the Organizer',
      einTaxId: 'EIN / Tax ID Number',
      boiReport: 'BOI Report'
    };

    if (packageName === "enterprise") {
      return {
        ...docs,
        itinNumber: 'ITIN Number'
      };
    }

    return docs;
  }

  return {};
};

function EditBusiness({ business, onClose, onUpdate }: EditBusinessProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const DOCUMENT_TYPES = getRequiredDocuments(
    business.country?.name || '',
    business.package?.name || ''
  );

  const handleFileSelect = (docKey: string, file: File | null) => {
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [docKey]: file
      }));
    }
  };

  const removeDocument = (docKey: string) => {
    const newDocs = { ...documents };
    delete newDocs[docKey];
    setDocuments(newDocs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const documentUrls: Record<string, Document> = {};
      const totalFiles = Object.keys(documents).length;
      let uploadedCount = 0;

      for (const [docKey, file] of Object.entries(documents)) {
        setUploadProgress(prev => ({ ...prev, [docKey]: true }));
        setSuccessMessage(`Uploading file ${++uploadedCount} of ${totalFiles}...`);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', business.userId);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        // Now TypeScript knows that DOCUMENT_TYPES[docKey] is safe
        if (!uploadResponse.ok) {
          const docName = DOCUMENT_TYPES[docKey] || 'document';
          throw new Error(`Failed to upload ${docName}`);
        }
        
        const { url } = await uploadResponse.json();
        
        documentUrls[docKey] = {
          url,
          name: file.name
        };

        setUploadProgress(prev => ({ ...prev, [docKey]: false }));
      }

      const updatedDocuments = {
        ...(business.documents || {}),
        ...documentUrls
      };

      setSuccessMessage('Saving changes...');

      const response = await fetch(
        `/api/businesses/${business.userId}/${business.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documents: updatedDocuments
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update business');

      const result = await response.json();

      const updatedBusiness = {
        ...business,
        documents: updatedDocuments,
        updatedAt: result.data.updatedAt
      };

      onUpdate(updatedBusiness);
      setDocuments({});
      setSuccessMessage(`Successfully uploaded ${totalFiles} document${totalFiles > 1 ? 's' : ''}!`);
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h2 className="text-xl font-bold">Manage Documents</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload and manage business documentation for {business.country?.name}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="font-medium mb-4 flex items-center">
              <span>Required Documents</span>
              {isLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            </h3>
            <div className="space-y-4">
              {Object.entries(DOCUMENT_TYPES).map(([key, name]) => (
                <div key={key} className="p-4 border rounded-lg hover:border-blue-200 transition-colors">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      {name}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        onChange={(e) => handleFileSelect(key, e.target.files?.[0] || null)}
                        className="hidden"
                        id={key}
                        accept=".pdf,.doc,.docx,.txt"
                      />
                      <label
                        htmlFor={key}
                        className="px-4 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 cursor-pointer flex items-center space-x-2 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Choose File</span>
                      </label>
                      {documents[key] && (
                        <div className="flex items-center flex-1 min-w-0">
                          <span className="text-sm text-gray-600 truncate">
                            {documents[key].name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDocument(key)}
                            className="ml-2 p-1 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {uploadProgress[key] && (
                        <div className="flex items-center text-blue-600">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm">Uploading...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {business.documents && Object.keys(business.documents).length > 0 && (
            <div className="pt-6 border-t">
              <h3 className="font-medium mb-4">Current Documents</h3>
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                {Object.entries(DOCUMENT_TYPES).map(([key, name]) => {
                  const doc = business.documents?.[key];
                  if (!doc) return null;
                  
                  return (
                    <div key={key} className="flex items-center justify-between p-4 hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-700">{name}</span>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-2 px-3 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{doc.name}</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || Object.keys(documents).length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </span>
              ) : (
                'Upload Documents'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'draft'>("all");
  const [selectedBusinessForEdit, setSelectedBusinessForEdit] = useState<Business | null>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/businesses');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setBusinesses(data.businesses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch businesses');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: any, business?: Business) => {
    if (!timestamp) return 'N/A';
    
    try {
      // If it's the createdAt field and it's serverTimestamp, use paymentDetails.createdAt
      if (timestamp._methodName === 'serverTimestamp' && business?.paymentDetails?.createdAt) {
        const paymentCreatedAt = business.paymentDetails.createdAt;
        return new Date(paymentCreatedAt.seconds * 1000).toLocaleString();
      }
  
      // Handle seconds and nanoseconds case
      if (timestamp._seconds || timestamp.seconds) {
        const seconds = timestamp._seconds || timestamp.seconds;
        return new Date(seconds * 1000).toLocaleString();
      }
  
      return 'N/A';
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'N/A';
    }
  };

  const handleBusinessUpdate = (updatedBusiness: Business) => {
    setBusinesses(prevBusinesses => 
      prevBusinesses.map(b => 
        b.id === updatedBusiness.id ? updatedBusiness : b
      )
    );
    setSelectedBusinessForEdit(null);
  };

  const handleOpenModal = (business: Business) => {
    const currentBusiness = businesses.find(b => b.id === business.id);
    setSelectedBusinessForEdit(currentBusiness || business);
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = 
      business.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || business.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-600 p-4 rounded-lg max-w-xl text-center">
          <p className="font-medium mb-2">Error loading businesses</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Businesses ({businesses.length})</h1>
        
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'draft')}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredBusinesses.map(business => (
          <div key={business.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{business.company?.name || 'Unnamed Business'}</h2>
                <p className="text-sm text-gray-500">ID: {business.id}</p>
                <p className="text-sm text-gray-500">User Email: {business.userEmail}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenModal(business)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Manage Documents"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  business.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {business.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Company Details</h3>
                  <div className="space-y-1 text-sm">
                    <p>Type: {business.company?.type}</p>
                    <p>Industry: {business.company?.industry}</p>
                    <p>Country: {business.country?.name}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Package</h3>
                  <div className="space-y-1 text-sm">
                    <p>Name: {business.package?.name}</p>
                    <p>Price: ${business.package?.price}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Address</h3>
                <div className="space-y-1 text-sm">
                  <p>{business.address?.street}</p>
                  <p>{business.address?.city}, {business.address?.state}</p>
                  <p>{business.address?.postalCode}</p>
                  <p>{business.address?.country}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm">
                  <p>Amount: ${(business.paymentDetails?.amount ?? 0 / 100).toFixed(2)}</p>
                  <p>Currency: {business.paymentDetails?.currency}</p>
                  <p>Method: {business.paymentDetails?.paymentMethod}</p>
                  <p>Status: {business.paymentDetails?.status}</p>
                  <p className="truncate">
                    ID: {business.paymentDetails?.stripePaymentIntentId}
                  </p>
                </div>
              </div>
            </div>

            {business.documents && Object.keys(business.documents).length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(getRequiredDocuments(business.country?.name || '', business.package?.name || '')).map(([key, name]) => {
                    const doc = business.documents?.[key];
                    if (!doc) return null;

                    return (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium text-sm">{name}</span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                        >
                          <FileText className="w-4 h-4" />
                          <span>{doc.name}</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {business.owner && business.owner.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Owners</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {business.owner.map((owner) => (
                    <div key={owner.id} className="border rounded-lg p-4">
                      <div className="space-y-1 text-sm">
                        <p>Name: {owner.fullName}</p>
                        <p>Ownership: {owner.ownership}%</p>
                        <p>Birth Date: {owner.birthDate}</p>
                        {owner.documentUrl && (
                          <p>
                            Document: 
                            <a
                              href={owner.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-blue-600 hover:underline"
                            >
                              {owner.documentName}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t text-sm text-gray-500">
              <div>Created: {formatTimestamp(business.createdAt, business)}</div>
              <div>Updated: {formatTimestamp(business.updatedAt)}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedBusinessForEdit && (
        <EditBusiness
          business={selectedBusinessForEdit}
          onClose={() => setSelectedBusinessForEdit(null)}
          onUpdate={handleBusinessUpdate}
        />
      )}
    </div>
  );
}