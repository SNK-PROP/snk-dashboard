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
  IconCurrency,
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 100,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (typeFilter !== "all") {
        params.propertyType = typeFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await apiService.getProperties(params);
      setProperties(response.properties || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [statusFilter, typeFilter]);

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
      toast.error("Failed to update featured status");
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await apiService.updatePropertyStatus(propertyId, newStatus);
      toast.success(`Property ${newStatus} successfully`);
      fetchProperties();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error updating property status:", error);
      toast.error("Failed to update property status");
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
                <div className="grid gap-4 md:grid-cols-4">
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
                <DataTable data={properties} columns={columns} />
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

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleStatusChange(selectedProperty._id, "Active")}
                        disabled={selectedProperty.status === "Active"}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <IconCheck className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(selectedProperty._id, "Inactive")}
                        disabled={selectedProperty.status === "Inactive"}
                        variant="outline"
                      >
                        <IconX className="h-4 w-4 mr-2" />
                        Deactivate
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}