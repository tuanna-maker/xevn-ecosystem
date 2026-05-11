/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** B1 spike: planned `exceljs` swap for `xlsx` (default `xlsx` when unset). */
  readonly VITE_SHEET_ENGINE?: 'xlsx' | 'exceljs';
  /** When set, sent as `x-tenant-id` for hrm-api spreadsheet import (claim-first JWT may omit it). */
  readonly VITE_HRM_SCOPE_TENANT_ID?: string;
  /** B1 spike: planned `jspdf`+`html2canvas` direct path vs `html2pdf.js` bundle. */
  readonly VITE_PDF_ENGINE?: 'html2pdf' | 'jspdf';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
