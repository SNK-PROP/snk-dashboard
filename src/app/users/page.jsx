"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical, IconX } from "@tabler/icons-react";
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

const userColumns = [
  { accessorKey: "id", header: "S.No" },
  { accessorKey: "fullName", header: "User Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "mobile", header: "Phone Number" },
  { accessorKey: "address", header: "Address" },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
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
                  new CustomEvent("editUser", { detail: user })
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
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    mobile: "",
    address: "",
    houseNumber: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [editUser, setEditUser] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}users`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      };

      const response = await axios.request(config);
      const userData = response.data.data.map((item, index) => {
        let address = "N/A";
        if (item.addresses && Array.isArray(item.addresses)) {
          const homeAddress = item.addresses.find(
            (addr) => addr.tag === "home"
          );
          if (homeAddress) {
            address = `${homeAddress.houseNumber}, ${homeAddress.landmark}, ${homeAddress.city}, ${homeAddress.pincode}`;
          }
        }
        return {
          id: index + 1,
          fullName: item.fullName || "N/A",
          email: item.email || "N/A",
          mobile: item.mobile || "N/A",
          address,
          original: item, // Store original data for editing
        };
      });
      setTableData(userData);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch user data");
      toast.error("Failed to fetch users. Please try again.", {
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
    const handleEditUser = (event) => {
      const user = event.detail;
      setEditUser(user);
      setEditSheetOpen(true);
      setNewUser({
        fullName: user.fullName || "",
        email: user.email || "",
        mobile: user.mobile || "",
        houseNumber: user.address.split(",")[0] || "",
        landmark: user.address.split(",")[1] || "",
        city: user.address.split(",")[2] || "",
        pincode: user.address.split(",")[3] || "",
        state:
          user.original.addresses?.find((addr) => addr.tag === "home")?.state ||
          "",
      });
    };
    window.addEventListener("editUser", handleEditUser);
    return () => window.removeEventListener("editUser", handleEditUser);
  }, []);

  const handleAddUser = async () => {
    try {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}user`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        data: JSON.stringify({
          ...newUser,
          addresses: [
            {
              tag: "home",
              houseNumber: newUser.houseNumber || "",
              landmark: newUser.landmark || "",
              city: newUser.city || "",
              state: newUser.state || "",
              pincode: newUser.pincode || "",
            },
          ],
        }),
      };

      await axios.request(config);
      await fetchData();
      setOpenSheet(false);
      setNewUser({
        fullName: "",
        email: "",
        mobile: "",
        address: "",
        houseNumber: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
      });
      toast.success("User added successfully!", {
        style: {
          backgroundColor: "#DCFCE7",
          color: "#166534",
          borderColor: "#16A34A",
        },
      });
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user. Please try again.", {
        style: {
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          borderColor: "#EF4444",
        },
      });
    }
  };

  const handleEditUser = async () => {
    try {
      const config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}user/${editUser.original._id}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        data: JSON.stringify({
          ...newUser,
          addresses: [
            {
              tag: "home",
              houseNumber: newUser.houseNumber || "",
              landmark: newUser.landmark || "",
              city: newUser.city || "",
              state: newUser.state || "",
              pincode: newUser.pincode || "",
            },
          ],
        }),
      };

      await axios.request(config);
      await fetchData();
      setEditSheetOpen(false);
      setEditUser(null);
      setNewUser({
        fullName: "",
        email: "",
        mobile: "",
        address: "",
        houseNumber: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
      });
      toast.success("User updated successfully!", {
        style: {
          backgroundColor: "#DCFCE7",
          color: "#166534",
          borderColor: "#16A34A",
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.", {
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
              <h1 className="text-2xl font-bold mb-1">Users</h1>
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
              <h1 className="text-2xl font-bold mb-1">Users</h1>
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
                <h1 className="text-2xl font-bold mb-1">Users</h1>
                <p className="text-muted-foreground mb-4">
                  Manage your users and their details.
                </p>
              </div>
              <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                <SheetTrigger asChild>
                  <Button variant="default">Add User</Button>
                </SheetTrigger>
                <SheetContent className="max-w-md w-full p-0 bg-white shadow-lg flex flex-col">
                  <SheetHeader className="px-6 pt-6">
                    <SheetTitle>Add New User</SheetTitle>
                    <SheetDescription>
                      Enter user details below. Click save when you're done.
                    </SheetDescription>
                  </SheetHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddUser();
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
                        value={newUser.fullName}
                        onChange={(e) =>
                          setNewUser({ ...newUser, fullName: e.target.value })
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
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
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
                        Phone Number
                      </label>
                      <input
                        id="mobile"
                        value={newUser.mobile}
                        onChange={(e) =>
                          setNewUser({ ...newUser, mobile: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="houseNumber"
                        className="block text-sm font-medium mb-1"
                      >
                        Address
                      </label>
                      <input
                        id="houseNumber"
                        value={newUser.houseNumber}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            houseNumber: e.target.value,
                          })
                        }
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter Address"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="landmark"
                        className="block text-sm font-medium mb-1"
                      >
                        Landmark
                      </label>
                      <input
                        id="landmark"
                        value={newUser.landmark}
                        onChange={(e) =>
                          setNewUser({ ...newUser, landmark: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter Landmark"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium mb-1"
                      >
                        City
                      </label>
                      <input
                        id="city"
                        value={newUser.city}
                        onChange={(e) =>
                          setNewUser({ ...newUser, city: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter City"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium mb-1"
                      >
                        State
                      </label>
                      <input
                        id="state"
                        value={newUser.state}
                        onChange={(e) =>
                          setNewUser({ ...newUser, state: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter State"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="pincode"
                        className="block text-sm font-medium mb-1"
                      >
                        Pincode
                      </label>
                      <input
                        id="pincode"
                        value={newUser.pincode}
                        onChange={(e) =>
                          setNewUser({ ...newUser, pincode: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                        placeholder="Enter Pincode"
                      />
                    </div>
                    <div className="mt-auto flex flex-col gap-3">
                      <Button
                        variant="default"
                        type="submit"
                        className="w-full"
                      >
                        Save User
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
                  <SheetTitle>Edit User</SheetTitle>
                  <SheetDescription>
                    Update user details below. Click save when you're done.
                  </SheetDescription>
                </SheetHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEditUser();
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
                      value={newUser.fullName}
                      onChange={(e) =>
                        setNewUser({ ...newUser, fullName: e.target.value })
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
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
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
                      Phone Number
                    </label>
                    <input
                      id="editMobile"
                      value={newUser.mobile}
                      onChange={(e) =>
                        setNewUser({ ...newUser, mobile: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="editHouseNumber"
                      className="block text-sm font-medium mb-1"
                    >
                      Address
                    </label>
                    <input
                      id="editHouseNumber"
                      value={newUser.houseNumber}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          houseNumber: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter Address"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="editLandmark"
                      className="block text-sm font-medium mb-1"
                    >
                      Landmark
                    </label>
                    <input
                      id="editLandmark"
                      value={newUser.landmark}
                      onChange={(e) =>
                        setNewUser({ ...newUser, landmark: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter Landmark"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="editCity"
                      className="block text-sm font-medium mb-1"
                    >
                      City
                    </label>
                    <input
                      id="editCity"
                      value={newUser.city}
                      onChange={(e) =>
                        setNewUser({ ...newUser, city: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter City"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="editState"
                      className="block text-sm font-medium mb-1"
                    >
                      State
                    </label>
                    <input
                      id="editState"
                      value={newUser.state}
                      onChange={(e) =>
                        setNewUser({ ...newUser, state: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter State"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="editPincode"
                      className="block text-sm font-medium mb-1"
                    >
                      Pincode
                    </label>
                    <input
                      id="editPincode"
                      value={newUser.pincode}
                      onChange={(e) =>
                        setNewUser({ ...newUser, pincode: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
                      placeholder="Enter Pincode"
                    />
                  </div>
                  <div className="mt-auto flex flex-col gap-3">
                    <Button variant="default" type="submit" className="w-full">
                      Update User
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
              <DataTable data={tableData} columns={userColumns} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
