"use client";

import { useState, useRef, DragEvent, useEffect } from "react"; // ✅ Import useEffect
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
    avatar: File | null;
    setAvatar: (file: File | null) => void;
    initialAvatar: string | null;
    setInitialAvatar: (initialAvatar: string | null) => void;
    disabled?: boolean;
}

export function ImageDropzone({
    avatar,
    setAvatar,
    initialAvatar,
    setInitialAvatar,
    disabled,
}: ImageDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!avatar) {
            setPreviewUrl(null);
            return;
        }

        // Create a new object URL when the avatar file changes
        const objectUrl = URL.createObjectURL(avatar);
        setPreviewUrl(objectUrl);

        // Cleanup function to revoke the object URL when the component unmounts or avatar changes
        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [avatar]);

    // Prefer initialAvatar, then the stable previewUrl
    const imageSource = initialAvatar || previewUrl;

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file?.type.startsWith("image/")) {
                setAvatar(file);
                setInitialAvatar(null);
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setAvatar(files[0] ?? null);
            setInitialAvatar(null);
        }
        e.target.value = "";
    };

    const triggerFileSelect = () => {
        if (!disabled) fileInputRef.current?.click();
    };

    const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setAvatar(null);
        setInitialAvatar(null);
    };

    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium">Avatar</label>
            <div
                onClick={triggerFileSelect}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn(
                    "relative flex items-center justify-center w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-border transition-colors duration-200 ease-out",
                    disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                    isDragging && "ring-4 ring-primary/40 bg-primary/5"
                )}
            >
                {imageSource ? (
                    <>
                        <img
                            src={imageSource}
                            alt="Avatar Preview"
                            className="object-cover w-full h-full transition-transform duration-300 ease-out hover:scale-105"
                        />
                        {!disabled && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveImage}
                                className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-background/60 backdrop-blur-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4 text-muted-foreground gap-2">
                        <div className="rounded-full bg-muted p-3 shadow-inner">
                            <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium leading-tight">
                            Drop image or click to upload
                        </span>
                    </div>
                )}

                {isDragging && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                        <span className="text-primary font-medium text-sm">Drop here</span>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={disabled}
                    className="hidden"
                />
            </div>
        </div>
    );
}