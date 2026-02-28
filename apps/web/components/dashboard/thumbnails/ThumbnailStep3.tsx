"use client"

import { useRef, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "motion/react"
import { UploadCloud, X, Image as ImageIcon, User, Trash2 } from "lucide-react"
import {formatFileSize} from "@/utils/toolsUtil";

interface ThumbnailStep3Props {
  referenceImage: File | null
  setReferenceImage: (v: File | null) => void
  faceImage: File | null
  setFaceImage: (v: File | null) => void
}



export default function ThumbnailStep3({
  referenceImage,
  setReferenceImage,
  faceImage,
  setFaceImage,
}: ThumbnailStep3Props) {
  const faceInputRef = useRef<HTMLInputElement>(null)

  const onDropRef = useCallback(
    (accepted: File[]) => {
      const file = accepted[0]
      if (!file || file.size > 10 * 1024 * 1024) return
      setReferenceImage(file)
    },
    [setReferenceImage],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropRef,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
  })

  const handleFaceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || file.size > 10 * 1024 * 1024 || !file.type.startsWith("image/")) return
    setFaceImage(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-10"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Step 3: Add References</h2>
        <p className="text-sm font-medium text-slate-500">Optionally upload images to guide style and composition.</p>
      </div>

      {/* Reference Image Dropzone */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-brand-primary" /> Reference Image (Optional)
          </Label>
          <p className="text-xs font-medium text-slate-500 mt-1">Upload an image to guide the style, composition, or color palette.</p>
        </div>

        <AnimatePresence mode="wait">
          {referenceImage ? (
            <motion.div
              key="ref-file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-3.5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm group hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate leading-tight mb-0.5">
                    {referenceImage.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{formatFileSize(referenceImage.size)}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-8 h-8 shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setReferenceImage(null)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="ref-dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              {...getRootProps()}
              className={`flex flex-col items-center justify-center w-full p-10 mt-2 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-200
                ${isDragActive
                  ? "border-brand-primary bg-brand-primary/5 scale-[0.99]"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
            >
              <input {...getInputProps()} />
              <div className={`p-4 rounded-full mb-4 transition-colors ${isDragActive ? "bg-brand-primary/10" : "bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700"}`}>
                <UploadCloud className={`w-8 h-8 ${isDragActive ? "text-brand-primary" : "text-slate-400"}`} />
              </div>
              {isDragActive ? (
                <p className="font-bold text-brand-primary">Drop the image here...</p>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Drag & drop an image here
                  </p>
                  <p className="text-xs text-slate-500">
                    or <span className="text-brand-primary hover:underline">click to browse</span> from your computer
                  </p>
                </div>
              )}
              <p className="text-xs text-slate-400 mt-3">JPEG, PNG, WebP · Max 10MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

      {/* Face Image */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-brand-primary" /> Face / Person Photo (Optional)
          </Label>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Upload a photo of yourself or a person to include prominently in the thumbnail.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {faceImage ? (
            <motion.div
              key="face-file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-3.5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm group hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate leading-tight mb-0.5">
                    {faceImage.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{formatFileSize(faceImage.size)}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-8 h-8 shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setFaceImage(null)
                  if (faceInputRef.current) faceInputRef.current.value = ""
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div key="face-upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full justify-start gap-3 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:border-brand-primary/50 text-slate-600 dark:text-slate-300 transition-all"
                onClick={() => faceInputRef.current?.click()}
              >
                <UploadCloud className="h-4 w-4 text-brand-primary" />
                Upload face or person photo
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={faceInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFaceSelect}
        />
      </div>
    </motion.div>
  )
}
