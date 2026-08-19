/**
 * @CODE-MEMORY
 * Screen:     /contracts — mở Sửa HĐ → spine mẫu in
 * UC:         AC-CTR-XEVN-11 · R-CTR-XEVN-TPL-FE-EDIT-RESTORE
 * BR:         DYNAMIC LOCK open catalog — bind bất kỳ template_id/code active
 * SRS:        CORR-01 AC-CTR-XEVN-11 (F5 còn template trên edit UI)
 * TechSpec:   PO-HRM-CONTRACT-LEGAL-PRINT · print spine
 * Purpose:    Khôi phục pack/template từ row HĐ (list/detail) khi mở dialog Sửa —
 *             cấm hard-clear «— Chưa chọn —» sau F5 khi create đã bind #9+.
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-EDIT-01
 * Coded:      2026-08-07
 * Callers:    pages/Contracts.tsx → handleOpenEdit
 * Callees:    none (pure)
 * must_keep:  UF-HRM-02 · print-spine · Q-CTR CLOSED · printable=false · U65
 * solid_convention_ack: FE passthrough display-ready template_* từ BE — không invent
 * LastVerified: apps/web/hrm/src/lib/contractPrintEditRestore.test.ts
 */

export type PrintSpineEditRestoreInput = {
  pack_code?: string | null;
  template_id?: string | null;
  template_code?: string | null;
};

export type PrintSpineEditRestore = {
  packCode: string;
  templateId: string;
  templateCode: string;
};

/** Restore spine picker state from contract row after F5 / reopen edit. */
export function restorePrintSpineFromContract(
  contract: PrintSpineEditRestoreInput,
): PrintSpineEditRestore {
  const templateCode = (contract.template_code ?? '').trim().toUpperCase();
  return {
    packCode: (contract.pack_code ?? '').trim() || 'GENERAL',
    templateId: (contract.template_id ?? '').trim(),
    templateCode,
  };
}
