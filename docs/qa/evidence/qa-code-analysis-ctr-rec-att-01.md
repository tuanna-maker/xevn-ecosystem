# Code Analysis Pre-check -- CTR / REC / ATT
date: 2026-08-19

## TC-CTR-03 (confirm gate khi doi mau)
- clauseOrderDirty: CO -- line 137 (ContractCreateWizardDialog.tsx)
  - Set TRUE: onCanvasChange prop -- line 541 (khi user keo dieu khoan o Step2)
  - Reset FALSE: line 145 (reset khi dialog mo lai), line 420 (sau khi template pick thanh cong)
- confirm gate: CO -- lines 411-415
  - Dieu kien: clauseOrderDirty && templateCode && templateCode !== (tpl.template_code ?? tpl.code)
  - Dialog: window.confirm('Doi mau se goi y lai dieu khoan mac dinh - thu tu da keo co the thay doi. Tiep tuc?')
  - Neu user bam Cancel -- return (khong doi mau)
- verdict: PASS
- can fix: KHONG

## R7 (hire -> CTR banner)
- RecruitmentWfSpawnBanner: lazy import line 236 cua Recruitment.tsx; dung o line 2109 voi visible={planSpawnMissing}
  - Muc dich: canh bao WF spawn-missing (khong phai CTR creation banner)
- CTR link khi hire: CO -- CandidatesTab.tsx line 624
  - navigate(buildContractHireCtaPath(employeeId)) duoc goi trong handleConfirmHireLink (lines 611-633)
    sau khi confirm hire link thanh cong
  - buildContractHireCtaPath (lib/contractWorkspaceHireCta.ts): build path toi contract workspace
    /create voi prefill employee_id + lock_subject_employee
  - Ngoai ra: CandidateAcceptOfferDialog.tsx line 376-394 co button 'Tao HD'
    (data-testid=rec-accept-offer-create-contract) sau accept-offer flow
- verdict: PASS
- can fix: KHONG
  - NOTE: RecruitmentWfSpawnBanner KHONG phai CTR banner -- day la behavior dung
    (WF spawn-missing la alert rieng, hire->CTR flow o CandidatesTab.tsx line 624)

## ATT-B2 (leaveTypes no-Add)
- leaveTypesRefReadOnly: line 223-224 (MasterDataSettingsPanel.tsx)
  - Logic: bucket === 'leaveTypes' && isLeaveTypesGroupRefReadOnly(catalog ?? undefined)
  - isLeaveTypesGroupRefReadOnly (lib/hrmSettingsLeaveTypeSot.ts line 46-50):
    returns row.tenantWriter?.groupRefReadOnly === true
  - Dieu kien: API /settings-catalogs tra ve tenantWriter.groupRefReadOnly = true cho leaveTypes
- extensionMutateDisabled cho bucket leaveTypes: leaveTypesRefReadOnly || isW3StandaloneBucket (line 232)
  - Voi leaveTypes: true khi leaveTypesRefReadOnly = true
- Khi extensionMutateDisabled = true (line 391): nut Add bi AN hoan toan (khong render)
  - Thay the bang banner amber voi text giai thich
  - Button 'Mo tab Loai phep ATT' link sang /settings?tab=att-leave-types
  - Add button CHI render trong nhanh else (line 419+) -- hoan toan khong hien thi
- verdict: PASS
- can fix: KHONG
