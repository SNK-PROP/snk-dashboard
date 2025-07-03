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
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [remark, setRemark] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}medicals`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      };

      const response = await axios.request(config);
      const medicalData = response.data.data.map((item, index) => ({
        id: index + 1,
        _id: item._id,
        medical_name: item.medical_name,
        owner_name: item.owner_name,
        phone_number: item.phone_number,
        approved: item.approved ? "Approved" : "Rejected",
        medical_images: item.medical_images,
        drugLicense: item.drugLicense,
      }));
      setTableData(medicalData);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch medical data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async () => {
    if (!selectedRow) return;

    try {
      const newApproved =
        selectedRow.getValue("approved") === "Approved" ? false : true;
      const config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}verifyMedical/${selectedRow.original._id}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        data: JSON.stringify({
          approved: newApproved,
          medicalRemarks: remark || "",
          paymentStatus: "paid",
        }),
      };

      const response = await axios.request(config);

      await fetchData();

      setOpenDialog(false);
      setRemark("");
      toast.success("Status updated successfully!", {
        style: {
          backgroundColor: "#DCFCE7",
          color: "#166534",
          borderColor: "#16A34A",
        },
      });
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update medical status");
      toast.error("Failed to update status. Please try again.", {
        style: {
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          borderColor: "#EF4444",
        },
      });
    }
  };

  const columns = [
    {
      accessorKey: "id",
      header: "S.No",
    },
    {
      accessorKey: "medical_name",
      header: "Medical Name",
    },
    {
      accessorKey: "owner_name",
      header: "Owner Name",
    },
    {
      accessorKey: "phone_number",
      header: "Phone Number",
    },
    {
      accessorKey: "approved",
      header: "Status",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const isApproved = row.getValue("approved") === "Approved";
        const actionText = isApproved ? "Reject" : "Approve";
        const textColor = isApproved ? "text-red-600" : "text-green-600";

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
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedRow(row);
                  setViewDialogOpen(true);
                }}
              >
                View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={`${textColor} flex items-center gap-2 font-medium`}
                onClick={() => {
                  setSelectedRow(row);
                  setOpenDialog(true);
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
              <h1 className="text-2xl font-bold mb-1">Medicals Page</h1>
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
              <h1 className="text-2xl font-bold mb-1">Medicals Page</h1>
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
            <h1 className="text-2xl font-bold mb-1">Medicals Page</h1>
            <p className="text-muted-foreground mb-4">
              Manage your medicals and their details.
            </p>
            <div className="rounded-xl overflow-hidden mt-10">
              <DataTable data={tableData} columns={columns} />
            </div>
          </div>
        </div>
      </SidebarInset>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Approvals</DialogTitle>
            <DialogDescription className="text-gray-500">
              Make changes to your approvals here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="remark" className="text-right">
                Remark
              </label>
              <input
                id="remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="col-span-3 border-blue-700 rounded-md p-2"
                placeholder="Enter remark"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleStatusChange}>
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <span>Medical Store Images</span>
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              View the medical store and drug license images.
            </DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 4v16m8-8H4"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Medical Images
                </h3>
                {selectedRow.original.medical_images &&
                selectedRow.original.medical_images.length > 0 ? (
                  selectedRow.original.medical_images.map((image, index) => (
                    <div key={index} className="w-full mb-4">
                      <img
                        src={image}
                        alt={`Medical Image ${index + 1}`}
                        className="w-full h-56 object-cover rounded-xl shadow-md border border-gray-100"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 italic">
                    No medical images available.
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Drug License
                </h3>
                <div className="w-full">
                  {selectedRow.original.drugLicense ? (
                    <img
                      src={selectedRow.original.drugLicense}
                      alt="Drug License"
                      className="w-full h-56 object-cover rounded-xl shadow-md border border-gray-100"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-400 italic">
                      No drug license image available.
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
    </SidebarProvider>
  );
}
