"use client";

import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getBusinesses } from "@/utils/firebase";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Copy, AlertCircle, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PaymentsPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'date',
    direction: 'desc'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid) {
        try {
          const businesses = await getBusinesses(user.uid);
          setBusinesses(businesses);
          setError(null);
        } catch (error) {
          console.error("Error fetching businesses:", error);
          setError("Failed to load payment history. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [user]);

  const handleCopyId = (paymentId: string) => {
    navigator.clipboard.writeText(paymentId);
  };

  const sortedBusinesses = [...businesses].sort((a, b) => {
    if (!sortConfig) return 0;
    const key = sortConfig.key;
    
    if (key === 'date') {
      const dateA = a.paymentDetails?.createdAt?.toDate().getTime() || 0;
      const dateB = b.paymentDetails?.createdAt?.toDate().getTime() || 0;
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (key === 'amount') {
      return sortConfig.direction === 'asc' 
        ? a.paymentDetails?.amount - b.paymentDetails?.amount 
        : b.paymentDetails?.amount - a.paymentDetails?.amount;
    }
    
    return 0;
  });

  const totalRevenue = businesses.reduce((acc, business) => 
    acc + (business.paymentDetails?.status === 'succeeded' ? business.paymentDetails?.amount : 0), 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4 p-8">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">{error}</h2>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Payment History
            </h1>
            <p className="text-gray-500 mt-2">All payment transactions for your registered businesses</p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader className="pb-2">
                <CardDescription>Total Payments</CardDescription>
                <CardTitle className="text-3xl">
                  ${(totalRevenue / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-2">
                <CardDescription>Successful Payments</CardDescription>
                <CardTitle className="text-3xl">
                  {businesses.filter(b => b.paymentDetails?.status === 'succeeded').length}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-50 to-orange-50">
              <CardHeader className="pb-2">
                <CardDescription>Failed Payments</CardDescription>
                <CardTitle className="text-3xl">
                  {businesses.filter(b => b.paymentDetails?.status !== 'succeeded').length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription className="mt-2">
                    {businesses.length} transactions found
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => setSortConfig({
                            key: 'date',
                            direction: sortConfig?.direction === 'asc' ? 'desc' : 'asc'
                          })}
                        >
                          Date
                          <ArrowUpDown className="h-4 w-4 ml-2" />
                        </Button>
                      </TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBusinesses.map((business) => (
                      <TableRow key={business.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="font-medium">
                            {new Date(business.paymentDetails?.createdAt?.toDate()).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(business.paymentDetails?.createdAt?.toDate()).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{business.company?.name}</div>
                          <div className="text-sm text-gray-500">{business.company?.type}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {business.paymentDetails?.paymentMethod || 'card'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${(business.paymentDetails?.amount / 100).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {business.paymentDetails?.status === "succeeded" ? (
                              <CheckCircledIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <CrossCircledIcon className="h-5 w-5 text-red-600" />
                            )}
                            <span className={cn(
                              "font-medium",
                              business.paymentDetails?.status === "succeeded" ? "text-green-600" : "text-red-600"
                            )}>
                              {business.paymentDetails?.status === "succeeded" ? "Success" : "Failed"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 px-2 font-mono text-sm"
                                onClick={() => handleCopyId(business.paymentDetails?.stripePaymentIntentId)}
                              >
                                {business.paymentDetails?.stripePaymentIntentId?.substring(0, 6)}...
                                <Copy className="h-3.5 w-3.5 ml-2" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Click to copy full ID: {business.paymentDetails?.stripePaymentIntentId}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {businesses.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 gap-4">
                  <AlertCircle className="h-12 w-12 text-gray-400" />
                  <h3 className="text-lg font-medium">No payment history found</h3>
                  <p className="text-gray-500">Your registered businesses will appear here once payments are processed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}