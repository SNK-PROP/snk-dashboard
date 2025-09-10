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
  IconStar,
  IconStarFilled,
  IconCheck,
  IconX,
  IconDownload,
  IconRefresh,
  IconMapPin,
  IconEdit,
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 100,
      };

      // For admin dashboard, we want to see all properties regardless of status
      params.includeAll = true; // Always use admin endpoint to see all properties
      
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (approvalFilter !== "all") {
        params.approvalStatus = approvalFilter;
      }
      if (typeFilter !== "all") {
        params.propertyType = typeFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await apiService.getProperties(params);
      console.log('Dashboard received properties response:', response);
      
      const rawProperties = response.properties || response || [];
      
      // Transform data to ensure consistent field names
      const propertiesData = rawProperties.map(property => ({
        ...property,
        id: property._id || property.id, // Ensure id field exists
        title: property.title || `Property in ${property.location?.city || 'Unknown Location'}`,
        location: property.location || {},
        price: property.price || 0,
        status: property.status || 'Unknown',
        brokerName: property.brokerName || 'Unknown Broker',
        createdAt: property.createdAt || new Date().toISOString()
      }));
      
      setProperties(propertiesData);
      
      if (propertiesData.length === 0) {
        toast.info("No properties found with current filters.");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error(`Failed to fetch properties: ${error.message}`);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [statusFilter, approvalFilter, typeFilter]);

  const handleSearch = () => {
    fetchProperties();
  };

  const handleToggleFeatured = async (propertyId, currentStatus) => {
    try {
      await apiService.toggleFeaturedProperty(propertyId, !currentStatus);
      toast.success(`Property ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
      fetchProperties();
    } catch (error) {
      console.error("Error toggling featured status:", error);
      
      // More detailed error handling
      let errorMessage = "Failed to update featured status";
      if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please login as admin.";
      } else if (error.response?.status === 403) {
        errorMessage = "Not authorized. Admin privileges required to update featured status.";
      } else if (error.response?.status === 404) {
        errorMessage = "Property not found.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleApprovalChange = async (propertyId, action, reason = null) => {
    try {
      if (action === 'approve') {
        await apiService.approveProperty(propertyId);
        toast.success('Property approved successfully');
      } else if (action === 'reject') {
        await apiService.rejectProperty(propertyId, reason);
        toast.success('Property rejected successfully');
      }
      fetchProperties();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error updating property approval:", error);
      
      let errorMessage = `Failed to ${action} property`;
      if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please login as admin.";
      } else if (error.response?.status === 403) {
        errorMessage = "Not authorized. Admin privileges required.";
      } else if (error.response?.status === 404) {
        errorMessage = "Property not found.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await apiService.updatePropertyStatus(propertyId, newStatus);
      toast.success(`Property status changed to ${newStatus} successfully`);
      fetchProperties();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error updating property status:", error);
      
      // More detailed error handling
      let errorMessage = "Failed to update property status";
      if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please login as admin.";
      } else if (error.response?.status === 403) {
        errorMessage = "Not authorized. Admin privileges required to update property status.";
      } else if (error.response?.status === 404) {
        errorMessage = "Property not found.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleEditProperty = (property) => {
    setEditingProperty({
      id: property._id,
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      transactionType: property.transactionType,
      price: property.price,
      area: property.area,
      areaUnit: property.areaUnit,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      location: {
        address: property.location?.address || '',
        city: property.location?.city || '',
        state: property.location?.state || '',
        pincode: property.location?.pincode || ''
      },
      amenities: property.amenities || [],
      features: property.features || [],
      status: property.status,
      isFeatured: property.isFeatured
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await apiService.updatePropertyDetails(editingProperty.id, editingProperty);
      toast.success("Property updated successfully");
      fetchProperties();
      setEditDialogOpen(false);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Failed to update property");
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await apiService.deleteProperty(propertyId);
        toast.success("Property deleted successfully");
        fetchProperties();
        setDialogOpen(false);
      } catch (error) {
        console.error("Error deleting property:", error);
        toast.error("Failed to delete property");
      }
    }
  };

  const handleExportProperties = async () => {
    try {
      const blob = await apiService.exportProperties("csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "properties-export.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Properties exported successfully");
    } catch (error) {
      console.error("Error exporting properties:", error);
      toast.error("Failed to export properties");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Sold":
        return "bg-blue-100 text-blue-800";
      case "Rented":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApprovalStatusColor = (approvalStatus) => {
    switch (approvalStatus) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const columns = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="font-medium truncate">{row.original.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {row.original.location?.city}, {row.original.location?.state}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "propertyType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.propertyType}</Badge>
      ),
    },
    {
      accessorKey: "transactionType",
      header: "Transaction",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.transactionType}</Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="font-medium">{formatPrice(row.original.price)}</div>
      ),
    },
    {
      accessorKey: "area",
      header: "Area",
      cell: ({ row }) => (
        <span>{row.original.area} {row.original.areaUnit}</span>
      ),
    },
    {
      accessorKey: "brokerName",
      header: "Broker",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "approvalStatus",
      header: "Approval",
      cell: ({ row }) => (
        <Badge className={getApprovalStatusColor(row.original.approvalStatus)}>
          {row.original.approvalStatus || 'pending'}
        </Badge>
      ),
    },
    {
      accessorKey: "isFeatured",
      header: "Featured",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            handleToggleFeatured(row.original._id, row.original.isFeatured)
          }
        >
          {row.original.isFeatured ? (
            <IconStarFilled className="h-4 w-4 text-yellow-500" />
          ) : (
            <IconStar className="h-4 w-4" />
          )}
        </Button>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedProperty(row.original);
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
                <h1 className="text-2xl font-bold">Property Management</h1>
                <p className="text-muted-foreground">
                  Manage properties, approvals, and featured listings
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportProperties}>
                  <IconDownload className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={fetchProperties} disabled={loading}>
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
                <div className="grid gap-4 md:grid-cols-5">
                  <div>
                    <Label htmlFor="search">Search Properties</Label>
                    <div className="flex gap-2">
                      <Input
                        id="search"
                        placeholder="Search by title or location..."
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
                    <Label>Property Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                        <SelectItem value="Cottage">Cottage</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                        <SelectItem value="Rented">Rented</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Approval Status</Label>
                    <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Approval</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Properties Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Properties ({properties.length})
                  {loading && " - Loading..."}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading properties...</span>
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">No properties found</div>
                    <div className="text-sm text-gray-400">
                      <p className="mb-2">Current filters:</p>
                      <ul className="space-y-1 mb-4">
                        <li>• Status: <strong>{statusFilter}</strong></li>
                        <li>• Approval: <strong>{approvalFilter}</strong></li>
                        <li>• Type: <strong>{typeFilter}</strong></li>
                        {searchTerm && <li>• Search: <strong>"{searchTerm}"</strong></li>}
                      </ul>
                      <p>This could be because:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• No properties exist in the database</li>
                        <li>• Current filters are too restrictive</li>
                        <li>• All properties are still pending approval</li>
                        <li>• Database migration needed for approval status</li>
                        <li>• API authentication issue</li>
                      </ul>
                    </div>
                    <div className="flex gap-2 justify-center mt-4">
                      <Button 
                        variant="outline" 
                        onClick={fetchProperties}
                      >
                        Refresh
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setStatusFilter("all");
                          setApprovalFilter("all");
                          setTypeFilter("all");
                          setSearchTerm("");
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                ) : (
                  <DataTable data={properties} columns={columns} />
                )}
              </CardContent>
            </Card>

            {/* Property Details Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Property Details</DialogTitle>
                </DialogHeader>
                {selectedProperty && (
                  <div className="space-y-6">
                    {/* Property Images */}
                    {selectedProperty.images && selectedProperty.images.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                          {selectedProperty.images.slice(0, 6).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Property ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium">Title</Label>
                        <p className="text-sm">{selectedProperty.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Property Type</Label>
                        <Badge variant="secondary">{selectedProperty.propertyType}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Transaction Type</Label>
                        <Badge variant="outline">{selectedProperty.transactionType}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Price</Label>
                        <p className="text-lg font-medium text-green-600">
                          {formatPrice(selectedProperty.price)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Area</Label>
                        <p className="text-sm">{selectedProperty.area} {selectedProperty.areaUnit}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge className={getStatusColor(selectedProperty.status)}>
                          {selectedProperty.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Approval Status</Label>
                        <Badge className={getApprovalStatusColor(selectedProperty.approvalStatus)}>
                          {selectedProperty.approvalStatus || 'pending'}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm mt-1">{selectedProperty.description}</p>
                    </div>

                    {/* Location */}
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <div className="flex items-start gap-2 mt-1">
                        <IconMapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{selectedProperty.location?.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedProperty.location?.city}, {selectedProperty.location?.state} - {selectedProperty.location?.pincode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rooms */}
                    {(selectedProperty.bedrooms || selectedProperty.bathrooms) && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {selectedProperty.bedrooms && (
                          <div>
                            <Label className="text-sm font-medium">Bedrooms</Label>
                            <p className="text-sm">{selectedProperty.bedrooms}</p>
                          </div>
                        )}
                        {selectedProperty.bathrooms && (
                          <div>
                            <Label className="text-sm font-medium">Bathrooms</Label>
                            <p className="text-sm">{selectedProperty.bathrooms}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Amenities */}
                    {selectedProperty.amenities?.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Amenities</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedProperty.amenities.map((amenity, index) => (
                            <Badge key={index} variant="secondary">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    {selectedProperty.features?.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Features</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedProperty.features.map((feature, index) => (
                            <Badge key={index} variant="outline">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Broker Info */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium">Broker Name</Label>
                        <p className="text-sm">{selectedProperty.brokerName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Broker Contact</Label>
                        <p className="text-sm">{selectedProperty.brokerContact}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Views</Label>
                        <p className="text-sm">{selectedProperty.views || 0}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Favorites</Label>
                        <p className="text-sm">{selectedProperty.favorites?.length || 0}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Featured</Label>
                        <Badge variant={selectedProperty.isFeatured ? "default" : "secondary"}>
                          {selectedProperty.isFeatured ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>

                    {/* Approval Actions */}
                    {selectedProperty.approvalStatus === 'pending' && (
                      <div className="pt-4 border-t">
                        <Label className="text-sm font-medium mb-2 block">Approval Actions</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => handleApprovalChange(selectedProperty._id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <IconCheck className="h-4 w-4 mr-2" />
                            Approve Property
                          </Button>
                          <Button
                            onClick={() => {
                              const reason = window.prompt('Enter rejection reason:');
                              if (reason) handleApprovalChange(selectedProperty._id, 'reject', reason);
                            }}
                            variant="destructive"
                          >
                            <IconX className="h-4 w-4 mr-2" />
                            Reject Property
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {selectedProperty.approvalStatus === 'rejected' && selectedProperty.rejectionReason && (
                      <div className="pt-4 border-t">
                        <Label className="text-sm font-medium">Rejection Reason</Label>
                        <p className="text-sm text-red-600 mt-1">{selectedProperty.rejectionReason}</p>
                      </div>
                    )}

                    {/* Status Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleStatusChange(selectedProperty._id, "Active")}
                        disabled={selectedProperty.status === "Active"}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <IconCheck className="h-4 w-4 mr-2" />
                        Set Active
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(selectedProperty._id, "Inactive")}
                        disabled={selectedProperty.status === "Inactive"}
                        variant="outline"
                      >
                        <IconX className="h-4 w-4 mr-2" />
                        Set Inactive
                      </Button>
                      <Button
                        onClick={() => 
                          handleToggleFeatured(selectedProperty._id, selectedProperty.isFeatured)
                        }
                        variant="outline"
                      >
                        {selectedProperty.isFeatured ? (
                          <>
                            <IconStar className="h-4 w-4 mr-2" />
                            Unfeature
                          </>
                        ) : (
                          <>
                            <IconStarFilled className="h-4 w-4 mr-2" />
                            Feature
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleEditProperty(selectedProperty)}
                        variant="secondary"
                      >
                        <IconEdit className="h-4 w-4 mr-2" />
                        Edit Details
                      </Button>
                      <Button
                        onClick={() => handleDeleteProperty(selectedProperty._id)}
                        variant="destructive"
                      >
                        Delete Property
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Property Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Property</DialogTitle>
                </DialogHeader>
                {editingProperty && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                          id="edit-title"
                          value={editingProperty.title}
                          onChange={(e) => setEditingProperty({
                            ...editingProperty,
                            title: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-propertyType">Property Type</Label>
                        <Select
                          value={editingProperty.propertyType}
                          onValueChange={(value) => setEditingProperty({
                            ...editingProperty,
                            propertyType: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Apartment">Apartment</SelectItem>
                            <SelectItem value="House">House</SelectItem>
                            <SelectItem value="Villa">Villa</SelectItem>
                            <SelectItem value="Cottage">Cottage</SelectItem>
                            <SelectItem value="Commercial">Commercial</SelectItem>
                            <SelectItem value="Land">Land</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-transactionType">Transaction Type</Label>
                        <Select
                          value={editingProperty.transactionType}
                          onValueChange={(value) => setEditingProperty({
                            ...editingProperty,
                            transactionType: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sale">Sale</SelectItem>
                            <SelectItem value="Rent">Rent</SelectItem>
                            <SelectItem value="Lease">Lease</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-price">Price</Label>
                        <Input
                          id="edit-price"
                          type="number"
                          value={editingProperty.price}
                          onChange={(e) => setEditingProperty({
                            ...editingProperty,
                            price: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-area">Area</Label>
                        <Input
                          id="edit-area"
                          type="number"
                          value={editingProperty.area}
                          onChange={(e) => setEditingProperty({
                            ...editingProperty,
                            area: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-areaUnit">Area Unit</Label>
                        <Select
                          value={editingProperty.areaUnit}
                          onValueChange={(value) => setEditingProperty({
                            ...editingProperty,
                            areaUnit: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sq ft">sq ft</SelectItem>
                            <SelectItem value="sq m">sq m</SelectItem>
                            <SelectItem value="acres">acres</SelectItem>
                            <SelectItem value="hectares">hectares</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-bedrooms">Bedrooms</Label>
                        <Input
                          id="edit-bedrooms"
                          type="number"
                          value={editingProperty.bedrooms}
                          onChange={(e) => setEditingProperty({
                            ...editingProperty,
                            bedrooms: parseInt(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-bathrooms">Bathrooms</Label>
                        <Input
                          id="edit-bathrooms"
                          type="number"
                          value={editingProperty.bathrooms}
                          onChange={(e) => setEditingProperty({
                            ...editingProperty,
                            bathrooms: parseInt(e.target.value) || 0
                          })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <textarea
                        id="edit-description"
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        value={editingProperty.description}
                        onChange={(e) => setEditingProperty({
                          ...editingProperty,
                          description: e.target.value
                        })}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="edit-address">Address</Label>
                        <Input
                          id="edit-address"
                          value={editingProperty.location.address}
                          onChange={(e) => setEditingProperty({
                            ...editingProperty,
                            location: {
                              ...editingProperty.location,
                              address: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-city">City</Label>
                        <Input
                          id="edit-city"
                          value={editingProperty.location.city}
                          onChange={(e) => setEditingProperty({
                            ...editingProperty,
                            location: {
                              ...editingProperty.location,
                              city: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-state">State</Label>
                        <Input
                          id="edit-state"
                          value={editingProperty.location.state}
                          onChange={(e) => setEditingProperty({
                            ...editingProperty,
                            location: {
                              ...editingProperty.location,
                              state: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-pincode">Pincode</Label>
                        <Input
                          id="edit-pincode"
                          value={editingProperty.location.pincode}
                          onChange={(e) => setEditingProperty({
                            ...editingProperty,
                            location: {
                              ...editingProperty.location,
                              pincode: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
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