"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";

const columns = [
  { accessorKey: "id", header: "S.No" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phoneNumber", header: "Phone Number" },
  { accessorKey: "vehicleNumber", header: "Vehicle Number" },
  { accessorKey: "drivingLicenceNumber", header: "Driving Licence Number" },
  {
    id: "actions",
    cell: () => (
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
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function Page() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newDeliveryPartner, setNewDeliveryPartner] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    vehicleNumber: "",
    drivingLicenceNumber: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}delivery-partners`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      };

      const response = await axios.request(config);
      const deliveryData = Array.isArray(response.data.data?.partners)
        ? response.data.data.partners.map((item, index) => ({
            id: index + 1,
            name: item.userId?.fullName ||  "N/A",
            email: item.userId?.email || "N/A",
            phoneNumber:
              item.userId?.mobile || item.emergencyContactNumber || "N/A",
            vehicleNumber: item.vehicleNumber || "N/A",
            drivingLicenceNumber: item.drivingLicenceNumber || "N/A",
          }))
        : [];
      setTableData(deliveryData);
      setError(null);
    } catch (error) {
      console.error("Error fetching delivery partners:", error);
      setError("Failed to fetch delivery partners");
      toast.error("Failed to fetch delivery partners. Please try again.", {
        style: {
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          borderColor: "#EF4444",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDeliveryPartner = async () => {
    try {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}delivery-partners`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        data: JSON.stringify({
          ...newDeliveryPartner,
          ownerName: newDeliveryPartner.name, // Assuming ownerName is required
          vehicleType: "", // Default value; adjust as needed
          vehicleBrand: "", // Default value; adjust as needed
          registrationDate: new Date().toISOString(), // Default value; adjust as needed
          emergencyContactNumber: newDeliveryPartner.phoneNumber, // Default value; adjust as needed
        }),
      };

      await axios.request(config);
      await fetchData(); // Refresh data after adding
      setOpenDialog(false);
      setNewDeliveryPartner({
        name: "",
        email: "",
        phoneNumber: "",
        vehicleNumber: "",
        drivingLicenceNumber: "",
      });
      toast.success("Delivery partner added successfully!", {
        style: {
          backgroundColor: "#DCFCE7",
          color: "#166534",
          borderColor: "#16A34A",
        },
      });
    } catch (error) {
      console.error("Error adding delivery partner:", error);
      toast.error("Failed to add delivery partner. Please try again.", {
        style: {
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          borderColor: "#EF4444",
        },
      });
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-start w-full min-h-0">
              <div className="w-full max-w-6xl flex flex-col gap-0 mt-8">
                <h1 className="text-2xl font-bold mb-4">Delivery Partners</h1>
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
              <h1 className="text-2xl font-bold mb-4">Delivery Partners</h1>
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
                <h1 className="text-2xl font-bold mb-1">Delivery Partners</h1>
                <p className="text-muted-foreground mb-4">
                  Manage your delivery partners and their details.
                </p>
              </div>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button variant="default">Add User</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Delivery Partner</DialogTitle>
                    <DialogDescription>
                      Enter delivery partner details below. Click save when
                      you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right">
                        Name
                      </label>
                      <input
                        id="name"
                        value={newDeliveryPartner.name}
                        onChange={(e) =>
                          setNewDeliveryPartner({
                            ...newDeliveryPartner,
                            name: e.target.value,
                          })
                        }
                        className="col-span-3 border-blue-700 rounded-md p-2"
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="email" className="text-right">
                        Email
                      </label>
                      <input
                        id="email"
                        value={newDeliveryPartner.email}
                        onChange={(e) =>
                          setNewDeliveryPartner({
                            ...newDeliveryPartner,
                            email: e.target.value,
                          })
                        }
                        className="col-span-3 border-blue-700 rounded-md p-2"
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="phoneNumber" className="text-right">
                        Phone Number
                      </label>
                      <input
                        id="phoneNumber"
                        value={newDeliveryPartner.phoneNumber}
                        onChange={(e) =>
                          setNewDeliveryPartner({
                            ...newDeliveryPartner,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="col-span-3 border-blue-700 rounded-md p-2"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="vehicleNumber" className="text-right">
                        Vehicle Number
                      </label>
                      <input
                        id="vehicleNumber"
                        value={newDeliveryPartner.vehicleNumber}
                        onChange={(e) =>
                          setNewDeliveryPartner({
                            ...newDeliveryPartner,
                            vehicleNumber: e.target.value,
                          })
                        }
                        className="col-span-3 border-blue-700 rounded-md p-2"
                        placeholder="Enter vehicle number"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        htmlFor="drivingLicenceNumber"
                        className="text-right"
                      >
                        Driving Licence Number
                      </label>
                      <input
                        id="drivingLicenceNumber"
                        value={newDeliveryPartner.drivingLicenceNumber}
                        onChange={(e) =>
                          setNewDeliveryPartner({
                            ...newDeliveryPartner,
                            drivingLicenceNumber: e.target.value,
                          })
                        }
                        className="col-span-3 border-blue-700 rounded-md p-2"
                        placeholder="Enter driving licence number"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setOpenDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleAddDeliveryPartner}
                    >
                      Save User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl overflow-hidden mt-10">
              <DataTable data={tableData} columns={columns} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
