"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newName, setNewName] = useState("");
  const [newCatType, setNewCatType] = useState("medicine");
  const [newIcon, setNewIcon] = useState(null);
  const [editNewIcon, setEditNewIcon] = useState(null); // New state for edit icon
  const [filter, setFilter] = useState("medicine");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const config = {
          method: "get",
          maxBodyLength: Infinity,
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}categorys?catType=${filter}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        };

        const response = await axios.request(config);
        setCategories(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load categories");
        setLoading(false);
      }
    };

    fetchCategories();
  }, [filter]);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setNewName(category.name);
    setNewCatType(category.catType);
    setEditNewIcon(null); // Reset edit icon when opening edit dialog
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      let iconUrl = selectedCategory.icon; // Default to existing icon URL

      if (editNewIcon) {
        const formData = new FormData();
        formData.append("file", editNewIcon);

        const uploadConfig = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}media`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
          data: formData,
        };

        iconUrl = uploadResponse.data.fileUrl;
      }

      const config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}category/${selectedCategory._id}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        data: { name: newName, catType: newCatType, icon: iconUrl },
      };

      const response = await axios.request(config);
      setCategories(
        categories.map((cat) =>
          cat._id === selectedCategory._id
            ? { ...cat, name: newName, catType: newCatType, icon: iconUrl }
            : cat
        )
      );
      setEditDialogOpen(false);
      setEditNewIcon(null); // Reset edit icon after saving
      toast.success("Category updated successfully", {
        style: {
          backgroundColor: "#DCFCE7",
          color: "#166534",
          borderColor: "#16A34A",
        },
      });
    } catch (err) {
      toast.error("Failed to update category", {
        style: {
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          borderColor: "#EF4444",
        },
      });
    }
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const config = {
        method: "delete",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}category/${selectedCategory._id}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      };

      await axios.request(config);
      setCategories(
        categories.filter((cat) => cat._id !== selectedCategory._id)
      );
      setDeleteDialogOpen(false);
      toast.success("Category deleted successfully", {
        style: {
          backgroundColor: "#DCFCE7",
          color: "#166534",
          borderColor: "#16A34A",
        },
      });
    } catch (err) {
      toast.error("Failed to delete category", {
        style: {
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          borderColor: "#EF4444",
        },
      });
    }
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewIcon(file);
    }
  };

  const handleEditIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditNewIcon(file);
    }
  };

  const handleAddCategory = async () => {
    try {
      let iconUrl = null;

      if (newIcon) {
        const formData = new FormData();
        formData.append("file", newIcon);

        const uploadConfig = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}media`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
          data: formData,
        };

        iconUrl = uploadResponse.data.fileUrl;
      }

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}category`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        data: {
          name: newName,
          icon: iconUrl,
          catType: newCatType,
        },
      };

      const response = await axios.request(config);
      const newCategory = {
        ...response.data.data,
        name: newName,
        icon: iconUrl,
      };
      setCategories([...categories, newCategory]);
      setAddDialogOpen(false);
      setNewName("");
      setNewCatType("medicine");
      setNewIcon(null);
      toast.success("Category added successfully", {
        style: {
          backgroundColor: "#DCFCE7",
          color: "#166534",
          borderColor: "#16A34A",
        },
      });
    } catch (err) {
      console.error(
        "Error adding category:",
        err.response?.data || err.message
      );
      toast.error("Failed to add category", {
        style: {
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          borderColor: "#EF4444",
        },
      });
    }
  };

  const filteredCategories = categories;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-start w-full min-h-0">
          <div className="w-full max-w-6xl flex flex-col gap-0 mt-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Categories</h1>
                <p className="text-muted-foreground">
                  Manage your categories and their details.
                </p>
              </div>
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => setAddDialogOpen(true)}
              >
                Add Categories
              </Button>
            </div>
            <div className="flex space-x-2 mb-4">
              <Button
                variant={filter === "medicine" ? "default" : "outline"}
                onClick={() => setFilter("medicine")}
              >
                Medicine
              </Button>
              <Button
                variant={filter === "store" ? "default" : "outline"}
                onClick={() => setFilter("store")}
              >
                Store
              </Button>
            </div>
            {loading && <p>Loading categories...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && filteredCategories.length === 0 && (
              <p>No categories found.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 mt-10 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCategories.map((category) => (
                <div
                  key={category._id || Math.random().toString(36).substr(2, 9)}
                  className="border rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                      >
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(category)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="w-16 h-16 relative">
                    <Image
                      src={
                        category.icon ||
                        "https://medmedone.s3.ap-south-1.amazonaws.com/med1-media/1745125211810_medicine__2__1.svg"
                      }
                      alt={
                        category.name
                          ? `${category.name} category icon`
                          : "Default category icon"
                      }
                      fill
                      sizes="64px"
                      loading="lazy"
                      style={{ objectFit: "contain" }}
                      className="mb-2"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-center">
                    {category.name || "Unnamed Category"}
                  </h2>
                  <p className="text-sm text-gray-500 capitalize">
                    {category.catType}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-2xl font-bold">
              Edit Category
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Update the category details below.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Category Name"
              />
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="medicine">Medicine</option>
                <option value="store">Store</option>
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={handleEditIconChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex justify-end px-6 pb-6 gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSaveEdit}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-2xl font-bold">
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to delete this category?
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6"></div>
          <div className="flex justify-end px-6 pb-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="default" onClick={handleConfirmDelete}>
              Yes, Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-2xl font-bold">
              Add Category
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Enter the category details below.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Category Name"
              />
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="medicine">Medicine</option>
                <option value="store">Store</option>
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex justify-end px-6 pb-6 gap-2">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleAddCategory}>
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
