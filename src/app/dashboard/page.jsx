"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/lib/api";
import {
  IconUsers,
  IconHome,
  IconUserCheck,
  IconTrendingUp,
  IconRefresh
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

export default function Page() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBrokers: 0,
    activeProperties: 0,
    pendingVerifications: 0,
    monthlyGrowth: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch properties data (public endpoint that works)
      const propertiesResponse = await apiService.getProperties({ limit: 10 });
      
      // Try to fetch other data, but don't fail if endpoints require auth
      let brokersData = { brokers: [], pagination: { total: 0 } };
      let statsData = {};
      
      try {
        brokersData = await apiService.getBrokers({ limit: 5 });
      } catch (error) {
        console.warn('Brokers endpoint requires authentication:', error.message);
      }
      
      try {
        statsData = await apiService.getStatistics();
      } catch (error) {
        console.warn('Statistics endpoint requires authentication:', error.message);
      }

      // Calculate stats from available data
      const totalProperties = propertiesResponse.pagination?.total || 0;
      const totalBrokers = brokersData.pagination?.total || 0;
      const activeProperties = propertiesResponse.properties?.filter(p => p.status === 'Active').length || 0;
      const pendingVerifications = brokersData.brokers?.filter(b => b.verificationStatus === 'pending').length || 0;
      
      setStats({
        totalUsers: statsData.totalUsers || propertiesResponse.totalUsers || 0,
        totalProperties,
        totalBrokers,
        activeProperties,
        pendingVerifications,
        monthlyGrowth: 12.5 // Mock data since analytics endpoint doesn't exist
      });

      // Create recent activities from properties data
      const activities = [
        ...propertiesResponse.properties?.slice(0, 5).map(p => ({
          id: p._id || p.id,
          type: 'property',
          message: `Property "${p.title}" listed by ${p.brokerName || 'Unknown Broker'}`,
          timestamp: p.createdAt,
          status: p.status,
          price: p.price ? `₹${(p.price / 100000).toFixed(1)}L` : 'Price not set',
          location: p.city !== 'City not specified' ? p.city : 'Location not specified'
        })) || []
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
      
      setRecentActivities(activities);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(`Failed to fetch dashboard data: ${error.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: IconUsers,
      trend: "+12%",
      color: "text-blue-600"
    },
    {
      title: "Total Properties",
      value: stats.totalProperties,
      icon: IconHome,
      trend: "+8%",
      color: "text-green-600"
    },
    {
      title: "Active Brokers",
      value: stats.totalBrokers,
      icon: IconUserCheck,
      trend: "+5%",
      color: "text-purple-600"
    },
    {
      title: "Monthly Growth",
      value: `${stats.monthlyGrowth}%`,
      icon: IconTrendingUp,
      trend: "+2.1%",
      color: "text-orange-600"
    }
  ];


  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome to SNK Real Estate Admin Panel</p>
              </div>
              <Button 
                variant="outline" 
                onClick={fetchDashboardData}
                disabled={loading}
              >
                <IconRefresh className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {card.title}
                      </CardTitle>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">{card.trend}</span> from last month
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Charts and Recent Activities */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Listings Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartAreaInteractive />
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === 'property' ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                              {activity.price && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600 font-medium">{activity.price}</span>
                                </>
                              )}
                              {activity.location && activity.location !== 'Location not specified' && (
                                <>
                                  <span>•</span>
                                  <span>{activity.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {recentActivities.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No recent activities
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
