"use client";
import { SettingsLayout } from "./../layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Failed to fetch users:", error));
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
      toast("Category has been created.")

      const updated = await fetch("/api/categories").then((res) => res.json());
      setCategories(updated);
    } catch (err) {
      console.error("Submit error:", err);
      setError("Something went wrong.");
    }
  };

  return (
    <SettingsLayout>
      <div className="container-fluid">
        <div className="flex flex-row justify-between w-full">
          <h4 className="page-title">Categories</h4>
          <Button className="ml-auto" onClick={() => setOpen(true)}>Add Category</Button>
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
                    <input
                      type="file"
                      name="image"
                      id="image"
                      accept="image/*"
                    />
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
                <th className="text-left text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4">Loading...</td>
                </tr>
              ) : (
                categories.map((category, idx) => (
                  <tr key={category.id} className="border-b">
                    <td className="p-2 text-base text-center">{idx + 1}</td>
                    <td className="P-2">
                      {/* <Image
                        src={`${category.image}`}
                        width="60"
                        height="60"
                        alt={category.name}
                      /> */}
                    </td>
                    <td className="p-2 text-base">
                      <div className="font-bold">{category.name}</div>
                    </td>
                    <td>
                      <Button className="p-2 bg-primary">Edit</Button>
                      <Button className="p-2 bg-red-300 text-red-500">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SettingsLayout>
  );
}
