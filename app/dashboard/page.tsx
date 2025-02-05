// src/app/dashboard/page.tsx
"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building, 
  FileText,
  Clock,
  CheckCircle2,
  CircleDollarSign,
  FileCheck,
  AlertCircle,
  ArrowUpRight,
  Users,
  Building2,
  AlertTriangle,
  Briefcase,
  ExternalLink,
  ArrowDownRight
} from "lucide-react"
import { getBusinesses } from "@/utils/firebase"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface Business {
  id: string;
  company: { name: string; type: string; industry: string };
  documents: Record<string, { url: string; name: string }>;
  paymentDetails: {
    amount: number;
    currency: string;
    status: string;
    createdAt: { seconds: number; nanoseconds: number };
  };
  status: string;
  country: { name: string };
  owner: Array<{
    fullName: string;
    ownership: string;
    isCEO: boolean;
  }>;
  createdAt: { _methodName?: string; _seconds?: number; seconds?: number };
}

const COLORS = ['#4F46E5', '#7C3AED', '#2563EB', '#9333EA'];

const formatTimestamp = (timestamp: any, business?: Business) => {
  if (!timestamp) return 'N/A';
  
  try {
    if (timestamp._methodName === 'serverTimestamp' && business?.paymentDetails?.createdAt) {
      const paymentCreatedAt = business.paymentDetails.createdAt;
      return new Date(paymentCreatedAt.seconds * 1000).toLocaleString();
    }

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

const isBusinessCompleted = (business: Business) => {
  if (!business.documents) return false;
  const requiredDocuments = ['filedArticles', 'einTaxId', 'organizerStatement', 'boiReport'];
  return requiredDocuments.every(doc => business.documents[doc]);
};

const documentStatusText = (business: Business) => {
  if (!business.documents) return { count: 0, text: 'No documents uploaded' };
  const count = Object.keys(business.documents).length;
  return { count, text: count === 4 ? 'All documents received' : `${count}/4 documents uploaded` };
};

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (user?.uid) {
        try {
          const fetchedBusinesses = await getBusinesses(user.uid)
          setBusinesses(fetchedBusinesses)
        } catch (error) {
          console.error("Error fetching businesses:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchBusinesses()
  }, [user])

  const metrics = useMemo(() => {
    if (!businesses.length) return null

    const totalInvestment = businesses.reduce((sum, b) => sum + (b.paymentDetails?.amount || 0) / 100, 0)
    const completedBusinesses = businesses.filter(isBusinessCompleted).length
    const pendingBusinesses = businesses.length - completedBusinesses
    const latestBusiness = businesses[businesses.length - 1]
    const documentCount = latestBusiness?.documents ? Object.keys(latestBusiness.documents).length : 0

    const typeDistribution = businesses.reduce((acc: Record<string, number>, b) => {
      const type = b.company.type.toUpperCase();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const countryDistribution = businesses.reduce((acc: Record<string, number>, b) => {
      const country = b.country.name;
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    const timelineData = businesses.map(b => ({
      date: formatTimestamp(b.createdAt, b).split(',')[0],
      count: 1,
    })).reduce((acc: any[], curr) => {
      const existing = acc.find(item => item.date === curr.date)
      if (existing) {
        existing.count += curr.count
      } else {
        acc.push(curr)
      }
      return acc
    }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const monthlyInvestment = businesses.reduce((acc: any[], b) => {
      const date = formatTimestamp(b.createdAt, b).split(',')[0];
      const amount = b.paymentDetails?.amount ? b.paymentDetails.amount / 100 : 0;
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.amount += amount;
      } else {
        acc.push({ date, amount });
      }
      return acc;
    }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalInvestment,
      completedBusinesses,
      pendingBusinesses,
      documentCount,
      typeDistribution,
      countryDistribution,
      timelineData,
      monthlyInvestment
    }
  }, [businesses])

  const renderSingleBusinessDashboard = (business: Business) => {
    const isComplete = isBusinessCompleted(business);
    const docStatus = documentStatusText(business);

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user?.displayName || user?.email?.split("@")[0]}
          </h1>
          <p className="text-gray-500 mt-2">Your business registration status</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-indigo-100 hover:shadow-md transition-all col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                    {business.company.name}
                  </CardTitle>
                  <CardDescription>
                    {business.company.type.toUpperCase()} - {business.company.industry}
                  </CardDescription>
                </div>
                <div className={`px-4 py-2 rounded-full ${
                  isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isComplete ? 'Completed' : 'In Progress'}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Registration Date</p>
                    <p className="font-medium mt-1">{formatTimestamp(business.createdAt, business)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Company Location</p>
                    <p className="font-medium mt-1">{business.country.name}</p>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      business.paymentDetails?.status === 'succeeded' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {business.paymentDetails?.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">${(business.paymentDetails?.amount / 100).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {formatTimestamp(business.paymentDetails?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-indigo-100 hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/business')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Documents
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <CircleDollarSign className="mr-2 h-4 w-4" />
                  Payment History
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Owner Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Progress */}
        <Card className="border border-indigo-100">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Registration Documents</CardTitle>
            <CardDescription>Track your document submission progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: 'filedArticles', name: 'Filed Articles' },
                { key: 'einTaxId', name: 'EIN / Tax ID Number' },
                { key: 'organizerStatement', name: 'Statement of the Organizer' },
                { key: 'boiReport', name: 'BOI Report' }
              ].map((doc) => {
                const document = business.documents?.[doc.key];
                return (
                  <div key={doc.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {document ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        {document && (
                          <p className="text-sm text-gray-500">{document.name}</p>
                        )}
                      </div>
                    </div>
                    {document && (
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        <span>View</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {!isComplete && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <h3 className="font-medium">Registration in Progress</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {docStatus.text}. We'll notify you when new documents are ready.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderMultiBusinessDashboard = () => {
    if (!metrics) return null;

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user?.displayName || user?.email?.split("@")[0]}
            </h1>
            <p className="text-gray-500 mt-2">Here's an overview of your business portfolio</p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/business?register=true')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Building className="mr-2 h-4 w-4" />
            Register New Business
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border border-indigo-100 hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-600">Total Businesses</CardTitle>
                  <Building className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{businesses.length}</div>
                  <div className="flex items-center text-sm text-green-500 mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    Active Companies
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-indigo-100 hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-600">Total Investment</CardTitle>
                  <CircleDollarSign className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.totalInvestment.toLocaleString()}</div>
                  <div className="flex items-center text-sm text-green-500 mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    Capital Invested
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-indigo-100 hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-600">Completed</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.completedBusinesses}</div>
                  <div className="flex items-center text-sm text-green-500 mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    Fully Registered
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-indigo-100 hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-600">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.pendingBusinesses}</div>
                  <div className="flex items-center text-sm text-yellow-500 mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    In Progress
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Businesses */}
            <Card className="border border-indigo-100">
              <CardHeader>
                <CardTitle>Recent Registrations</CardTitle>
                <CardDescription>Latest business registration activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businesses.slice(-3).reverse().map((business) => {
                    const docStatus = documentStatusText(business);
                    return (
                      <div key={business.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            isBusinessCompleted(business) ? 'bg-green-100' : 'bg-yellow-100'
                          }`}>
                            <Building2 className={`h-5 w-5 ${
                              isBusinessCompleted(business) ? 'text-green-600' : 'text-yellow-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{business.company.name}</p>
                            <p className="text-sm text-gray-500">
                              {business.company.type.toUpperCase()} • {docStatus.text}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${(business.paymentDetails?.amount / 100).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(business.createdAt, business).split(',')[0]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Investment Timeline */}
            <Card className="border border-indigo-100">
              <CardHeader>
                <CardTitle>Investment Timeline</CardTitle>
                <CardDescription>Total investment over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.monthlyInvestment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`$${value}`, "Investment"]}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        padding: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#4F46E5"
                      strokeWidth={2}
                      dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#4F46E5', stroke: 'white', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {businesses.map((business) => {
              const isComplete = isBusinessCompleted(business);
              return (
                <Card key={business.id} className="border border-indigo-100">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{business.company.name}</CardTitle>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isComplete ? 'Completed' : 'In Progress'}
                      </div>
                    </div>
                    <CardDescription>
                      Registration started on {formatTimestamp(business.createdAt, business)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { key: 'filedArticles', name: 'Filed Articles' },
                        { key: 'einTaxId', name: 'EIN / Tax ID Number' },
                        { key: 'organizerStatement', name: 'Statement of the Organizer' },
                        { key: 'boiReport', name: 'BOI Report' }
                      ].map((doc) => {
                        const document = business.documents?.[doc.key];
                        return (
                          <div key={doc.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {document ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-yellow-500" />
                              )}
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                {document && (
                                  <p className="text-sm text-gray-500">{document.name}</p>
                                )}
                              </div>
                            </div>
                            {document && (
                              <a
                                href={document.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-2"
                              >
                                <span>View</span>
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Distribution Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border border-indigo-100">
                <CardHeader>
                  <CardTitle>Business Types</CardTitle>
                  <CardDescription>Distribution of registered business types</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(metrics.typeDistribution).map(([name, value]) => ({
                          name,
                          value
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {Object.entries(metrics.typeDistribution).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border border-indigo-100">
                <CardHeader>
                  <CardTitle>Countries</CardTitle>
                  <CardDescription>Geographic distribution of businesses</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(metrics.countryDistribution).map(([name, value]) => ({
                          name,
                          value
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {Object.entries(metrics.countryDistribution).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Registration Timeline */}
            <Card className="border border-indigo-100">
              <CardHeader>
                <CardTitle>Registration Activity</CardTitle>
                <CardDescription>Business registrations over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value: any) => [value, "Registrations"]}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        padding: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#4F46E5"
                      strokeWidth={2}
                      dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#4F46E5', stroke: 'white', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/signin");
    return null;
  }

  if (!businesses.length) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Business Registration
            </h1>
            <p className="text-gray-500 mt-2">Start your business journey today</p>
          </div>

          <Card className="border border-indigo-100 hover:border-indigo-200 transition-colors">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Register Your First Business
              </CardTitle>
              <CardDescription>Begin your entrepreneurship journey with us</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Why register with us?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Streamlined Process</p>
                        <p className="text-sm text-gray-600">Quick and easy business registration process</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Document Management</p>
                        <p className="text-sm text-gray-600">Secure storage and handling of all business documents</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Expert Support</p>
                        <p className="text-sm text-gray-600">Guidance throughout the registration process</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <Button 
                    onClick={() => router.push('/dashboard/business?register=true')}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    size="lg"
                  >
                    <Building className="mr-2 h-5 w-5" />
                    Start Business Registration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-indigo-100">
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  If you have any questions about the registration process, our support team is here to help.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {businesses.length === 1 ? (
        renderSingleBusinessDashboard(businesses[0])
      ) : (
        renderMultiBusinessDashboard()
      )}
    </DashboardLayout>
  );
}