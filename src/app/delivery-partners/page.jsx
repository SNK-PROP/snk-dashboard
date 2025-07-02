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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
    cell: ({ row }) => {
      const partner = row.original;
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
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onSelect={() => {
                window.dispatchEvent(
                  new CustomEvent("editPartner", { detail: partner })
                );
              }}
            >
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function Page() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSheet, setOpenSheet] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [newDeliveryPartner, setNewDeliveryPartner] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    vehicleNumber: "",
    drivingLicenceNumber: "",
  });
  const [editPartner, setEditPartner] = useState(null);

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
            name: item.userId?.fullName || "N/A",
            email: item.userId?.email || "N/A",
            phoneNumber:
              item.userId?.mobile || item.emergencyContactNumber || "N/A",
            vehicleNumber: item.vehicleNumber || "N/A",
            drivingLicenceNumber: item.drivingLicenceNumber || "N/A",
            original: item, // Store original data for editing
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
    const handleEditPartner = (event) => {
      const partner = event.detail;
      setEditPartner(partner);
      setEditSheetOpen(true);
      setNewDeliveryPartner({
        name: partner.name || "",
        email: partner.email || "",
        phoneNumber: partner.phoneNumber || "",
        vehicleNumber: partner.vehicleNumber || "",
        drivingLicenceNumber: partner.drivingLicenceNumber || "",
      });
    };
    window.addEventListener("editPartner", handleEditPartner);
    return () => window.removeEventListener("editPartner", handleEditPartner);
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
          ownerName: newDeliveryPartner.name,
          vehicleType: "",
          vehicleBrand: "",
          registrationDate: new Date().toISOString(),
          emergencyContactNumber: newDeliveryPartner.phoneNumber,
        }),
      };

      await axios.request(config);
      await fetchData();
      setOpenSheet(false);
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

  const handleEditDeliveryPartner = async () => {
    try {
      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}delivery-partners/${editPartner.original._id}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        data: JSON.stringify({
          ...newDeliveryPartner,
          ownerName: newDeliveryPartner.name,
          vehicleType: editPartner.original.vehicleType || "",
          vehicleBrand: editPartner.original.vehicleBrand || "",
          registrationDate:
            editPartner.original.registrationDate || new Date().toISOString(),
          emergencyContactNumber: newDeliveryPartner.phoneNumber,
        }),
      };

      await axios.request(config);
      await fetchData();
      setEditSheetOpen(false);
      setEditPartner(null);
      setNewDeliveryPartner({
        name: "",
        email: "",
        phoneNumber: "",
        vehicleNumber: "",
        drivingLicenceNumber: "",
      });
      toast.success("Delivery partner updated successfully!", {
        style: {
          backgroundColor: "#DCFCE7",
          color: "#166534",
          borderColor: "#16A34A",
        },
      });
    } catch (error) {
      console.error("Error updating delivery partner:", error);
      toast.error("Failed to update delivery partner. Please try again.", {
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
              <h1 className="text-2xl font-bold mb-1">Delivery Partners</h1>
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
              <h1 className="text-2xl font-bold mb-1">Delivery Partners</h1>
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold mb-1">Delivery Partners</h1>
                <p className="text-muted-foreground mb-4">
                  Manage your delivery partners and their details.
                </p>
              </div>
              <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                <SheetTrigger asChild>
                  <Button variant="default">Add Delivery Partner</Button>
                </SheetTrigger>
                <SheetContent className="max-w-md w-full p-0 bg-white shadow-lg flex flex-col">
                  <SheetHeader className="px-6 pt-6">
                    <SheetTitle>Add New Delivery Partner</SheetTitle>
                    <SheetDescription>
                      Enter delivery partner details below. Click save when
                      you're done.
                    </SheetDescription>
                  </SheetHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddDeliveryPartner();
                    }}
                    className="flex flex-col gap-4 flex-1 px-6 mb-6 mt-4"
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-1"
                      >
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
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1"
                      >
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
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium mb-1"
                      >
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
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="vehicleNumber"
                        className="block text-sm font-medium mb-1"
                      >
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
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter vehicle number"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="drivingLicenceNumber"
                        className="block text-sm font-medium mb-1"
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
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter driving licence number"
                      />
                    </div>
                    <div className="mt-auto flex flex-col gap-3">
                      <Button
                        variant="default"
                        type="submit"
                        className="w-full"
                      >
                        Save Delivery Partner
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setOpenSheet(false)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
            <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
              <SheetContent className="max-w-md w-full p-0 bg-white shadow-lg flex flex-col">
                <SheetHeader className="px-6 pt-6">
                  <SheetTitle>Edit Delivery Partner</SheetTitle>
                  <SheetDescription>
                    Update delivery partner details below. Click save when
                    you're done.
                  </SheetDescription>
                </SheetHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEditDeliveryPartner();
                  }}
                  className="flex flex-col gap-4 flex-1 px-6 mb-6 mt-4"
                >
                  <div>
                    <label
                      htmlFor="editName"
                      className="block text-sm font-medium mb-1"
                    >
                      Name
                    </label>
                    <input
                      id="editName"
                      value={newDeliveryPartner.name}
                      onChange={(e) =>
                        setNewDeliveryPartner({
                          ...newDeliveryPartner,
                          name: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="editEmail"
                      className="block text-sm font-medium mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="editEmail"
                      value={newDeliveryPartner.email}
                      onChange={(e) =>
                        setNewDeliveryPartner({
                          ...newDeliveryPartner,
                          email: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="editPhoneNumber"
                      className="block text-sm font-medium mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      id="editPhoneNumber"
                      value={newDeliveryPartner.phoneNumber}
                      onChange={(e) =>
                        setNewDeliveryPartner({
                          ...newDeliveryPartner,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="editVehicleNumber"
                      className="block text-sm font-medium mb-1"
                    >
                      Vehicle Number
                    </label>
                    <input
                      id="editVehicleNumber"
                      value={newDeliveryPartner.vehicleNumber}
                      onChange={(e) =>
                        setNewDeliveryPartner({
                          ...newDeliveryPartner,
                          vehicleNumber: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter vehicle number"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="editDrivingLicenceNumber"
                      className="block text-sm font-medium mb-1"
                    >
                      Driving Licence Number
                    </label>
                    <input
                      id="editDrivingLicenceNumber"
                      value={newDeliveryPartner.drivingLicenceNumber}
                      onChange={(e) =>
                        setNewDeliveryPartner({
                          ...newDeliveryPartner,
                          drivingLicenceNumber: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter driving licence number"
                    />
                  </div>
                  <div className="mt-auto flex flex-col gap-3">
                    <Button variant="default" type="submit" className="w-full">
                      Update Delivery Partner
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setEditSheetOpen(false)}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>
            <div className="rounded-xl overflow-hidden mt-10">
              <DataTable data={tableData} columns={columns} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
