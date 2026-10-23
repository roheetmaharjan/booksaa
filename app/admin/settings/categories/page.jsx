"use client";
import { SettingsLayout } from "@/app/admin/layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ConfirmAlert from "@/components/common/ConfirmAlert";
import { TrashIcon, PencilLineIcon } from "@phosphor-icons/react";
import { ASSET_TYPES } from "@/constants/storage";

export default function Users() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: "",
    name: "",
    image: "",
  });
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [openAlert, setAlertOpen] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const refreshCategories = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, { cache: "no-store" });
    const categoryData = await response.json();
    if (!response.ok) {
      throw new Error(categoryData.error || "Failed to load categories.");
    }

    const storageKeys = categoryData
      .filter((category) => category.image?.startsWith("categories/"))
      .map((category) => category.image);
    let imageUrls = new Map();
    if (storageKeys.length > 0) {
      const imagesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ keys: storageKeys }),
      });
      const imagesData = await imagesResponse.json();
      if (!imagesResponse.ok) {
        throw new Error(imagesData.error || "Failed to load category images.");
      }
      imageUrls = new Map((imagesData.images || []).map((image) => [image.key, image.url]));
    }

    setCategories(categoryData.map((category) => ({
      ...category,
      imageUrl: category.image?.startsWith("categories/")
        ? imageUrls.get(category.image) || ""
        : category.image?.startsWith("http") || category.image?.startsWith("/")
          ? category.image
          : category.image
            ? `/uploads/${category.image}`
            : "",
    })));
  };

  const uploadCategoryImage = async (file) => {
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Image too large. Maximum size is 2MB.");
    }

    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        type: ASSET_TYPES.CATEGORY,
      }),
    });
    const uploadData = await uploadResponse.json();
    if (!uploadResponse.ok) {
      throw new Error(uploadData.error || "Failed to prepare category image upload.");
    }

    const storageResponse = await fetch(uploadData.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!storageResponse.ok) {
      throw new Error("Failed to upload category image.");
    }

    return uploadData.key;
  };

  useEffect(() => {
    refreshCategories()
      .catch((loadError) => {
        console.error("Error fetching categories:", loadError);
        toast.error(loadError.message || "Failed to load categories.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!newImage) {
        setError("Please select an image.");
        return;
      }

      if (!form.name.trim()) {
        setError("Category name is required.");
        return;
      }

      setIsSaving(true);
      const imageKey = await uploadCategoryImage(newImage);

      const categoryRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, image: imageKey }),
      });

      const categoryData = await categoryRes.json();
      if (!categoryRes.ok) {
        throw new Error(categoryData.error || "Category creation failed.");
      }

      setForm({ id: "", name: "", image: "" });
      setNewImage(null);
      setError("");
      setOpen(false);
      toast.success("Category has been created.");
      await refreshCategories();
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setAlertOpen(true);
  };
  const handleDelete = async (selectedCategoryId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${selectedCategoryId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Category deleted successfully");
        await refreshCategories();
      } else {
        toast.error(data.error || "failed to delete user");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occured");
    }
  };
  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setNewName(category?.name || "");
    setNewImage(null);
    setEditOpen(true);
  };
  const handleUpdate = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const categoryId = selectedCategory?.id;
    try {
      if (newImage && newImage.size > 2 * 1024 * 1024) {
        toast.error("Image too large. Maximum size is 2MB.");
        return;
      }
      setIsSaving(true);
      const image = newImage ? await uploadCategoryImage(newImage) : undefined;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), ...(image && { image }) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Category updated successfully");
        setEditOpen(false);
        setNewImage(null);
        await refreshCategories();
      } else {
        toast.error(data.error || "failed to update user");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update category.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsLayout>
      <div className="flex flex-row justify-between w-full">
        <h4 className="page-title">Categories</h4>
        <Button className="ml-auto" onClick={() => {
          setNewImage(null);
          setError("");
          setOpen(true);
        }}>
          Add Category
        </Button>
        <Dialog open={open} onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setNewImage(null);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="new-category-image">Image</Label>
                  <input type="file" name="image" id="new-category-image" accept="image/jpeg,image/png,image/webp" onChange={(e) => setNewImage(e.target.files?.[0] || null)} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Uploading..." : "Add"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={editOpen} onOpenChange={(nextOpen) => {
          setEditOpen(nextOpen);
          if (!nextOpen) setNewImage(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="edit-category-image">Image</Label>
                <input type="file" name="image" id="edit-category-image" accept="image/jpeg,image/png,image/webp" onChange={(e) => setNewImage(e.target.files?.[0] || null)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name" />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isSaving}>{isSaving ? "Uploading..." : "Update"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex">
        <div className="flex">
          <input type="search" className="bg-gray-50 border rounded focus:border-blue-500" placeholder="Search..." />
        </div>
      </div>
      <div className="table-responsive">
        <table className="w-full boo-table mt-3 border">
          <thead>
            <tr>
              <th className="text-sm w-16">S.N</th>
              <th className="text-left w-44 text-sm">Image</th>
              <th className="text-left w-1/3 text-sm">Name</th>
              <th className="text-left w-1/3 text-sm">Vendors</th>
              <th className="text-left text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" align="center" className="p-2">
                  Loading
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="4" align="center" className="p-2">
                  No any category found
                </td>
              </tr>
            ) : (
              categories.map((category, idx) => (
                <tr key={category.id} className="border-b">
                  <td className="p-2 text-base text-center">{idx + 1}</td>
                  <td className="P-2">
                    <figure className="w-16 h-16 bg-gray-300 border rounded-md flex overflow-hidden">
                      <img src={category.imageUrl} alt={category.name || "Category"} className="object-cover w-full h-full" />
                    </figure>
                  </td>
                  <td className="p-2 text-base">
                    <div className="font-bold">{category.name}</div>
                  </td>
                  <td>{category._count?.vendors || 0}</td>
                  <td>
                    <div className="flex gap-2">
                      <a href="#" className="text-gray-500" onClick={() => handleEditClick(category)}>
                        <PencilLineIcon size={20} weight="duotone" />
                      </a>
                      <a href="#" className="text-red-500" onClick={() => handleDeleteClick(category.id)}>
                        <TrashIcon size={20} weight="duotone" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmAlert
        open={openAlert}
        onOpenChange={setAlertOpen}
        title="Delete Category?"
        description={`Are you sure you want to delete category ${selectedCategoryId}`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          handleDelete(selectedCategoryId);
        }}
      />
    </SettingsLayout>
  );
}
