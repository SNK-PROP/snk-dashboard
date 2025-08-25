"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/lib/api";
import {
  IconUsers,
  IconCash,
  IconTrendingUp,
  IconRefresh,
  IconCopy,
  IconTarget,
  IconGift,
  IconLogin,
  IconQrcode,
  IconShare
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function EmployeePortalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Check if employee is logged in
  useEffect(() => {
    const token = localStorage.getItem('employeeToken');
    if (token) {
      setIsLoggedIn(true);
      fetchDashboardData();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/employees/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('employeeToken', data.token);
        localStorage.setItem('employeeData', JSON.stringify(data.employee));
        setIsLoggedIn(true);
        fetchDashboardData();
        toast.success("Login successful");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('employeeToken');
      const response = await fetch('http://localhost:5000/api/employees/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        toast.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeData');
    setIsLoggedIn(false);
    setDashboardData(null);
    toast.success("Logged out successfully");
  };

  const copyReferralCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Referral code copied to clipboard");
  };

  const generateReferralLink = (code) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${code}`;
  };

  const shareReferralLink = (code) => {
    const link = generateReferralLink(code);
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied to clipboard");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
              <IconLogin className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Employee Portal</CardTitle>
            <p className="text-muted-foreground">Sign in to your employee account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/brand_logo.jpeg" alt="Logo" className="h-8 w-8 rounded" />
              <h1 className="text-xl font-semibold">SNK Employee Portal</h1>
            </div>
            <div className="flex items-center gap-3">
              {dashboardData && (
                <span className="text-sm text-muted-foreground">
                  Welcome, {dashboardData.employee?.employeeName}
                </span>
              )}
              <Button variant="outline" onClick={fetchDashboardData} disabled={loading}>
                <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !dashboardData ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dashboardData ? (
          <>
            {/* Employee Info & Referral Code */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{dashboardData.employee.employeeName}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>ID: {dashboardData.employee.employeeId}</span>
                      <span>•</span>
                      <span>Code: {dashboardData.employee.referralCode}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copyReferralCode(dashboardData.employee.referralCode)}
                    >
                      <IconCopy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => shareReferralLink(dashboardData.employee.referralCode)}
                    >
                      <IconShare className="h-4 w-4 mr-2" />
                      Share Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Month Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Users This Month</CardTitle>
                  <IconUsers className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.currentMonth?.usersReferred || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Target: {dashboardData.employee.targets?.monthly?.users || 0}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((dashboardData.currentMonth?.usersReferred || 0) / (dashboardData.employee.targets?.monthly?.users || 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Brokers This Month</CardTitle>
                  <IconTrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.currentMonth?.brokersReferred || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Target: {dashboardData.employee.targets?.monthly?.brokers || 0}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((dashboardData.currentMonth?.brokersReferred || 0) / (dashboardData.employee.targets?.monthly?.brokers || 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
                  <IconCash className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency((dashboardData.currentMonth?.totalEarnings || 0) + (dashboardData.currentMonth?.bonusEarnings || 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <IconGift className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dashboardData.allTime?.totalEarnings || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    Paid: {formatCurrency(dashboardData.allTime?.totalPaid || 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* All Time Stats */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconTarget className="h-5 w-5 text-blue-600" />
                    Total Users Referred
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{dashboardData.allTime?.totalUsers || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconTrendingUp className="h-5 w-5 text-purple-600" />
                    Total Brokers Referred
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{dashboardData.allTime?.totalBrokers || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconUsers className="h-5 w-5 text-green-600" />
                    Total Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {(dashboardData.allTime?.totalUsers || 0) + (dashboardData.allTime?.totalBrokers || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Referrals */}
            {dashboardData.recentReferrals && dashboardData.recentReferrals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.recentReferrals.map((referral, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">{referral.fullName}</div>
                          <div className="text-sm text-muted-foreground">{referral.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={referral.userType === 'broker' ? 'default' : 'secondary'}>
                            {referral.userType}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(referral.referralDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <IconUsers className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No dashboard data available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}