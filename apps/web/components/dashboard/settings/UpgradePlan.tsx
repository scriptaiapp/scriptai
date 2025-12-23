// components/Modal.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"

export default function UpgradePlan() {
  return (
    <Dialog>
      <DialogTrigger asChild>
          <Button variant="outline">Upgrade Plan</Button>
      </DialogTrigger>

      <DialogPortal>
        {/*OverlayDialogOverlay */}
        <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Content */}
        <DialogContent
          className="
            fixed top-1/2 left-1/2 
            w-[90vw] max-w-md 
            -translate-x-1/2 -translate-y-1/2 
            bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg
          "
        >
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-lg font-semibold">Select Plan</DialogTitle>
            {/* <DialogClose asChild>
              <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </DialogClose> */}
          </div>

          <DialogDescription className="text-gray-600 dark:text-gray-400 mb-6">
            This is an example modal built using Radix UI Dialog.
          </DialogDescription>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700">
                Cancel
              </button>
            </DialogClose>
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
              Confirm
            </button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
