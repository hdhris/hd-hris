import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button, cn } from "@nextui-org/react";
import { ReactElement, ReactNode } from "react";

interface DialogProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  modal?: boolean;
}

interface SheetProps {
  title: string;
  children: ReactNode;
  trigger?: ReactElement;
  description?: string;
  footer?: ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg";
  props?: DialogProps;
}

const sizeMap = {
  lg: "md:min-w-[900px]",
  md: "md:min-w-[650px]",
  sm: "md:min-w-[400px]",
}

export function SheetModal({
  children,
  trigger,
  title,
  description,
  footer,
  side,
  size,
  props,
}: SheetProps) {
  return (
    <Sheet modal {...props}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side} className={cn('flex flex-col sm:w-full', size&&sizeMap[size])}>
        <SheetHeader aria-describedby={"Form"}>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto min-w-400">
          <div>
            {children}
          </div>
        </div>

        {footer && (
          <SheetFooter>
            {/* <SheetClose asChild>{footer}</SheetClose> */}
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
