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
import { IconDotsVertical } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const userColumns = [
  { accessorKey: "id", header: "S.No" },
  { accessorKey: "fullName", header: "User Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "mobile", header: "Phone Number" },
  { accessorKey: "address", header: "Address" },
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
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    mobile: "",
    address: "",
  });

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
  }, []);

  const handleAddUser = async () => {
    try {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}users`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        data: JSON.stringify({
          ...newUser,
          addresses: [
            {
              tag: "home",
              houseNumber: newUser.address.split(",")[0] || "",
              landmark: newUser.address.split(",")[1] || "",
              city: newUser.address.split(",")[2] || "",
              pincode: newUser.address.split(",")[3] || "",
            },
          ],
        }),
      };

      await axios.request(config);
      await fetchData(); // Refresh data after adding
      setOpenDialog(false);
      setNewUser({ fullName: "", email: "", mobile: "", address: "" });
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
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button variant="default">Add User</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Enter user details below. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="fullName" className="text-right">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        value={newUser.fullName}
                        onChange={(e) =>
                          setNewUser({ ...newUser, fullName: e.target.value })
                        }
                        className="col-span-3 border-blue-700 rounded-md p-2"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="email" className="text-right">
                        Email
                      </label>
                      <input
                        id="email"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                        className="col-span-3 border-blue-700 rounded-md p-2"
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="mobile" className="text-right">
                        Phone Number
                      </label>
                      <input
                        id="mobile"
                        value={newUser.mobile}
                        onChange={(e) =>
                          setNewUser({ ...newUser, mobile: e.target.value })
                        }
                        className="col-span-3 border-blue-700 rounded-md p-2"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="address" className="text-right">
                        Address
                      </label>
                      <input
                        id="address"
                        value={newUser.address}
                        onChange={(e) =>
                          setNewUser({ ...newUser, address: e.target.value })
                        }
                        className="col-span-3 border-blue-700 rounded-md p-2"
                        placeholder="Enter address (e.g., houseNumber, landmark, city, pincode)"
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
                    <Button variant="default" onClick={handleAddUser}>
                      Save User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl overflow-hidden mt-10">
              <DataTable data={tableData} columns={userColumns} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
