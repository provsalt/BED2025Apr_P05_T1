import * as React from "react";
import {
    DropdownMenu as HeadlessDropdownMenu,
    DropdownMenuTrigger as HeadlessDropdownMenuTrigger,
    DropdownMenuContent as HeadlessDropdownMenuContent,
    DropdownMenuItem as HeadlessDropdownMenuItem
} from "@radix-ui/react-dropdown-menu";

export const DropdownMenu = HeadlessDropdownMenu;
export const DropdownMenuTrigger = HeadlessDropdownMenuTrigger;
export const DropdownMenuContent = React.forwardRef(
    ({ children, className, ...props }, ref) => (
        <HeadlessDropdownMenuContent
        ref={ref}
        className={`z-50 min-w-[8rem] rounded-md border bg-white p-1 shadow-md ${className}`}
        {...props}
        >
        {children}
        </HeadlessDropdownMenuContent>
    )
);
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef(
    ({ className, ...props }, ref) => (
        <HeadlessDropdownMenuItem
            ref={ref}
            className={`cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 ${className}`}
        {...props}
        />
    )
);
DropdownMenuItem.displayName = "DropdownMenuItem";
