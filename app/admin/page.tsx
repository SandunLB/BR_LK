"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Building, 
  DollarSign,
  Check,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface Business {
  id: string;
  path: string;
  status: 'completed' | 'draft';
  company?: {
    name: string;
  };
  paymentDetails?: {
    amount: number;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalBusinesses: number;
  completedBusinesses: number;
  totalRevenue: number;
  recentBusinesses: Business[];
}

interface ApiResponse {
  users: { id: string }[];
  businesses: Business[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBusinesses: 0,
    completedBusinesses: 0,
    totalRevenue: 0,
    recentBusinesses: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersResponse, businessesResponse] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/businesses')
      ]);

      const [{ users }, { businesses }] = await Promise.all([
        usersResponse.json(),
        businessesResponse.json()
      ]) as [{ users: ApiResponse['users'] }, { businesses: ApiResponse['businesses'] }];

      const totalRevenue = businesses.reduce((sum: number, business: Business) => 
        sum + (business.paymentDetails?.amount || 0), 0
      );

      const completedBusinesses = businesses.filter(
        (business: Business) => business.status === 'completed'
      ).length;

      setStats({
        totalUsers: users.length,
        totalBusinesses: businesses.length,
        completedBusinesses,
        totalRevenue: totalRevenue / 100,
        recentBusinesses: businesses.slice(-5).reverse()
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
          <Link 
            href="/admin/users"
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View all users
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Total Businesses */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Businesses</p>
              <h3 className="text-2xl font-bold">{stats.totalBusinesses}</h3>
            </div>
            <Building className="w-10 h-10 text-indigo-500" />
          </div>
          <Link 
            href="/admin/businesses"
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View all businesses
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Completed Businesses */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed Registrations</p>
              <h3 className="text-2xl font-bold">{stats.completedBusinesses}</h3>
            </div>
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Success rate: {((stats.completedBusinesses / stats.totalBusinesses) * 100).toFixed(1)}%
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <h3 className="text-2xl font-bold">
                ${stats.totalRevenue.toLocaleString()}
              </h3>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Avg. per business: ${(stats.totalRevenue / stats.totalBusinesses || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Recent Businesses */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Recent Businesses</h2>
        <div className="space-y-4">
          {stats.recentBusinesses.map((business: Business) => (
            <div key={business.id} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{business.company?.name || 'Unnamed Business'}</h3>
                  <div className="text-sm text-gray-500">{business.path}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm
                  ${business.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {business.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}