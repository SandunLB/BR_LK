"use client";

import { useState } from "react";
import { Loader2, FileText, X } from "lucide-react";

interface Business {
  id: string;
  userId: string;
  documents?: {
    [key: string]: {
      url: string;
      name: string;
    };
  };
}

interface EditBusinessProps {
  business: Business;
  onClose: () => void;
  onUpdate: (updatedBusiness: Business) => void;
}

export function EditBusiness({ business, onClose, onUpdate }: EditBusinessProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<{ [key: string]: File }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});
  const [currentBusiness, setCurrentBusiness] = useState<Business>(business);

  // Create an array of document slots (1 to 5)
  const documentSlots = [1, 2, 3, 4, 5].map(num => ({
    id: `doc${num}`,
    label: `Document ${num}`,
    existingDoc: currentBusiness.documents?.[`doc${num}`] || null
  }));

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

  const handleFileUpload = async (file: File, docNumber: string) => {
    try {
      setUploadProgress(prev => ({ ...prev, [docNumber]: true }));
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', currentBusiness.userId);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return {
        url: data.url,
        name: file.name
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploadProgress(prev => ({ ...prev, [docNumber]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const documentUrls = {
        ...(currentBusiness.documents || {})
      };

      // Upload each new document
      for (const [docNumber, file] of Object.entries(documents)) {
        try {
          const result = await handleFileUpload(file, docNumber);
          documentUrls[docNumber] = result;
        } catch (error) {
          setError(`Failed to upload ${docNumber}`);
          setIsLoading(false);
          return;
        }
      }

      // Update business with all documents
      const response = await fetch(
        `/api/businesses/${currentBusiness.userId}/${currentBusiness.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documents: documentUrls
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update business');
      }

      const result = await response.json();
      
      // Update local state before calling onUpdate
      setCurrentBusiness(result.data);
      onUpdate(result.data);
      
      // Clear the documents state
      setDocuments({});
      
      // Close the modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveExistingDocument = async (docNumber: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedDocuments = { ...currentBusiness.documents };
      delete updatedDocuments[docNumber];

      const response = await fetch(
        `/api/businesses/${currentBusiness.userId}/${currentBusiness.id}`,
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

      if (!response.ok) {
        throw new Error('Failed to remove document');
      }

      const result = await response.json();
      setCurrentBusiness(result.data);
      onUpdate(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Manage Documents</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentSlots.map(slot => (
              <div key={slot.id} className="border rounded-lg p-4">
                <div className="mb-2 font-medium flex justify-between items-center">
                  <span>{slot.label}</span>
                  {slot.existingDoc && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      Uploaded
                    </span>
                  )}
                </div>

                {/* Existing Document */}
                {slot.existingDoc && (
                  <div className="mb-3 p-2 bg-gray-50 rounded flex justify-between items-center">
                    <a
                      href={slot.existingDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2 flex-1 min-w-0"
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{slot.existingDoc.name}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingDocument(slot.id)}
                      className="ml-2 p-1 hover:bg-red-50 rounded-full text-red-500"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload New Document */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => handleFileSelect(slot.id, e.target.files?.[0] || null)}
                    className="hidden"
                    id={slot.id}
                    accept=".pdf,.doc,.docx,.txt"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor={slot.id}
                    className={`px-3 py-1.5 border rounded hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>{slot.existingDoc ? 'Replace Document' : 'Upload Document'}</span>
                  </label>
                </div>

                {/* New File Selected */}
                {documents[slot.id] && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-600 truncate flex-1">
                      {documents[slot.id].name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDocument(slot.id)}
                      className="p-1 hover:bg-red-50 rounded-full text-red-500"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress[slot.id] && (
                  <div className="mt-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={isLoading}
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