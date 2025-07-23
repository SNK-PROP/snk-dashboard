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
    gender: "male",
    vehicleNumber: "",
    vehicleType: "bike",
    vehicleBrand: "",
    ownerName: "",
    registrationDate: "",
    drivingLicenceNumber: "",
    insuranceDoc: null,
    rcDoc: null,
    pucDoc: null,
    licenceImage: null,
    emergencyContactName: "",
    emergencyContactNumber: "",
    aadharNumber: "",
    aadharImage: null,
    profileImage: null,
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      accountHolderName: "",
    },
    workingHours: {
      start: "09:00",
      end: "21:00",
    },
  });
  const [editPartner, setEditPartner] = useState(null);
  const [fileUploads, setFileUploads] = useState({
    insuranceDoc: null,
    rcDoc: null,
    pucDoc: null,
    licenceImage: null,
    aadharImage: null,
    profileImage: null,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/delivery-partners`,
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
        vehicleType: partner.original?.vehicleType || "bike",
        vehicleBrand: partner.original?.vehicleBrand || "",
        ownerName: partner.original?.ownerName || "",
        registrationDate:
          partner.original?.registrationDate?.split("T")[0] || "",
        drivingLicenceNumber: partner.drivingLicenceNumber || "",
        insuranceDoc: partner.original?.insuranceDoc || null,
        rcDoc: partner.original?.rcDoc || null,
        pucDoc: partner.original?.pucDoc || null,
        licenceImage: partner.original?.licenceImage || null,
        emergencyContactName: partner.original?.emergencyContactName || "",
        emergencyContactNumber: partner.original?.emergencyContactNumber || "",
        aadharNumber: partner.original?.aadharNumber || "",
        aadharImage: partner.original?.aadharImage || null,
        profileImage: partner.original?.profileImage || null,
        bankDetails: {
          accountNumber: partner.original?.bankDetails?.accountNumber || "",
          ifscCode: partner.original?.bankDetails?.ifscCode || "",
          bankName: partner.original?.bankDetails?.bankName || "",
          accountHolderName:
            partner.original?.bankDetails?.accountHolderName || "",
        },
        workingHours: {
          start: partner.original?.workingHours?.start || "09:00",
          end: partner.original?.workingHours?.end || "21:00",
        },
      });
      setFileUploads({
        insuranceDoc: null,
        rcDoc: null,
        pucDoc: null,
        licenceImage: null,
        aadharImage: null,
        profileImage: null,
      });
    };
    window.addEventListener("editPartner", handleEditPartner);
    return () => window.removeEventListener("editPartner", handleEditPartner);
  }, []);

  const validateRequiredFields = () => {
    const requiredFields = [
      "mobile",
      "email",
      "fullName",
      "vehicleNumber",
      "vehicleType",
      "vehicleBrand",
      "ownerName",
      "registrationDate",
      "drivingLicenceNumber",
      "insuranceDoc",
      "rcDoc",
      "pucDoc",
      "licenceImage",
      "emergencyContactName",
      "emergencyContactNumber",
    ];
    for (const field of requiredFields) {
      if (!newDeliveryPartner[field] && !fileUploads[field]) {
        return false;
      }
    }
    const bankFields = [
      "accountNumber",
      "ifscCode",
      "bankName",
      "accountHolderName",
    ];
    for (const field of bankFields) {
      if (!newDeliveryPartner.bankDetails[field]) {
        return false;
      }
    }
    return true;
  };

  const uploadFile = async (file, fieldName) => {
    const formData = new FormData();
    formData.append("file", file);

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}media`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
      data: formData,
    };

    try {
      const response = await axios.request(config);
      return response.data.fileUrl;
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      toast.error(`Failed to upload ${fieldName}. Please try again.`, {
        style: {
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          borderColor: "#EF4444",
        },
      });
      return null;
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFileUploads((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  const handleAddDeliveryPartner = async () => {
    try {
      if (!validateRequiredFields()) {
        toast.error("Please fill in all required fields", {
          style: {
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            borderColor: "#EF4444",
          },
        });
        return;
      }

      const updatedDeliveryPartner = { ...newDeliveryPartner };

      // Upload files and update URLs
      for (const [fieldName, file] of Object.entries(fileUploads)) {
        if (file) {
          const fileUrl = await uploadFile(file, fieldName);
          if (fileUrl) {
            updatedDeliveryPartner[fieldName] = fileUrl;
          }
        }
      }

      const requestData = {
        mobile: updatedDeliveryPartner.mobile,
        email: updatedDeliveryPartner.email,
        fullName: updatedDeliveryPartner.fullName,
        gender: updatedDeliveryPartner.gender,
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
        vehicleNumber: updatedDeliveryPartner.vehicleNumber,
        vehicleType: updatedDeliveryPartner.vehicleType,
        vehicleBrand: updatedDeliveryPartner.vehicleBrand,
        ownerName: updatedDeliveryPartner.ownerName,
        registrationDate: updatedDeliveryPartner.registrationDate,
        drivingLicenceNumber: updatedDeliveryPartner.drivingLicenceNumber,
        insuranceDoc: updatedDeliveryPartner.insuranceDoc,
        rcDoc: updatedDeliveryPartner.rcDoc,
        pucDoc: updatedDeliveryPartner.pucDoc,
        licenceImage: updatedDeliveryPartner.licenceImage,
        emergencyContactName: updatedDeliveryPartner.emergencyContactName,
        emergencyContactNumber: updatedDeliveryPartner.emergencyContactNumber,
        aadharNumber: updatedDeliveryPartner.aadharNumber,
        aadharImage: updatedDeliveryPartner.aadharImage,
        profileImage: updatedDeliveryPartner.profileImage,
        bankDetails: updatedDeliveryPartner.bankDetails,
        isVerify: true,
        workingHours: updatedDeliveryPartner.workingHours,
      };

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/delivery-partner`,
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
        gender: "male",
        vehicleNumber: "",
        vehicleType: "bike",
        vehicleBrand: "",
        ownerName: "",
        registrationDate: "",
        drivingLicenceNumber: "",
        insuranceDoc: null,
        rcDoc: null,
        pucDoc: null,
        licenceImage: null,
        emergencyContactName: "",
        emergencyContactNumber: "",
        aadharNumber: "",
        aadharImage: null,
        profileImage: null,
        bankDetails: {
          accountNumber: "",
          ifscCode: "",
          bankName: "",
          accountHolderName: "",
        },
        workingHours: {
          start: "09:00",
          end: "21:00",
        },
      });
      setFileUploads({
        insuranceDoc: null,
        rcDoc: null,
        pucDoc: null,
        licenceImage: null,
        aadharImage: null,
        profileImage: null,
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

      if (!validateRequiredFields()) {
        toast.error("Please fill in all required fields", {
          style: {
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            borderColor: "#EF4444",
          },
        });
        return;
      }

      const updatedDeliveryPartner = { ...newDeliveryPartner };

      // Upload files and update URLs
      for (const [fieldName, file] of Object.entries(fileUploads)) {
        if (file) {
          const fileUrl = await uploadFile(file, fieldName);
          if (fileUrl) {
            updatedDeliveryPartner[fieldName] = fileUrl;
          }
        }
      }

      const requestData = {
        mobile: updatedDeliveryPartner.mobile,
        email: updatedDeliveryPartner.email,
        fullName: updatedDeliveryPartner.fullName,
        gender: updatedDeliveryPartner.gender,
        vehicleNumber: updatedDeliveryPartner.vehicleNumber,
        vehicleType: updatedDeliveryPartner.vehicleType,
        vehicleBrand: updatedDeliveryPartner.vehicleBrand,
        ownerName: updatedDeliveryPartner.ownerName,
        registrationDate: updatedDeliveryPartner.registrationDate,
        drivingLicenceNumber: updatedDeliveryPartner.drivingLicenceNumber,
        insuranceDoc: updatedDeliveryPartner.insuranceDoc,
        rcDoc: updatedDeliveryPartner.rcDoc,
        pucDoc: updatedDeliveryPartner.pucDoc,
        licenceImage: updatedDeliveryPartner.licenceImage,
        emergencyContactName: updatedDeliveryPartner.emergencyContactName,
        emergencyContactNumber: updatedDeliveryPartner.emergencyContactNumber,
        aadharNumber: updatedDeliveryPartner.aadharNumber,
        aadharImage: updatedDeliveryPartner.aadharImage,
        profileImage: updatedDeliveryPartner.profileImage,
        bankDetails: updatedDeliveryPartner.bankDetails,
        workingHours: updatedDeliveryPartner.workingHours,
      };

      const config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/delivery-partner/${editPartner.original._id}`,
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
        gender: "male",
        vehicleNumber: "",
        vehicleType: "bike",
        vehicleBrand: "",
        ownerName: "",
        registrationDate: "",
        drivingLicenceNumber: "",
        insuranceDoc: null,
        rcDoc: null,
        pucDoc: null,
        licenceImage: null,
        emergencyContactName: "",
        emergencyContactNumber: "",
        aadharNumber: "",
        aadharImage: null,
        profileImage: null,
        bankDetails: {
          accountNumber: "",
          ifscCode: "",
          bankName: "",
          accountHolderName: "",
        },
        workingHours: {
          start: "09:00",
          end: "21:00",
        },
      });
      setFileUploads({
        insuranceDoc: null,
        rcDoc: null,
        pucDoc: null,
        licenceImage: null,
        aadharImage: null,
        profileImage: null,
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

  const renderFormFields = (prefix = "") => (
    <>
      <div>
        <label
          htmlFor={`${prefix}fullName`}
          className="block text-sm font-medium mb-1"
        >
          Full Name
        </label>
        <input
          id={`${prefix}fullName`}
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
          htmlFor={`${prefix}email`}
          className="block text-sm font-medium mb-1"
        >
          Email
        </label>
        <input
          id={`${prefix}email`}
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
          htmlFor={`${prefix}mobile`}
          className="block text-sm font-medium mb-1"
        >
          Mobile Number
        </label>
        <input
          id={`${prefix}mobile`}
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
          htmlFor={`${prefix}gender`}
          className="block text-sm font-medium mb-1"
        >
          Gender
        </label>
        <select
          id={`${prefix}gender`}
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
          htmlFor={`${prefix}vehicleNumber`}
          className="block text-sm font-medium mb-1"
        >
          Vehicle Number
        </label>
        <input
          id={`${prefix}vehicleNumber`}
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
          htmlFor={`${prefix}vehicleType`}
          className="block text-sm font-medium mb-1"
        >
          Vehicle Type
        </label>
        <select
          id={`${prefix}vehicleType`}
          required
          value={newDeliveryPartner.vehicleType}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              vehicleType: e.target.value,
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
        >
          <option value="bike">Bike</option>
          <option value="scooty">Scooty</option>
          <option value="car">Car</option>
        </select>
      </div>
      <div>
        <label
          htmlFor={`${prefix}vehicleBrand`}
          className="block text-sm font-medium mb-1"
        >
          Vehicle Brand
        </label>
        <input
          id={`${prefix}vehicleBrand`}
          required
          value={newDeliveryPartner.vehicleBrand}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              vehicleBrand: e.target.value,
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
          placeholder="Enter vehicle brand"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}ownerName`}
          className="block text-sm font-medium mb-1"
        >
          Owner Name
        </label>
        <input
          id={`${prefix}ownerName`}
          required
          value={newDeliveryPartner.ownerName}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              ownerName: e.target.value,
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
          placeholder="Enter owner name"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}registrationDate`}
          className="block text-sm font-medium mb-1"
        >
          Registration Date
        </label>
        <input
          id={`${prefix}registrationDate`}
          type="date"
          required
          value={newDeliveryPartner.registrationDate}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              registrationDate: e.target.value,
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}drivingLicenceNumber`}
          className="block text-sm font-medium mb-1"
        >
          Driving Licence Number
        </label>
        <input
          id={`${prefix}drivingLicenceNumber`}
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
      <div>
        <label
          htmlFor={`${prefix}insuranceDoc`}
          className="block text-sm font-medium mb-1"
        >
          Insurance Document
        </label>
        <input
          id={`${prefix}insuranceDoc`}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => handleFileChange(e, "insuranceDoc")}
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}rcDoc`}
          className="block text-sm font-medium mb-1"
        >
          RC Document
        </label>
        <input
          id={`${prefix}rcDoc`}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => handleFileChange(e, "rcDoc")}
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}pucDoc`}
          className="block text-sm font-medium mb-1"
        >
          PUC Document
        </label>
        <input
          id={`${prefix}pucDoc`}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => handleFileChange(e, "pucDoc")}
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}licenceImage`}
          className="block text-sm font-medium mb-1"
        >
          Licence Image
        </label>
        <input
          id={`${prefix}licenceImage`}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "licenceImage")}
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}emergencyContactName`}
          className="block text-sm font-medium mb-1"
        >
          Emergency Contact Name
        </label>
        <input
          id={`${prefix}emergencyContactName`}
          required
          value={newDeliveryPartner.emergencyContactName}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              emergencyContactName: e.target.value,
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
          placeholder="Enter emergency contact name"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}emergencyContactNumber`}
          className="block text-sm font-medium mb-1"
        >
          Emergency Contact Number
        </label>
        <input
          id={`${prefix}emergencyContactNumber`}
          required
          value={newDeliveryPartner.emergencyContactNumber}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              emergencyContactNumber: e.target.value,
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
          placeholder="Enter emergency contact number"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}aadharNumber`}
          className="block text-sm font-medium mb-1"
        >
          Aadhar Number
        </label>
        <input
          id={`${prefix}aadharNumber`}
          value={newDeliveryPartner.aadharNumber}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              aadharNumber: e.target.value,
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
          placeholder="Enter Aadhar number"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}aadharImage`}
          className="block text-sm font-medium mb-1"
        >
          Aadhar Image
        </label>
        <input
          id={`${prefix}aadharImage`}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "aadharImage")}
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}profileImage`}
          className="block text-sm font-medium mb-1"
        >
          Profile Image
        </label>
        <input
          id={`${prefix}profileImage`}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "profileImage")}
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}bankAccountNumber`}
          className="block text-sm font-medium mb-1"
        >
          Bank Account Number
        </label>
        <input
          id={`${prefix}bankAccountNumber`}
          required
          value={newDeliveryPartner.bankDetails.accountNumber}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              bankDetails: {
                ...newDeliveryPartner.bankDetails,
                accountNumber: e.target.value,
              },
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
          placeholder="Enter bank account number"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}bankIfscCode`}
          className="block text-sm font-medium mb-1"
        >
          IFSC Code
        </label>
        <input
          id={`${prefix}bankIfscCode`}
          required
          value={newDeliveryPartner.bankDetails.ifscCode}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              bankDetails: {
                ...newDeliveryPartner.bankDetails,
                ifscCode: e.target.value,
              },
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
          placeholder="Enter IFSC code"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}bankName`}
          className="block text-sm font-medium mb-1"
        >
          Bank Name
        </label>
        <input
          id={`${prefix}bankName`}
          required
          value={newDeliveryPartner.bankDetails.bankName}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              bankDetails: {
                ...newDeliveryPartner.bankDetails,
                bankName: e.target.value,
              },
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
          placeholder="Enter bank name"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}bankAccountHolderName`}
          className="block text-sm font-medium mb-1"
        >
          Bank Account Holder Name
        </label>
        <input
          id={`${prefix}bankAccountHolderName`}
          required
          value={newDeliveryPartner.bankDetails.accountHolderName}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              bankDetails: {
                ...newDeliveryPartner.bankDetails,
                accountHolderName: e.target.value,
              },
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
          placeholder="Enter account holder name"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}workingHoursStart`}
          className="block text-sm font-medium mb-1"
        >
          Working Hours Start
        </label>
        <input
          id={`${prefix}workingHoursStart`}
          type="time"
          required
          value={newDeliveryPartner.workingHours.start}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              workingHours: {
                ...newDeliveryPartner.workingHours,
                start: e.target.value,
              },
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor={`${prefix}workingHoursEnd`}
          className="block text-sm font-medium mb-1"
        >
          Working Hours End
        </label>
        <input
          id={`${prefix}workingHoursEnd`}
          type="time"
          required
          value={newDeliveryPartner.workingHours.end}
          onChange={(e) =>
            setNewDeliveryPartner({
              ...newDeliveryPartner,
              workingHours: {
                ...newDeliveryPartner.workingHours,
                end: e.target.value,
              },
            })
          }
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm placeholder:text-sm"
        />
      </div>
    </>
  );

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
                    {renderFormFields()}
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
                  {renderFormFields("edit")}
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