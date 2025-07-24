"use client";
import { SettingsLayout } from "@/app/admin/layout";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Users() {
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
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
  const [newImage, setNewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error Fetching categories", error);
      } finally{
        setIsLoading(false)
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const imageFile = e.target.image.files[0];

      if (!imageFile) {
        setError("Please select an image.");
        return;
      }

      const formData = new FormData();
      formData.append("file", imageFile); // 🔑 use key "file"

      // 1. Upload the image
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadData.error || "Image upload failed");
        return;
      }

      // Creating category using image URL
      const categoryRes = await fetch("/api/categories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, image: uploadData.url }),
      });

      const categoryData = await categoryRes.json();
      if (!categoryRes.ok) {
        setError(categoryData.error || "Category creation failed");
        return;
      }

      // If its success reset form and refresh category list
      setForm({ id: "", name: "", image: "" });
      setImageUrl("");
      setError("");
      setOpen(false); //close the modal
      toast("Category has been created.");

      const updated = await fetch("/api/categories").then((res) => res.json());
      setCategories(updated);
    } catch (err) {
      console.error("Submit error:", err);
      setError("Something went wrong.");
    }
  };
  const handleDelete = async (categoryId) => {
    const confirmDelete = confirm(
      `"Are you sure you want to delete this user?" ${categoryId}`
    );
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert("Category deleted successfully");
      } else {
        alert(data.error || "failed to delete user");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occured");
    }
  };
  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setNewName(category?.name || "");
    setEditOpen(true);
  };
  const handleUpdate = async () => {
    // let base64Image = null;

    // if (newImage) {
    //   const buffer = await new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.readAsDataURL(newImage);
    //     reader.onload = () => resolve(reader.result);
    //     reader.onerror = (err) => reject(err);
    //   });
    //   base64Image = buffer;
    // }
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const formData = new FormData();
    formData.append("name", newName);
    if (newImage) {
      formData.append("image", newImage); // newImage should be a File object
    }
    const categoryId = selectedCategory?.id;
    // if (!newName.trim()) {
    //   toast.error("Name cannot be empty");
    //   return;
    // }

    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert("Category updated successfully");
        setEditOpen(false);
        const updated = await fetch("/api/categories").then((res) =>
          res.json()
        );
        setCategories(updated);
      } else {
        alert(data.error || "failed to update user");
      }
    } catch {
      console.error("Update error", error);
      alert("An error occured");
    }
  };

  return (
    <SettingsLayout>
      <div className="flex flex-row justify-between w-full">
        <h4 className="page-title">Categories</h4>
        <Button className="ml-auto" onClick={() => setOpen(true)}>
          Add Category
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="image">Image</Label>
                  <input type="file" name="image" id="image" accept="image/*" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="image">Image</Label>
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files[0])}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Category name"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex">
        <div className="flex">
          <input
            type="search"
            className="bg-gray-50 border rounded focus:border-blue-500"
            placeholder="Search..."
          />
        </div>
        <div className="flex"></div>
      </div>
      <div className="table-responsive">
        <table className="w-full boo-table mt-3 border">
          <thead>
            <tr>
              <th className="text-sm w-16">S.N</th>
              <th className="text-left w-56 text-sm">Image</th>
              <th className="text-left w-1/3 text-sm">Name</th>
              <th className="text-left w-1/3 text-sm">Vendor</th>
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
                    <img src={`/uploads/${category.image}`} alt="" />
                  </td>
                  <td className="p-2 text-base">
                    <div className="font-bold">{category.name}</div>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Button
                        className="py-0 bg-primary"
                        onClick={() => handleEditClick(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        className="py-0 bg-red-200 text-red-500 hover:bg-red-300"
                        onClick={() => handleDelete(category.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SettingsLayout>
  );
}
