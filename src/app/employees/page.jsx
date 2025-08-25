"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiService } from "@/lib/api";
import {
  IconPlus,
  IconTrash,
  IconUsers,
  IconCash,
  IconTrendingUp,
  IconRefresh,
  IconSearch,
  IconCopy,
  IconEye
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  // Form state for creating/editing employees
  const [formData, setFormData] = useState({
    employeeName: "",
    email: "",
    phone: "",
    password: "",
    role: "field_agent",
    targets: {
      monthly: {
        users: 30,
        brokers: 10
      }
    },
    commissionRates: {
      userRegistration: 50,
      brokerRegistration: 200,
      brokerFirstProperty: 500,
      monthlyBonus: {
        userTarget: {
          achievement: 30,
          bonus: 2000
        },
        brokerTarget: {
          achievement: 10,
          bonus: 5000
        }
      }
    }
  });

  const fetchEmployees = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedRole !== "all") params.append("role", selectedRole);
      if (selectedStatus !== "all") params.append("isActive", selectedStatus === "active");

      const response = await apiService.get(`/employees?${params.toString()}`);
      setEmployees(response.employees);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await apiService.post("/employees", formData);
      toast.success("Employee created successfully");
      setShowCreateDialog(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error(error.response?.data?.message || "Failed to create employee");
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await apiService.delete(`/employees/${employeeId}`);
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    }
  };

  const handleViewDetails = async (employeeId) => {
    try {
      const response = await apiService.get(`/employees/${employeeId}`);
      setSelectedEmployee(response);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      toast.error("Failed to fetch employee details");
    }
  };

  const copyReferralCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Referral code copied to clipboard");
  };

  const resetForm = () => {
    setFormData({
      employeeName: "",
      email: "",
      phone: "",
      password: "",
      role: "field_agent",
      targets: {
        monthly: {
          users: 30,
          brokers: 10
        }
      },
      commissionRates: {
        userRegistration: 50,
        brokerRegistration: 200,
        brokerFirstProperty: 500,
        monthlyBonus: {
          userTarget: {
            achievement: 30,
            bonus: 2000
          },
          brokerTarget: {
            achievement: 10,
            bonus: 5000
          }
        }
      }
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }
      
      // Handle nested objects
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, selectedRole, selectedStatus]);

  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "field_agent", label: "Field Agent" },
    { value: "team_lead", label: "Team Lead" },
    { value: "manager", label: "Manager" }
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
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
                <h1 className="text-2xl font-bold">Employee Management</h1>
                <p className="text-muted-foreground">Manage your sales team and track performance</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => fetchEmployees()}>
                  <IconRefresh className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <IconPlus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateEmployee} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="employeeName">Full Name</Label>
                          <Input
                            id="employeeName"
                            value={formData.employeeName}
                            onChange={(e) => handleInputChange('employeeName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select onValueChange={(value) => handleInputChange('role', value)} defaultValue={formData.role}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="field_agent">Field Agent</SelectItem>
                              <SelectItem value="team_lead">Team Lead</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Targets Section */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Monthly Targets</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="userTarget">Users Target</Label>
                            <Input
                              id="userTarget"
                              type="number"
                              value={formData.targets.monthly.users}
                              onChange={(e) => handleInputChange('targets.monthly.users', parseInt(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="brokerTarget">Brokers Target</Label>
                            <Input
                              id="brokerTarget"
                              type="number"
                              value={formData.targets.monthly.brokers}
                              onChange={(e) => handleInputChange('targets.monthly.brokers', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Commission Rates Section */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Commission Rates (₹)</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="userCommission">Per User</Label>
                            <Input
                              id="userCommission"
                              type="number"
                              value={formData.commissionRates.userRegistration}
                              onChange={(e) => handleInputChange('commissionRates.userRegistration', parseInt(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="brokerCommission">Per Broker</Label>
                            <Input
                              id="brokerCommission"
                              type="number"
                              value={formData.commissionRates.brokerRegistration}
                              onChange={(e) => handleInputChange('commissionRates.brokerRegistration', parseInt(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="firstPropertyBonus">First Property Bonus</Label>
                            <Input
                              id="firstPropertyBonus"
                              type="number"
                              value={formData.commissionRates.brokerFirstProperty}
                              onChange={(e) => handleInputChange('commissionRates.brokerFirstProperty', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Create Employee</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1 max-w-sm">
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Employees List */}
            <div className="grid gap-4">
              {loading ? (
                <div className="grid gap-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : employees.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <IconUsers className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No employees found</p>
                  </CardContent>
                </Card>
              ) : (
                employees.map((employee) => (
                  <Card key={employee._id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{employee.employeeName}</h3>
                            <Badge variant={employee.isActive ? "default" : "secondary"}>
                              {employee.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{employee.role.replace('_', ' ').toUpperCase()}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">ID:</span> {employee.employeeId}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> {employee.email}
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span> {employee.phone}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Code:</span> 
                              <code className="bg-muted px-1 rounded text-xs">{employee.referralCode}</code>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => copyReferralCode(employee.referralCode)}
                              >
                                <IconCopy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Current Month Stats */}
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">This Month</div>
                            <div className="flex gap-2 text-sm">
                              <span className="flex items-center gap-1">
                                <IconUsers className="h-3 w-3" />
                                {employee.currentMonthStats?.usersReferred || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <IconTrendingUp className="h-3 w-3" />
                                {employee.currentMonthStats?.brokersReferred || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <IconCash className="h-3 w-3" />
                                ₹{((employee.currentMonthStats?.totalEarnings || 0) + (employee.currentMonthStats?.bonusEarnings || 0)).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(employee._id)}
                            >
                              <IconEye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteEmployee(employee._id)}
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.current === 1}
                  onClick={() => fetchEmployees(pagination.current - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {pagination.current} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.current === pagination.pages}
                  onClick={() => fetchEmployees(pagination.current + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Employee Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="font-semibold">{selectedEmployee.employee.employeeName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Employee ID</Label>
                    <p>{selectedEmployee.employee.employeeId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p>{selectedEmployee.employee.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Referral Code</Label>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded">{selectedEmployee.employee.referralCode}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyReferralCode(selectedEmployee.employee.referralCode)}
                      >
                        <IconCopy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Recent Stats */}
                {selectedEmployee.recentStats && selectedEmployee.recentStats.length > 0 && (
                  <div>
                    <Label className="text-base font-semibold">Recent Performance (Last 6 Months)</Label>
                    <div className="grid gap-2 mt-2">
                      {selectedEmployee.recentStats.map((stat) => (
                        <div key={stat.period} className="flex justify-between items-center p-3 bg-muted rounded">
                          <span>{stat.period}</span>
                          <div className="flex gap-4 text-sm">
                            <span>Users: {stat.usersReferred}</span>
                            <span>Brokers: {stat.brokersReferred}</span>
                            <span>Earnings: ₹{(stat.totalEarnings + stat.bonusEarnings).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}