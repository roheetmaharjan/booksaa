"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Upload as UploadIcon, X } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PhotoUpload({ onUploadComplete }) {
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addFiles = (selectedFiles) => {
    const images = Array.from(selectedFiles).filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));

    if (!images.length) {
      toast.error("Please select JPG, PNG or WebP images.");
      return;
    }

    const newFiles = images.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles((current) => [...current, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles((current) => {
      const item = current.find((file) => file.id === id);

      if (item) {
        URL.revokeObjectURL(item.preview);
      }

      return current.filter((file) => file.id !== id);
    });
  };

  const handleUpload = async () => {
    if (!files.length) {
      toast.error("Please select at least one image.");
      return;
    }

    setUploading(true);

    try {
      for (const item of files) {
        // 1. Get presigned upload URL
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fileName: item.file.name,
            contentType: item.file.type,
            type: "gallery",
          }),
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "Failed to prepare upload.");
        }

        // 2. Upload image directly to Neon Storage
        const storageResponse = await fetch(uploadData.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": item.file.type,
          },
          body: item.file,
        });

        if (!storageResponse.ok) {
          throw new Error(`Failed to upload ${item.file.name}.`);
        }

        // 3. Save storage key to Vendors.photos
        const completeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            key: uploadData.key,
            type: "gallery",
          }),
        });

        const completeData = await completeResponse.json();

        if (!completeResponse.ok) {
          throw new Error(completeData.error || `Failed to save ${item.file.name}.`);
        }
      }

      toast.success(`${files.length} ${files.length === 1 ? "photo" : "photos"} uploaded successfully.`);

      files.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });

      setFiles([]);
      setOpen(false);
      await onUploadComplete?.();
    } catch (error) {
      console.error("Gallery upload error:", error);

      toast.error(error.message || "Failed to upload photos.");
    } finally {
      setUploading(false);
    }
  };

  const handleDialogChange = (value) => {
    if (uploading) return;

    setOpen(value);

    if (!value) {
      files.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });

      setFiles([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button>
          <UploadIcon className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload photos</DialogTitle>

          <DialogDescription>Add photos to your gallery. You can upload multiple images at once.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            className={["flex min-h-44 cursor-pointer flex-col items-center", "justify-center rounded-lg border border-dashed", "p-6 text-center transition-colors", dragging ? "border-primary bg-muted" : "hover:bg-muted/50"].join(" ")}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="text-sm font-medium">Drag and drop your images here</p>

            <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>

            <p className="mt-3 text-xs text-muted-foreground">JPG, PNG or WebP</p>

            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>

          {/* Preview */}
          {files.length > 0 && (
            <div className="grid max-h-52 grid-cols-4 gap-2 overflow-y-auto">
              {files.map((item) => (
                <div key={item.id} className="group relative aspect-square overflow-hidden rounded-md border">
                  <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />

                  <button type="button" disabled={uploading} onClick={() => removeFile(item.id)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">{files.length > 0 ? `${files.length} ${files.length === 1 ? "photo" : "photos"} selected` : "No photos selected"}</p>

            <Button type="button" disabled={!files.length || uploading} onClick={handleUpload}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
