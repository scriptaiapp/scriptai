"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "motion/react"
import { UploadCloud, X, FileText, Plus, Link2, Trash2, Image as ImageIcon } from "lucide-react"
import {formatFileSize} from "@/utils/toolsUtil";

interface FormStep3Props {
  references: string[]
  setReferences: (value: string[]) => void
  files: File[]
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
}



export default function FormStep3({ references, setReferences, files, setFiles }: FormStep3Props) {
  const [currentLink, setCurrentLink] = useState("")

  const addReference = () => {
    const trimmed = currentLink.trim()
    if (!trimmed) return
    try {
      new URL(trimmed)
    } catch {
      return // In a real app, you might want to show a toast error here for invalid URLs
    }
    if (!references.includes(trimmed)) {
      setReferences([...references, trimmed])
    }
    setCurrentLink("")
  }

  const removeReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addReference()
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.length) {
        setFiles(prev => [...prev, ...acceptedFiles])
      }
    },
    [setFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/*": [".jpeg", ".png", ".jpg"],
      "text/plain": [".txt"],
    },
  })

  const removeFile = (name: string) => {
    setFiles(current => current.filter(file => file.name !== name))
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-10"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Step 3: Add Sources</h2>
        <p className="text-sm font-medium text-slate-500">Provide reference material for the AI to analyze.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Link2 className="h-4 w-4 text-[#347AF9]" /> Web References
          </Label>
          <p className="text-xs font-medium text-slate-500 mt-1">Paste URLs to articles, blogs, or competitor videos.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 bg-slate-200/50 dark:bg-slate-800 rounded-md">
              <Link2 className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <Input
              value={currentLink}
              onChange={(e) => setCurrentLink(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com/article"
              className="h-12 pl-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-[#347AF9]/10 focus:border-[#347AF9] transition-all text-base"
            />
          </div>
          <Button
            type="button"
            onClick={addReference}
            disabled={!currentLink.trim()}
            className="h-12 px-6 bg-[#347AF9] hover:bg-blue-600 text-white font-bold rounded-xl border-b-[3px] border-blue-800 hover:border-b-0 hover:translate-y-[3px] active:border-b-0 active:translate-y-[3px] transition-all shrink-0 shadow-sm disabled:opacity-50 disabled:translate-y-0 disabled:border-b-0"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {references.length > 0 && (
          <ul className="space-y-2 mt-4">
            <AnimatePresence>
              {references.map((ref, index) => (
                <motion.li
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  key={index}
                  className="flex items-center justify-between p-3.5 border-2 border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm group hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-[#347AF9]/10 text-[#347AF9] rounded-lg shrink-0">
                      <Link2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate pr-4">{ref}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeReference(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#347AF9]" /> Upload Documents
          </Label>
          <p className="text-xs font-medium text-slate-500 mt-1">Supports PDF, DOCX, TXT, and images.</p>
        </div>

        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center w-full p-10 mt-2 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-200
            ${isDragActive
              ? "border-[#347AF9] bg-[#347AF9]/5 scale-[0.99]"
              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
        >
          <input {...getInputProps()} />
          <div className={`p-4 rounded-full mb-4 transition-colors ${isDragActive ? "bg-[#347AF9]/10" : "bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700"}`}>
            <UploadCloud className={`w-8 h-8 ${isDragActive ? "text-[#347AF9]" : "text-slate-400"}`} />
          </div>
          {isDragActive ? (
            <p className="font-bold text-[#347AF9]">Drop your files here...</p>
          ) : (
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Drag & drop files here
              </p>
              <p className="text-xs text-slate-500">
                or <span className="text-[#347AF9] hover:underline">click to browse</span> from your computer
              </p>
            </div>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3 pt-2">
          <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attached Files</Label>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {files.map(file => (
                <motion.li
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={file.name}
                  className="flex items-center justify-between p-3.5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm group hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0 border border-slate-100 dark:border-slate-700">
                      {file.type.includes('image') ? (
                        <ImageIcon className="w-5 h-5 text-[#347AF9]" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#347AF9]" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate leading-tight mb-0.5">{file.name}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(file.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </motion.div>
  )
}