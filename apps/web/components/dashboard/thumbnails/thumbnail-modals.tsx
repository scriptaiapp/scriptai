"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, Download, UploadCloud, X, Image as ImageIcon, User } from "lucide-react"
import { toast } from "sonner"
import { api, getApiErrorMessage } from "@/lib/api-client"
import { deleteThumbnail, type ThumbnailJob } from "@/lib/api/getThumbnails"
import type { ThumbnailRatio } from "@/hooks/useThumbnailGeneration"
import { downloadFile } from "@/lib/download"

const BTN_PRIMARY = "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"

const RATIO_OPTIONS: { value: ThumbnailRatio; label: string; desc: string }[] = [
    { value: "16:9", label: "16:9", desc: "YouTube" },
    { value: "9:16", label: "9:16", desc: "Shorts" },
    { value: "1:1", label: "1:1", desc: "Square" },
    { value: "4:3", label: "4:3", desc: "Classic" },
]

interface ModalProps {
    open: boolean
    onClose: () => void
}

// ─── View Image ───

interface ViewImageModalProps extends ModalProps {
    imageUrl: string
    imageIndex: number
}

export function ViewImageModal({ open, onClose, imageUrl, imageIndex }: ViewImageModalProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-3xl w-1/3 p-2 sm:p-4">
                <DialogHeader className="px-2 pt-2">
                    <DialogTitle>Thumbnail #{imageIndex + 1}</DialogTitle>
                </DialogHeader>
                <img
                    src={imageUrl}
                    alt={`Thumbnail ${imageIndex + 1}`}
                    className="w-full rounded-lg"
                />
                <DialogFooter className="px-2 pb-2">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button
                        className={BTN_PRIMARY}
                        onClick={() => downloadFile(imageUrl, `thumbnail_${imageIndex + 1}.png`)}
                    >
                        <Download className="mr-2 h-4 w-4" />Download
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Edit & Regenerate single thumbnail with all inputs ───

interface EditThumbnailModalProps extends ModalProps {
    job: ThumbnailJob
    imageIndex: number
}

export function EditThumbnailModal({ open, onClose, job, imageIndex }: EditThumbnailModalProps) {
    const router = useRouter()
    const [prompt, setPrompt] = useState(job.prompt)
    const [ratio, setRatio] = useState<ThumbnailRatio>(job.ratio)
    const [videoLink, setVideoLink] = useState(job.video_link ?? "")
    const [referenceImage, setReferenceImage] = useState<File | null>(null)
    const [faceImage, setFaceImage] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const faceInputRef = useRef<HTMLInputElement>(null)

    const onDropRef = useCallback(
        (accepted: File[]) => {
            const file = accepted[0]
            if (!file || file.size > 10 * 1024 * 1024) return
            setReferenceImage(file)
        },
        [],
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

    const handleSubmit = async () => {
        if (!prompt.trim() || prompt.trim().length < 3) {
            toast.error("Prompt must be at least 3 characters")
            return
        }
        setLoading(true)
        try {
            const fd = new FormData()
            fd.append("prompt", prompt.trim())
            fd.append("ratio", ratio)
            fd.append("generateCount", "1")
            fd.append("personalized", "false")
            if (videoLink.trim()) fd.append("videoLink", videoLink.trim())
            if (referenceImage) fd.append("referenceImage", referenceImage)
            if (faceImage) fd.append("faceImage", faceImage)

            const res = await api.upload<{ id: string }>("/api/v1/thumbnail/generate", fd, { requireAuth: true })
            toast.success("Thumbnail generation started!")
            onClose()
            router.push(`/dashboard/thumbnails/${res.id}`)
        } catch (error) {
            toast.error("Failed to start generation", { description: getApiErrorMessage(error) })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit & Regenerate Thumbnail #{imageIndex + 1}</DialogTitle>
                    <DialogDescription>
                        Modify the inputs below. This will generate a single new thumbnail.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="edit-prompt">Prompt</Label>
                        <Textarea
                            id="edit-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="min-h-[100px] focus-visible:ring-purple-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Aspect Ratio</Label>
                        <div className="flex flex-wrap gap-2">
                            {RATIO_OPTIONS.map((opt) => (
                                <Button
                                    key={opt.value}
                                    variant={ratio === opt.value ? "default" : "outline"}
                                    size="sm"
                                    className={ratio === opt.value ? BTN_PRIMARY : ""}
                                    onClick={() => setRatio(opt.value)}
                                >
                                    {opt.label}
                                    <span className="ml-1 text-xs opacity-70">{opt.desc}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-video">Video Link (optional)</Label>
                        <Input
                            id="edit-video"
                            value={videoLink}
                            onChange={(e) => setVideoLink(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Reference Image (optional)</Label>
                        {referenceImage ? (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3 min-w-0">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                                    <span className="text-sm font-medium truncate">{referenceImage.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="w-6 h-6 shrink-0" onClick={() => setReferenceImage(null)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                {...getRootProps()}
                                className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer border-input bg-background hover:bg-muted transition-colors ${isDragActive ? "border-primary" : ""}`}
                            >
                                <input {...getInputProps()} />
                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="text-sm text-center">
                                    Drop image or <span className="font-semibold text-primary">browse</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP · Max 10MB</p>
                            </div>
                        )}
                        {job.reference_image_url && !referenceImage && (
                            <p className="text-xs text-muted-foreground">
                                Original reference image will not carry over. Upload a new one if needed.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            Face / Person Photo (optional)
                        </Label>
                        {faceImage ? (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3 min-w-0">
                                    <User className="w-5 h-5 text-muted-foreground shrink-0" />
                                    <span className="text-sm font-medium truncate">{faceImage.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="w-6 h-6 shrink-0" onClick={() => { setFaceImage(null); if (faceInputRef.current) faceInputRef.current.value = "" }}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2"
                                onClick={() => faceInputRef.current?.click()}
                            >
                                <UploadCloud className="h-4 w-4" />
                                Upload face or person photo
                            </Button>
                        )}
                        <input ref={faceInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFaceSelect} />
                        {job.face_image_url && !faceImage && (
                            <p className="text-xs text-muted-foreground">
                                Original face image will not carry over. Upload a new one if needed.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button className={BTN_PRIMARY} onClick={handleSubmit} disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : "Generate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Delete single image from batch ───

interface DeleteImageModalProps extends ModalProps {
    imageUrl: string
    imageIndex: number
    onConfirm: () => void
}

export function DeleteImageModal({ open, onClose, imageUrl, imageIndex, onConfirm }: DeleteImageModalProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Thumbnail</DialogTitle>
                    <DialogDescription>
                        Remove thumbnail #{imageIndex + 1} from this batch? This removes it from your view.
                    </DialogDescription>
                </DialogHeader>
                <img src={imageUrl} alt={`Thumbnail ${imageIndex + 1}`} className="w-full rounded-lg border" />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={() => { onConfirm(); onClose() }}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Regenerate with same inputs ───

interface RegenerateThumbnailModalProps extends ModalProps {
    job: ThumbnailJob
}

export function RegenerateThumbnailModal({ open, onClose, job }: RegenerateThumbnailModalProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleRegenerate = async () => {
        setLoading(true)
        try {
            const fd = new FormData()
            fd.append("prompt", job.prompt)
            fd.append("ratio", job.ratio)
            fd.append("generateCount", String(job.generate_count))
            fd.append("personalized", "false")
            if (job.video_link) fd.append("videoLink", job.video_link)

            const res = await api.upload<{ id: string }>("/api/v1/thumbnail/generate", fd, { requireAuth: true })
            toast.success("Regeneration started!")
            onClose()
            router.push(`/dashboard/thumbnails/${res.id}`)
        } catch (error) {
            toast.error("Failed to regenerate", { description: getApiErrorMessage(error) })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Regenerate Thumbnails</DialogTitle>
                    <DialogDescription>
                        Create a new batch using the same inputs. Credits will be consumed.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-1 text-sm text-muted-foreground py-2">
                    <p><strong className="text-foreground">Prompt:</strong> {job.prompt}</p>
                    <p><strong className="text-foreground">Ratio:</strong> {job.ratio}</p>
                    <p><strong className="text-foreground">Count:</strong> {job.generate_count}</p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button className={BTN_PRIMARY} onClick={handleRegenerate} disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Regenerating...</> : "Regenerate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Delete entire batch / job ───

interface DeleteBatchModalProps extends ModalProps {
    jobId: string
    imageCount: number
    onSuccess: () => void
}

export function DeleteBatchModal({ open, onClose, jobId, imageCount, onSuccess }: DeleteBatchModalProps) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        const ok = await deleteThumbnail(jobId)
        if (ok) {
            toast.success("Batch deleted!")
            onClose()
            onSuccess()
        } else {
            toast.error("Failed to delete batch")
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Entire Batch</DialogTitle>
                    <DialogDescription>
                        Permanently delete this job and all {imageCount} generated thumbnail{imageCount !== 1 ? "s" : ""}. This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete All"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
