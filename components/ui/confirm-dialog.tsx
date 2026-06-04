"use client"

import * as React from "react"

import Loader from "@/components/loader/Loader"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const dialogButtonClass =
  "inline-flex h-9 min-w-24 items-center justify-center rounded px-4 text-sm font-semibold leading-none disabled:cursor-not-allowed disabled:opacity-60"

type ConfirmDialogProps = {
  message: string
  cancelLabel: string
  confirmLabel: string
  loadingText: string
  onConfirm: () => void
  pending?: boolean
  children: React.ReactElement
}

export function ConfirmDialog({
  message,
  cancelLabel,
  confirmLabel,
  loadingText,
  onConfirm,
  pending = false,
  children,
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false)

  const handleConfirm = () => {
    onConfirm()
  }

  const handleOpenChange = (next: boolean) => {
    if (pending) return
    setOpen(next)
  }

  return (
    <>
      {pending ? <Loader variant="overlay" text={loadingText} /> : null}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="gap-6 py-8">
        <DialogHeader className="sm:text-center">
          <DialogTitle className="sr-only">{confirmLabel}</DialogTitle>
          <DialogDescription className="text-center text-base font-medium leading-relaxed text-foreground sm:text-lg">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-center">
          <button
            type="button"
            disabled={pending}
            onClick={() => setOpen(false)}
            className={`${dialogButtonClass} bg-white border border-red-600 text-red-600 hover:bg-slate-50`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={handleConfirm}
            className={`${dialogButtonClass} bg-red-600 text-white hover:bg-red-700`}
          >
            {confirmLabel}
          </button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
