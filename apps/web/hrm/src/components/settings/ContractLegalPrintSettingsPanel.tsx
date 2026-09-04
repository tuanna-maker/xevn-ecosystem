/**
 * @CODE-MEMORY
 * Screen:     /settings — Thư viện điều khoản HĐ + mẫu theo loại (DnD)
 * UC:         FR-UC-BP-CORE-09a · AC-CTR-CL-01 · AC-CTR-TPL-*
 * BR:         BR-CTR-CL-01..04 · BR-CTR-CL-03 no hardcode body
 * SRS:        docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md §C · E.1
 * TechSpec:   docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md
 * Data:       docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md §5.2–5.7
 * Purpose:    Settings CRUD clause + template composer kéo-thả clause_ids → layout_json.
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-FE-01
 * Coded:      2026-08-06
 * Callers:    pages/Settings.tsx tab contract-legal
 * Callees:    hrmApi contract-clauses/templates · contractClauseOrder · sameNodeDragBind
 * must_keep:  UF-HRM-02 untouched; U65 no seed; honesty printable=false; DnD same-node handle
 * SOLID:      Panel owns Settings mutate; print spine stays on Contracts page
 * solid_convention_ack: FE binds display-ready clause/template fields from BE — no FE invent body
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-FE-05
 * What: ADD Publish (holding/main) · Pull/Apply (member) · origin badge TPL/CL · HDSD testids
 * Why: BE-03 READY_FOR_QA · ADR Option A · DATA-02 §7; company_id query only on pub/pull/apply
 * must_keep: FE-01 DnD · FE-02 preview · FE-03 work_location (Contracts/spine) · honesty false · no synced_catalogs
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-fe-05.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-FE-03
 * What: Origin overlay đủ 4 field + pull skipped_override/conflicts lists; PM W7.5 alias FE-03
 * Why: exit FE-03 · DATA-02 §7.2 · VAL-PUB-02/04 UX; company_id query only
 * must_keep: FE-01 DnD · FE-05 pub/pull/apply · work_location FE-03-A · printable=false · no synced_catalogs
 * solid_convention_ack: bind origin* / pull result arrays from API — no FE invent
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-fe-03.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-01
 * change_mode: EXPAND
 * What: Open catalog CRUD #9+ (term/duration/title/matrix) · optional matrix=xevn filter · CFG org_suffix/pattern · soft-warn missing starters
 * Why: DYNAMIC LOCK · CORR-01 AC-11 · BE-01 READY_FOR_QA — cấm hardcode 8-only list/picker
 * must_keep: clause DnD + LEGAL_BASIS · print-spine · Q-CTR · UF-HRM-02 · printable=false · library FE-05
 * solid_convention_ack: FE binds API open catalog + CFG — no FE invent closed XEVN_* enum
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 DEF-CTR-SETTINGS-SELECT-EMBED-01
 * What: SelectContent portalScope=iframe on contract-legal Settings (CC embed top-level chrome)
 * Why: Default parent portal made dropdown invisible/unclickable on Cấu hình HRM tab (Payroll pattern)
 * must_keep: Dialog-scoped Select unchanged; UF-HRM-02; printable=false
 * LastVerified: sponsor retest Cấu hình HRM selects
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-UI-DIALOG-FULL-VIEWPORT-FE-01
 * What: Template composer Dialog — parent portal ~90vw (PAT-DIALOG-FULL-VIEWPORT-CC-01); bỏ portalScope iframe.
 * must_keep: sameNode DnD · SettingsDialogSelectContent in dialog · top-level Select iframe unchanged
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-01
 * change_mode: ADD (sibling panel — không rewrite clause DnD)
 * What: Settings tab contract-legal neo thêm MergeTokenSettingsPanel (F-PLT-TOK)
 * Why: AC-PLT-CTR-05 browser — register token → F5 list → PREV registry
 * must_keep: clause/template DnD · library FE-05 · XEVN open catalog · printable=false · U65
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-FIX-PATCH-01
 * change_mode: FIX
 * What: onSaveClause update — bỏ company_id khỏi PATCH body; scope qua updateContractClause(…, companyId, fields)
 * Why: QA CLQA-KM4JR3 AC-01 FAIL HRM-VAL-001 · BE UpdateContractClauseDto whitelist · scope query/header peer activate/retire
 * must_keep: CREATE POST company_id body · retire query · DnD · printable=false · U65
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-fe-fix-patch-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-SNAPSHOT-BIND-FE-01
 * change_mode: FIX
 * What: Template Lưu/Kích hoạt gửi clause_ids + layout_json — BE replaceTemplateClauses → issued snapshot có code
 * Why: QA-03 CLQA3-KMJRGF R-CTR-CL-SNAPSHOT-BIND — DnD chỉ layout_json, junction trống, AC-02 precond fail
 * must_keep: CLQA2 PATCH query-only · CREATE/retire · printable=false · DnD
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-snapshot-bind-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09A-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Settings residual — VI status/group/pack labels; draft create; PATCH omit status invent;
 *       {{field}} validate; issued HRM-CTR-CL-CODE-CONFLICT banner → POST activate bump;
 *       soft retire RETAIN; publish/pull RETAIN ≠ body SoT; Network only contract-clauses*
 * Why: API-01 CONFIRMED RETAIN · BA O1–O12 · UC-BP-CORE-09a Settings UX residual ONLY
 * must_keep: CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest /core DENY ·
 *            printable=false · no PREV/VER/PDF/TPL invent DONE · no Settings body SoT · U65
 * solid_convention_ack: FE map display labels + toast codes — no FE invent schema/API
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Template Lưu = PATCH meta + PUT …/clauses SoT · open catalog #9+ · clauses[] canvas
 *       · matrix=xevn family filter · display-ready code/pack/term/title · CODE-INVALID format toast
 * Why: API-01 CONFIRMED RETAIN · OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY · UC-BP-CORE-09d U65
 * must_keep: CORE-09c VER/PDF ≠ printable · CORE-09b PACK+PREV · CORE-09a CL · CORE-08/02/01
 *            Nest /core DENY · starter ≠ ceiling · printable=false · U65 no seed
 * solid_convention_ack: FE binds PUT junction + display-ready clauses[] — no invent closed-8
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-02
 * change_mode: FIX
 * What: RETAIN Settings edit Lưu → updateContractTemplate(…, { company_id }) + sync PUT clauses;
 *       hrmApi strips company_id from PATCH body (query only) so edit reaches PUT …/clauses 200
 * Why: QA-01 J-03 FAIL R-FE-CORE-09D-PATCH-COMPANY-ID · HRM-VAL-001
 * must_keep: FE-01 create POST+PUT · J-01/02/04 · Nest /core DENY · printable=false · U65
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-W3-CAT-C-FE-01
 * change_mode: UPGRADE
 * What: view=templates — list shell + dialog composer; DnD same-node RETAIN
 * must_keep: clauses dedicated W1 · DnD · printable=false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-CTR-TPL-DIALOG-COMPOSER-FE-01
 * change_mode: FIX
 * What: PAT-CTR-TEMPLATE-COMPOSER-01 — dedicated view: full composer (fields+DnD+Lưu) inside DialogContent only
 * Why: AS-IS empty dialog + Card below list; TO-BE one modal surface for Sửa/Thêm mẫu
 * must_keep: DnD same-node · ctr-tpl-* testids · W3 list shell · printable=false · U65
 * LastVerified: docs/qa/evidence/po-hrm-ctr-tpl-dialog-composer-fe-01.md
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { FileText, GripVertical, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  activateContractClause,
  activateContractTemplate,
  applyContractLibrary,
  createContractClause,
  createContractTemplate,
  getContractCompanySetting,
  listContractClauses,
  listContractLibraryPublishes,
  listContractTemplates,
  publishContractLibrary,
  pullContractLibrary,
  putContractCompanySetting,
  retireContractClause,
  syncContractTemplateClauseBind,
  updateContractClause,
  updateContractTemplate,
  type HrmContractClauseRecord,
  type HrmContractLibraryPublishMeta,
  type HrmContractLibraryPullResult,
  type HrmContractTemplateRecord,
} from '@/integrations/hrmApi';
import {
  buildTemplateClauseBindPayload,
  clauseIdsFromTemplate,
  filterClausesForPack,
  placeClauseOnCanvas,
  removeClauseFromCanvas,
  reorderByIndex,
} from '@/lib/contractClauseOrder';
import {
  CONTRACT_CLAUSE_GROUP_LABELS,
  CONTRACT_CLAUSE_GROUPS,
  CONTRACT_MATRIX_FAMILIES,
  CONTRACT_MATRIX_FAMILY_LABELS,
  CONTRACT_NUMBER_PATTERN_DEFAULT,
  CONTRACT_PACK_CODES,
  CONTRACT_PACK_LABELS,
  CONTRACT_SETTING_NUMBER_PATTERN,
  CONTRACT_SETTING_ORG_SUFFIX,
  CONTRACT_TERM_TYPE_LABELS,
  CONTRACT_TERM_TYPES,
  CONTRACTS_PRINTABLE_READY,
} from '@/lib/contractLegalPrintConstants';
import {
  clauseGroupLabelVi,
  clausePackLabelsVi,
  clauseStatusLabelVi,
  isCtrClCodeConflict,
  validateClausePlaceholderSyntax,
} from '@/lib/contractClauseLibraryUx';
import {
  buildNumberPatternSettingValue,
  buildOrgSuffixSettingValue,
  isValidTemplateCodeFormat,
  isXevnStarterTemplateCode,
  missingStarterTemplateCodes,
  normalizeTemplateCode,
  parseNumberPatternValue,
  parseOrgSuffixValue,
} from '@/lib/contractTemplateCatalog';
import {
  contractLibraryOriginDetailText,
  isContractLibraryHoldingPartition,
} from '@/lib/contractLibraryPublishRequest';
import { sameNodeDragBind } from '@/lib/jdDndSameNodeProps';
import {
  HRM_DIALOG_FULL_VIEWPORT_BODY_CLASS,
  HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS,
  HRM_DIALOG_PARENT_COMPACT_CLASS,
} from '@/lib/hrmDialogFullViewport';
import { toErrorMessage } from '@/lib/apiError';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SettingsCatalogScreenShell } from '@/components/settings/SettingsCatalogScreenShell';
import { ContractClauseListTable } from '@/components/settings/ContractClauseListTable';
import { SettingsDialogSelectContent } from '@/components/settings/SettingsDialogSelectContent';
import {
  ContractClauseGroupNav,
  filterClausesByGroupAndSearch,
} from '@/components/settings/ContractClauseGroupNav';
import { SettingsCatalogPagination } from '@/components/settings/SettingsCatalogPagination';
import { SettingsCatalogRowActions } from '@/components/settings/SettingsCatalogRowActions';
import {
  filterCatalogByCodeOrName,
  paginateCatalogRows,
  SETTINGS_CATALOG_PAGE_SIZE,
} from '@/lib/settingsCatalogPagination';
import { toast } from '@/hooks/use-toast';

export type ContractLegalSettingsView =
  | 'full'
  | 'clauses'
  | 'templates'
  | 'number-config'
  | 'library-publish';

type ClauseFormState = {
  code: string;
  title_vi: string;
  body_vi: string;
  clause_group: string;
  apply_to_packs: string[];
  mandatory: boolean;
  status: string;
};

const emptyClauseForm = (): ClauseFormState => ({
  code: '',
  title_vi: '',
  body_vi: '',
  clause_group: 'LEGAL_BASIS',
  apply_to_packs: ['GENERAL'],
  mandatory: false,
  status: 'draft',
});

export function ContractLegalPrintSettingsPanel({
  view = 'full',
}: {
  view?: ContractLegalSettingsView;
}) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;

  const [clauses, setClauses] = useState<HrmContractClauseRecord[]>([]);
  const [templates, setTemplates] = useState<HrmContractTemplateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clauseForm, setClauseForm] = useState<ClauseFormState>(emptyClauseForm);
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  /** Issued body PATCH CONFLICT — offer POST activate bump (BR-CTR-CL-01). */
  const [issuedConflictClauseId, setIssuedConflictClauseId] = useState<string | null>(null);
  const [activateBumpBusy, setActivateBumpBusy] = useState(false);

  const [tplCode, setTplCode] = useState('');
  const [tplName, setTplName] = useState('');
  const [tplPack, setTplPack] = useState<string>('GENERAL');
  const [tplStatus, setTplStatus] = useState('draft');
  const [tplTermType, setTplTermType] = useState<string>('');
  const [tplDurationDays, setTplDurationDays] = useState('');
  const [tplDurationMonths, setTplDurationMonths] = useState('');
  const [tplTitlePrint, setTplTitlePrint] = useState('');
  const [tplMatrixFamily, setTplMatrixFamily] = useState<string>('');
  const [editingTplId, setEditingTplId] = useState<string | null>(null);
  const [editingTplCompanyId, setEditingTplCompanyId] = useState<string | null>(null);
  const [saveTplBusy, setSaveTplBusy] = useState(false);
  const [canvasIds, setCanvasIds] = useState<string[]>([]);
  /** Optional API filter matrix=xevn — NOT a closed 8-code hardcode. */
  const [matrixXevnOnly, setMatrixXevnOnly] = useState(false);

  const [orgSuffix, setOrgSuffix] = useState('');
  const [numberPattern, setNumberPattern] = useState(CONTRACT_NUMBER_PATTERN_DEFAULT);
  const [cfgBusy, setCfgBusy] = useState(false);

  const [publishes, setPublishes] = useState<HrmContractLibraryPublishMeta[]>([]);
  const [publishLabel, setPublishLabel] = useState('');
  const [publishBusy, setPublishBusy] = useState(false);
  const [selectedPullVersion, setSelectedPullVersion] = useState<string>('');
  const [pullForce, setPullForce] = useState(false);
  const [pullBusy, setPullBusy] = useState(false);
  const [applyBusy, setApplyBusy] = useState(false);
  const [lastPullSummary, setLastPullSummary] = useState<string | null>(null);
  const [lastPullResult, setLastPullResult] = useState<HrmContractLibraryPullResult | null>(null);

  const isHoldingPartition = isContractLibraryHoldingPartition(companyId);

  const CUSTOM_GROUPS_STORAGE_KEY = 'xevn_contract_clause_custom_groups';

  const [customGroupMap, setCustomGroupMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_GROUPS_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });

  const saveCustomGroupMap = useCallback(
    (newMap: Record<string, string>) => {
      setCustomGroupMap(newMap);
      try {
        localStorage.setItem(CUSTOM_GROUPS_STORAGE_KEY, JSON.stringify(newMap));
      } catch {
        /* ignore storage error */
      }
      if (companyId) {
        void putContractCompanySetting({
          company_id: companyId,
          setting_key: 'contract_clause_custom_groups',
          value: newMap,
        }).catch(() => {});
      }
    },
    [companyId],
  );

  const customGroupKeys = useMemo(() => Object.keys(customGroupMap), [customGroupMap]);

  const allClauseGroupKeys = useMemo(() => {
    const set = new Set<string>([...CONTRACT_CLAUSE_GROUPS, ...customGroupKeys]);
    return Array.from(set);
  }, [customGroupKeys]);

  const getClauseGroupLabel = useCallback(
    (key: string) => {
      return (
        customGroupMap[key] ??
        CONTRACT_CLAUSE_GROUP_LABELS[key] ??
        clauseGroupLabelVi(key, customGroupMap)
      );
    },
    [customGroupMap],
  );

  const [clauseSearch, setClauseSearch] = useState('');
  const [clauseGroupFilter, setClauseGroupFilter] = useState<string>('__all__');
  const [clauseDialogOpen, setClauseDialogOpen] = useState(false);
  const [clausePage, setClausePage] = useState(1);

  const [tplSearch, setTplSearch] = useState('');
  const [tplPage, setTplPage] = useState(1);
  const [tplDialogOpen, setTplDialogOpen] = useState(false);

  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false);
  const [groupForm, setGroupForm] = useState<{ oldKey?: string; key: string; label: string }>({
    key: '',
    label: '',
  });

  const handleOpenAddGroup = useCallback(() => {
    setGroupForm({ key: '', label: '' });
    setAddGroupDialogOpen(true);
  }, []);

  const handleOpenEditGroup = useCallback((group: { key: string; label: string }) => {
    setGroupForm({ oldKey: group.key, key: group.key, label: group.label });
    setEditGroupDialogOpen(true);
  }, []);

  const handleSaveAddGroup = useCallback(() => {
    const rawKey = groupForm.key.trim().toUpperCase().replace(/\s+/g, '_');
    const rawLabel = groupForm.label.trim();
    if (!rawKey || !rawLabel) {
      toast({
        title: 'Thiếu thông tin nhóm',
        description: 'Vui lòng nhập đầy đủ Mã nhóm và Tên nhóm.',
        variant: 'destructive',
      });
      return;
    }
    const nextMap = { ...customGroupMap, [rawKey]: rawLabel };
    saveCustomGroupMap(nextMap);
    setAddGroupDialogOpen(false);
    setClauseGroupFilter(rawKey);
    toast({
      title: 'Đã thêm nhóm điều khoản',
      description: `Nhóm «${rawLabel}» (${rawKey}) đã được tạo.`,
    });
  }, [groupForm, customGroupMap, saveCustomGroupMap]);

  const handleSaveEditGroup = useCallback(() => {
    const oldKey = groupForm.oldKey;
    const newKey = groupForm.key.trim().toUpperCase().replace(/\s+/g, '_');
    const newLabel = groupForm.label.trim();
    if (!newKey || !newLabel) {
      toast({
        title: 'Thiếu thông tin nhóm',
        description: 'Vui lòng nhập đầy đủ Mã nhóm và Tên nhóm.',
        variant: 'destructive',
      });
      return;
    }

    const nextMap = { ...customGroupMap };
    if (oldKey && oldKey !== newKey) {
      delete nextMap[oldKey];
    }
    nextMap[newKey] = newLabel;

    saveCustomGroupMap(nextMap);

    if (oldKey && oldKey !== newKey && clauseGroupFilter === oldKey) {
      setClauseGroupFilter(newKey);
    }

    setEditGroupDialogOpen(false);
    toast({
      title: 'Đã cập nhật nhóm điều khoản',
      description: `Đã lưu nhóm «${newLabel}» (${newKey}).`,
    });
  }, [groupForm, customGroupMap, saveCustomGroupMap, clauseGroupFilter]);

  const filteredClauses = useMemo(
    () => filterClausesByGroupAndSearch(clauses, clauseGroupFilter, clauseSearch),
    [clauses, clauseSearch, clauseGroupFilter],
  );

  useEffect(() => {
    setClausePage(1);
  }, [clauseSearch, clauseGroupFilter]);

  const showIntro = view === 'full';
  const showCfg = view === 'full' || view === 'number-config';
  const showPublish = view === 'full' || view === 'library-publish';
  const showClausePane = view === 'full' || view === 'clauses';
  const showTemplatePane = view === 'full' || view === 'templates';
  const clausesDedicated = view === 'clauses';
  const templatesDedicated = view === 'templates';
  const clauseTableRows = clausesDedicated ? filteredClauses : clauses;
  const clausePaginated = useMemo(
    () => paginateCatalogRows(filteredClauses, clausePage, SETTINGS_CATALOG_PAGE_SIZE),
    [filteredClauses, clausePage],
  );
  const clauseListRows = clausesDedicated ? clausePaginated.slice : clauseTableRows;

  const filteredTemplates = useMemo(
    () =>
      filterCatalogByCodeOrName(
        templates,
        tplSearch,
        (t) => t.template_code || t.code,
        (t) => t.name_vi,
      ),
    [templates, tplSearch],
  );

  const tplPaginated = useMemo(
    () => paginateCatalogRows(filteredTemplates, tplPage, SETTINGS_CATALOG_PAGE_SIZE),
    [filteredTemplates, tplPage],
  );

  useEffect(() => {
    setTplPage(1);
  }, [tplSearch, matrixXevnOnly]);

  const loadPublishes = useCallback(async () => {
    if (!companyId) return;
    try {
      const pub = await listContractLibraryPublishes({ company_id: companyId });
      setPublishes(pub.items);
      setSelectedPullVersion((prev) => {
        if (prev) return prev;
        return pub.items.length > 0 ? String(pub.items[0].publish_version) : '';
      });
    } catch {
      setPublishes([]);
    }
  }, [companyId]);

  const loadCfg = useCallback(async () => {
    if (!companyId) return;
    try {
      const [suffixRow, patternRow, customGroupsRow] = await Promise.all([
        getContractCompanySetting({ company_id: companyId, key: CONTRACT_SETTING_ORG_SUFFIX }),
        getContractCompanySetting({
          company_id: companyId,
          key: CONTRACT_SETTING_NUMBER_PATTERN,
        }),
        getContractCompanySetting({
          company_id: companyId,
          key: 'contract_clause_custom_groups',
        }).catch(() => null),
      ]);
      setOrgSuffix(parseOrgSuffixValue(suffixRow?.value));
      const pat = parseNumberPatternValue(patternRow?.value);
      setNumberPattern(pat || CONTRACT_NUMBER_PATTERN_DEFAULT);
      if (customGroupsRow?.value && typeof customGroupsRow.value === 'object') {
        setCustomGroupMap((prev) => ({
          ...prev,
          ...(customGroupsRow.value as Record<string, string>),
        }));
      }
    } catch {
      /* CFG optional until BE — honest empty */
      setOrgSuffix('');
      setNumberPattern(CONTRACT_NUMBER_PATTERN_DEFAULT);
    }
  }, [companyId]);

  const loadAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const [c, t] = await Promise.all([
        listContractClauses({ company_id: companyId }),
        listContractTemplates({
          company_id: companyId,
          ...(matrixXevnOnly ? { matrix: 'xevn' } : {}),
        }),
      ]);
      setClauses(c.items);
      setTemplates(t.items);
      await Promise.all([loadPublishes(), loadCfg()]);
    } catch (err: unknown) {
      setError(
        toErrorMessage(
          err,
          'Chưa tải được thư viện điều khoản / mẫu HĐ. API contract-clauses|templates có thể chưa sẵn sàng (BE song song).',
        ),
      );
      setClauses([]);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, loadPublishes, loadCfg, matrixXevnOnly]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const missingStarters = useMemo(
    () => missingStarterTemplateCodes(templates.map((t) => t.code)),
    [templates],
  );

  const clauseById = useMemo(() => {
    const m = new Map<string, HrmContractClauseRecord>();
    for (const c of clauses) m.set(c.id, c);
    return m;
  }, [clauses]);

  const paletteClauses = useMemo(
    () =>
      filterClausesForPack(clauses, tplPack).filter(
        (c) => !canvasIds.includes(c.id) && c.status !== 'retired',
      ),
    [clauses, tplPack, canvasIds],
  );

  const togglePack = (pack: string, checked: boolean) => {
    setClauseForm((prev) => {
      const set = new Set(prev.apply_to_packs);
      if (checked) set.add(pack);
      else set.delete(pack);
      const next = [...set];
      return { ...prev, apply_to_packs: next.length ? next : ['GENERAL'] };
    });
  };

  const onSaveClause = async () => {
    if (!companyId) return;
    if (!clauseForm.code.trim() || !clauseForm.title_vi.trim() || !clauseForm.body_vi.trim()) {
      toast({
        title: 'Thiếu mã / tiêu đề / nội dung',
        description: 'Điều khoản cần đủ code, title_vi, body_vi.',
        variant: 'destructive',
      });
      return;
    }
    const placeholderErr = validateClausePlaceholderSyntax(clauseForm.body_vi);
    if (placeholderErr) {
      toast({
        title: 'Cú pháp chỗ điền không hợp lệ',
        description: placeholderErr,
        variant: 'destructive',
      });
      return;
    }
    try {
      if (editingClauseId) {
        // Draft / not-issued: in-place PATCH — omit status invent (activate/retire endpoints).
        await updateContractClause(editingClauseId, companyId, {
          title_vi: clauseForm.title_vi.trim(),
          body_vi: clauseForm.body_vi.trim(),
          clause_group: clauseForm.clause_group,
          apply_to_packs: clauseForm.apply_to_packs,
          mandatory: clauseForm.mandatory,
        });
        setIssuedConflictClauseId(null);
        toast({
          title: 'Đã cập nhật điều khoản',
          description: 'Làm mới / F5 để xác nhận nội dung còn trên list (draft in-place).',
        });
      } else {
        // Create always Nháp — Hiệu lực via POST …/activate (AC-CORE-09A-01..03).
        await createContractClause({
          company_id: companyId,
          code: clauseForm.code.trim(),
          title_vi: clauseForm.title_vi.trim(),
          body_vi: clauseForm.body_vi.trim(),
          clause_group: clauseForm.clause_group,
          apply_to_packs: clauseForm.apply_to_packs,
          mandatory: clauseForm.mandatory,
          status: 'draft',
          sort_order: clauses.length,
        });
        setIssuedConflictClauseId(null);
        toast({
          title: 'Đã tạo điều khoản (Nháp)',
          description: 'Làm mới / F5 để xác nhận còn trên list. Dùng Hiệu lực để kích hoạt.',
        });
      }
      setClauseForm(emptyClauseForm());
      setEditingClauseId(null);
      setClauseDialogOpen(false);
      await loadAll();
    } catch (err: unknown) {
      if (editingClauseId && isCtrClCodeConflict(err)) {
        setIssuedConflictClauseId(editingClauseId);
        toast({
          title: 'Không ghi đè điều khoản đã phát hành',
          description: toErrorMessage(
            err,
            'Bấm «Tăng phiên bản» để tạo bản mới. Hợp đồng cũ vẫn giữ nguyên nội dung điều khoản tại thời điểm ký.',
          ),
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Không lưu được điều khoản',
        description: toErrorMessage(err, 'Kiểm tra API BE hoặc trùng mã active.'),
        variant: 'destructive',
      });
    }
  };

  const onEditClause = (c: HrmContractClauseRecord) => {
    setIssuedConflictClauseId(null);
    setEditingClauseId(c.id);
    setClauseForm({
      code: c.code,
      title_vi: c.title_vi,
      body_vi: c.body_vi,
      clause_group: c.clause_group,
      apply_to_packs: c.apply_to_packs?.length ? [...c.apply_to_packs] : ['GENERAL'],
      mandatory: Boolean(c.mandatory),
      status: c.status || 'draft',
    });
    if (clausesDedicated) setClauseDialogOpen(true);
  };

  const openNewClauseDialog = () => {
    setIssuedConflictClauseId(null);
    setEditingClauseId(null);
    const base = emptyClauseForm();
    setClauseForm({
      ...base,
      clause_group: clauseGroupFilter !== '__all__' ? clauseGroupFilter : base.clause_group,
    });
    setClauseDialogOpen(true);
  };

  const onActivateClause = async (id: string, opts?: { fromConflictBump?: boolean }) => {
    if (!companyId) return;
    if (opts?.fromConflictBump) setActivateBumpBusy(true);
    try {
      const row = await activateContractClause(id, companyId);
      setIssuedConflictClauseId(null);
      toast({
        title: opts?.fromConflictBump
          ? 'Đã tăng phiên bản (activate bump)'
          : 'Đã đưa điều khoản sang hiệu lực',
        description:
          row?.version != null
            ? `Phiên bản thư viện: v${row.version}. HĐ đã phát hành giữ snapshot cũ.`
            : 'HĐ đã phát hành giữ snapshot cũ (clauses_snapshot_json bất biến).',
      });
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Không kích hoạt được',
        description: toErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      if (opts?.fromConflictBump) setActivateBumpBusy(false);
    }
  };

  const onRetireClause = async (id: string) => {
    if (!companyId) return;
    try {
      await retireContractClause(id, companyId);
      if (issuedConflictClauseId === id) setIssuedConflictClauseId(null);
      toast({
        title: 'Đã ngừng dùng điều khoản',
        description: 'Soft retire — snapshot HĐ đã phát hành vẫn đọc được.',
      });
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Không ngừng dùng được',
        description: toErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  const loadTemplateOntoCanvas = (tpl: HrmContractTemplateRecord) => {
    setEditingTplId(tpl.id);
    setEditingTplCompanyId(tpl.company_id || null);
    setTplCode(tpl.code);
    setTplName(tpl.name_vi);
    setTplPack(tpl.pack_code || 'GENERAL');
    setTplStatus(tpl.status || 'draft');
    setTplTermType(tpl.default_term_type ?? '');
    setTplDurationDays(
      tpl.default_duration_days != null && Number.isFinite(Number(tpl.default_duration_days))
        ? String(tpl.default_duration_days)
        : '',
    );
    setTplDurationMonths(
      tpl.default_duration_months != null && Number.isFinite(Number(tpl.default_duration_months))
        ? String(tpl.default_duration_months)
        : '',
    );
    setTplTitlePrint(tpl.title_print_vi ?? '');
    setTplMatrixFamily(tpl.matrix_family ?? '');
    setCanvasIds(clauseIdsFromTemplate(tpl));
    if (templatesDedicated) setTplDialogOpen(true);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === 'ctr-canvas' && destination.droppableId === 'ctr-canvas') {
      setCanvasIds((prev) => reorderByIndex(prev, source.index, destination.index));
      return;
    }

    if (source.droppableId === 'ctr-palette' && destination.droppableId === 'ctr-canvas') {
      const clauseId = draggableId.startsWith('pal-') ? draggableId.slice(4) : draggableId;
      setCanvasIds((prev) => placeClauseOnCanvas(prev, clauseId, destination.index));
    }
  };

  const onSaveTemplate = async () => {
    if (!companyId) return;
    if (!tplCode.trim() || !tplName.trim()) {
      toast({ title: 'Thiếu mã hoặc tên mẫu', variant: 'destructive' });
      return;
    }
    const codeNorm = normalizeTemplateCode(tplCode);
    if (!editingTplId && !isValidTemplateCodeFormat(codeNorm)) {
      toast({
        title: 'Mã mẫu không đúng định dạng',
        description: 'Bắt đầu bằng chữ cái; chỉ A-Z, 0-9, _ , - (2–64 ký tự). Không bị giới hạn 8 mẫu starter.',
        variant: 'destructive',
      });
      return;
    }
    const durationDaysRaw = tplDurationDays.trim();
    const durationMonthsRaw = tplDurationMonths.trim();
    const default_duration_days =
      durationDaysRaw === ''
        ? null
        : Number.isFinite(Number(durationDaysRaw))
          ? Number(durationDaysRaw)
          : null;
    const default_duration_months =
      durationMonthsRaw === ''
        ? null
        : Number.isFinite(Number(durationMonthsRaw))
          ? Number(durationMonthsRaw)
          : null;
    const { layout_json, clause_ids } = buildTemplateClauseBindPayload(canvasIds);
    const matrixPayload =
      tplMatrixFamily === 'XEVN_MATRIX' || tplMatrixFamily === 'LEGACY'
        ? tplMatrixFamily
        : tplMatrixFamily === ''
          ? null
          : tplMatrixFamily;

    if (matrixPayload === 'XEVN_MATRIX') {
      if (!tplTermType) {
        toast({
          title: 'Thiếu loại thời hạn mặc định',
          description: 'Mẫu ma trận X.E yêu cầu chọn Loại thời hạn mặc định (Thử việc / Xác định / Không xác định).',
          variant: 'destructive',
        });
        return;
      }
      if (tplPack !== 'IT_OFFICE' && tplPack !== 'DRIVER') {
        toast({
          title: 'Gói nghề không tương thích',
          description: 'Mẫu ma trận X.E yêu cầu Gói nghề là Hành chính (IT_OFFICE) hoặc Lái xe (DRIVER).',
          variant: 'destructive',
        });
        return;
      }
    }

    const expandFields = {
      default_term_type: tplTermType || null,
      default_duration_days,
      default_duration_months,
      title_print_vi: tplTitlePrint.trim() || null,
      matrix_family: matrixPayload,
    };
    const targetCompanyId = editingTplCompanyId || companyId;

    setSaveTplBusy(true);
    try {
      if (editingTplId) {
        await updateContractTemplate(editingTplId, {
          company_id: targetCompanyId,
          name_vi: tplName.trim(),
          pack_code: tplPack,
          layout_json,
          status: tplStatus,
          ...expandFields,
        });
        await syncContractTemplateClauseBind(editingTplId, targetCompanyId, clause_ids);
        toast({
          title: 'Đã lưu mẫu HĐ',
          description: `Đã áp dụng ${clause_ids.length} điều khoản cho mẫu.`,
        });
      } else {
        const created = await createContractTemplate({
          company_id: targetCompanyId,
          code: codeNorm,
          name_vi: tplName.trim(),
          pack_code: tplPack,
          layout_json,
          keyword_map: {},
          status: tplStatus,
          ...expandFields,
        });
        await syncContractTemplateClauseBind(created.id, targetCompanyId, clause_ids);
        setEditingTplId(created.id);
        setEditingTplCompanyId(created.company_id || targetCompanyId);
        setTplCode(created.template_code || created.code || codeNorm);
        toast({
          title: 'Đã tạo mẫu HĐ',
          description: 'Mẫu #9+ open catalog (201) — F5 / Làm mới · PUT clauses đã bind.',
        });
      }
      await loadAll();
      if (tplDialogOpen) {
        closeTemplateDialog();
      }
    } catch (err: unknown) {
      toast({
        title: 'Không lưu được mẫu',
        description: toErrorMessage(err, 'API contract-templates chưa sẵn sàng hoặc lỗi validate.'),
        variant: 'destructive',
      });
    } finally {
      setSaveTplBusy(false);
    }
  };

  const onActivateTemplate = async () => {
    if (!companyId || !editingTplId) return;
    const targetCompanyId = editingTplCompanyId || companyId;
    setSaveTplBusy(true);
    try {
      const { layout_json, clause_ids } = buildTemplateClauseBindPayload(canvasIds);
      await updateContractTemplate(editingTplId, {
        company_id: targetCompanyId,
        layout_json,
      });
      await syncContractTemplateClauseBind(editingTplId, targetCompanyId, clause_ids);
      await activateContractTemplate(editingTplId, targetCompanyId);
      toast({ title: 'Mẫu đã active — sẵn sàng gắn HĐ' });
      await loadAll();
      if (tplDialogOpen) {
        closeTemplateDialog();
      }
    } catch (err: unknown) {
      toast({
        title: 'Không kích hoạt mẫu',
        description: toErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setSaveTplBusy(false);
    }
  };

  const resetTemplateComposer = () => {
    setEditingTplId(null);
    setEditingTplCompanyId(null);
    setTplCode('');
    setTplName('');
    setTplPack('GENERAL');
    setTplStatus('draft');
    setTplTermType('');
    setTplDurationDays('');
    setTplDurationMonths('');
    setTplTitlePrint('');
    setTplMatrixFamily('');
    setCanvasIds([]);
  };

  const openNewTemplateDialog = () => {
    resetTemplateComposer();
    setTplDialogOpen(true);
  };

  const closeTemplateDialog = () => {
    setTplDialogOpen(false);
    resetTemplateComposer();
  };

  const onSaveCfg = async () => {
    if (!companyId) return;
    setCfgBusy(true);
    try {
      await Promise.all([
        putContractCompanySetting({
          company_id: companyId,
          setting_key: CONTRACT_SETTING_ORG_SUFFIX,
          value: buildOrgSuffixSettingValue(orgSuffix),
        }),
        putContractCompanySetting({
          company_id: companyId,
          setting_key: CONTRACT_SETTING_NUMBER_PATTERN,
          value: buildNumberPatternSettingValue(numberPattern),
        }),
      ]);
      toast({
        title: 'Đã lưu cấu hình số HĐ',
        description: 'org_suffix / pattern — F5 còn giá trị (CFG-01).',
      });
      await loadCfg();
    } catch (err: unknown) {
      toast({
        title: 'Không lưu được CFG số HĐ',
        description: toErrorMessage(err, 'API company-settings chưa sẵn sàng.'),
        variant: 'destructive',
      });
    } finally {
      setCfgBusy(false);
    }
  };

  const onPublishLibrary = async () => {
    if (!companyId || !isHoldingPartition) return;
    setPublishBusy(true);
    try {
      const result = await publishContractLibrary({
        company_id: companyId,
        label_vi: publishLabel.trim() || undefined,
      });
      toast({
        title: `Đã phát hành phiên bản ${result.publish_version}`,
        description: `${result.template_count} mẫu · ${result.clause_count} điều khoản · checksum ${result.checksum.slice(0, 12)}…`,
      });
      setPublishLabel('');
      await loadPublishes();
    } catch (err: unknown) {
      toast({
        title: 'Không phát hành được',
        description: toErrorMessage(err, 'Kiểm tra quyền tập đoàn và TPL/CL hiệu lực tại holding.'),
        variant: 'destructive',
      });
    } finally {
      setPublishBusy(false);
    }
  };

  const onPullLibrary = async () => {
    if (!companyId || isHoldingPartition) return;
    setPullBusy(true);
    setLastPullSummary(null);
    setLastPullResult(null);
    try {
      const versionNum = selectedPullVersion ? Number(selectedPullVersion) : undefined;
      const result = await pullContractLibrary({
        company_id: companyId,
        publish_version: Number.isFinite(versionNum) && (versionNum as number) >= 1 ? versionNum : undefined,
        force: pullForce || undefined,
      });
      const skipN = result.skipped_override?.length ?? 0;
      const conflictN = result.conflicts?.length ?? 0;
      const upsertN = result.upserted?.length ?? 0;
      const summaryParts = [
        `v${result.publish_version}`,
        `đã kéo ${upsertN}`,
        skipN > 0 ? `bỏ qua ghi đè ${skipN}` : null,
        conflictN > 0 ? `xung đột ${conflictN}` : null,
      ].filter(Boolean);
      setLastPullSummary(summaryParts.join(' · '));
      setLastPullResult(result);
      if (conflictN > 0) {
        toast({
          title: 'Đã kéo — có xung đột mã nội bộ',
          description: `conflicts: ${result.conflicts.slice(0, 8).join(', ')}${
            conflictN > 8 ? '…' : ''
          }. Đổi mã nội bộ hoặc bỏ lineage xung đột.`,
          variant: 'destructive',
        });
      } else if (skipN > 0) {
        toast({
          title: 'Đã kéo — có dòng ghi đè bị bỏ qua',
          description: `skipped_override: ${result.skipped_override.slice(0, 8).join(', ')}${
            skipN > 8 ? '…' : ''
          }. Bật «Ép ghi đè» nếu cần.`,
        });
      } else {
        toast({
          title: 'Đã kéo gói tập đoàn (nháp)',
          description: `${upsertN} lineage — chưa kích hoạt. Bấm Áp dụng để dùng local.`,
        });
      }
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Không kéo được gói',
        description: toErrorMessage(err, 'CODE-CONFLICT hoặc phiên bản không tồn tại.'),
        variant: 'destructive',
      });
    } finally {
      setPullBusy(false);
    }
  };

  const onApplyLibrary = async () => {
    if (!companyId || isHoldingPartition) return;
    setApplyBusy(true);
    try {
      const versionNum = selectedPullVersion ? Number(selectedPullVersion) : undefined;
      const result = await applyContractLibrary({
        company_id: companyId,
        publish_version: Number.isFinite(versionNum) && (versionNum as number) >= 1 ? versionNum : undefined,
      });
      const miss = result.missing_mandatory?.length ?? 0;
      toast({
        title: `Đã áp dụng v${result.publish_version}`,
        description: `${result.activated_templates} mẫu · ${result.activated_clauses} điều khoản${
          miss > 0 ? ` · cảnh báo thiếu bắt buộc ${miss}` : ''
        }. Phiên bản in cũ không đổi.`,
      });
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Không áp dụng được',
        description: toErrorMessage(err, 'Kéo gói trước khi Áp dụng (NOTHING-TO-APPLY).'),
        variant: 'destructive',
      });
    } finally {
      setApplyBusy(false);
    }
  };

  /** PAT-CTR-TEMPLATE-COMPOSER-01 — shared fields + palette + canvas + actions (Card or Dialog). */
  const renderTemplateComposerInner = (inDialog: boolean) => {
    const TplSelect = inDialog ? SettingsDialogSelectContent : SelectContent;
    const tplSelectPortal = inDialog ? undefined : ({ portalScope: 'iframe' as const });

    return (
      <>
        {!templatesDedicated ? (
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-sm">
              <Checkbox
                checked={matrixXevnOnly}
                onCheckedChange={(v) => setMatrixXevnOnly(v === true)}
                data-testid="ctr-tpl-matrix-xevn-filter"
              />
              Lọc list matrix=xevn (ma trận X.E — không giới hạn 8 mã)
            </label>
          </div>
        ) : null}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 space-y-1 sm:col-span-3">
            <Label>Mã mẫu *</Label>
            <Input
              data-testid="ctr-tpl-code"
              value={tplCode}
              disabled={Boolean(editingTplId)}
              onChange={(e) => setTplCode(e.target.value)}
              placeholder="VD. XEVN_CUSTOM_OFFICE_01"
            />
          </div>
          <div className="col-span-12 space-y-1 sm:col-span-4">
            <Label>Tên *</Label>
            <Input
              data-testid="ctr-tpl-name"
              value={tplName}
              onChange={(e) => setTplName(e.target.value)}
            />
          </div>
          <div className="col-span-6 space-y-1 sm:col-span-3">
            <Label>Gói nghề</Label>
            <Select value={tplPack} onValueChange={setTplPack}>
              <SelectTrigger data-testid="ctr-tpl-pack">
                <SelectValue />
              </SelectTrigger>
              <TplSelect {...tplSelectPortal}>
                {CONTRACT_PACK_CODES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {CONTRACT_PACK_LABELS[p]}
                  </SelectItem>
                ))}
              </TplSelect>
            </Select>
          </div>
          <div className="col-span-6 space-y-1 sm:col-span-2">
            <Label>TT</Label>
            <Select value={tplStatus} onValueChange={setTplStatus}>
              <SelectTrigger data-testid="ctr-tpl-status">
                <SelectValue />
              </SelectTrigger>
              <TplSelect {...tplSelectPortal}>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="active">Hiệu lực</SelectItem>
                <SelectItem value="retired">Ngừng</SelectItem>
              </TplSelect>
            </Select>
          </div>
          <div className="col-span-12 space-y-1 sm:col-span-4">
            <Label>Tiêu đề in (title_print_vi)</Label>
            <Input
              data-testid="ctr-tpl-title-print"
              value={tplTitlePrint}
              onChange={(e) => setTplTitlePrint(e.target.value)}
              placeholder="VD. HỢP ĐỒNG LAO ĐỘNG"
            />
          </div>
          <div className="col-span-6 space-y-1 sm:col-span-3">
            <Label>Loại thời hạn mặc định</Label>
            <Select
              value={tplTermType || '__none__'}
              onValueChange={(v) => setTplTermType(v === '__none__' ? '' : v)}
            >
              <SelectTrigger data-testid="ctr-tpl-term-type">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <TplSelect {...tplSelectPortal}>
                {CONTRACT_TERM_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {CONTRACT_TERM_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </TplSelect>
            </Select>
          </div>
          <div className="col-span-3 space-y-1 sm:col-span-2">
            <Label>Ngày (TV)</Label>
            <Input
              data-testid="ctr-tpl-duration-days"
              inputMode="numeric"
              value={tplDurationDays}
              onChange={(e) => setTplDurationDays(e.target.value)}
              placeholder="60"
            />
          </div>
          <div className="col-span-3 space-y-1 sm:col-span-1">
            <Label>Tháng</Label>
            <Select
              value={tplDurationMonths || '__none__'}
              onValueChange={(v) => setTplDurationMonths(v === '__none__' ? '' : v)}
            >
              <SelectTrigger data-testid="ctr-tpl-duration-months">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <TplSelect {...tplSelectPortal}>
                <SelectItem value="__none__">—</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
              </TplSelect>
            </Select>
          </div>
          <div className="col-span-12 space-y-1 sm:col-span-2">
            <Label>Ma trận</Label>
            <Select
              value={tplMatrixFamily || '__none__'}
              onValueChange={(v) => setTplMatrixFamily(v === '__none__' ? '' : v)}
            >
              <SelectTrigger data-testid="ctr-tpl-matrix-family">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <TplSelect {...tplSelectPortal}>
                <SelectItem value="__none__">—</SelectItem>
                {CONTRACT_MATRIX_FAMILIES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {CONTRACT_MATRIX_FAMILY_LABELS[m]}
                  </SelectItem>
                ))}
              </TplSelect>
            </Select>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 space-y-2 md:col-span-4">
              <p className="text-sm font-medium">Thư viện (theo pack)</p>
              <Droppable droppableId="ctr-palette" isDropDisabled>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[140px] space-y-2 rounded-lg border border-dashed border-border/70 bg-slate-50/80 p-2"
                    data-testid="ctr-tpl-palette"
                  >
                    {paletteClauses.length === 0 ? (
                      <p className="p-2 text-xs text-muted-foreground">
                        Không còn clause cho pack này — tạo ở tab Điều khoản.
                      </p>
                    ) : (
                      paletteClauses.map((c, index) => (
                        <Draggable key={c.id} draggableId={`pal-${c.id}`} index={index}>
                          {(drag) => {
                            const bind = sameNodeDragBind(drag);
                            return (
                              <div
                                ref={bind.ref}
                                {...bind.props}
                                className="flex cursor-grab items-center justify-between rounded-md border border-border bg-surface px-2 py-1.5 text-xs shadow-soft active:cursor-grabbing hover:border-primary/50"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <GripVertical
                                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                                    aria-hidden
                                  />
                                  <span className="truncate">
                                    {c.title_vi}
                                    <span className="ml-1 font-mono text-[10px] text-muted-foreground">
                                      {c.code}
                                    </span>
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
                                  title="Bấm nút + để thêm điều khoản vào mẫu"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCanvasIds((prev) => placeClauseOnCanvas(prev, c.id, prev.length));
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            );
                          }}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            <div className="col-span-12 space-y-2 md:col-span-8">
              <p className="text-sm font-medium">Canvas mẫu ({canvasIds.length})</p>
              <Droppable droppableId="ctr-canvas">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[200px] space-y-2 rounded-lg border border-border/60 bg-surface p-3"
                    data-testid="ctr-tpl-canvas"
                  >
                    {canvasIds.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Kéo điều khoản từ thư viện vào đây.
                      </p>
                    ) : (
                      canvasIds.map((id, index) => {
                        const c = clauseById.get(id);
                        return (
                          <Draggable key={id} draggableId={`canvas-${id}`} index={index}>
                            {(drag) => {
                              const bind = sameNodeDragBind(drag);
                              return (
                                <div
                                  ref={bind.ref}
                                  {...bind.props}
                                  className="flex cursor-grab items-center gap-2 rounded-md border border-border/50 bg-white px-2 py-2 text-sm shadow-soft active:cursor-grabbing"
                                  data-testid={`ctr-tpl-canvas-item-${id}`}
                                >
                                  <GripVertical
                                    className="h-4 w-4 shrink-0 text-muted-foreground"
                                    aria-hidden
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{c?.title_vi ?? id}</p>
                                    <p className="truncate text-[10px] text-muted-foreground">
                                      {c
                                        ? `${CONTRACT_CLAUSE_GROUP_LABELS[c.clause_group] ?? c.clause_group} · ${c.code}`
                                        : 'Clause không còn trong thư viện'}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 shrink-0"
                                    aria-label="Gỡ khỏi mẫu"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCanvasIds((prev) => removeClauseFromCanvas(prev, id));
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              );
                            }}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={saveTplBusy}
            onClick={() => void onSaveTemplate()}
            data-testid="ctr-tpl-save"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saveTplBusy ? 'Đang lưu…' : 'Lưu mẫu'}
          </Button>
          {editingTplId ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={saveTplBusy}
              onClick={() => void onActivateTemplate()}
              data-testid="ctr-tpl-activate"
            >
              {saveTplBusy ? 'Đang kích hoạt…' : 'Đưa sang hiệu lực'}
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={resetTemplateComposer} disabled={saveTplBusy}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Mẫu mới
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-4" data-testid="settings-contract-legal-print">
      {showIntro ? (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Thư viện điều khoản &amp; mẫu hợp đồng
          </CardTitle>
          <CardDescription>
            Cấu hình điều khoản tiếng Việt (gồm căn cứ pháp lý) và kéo-thả vào mẫu theo gói nghề.
            Lương/C&amp;B không soạn trên body HĐ — merge từ gói đãi ngộ khi in.
            {!CONTRACTS_PRINTABLE_READY ? null /* honesty-slot: no-op banner */ : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadAll()}
            disabled={loading || !companyId}
            data-testid="ctr-legal-refresh"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          {error ? (
            <p className="w-full text-sm text-destructive" data-testid="ctr-legal-load-error">
              {error}
            </p>
          ) : null}
          {!error && !loading && clauses.length === 0 && templates.length === 0 ? (
            <p className="w-full text-sm text-muted-foreground" data-testid="ctr-legal-empty">
              Chưa có điều khoản / mẫu (empty hợp lệ — U65 không seed). Tạo clause rồi kéo vào mẫu.
            </p>
          ) : null}
          {!error && !loading && !matrixXevnOnly && missingStarters.length > 0 ? (
            <p
              className="w-full text-sm text-amber-800"
              data-testid="ctr-tpl-missing-starters-warn"
            >
              Soft warn (không chặn tạo #9+): thiếu {missingStarters.length}/8 mẫu starter X.E trên
              catalog hiện tại
              {missingStarters.length <= 3
                ? ` (${missingStarters.join(', ')})`
                : ` (vd. ${missingStarters.slice(0, 2).join(', ')}…)`}
              . Bootstrap BE optional — HR vẫn CRUD thêm mã tùy ý.
            </p>
          ) : null}
        </CardContent>
      </Card>
      ) : null}

      {showCfg ? (
      <Card data-testid="ctr-company-settings-cfg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cấu hình số hợp đồng (CFG-01)</CardTitle>
          <CardDescription>
            Hậu tố tổ chức + pattern số HĐ theo đơn vị — không hardcode Visun/DLX.E trên FE. Token:{' '}
            {'{seq}'}, {'{yyyy}'}, {'{docKind}'}, {'{orgSuffix}'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-12 gap-3">
          <div className="col-span-12 space-y-1 sm:col-span-4">
            <Label htmlFor="ctr-cfg-org-suffix">Hậu tố tổ chức (org_suffix)</Label>
            <Input
              id="ctr-cfg-org-suffix"
              data-testid="ctr-cfg-org-suffix"
              value={orgSuffix}
              onChange={(e) => setOrgSuffix(e.target.value)}
              placeholder="VD. X.E"
            />
          </div>
          <div className="col-span-12 space-y-1 sm:col-span-6">
            <Label htmlFor="ctr-cfg-number-pattern">Pattern số HĐ</Label>
            <Input
              id="ctr-cfg-number-pattern"
              data-testid="ctr-cfg-number-pattern"
              value={numberPattern}
              onChange={(e) => setNumberPattern(e.target.value)}
              placeholder={CONTRACT_NUMBER_PATTERN_DEFAULT}
            />
          </div>
          <div className="col-span-12 flex items-end sm:col-span-2">
            <Button
              type="button"
              size="sm"
              disabled={cfgBusy || !companyId}
              onClick={() => void onSaveCfg()}
              data-testid="ctr-cfg-save"
            >
              {cfgBusy ? 'Đang lưu…' : 'Lưu CFG'}
            </Button>
          </div>
        </CardContent>
      </Card>
      ) : null}

      {showPublish ? (
      <Card data-testid="ctr-library-publish-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Phát hành thư viện tập đoàn</CardTitle>
          <CardDescription>
            Holding đóng băng TPL/CL hiệu lực → phiên bản bất biến. Thành viên kéo nháp rồi áp dụng local
            (pull ≠ apply). Không ghi qua synced_catalogs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isHoldingPartition ? (
            <div className="flex flex-wrap items-end gap-2" data-testid="ctr-library-publish-holding">
              <div className="min-w-[200px] flex-1 space-y-1">
                <Label htmlFor="ctr-publish-label">Ghi chú phát hành</Label>
                <Input
                  id="ctr-publish-label"
                  data-testid="ctr-library-publish-label"
                  value={publishLabel}
                  onChange={(e) => setPublishLabel(e.target.value)}
                  placeholder="VD. Gói pháp lý tháng 8/2026"
                />
              </div>
              <Button
                type="button"
                size="sm"
                disabled={publishBusy || !companyId}
                onClick={() => void onPublishLibrary()}
                data-testid="ctr-library-publish-btn"
              >
                {publishBusy ? 'Đang phát hành…' : 'Phát hành'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3" data-testid="ctr-library-pull-member">
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[160px] space-y-1">
                  <Label>Phiên bản</Label>
                  <Select value={selectedPullVersion || undefined} onValueChange={setSelectedPullVersion}>
                    <SelectTrigger data-testid="ctr-library-pull-version">
                      <SelectValue placeholder="Chọn phiên bản" />
                    </SelectTrigger>
                    <SelectContent portalScope="iframe">
                      {publishes.length === 0 ? (
                        <SelectItem value="__empty" disabled>
                          Chưa có phiên bản
                        </SelectItem>
                      ) : (
                        publishes.map((p) => (
                          <SelectItem key={p.id} value={String(p.publish_version)}>
                            v{p.publish_version}
                            {p.label_vi ? ` — ${p.label_vi}` : ''} ({p.template_count}T/{p.clause_count}
                            CL)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <label className="mb-1 flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={pullForce}
                    onCheckedChange={(v) => setPullForce(v === true)}
                    data-testid="ctr-library-pull-force"
                  />
                  Ép ghi đè (member_override)
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={pullBusy || !companyId || publishes.length === 0}
                  onClick={() => void onPullLibrary()}
                  data-testid="ctr-library-pull-btn"
                >
                  {pullBusy ? 'Đang kéo…' : 'Kéo gói'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={applyBusy || !companyId}
                  onClick={() => void onApplyLibrary()}
                  data-testid="ctr-library-apply-btn"
                >
                  {applyBusy ? 'Đang áp dụng…' : 'Áp dụng gói tập đoàn'}
                </Button>
              </div>
              {lastPullSummary ? (
                <p className="text-xs text-muted-foreground" data-testid="ctr-library-pull-summary">
                  Kết quả kéo: {lastPullSummary}
                </p>
              ) : null}
              {lastPullResult &&
              ((lastPullResult.skipped_override?.length ?? 0) > 0 ||
                (lastPullResult.conflicts?.length ?? 0) > 0) ? (
                <div
                  className="space-y-1 rounded-md border border-border/60 bg-muted/30 p-2 text-xs"
                  data-testid="ctr-library-pull-result-detail"
                >
                  {(lastPullResult.skipped_override?.length ?? 0) > 0 ? (
                    <p data-testid="ctr-library-pull-skipped">
                      <span className="font-medium">skipped_override:</span>{' '}
                      {lastPullResult.skipped_override.join(', ')}
                    </p>
                  ) : null}
                  {(lastPullResult.conflicts?.length ?? 0) > 0 ? (
                    <p className="text-destructive" data-testid="ctr-library-pull-conflicts">
                      <span className="font-medium">conflicts:</span>{' '}
                      {lastPullResult.conflicts.join(', ')}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}

          <div className="rounded-md border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ver</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>TPL/CL</TableHead>
                  <TableHead>Checksum</TableHead>
                  <TableHead>TT</TableHead>
                  <TableHead>Lúc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-muted-foreground" data-testid="ctr-library-publishes-empty">
                      Chưa có phiên bản phát hành (empty hợp lệ — U65).
                    </TableCell>
                  </TableRow>
                ) : (
                  publishes.map((p) => (
                    <TableRow key={p.id} data-testid={`ctr-library-publish-row-${p.publish_version}`}>
                      <TableCell className="font-mono text-xs">v{p.publish_version}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs">
                        {p.label_vi || '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {p.template_count}/{p.clause_count}
                      </TableCell>
                      <TableCell className="max-w-[100px] truncate font-mono text-[10px]">
                        {p.checksum}
                      </TableCell>
                      <TableCell className="text-xs">{p.status}</TableCell>
                      <TableCell className="text-xs">
                        {p.published_at
                          ? new Date(p.published_at).toLocaleString('vi-VN')
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      ) : null}

      {(showClausePane || showTemplatePane) ? (
      <Tabs
        defaultValue={showTemplatePane && !showClausePane ? 'templates' : 'clauses'}
        className="space-y-3"
      >
        {showClausePane && showTemplatePane ? (
        <TabsList>
          <TabsTrigger value="clauses" data-testid="ctr-legal-tab-clauses">
            Điều khoản
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="ctr-legal-tab-templates">
            Mẫu theo loại (DnD)
          </TabsTrigger>
        </TabsList>
        ) : null}

        <TabsContent value="clauses" className="space-y-4" forceMount={showClausePane ? true : undefined}>
          {showClausePane ? (
          <>
          {clausesDedicated ? (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-3">
                <ContractClauseGroupNav
                  clauses={clauses}
                  selected={clauseGroupFilter}
                  onSelect={setClauseGroupFilter}
                  customGroupLabels={customGroupMap}
                  customGroupKeys={customGroupKeys}
                  onAddGroup={handleOpenAddGroup}
                  onEditGroup={handleOpenEditGroup}
                />
              </div>
              <div className="col-span-12 lg:col-span-9">
            <SettingsCatalogScreenShell
              compact
              title="Điều khoản hợp đồng"
              description="Chọn nhóm bên trái để xem danh sách — tìm theo mã hoặc tiêu đề; thêm/sửa qua hộp thoại."
              testId="settings-contract-clauses"
              searchValue={clauseSearch}
              onSearchChange={setClauseSearch}
              onRefresh={() => void loadAll()}
              refreshing={loading}
              onAdd={openNewClauseDialog}
              addLabel="Thêm điều khoản"
              honestySlot={
                !CONTRACTS_PRINTABLE_READY ? null /* honesty-slot: no-op banner */ : null
              }
              footerSlot={
                <SettingsCatalogPagination
                  page={clausePaginated.page}
                  totalPages={clausePaginated.totalPages}
                  total={clausePaginated.total}
                  pageSize={clausePaginated.pageSize}
                  onPageChange={setClausePage}
                  testId="settings-contract-clauses-pagination"
                />
              }
            >
              {error ? (
                <p className="text-sm text-destructive" data-testid="ctr-legal-load-error">
                  {error}
                </p>
              ) : null}
              <ContractClauseListTable
                rows={clauseListRows}
                onEdit={onEditClause}
                onActivate={(id) => void onActivateClause(id)}
                onRetire={(id) => void onRetireClause(id)}
                customGroupLabels={customGroupMap}
                emptyMessage={
                  clauseGroupFilter === '__all__' && !clauseSearch.trim()
                    ? clauses.length === 0
                      ? 'Chưa có điều khoản — bấm «Thêm điều khoản» để tạo từ FE (U65).'
                      : undefined
                    : `Nhóm «${getClauseGroupLabel(clauseGroupFilter === '__all__' ? '' : clauseGroupFilter)}» chưa có điều khoản${clauseSearch.trim() ? ' khớp tìm kiếm' : ''} — thêm mới hoặc chọn «Tất cả nhóm».`
                }
              />
            </SettingsCatalogScreenShell>
              </div>
            </div>
          ) : null}
          {!clausesDedicated ? (
          <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {editingClauseId ? 'Sửa điều khoản' : 'Tạo điều khoản'}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-12 gap-3">
              <div className="col-span-12 space-y-1 sm:col-span-5">
                <Label>Mã *</Label>
                <Input
                  className="w-full font-mono text-xs sm:text-sm"
                  data-testid="ctr-clause-code"
                  value={clauseForm.code}
                  disabled={Boolean(editingClauseId)}
                  onChange={(e) => setClauseForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="VD. THOI_HAN_CONG_VIEC_VP"
                />
              </div>
              <div className="col-span-12 space-y-1 sm:col-span-4">
                <Label>Nhóm</Label>
                <Select
                  value={clauseForm.clause_group}
                  onValueChange={(v) => setClauseForm((p) => ({ ...p, clause_group: v }))}
                >
                  <SelectTrigger data-testid="ctr-clause-group">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent portalScope="iframe">
                    {allClauseGroupKeys.map((g) => (
                      <SelectItem key={g} value={g}>
                        {getClauseGroupLabel(g)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-12 space-y-1 sm:col-span-3">
                <Label>Trạng thái</Label>
                <div
                  className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-xs sm:text-sm font-medium"
                  data-testid="ctr-clause-status"
                >
                  {editingClauseId
                    ? clauseStatusLabelVi(clauseForm.status)
                    : 'Nháp'}
                </div>
              </div>
              <div className="col-span-12 space-y-1">
                <Label>Tiêu đề *</Label>
                <Input
                  data-testid="ctr-clause-title"
                  value={clauseForm.title_vi}
                  onChange={(e) => setClauseForm((p) => ({ ...p, title_vi: e.target.value }))}
                />
              </div>
              <div className="col-span-12 space-y-1">
                <Label>Nội dung (chỗ điền {'{{tên_trường}}'} / {'{{token}}'}) *</Label>
                <Textarea
                  data-testid="ctr-clause-body"
                  rows={5}
                  value={clauseForm.body_vi}
                  onChange={(e) => setClauseForm((p) => ({ ...p, body_vi: e.target.value }))}
                  placeholder="Soạn tại đây — dùng {{token}}; không hardcode body luật từ FE."
                />
              </div>
              <div className="col-span-12 space-y-2">
                <Label>Áp dụng gói nghề</Label>
                <div className="flex flex-wrap gap-3">
                  {CONTRACT_PACK_CODES.map((p) => (
                    <label key={p} className="flex items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={clauseForm.apply_to_packs.includes(p)}
                        onCheckedChange={(v) => togglePack(p, v === true)}
                      />
                      {CONTRACT_PACK_LABELS[p]}
                    </label>
                  ))}
                  <label className="flex items-center gap-1.5 text-sm">
                    <Checkbox
                      checked={clauseForm.apply_to_packs.includes('*')}
                      onCheckedChange={(v) => togglePack('*', v === true)}
                    />
                    Tất cả (*)
                  </label>
                </div>
              </div>
              <div className="col-span-12 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={clauseForm.mandatory}
                    onCheckedChange={(v) =>
                      setClauseForm((p) => ({ ...p, mandatory: v === true }))
                    }
                    data-testid="ctr-clause-mandatory"
                  />
                  Bắt buộc trên pack
                </label>
                <Button type="button" size="sm" onClick={() => void onSaveClause()} data-testid="ctr-clause-save">
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Lưu
                </Button>
                {editingClauseId ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingClauseId(null);
                      setIssuedConflictClauseId(null);
                      setClauseForm(emptyClauseForm());
                    }}
                  >
                    Hủy sửa
                  </Button>
                ) : null}
              </div>
              {issuedConflictClauseId ? (
                <div
                  className="col-span-12 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                  data-testid="ctr-clause-issued-conflict-banner"
                  role="status"
                >
                  <p className="font-medium">Đã gắn bản HĐ phát hành — không ghi đè tại chỗ</p>
                  <p className="mt-1 text-xs text-amber-900/90">
                    Network: PATCH …/contract-clauses → HRM-CTR-CL-CODE-CONFLICT. Bấm «Tăng phiên bản»
                    để POST …/activate (bump). HĐ cũ giữ{' '}
                    <code className="text-[11px]">clauses_snapshot_json</code> bất biến — assert qua
                    print-versions issued (J-HRM-CORE-09A-03).
                  </p>
                  <div className="mt-2">
                    <Button
                      type="button"
                      size="sm"
                      data-testid="ctr-clause-activate-bump"
                      disabled={activateBumpBusy}
                      onClick={() =>
                        void onActivateClause(issuedConflictClauseId, { fromConflictBump: true })
                      }
                    >
                      {activateBumpBusy ? 'Đang tăng phiên bản…' : 'Tăng phiên bản (Hiệu lực)'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Danh sách điều khoản ({clauses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ContractClauseListTable
                rows={clauses}
                onEdit={onEditClause}
                onActivate={(id) => void onActivateClause(id)}
                onRetire={(id) => void onRetireClause(id)}
              />
            </CardContent>
          </Card>
          </>
          ) : null}

          {clausesDedicated ? (
            <Dialog
              open={clauseDialogOpen}
              onOpenChange={(open) => {
                setClauseDialogOpen(open);
                if (!open) {
                  setEditingClauseId(null);
                  setIssuedConflictClauseId(null);
                  setClauseForm(emptyClauseForm());
                }
              }}
            >
              <DialogContent
                className={HRM_DIALOG_PARENT_COMPACT_CLASS}
                data-testid="settings-contract-clauses-dialog"
                data-hrm-dialog-portal="parent"
              >
                <DialogHeader>
                  <DialogTitle>{editingClauseId ? 'Sửa điều khoản' : 'Thêm điều khoản'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-12 gap-3 py-2">
                  <div className="col-span-12 space-y-1 sm:col-span-5">
                    <Label>Mã *</Label>
                    <Input
                      className="w-full font-mono text-xs sm:text-sm"
                      data-testid="ctr-clause-code"
                      value={clauseForm.code}
                      disabled={Boolean(editingClauseId)}
                      onChange={(e) => setClauseForm((p) => ({ ...p, code: e.target.value }))}
                      placeholder="VD. THOI_HAN_CONG_VIEC_VP"
                    />
                  </div>
                  <div className="col-span-12 space-y-1 sm:col-span-4">
                    <Label>Nhóm</Label>
                    <Select
                      value={clauseForm.clause_group}
                      onValueChange={(v) => setClauseForm((p) => ({ ...p, clause_group: v }))}
                    >
                      <SelectTrigger data-testid="ctr-clause-group">
                        <SelectValue />
                      </SelectTrigger>
                      <SettingsDialogSelectContent>
                        {allClauseGroupKeys.map((g) => (
                          <SelectItem key={g} value={g}>
                            {getClauseGroupLabel(g)}
                          </SelectItem>
                        ))}
                      </SettingsDialogSelectContent>
                    </Select>
                  </div>
                  <div className="col-span-12 space-y-1 sm:col-span-3">
                    <Label>Trạng thái</Label>
                    <div
                      className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-xs sm:text-sm font-medium"
                      data-testid="ctr-clause-status"
                    >
                      {editingClauseId
                        ? clauseStatusLabelVi(clauseForm.status)
                        : 'Nháp'}
                    </div>
                  </div>
                  <div className="col-span-12 space-y-1">
                    <Label>Tiêu đề *</Label>
                    <Input
                      data-testid="ctr-clause-title"
                      value={clauseForm.title_vi}
                      onChange={(e) => setClauseForm((p) => ({ ...p, title_vi: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-12 space-y-1">
                    <Label>Nội dung (chỗ điền {'{{tên_trường}}'} / {'{{token}}'}) *</Label>
                    <Textarea
                      data-testid="ctr-clause-body"
                      rows={5}
                      value={clauseForm.body_vi}
                      onChange={(e) => setClauseForm((p) => ({ ...p, body_vi: e.target.value }))}
                      placeholder="Soạn tại đây — dùng {{token}}; không hardcode body luật từ FE."
                    />
                  </div>
                  <div className="col-span-12 space-y-2">
                    <Label>Áp dụng gói nghề</Label>
                    <div className="flex flex-wrap gap-3">
                      {CONTRACT_PACK_CODES.map((p) => (
                        <label key={p} className="flex items-center gap-1.5 text-sm">
                          <Checkbox
                            checked={clauseForm.apply_to_packs.includes(p)}
                            onCheckedChange={(v) => togglePack(p, v === true)}
                          />
                          {CONTRACT_PACK_LABELS[p]}
                        </label>
                      ))}
                      <label className="flex items-center gap-1.5 text-sm">
                        <Checkbox
                          checked={clauseForm.apply_to_packs.includes('*')}
                          onCheckedChange={(v) => togglePack('*', v === true)}
                        />
                        Tất cả (*)
                      </label>
                    </div>
                  </div>
                  <div className="col-span-12 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={clauseForm.mandatory}
                        onCheckedChange={(v) =>
                          setClauseForm((p) => ({ ...p, mandatory: v === true }))
                        }
                        data-testid="ctr-clause-mandatory"
                      />
                      Bắt buộc trên pack
                    </label>
                  </div>
                  {issuedConflictClauseId ? (
                    <div
                      className="col-span-12 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                      data-testid="ctr-clause-issued-conflict-banner"
                      role="status"
                    >
                      <p className="font-medium">Đã gắn bản HĐ phát hành — không ghi đè tại chỗ</p>
                      <p className="mt-1 text-xs text-amber-900/90">
                        Bấm «Tăng phiên bản» để POST …/activate (bump).
                      </p>
                      <div className="mt-2">
                        <Button
                          type="button"
                          size="sm"
                          data-testid="ctr-clause-activate-bump"
                          disabled={activateBumpBusy}
                          onClick={() =>
                            void onActivateClause(issuedConflictClauseId, { fromConflictBump: true })
                          }
                        >
                          {activateBumpBusy ? 'Đang tăng phiên bản…' : 'Tăng phiên bản (Hiệu lực)'}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setClauseDialogOpen(false)}
                    data-testid="settings-contract-clauses-dialog-cancel"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void onSaveClause()}
                    data-testid="settings-contract-clauses-dialog-save"
                  >
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Lưu
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}
          </>
          ) : null}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {templatesDedicated ? (
            <SettingsCatalogScreenShell
              compact
              title="Mẫu hợp đồng theo loại"
              description="Danh sách mẫu open catalog — sửa kéo-thả điều khoản trong hộp thoại (same-node handle)."
              testId="settings-contract-templates"
              searchValue={tplSearch}
              onSearchChange={setTplSearch}
              searchPlaceholder="Tìm mã hoặc tên mẫu…"
              onRefresh={() => void loadAll()}
              refreshing={loading}
              onAdd={openNewTemplateDialog}
              addLabel="Thêm mẫu"
              filterSlot={
                <label className="flex items-center gap-2 pb-1 text-sm">
                  <Checkbox
                    checked={matrixXevnOnly}
                    onCheckedChange={(v) => setMatrixXevnOnly(v === true)}
                    data-testid="ctr-tpl-matrix-xevn-filter"
                  />
                  Lọc list matrix=xevn
                </label>
              }
              footerSlot={
                <SettingsCatalogPagination
                  page={tplPaginated.page}
                  totalPages={tplPaginated.totalPages}
                  total={tplPaginated.total}
                  pageSize={tplPaginated.pageSize}
                  onPageChange={setTplPage}
                  testId="settings-contract-templates-pagination"
                />
              }
            >
              <Table data-testid="ctr-tpl-list-table" className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Pack</TableHead>
                    <TableHead>TT</TableHead>
                    <TableHead>Clauses</TableHead>
                    <TableHead className="min-w-[120px] text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-sm text-muted-foreground">
                        Đang tải…
                      </TableCell>
                    </TableRow>
                  ) : tplPaginated.slice.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        {templates.length === 0
                          ? 'Chưa có mẫu — bấm «Thêm mẫu» (U65).'
                          : 'Không có dòng khớp tìm kiếm.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    tplPaginated.slice.map((t) => {
                      const n = clauseIdsFromTemplate(t).length;
                      return (
                        <TableRow key={t.id} data-testid={`ctr-tpl-row-${t.code}`}>
                          <TableCell className="font-mono text-xs">
                            {t.template_code || t.code}
                          </TableCell>
                          <TableCell>{t.name_vi}</TableCell>
                          <TableCell className="text-xs">
                            {CONTRACT_PACK_LABELS[t.pack_code as keyof typeof CONTRACT_PACK_LABELS] ??
                              t.pack_code}
                          </TableCell>
                          <TableCell className="text-xs">{t.status}</TableCell>
                          <TableCell className="text-xs" data-testid={`ctr-tpl-clause-count-${t.code}`}>
                            {n}
                          </TableCell>
                          <TableCell>
                            <SettingsCatalogRowActions
                              editTestId={`settings-contract-templates-row-${t.id}-edit`}
                              retireTestId={`settings-contract-templates-row-${t.id}-delete`}
                              onEdit={() => loadTemplateOntoCanvas(t)}
                              onRetire={() => {}}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </SettingsCatalogScreenShell>
          ) : null}
          {!templatesDedicated ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {editingTplId ? 'Sửa mẫu' : 'Tạo mẫu #9+'} — kéo điều khoản từ thư viện
              </CardTitle>
              <CardDescription>
                Catalog mở: HR tạo mã hợp lệ bất kỳ (starter 8 chỉ ví dụ). Thứ tự canvas =
                layout_json.clause_ids. Handle kéo = cả hàng (same-node). LEGAL_BASIS nằm trong
                thư viện clause.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">{renderTemplateComposerInner(false)}</CardContent>
          </Card>
          ) : null}
          {templatesDedicated ? (
            <Dialog
              open={tplDialogOpen}
              onOpenChange={(open) => (open ? setTplDialogOpen(true) : closeTemplateDialog())}
            >
              <DialogContent
                className={HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS}
                data-testid="settings-contract-templates-dialog"
                data-hrm-dialog-portal="parent"
              >
                <DialogHeader>
                  <DialogTitle>{editingTplId ? 'Sửa mẫu HĐ' : 'Thêm mẫu HĐ'}</DialogTitle>
                </DialogHeader>
                <div className={HRM_DIALOG_FULL_VIEWPORT_BODY_CLASS}>
                  <div className="space-y-3">{renderTemplateComposerInner(true)}</div>
                </div>
                <DialogFooter className="shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeTemplateDialog}
                    data-testid="settings-contract-templates-dialog-cancel"
                  >
                    Đóng
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void onSaveTemplate()}
                    data-testid="settings-contract-templates-dialog-save"
                    disabled={saveTplBusy}
                  >
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    {saveTplBusy ? 'Đang lưu…' : 'Lưu mẫu'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}
          {!templatesDedicated ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm" data-testid="ctr-tpl-list-count">
                Mẫu đã lưu ({templates.length}) — open catalog từ API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Pack</TableHead>
                    <TableHead>Loại HĐ</TableHead>
                    <TableHead>Thời hạn</TableHead>
                    <TableHead>In</TableHead>
                    <TableHead>Ma trận</TableHead>
                    <TableHead>Nguồn</TableHead>
                    <TableHead>TT</TableHead>
                    <TableHead>Clauses</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((t) => {
                    const n = clauseIdsFromTemplate(t).length;
                    const termKey = String(t.default_term_type ?? '') as keyof typeof CONTRACT_TERM_TYPE_LABELS;
                    const termLabel =
                      termKey && CONTRACT_TERM_TYPE_LABELS[termKey]
                        ? CONTRACT_TERM_TYPE_LABELS[termKey]
                        : t.default_term_type || '—';
                    const duration =
                      t.default_duration_months != null
                        ? `${t.default_duration_months} tháng`
                        : t.default_duration_days != null
                          ? `${t.default_duration_days} ngày`
                          : '—';
                    return (
                      <TableRow key={t.id} data-testid={`ctr-tpl-row-${t.code}`}>
                        <TableCell className="font-mono text-xs">
                          {t.template_code || t.code}
                          {isXevnStarterTemplateCode(t.code) ? (
                            <Badge variant="secondary" className="ml-1 text-[9px] font-normal">
                              starter
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell>{t.name_vi}</TableCell>
                        <TableCell className="text-xs">
                          {CONTRACT_PACK_LABELS[t.pack_code as keyof typeof CONTRACT_PACK_LABELS] ??
                            t.pack_code}
                        </TableCell>
                        <TableCell className="text-xs">{termLabel}</TableCell>
                        <TableCell className="text-xs">{duration}</TableCell>
                        <TableCell className="max-w-[120px] truncate text-xs">
                          {t.title_print_vi || '—'}
                        </TableCell>
                        <TableCell className="text-xs">{t.matrix_family || '—'}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="max-w-[220px] truncate text-[10px] font-normal"
                            title={contractLibraryOriginDetailText({
                              origin: t.origin,
                              origin_publish_version: t.origin_publish_version,
                              origin_company_id: t.origin_company_id,
                              lineage_code: t.lineage_code,
                            })}
                            data-testid={`ctr-tpl-origin-${t.code}`}
                            data-origin={t.origin ?? 'member'}
                            data-origin-company={t.origin_company_id ?? ''}
                            data-origin-version={
                              t.origin_publish_version != null
                                ? String(t.origin_publish_version)
                                : ''
                            }
                            data-lineage-code={t.lineage_code ?? ''}
                          >
                            {contractLibraryOriginDetailText({
                              origin: t.origin,
                              origin_publish_version: t.origin_publish_version,
                              origin_company_id: t.origin_company_id,
                              lineage_code: t.lineage_code,
                            })}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{t.status}</TableCell>
                        <TableCell className="text-xs" data-testid={`ctr-tpl-clause-count-${t.code}`}>
                          {n}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => loadTemplateOntoCanvas(t)}
                            data-testid={`settings-contract-templates-row-${t.id}-edit`}
                          >
                            Mở
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          ) : null}
        </TabsContent>
      </Tabs>
      ) : null}

      {/* Dialog: Thêm Nhóm Điều Khoản */}
      <Dialog open={addGroupDialogOpen} onOpenChange={setAddGroupDialogOpen}>
        <DialogContent
          className={HRM_DIALOG_PARENT_COMPACT_CLASS}
          data-testid="settings-contract-clauses-add-group-dialog"
          data-hrm-dialog-portal="parent"
        >
          <DialogHeader>
            <DialogTitle>Thêm nhóm điều khoản mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Mã nhóm *</Label>
              <Input
                placeholder="VD. DIEU_KHOAN_MOI"
                value={groupForm.key}
                onChange={(e) =>
                  setGroupForm((p) => ({
                    ...p,
                    key: e.target.value.toUpperCase().replace(/\s+/g, '_'),
                  }))
                }
                data-testid="settings-contract-clauses-group-code-input"
              />
            </div>
            <div className="space-y-1">
              <Label>Tên nhóm *</Label>
              <Input
                placeholder="VD. Điều khoản bổ sung"
                value={groupForm.label}
                onChange={(e) => setGroupForm((p) => ({ ...p, label: e.target.value }))}
                data-testid="settings-contract-clauses-group-name-input"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" type="button" onClick={() => setAddGroupDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSaveAddGroup}
              data-testid="settings-contract-clauses-save-group-btn"
            >
              Thêm nhóm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Sửa Nhóm Điều Khoản */}
      <Dialog open={editGroupDialogOpen} onOpenChange={setEditGroupDialogOpen}>
        <DialogContent
          className={HRM_DIALOG_PARENT_COMPACT_CLASS}
          data-testid="settings-contract-clauses-edit-group-dialog"
          data-hrm-dialog-portal="parent"
        >
          <DialogHeader>
            <DialogTitle>Sửa nhóm điều khoản</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Mã nhóm *</Label>
              <Input
                placeholder="VD. DIEU_KHOAN_MOI"
                value={groupForm.key}
                onChange={(e) =>
                  setGroupForm((p) => ({
                    ...p,
                    key: e.target.value.toUpperCase().replace(/\s+/g, '_'),
                  }))
                }
                data-testid="settings-contract-clauses-group-code-edit-input"
              />
            </div>
            <div className="space-y-1">
              <Label>Tên nhóm *</Label>
              <Input
                placeholder="VD. Điều khoản bổ sung"
                value={groupForm.label}
                onChange={(e) => setGroupForm((p) => ({ ...p, label: e.target.value }))}
                data-testid="settings-contract-clauses-group-name-edit-input"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" type="button" onClick={() => setEditGroupDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSaveEditGroup}
              data-testid="settings-contract-clauses-update-group-btn"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
