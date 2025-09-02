"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { UploadCloud, X, File as FileIcon } from "lucide-react"

interface FormStep3Props {
    references: string
    setReferences: (value: string) => void
    files: File[]
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
}

const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export default function FormStep3({
    references,
    setReferences,
    files,
    setFiles,
}: FormStep3Props) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles?.length) {
                setFiles(previousFiles => [...previousFiles, ...acceptedFiles])
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
        setFiles(currentFiles => currentFiles.filter(file => file.name !== name))
    }

    return (
        <div className="space-y-8">
            <h3 className="text-xl font-semibold">
                Step 3: Add sources and generate.
            </h3>

            <div className="space-y-2">
                <Label htmlFor="references">References (Optional)</Label>
                <Textarea
                    id="references"
                    value={references}
                    onChange={e => setReferences(e.target.value)}
                    placeholder="Paste URLs or sources..."
                    className="min-h-[150px] focus-visible:ring-purple-500"
                />
            </div>

            <div className="space-y-2">
                <Label>Or upload files</Label>
                <p className="text-sm text-muted-foreground">
                    Supports PDF, DOCX, TXT, and image files.
                </p>
                <div
                    {...getRootProps()}
                    className={`flex flex-col items-center justify-center w-full p-8 mt-2 border-2 border-dashed rounded-lg cursor-pointer
                    border-input bg-background hover:bg-muted transition-colors
                    ${isDragActive ? "border-primary" : ""}`}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                    {isDragActive ? (
                        <p>Drop the files here ...</p>
                    ) : (
                        <p className="text-center">
                            Drag & drop files here, or{" "}
                            <span className="font-semibold text-primary">click to browse</span>
                        </p>
                    )}
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-3">
                    <Label>Uploaded Files</Label>
                    <ul className="space-y-2">
                        {files.map(file => (
                            <li
                                key={file.name}
                                className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                            >
                                <div className="flex items-center gap-3">
                                    <FileIcon className="w-5 h-5 text-muted-foreground" />
                                    <span className="text-sm font-medium truncate max-w-xs">
                                        {file.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">
                                        {formatFileSize(file.size)}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6"
                                        onClick={() => removeFile(file.name)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}