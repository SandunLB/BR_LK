"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Edit, FileText, Eye, X } from "lucide-react";

// Edit Business Component
interface EditBusinessProps {
  business: any;
  onClose: () => void;
  onUpdate: (updatedBusiness: any) => void;
}

function EditBusiness({ business, onClose, onUpdate }: EditBusinessProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<{ [key: string]: File }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});

  const handleFileSelect = (docNumber: string, file: File | null) => {
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [docNumber]: file
      }));
    }
  };

  const removeDocument = (docNumber: string) => {
    const newDocs = { ...documents };
    delete newDocs[docNumber];
    setDocuments(newDocs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const documentUrls: { [key: string]: { url: string; name: string } } = {};

      for (const [docNumber, file] of Object.entries(documents)) {
        setUploadProgress(prev => ({ ...prev, [docNumber]: true }));
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', business.userId);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) throw new Error(`Failed to upload document ${docNumber}`);
        
        const { url } = await uploadResponse.json();
        
        documentUrls[docNumber] = {
          url,
          name: file.name
        };

        setUploadProgress(prev => ({ ...prev, [docNumber]: false }));
      }

      const response = await fetch(
        `/api/businesses/${business.userId}/${business.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documents: {
              ...(business.documents || {}),
              ...documentUrls
            }
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update business');

      const result = await response.json();
      onUpdate(result.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Manage Documents</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload New Documents */}
          <div>
            <h3 className="font-medium mb-4">Upload New Documents</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Document {num}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        onChange={(e) => handleFileSelect(`doc${num}`, e.target.files?.[0] || null)}
                        className="hidden"
                        id={`doc${num}`}
                      />
                      <label
                        htmlFor={`doc${num}`}
                        className="px-4 py-2 border rounded hover:bg-gray-50 cursor-pointer flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Choose File</span>
                      </label>
                      {documents[`doc${num}`] && (
                        <>
                          <span className="text-sm text-gray-600 truncate max-w-xs">
                            {documents[`doc${num}`].name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDocument(`doc${num}`)}
                            className="p-1 hover:bg-red-50 rounded-full text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {uploadProgress[`doc${num}`] && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Documents */}
          {business.documents && Object.keys(business.documents).length > 0 && (
            <div>
              <h3 className="font-medium mb-4">Current Documents</h3>
              <div className="space-y-2 bg-gray-50 p-4 rounded">
                {Object.entries(business.documents).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <span className="font-medium">{key}</span>
                    <a
                      href={value.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{value.name}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || Object.keys(documents).length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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

// Main Business Page Component
export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBusinessForEdit, setSelectedBusinessForEdit] = useState<any>(null);

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

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp._methodName === 'serverTimestamp') return 'Pending...';
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return 'Invalid Date';
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = 
      business.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.path?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Businesses ({businesses.length})</h1>
        
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            {/* Business Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{business.company?.name}</h2>
                <p className="text-sm text-gray-500">ID: {business.id}</p>
                <p className="text-sm text-gray-500">User Email: {business.userEmail}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedBusinessForEdit(business)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
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

            {/* Business Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Company & Package Info */}
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

              {/* Address */}
              <div>
                <h3 className="font-semibold mb-2">Address</h3>
                <div className="space-y-1 text-sm">
                  <p>{business.address?.street}</p>
                  <p>{business.address?.city}, {business.address?.state}</p>
                  <p>{business.address?.postalCode}</p>
                  <p>{business.address?.country}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="font-semibold mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm">
                  <p>Amount: ${(business.paymentDetails?.amount / 100).toFixed(2)}</p>
                  <p>Currency: {business.paymentDetails?.currency}</p>
                  <p>Method: {business.paymentDetails?.paymentMethod}</p>
                  <p>Status: {business.paymentDetails?.status}</p>
                  <p className="truncate">
                    ID: {business.paymentDetails?.stripePaymentIntentId}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            {business.documents && Object.keys(business.documents).length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(business.documents).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium text-sm">{key}</span>
                      <a
                        href={value.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{value.name}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owners Section */}
            {business.owner && business.owner.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Owners</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {business.owner.map((owner: any) => (
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

            {/* Timestamps */}
            <div className="mt-6 pt-4 border-t text-sm text-gray-500">
              <div>Created: {formatTimestamp(business.createdAt)}</div>
              <div>Updated: {formatTimestamp(business.updatedAt)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Business Modal */}
      {selectedBusinessForEdit && (
        <EditBusiness
          business={selectedBusinessForEdit}
          onClose={() => setSelectedBusinessForEdit(null)}
          onUpdate={(updatedBusiness) => {
            setBusinesses(businesses.map(b => 
              b.id === updatedBusiness.id ? updatedBusiness : b
            ));
            setSelectedBusinessForEdit(null);
          }}
        />
      )}
    </div>
  );
}