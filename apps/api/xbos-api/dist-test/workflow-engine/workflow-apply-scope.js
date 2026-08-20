"use strict";
/**
 * @CODE-MEMORY
 * Screen: XBOS workflow-engine instances/start · Hệ thống quy trình «Đơn vị áp dụng»
 * UC: UC-HRM-REC-WF-02 · J-REC-WF-02 · BM-06 / G-BM-REC-02
 * BR: BR-REC-WF-01 · BR-REC-WF-09
 * SRS: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md · BM-SA rec trace G-BM-REC-02
 * TechSpec: docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §3 ·
 *           docs/qa/evidence/bm-sa-xbos-hrm-rec-trace-01-20260722.md §5 Option B/C ·
 *           docs/decisions/ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723.md §3 Option B
 * Purpose: Clarify group + member applyingEntityId semantics for spawn.
 *   Empty / holding / main = group-wide. Member UUID/slug = bound member, but
 *   Group CEO holding/main spawn remains allowed (BM-06 / J-REC-WF-02).
 *   Option B: pick active def by company partition (member override → else group-wide).
 * WorkItem: BM-BE-REC-WF-SPAWN-MEMBER-01 · D-HRM-REC-WF-OPTION-B-BE-01
 * Coded: 2026-07-21
 * Callers: WorkflowEngineService.startInstanceFromWorkflowCode · findActiveDefinitionByCode
 * Callees: none (pure helpers)
 * Impact: Wrong reject → SPAWN-MISSING after VISUN apply; silent wrong graph if pick skips partition
 * must_keep: LeaveWorkflowBridge · CatalogWorkflowBridge · UF-HRM-12 · U65 · J-REC-WF-* spawn
 * change_mode: ADD
 * SOLID: SRP — apply-scope + Option B partition pick only
 * LastVerified: workflow-apply-scope.spec.ts · workflow-engine.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-23 D-HRM-REC-WF-OPTION-B-BE-01
 * ADD pickActiveDefinitionForCompanyPartition — Option B normative:
 * prefer member override (company_id | applyingEntity) matching spawn keys;
 * fallback group-wide only when no member override; never silent pick unrelated member graph.
 * must_keep G-BM-REC-02 holding spawn when only member-bound def exists.
 * change_mode: ADD · no Option C fan-out · no Bay.vn UI claim · R2 fail-closed out of this WI.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseApplyingEntityIdFromGraph = parseApplyingEntityIdFromGraph;
exports.isGroupWideApplyingEntity = isGroupWideApplyingEntity;
exports.isLegalEntityUuid = isLegalEntityUuid;
exports.isGroupCeoSpawnCompany = isGroupCeoSpawnCompany;
exports.definitionAppliesToSpawnScope = definitionAppliesToSpawnScope;
exports.isHrmRecruitmentWorkflowCode = isHrmRecruitmentWorkflowCode;
exports.isHrmLeaveWorkflowCode = isHrmLeaveWorkflowCode;
exports.expandCompanyPartitionKeys = expandCompanyPartitionKeys;
exports.collectSpawnPartitionKeys = collectSpawnPartitionKeys;
exports.isGroupWideDefinitionPartition = isGroupWideDefinitionPartition;
exports.pickActiveDefinitionForCompanyPartition = pickActiveDefinitionForCompanyPartition;
const workflow_catalog_constants_1 = require("./workflow-catalog.constants");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Tokens that mean «Toàn tập đoàn» / no member bind (FE empty select). */
const GROUP_WIDE_APPLY_TOKENS = new Set([
    '',
    'holding',
    'main',
    'xevn',
    'all',
    'group',
    'xbos-group-holding-root',
    'toan-tap-doan',
]);
function parseApplyingEntityIdFromGraph(graph) {
    if (!graph || typeof graph !== 'object' || Array.isArray(graph))
        return '';
    const g = graph;
    return String(g.applyingEntityId ?? g.applying_entity_id ?? '').trim();
}
function isGroupWideApplyingEntity(applyingEntityId) {
    return GROUP_WIDE_APPLY_TOKENS.has(applyingEntityId.trim().toLowerCase());
}
function isLegalEntityUuid(value) {
    return UUID_RE.test(value.trim());
}
function isGroupCeoSpawnCompany(companyId) {
    const c = companyId.trim().toLowerCase();
    return c === workflow_catalog_constants_1.MASTER_COMPANY_HOLDING || c === 'main' || c === workflow_catalog_constants_1.MASTER_TENANT_XEVN;
}
/**
 * G-BM-REC-02 / BM-06 semantics:
 * - Group-wide apply → always OK
 * - Member apply → OK when spawn is Group CEO holding/main, OR spawn/context
 *   matches member partition / slug / tenant
 * - Member apply does NOT hide the active definition from Group CEO spawn
 */
