"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiService } from "@/lib/api";
import {
  IconSettings,
  IconUser,
  IconMail,
  IconKey,
  IconShield,
  IconDatabase,
  IconBell,
  IconSave,
  IconTrash,
  IconPlus,
  IconEye,
  IconCopy,
  IconRefresh,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    siteName: "SNK Real Estate",
    siteDescription: "Premium Real Estate Platform",
    contactEmail: "admin@snk.com",
    supportPhone: "+91 98765 43210",
    maintenanceMode: false,
    userRegistration: true,
    brokerRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
  });
  const [adminUsers, setAdminUsers] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  // Sample audit logs data
  const generateAuditLogs = () => {
    const sampleLogs = [
      {
        id: 1,
        action: "User Verification",
        user: "Admin",
        target: "John Doe",
        timestamp: new Date().toISOString(),
        details: "Verified broker registration",
      },
      {
        id: 2,
        action: "Property Approval",
        user: "Admin",
        target: "Premium Villa",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: "Approved property listing",
      },
      {
        id: 3,
        action: "Settings Update",
        user: "Admin",
        target: "System Settings",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        details: "Updated notification preferences",
      },
      {
        id: 4,
        action: "User Suspension",
        user: "Admin",
        target: "Jane Smith",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        details: "Suspended user for policy violation",
      },
      {
        id: 5,
        action: "Data Export",
        user: "Admin",
        target: "Users Database",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        details: "Exported user data to CSV",
      },
    ];
    setAuditLogs(sampleLogs);
  };

  // Sample admin users data
  const generateAdminUsers = () => {
    const sampleAdmins = [
      {
        id: 1,
        fullName: "Main Admin",
        email: "admin@snk.com",
        role: "Super Admin",
        lastLogin: new Date().toISOString(),
        status: "Active",
      },
      {
        id: 2,
        fullName: "Property Manager",
        email: "properties@snk.com",
        role: "Property Admin",
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        status: "Active",
      },
      {
        id: 3,
        fullName: "User Manager",
        email: "users@snk.com",
        role: "User Admin",
        lastLogin: new Date(Date.now() - 86400000).toISOString(),
        status: "Inactive",
      },
    ];
    setAdminUsers(sampleAdmins);
  };

  useEffect(() => {
    generateAuditLogs();
    generateAdminUsers();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // In real implementation, call API to save settings
      // await apiService.updateSettings(settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (newAdmin.password !== newAdmin.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      // In real implementation, call API to create admin
      // await apiService.createAdmin(newAdmin);
      
      // Simulate API call and add to list
      const newAdminUser = {
        id: adminUsers.length + 1,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        role: "Admin",
        lastLogin: null,
        status: "Active",
      };
      
      setAdminUsers([...adminUsers, newAdminUser]);
      setNewAdmin({ fullName: "", email: "", password: "", confirmPassword: "" });
      setDialogOpen(false);
      toast.success("Admin user created successfully");
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("Failed to create admin user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      // In real implementation, call API to delete admin
      // await apiService.deleteAdmin(adminId);
      
      setAdminUsers(adminUsers.filter(admin => admin.id !== adminId));
      toast.success("Admin user deleted successfully");
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Failed to delete admin user");
    }
  };

  const handleBackupData = () => {
    toast.success("Database backup initiated");
    // In real implementation, trigger backup process
  };

  const handleExportAuditLogs = () => {
    const csvData = [
      ["ID", "Action", "User", "Target", "Timestamp", "Details"],
      ...auditLogs.map(log => [
        log.id,
        log.action,
        log.user,
        log.target,
        new Date(log.timestamp).toLocaleString(),
        log.details
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(",")).join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Audit logs exported successfully");
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
                <h1 className="text-2xl font-bold">System Settings</h1>
                <p className="text-muted-foreground">
                  Configure system preferences and manage admin users
                </p>
              </div>
              <Button onClick={handleSaveSettings} disabled={loading}>
                <IconSave className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="admins">Admin Users</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input
                          id="siteName"
                          value={settings.siteName}
                          onChange={(e) =>
                            setSettings({ ...settings, siteName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={settings.contactEmail}
                          onChange={(e) =>
                            setSettings({ ...settings, contactEmail: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={(e) =>
                          setSettings({ ...settings, siteDescription: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="supportPhone">Support Phone</Label>
                      <Input
                        id="supportPhone"
                        value={settings.supportPhone}
                        onChange={(e) =>
                          setSettings({ ...settings, supportPhone: e.target.value })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Registration Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>User Registration</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow new users to register
                        </p>
                      </div>
                      <Switch
                        checked={settings.userRegistration}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, userRegistration: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Broker Registration</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow broker registration applications
                        </p>
                      </div>
                      <Switch
                        checked={settings.brokerRegistration}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, brokerRegistration: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send email notifications for important events
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, emailNotifications: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send SMS alerts for critical updates
                        </p>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, smsNotifications: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Admin Users */}
              <TabsContent value="admins" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Admin Users</CardTitle>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <IconPlus className="h-4 w-4 mr-2" />
                          Add Admin
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Admin User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="adminName">Full Name</Label>
                            <Input
                              id="adminName"
                              value={newAdmin.fullName}
                              onChange={(e) =>
                                setNewAdmin({ ...newAdmin, fullName: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="adminEmail">Email</Label>
                            <Input
                              id="adminEmail"
                              type="email"
                              value={newAdmin.email}
                              onChange={(e) =>
                                setNewAdmin({ ...newAdmin, email: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="adminPassword">Password</Label>
                            <Input
                              id="adminPassword"
                              type="password"
                              value={newAdmin.password}
                              onChange={(e) =>
                                setNewAdmin({ ...newAdmin, password: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={newAdmin.confirmPassword}
                              onChange={(e) =>
                                setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleCreateAdmin} disabled={loading}>
                              Create Admin
                            </Button>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {adminUsers.map((admin) => (
                        <div
                          key={admin.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <IconUser className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{admin.fullName}</p>
                              <p className="text-sm text-muted-foreground">{admin.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Last login: {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={admin.status === 'Active' ? 'default' : 'secondary'}>
                              {admin.status}
                            </Badge>
                            <Badge variant="outline">{admin.role}</Badge>
                            {admin.id !== 1 && ( // Don't allow deleting main admin
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <IconTrash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Admin User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this admin user? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteAdmin(admin.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Security & Audit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Session Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Active Sessions</span>
                              <Badge>3</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Session Timeout</span>
                              <span className="text-sm">30 minutes</span>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">
                              <IconRefresh className="h-4 w-4 mr-2" />
                              Reset All Sessions
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">API Security</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">API Rate Limit</span>
                              <span className="text-sm">1000/hour</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Failed Attempts</span>
                              <Badge variant="destructive">12</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">
                              <IconKey className="h-4 w-4 mr-2" />
                              Regenerate API Keys
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Audit Logs</CardTitle>
                        <Button variant="outline" size="sm" onClick={handleExportAuditLogs}>
                          <IconDownload className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {auditLogs.slice(0, 5).map((log) => (
                            <div
                              key={log.id}
                              className="flex items-center justify-between p-2 border rounded text-sm"
                            >
                              <div>
                                <span className="font-medium">{log.action}</span>
                                <span className="text-muted-foreground"> by {log.user}</span>
                                <span className="text-muted-foreground"> on {log.target}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Maintenance Settings */}
              <TabsContent value="maintenance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Put the system in maintenance mode
                        </p>
                      </div>
                      <Switch
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, maintenanceMode: checked })
                        }
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Database</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Database Size</span>
                            <span>245 MB</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Last Backup</span>
                            <span>2 hours ago</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleBackupData} className="w-full">
                            <IconDatabase className="h-4 w-4 mr-2" />
                            Create Backup
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">System Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Version</span>
                            <span>v1.2.3</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Uptime</span>
                            <span>15 days</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Memory Usage</span>
                            <span>68%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}