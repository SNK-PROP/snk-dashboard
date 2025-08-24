"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiService } from "@/lib/api";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconHome,
  IconUserCheck,
  IconCurrency,
  IconRefresh,
  IconDownload,
  IconCalendar,
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("30d");
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [propertyTrendsData, setPropertyTrendsData] = useState([]);
  const [locationAnalytics, setLocationAnalytics] = useState([]);
  const [overviewStats, setOverviewStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBrokers: 0,
    totalRevenue: 0,
    userGrowth: 0,
    propertyGrowth: 0,
    brokerGrowth: 0,
    revenueGrowth: 0,
  });

  // Sample data for demonstration (replace with real API calls)
  const generateSampleData = () => {
    const userGrowth = [];
    const propertyTrends = [];
    const locations = [
      { name: "Mumbai", users: 1250, properties: 350, avgPrice: 2500000 },
      { name: "Delhi", users: 980, properties: 280, avgPrice: 1800000 },
      { name: "Bangalore", users: 850, properties: 220, avgPrice: 1200000 },
      { name: "Chennai", users: 620, properties: 180, avgPrice: 900000 },
      { name: "Hyderabad", users: 480, properties: 150, avgPrice: 800000 },
      { name: "Pune", users: 420, properties: 120, avgPrice: 1000000 },
    ];

    // Generate last 30 days data
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      userGrowth.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 50) + 20,
        brokers: Math.floor(Math.random() * 10) + 5,
        subBrokers: Math.floor(Math.random() * 15) + 8,
      });

      propertyTrends.push({
        date: date.toISOString().split('T')[0],
        properties: Math.floor(Math.random() * 25) + 10,
        active: Math.floor(Math.random() * 20) + 8,
        sold: Math.floor(Math.random() * 5) + 2,
        rented: Math.floor(Math.random() * 8) + 3,
      });
    }

    setUserGrowthData(userGrowth);
    setPropertyTrendsData(propertyTrends);
    setLocationAnalytics(locations);
    setOverviewStats({
      totalUsers: 4250,
      totalProperties: 1280,
      totalBrokers: 180,
      totalRevenue: 45600000,
      userGrowth: 12.5,
      propertyGrowth: 8.3,
      brokerGrowth: 15.2,
      revenueGrowth: 22.8,
    });
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, using generated data
      // In real implementation, you would call:
      // const [userGrowth, propertyTrends, locationData] = await Promise.all([
      //   apiService.getUserGrowthData(timePeriod),
      //   apiService.getPropertyTrendsData(timePeriod),
      //   apiService.getLocationAnalytics()
      // ]);
      
      generateSampleData();
      
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timePeriod]);

  const handleExportReport = () => {
    // Generate CSV report
    const csvData = [
      ["Date", "Users", "Properties", "Active Properties", "Revenue"],
      ...userGrowthData.map((item, index) => [
        item.date,
        item.users,
        propertyTrendsData[index]?.properties || 0,
        propertyTrendsData[index]?.active || 0,
        Math.random() * 100000 // Sample revenue data
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(",")).join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-report.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Analytics report exported successfully");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
    }).format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const propertyTypeData = [
    { name: 'Apartment', value: 45, count: 576 },
    { name: 'House', value: 25, count: 320 },
    { name: 'Villa', value: 15, count: 192 },
    { name: 'Commercial', value: 10, count: 128 },
    { name: 'Land', value: 5, count: 64 },
  ];

  const transactionTypeData = [
    { name: 'Sale', value: 65, count: 832 },
    { name: 'Rent', value: 30, count: 384 },
    { name: 'Lease', value: 5, count: 64 },
  ];

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                  Business insights and performance metrics
                </p>
              </div>
              <div className="flex gap-2">
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 3 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExportReport}>
                  <IconDownload className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={fetchAnalyticsData} disabled={loading}>
                  <IconRefresh
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <IconUsers className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <IconTrendingUp className="h-3 w-3 mr-1" />
                      +{overviewStats.userGrowth}%
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                  <IconHome className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.totalProperties.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <IconTrendingUp className="h-3 w-3 mr-1" />
                      +{overviewStats.propertyGrowth}%
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Brokers</CardTitle>
                  <IconUserCheck className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.totalBrokers}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <IconTrendingUp className="h-3 w-3 mr-1" />
                      +{overviewStats.brokerGrowth}%
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <IconCurrency className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(overviewStats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <IconTrendingUp className="h-3 w-3 mr-1" />
                      +{overviewStats.revenueGrowth}%
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Tabs */}
            <Tabs defaultValue="growth" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="growth">Growth Trends</TabsTrigger>
                <TabsTrigger value="properties">Property Analytics</TabsTrigger>
                <TabsTrigger value="locations">Location Insights</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              {/* Growth Trends Tab */}
              <TabsContent value="growth" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={userGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                          <YAxis />
                          <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="users"
                            stackId="1"
                            stroke="#8884d8"
                            fill="#8884d8"
                            name="Users"
                          />
                          <Area
                            type="monotone"
                            dataKey="brokers"
                            stackId="1"
                            stroke="#82ca9d"
                            fill="#82ca9d"
                            name="Brokers"
                          />
                          <Area
                            type="monotone"
                            dataKey="subBrokers"
                            stackId="1"
                            stroke="#ffc658"
                            fill="#ffc658"
                            name="Sub Brokers"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Property Listings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={propertyTrendsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                          <YAxis />
                          <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="properties"
                            stroke="#8884d8"
                            strokeWidth={2}
                            name="Total Properties"
                          />
                          <Line
                            type="monotone"
                            dataKey="active"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            name="Active"
                          />
                          <Line
                            type="monotone"
                            dataKey="sold"
                            stroke="#ff7300"
                            strokeWidth={2}
                            name="Sold"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Property Analytics Tab */}
              <TabsContent value="properties" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Property Types Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={propertyTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {propertyTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={transactionTypeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Location Insights Tab */}
              <TabsContent value="locations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={locationAnalytics} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value, name) => {
                          if (name === 'avgPrice') return [formatCurrency(value), 'Avg Price'];
                          return [value, name];
                        }} />
                        <Legend />
                        <Bar dataKey="users" fill="#8884d8" name="Users" />
                        <Bar dataKey="properties" fill="#82ca9d" name="Properties" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {locationAnalytics.slice(0, 6).map((location, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Users</span>
                          <span className="font-medium">{location.users}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Properties</span>
                          <span className="font-medium">{location.properties}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg Price</span>
                          <span className="font-medium">{formatCurrency(location.avgPrice)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}