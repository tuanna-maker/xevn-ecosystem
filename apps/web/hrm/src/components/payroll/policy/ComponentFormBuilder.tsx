/**
 * @CODE-MEMORY
 * Component:  HRM · Policy Builder · Component Form Builder
 * WorkItem:   G10 - Khôi phục và Đồng bộ Hóa Giao diện Cấu hình Thuế TNCN
 * Coded:      2026-08-27
 * Description: Bộ dựng giao diện động chỉnh sửa tham số của lương thành phần (Steps table, Grade-Step matrix)
 *              và cấu hình thuế TNCN (Lũy tiến tax_progressive, Cố định tax_flat). Đồng nhất với UI/UX chuẩn
 *              của ngạch/bậc, sử dụng ViMoneyInput để phân tách hàng nghìn khi nhập số.
 *
 * @CODE-MEMORY-CHANGE 2026-09-04 PO-HRM-STEP-PROGRESSION-FORMULA-UI-01
 * change_mode: UPGRADE
 * What: Bổ sung Visual Editor cho componentType formula_based & progression (Thâm niên, KPI, Công thức & Step Tariff Matrix)
 * Why: Đáp ứng yêu cầu cấu hình công thức xét nâng bậc lương Bậc I -> Bậc II từ dữ liệu thâm niên/KPI thực tế của nhân sự
 * SRS/BR: SRS_PAYROLL.md §17 · BR-STEP-PROGRESSION-01 · UC-POL-FORMULA-01
 * must_keep: ViMoneyInput, preset Xét Nâng Bậc Lương, JSON sync compatibility
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
  btnDanger: { background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 12, cursor: "pointer" },
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
    const steps = params.steps || [];
    return (
      <div style={{ gridColumn: '1/-1' }}>
        <div style={{ display: "grid", gridTemplateColumns: "115px 1fr 55px", gap: 12, marginBottom: 8, alignItems: "center", background: "#f8fafc", padding: "10px 16px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
          <label style={{...S.label, margin: 0}}>Bậc</label>
          <label style={{...S.label, margin: 0}}>Mức lương (VNĐ)</label>
          <label style={{...S.label, margin: 0}}></label>
        </div>
        
        {steps.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2 text-center border border-dashed border-slate-200 rounded-lg mb-3">
            Chưa khai báo Bậc lương nào. Bạn có thể bấm <strong>+ Thêm bậc mới</strong> phía dưới để bắt đầu.
          </p>
        ) : (
          steps.map((s: any, idx: number) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "115px 1fr 55px", gap: 12, marginBottom: 8, alignItems: "center", padding: "0 16px" }}>
              <select style={{...S.input, padding: "6px 10px"}} value={s.step} disabled={disabled} onChange={e => { const newSteps = [...steps]; newSteps[idx].step = e.target.value; updateParam('steps', newSteps); }}>
                <option value="">-- Chọn bậc --</option>
                {dbSteps?.map((dbStep: any) => (
                  <option key={dbStep.id} value={dbStep.code}>{dbStep.name}</option>
                ))}
              </select>
              <ViMoneyInput style={{...S.input, padding: "6px 10px"}} value={s.amount || 0} disabled={disabled} onValueChange={(val) => { const newSteps = [...steps]; newSteps[idx].amount = val; updateParam('steps', newSteps); }} />
              <button type="button" style={S.btnDanger} disabled={disabled} onClick={() => { const newSteps = steps.filter((_:any, i:number) => i !== idx); updateParam('steps', newSteps); }}>Xoá</button>
            </div>
          ))
        )}
        <button type="button" style={S.btnSmall} disabled={disabled} onClick={() => updateParam('steps', [...steps, { step: "", amount: 0 }])}>
          + Thêm bậc mới
        </button>
      </div>
    );
  }

  if (componentType === 'grade_step_matrix') {
    const matrix = params.matrix || [];

    const handleUpdateMatrix = (newMatrix: any) => {
      updateParam('matrix', newMatrix);
    };

    return (
      <div style={{ gridColumn: '1/-1' }}>
        <p className="text-sm text-slate-500 mb-4">Mô hình Ngạch-Bậc (2 chiều): Mỗi Ngạch (dòng) có thể có nhiều Bậc (cột). Bạn có thể cấu hình Mức tiền tương ứng cho mỗi Bậc.</p>
        
        {matrix.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-3 text-center border border-dashed border-slate-200 rounded-lg mb-4">
            Chưa cấu hình ma trận Ngạch-Bậc nào. Bạn có thể bấm <strong>+ Thêm Ngạch mới</strong> phía dưới để bắt đầu.
          </p>
        ) : (
          matrix.map((row: any, rIdx: number) => {
            const currentGradeVal = row.grade_code || row.grade || row.code || "";
            const matchingGrade = grades?.find((g: any) => 
              (g.grade_code && (g.grade_code === currentGradeVal || g.grade_name === currentGradeVal)) ||
              (g.code && (g.code === currentGradeVal || g.name === currentGradeVal)) ||
              (g.grade_name && g.grade_name === currentGradeVal)
            );
            const selectedGradeValue = matchingGrade ? (matchingGrade.grade_code || matchingGrade.code) : currentGradeVal;

            return (
              <div key={rIdx} style={{ marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "#f8fafc", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#334155" }}>Ngạch:</span>
                    <select 
                      style={{ ...S.input, width: 250, padding: "4px 8px" }} 
                      value={selectedGradeValue} 
                      disabled={disabled}
                      onChange={e => {
                        const selected = grades?.find((g: any) => (g.grade_code || g.code) === e.target.value);
                        const newMatrix = [...matrix];
                        newMatrix[rIdx].grade = e.target.value;
                        newMatrix[rIdx].grade_code = e.target.value;
                        newMatrix[rIdx].grade_name = selected ? (selected.grade_name || selected.name) : e.target.value;
                        handleUpdateMatrix(newMatrix);
                      }}
                    >
                      <option value="">-- Chọn ngạch --</option>
                      {grades?.map((g: any) => {
                        const val = g.grade_code || g.code;
                        const label = g.grade_name || g.name || val;
                        return (
                          <option key={g.id || val} value={val}>{label}</option>
                        );
                      })}
                    </select>
                  </div>
                  <button type="button" style={{...S.btnDanger, padding: "4px 8px"}} disabled={disabled} onClick={() => {
                    const newMatrix = matrix.filter((_:any, i:number) => i !== rIdx);
                    handleUpdateMatrix(newMatrix);
                  }}>Xoá Ngạch</button>
                </div>
                
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "115px 1fr 55px", gap: 12, marginBottom: 8, alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                    <label style={{...S.label, margin: 0}}>Bậc</label>
                    <label style={{...S.label, margin: 0}}>Mức lương (VNĐ)</label>
                    <label style={{...S.label, margin: 0}}></label>
                  </div>
                  
                  {row.steps.map((s: any, sIdx: number) => {
                    const currentStepVal = String(s.step !== undefined ? s.step : "");
                    const matchingStep = dbSteps?.find((st: any) => 
                      st.code === currentStepVal || 
                      st.name === currentStepVal || 
                      String(st.step_number) === currentStepVal ||
                      st.id === currentStepVal
                    );
                    const selectedStepValue = matchingStep ? matchingStep.code : currentStepVal;

                    return (
                      <div key={sIdx} style={{ display: "grid", gridTemplateColumns: "115px 1fr 55px", gap: 12, marginBottom: 8, alignItems: "center", padding: "0 12px" }}>
                        <select 
                          style={{...S.input, padding: "6px 10px"}} 
                          value={selectedStepValue} 
                          disabled={disabled} 
                          onChange={e => { 
                            const newMatrix = [...matrix]; 
                            newMatrix[rIdx].steps[sIdx].step = e.target.value; 
                            handleUpdateMatrix(newMatrix); 
                          }}
                        >
                          <option value="">-- Chọn bậc --</option>
                          {dbSteps?.map((dbStep: any) => (
                            <option key={dbStep.id} value={dbStep.code}>{dbStep.name}</option>
                          ))}
                        </select>
                        <ViMoneyInput style={{...S.input, padding: "6px 10px"}} value={s.amount || 0} disabled={disabled} onValueChange={(val) => { const newMatrix = [...matrix]; newMatrix[rIdx].steps[sIdx].amount = val; handleUpdateMatrix(newMatrix); }} />
                        <button type="button" style={{...S.btnDanger, background: "transparent", color: "#ef4444", border: "1px solid #fca5a5"}} disabled={disabled} onClick={() => { const newMatrix = [...matrix]; newMatrix[rIdx].steps = row.steps.filter((_:any, i:number) => i !== sIdx); handleUpdateMatrix(newMatrix); }}>Xoá</button>
                      </div>
                    );
                  })}
                  <button type="button" style={S.btnSmall} disabled={disabled} onClick={() => {
                    const newMatrix = [...matrix];
                    newMatrix[rIdx].steps.push({ step: "", amount: 0 });
                    handleUpdateMatrix(newMatrix);
                  }}>
                    + Thêm bậc
                  </button>
                </div>
              </div>
            );
          })
        )}
        
        <button type="button" style={{...S.btnSmall, background: "#4f46e5", color: "white", border: "none", padding: "8px 16px"}} disabled={disabled} onClick={() => {
          handleUpdateMatrix([...matrix, { grade: "", steps: [{ step: "", amount: 0 }] }]);
        }}>
          + Thêm Ngạch mới
        </button>
      </div>
    );
  }

  if (componentType === 'formula_based' || componentType === 'progression') {
    const actionType = params.action_type || 'step_progression_next';
    const targetStepCode = params.target_step_code || '';
    const bonusRate = params.bonus_rate !== undefined ? params.bonus_rate : 10;
    const bonusAmount = params.bonus_amount !== undefined ? params.bonus_amount : 1000000;

    const rules = params.formula_rules || {
      formula_type: params.formula_type || 'step_progression',
      formula_expression: params.formula_expression || "",
    };

    const extraColumns: Array<{ code: string; label: string; source_type: 'extraData' | 'input'; mapping_key: string }> =
      params.extra_data_columns || [
        { code: 'TENURE_MONTHS', label: 'Thâm niên công tác (tháng)', source_type: 'extraData', mapping_key: 'hire_date' },
        { code: 'KPI_SCORE', label: 'Điểm KPI bình quân (%)', source_type: 'extraData', mapping_key: 'kpi_score' },
        { code: 'CURRENT_STEP', label: 'Bậc lương hiện tại', source_type: 'extraData', mapping_key: 'pay_step' },
      ];

    const steps = params.steps || [];

    const updateParams = (patch: Record<string, any>) => {
      onChange(JSON.stringify({
        ...params,
        action_type: patch.action_type || actionType,
        target_step_code: patch.target_step_code !== undefined ? patch.target_step_code : targetStepCode,
        bonus_rate: patch.bonus_rate !== undefined ? patch.bonus_rate : bonusRate,
        bonus_amount: patch.bonus_amount !== undefined ? patch.bonus_amount : bonusAmount,
        extra_data_columns: patch.extra_data_columns || extraColumns,
        formula_rules: { ...rules, ...(patch.formula_rules || {}) },
        steps: patch.steps || steps,
        formula_expression: patch.formula_expression !== undefined ? patch.formula_expression : rules.formula_expression,
        ...patch,
      }, null, 2));
    };

    const handleInsertToken = (token: string) => {
      const currentExpr = rules.formula_expression || '';
      const newExpr = currentExpr ? `${currentExpr} ${token}` : token;
      updateParams({
        formula_expression: newExpr,
        formula_rules: { ...rules, formula_expression: newExpr }
      });
    };

    return (
      <div style={{ gridColumn: '1/-1' }} className="space-y-4">
        {/* Action Type Selector */}
        <div className="space-y-1.5">
          <label style={S.label}>Hành động tác động dữ liệu khi thỏa mãn Rule (Target Action)</label>
          <select
            style={{ ...S.input, fontWeight: 'bold', color: '#312e81' }}
            disabled={disabled}
            value={actionType}
            onChange={(e) => updateParams({ action_type: e.target.value })}
          >
            <option value="step_progression_next">📈 Nâng lên Bậc tiếp theo trong CSDL (Auto Next Step)</option>
            <option value="step_progression_target">🎯 Nâng sang Bậc đích cụ thể (Target Pay Step Lookup)</option>
            <option value="kpi_bonus_rate">🎁 Cộng Thưởng KPI theo Tỷ lệ % Lương cơ bản</option>
            <option value="kpi_bonus_amount">💵 Cộng Thưởng KPI Số tiền cố định (VNĐ)</option>
            <option value="formula_custom">⚙️ Tính giá trị theo Công thức mở rộng (Custom Formula)</option>
          </select>
        </div>

        {actionType === 'step_progression_target' && (
          <div className="space-y-2 bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
            <label style={S.label}>Chọn Bậc lương đích sẽ chuyển đến (Target Pay Step)</label>
            <select
              style={S.input}
              disabled={disabled}
              value={targetStepCode}
              onChange={(e) => updateParams({ target_step_code: e.target.value })}
            >
              <option value="">-- Chọn Bậc đích --</option>
              {(dbSteps || []).map((dbStep: any) => (
                <option key={dbStep.id} value={dbStep.code}>{dbStep.code}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              Nhân sự thỏa mãn điều kiện ở Cột 2 sẽ được nâng trực tiếp sang Bậc lương này.
            </p>
          </div>
        )}

        {actionType === 'kpi_bonus_rate' && (
          <div className="space-y-2 bg-amber-50/60 p-3 rounded-lg border border-amber-100">
            <label style={S.label}>Tỷ lệ thưởng KPI (% Lương cơ bản / Lương BHXH)</label>
            <div className="relative">
              <input
                type="number"
                style={{ ...S.input, paddingRight: '28px' }}
                disabled={disabled}
                value={bonusRate}
                onChange={(e) => updateParams({ bonus_rate: Number(e.target.value) || 0 })}
                placeholder="VD: 10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Mức thưởng bằng {bonusRate}% x Lương cơ bản hợp đồng của nhân sự.
            </p>
          </div>
        )}

        {actionType === 'kpi_bonus_amount' && (
          <div className="space-y-2 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
            <label style={S.label}>Số tiền thưởng KPI cố định (VNĐ)</label>
            <ViMoneyInput
              style={S.input}
              disabled={disabled}
              value={bonusAmount}
              onValueChange={(val) => updateParams({ bonus_amount: val })}
            />
            <p className="text-[11px] text-slate-500">
              Mức tiền thưởng cộng trực tiếp vào thu nhập của nhân sự đạt điều kiện.
            </p>
          </div>
        )}

        {actionType === 'formula_custom' && (
          <div className="space-y-4 pt-1">
            {/* Dynamic ExtraData Columns Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-semibold text-xs text-slate-700 flex justify-between items-center">
                <span>📋 Danh sách Cột Dữ liệu Đầu vào (ExtraData Columns)</span>
                <button
                  type="button"
                  style={{ ...S.btnSmall, margin: 0 }}
                  disabled={disabled}
                  onClick={() => {
                    const newCols = [
                      ...extraColumns,
                      { code: `COL_${extraColumns.length + 1}`, label: `Cột dữ liệu ${extraColumns.length + 1}`, source_type: 'extraData' as const, mapping_key: 'custom' }
                    ];
                    updateParams({ extra_data_columns: newCols });
                  }}
                >
                  + Thêm Cột
                </button>
              </div>

              <div className="p-3 space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[11px] text-slate-500 font-medium px-1">
                  <span className="col-span-4">Mã Cột (Variable Code)</span>
                  <span className="col-span-4">Nhãn Cột (Column Label)</span>
                  <span className="col-span-3">Nguồn Dữ Liệu</span>
                  <span className="col-span-1"></span>
                </div>

                {extraColumns.map((col, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <input
                        style={{ ...S.input, fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', color: '#312e81' }}
                        disabled={disabled}
                        value={col.code}
                        onChange={(e) => {
                          const newCols = [...extraColumns];
                          newCols[idx].code = e.target.value.toUpperCase().replace(/[^A_Z0-9_]/g, '');
                          updateParams({ extra_data_columns: newCols });
                        }}
                        placeholder="VD: TENURE_MONTHS"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        style={S.input}
                        disabled={disabled}
                        value={col.label}
                        onChange={(e) => {
                          const newCols = [...extraColumns];
                          newCols[idx].label = e.target.value;
                          updateParams({ extra_data_columns: newCols });
                        }}
                        placeholder="VD: Thâm niên công tác (tháng)"
                      />
                    </div>
                    <div className="col-span-3">
                      <select
                        style={S.input}
                        disabled={disabled}
                        value={col.mapping_key}
                        onChange={(e) => {
                          const newCols = [...extraColumns];
                          newCols[idx].mapping_key = e.target.value;
                          updateParams({ extra_data_columns: newCols });
                        }}
                      >
                        <option value="hire_date">Thâm niên (hire_date)</option>
                        <option value="kpi_score">Đánh giá KPI (kpi_score)</option>
                        <option value="pay_step">Bậc lương CSDL (pay_step)</option>
                        <option value="base_salary">Lương cơ bản (base_salary)</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        style={S.btnDanger}
                        disabled={disabled || extraColumns.length <= 1}
                        onClick={() => {
                          const newCols = extraColumns.filter((_, i) => i !== idx);
                          updateParams({ extra_data_columns: newCols });
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Formula Input with Token Chips */}
            <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <label style={S.label}>Biểu Thức Công Thức Tính (Formula Expression)</label>
              
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                <span className="text-[11px] font-medium text-slate-500 mr-1">Chèn Mã Cột:</span>
                {extraColumns.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleInsertToken(col.code)}
                    className="text-[10px] font-mono font-semibold bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded transition cursor-pointer"
                  >
                    + {col.code}
                  </button>
                ))}
              </div>

              <input
                style={{ ...S.input, fontFamily: 'monospace', fontSize: 12, background: '#ffffff', color: '#1e1b4b', fontWeight: '500' }}
                disabled={disabled}
                value={rules.formula_expression || ''}
                onChange={(e) => updateParams({ 
                  formula_expression: e.target.value,
                  formula_rules: { ...rules, formula_expression: e.target.value }
                })}
                placeholder="VD: BASE_SALARY * 0.15"
              />
            </div>
          </div>
        )}

        {/* Step Tariff Matrix */}
        <div className="border border-slate-200 rounded-lg overflow-hidden mt-3">
          <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-semibold text-xs text-slate-700 flex justify-between items-center">
            <span>Biểu Mức Lương Theo Bậc (Step Tariff Matrix)</span>
            <button
              type="button"
              style={{ ...S.btnSmall, margin: 0 }}
              disabled={disabled}
              onClick={() => {
                const selectedCodes = new Set((steps || []).map((s: any) => s.step));
                const nextAvailableDbStep = (dbSteps || []).find((dbS: any) => !selectedCodes.has(dbS.code)) || (dbSteps || [])[0];
                const newStepItem = nextAvailableDbStep 
                  ? { step: nextAvailableDbStep.code, name: nextAvailableDbStep.name, amount: 0 }
                  : { step: `BAC${steps.length + 1}`, name: `Bậc ${steps.length + 1}`, amount: 0 };
                updateParams({ steps: [...steps, newStepItem] });
              }}
            >
              + Thêm Bậc
            </button>
          </div>
          <div className="p-3 space-y-2">
            {steps.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                Chưa khai báo Mức lương cho Bậc nào. Bạn có thể bấm <strong>+ Thêm Bậc</strong> phía trên để khai báo nếu cần thiết.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 font-medium px-1">
                  <span className="col-span-3">Mã / Số Bậc</span>
                  <span className="col-span-4">Tên Bậc Lương (Master Catalog)</span>
                  <span className="col-span-4">Mức Lương Thực Nhận (VNĐ)</span>
                  <span className="col-span-1"></span>
                </div>
                {steps.map((s: any, idx: number) => {
                  const currentStepVal = String(s.step !== undefined ? s.step : "");
                  const matchingDbStep = (dbSteps || []).find((dbS: any) => 
                    dbS.code === currentStepVal || 
                    dbS.name === currentStepVal || 
                    String(dbS.step_number) === currentStepVal || 
                    dbS.id === currentStepVal
                  );
                  const selectedCode = matchingDbStep ? matchingDbStep.code : currentStepVal;
                  const displayName = matchingDbStep ? matchingDbStep.name : (s.name || (selectedCode ? `Bậc ${selectedCode}` : ''));

                  return (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <select
                          style={S.input}
                          disabled={disabled}
                          value={selectedCode}
                          onChange={(e) => {
                            const selectedDbStep = (dbSteps || []).find((dbS: any) => dbS.code === e.target.value);
                            const newSteps = [...steps];
                            newSteps[idx].step = e.target.value;
                            newSteps[idx].name = selectedDbStep ? selectedDbStep.name : (newSteps[idx].name || `Bậc ${e.target.value}`);
                            updateParams({ steps: newSteps });
                          }}
                        >
                          <option value="">-- Chọn Bậc --</option>
                          {(dbSteps || []).map((dbStep: any) => (
                            <option key={dbStep.id} value={dbStep.code}>{dbStep.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4">
                        <input
                          style={{ ...S.input, background: '#f8fafc', color: '#334155', fontWeight: 500 }}
                          disabled={disabled}
                          readOnly={true}
                          value={displayName}
                          placeholder="Tên Bậc tự động từ Master Catalog"
                        />
                      </div>
                      <div className="col-span-4">
                        <ViMoneyInput
                          style={S.input}
                          disabled={disabled}
                          value={s.amount || 0}
                          onValueChange={(val) => {
                            const newSteps = [...steps];
                            newSteps[idx].amount = val;
                            updateParams({ steps: newSteps });
                          }}
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          style={S.btnDanger}
                          disabled={disabled}
                          onClick={() => {
                            const newSteps = steps.filter((_: any, i: number) => i !== idx);
                            updateParams({ steps: newSteps });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (componentType === 'fixed_amount') {
    const amount = params.amount !== undefined ? params.amount : 0;
    return (
      <div style={{ gridColumn: '1/-1' }} className="space-y-4">
        <p className="text-sm text-slate-500 mb-2">Cấu hình mức lương hoặc phụ cấp cố định (Flat Amount).</p>
        <div style={S.field}>
          <label style={S.label}>Số tiền áp dụng (VNĐ/tháng)</label>
          <ViMoneyInput
            style={S.input}
            value={amount}
            disabled={disabled}
            onValueChange={(val) => updateParam('amount', val)}
          />
        </div>
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

