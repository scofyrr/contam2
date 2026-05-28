declare module "jspdf-autotable" {
  import type { jsPDF } from "jspdf";

  export interface AutoTableOptions {
    startY?: number;
    head?: (string | number)[][];
    body?: (string | number)[][];
    theme?: string;
    styles?: Record<string, unknown>;
    headStyles?: Record<string, unknown>;
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): jsPDF;
}
