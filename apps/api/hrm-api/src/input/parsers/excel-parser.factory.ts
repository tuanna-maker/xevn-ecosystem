/**
 * @CODE-MEMORY
 * Screen:     HRM · Nhập liệu lương · Upload Excel
 * UC:         UC-E3-02 (Import + Validate)
 * SRS:        §5.2 Import Parsers
 * Purpose:    ExcelParserFactory — routes input_type → correct column parser.
 *             Returns ParsedRow[] from raw Excel buffer.
 *             Uses xlsx (SheetJS) — no heavy deps.
 * WorkItem:   HRM-POLICY-E3-01
 * Coded:      2026-08-22
 * SOLID:      OCP — add new input_type by registering new parser, not modifying factory
 * FORBIDDEN:  DB calls · HTTP calls · NestJS DI in this file
 * NOTE:       xlsx peer dep must be listed in apps/api/hrm-api/package.json
 */
import * as XLSX from "xlsx";
import type { InputType, ParsedRow } from "../dto/input.dto";

/** Each parser gets the raw sheet rows (JSON) and returns typed ParsedRow[] */
type SheetParser = (rows: Record<string, unknown>[]) => ParsedRow[];

// ─── PARSER: TRIP_LOG ──────────────────────────────────────────────────────────
const parseTripLog: SheetParser = (rows) =>
  rows.map((r, idx) => ({
    row_number: idx + 2, // row 1 = header in Excel
    raw_employee_ref: String(r["Ma NV"] ?? r["Tên NV"] ?? r["ma_nv"] ?? ""),
    data: {
      tinh_code: String(r["Tinh"] ?? r["tinh_code"] ?? ""),
      so_luot_t1: Number(r["Luot T1"] ?? r["so_luot_t1"] ?? 0),
      so_luot_t2: Number(r["Luot T2"] ?? r["so_luot_t2"] ?? 0),
      so_luot_noibai: Number(r["Luot Noi Bai"] ?? r["so_luot_noibai"] ?? 0),
      so_luot_ho_tro: Number(r["Luot Ho Tro"] ?? r["so_luot_ho_tro"] ?? 0),
      dt_hop_dong_vnd: Number(r["DT HopDong"] ?? r["dt_hop_dong_vnd"] ?? 0),
    },
    parse_error:
      !r["Ma NV"] && !r["Tên NV"] && !r["ma_nv"]
        ? "Thiếu Mã/Tên nhân viên"
        : undefined,
  }));

// ─── PARSER: REVENUE_CLDV ──────────────────────────────────────────────────────
const parseRevenueCldv: SheetParser = (rows) =>
  rows.map((r, idx) => ({
    row_number: idx + 2,
    raw_employee_ref: String(r["Ma NV"] ?? r["Ten NV"] ?? ""),
    data: {
      doanh_thu_vnd: Number(r["Doanh Thu"] ?? r["doanh_thu_vnd"] ?? 0),
      diem_cldv: Number(r["Diem CLDV"] ?? r["diem_cldv"] ?? 0),
    },
    parse_error:
      Number(r["Doanh Thu"] ?? r["doanh_thu_vnd"] ?? 0) < 0
        ? "Doanh thu âm — cần kiểm tra"
        : undefined,
  }));

// ─── PARSER: MAINTENANCE_COST ──────────────────────────────────────────────────
const parseMaintenanceCost: SheetParser = (rows) =>
  rows.map((r, idx) => ({
    row_number: idx + 2,
    raw_employee_ref: String(r["To Xe"] ?? r["to_xe"] ?? r["Ma Xe"] ?? ""),
    data: {
      to_xe: String(r["To Xe"] ?? r["to_xe"] ?? ""),
      ma_xe: String(r["Ma Xe"] ?? r["ma_xe"] ?? ""),
      cp_sua_chua_vnd: Number(r["CP Sua Chua"] ?? r["cp_sua_chua_vnd"] ?? 0),
      cp_lop_vnd: Number(r["CP Lop"] ?? r["cp_lop_vnd"] ?? 0),
    },
  }));

