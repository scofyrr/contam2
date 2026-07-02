import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AccessibleTableProps {
  children: ReactNode;
  showGridLines?: boolean;
  dense?: boolean;
  highContrast?: boolean;
  className?: string;
  caption?: string;
}

export function AccessibleTable({
  children,
  showGridLines = false,
  dense = false,
  highContrast = false,
  className,
  caption,
}: AccessibleTableProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-auto rounded-lg border",
        showGridLines && "a11y-table-grid",
        dense && "a11y-dense",
        highContrast && "a11y-high-contrast-table",
        className,
      )}
      data-grid-lines={showGridLines}
    >
      <Table className={cn(dense && "text-sm")}>
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </Table>
    </div>
  );
}

export { TableBody, TableCell, TableHead, TableHeader, TableRow };
