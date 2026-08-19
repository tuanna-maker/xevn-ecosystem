/**

 * @CODE-MEMORY

 * Screen:     /contracts — wizard state + submit mapping

 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-01 · FE-03

 * must_keep:  UF-HRM-02 · omitBlank template · BR-CTR-CREATE-02 confirm

 *

 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-CTR-CREATE-REDESIGN-FE-03

 * What: subject_type UV|NV · signed_at · work_arrangement · salary_ratio · contract_abstract · derive name

 * Why: BA-02 Q3–Q6 · Q10 · SA-02 API delta (coordinate BE-SUBJ-01)

 *

 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-02-HARNESS-01

 * What: wizardExtraFieldsFromEditingContract — hydrate work_arrangement + signing_date on Sửa

 * Why: QA ETCTRQA1 F5 label FAIL — extra reset to initial on edit open

 *

 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-03-CONTRACT-TYPE-HYDRATE-01

 * What: buildRegistrySubmitPayload — resolveContractTypeEditValue before PATCH contract_type

 * Why: QA RETEST-03 HRM-CON-TYPE-KEY — NV001-HD sent VI label not catalog code

 */



import { format } from 'date-fns';

import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';
import { buildDepartmentKeyFields, resolveContractTypeEditValue } from '@/lib/catalogSearchPicker';

import { deriveContractDisplayName } from '@/lib/contractCreateDisplayName';

import { omitBlankContractTemplateFields } from '@/lib/contractCore09Ring';

import { resolveContractCreatePositionKey } from '@/lib/contractCreatePayload';

import {

  ensureContractCreateDates,

  resolveContractTypeForDatePolicy,

  validateContractDatesForSubmit,

} from '@/lib/contractEndDatePolicy';



export type ContractWizardStep = 1 | 2;



export type ContractSubjectType = 'candidate' | 'employee';



export type ContractWizardExtraFields = {

  contract_name: string;

  signing_date: Date | undefined;

  work_arrangement: string;

  salary_ratio_percent: string;

  abstract_text: string;

  signer_name: string;

  signer_position: string;

  driver_license_number: string;

  driver_license_class: string;

  driver_license_issued_on: string;

  driver_license_issued_place: string;

};



export const initialWizardExtraFields: ContractWizardExtraFields = {

  contract_name: '',

  signing_date: undefined,

  work_arrangement: '',

  salary_ratio_percent: '',

  abstract_text: '',

  signer_name: '',

  signer_position: '',

  driver_license_number: '',

  driver_license_class: '',

  driver_license_issued_on: '',

  driver_license_issued_place: '',

};



