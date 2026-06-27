"use client";

import { UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FileUpload({ accept = "image/*", multiple = false, maxFiles = 1, disabled = false, label = "Choose files", description = "PNG, JPG, WEBP, or GIF up to 5MB.", resetKey, onFilesChange }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);

  const updateFiles = (nextFiles) => {
    const normalized = multiple ? nextFiles.slice(0, maxFiles) : nextFiles.slice(0, 1);
    setFiles(normalized);
    onFilesChange?.(normalized);
  };

  const handleChange = (event) => {
    updateFiles(Array.from(event.target.files || []));
  };

  const clearFiles = () => {
    if (inputRef.current) inputRef.current.value = "";
    updateFiles([]);
  };

  useEffect(() => {
    if (resetKey === undefined) return;
    clearFiles();
  }, [resetKey]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-input bg-background px-4 py-6 text-center transition hover:bg-muted/50",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-muted">
          <UploadCloud className="size-5 text-muted-foreground" />
        </span>
        <span className="space-y-1">
          <span className="block text-sm font-semibold text-foreground">{label}</span>
          <span className="block text-xs text-muted-foreground">{description}</span>
        </span>
      </button>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} disabled={disabled} onChange={handleChange} className="sr-only" />
      {files.length > 0 && (
        <div className="rounded-md border bg-background p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={clearFiles} disabled={disabled}>
              <X className="size-4" />
            </Button>
          </div>
          <div className="mt-2 space-y-1">
            {files.map((file) => (
              <p key={`${file.name}-${file.size}`} className="truncate text-xs text-muted-foreground">
                {file.name}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
