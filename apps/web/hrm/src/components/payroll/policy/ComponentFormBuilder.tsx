/**
 * @CODE-MEMORY
 * Component:  HRM · Policy Builder · Component Form Builder
 * WorkItem:   G10 - Khôi phục và Đồng bộ Hóa Giao diện Cấu hình Thuế TNCN
 * Coded:      2026-08-27
 * Description: Bộ dựng giao diện động chỉnh sửa tham số của lương thành phần (Steps table, Grade-Step matrix)
 *              và cấu hình thuế TNCN (Lũy tiến tax_progressive, Cố định tax_flat). Đồng nhất với UI/UX chuẩn
 *              của ngạch/bậc, sử dụng ViMoneyInput để phân tách hàng nghìn khi nhập số.
 */
import React, { useState } from 'react';
import { useGrades } from '@/hooks/useGrades';
import { usePaySteps } from '@/hooks/usePaySteps';
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';

export interface ComponentFormBuilderProps {
  componentType: string;
  paramsStr: string;
  onChange: (paramsStr: string) => void;
  disabled?: boolean;
}

const S = {
  input: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 6, color: "#1e293b", padding: "6px 12px", fontSize: 14, width: "100%", boxSizing: "border-box" as const },
  label: { fontSize: 13, color: "#64748b", marginBottom: 4, display: "block", fontWeight: 500 },
  field: { marginBottom: 14 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 },
  btnSmall: { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer", marginTop: 4, fontWeight: 500 },
  btnDanger: { background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer" },
};

function tryParseParams(str: string) {
  try { return JSON.parse(str || "{}"); } catch { return {}; }
}

export function ComponentFormBuilder({ componentType, paramsStr, onChange, disabled }: ComponentFormBuilderProps) {
  const params = tryParseParams(paramsStr);
  const { grades } = useGrades();
  const { steps: dbSteps } = usePaySteps();
  const updateParam = (key: string, value: any) => {
    onChange(JSON.stringify({ ...params, [key]: value }, null, 2));
  };

  if (componentType === 'tax_progressive') {
    const rules = params.calculation_rules || {};
    const personalDeduction = rules.personal_deduction !== undefined ? rules.personal_deduction : (params.personal_deduction !== undefined ? params.personal_deduction : 11000000);
    const dependentDeduction = rules.dependent_deduction !== undefined ? rules.dependent_deduction : (params.dependent_deduction !== undefined ? params.dependent_deduction : 4400000);
    const tiers = rules.tiers || params.tiers || [
      { id: "t1", min: 0, max: 5000000, rate: 5 },
      { id: "t2", min: 5000000, max: 10000000, rate: 10 },
      { id: "t3", min: 10000000, max: 18000000, rate: 15 },
      { id: "t4", min: 18000000, max: 32000000, rate: 20 },
      { id: "t5", min: 32000000, max: 52000000, rate: 25 },
      { id: "t6", min: 52000000, max: 80000000, rate: 30 },
      { id: "t7", min: 80000000, max: null, rate: 35 }
    ];

    const updateRules = (key: string, value: any) => {
      const newRules = {
        personal_deduction: personalDeduction,
        dependent_deduction: dependentDeduction,
        tiers,
        ...rules,
        [key]: value
      };
      onChange(JSON.stringify({
        ...params,
        calculation_rules: newRules,
        personal_deduction: newRules.personal_deduction,
        dependent_deduction: newRules.dependent_deduction,
        tiers: newRules.tiers
      }, null, 2));
    };

    return (
      <div style={{ gridColumn: '1/-1' }} className="space-y-6">
        <p className="text-sm text-slate-500 mb-4">Cấu hình tham số và biểu thuế lũy tiến từng phần dùng để tính thuế thu nhập cá nhân.</p>
        
        <div style={S.row}>
          <div style={S.field}>
            <label style={S.label}>Giảm trừ gia cảnh bản thân (VNĐ/tháng)</label>
            <ViMoneyInput 
              style={S.input} 
              value={personalDeduction} 
              disabled={disabled} 
              onValueChange={(val) => updateRules('personal_deduction', val)} 
            />
          </div>
          <div style={S.field}>
            <label style={S.label}>Giảm trừ người phụ thuộc (VNĐ/tháng/người)</label>
            <ViMoneyInput 
              style={S.input} 
              value={dependentDeduction} 
              disabled={disabled} 
              onValueChange={(val) => updateRules('dependent_deduction', val)} 
            />
          </div>
        </div>

        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ background: "#f8fafc", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "#334155" }}>Bảng Bậc Thuế Luỹ Tiến Động</span>
            <button 
              type="button" 
              style={{ ...S.btnSmall, margin: 0, background: "#4f46e5", color: "white", border: "none" }} 
              disabled={disabled}
              onClick={() => {
                const lastTier = tiers[tiers.length - 1];
                let nextMin = 0;
                if (lastTier) {
                  const updatedTiers = [...tiers];
                  if (lastTier.max === null) {
                    updatedTiers[updatedTiers.length - 1].max = (lastTier.min || 0) + 10000000;
                  }
                  nextMin = updatedTiers[updatedTiers.length - 1].max;
                }
                const newTiers = [...tiers];
                if (lastTier && lastTier.max === null) {
                  newTiers[newTiers.length - 1].max = (lastTier.min || 0) + 10000000;
                }
                newTiers.push({ id: `t_${Date.now()}`, min: nextMin, max: null, rate: 0 });
                updateRules('tiers', newTiers);
              }}
            >
              + Thêm bậc
            </button>
          </div>

          <div style={{ padding: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 80px", gap: 12, marginBottom: 8, alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <label style={{...S.label, margin: 0}}>Từ (VNĐ)</label>
              <label style={{...S.label, margin: 0}}>Đến (VNĐ)</label>
              <label style={{...S.label, margin: 0}}>Thuế suất (%)</label>
              <label style={{...S.label, margin: 0}}></label>
            </div>

            {tiers.map((t: any, idx: number) => (
              <div key={t.id || idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 80px", gap: 12, marginBottom: 8, alignItems: "center", padding: "0 12px" }}>
                <ViMoneyInput 
                  style={S.input} 
                  value={t.min || 0} 
                  disabled={disabled} 
                  onValueChange={(val) => {
                    const newTiers = [...tiers];
                    newTiers[idx].min = val;
                    updateRules('tiers', newTiers);
                  }} 
                />
                <ViMoneyInput 
                  style={S.input} 
                  value={t.max === null ? undefined : t.max} 
                  placeholder="Không giới hạn"
                  disabled={disabled} 
                  onValueChange={(val) => {
                    const newTiers = [...tiers];
                    newTiers[idx].max = val !== undefined ? val : null;
                    updateRules('tiers', newTiers);
                  }} 
                />
                <div style={{ position: "relative" }}>
                  <input 
                    type="number"
                    style={{ ...S.input, paddingRight: "24px" }} 
                    value={t.rate || 0} 
                    disabled={disabled}
                    onChange={(e) => {
                      const newTiers = [...tiers];
                      newTiers[idx].rate = Number(e.target.value) || 0;
                      updateRules('tiers', newTiers);
                    }} 
                  />
                  <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#94a3b8" }}>%</span>
                </div>
                <button 
                  type="button" 
                  style={S.btnDanger} 
                  disabled={disabled || tiers.length === 1} 
                  onClick={() => {
                    const newTiers = tiers.filter((_: any, i: number) => i !== idx);
                    updateRules('tiers', newTiers);
                  }}
                >
                  Xoá
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (componentType === 'tax_flat') {
    const rules = params.calculation_rules || {};
    const rate = rules.rate !== undefined ? rules.rate : (params.rate !== undefined ? params.rate : 10);
    const minTaxableIncome = rules.min_taxable_income !== undefined ? rules.min_taxable_income : (params.min_taxable_income !== undefined ? params.min_taxable_income : 2000000);

    const updateRules = (key: string, value: any) => {
      const newRules = {
        rate,
        min_taxable_income: minTaxableIncome,
        ...rules,
        [key]: value
      };
      onChange(JSON.stringify({
        ...params,
        calculation_rules: newRules,
        rate: newRules.rate,
        min_taxable_income: newRules.min_taxable_income
      }, null, 2));
    };

    return (
      <div style={{ gridColumn: '1/-1' }} className="space-y-6">
        <p className="text-sm text-slate-500 mb-4">Cấu hình các tham số cho tính thuế suất cố định (Flat tax).</p>
        
        <div style={S.row}>
          <div style={S.field}>
            <label style={S.label}>Thuế suất toàn phần (%)</label>
            <div style={{ position: "relative" }}>
              <input 
                type="number"
                style={{ ...S.input, paddingRight: "24px" }} 
                value={rate} 
                disabled={disabled}
                onChange={(e) => updateRules('rate', Number(e.target.value) || 0)} 
              />
              <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#94a3b8" }}>%</span>
            </div>
          </div>
          <div style={S.field}>
            <label style={S.label}>Mức thu nhập tối thiểu bị khấu trừ (VNĐ/lần)</label>
            <ViMoneyInput 
              style={S.input} 
              value={minTaxableIncome} 
              disabled={disabled} 
              onValueChange={(val) => updateRules('min_taxable_income', val)} 
            />
          </div>
        </div>
      </div>
    );
  }

  if (componentType === 'step_only_table') {
    const steps = params.steps || [
      { step: 1, amount: 4800000 },
      { step: 2, amount: 5520000 },
    ];
    return (
      <div style={{ gridColumn: '1/-1' }}>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 100px", gap: 12, marginBottom: 8, alignItems: "center", background: "#f8fafc", padding: "10px 16px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
          <label style={{...S.label, margin: 0}}>Bậc</label>
          <label style={{...S.label, margin: 0}}>Mức lương (VNĐ)</label>
          <label style={{...S.label, margin: 0}}></label>
        </div>
        
        {steps.map((s: any, idx: number) => (
          <div key={idx} style={{ display: "grid", gridTemplateColumns: "120px 1fr 100px", gap: 12, marginBottom: 8, alignItems: "center", padding: "0 16px" }}>
            <select style={{...S.input, padding: "6px 10px"}} value={s.step} disabled={disabled} onChange={e => { const newSteps = [...steps]; newSteps[idx].step = e.target.value; updateParam('steps', newSteps); }}>
              <option value="">-- Chọn bậc --</option>
              {dbSteps?.map((dbStep: any) => (
                <option key={dbStep.id} value={dbStep.code}>{dbStep.name}</option>
              ))}
            </select>
            <ViMoneyInput style={{...S.input, padding: "6px 10px"}} value={s.amount || 0} disabled={disabled} onValueChange={(val) => { const newSteps = [...steps]; newSteps[idx].amount = val; updateParam('steps', newSteps); }} />
            <button type="button" style={S.btnDanger} disabled={disabled} onClick={() => { const newSteps = steps.filter((_:any, i:number) => i !== idx); updateParam('steps', newSteps); }}>Xoá</button>
          </div>
        ))}
        <button type="button" style={S.btnSmall} disabled={disabled} onClick={() => updateParam('steps', [...steps, { step: "", amount: 0 }])}>
          + Thêm bậc mới
        </button>
      </div>
    );
  }

  if (componentType === 'grade_step_matrix') {
    const matrix = params.matrix || [
      {
        grade: "Chuyên viên",
        steps: [
            { step: "S1", amount: 5000000 },
            { step: "S2", amount: 6000000 }
          ]
      }
    ];

    const handleUpdateMatrix = (newMatrix: any) => {
      updateParam('matrix', newMatrix);
    };

    return (
      <div style={{ gridColumn: '1/-1' }}>
        <p className="text-sm text-slate-500 mb-4">Mô hình Ngạch-Bậc (2 chiều): Mỗi Ngạch (dòng) có thể có nhiều Bậc (cột). Bạn có thể cấu hình Mức tiền tương ứng cho mỗi Bậc.</p>
        
        {matrix.map((row: any, rIdx: number) => (
          <div key={rIdx} style={{ marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ background: "#f8fafc", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#334155" }}>Ngạch:</span>
                <select 
                  style={{ ...S.input, width: 250, padding: "4px 8px" }} 
                  value={row.grade} 
                  disabled={disabled}
                  onChange={e => {
                    const newMatrix = [...matrix];
                    newMatrix[rIdx].grade = e.target.value;
                    handleUpdateMatrix(newMatrix);
                  }}
                >
                  <option value="">-- Chọn ngạch --</option>
                  {grades?.map((g: any) => (
                    <option key={g.id} value={g.code}>{g.name}</option>
                  ))}
                </select>
              </div>
              <button type="button" style={{...S.btnDanger, padding: "4px 8px"}} disabled={disabled} onClick={() => {
                const newMatrix = matrix.filter((_:any, i:number) => i !== rIdx);
                handleUpdateMatrix(newMatrix);
              }}>Xoá Ngạch</button>
            </div>
            
            <div style={{ padding: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 100px", gap: 12, marginBottom: 8, alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <label style={{...S.label, margin: 0}}>Bậc</label>
                <label style={{...S.label, margin: 0}}>Mức lương (VNĐ)</label>
                <label style={{...S.label, margin: 0}}></label>
              </div>
              
              {row.steps.map((s: any, sIdx: number) => (
                <div key={sIdx} style={{ display: "grid", gridTemplateColumns: "120px 1fr 100px", gap: 12, marginBottom: 8, alignItems: "center", padding: "0 12px" }}>
                  <select style={{...S.input, padding: "6px 10px"}} value={s.step} disabled={disabled} onChange={e => { const newMatrix = [...matrix]; newMatrix[rIdx].steps[sIdx].step = e.target.value; handleUpdateMatrix(newMatrix); }}>
                    <option value="">-- Chọn bậc --</option>
                    {dbSteps?.map((dbStep: any) => (
                      <option key={dbStep.id} value={dbStep.code}>{dbStep.name}</option>
                    ))}
                  </select>
                  <ViMoneyInput style={{...S.input, padding: "6px 10px"}} value={s.amount || 0} disabled={disabled} onValueChange={(val) => { const newMatrix = [...matrix]; newMatrix[rIdx].steps[sIdx].amount = val; handleUpdateMatrix(newMatrix); }} />
                  <button type="button" style={{...S.btnDanger, background: "transparent", color: "#ef4444", border: "1px solid #fca5a5"}} disabled={disabled} onClick={() => { const newMatrix = [...matrix]; newMatrix[rIdx].steps = row.steps.filter((_:any, i:number) => i !== sIdx); handleUpdateMatrix(newMatrix); }}>Xoá</button>
                </div>
              ))}
              <button type="button" style={S.btnSmall} disabled={disabled} onClick={() => {
                const newMatrix = [...matrix];
                newMatrix[rIdx].steps.push({ step: "", amount: 0 });
                handleUpdateMatrix(newMatrix);
              }}>
                + Thêm bậc
              </button>
            </div>
          </div>
        ))}
        
        <button type="button" style={{...S.btnSmall, background: "#4f46e5", color: "white", border: "none", padding: "8px 16px"}} disabled={disabled} onClick={() => {
          handleUpdateMatrix([...matrix, { grade: "", steps: [{ step: "", amount: 0 }] }]);
        }}>
          + Thêm Ngạch mới
        </button>
      </div>
    );
  }

  // Fallback to raw JSON editor
  return (
    <div style={{ gridColumn: "1/-1" }}>
      <label style={S.label}>Params (JSON) - Dành cho DEV</label>
      <textarea style={{ ...S.input, minHeight: 150, fontFamily: "monospace", resize: "vertical" }} disabled={disabled} value={paramsStr} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
