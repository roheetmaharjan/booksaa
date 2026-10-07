"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { ImageIcon, Trash2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

import "glightbox/dist/css/glightbox.css";

export default function GalleryGrid({ photos = [], dateFilter }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteKey, setDeleteKey] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const lightboxRef = useRef(null);

  // Photos are already loaded by the parent.
  useEffect(() => {
    setLoading(true);

    if (!Array.isArray(photos)) {
      setImages([]);
      setLoading(false);
      return;
    }

    setImages(photos);
    setLoading(false);
  }, [photos]);

  const filteredImages = images.filter((image) => {
    if (!image?.url) {
      return false;
    }

    if (dateFilter === "all") {
      return true;
    }

    if (!image?.lastModified) {
      return false;
    }

    const imageDate = new Date(image.lastModified);

    if (Number.isNaN(imageDate.getTime())) {
      return false;
    }

    const now = new Date();

    if (dateFilter === "today") {
      return imageDate.getFullYear() === now.getFullYear() && imageDate.getMonth() === now.getMonth() && imageDate.getDate() === now.getDate();
    }

    if (dateFilter === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);

      const day = startOfWeek.getDay();
      const diff = day === 0 ? 6 : day - 1;

      startOfWeek.setDate(startOfWeek.getDate() - diff);

      return imageDate >= startOfWeek;
    }

    if (dateFilter === "month") {
      return imageDate.getFullYear() === now.getFullYear() && imageDate.getMonth() === now.getMonth();
    }

    return true;
  });

  useEffect(() => {
    if (!images.length) return;

    let mounted = true;

    const initLightbox = async () => {
      const { default: GLightbox } = await import("glightbox");

      if (!mounted) return;

      lightboxRef.current?.destroy();

      lightboxRef.current = GLightbox({
        selector: ".booksaa-gallery",
        touchNavigation: true,
        loop: true,
        zoomable: true,
      });
    };

    initLightbox();

    return () => {
      mounted = false;
      lightboxRef.current?.destroy();
      lightboxRef.current = null;
    };
  }, [images]);

  const handleDelete = async (key) => {
    if (!key) return;

    try {
      setDeleting(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete photo");
      }

      setImages((prev) => prev.filter((image) => image.key !== key));

      toast.success("Photo deleted successfully.");
      setDeleteKey(null);
    } catch (error) {
      console.error("Delete photo error:", error);
      toast.error(error.message || "Failed to delete photo.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!images.length) {
    return (
      <Empty className="min-h-40 gap-2">
        <EmptyMedia variant="icon">
          <ImageIcon />
        </EmptyMedia>

        <EmptyTitle>No photos</EmptyTitle>

        <EmptyDescription>No photos have been added yet.</EmptyDescription>
      </Empty>
    );
  }

  if (!filteredImages.length) {
    return (
      <Empty className="min-h-40 gap-2">
        <EmptyMedia variant="icon">
          <ImageIcon />
        </EmptyMedia>

        <EmptyTitle>No photos found</EmptyTitle>

        <EmptyDescription>There are no photos for the selected date.</EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {filteredImages.map((image) => (
        <div key={image.key} className="group relative aspect-square overflow-hidden rounded-lg border">
          <a href={image.url} className="booksaa-gallery block h-full w-full" data-gallery="booksaa-gallery">
            <Image src={image.url || "asd.svg"} alt="Gallery photo" fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" />
          </a>

          <AlertDialog
            open={deleteKey === image.key}
            onOpenChange={(open) => {
              if (!open && !deleting) {
                setDeleteKey(null);
              }
            }}
          >
            <AlertDialogTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteKey(image.key);
                }}
                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                aria-label="Delete photo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this photo?</AlertDialogTitle>

                <AlertDialogDescription>This action cannot be undone. The photo will be permanently removed from your gallery.</AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

                <AlertDialogAction onClick={() => handleDelete(deleteKey)} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}
