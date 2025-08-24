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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  IconUsers,
  IconStar,
  IconPhone,
  IconMail,
  IconMapPin,
  IconFileText,
  IconBuildingStore,
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function BrokersPage() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subBrokers, setSubBrokers] = useState([]);
  const [brokerProperties, setBrokerProperties] = useState([]);

  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 100,
      };

      if (verificationFilter !== "all") {
        params.verificationStatus = verificationFilter;
      }
      if (typeFilter !== "all") {
        params.userType = typeFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await apiService.getBrokers(params);
      setBrokers(response.brokers || []);
    } catch (error) {
      console.error("Error fetching brokers:", error);
      toast.error("Failed to fetch brokers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, [verificationFilter, typeFilter]);

  const handleSearch = () => {
    fetchBrokers();
  };

  const handleVerifyBroker = async (brokerId, status) => {
    try {
      await apiService.verifyBroker(brokerId, { verificationStatus: status });
      toast.success(`Broker ${status} successfully`);
      fetchBrokers();
      if (selectedBroker && selectedBroker._id === brokerId) {
        setSelectedBroker({ ...selectedBroker, verificationStatus: status, isVerified: status === 'verified' });
      }
    } catch (error) {
      console.error("Error verifying broker:", error);
      toast.error("Failed to update broker status");
    }
  };

  const handleVerifyKycDocument = async (brokerId, kycDocumentId, status) => {
    try {
      await apiService.verifyBroker(brokerId, { 
        kycDocumentId: kycDocumentId, 
        kycStatus: status 
      });
      toast.success(`KYC document ${status} successfully`);
      
      // Update the selected broker's KYC document status
      if (selectedBroker && selectedBroker._id === brokerId) {
        const updatedKycDocs = selectedBroker.kycDocuments.map(doc => 
          doc._id === kycDocumentId ? { ...doc, status } : doc
        );
        setSelectedBroker({ ...selectedBroker, kycDocuments: updatedKycDocs });
      }
      fetchBrokers();
    } catch (error) {
      console.error("Error verifying KYC document:", error);
      toast.error("Failed to update KYC document status");
    }
  };

  const fetchBrokerDetails = async (brokerId) => {
    try {
      const [brokerData, subBrokersData, propertiesData] = await Promise.all([
        apiService.getBrokerById(brokerId),
        apiService.getSubBrokers(brokerId).catch(() => ({ subBrokers: [] })),
        apiService.getProperties({ brokerId, limit: 10 }).catch(() => ({ properties: [] }))
      ]);

      setSelectedBroker(brokerData.broker);
      setSubBrokers(subBrokersData.subBrokers || []);
      setBrokerProperties(propertiesData.properties || []);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching broker details:", error);
      toast.error("Failed to fetch broker details");
    }
  };

  const handleExportBrokers = async () => {
    try {
      const blob = await apiService.exportUsers("csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "brokers-export.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Brokers exported successfully");
    } catch (error) {
      console.error("Error exporting brokers:", error);
      toast.error("Failed to export brokers");
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

  const getBrokerTypeColor = (userType) => {
    switch (userType) {
      case "broker":
        return "bg-blue-100 text-blue-800";
      case "sub_broker":
        return "bg-purple-100 text-purple-800";
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
        <Badge className={getBrokerTypeColor(row.original.userType)}>
          {row.original.userType === 'sub_broker' ? 'Sub Broker' : 'Broker'}
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
      accessorKey: "location",
      header: "Location",
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
          onClick={() => fetchBrokerDetails(row.original._id)}
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
                <h1 className="text-2xl font-bold">Broker Management</h1>
                <p className="text-muted-foreground">
                  Manage broker registrations, verifications, and sub-brokers
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportBrokers}>
                  <IconDownload className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={fetchBrokers} disabled={loading}>
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
                    <Label htmlFor="search">Search Brokers</Label>
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
                    <Label>Broker Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="broker">Brokers</SelectItem>
                        <SelectItem value="sub_broker">Sub Brokers</SelectItem>
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

            {/* Brokers Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Brokers ({brokers.length})
                  {loading && " - Loading..."}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable data={brokers} columns={columns} />
              </CardContent>
            </Card>

            {/* Broker Details Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Broker Details</DialogTitle>
                </DialogHeader>
                {selectedBroker && (
                  <Tabs defaultValue="details" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="kyc">KYC Documents</TabsTrigger>
                      <TabsTrigger value="properties">Properties</TabsTrigger>
                      <TabsTrigger value="sub-brokers">Sub-Brokers</TabsTrigger>
                    </TabsList>

                    {/* Basic Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-sm font-medium">Full Name</Label>
                          <p className="text-sm">{selectedBroker.fullName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Email</Label>
                          <div className="flex items-center gap-2">
                            <IconMail className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">{selectedBroker.email}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Phone</Label>
                          <div className="flex items-center gap-2">
                            <IconPhone className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">{selectedBroker.contactNumber}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Location</Label>
                          <div className="flex items-center gap-2">
                            <IconMapPin className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">{selectedBroker.location || "N/A"}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Broker Type</Label>
                          <Badge className={getBrokerTypeColor(selectedBroker.userType)}>
                            {selectedBroker.userType === 'sub_broker' ? 'Sub Broker' : 'Broker'}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Status</Label>
                          <Badge className={getVerificationColor(selectedBroker.verificationStatus)}>
                            {selectedBroker.verificationStatus}
                          </Badge>
                        </div>
                      </div>

                      {/* Property Types */}
                      {selectedBroker.propertyType?.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Property Types</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedBroker.propertyType.map((type, index) => (
                              <Badge key={index} variant="secondary">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Profile Image */}
                      {selectedBroker.profileImage && (
                        <div>
                          <Label className="text-sm font-medium">Profile Image</Label>
                          <img
                            src={selectedBroker.profileImage}
                            alt="Profile"
                            className="w-32 h-32 object-cover rounded-lg mt-2"
                          />
                        </div>
                      )}

                      {/* Parent Broker (for sub-brokers) */}
                      {selectedBroker.parentBrokerId && (
                        <div>
                          <Label className="text-sm font-medium">Parent Broker</Label>
                          <p className="text-sm">
                            {selectedBroker.parentBrokerId.fullName} ({selectedBroker.parentBrokerId.contactNumber})
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      {selectedBroker.verificationStatus === "pending" && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            onClick={() =>
                              handleVerifyBroker(selectedBroker._id, "verified")
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <IconUserCheck className="h-4 w-4 mr-2" />
                            Verify Broker
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleVerifyBroker(selectedBroker._id, "rejected")
                            }
                          >
                            <IconUserX className="h-4 w-4 mr-2" />
                            Reject Broker
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    {/* KYC Documents Tab */}
                    <TabsContent value="kyc" className="space-y-4">
                      {selectedBroker.kycDocuments?.length > 0 ? (
                        <div className="space-y-4">
                          {selectedBroker.kycDocuments.map((doc, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <IconFileText className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium capitalize">{doc.type} Document</p>
                                      <p className="text-sm text-muted-foreground">
                                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={getVerificationColor(doc.status)}>
                                      {doc.status}
                                    </Badge>
                                    {doc.status === 'pending' && (
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleVerifyKycDocument(selectedBroker._id, doc._id, 'verified')
                                          }
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          Verify
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() =>
                                            handleVerifyKycDocument(selectedBroker._id, doc._id, 'rejected')
                                          }
                                        >
                                          Reject
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {doc.url && (
                                  <div className="mt-3">
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      View Document
                                    </a>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No KYC documents uploaded
                        </p>
                      )}
                    </TabsContent>

                    {/* Properties Tab */}
                    <TabsContent value="properties" className="space-y-4">
                      {brokerProperties.length > 0 ? (
                        <div className="grid gap-4">
                          {brokerProperties.map((property) => (
                            <Card key={property._id}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex gap-4">
                                    {property.images?.[0] && (
                                      <img
                                        src={property.images[0]}
                                        alt={property.title}
                                        className="w-20 h-20 object-cover rounded"
                                      />
                                    )}
                                    <div>
                                      <h4 className="font-medium">{property.title}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {property.propertyType} • {property.transactionType}
                                      </p>
                                      <p className="text-sm">
                                        ₹{property.price?.toLocaleString()} • {property.area} {property.areaUnit}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {property.location?.city}, {property.location?.state}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className={property.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                    {property.status}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No properties listed by this broker
                        </p>
                      )}
                    </TabsContent>

                    {/* Sub-Brokers Tab (only for brokers, not sub-brokers) */}
                    <TabsContent value="sub-brokers" className="space-y-4">
                      {selectedBroker.userType === 'broker' ? (
                        subBrokers.length > 0 ? (
                          <div className="grid gap-4">
                            {subBrokers.map((subBroker) => (
                              <Card key={subBroker._id}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <IconUsers className="h-8 w-8 text-muted-foreground" />
                                      <div>
                                        <p className="font-medium">{subBroker.fullName}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {subBroker.email} • {subBroker.contactNumber}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Joined: {new Date(subBroker.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge className={getVerificationColor(subBroker.verificationStatus)}>
                                      {subBroker.verificationStatus}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            No sub-brokers under this broker
                          </p>
                        )
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          Sub-brokers information is only available for main brokers
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}