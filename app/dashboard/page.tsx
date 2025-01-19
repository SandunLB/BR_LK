'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreditCard, Users, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/signin');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.displayName || user.email?.split('@')[0]}</h1>
          <p className="text-gray-500 mt-2">Here's what's happening with your business today.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Revenue
              </CardTitle>
              <CreditCard className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <div className="flex items-center text-sm text-green-500 mt-1">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +20.1% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Customers
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,350</div>
              <div className="flex items-center text-sm text-green-500 mt-1">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +180.1% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Active Now
              </CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <div className="flex items-center text-sm text-red-500 mt-1">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                -201 since last hour
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your most recent transactions and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div className="flex-1">New customer signed up</div>
                    <div className="text-gray-500">2 min ago</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center gap-4 rounded-lg border p-3 hover:bg-gray-50 cursor-pointer">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium">Process Payment</div>
                    <div className="text-sm text-gray-500">Accept payments from customers</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-3 hover:bg-gray-50 cursor-pointer">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium">Add Customer</div>
                    <div className="text-sm text-gray-500">Create a new customer profile</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

