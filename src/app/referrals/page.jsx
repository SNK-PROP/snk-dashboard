"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/lib/api";
import {
  IconUsers,
  IconCash,
  IconTrendingUp,
  IconRefresh,
  IconUserCheck,
  IconGift,
  IconCalendar,
  IconTarget,
  IconTrophy
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function ReferralsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReferralStats({
        year: selectedYear,
        month: selectedMonth
      });
      setStats(response);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      toast.error("Failed to fetch referral statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralStats();
  }, [selectedYear, selectedMonth]);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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
                <h1 className="text-2xl font-bold">Referral Analytics</h1>
                <p className="text-muted-foreground">Track employee referral performance and commissions</p>
              </div>
              <div className="flex gap-2">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchReferralStats} disabled={loading}>
                  <IconRefresh className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {loading ? (
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
            ) : stats ? (
              <>
                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                      <IconUsers className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.overview?.activeEmployees || 0}</div>
                      <p className="text-xs text-muted-foreground">Employees with referrals this month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users Referred</CardTitle>
                      <IconUserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.overview?.totalUsers || 0}</div>
                      <p className="text-xs text-muted-foreground">New user registrations</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Brokers Referred</CardTitle>
                      <IconTrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.overview?.totalBrokers || 0}</div>
                      <p className="text-xs text-muted-foreground">New broker registrations</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <IconCash className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(stats.overview?.totalEarnings || 0)}</div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>Paid: {formatCurrency(stats.overview?.totalPaid || 0)}</span>
                        <Badge variant={stats.overview?.pendingPayment > 0 ? "destructive" : "secondary"}>
                          Pending: {formatCurrency(stats.overview?.pendingPayment || 0)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Performers */}
                {stats.topPerformers && stats.topPerformers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconTrophy className="h-5 w-5 text-yellow-600" />
                        Top Performers - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {stats.topPerformers.map((performer, index) => (
                          <div key={performer._id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-semibold">{performer.employeeName}</div>
                                <div className="text-sm text-muted-foreground">
                                  Code: {performer.referralCode}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-6 text-sm">
                              <div className="text-center">
                                <div className="font-semibold text-blue-600">{performer.usersReferred}</div>
                                <div className="text-muted-foreground">Users</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-purple-600">{performer.brokersReferred}</div>
                                <div className="text-muted-foreground">Brokers</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-green-600">{performer.totalReferred}</div>
                                <div className="text-muted-foreground">Total</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-orange-600">{formatCurrency(performer.totalCommission)}</div>
                                <div className="text-muted-foreground">
                                  {performer.isPaid ? (
                                    <Badge variant="default" className="text-xs">Paid</Badge>
                                  ) : (
                                    <Badge variant="destructive" className="text-xs">Pending</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Period Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconCalendar className="h-5 w-5" />
                      Period Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <IconTarget className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-blue-600">
                          {(stats.overview?.totalUsers || 0) + (stats.overview?.totalBrokers || 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Referrals</div>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <IconGift className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold text-green-600">{stats.overview?.activeEmployees || 0}</div>
                        <div className="text-sm text-muted-foreground">Active Recruiters</div>
                      </div>
                      
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <IconCash className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                        <div className="text-2xl font-bold text-orange-600">
                          {stats.overview?.totalEarnings ? 
                            Math.round(stats.overview.totalEarnings / ((stats.overview.totalUsers || 0) + (stats.overview.totalBrokers || 0) || 1)) : 0
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Commission per Referral</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <IconUsers className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No referral data available for selected period</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}