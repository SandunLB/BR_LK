"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import type { User, Business } from "@/types/index";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.businesses.some(business => 
      business.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users ({users.length})</h1>
        
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users or businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredUsers.map(user => (
          <div key={user.uid} className="bg-white rounded-lg shadow-sm">
            {/* User Header */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{user.email}</h3>
                  <div className="text-sm text-gray-500">ID: {user.uid}</div>
                  {user.displayName && (
                    <div className="text-sm text-gray-500">Name: {user.displayName}</div>
                  )}
                </div>
                <div className="text-sm text-gray-500 text-right">
                  <div>Created: {formatDate(user.creationTime)}</div>
                  <div>Last Sign In: {formatDate(user.lastSignInTime)}</div>
                  <div>
                    Providers: {user.providerData.map(p => p.providerId).join(', ')}
                  </div>
                </div>
              </div>
            </div>

            {/* User's Businesses */}
            <div className="p-4">
              <h4 className="font-medium mb-3">
                Businesses ({user.businesses.length})
              </h4>
              
              {user.businesses.length > 0 ? (
                <div className="space-y-4">
                  {user.businesses.map(business => (
                    <div key={business.id} className="border rounded p-3">
                      <div className="text-xs text-gray-500 font-mono mb-2">
                        {business.path}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Company Info */}
                        <div>
                          <h5 className="font-medium mb-1">Company Details</h5>
                          <div className="text-sm">
                            <div>Name: {business.company?.name || 'N/A'}</div>
                            <div>Type: {business.company?.type || 'N/A'}</div>
                            <div>Industry: {business.company?.industry || 'N/A'}</div>
                          </div>
                        </div>

                        {/* Address */}
                        {business.address && (
                          <div>
                            <h5 className="font-medium mb-1">Address</h5>
                            <div className="text-sm">
                              <div>{business.address.street}</div>
                              <div>{business.address.city}, {business.address.state}</div>
                              <div>{business.address.postalCode}, {business.address.country}</div>
                            </div>
                          </div>
                        )}

                        {/* Status & Payment */}
                        <div>
                          <h5 className="font-medium mb-1">Status & Payment</h5>
                          <div className="text-sm">
                            <div>
                              Status: 
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs
                                ${business.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {business.status}
                              </span>
                            </div>
                            {business.paymentDetails && (
                              <>
                                <div>Amount: ${(business.paymentDetails.amount / 100).toFixed(2)}</div>
                                <div>Method: {business.paymentDetails.paymentMethod}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Owner Information */}
                      {business.owner && business.owner.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-1">Owners</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {business.owner.map(owner => (
                              <div key={owner.id} className="text-sm border-l-2 pl-3">
                                <div>{owner.fullName}</div>
                                <div>Ownership: {owner.ownership}%</div>
                                {owner.documentUrl && (
                                  <a
                                    href={owner.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View Document
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw Data */}
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-gray-500">
                          View Raw Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                          {JSON.stringify(business, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No businesses registered</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}