function definitionAppliesToSpawnScope(input) {
    const applying = input.applyingEntityId.trim();
    if (isGroupWideApplyingEntity(applying))
        return true;
    const spawnCompany = input.spawnCompanyId.trim().toLowerCase();
    if (isGroupCeoSpawnCompany(spawnCompany))
        return true;
    const memberCompany = (input.contextMemberCompanyId ?? '').trim().toLowerCase();
    const memberTenant = (input.contextMemberTenantId ?? '').trim().toLowerCase();
    const spawnTenant = (input.spawnTenantId ?? '').trim().toLowerCase();
    const applyingLower = applying.toLowerCase();
    if (spawnCompany && (spawnCompany === applyingLower || memberCompany === applyingLower)) {
        return true;
    }
    if (memberTenant && memberTenant === applyingLower)
        return true;
    if (spawnTenant && spawnTenant === applyingLower)
        return true;
    const part = input.resolvedPartition;
    if (part) {
        const partCompany = part.companyId.trim().toLowerCase();
        const partTenant = part.tenantId.trim().toLowerCase();
        if (spawnCompany === partCompany || memberCompany === partCompany)
            return true;
        if (spawnTenant === partTenant || memberTenant === partTenant)
            return true;
        // Member legal entities often use company_id=main under tenant=visun
        if (partTenant && (spawnTenant === partTenant || memberTenant === partTenant))
            return true;
        if (partTenant && spawnCompany === partTenant)
            return true;
    }
    return false;
}
function isHrmRecruitmentWorkflowCode(workflowCode) {
    const code = workflowCode.trim().toLowerCase();
    return (code === 'hrm_requisition_approval' ||
        code === 'hrm_recruitment_plan_approval' ||
        code === 'hrm_candidate_pipeline');
}
function isHrmLeaveWorkflowCode(workflowCode) {
    return workflowCode.trim().toLowerCase() === 'hrm_leave_approval';
}
function normalizeScopeKey(value) {
    return (value ?? '').trim().toLowerCase();
}
/** Expand main↔holding so Group CEO portal keys match persist company_id. */
function expandCompanyPartitionKeys(keys) {
    const out = new Set();
    for (const raw of keys) {
        const k = normalizeScopeKey(raw);
        if (!k)
            continue;
        out.add(k);
        if (k === workflow_catalog_constants_1.MASTER_COMPANY_HOLDING || k === 'main') {
            out.add(workflow_catalog_constants_1.MASTER_COMPANY_HOLDING);
            out.add('main');
        }
    }
    return [...out];
}
function collectSpawnPartitionKeys(input) {
    return expandCompanyPartitionKeys([
        input.spawnCompanyId,
        input.contextMemberCompanyId ?? '',
        input.contextMemberTenantId ?? '',
        input.spawnTenantId ?? '',
    ]);
}
/**
 * Group-wide partition = empty/holding/main company_id AND group-wide applyingEntityId.
 * Member override = member company_id column OR member applyingEntityId (slug/UUID).
 */
function isGroupWideDefinitionPartition(companyId, applyingEntityId) {
    const cid = normalizeScopeKey(companyId);
    const companyGroup = !cid || isGroupWideApplyingEntity(cid);
    return companyGroup && isGroupWideApplyingEntity(applyingEntityId);
}
function definitionVersion(def) {
    const v = def.version;
    return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}
function highestVersion(defs) {
    if (defs.length === 0)
        return null;
    return [...defs].sort((a, b) => definitionVersion(b) - definitionVersion(a) || a.id.localeCompare(b.id))[0] ?? null;
}
function definitionMemberMatchKeys(def) {
    const applying = parseApplyingEntityIdFromGraph(def.graph);
    const cid = normalizeScopeKey(def.company_id);
    const keys = [];
    if (cid && !isGroupWideApplyingEntity(cid))
        keys.push(cid);
    if (applying && !isGroupWideApplyingEntity(applying))
        keys.push(normalizeScopeKey(applying));
    const part = def.resolvedPartition;
    if (part) {
        const partCompany = normalizeScopeKey(part.companyId);
        const partTenant = normalizeScopeKey(part.tenantId);
        if (partCompany && !isGroupWideApplyingEntity(partCompany))
            keys.push(partCompany);
        if (partTenant)
            keys.push(partTenant);
    }
    return expandCompanyPartitionKeys(keys);
}
function isMemberOverrideDefinition(def) {
    const applying = parseApplyingEntityIdFromGraph(def.graph);
    return !isGroupWideDefinitionPartition(def.company_id, applying);
}
function memberOverrideMatchesSpawn(def, spawnKeys) {
    if (!isMemberOverrideDefinition(def))
        return false;
    const defKeys = new Set(definitionMemberMatchKeys(def));
    return spawnKeys.some((k) => defKeys.has(k));
}
/**
 * ADR Option B: resolve active def for spawn company partition.
 * 1) Member override matching spawn keys (company_id | applyingEntity | LE partition)
 * 2) Else group-wide active (highest version)
 * 3) Else only member-bound defs — pick highest that still applies (G-BM-REC-02 Group CEO)
 * Never pick an unrelated member graph when a matching/group-wide candidate exists.
 */
function pickActiveDefinitionForCompanyPartition(candidates, input) {
    const active = candidates.filter((c) => Boolean(c?.id));
    if (active.length === 0)
        return null;
    const spawnKeys = collectSpawnPartitionKeys(input);
    const memberMatches = active.filter((d) => memberOverrideMatchesSpawn(d, spawnKeys));
    if (memberMatches.length > 0) {
        return highestVersion(memberMatches);
    }
    const groupWide = active.filter((d) => {
        const applying = parseApplyingEntityIdFromGraph(d.graph);
        return isGroupWideDefinitionPartition(d.company_id, applying);
    });
    if (groupWide.length > 0) {
        return highestVersion(groupWide);
    }
    // No group-wide + no exact member match: keep G-BM-REC-02 for Group CEO holding
    // when the only active def is member-bound; reject unrelated member for other spawns.
    const applicable = active.filter((d) => definitionAppliesToSpawnScope({
        spawnCompanyId: input.spawnCompanyId,
        spawnTenantId: input.spawnTenantId,
        contextMemberCompanyId: input.contextMemberCompanyId,
        contextMemberTenantId: input.contextMemberTenantId,
        applyingEntityId: parseApplyingEntityIdFromGraph(d.graph),
        resolvedPartition: d.resolvedPartition ?? null,
    }));
    return highestVersion(applicable);
}
