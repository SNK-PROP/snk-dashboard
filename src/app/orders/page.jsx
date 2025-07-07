"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "@/components/data-table";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical } from "@tabler/icons-react";

export default function Page() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}orders`;
      if (filterStatus !== "All") {
        url += `?status=${filterStatus.toLowerCase()}`;
      }
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: url,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      };

      const response = await axios.request(config);
      if (!response.data.data || !Array.isArray(response.data.data)) {
        throw new Error("Invalid data format from API");
      }
      const ordersData = response.data.data.map((item, index) => {
        let deliveryPartnerName = item.deliveryPartnerName || "Not Assigned";
        if (item.deliveryPartnerName && deliveryPartners.length > 0) {
          const partner = deliveryPartners.find(
            (p) => p._id === item.deliveryPartnerName
          );
          if (partner && partner.ownerName) {
            deliveryPartnerName = partner.ownerName;
          }
        }
        return {
          id: (index + 1).toString(),
          serialNumber: index + 1,
          orderId: item.orderId,
          orderNumber: item.orderNumber || "N/A",
          customerName: item.customerName || "N/A",
          phone: item.customerPhone || "N/A",
          status: item.status || "N/A",
          amount: item.amount || "N/A",
          medicalName: item.medicalStore || "N/A",
          deliveryPartnerName: deliveryPartnerName,
        };
      });
      setTableData(ordersData);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch order data: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPartners = async () => {
    try {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}delivery-partners`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      };
      const response = await axios.request(config);
      if (response.data.success && response.data.data?.partners) {
        setDeliveryPartners(
          response.data.data.partners.filter((partner) => partner.isOnline)
        );
      } else {
        throw new Error("Invalid delivery partners data format from API");
      }
    } catch (error) {
      console.error("Error fetching delivery partners:", error);
      toast.error(
        "Failed to load delivery partners: " + (error.message || error),
        {
          style: {
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            borderColor: "#EF4444",
          },
        }
      );
    }
  };

  const assignDeliveryPartner = async () => {
    try {
      const config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}assign-partner`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        data: JSON.stringify({
          orderId: selectedOrder.orderId,
          deliveryPartnerUserId: selectedPartnerId,
        }),
      };

      const response = await axios.request(config);
      if (response.data.success) {
        toast.success("Delivery partner assigned successfully!", {
          style: {
            backgroundColor: "#DCFCE7",
            color: "#166534",
            borderColor: "#16A34A",
          },
        });

        await fetchData();
        await fetchOrderDetails(selectedOrder.orderId);

        setAssignDialogOpen(false);
        setSelectedPartnerId("");
        setSelectedOrder(null);
      } else {
        throw new Error(response.data.message || "Assignment failed");
      }
    } catch (error) {
      console.error(
        "Error assigning delivery partner:",
        error.response?.data || error
      );
      toast.error(
        "Failed to assign delivery partner: " +
          (error.response?.data?.message || error.message),
        {
          style: {
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            borderColor: "#EF4444",
          },
        }
      );
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}order/${orderId}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      };
      const response = await axios.request(config);
      if (!response.data.data) {
        throw new Error("Invalid order details format from API");
      }
      setSelectedOrder(response.data.data);
      setTableData((prevData) =>
        prevData.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                deliveryPartnerName:
                  response.data.data.deliveryPartnerName || "Not Assigned",
              }
            : order
        )
      );
    } catch (error) {
      console.error(
        "Error fetching order details:",
        error.response?.data || error.message
      );
      toast.error(
        "Failed to load order details: " +
          (error.response?.data?.message || error.message),
        {
          style: {
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            borderColor: "#EF4444",
          },
        }
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const columns = [
    { accessorKey: "serialNumber", header: "S.No" },
    { accessorKey: "orderNumber", header: "Order Number" },
    { accessorKey: "customerName", header: "Customer Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "medicalName", header: "Medical Name" },
    { accessorKey: "deliveryPartnerName", header: "Delivery Partner" },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        const isAssigned = order.deliveryPartnerName !== "Not Assigned";
        const actionText = isAssigned
          ? "Change Delivery Partner"
          : "Assign Delivery Partner";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-35">
              <DropdownMenuItem
                onSelect={() => {
                  setViewDialogOpen(true);
                  fetchOrderDetails(order.orderId);
                }}
              >
                View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  if (!assignDialogOpen) {
                    setSelectedOrder(order);
                    fetchDeliveryPartners();
                    setAssignDialogOpen(true);
                  }
                }}
              >
                {actionText}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-start w-full min-h-0">
            <div className="w-full max-w-6xl flex flex-col gap-0 mt-8">
              <h1 className="text-2xl font-bold mb-1">Orders Page</h1>
              <p className="text-muted-foreground mb-4">Loading...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-start w-full min-h-0">
            <div className="w-full max-w-6xl flex flex-col gap-0 mt-8">
              <h1 className="text-2xl font-bold mb-1">Orders Page</h1>
              <p className="text-muted-foreground mb-4 text-red-500">{error}</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-start w-full min-h-0">
          <div className="w-full max-w-6xl flex flex-col gap-0 mt-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Orders Page</h1>
                <p className="text-muted-foreground mb-4">
                  Manage your orders and their details.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={filterStatus === "All" ? "default" : "outline"}
                  onClick={() => setFilterStatus("All")}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "Placed" ? "default" : "outline"}
                  onClick={() => setFilterStatus("Placed")}
                >
                  Placed
                </Button>
                <Button
                  variant={filterStatus === "Pending" ? "default" : "outline"}
                  onClick={() => setFilterStatus("Pending")}
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === "Delivered" ? "default" : "outline"}
                  onClick={() => setFilterStatus("Delivered")}
                >
                  Delivered
                </Button>
                <Button
                  variant={filterStatus === "PickedUp" ? "default" : "outline"}
                  onClick={() => setFilterStatus("PickedUp")}
                >
                  Picked Up
                </Button>
                <Button
                  variant={filterStatus === "Rejected" ? "default" : "outline"}
                  onClick={() => setFilterStatus("Rejected")}
                >
                  Rejected
                </Button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden mt-10">
              <DataTable data={tableData} columns={columns} />
            </div>
          </div>
        </div>
      </SidebarInset>
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <span>Order Details</span>
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              View all details of the order.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="px-6 pb-6 overflow-y-auto max-h-[70vh]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">
                      {selectedOrder.userId?.fullName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mobile Number</p>
                    <p className="font-medium">
                      {selectedOrder.userId?.mobile || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Address Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">House Number</p>
                    <p className="font-medium">
                      {selectedOrder.userId?.addresses?.[0]?.houseNumber ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Landmark</p>
                    <p className="font-medium">
                      {selectedOrder.userId?.addresses?.[0]?.landmark || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">
                      {selectedOrder.userId?.addresses?.[0]?.city || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="font-medium">
                      {selectedOrder.userId?.addresses?.[0]?.state || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pincode</p>
                    <p className="font-medium">
                      {selectedOrder.userId?.addresses?.[0]?.pincode || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Latitude</p>
                    <p className="font-medium">
                      {selectedOrder.userId?.addresses?.[0]?.latitude || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Longitude</p>
                    <p className="font-medium">
                      {selectedOrder.userId?.addresses?.[0]?.longitude || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Medical Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Medical Name</p>
                    <p className="font-medium">
                      {selectedOrder.medicalId?.medical_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">
                      {selectedOrder.medicalId?.phone_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Area/Sector/Locality
                    </p>
                    <p className="font-medium">
                      {selectedOrder.medicalId?.area_sector_locality || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">
                      {selectedOrder.medicalId?.city || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Medicine Details</h3>
                {selectedOrder.medicines &&
                selectedOrder.medicines.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {selectedOrder.medicines.map((medicine, index) => (
                      <li key={index} className="mb-2">
                        Medicine ID: {medicine.medicineId?._id || "N/A"}, Qty:{" "}
                        {medicine.qty || "N/A"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">
                    No medicine details available.
                  </p>
                )}
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Bill</p>
                    <p className="font-medium">
                      {selectedOrder.totalBill || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="font-medium">
                      {selectedOrder.paymentStatus || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Status</p>
                    <p className="font-medium">
                      {selectedOrder.orderStatus || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  Prescription Image
                </h3>
                <div className="w-full">
                  {selectedOrder.prescriptionImage ? (
                    <img
                      src={selectedOrder.prescriptionImage}
                      alt="Prescription Image"
                      className="w-full h-56 object-cover rounded-xl shadow-md border border-gray-100"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-400 italic">
                      No prescription image available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end px-6 pb-6">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder?.deliveryPartnerName !== "Not Assigned"
                ? "Change Delivery Partner"
                : "Assign Delivery Partner"}
            </DialogTitle>
            <DialogDescription>
              Select an online delivery partner from the list below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[50vh] overflow-y-auto">
            {deliveryPartners.length > 0 ? (
              deliveryPartners.map((partner) => {
                const partnerId = partner._id;
                return (
                  <div
                    key={partner._id}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                      selectedPartnerId === partnerId
                        ? "bg-blue-100 text-blue-800"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedPartnerId(partnerId)}
                  >
                    <span className="font-medium">{partner.ownerName}</span>
                    <span
                      className={`text-sm ${
                        partner.isOnline ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {partner.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">
                No online delivery partners available.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 p-4 border-t">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={assignDeliveryPartner}
              disabled={!selectedPartnerId}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