// ─── PARSER: FREIGHT_REVENUE ───────────────────────────────────────────────────
const parseFreightRevenue: SheetParser = (rows) =>
  rows.map((r, idx) => ({
    row_number: idx + 2,
    raw_employee_ref: String(r["Ma NV"] ?? r["Ten NV"] ?? ""),
    data: {
      loai_xe: String(r["Loai Xe"] ?? r["loai_xe"] ?? ""),
      doanh_thu_vnd: Number(r["Doanh Thu"] ?? r["doanh_thu_vnd"] ?? 0),
      diem_clhd: Number(r["Diem CLHD"] ?? r["diem_clhd"] ?? 0),
      so_chuyen: Number(r["So Chuyen"] ?? r["so_chuyen"] ?? 0),
    },
  }));

// ─── PARSER: DPHH_REVENUE ─────────────────────────────────────────────────────
const parseDphhRevenue: SheetParser = (rows) =>
  rows.map((r, idx) => ({
    row_number: idx + 2,
    raw_employee_ref: String(r["Ma NV"] ?? r["Ten NV"] ?? ""),
    data: {
      van_phong: String(r["Van Phong"] ?? r["van_phong"] ?? ""),
      dt_gui_vnd: Number(r["DT Gui"] ?? r["dt_gui_vnd"] ?? 0),
      dt_nhan_vnd: Number(r["DT Nhan"] ?? r["dt_nhan_vnd"] ?? 0),
      gio_cong: Number(r["Gio Cong"] ?? r["gio_cong"] ?? 0),
    },
  }));

// ─── PARSER: HOTLINE_STATS ─────────────────────────────────────────────────────
const parseHotlineStats: SheetParser = (rows) =>
  rows.map((r, idx) => ({
    row_number: idx + 2,
    raw_employee_ref: String(r["Ma NV"] ?? r["Ten NV"] ?? ""),
    data: {
      hotline_code: String(r["So TDai"] ?? r["hotline_code"] ?? ""),
      so_cuoc_nghe: Number(r["So Cuoc Nghe"] ?? r["so_cuoc_nghe"] ?? 0),
      ty_le_nho: Number(r["Ty Le Nho"] ?? r["ty_le_nho"] ?? 0),
      diem_chat_luong: Number(r["Diem CL"] ?? r["diem_chat_luong"] ?? 0),
    },
  }));

// ─── PARSER: BRANCH_STATS ─────────────────────────────────────────────────────
const parseBranchStats: SheetParser = (rows) =>
  rows.map((r, idx) => ({
    row_number: idx + 2,
    raw_employee_ref: String(r["Chi Nhanh"] ?? r["chi_nhanh"] ?? ""),
    data: {
      chi_nhanh: String(r["Chi Nhanh"] ?? r["chi_nhanh"] ?? ""),
      so_khach: Number(r["So Khach"] ?? r["so_khach"] ?? 0),
      doanh_thu_vnd: Number(r["Doanh Thu"] ?? r["doanh_thu_vnd"] ?? 0),
    },
  }));

// ─── REGISTRY ─────────────────────────────────────────────────────────────────
const PARSERS: Record<InputType, SheetParser> = {
  TRIP_LOG: parseTripLog,
  REVENUE_CLDV: parseRevenueCldv,
  MAINTENANCE_COST: parseMaintenanceCost,
  FREIGHT_REVENUE: parseFreightRevenue,
  DPHH_REVENUE: parseDphhRevenue,
  HOTLINE_STATS: parseHotlineStats,
  BRANCH_STATS: parseBranchStats,
};

/** Parse Excel buffer → ParsedRow[] */
export function parseExcel(
  buffer: Buffer,
  inputType: InputType,
): ParsedRow[] {
  const parser = PARSERS[inputType];
  if (!parser) throw new Error(`No parser for input_type '${inputType}'`);

  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]!]!;
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  return parser(jsonRows);
}
