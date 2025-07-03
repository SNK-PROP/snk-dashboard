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
    mobile: "",
    email: "",
    fullName: "",
    gender: "",
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
            phoneNumber: item.userId?.mobile || "N/A",
            vehicleNumber: item.vehicleNumber || "N/A",
            drivingLicenceNumber: item.drivingLicenceNumber || "N/A",
            original: item,
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
        mobile: partner.phoneNumber || "",
        email: partner.email || "",
        fullName: partner.name || "",
        gender: partner.original?.gender || "male",
        vehicleNumber: partner.vehicleNumber || "",
        drivingLicenceNumber: partner.drivingLicenceNumber || "",
      });
    };
    window.addEventListener("editPartner", handleEditPartner);
    return () => window.removeEventListener("editPartner", handleEditPartner);
  }, []);

  const handleAddDeliveryPartner = async () => {
    try {
      if (
        !newDeliveryPartner.mobile ||
        !newDeliveryPartner.email ||
        !newDeliveryPartner.fullName ||
        !newDeliveryPartner.vehicleNumber ||
        !newDeliveryPartner.drivingLicenceNumber
      ) {
        toast.error("Please fill in all required fields", {
          style: {
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            borderColor: "#EF4444",
          },
        });
        return;
      }

      const requestData = {
        mobile: newDeliveryPartner.mobile,
        email: newDeliveryPartner.email,
        fullName: newDeliveryPartner.fullName,
        gender: newDeliveryPartner.gender,
        addresses: [
          {
            type: "home",
            address: "789 Partner Street",
            city: "Pune",
            state: "Maharashtra",
            pincode: "411001",
            isDefault: true,
            tag: "home",
          },
        ],
        vehicleNumber: newDeliveryPartner.vehicleNumber,
        vehicleType: "bike",
        vehicleBrand: "Honda",
        ownerName: newDeliveryPartner.fullName,
        registrationDate: "2023-01-15",
        drivingLicenceNumber: newDeliveryPartner.drivingLicenceNumber,
        insuranceDoc: "insurance_doc_url",
        rcDoc: "rc_doc_url",
        pucDoc: "puc_doc_url",
        licenceImage: "licence_image_url",
        emergencyContactName: "Emergency Contact",
        emergencyContactNumber: "9876543210",
        aadharNumber: "123456789012",
        aadharImage: "aadhar_image_url",
        profileImage: "profile_image_url",
        bankDetails: {
          accountNumber: "1234567890",
          ifscCode: "SBIN0001234",
          bankName: "State Bank of India",
          accountHolderName: newDeliveryPartner.fullName,
        },
        isVerify: true,
      };

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}delivery-partner`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        data: JSON.stringify(requestData),
      };

      const response = await axios.request(config);
      await fetchData();
      setOpenSheet(false);
      setNewDeliveryPartner({
        mobile: "",
        email: "",
        fullName: "",
        gender: "",
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
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add delivery partner. Please try again.";
      toast.error(errorMessage, {
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
      if (!editPartner?.original?._id) {
        toast.error("No delivery partner selected for editing", {
          style: {
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            borderColor: "#EF4444",
          },
        });
        return;
      }

      if (
        !newDeliveryPartner.mobile ||
        !newDeliveryPartner.email ||
        !newDeliveryPartner.fullName ||
        !newDeliveryPartner.vehicleNumber ||
        !newDeliveryPartner.drivingLicenceNumber
      ) {
        toast.error("Please fill in all required fields", {
          style: {
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            borderColor: "#EF4444",
          },
        });
        return;
      }

      const requestData = {
        mobile: newDeliveryPartner.mobile,
        email: newDeliveryPartner.email,
        fullName: newDeliveryPartner.fullName,
        vehicleNumber: newDeliveryPartner.vehicleNumber,
        drivingLicenceNumber: newDeliveryPartner.drivingLicenceNumber,
        gender: newDeliveryPartner.gender,
        addresses: [
          {
            type: "home",
            address: "789 Partner Street",
            city: "Pune",
            state: "Maharashtra",
            pincode: "411001",
            isDefault: true,
            tag: "home",
          },
        ],
        vehicleType: "bike",
        vehicleBrand: "Honda",
        emergencyContactName: "Emergency Contact",
        emergencyContactNumber: "9876543210",
        aadharNumber: "123456789012",
        bankDetails: {
          accountNumber: "1234567890",
          ifscCode: "SBIN0001234",
          bankName: "State Bank of India",
          accountHolderName: newDeliveryPartner.fullName,
        },
      };

      const config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}delivery-partner/${editPartner.original._id}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        data: JSON.stringify(requestData),
      };

      const response = await axios.request(config);
      await fetchData();
      setEditSheetOpen(false);
      setEditPartner(null);
      setNewDeliveryPartner({
        mobile: "",
        email: "",
        fullName: "",
        gender: "",
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
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update delivery partner. Please try again.";
      toast.error(errorMessage, {
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
                  {/* <Button variant="default">Add Delivery Partner</Button> */}
                </SheetTrigger>
                <SheetContent className="max-w-md w-full p-0 bg-white shadow-lg flex flex-col overflow-y-auto max-h-screen">
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
                        htmlFor="fullName"
                        className="block text-sm font-medium mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        required
                        value={newDeliveryPartner.fullName}
                        onChange={(e) =>
                          setNewDeliveryPartner({
                            ...newDeliveryPartner,
                            fullName: e.target.value,
                          })
                        }
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter full name"
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
                        type="email"
                        required
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
                        htmlFor="mobile"
                        className="block text-sm font-medium mb-1"
                      >
                        Mobile Number
                      </label>
                      <input
                        id="mobile"
                        required
                        value={newDeliveryPartner.mobile}
                        onChange={(e) =>
                          setNewDeliveryPartner({
                            ...newDeliveryPartner,
                            mobile: e.target.value,
                          })
                        }
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter mobile number"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium mb-1"
                      >
                        Gender
                      </label>
                      <select
                        id="gender"
                        required
                        value={newDeliveryPartner.gender}
                        onChange={(e) =>
                          setNewDeliveryPartner({
                            ...newDeliveryPartner,
                            gender: e.target.value,
                          })
                        }
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
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
                        required
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
                        required
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
              <SheetContent className="max-w-md w-full p-0 bg-white shadow-lg flex flex-col overflow-y-auto max-h-screen">
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
                      htmlFor="editFullName"
                      className="block text-sm font-medium mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="editFullName"
                      value={newDeliveryPartner.fullName}
                      onChange={(e) =>
                        setNewDeliveryPartner({
                          ...newDeliveryPartner,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter full name"
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
                      type="email"
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
                      htmlFor="editMobile"
                      className="block text-sm font-medium mb-1"
                    >
                      Mobile Number
                    </label>
                    <input
                      id="editMobile"
                      value={newDeliveryPartner.mobile}
                      onChange={(e) =>
                        setNewDeliveryPartner({
                          ...newDeliveryPartner,
                          mobile: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="editGender"
                      className="block text-sm font-medium mb-1"
                    >
                      Gender
                    </label>
                    <select
                      id="editGender"
                      value={newDeliveryPartner.gender}
                      onChange={(e) =>
                        setNewDeliveryPartner({
                          ...newDeliveryPartner,
                          gender: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
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