/** ISO / yyyy-MM-dd → Date for wizard DatePicker (invalid → undefined). */
export function parseContractWizardDate(iso: string | null | undefined): Date | undefined {
  const raw = (iso ?? '').trim();
  if (!raw) return undefined;
  const d = new Date(raw.includes('T') ? raw : `${raw}T12:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}



export type ContractWizardEditHydrationSource = {
  contract_name?: string | null;
  signing_date?: string | null;
  effective_date?: string | null;
  work_arrangement?: string | null;
  salary_ratio_percent?: number | null;
  contract_abstract?: string | null;
};



/** Restore step-1 extra fields when opening Sửa (F5 parity — cấm reset work_arrangement). */
export function wizardExtraFieldsFromEditingContract(
  contract: ContractWizardEditHydrationSource,
): ContractWizardExtraFields {
  const signing =
    parseContractWizardDate(contract.signing_date) ??
    parseContractWizardDate(contract.effective_date);
  const ratio =
    contract.salary_ratio_percent != null && Number.isFinite(contract.salary_ratio_percent)
      ? String(contract.salary_ratio_percent)
      : '';
  return {
    ...initialWizardExtraFields,
    contract_name: (contract.contract_name ?? '').trim(),
    signing_date: signing,
    work_arrangement: (contract.work_arrangement ?? '').trim(),
    salary_ratio_percent: ratio || (signing ? '100' : ''),
    abstract_text: (contract.contract_abstract ?? '').trim(),
  };
}



export type ContractWizardFormSlice = {

  contract_code: string;

  employee_name: string;

  employee_id?: string;

  department: string;

  contract_type: string;

  effective_date: Date | undefined;

  expiry_date: Date | undefined;

  status: string;

  notes: string;

  work_location: string;

  position_key?: string;

  position?: string;

};



export type ContractWizardSubjectState = {

  subject_type: ContractSubjectType;

  candidate_id: string;

  requisition_id: string;

};



export const initialWizardSubjectState: ContractWizardSubjectState = {

  subject_type: 'employee',

  candidate_id: '',

  requisition_id: '',

};



function parseSalaryRatioPercent(raw: string): number | null {

  const trimmed = raw.trim();

  if (!trimmed) return null;

  const n = Number(trimmed.replace(',', '.'));

  if (!Number.isFinite(n) || n < 0 || n > 100) return null;

  return n;

}



export function buildRegistrySubmitPayload(input: {

  companyId: string;

  form: ContractWizardFormSlice;

  extra: ContractWizardExtraFields;

  subject: ContractWizardSubjectState;

  packCode: string;

  templateId: string;

  templateCode: string;

  registryOnly: boolean;

  contractTypeOptions: readonly CatalogPickerOption[];

  positionOptions: readonly CatalogPickerOption[];

  departmentOptions: readonly CatalogPickerOption[];

  employeeJobTitleKey?: string | null;

  employeeCode?: string | null;

  candidatePositionKey?: string | null;

  candidatePositionName?: string | null;

}) {

  const pickerValues = input.contractTypeOptions.map((o) => o.value);
  const catalogBound = input.contractTypeOptions.length > 0;
  const contractTypeCode = resolveContractTypeEditValue(
    input.contractTypeOptions,
    input.form.contract_type,
    catalogBound,
  );

  const resolvedType = resolveContractTypeForDatePolicy(
    contractTypeCode || input.form.contract_type,
    pickerValues,
  );

  const { effective_date, expiry_date } = ensureContractCreateDates({

    effectiveDate: input.form.effective_date,

    expiryDate: input.form.expiry_date,

    contractType: resolvedType,

    pickerOptionValues: pickerValues,

  });

  const datesGate = validateContractDatesForSubmit({

    contractType: resolvedType,

    effectiveDate: effective_date,

    expiryDate: expiry_date,

  });

  if (!datesGate.ok) {

    return { ok: false as const, message: datesGate.message };

  }

  if (catalogBound && !contractTypeCode.trim()) {
    return { ok: false as const, message: 'Chọn loại hợp đồng từ danh mục.' };
  }



  if (!input.registryOnly && !input.extra.signing_date) {

    return { ok: false as const, message: 'Chọn ngày ký trước khi lưu hoặc sang bước điều khoản.' };

  }



  if (!input.registryOnly) {

    if (!input.extra.work_arrangement.trim()) {

      return { ok: false as const, message: 'Chọn hình thức làm việc.' };

    }

    const ratio = parseSalaryRatioPercent(input.extra.salary_ratio_percent);

    if (ratio === null) {

      return { ok: false as const, message: 'Nhập tỉ lệ hưởng lương % (0–100).' };

    }

  }



  if (input.subject.subject_type === 'candidate') {

    if (!input.registryOnly && !input.subject.candidate_id.trim()) {

      return { ok: false as const, message: 'Chọn ứng viên trong phạm vi công ty.' };

    }

  } else if (!input.form.employee_id?.trim()) {

    return { ok: false as const, message: 'Chọn nhân viên trong phạm vi công ty.' };

  }



  const posResolved =

    input.subject.subject_type === 'employee'

      ? resolveContractCreatePositionKey({

          employeeJobTitleKey: input.employeeJobTitleKey,

          positionOptions: input.positionOptions,

          departmentSnapshot: input.form.department,

          employeeCodeSnapshot: input.employeeCode,

        })

      : resolveContractCreatePositionKey({

          employeeJobTitleKey: input.candidatePositionKey,

          positionOptions: input.positionOptions,

          departmentSnapshot: input.form.department,

          employeeCodeSnapshot: input.candidatePositionName,

        });

  if (!posResolved) {

    return { ok: false as const, message: 'Chọn vị trí từ danh mục chức danh (Cài đặt → Danh mục nghiệp vụ).' };

  }



  const tplFields = input.registryOnly

    ? omitBlankContractTemplateFields({ template_id: '', template_code: '', pack_code: '' })

    : omitBlankContractTemplateFields({

        template_id: input.templateId,

        template_code: input.templateCode,

        pack_code: input.packCode,

      });



  const derivedName = deriveContractDisplayName(

    input.form.contract_code,

    contractTypeCode || input.form.contract_type,

    input.contractTypeOptions,

  );

  const contractName = derivedName || input.extra.contract_name.trim();

  const abstractText = input.extra.abstract_text.trim();

  const ratioPersist = parseSalaryRatioPercent(input.extra.salary_ratio_percent);



  const deptFields =
    input.form.department?.trim() && input.departmentOptions.length > 0
      ? buildDepartmentKeyFields(input.form.department, input.departmentOptions)
      : null;

  return {

    ok: true as const,

    payload: {

      company_id: input.companyId,

      ...(input.subject.subject_type === 'employee' && input.form.employee_id

        ? { employee_id: input.form.employee_id }

        : {}),

      ...(input.subject.subject_type === 'candidate'

        ? {

            subject_type: 'candidate' as const,

            candidate_id: input.subject.candidate_id.trim() || undefined,

            ...(input.subject.requisition_id.trim()

              ? { requisition_id: input.subject.requisition_id.trim() }

              : {}),

          }

        : { subject_type: 'employee' as const }),

      contract_type: contractTypeCode.trim() || resolvedType,

      start_date: format(effective_date!, 'yyyy-MM-dd'),

      ...(expiry_date ? { end_date: format(expiry_date, 'yyyy-MM-dd') } : {}),

      contract_code: input.form.contract_code.trim() || undefined,

      position_key: posResolved.position_key,

      ...(posResolved.position ? { position: posResolved.position } : {}),

      ...(deptFields
        ? { department_key: deptFields.department_key, department: deptFields.department }
        : input.form.department?.trim()
          ? { department: input.form.department.trim() }
          : {}),

      ...tplFields,

      ...(input.form.work_location?.trim() ? { work_location: input.form.work_location.trim() } : {}),

      ...(input.form.notes?.trim() ? { notes: input.form.notes.trim() } : {}),

      ...(contractName ? { contract_name: contractName } : {}),

      ...(input.extra.signing_date

        ? { signed_at: format(input.extra.signing_date, 'yyyy-MM-dd') }

        : {}),

      ...(input.extra.work_arrangement.trim()

        ? { work_arrangement: input.extra.work_arrangement.trim() }

        : {}),

      ...(ratioPersist != null ? { salary_ratio_percent: ratioPersist } : {}),

      ...(abstractText ? { contract_abstract: abstractText } : {}),

      ...(input.extra.signer_name.trim() ? { signer_name: input.extra.signer_name.trim() } : {}),

      ...(input.extra.signer_position.trim()

        ? { signer_position: input.extra.signer_position.trim() }

        : {}),

    },

  };

}



export function shouldConfirmTemplateChange(hasCustomClauseOrder: boolean): boolean {

  return hasCustomClauseOrder;

}


