"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/lib/api";
import {
  IconSearch,
  IconEye,
  IconUserCheck,
  IconUserX,
  IconDownload,
  IconRefresh,
} from "@tabler/icons-react";
import { toast } from "sonner";


export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 100,
      };

      if (userTypeFilter !== "all") {
        params.userType = userTypeFilter;
      }
      if (verificationFilter !== "all") {
        params.verificationStatus = verificationFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await apiService.getUsers(params);
      
      // The getUsers method falls back to brokers if no dedicated user endpoint exists
      const rawUsers = response.users || response.brokers || [];
      
      // Transform data to ensure consistent field names
      const usersData = rawUsers.map(user => ({
        ...user,
        id: user._id || user.id, // Ensure id field exists
        fullName: user.fullName || user.businessName || 'Unknown User',
        email: user.email || 'No email',
        contactNumber: user.contactNumber || 'No contact',
        userType: user.userType || 'broker',
        verificationStatus: user.verificationStatus || (user.isVerified ? 'verified' : 'pending'),
        createdAt: user.createdAt || user.registrationDate || new Date().toISOString()
      }));
      
      setUsers(usersData);
      
      if (usersData.length === 0) {
        toast.info("No users found. Note: Currently showing broker data as user fallback.");
      }
      
      // Show warning if we got limited access message
      if (response.message) {
        toast.warning(response.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(`Failed to fetch users: ${error.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userTypeFilter, verificationFilter]);

  const handleSearch = () => {
    fetchUsers();
  };

  const handleVerifyUser = async (userId, status) => {
    try {
      await apiService.verifyUser(userId, { verificationStatus: status });
      toast.success(`User ${status} successfully`);
      fetchUsers();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error verifying user:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleExportUsers = async () => {
    try {
      const blob = await apiService.exportUsers("csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users-export.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Users exported successfully");
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error("Failed to export users");
    }
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "broker":
        return "bg-blue-100 text-blue-800";
      case "sub_broker":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVerificationColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  const columns = [
    {
      accessorKey: "fullName",
      header: "Full Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "contactNumber",
      header: "Phone",
    },
    {
      accessorKey: "userType",
      header: "Type",
      cell: ({ row }) => (
        <Badge className={getUserTypeColor(row.original.userType)}>
          {row.original.userType}
        </Badge>
      ),
    },
    {
      accessorKey: "verificationStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={getVerificationColor(row.original.verificationStatus)}>
          {row.original.verificationStatus}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedUser(row.original);
            setDialogOpen(true);
          }}
        >
          <IconEye className="h-4 w-4" />
        </Button>
      ),
    },
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
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-muted-foreground">
                  Manage users, brokers, and verification status
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportUsers}>
                  <IconDownload className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                  <IconRefresh
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label htmlFor="search">Search Users</Label>
                    <div className="flex gap-2">
                      <Input
                        id="search"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      />
                      <Button onClick={handleSearch}>
                        <IconSearch className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>User Type</Label>
                    <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="user">Users</SelectItem>
                        <SelectItem value="broker">Brokers</SelectItem>
                        <SelectItem value="sub_broker">Sub Brokers</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Verification Status</Label>
                    <Select
                      value={verificationFilter}
                      onValueChange={setVerificationFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Users ({users.length})
                  {loading && " - Loading..."}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading users...</span>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">No users found</div>
                    <div className="text-sm text-gray-400">
                      This could be because:
                      <ul className="mt-2 space-y-1">
                        <li>• No users exist in the database</li>
                        <li>• Currently showing brokers as user fallback</li>
                        <li>• Current filters are too restrictive</li>
                        <li>• API connection issue or permission denied</li>
                      </ul>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={fetchUsers} 
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <DataTable data={users} columns={columns} />
                )}
              </CardContent>
            </Card>

            {/* User Details Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>User Details</DialogTitle>
                </DialogHeader>
                {selectedUser && (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium">Full Name</Label>
                        <p className="text-sm">{selectedUser.fullName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{selectedUser.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm">{selectedUser.contactNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <p className="text-sm">{selectedUser.location || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">User Type</Label>
                        <Badge className={getUserTypeColor(selectedUser.userType)}>
                          {selectedUser.userType}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge
                          className={getVerificationColor(
                            selectedUser.verificationStatus
                          )}
                        >
                          {selectedUser.verificationStatus}
                        </Badge>
                      </div>
                    </div>

                    {/* Property Types */}
                    {selectedUser.propertyType?.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">
                          Interested Property Types
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedUser.propertyType.map((type, index) => (
                            <Badge key={index} variant="secondary">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* KYC Documents */}
                    {selectedUser.kycDocuments?.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">KYC Documents</Label>
                        <div className="space-y-2 mt-2">
                          {selectedUser.kycDocuments.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div>
                                <p className="text-sm font-medium">{doc.type}</p>
                                <p className="text-xs text-muted-foreground">
                                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className={getVerificationColor(doc.status)}>
                                {doc.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {selectedUser.verificationStatus === "pending" && (
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() =>
                            handleVerifyUser(selectedUser._id, "verified")
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <IconUserCheck className="h-4 w-4 mr-2" />
                          Verify User
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            handleVerifyUser(selectedUser._id, "rejected")
                          }
                        >
                          <IconUserX className="h-4 w-4 mr-2" />
                          Reject User
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
