"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

const Drawer = ({ shouldScaleBackground = true, ...props }) => <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />;
const DrawerPortal = DrawerPrimitive.Portal;

const DrawerOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80", className)} {...props} />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content ref={ref} className={cn("fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background", className)} {...props}>
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = DrawerPrimitive.Content.displayName;

const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => <DrawerPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />);
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

export { Drawer, DrawerContent, DrawerTitle };
