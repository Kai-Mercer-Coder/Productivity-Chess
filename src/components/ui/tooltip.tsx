"use client"

import * as React from "react"
import {
  TooltipProvider,
  Tooltip as TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow,
} from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils/cn"

function TooltipProviderWrapper({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipProvider>) {
  return (
    <TooltipProvider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipRoot>) {
  return <TooltipRoot data-slot="tooltip" {...props} />
}

function TooltipTriggerWrapper({
  ...props
}: React.ComponentProps<typeof TooltipTrigger>) {
  return <TooltipTrigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContentWrapper({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipContent>) {
  return (
    <TooltipPortal>
      <TooltipContent
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
          className
        )}
        {...props}
      >
        {children}
        <TooltipArrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
      </TooltipContent>
    </TooltipPortal>
  )
}

export {
  TooltipProviderWrapper as TooltipProvider,
  Tooltip,
  TooltipTriggerWrapper as TooltipTrigger,
  TooltipContentWrapper as TooltipContent,
}
