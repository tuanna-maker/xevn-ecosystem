# Menu TC Pack — `MOB-OPERATIONS` · Mobile Vận hành (ProfileStack `Operations`)

| Meta | Value |
|------|--------|
| **menu_id** | `MOB-OPERATIONS` |
| **surface** | `hrm-mobile` |
| **route(s)** | `ProfileStack` screen `Operations` · `OperationsScreen` |
| **HDSD** | Mobile ESS · `docs/hrm/SRS_MOBILE.md` §UC-HRM-MOB-11 · `docs/program/MOBILE_PERSONA_UX_MATRIX.md` (`/tasks` · `/internal-services`) · Ch.12 Cài đặt → Vận hành (QL) |
| **SRS / FR / UC** | **UC-HRM-MOB-11** · **FR-HRM-OP-01..03** (task create/list/status) · **FR-HRM-11** / **HRM-SV-02** (service-request list + approve/reject) |
| **TechSpec** | `docs/hrm/TECHSPEC.md` §16.5 `hrm_tasks` · `service_requests` · `docs/hrm/TECHSPEC_MOBILE.md` P1 operations |
| **API_CONTRACT** | `GET /api/hrm/operations/tasks` · `POST /api/hrm/operations/tasks` · `PATCH /api/hrm/operations/tasks/:id/status` · `GET /api/hrm/operations/service-requests` · `POST …/service-requests/:id/approve` · `POST …/service-requests/:id/reject` · codes `HRM-OPS-*` / `HRM-SVC-*` |
| **UF / J-*** | **J-MOB-17 ext** (Settings/Profile deep link → Vận hành load) · **AC-PERS-TILE-TSK-01** · **AC-PERS-TILE-SR-01** · *entry* **J-MOB-11** home grid · *entry* **TC-MOB-SET-AU-001** Settings row |
| **Catalog neo** | roster `MOB-OPERATIONS` Wave C · prior static/API smoke `p1-hrm-h8b-mobile-tabs-qa-20260606.md` · MOB-UX-12d elevated rows |
| **author** | qa · `PO-ECO-TC-MOB-OPERATIONS-01` |
| **work_item_id** | `PO-ECO-TC-MOB-OPERATIONS-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **Persona lock** | QL **`uat.nv0001@xe.vn`** / `xevn-uat-2026` (Settings nav + service Duyệt) · ESS **`uat.nv0003@xe.vn`** (home tile · task tab · **không** Settings row Vận hành) · **cấm** `ceo@xe.vn` làm L1 mobile UAT mặc định |
| **Locks** | U65 zero-seed · U76 HDSD · U78 test-log when executed · **cấm** UAT DONE |

> Chuẩn: IEEE 829 / ISO 29119 lean — pack **thiết kế** TC; execution device = wave sau.  
> **Settings → Vận hành (visibility):** **`MOB-SETTINGS.md`** — pack này **sở hữu** toàn bộ `OperationsScreen` (tabs · mutate · empty).  
> **Home grid tile «Vận hành»:** **`MOB-HOME.md`** — chỉ **entry** `home-action-tile-operations`; không duplicate hub expand «Việc cần làm».  
> **Profile stack list khác:** **`MOB-PROFILE.md`** — cross-ref screen name only; không ESS tab depth.

---

## 0. Spec read ack (inventory source)

| Source | Path | Sections used |
|--------|------|----------------|
| Operations UI | `apps/mobile/hrm-mobile/src/features/operations/OperationsScreen.tsx` | 2 tabs · parallel GET · create task · PATCH done · service approve/reject · shimmer/empty/error |
| Labels | `apps/mobile/hrm-mobile/src/utils/operationsLabels.ts` | `resolveServiceTypeLabel` · `resolveTaskStatusLabel` · `resolveOpsPriorityLabel` · U72 «—» |
| Nav | `navigation/profileStackNav.ts` · `RootNavigator.tsx` ProfileStack | `navigateToOperations` · screen `Operations` |
| Settings entry | `features/settings/SettingsScreen.tsx` | quick nav row `vi.operations` · `show: auth.isManager` |
| Home entry | `utils/homePortal.ts` · `DashboardScreen.tsx` | tile `operations` · `navigateToOperations` |
| Hub / notif | `utils/dashboardHub.ts` · `InAppNotificationsScreen.tsx` | manager → Operations target · deep link case |
| Scope UUID | `AuthContext.getAttendanceCompanyId()` | Plane B UUID for operations query/body |
| Offline | `hooks/useOfflineWriteGuard.ts` | block POST/PATCH offline |
| Vitest | `utils/__tests__/operationsLabels.test.ts` · `components/ui/__tests__/mobUx12d.test.ts` | label maps · ElevatedCard wiring |
| SRS | `docs/hrm/SRS_MOBILE.md` · `docs/hrm/PLAN_HRM_MOBILE_IMPLEMENTATION.md` | UC-HRM-MOB-11 |
| Web parity note | `docs/qa/evidence/qc-p1-hrm-fidelity-regate-11-13-20260607.md` | GET-by-id 404 GWC on web — mobile list-only |
| Cross-pack | **`MOB-SETTINGS.md`** · **`MOB-HOME.md`** · **`MOB-PROFILE.md`** | entry TCs only upstream |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-OPS-ROOT | page | `ProfileStack` → `Operations` | Vận hành scroll list | loading shimmer · content · error banner · pull-refresh |
| SCR-OPS-HDR | chrome | list header | Tiêu đề + mô tả phụ | constant VI |
| SCR-OPS-ERR | inline | `errorBanner` | Lỗi Tasks/Dịch vụ ghép | partial OK · full fail |
| SCR-OPS-TABS | control | `SegmentedTabBar` | **Việc** \| **Yêu cầu DV** | tasks · services |
| SCR-OPS-CREATE | inline card | tab **Việc** only | Tạo việc nhanh + **Thêm task** | busy · default title |
| SCR-OPS-TASK-LIST | list | FlatList tasks | `ElevatedCard` + `EssRichListRow` | empty · rows · refreshing |
| ROW-OPS-TASK | row | task item | Title · status·priority·hạn · **Xong** | done hides action |
| SCR-OPS-TASK-EMPTY | empty | `operations-tasks-empty` | «Không có task» + hint | no error |
| SCR-OPS-SVC-LIST | list | FlatList services | elevated service rows | empty · rows |
| ROW-OPS-SVC | row | service item | Loại DV label · NV · ngày · Duyệt/Từ chối | pending vs terminal status |
| SCR-OPS-SVC-EMPTY | empty | `operations-services-empty` | «Không có yêu cầu» | no error |
| CMP-OPS-SHIM | inline | `operations-list-shimmer` | Skeleton first paint | loading gate |
| POP-ALERT-API | alert | mutate fail | `Alert` + `formatHrmError` VI | POST/PATCH |
| POP-ALERT-OFFLINE | alert | offline mutate | `useOfflineWriteGuard` message | create · done · decide |

**Không có (OOS mobile P1):** task detail screen · service create wizard · web-only `/command-center/hrm/tasks` embed.

**Entry surfaces (cross-ref — matrix depth tại pack entry TC):**

| entry_id | Trigger | Owner pack |
|----------|---------|------------|
| ENT-SET-OPS | Settings → **Vận hành** (mgr) | MOB-SETTINGS AU-001 → **OPS-NAV-001** |
| ENT-HOME-OPS | Trang chủ → tile **Vận hành** | MOB-HOME → **OPS-NAV-002** |
| ENT-HUB-OPS | Hub/carousel manager target | MOB-HOME / dashboardHub → **OPS-NAV-003** |
| ENT-NOTIF-OPS | Inbox deep link | MOB-PROFILE notif → **OPS-NAV-004** |

**Đếm in-scope surfaces:** page=1 · chrome=1 · tabs=1 · create=1 · lists=2 · rows=2 · empties=2 · shimmer=1 · error=1 · alerts=2 → **14** ids (+ 4 entry refs)

---

## 2. Field dictionary (display + controls)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / source | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|--------------|--------|-------|
| F-OPS-TITLE | Vận hành | SCR-OPS-HDR | text | Y | `vi.operations` | i18n | plain | large title |
| F-OPS-SUB | Quản lý việc và yêu cầu dịch vụ | SCR-OPS-HDR | text | Y | | constant | | subtitle |
| F-OPS-ERR | Banner lỗi | SCR-OPS-ERR | text | N | partial list fail | formatHrmError | VI multiline | danger tone |
| F-TAB-TASKS | Việc | SCR-OPS-TABS | segment | Y | default tab | local | | key `tasks` |
| F-TAB-SVC | Yêu cầu DV | SCR-OPS-TABS | segment | Y | | local | | key `services` |
| F-CREATE-LBL | Tạo việc nhanh | SCR-OPS-CREATE | FormField label | N | | | | tab tasks only |
| F-CREATE-INPUT | Tiêu đề task | SCR-OPS-CREATE | TextInput | N | trim · fallback `Task` | POST `title` | plain VI | default «Việc từ mobile» |
| F-CREATE-BTN | Thêm task | SCR-OPS-CREATE | PrimaryButton | N | disabled when busy | POST tasks | | loading label `vi.loading` |
| F-TASK-TITLE | Tiêu đề việc | ROW-OPS-TASK | text | Y | not raw enum | `title` | plain | EssRichListRow title |
| F-TASK-SUB | Trạng thái · Ưu tiên · hạn | ROW-OPS-TASK | subtitle | Y | **U72 labels** | status · priority · `due_date` | dd/MM hạn | `resolveTaskStatusLabel` |
| F-TASK-STATUS | Chip trạng thái | ROW-OPS-TASK | StatusBadge | Y | no `open` raw | `status` | VI | |
| F-TASK-DONE | Xong | ROW-OPS-TASK | button | N | hidden if `done` | PATCH `{status:'done'}` | | secondary sm |
| F-TASK-EMPTY-T | Không có task | SCR-OPS-TASK-EMPTY | title | N | | | | Lottie/icon empty |
| F-TASK-EMPTY-H | Tạo việc mới hoặc kéo xuống… | SCR-OPS-TASK-EMPTY | hint | N | | | | |
| F-SVC-TITLE | Loại dịch vụ | ROW-OPS-SVC | text | Y | **U72** parking/locker/… or «—» | `service_type` | VI | not underscore |
| F-SVC-SUB | Nhân viên · ngày | ROW-OPS-SVC | subtitle | Y | name display | `employee_name` · `request_date` | dd/MM | |
| F-SVC-STATUS | Trạng thái yêu cầu | ROW-OPS-SVC | badge | Y | `statusLabel()` | `status` | VI | approved/rejected/pending |
| F-SVC-APPROVE | Duyệt | ROW-OPS-SVC | button | mgr* | pending only | POST approve | | `approved_by` body |
| F-SVC-REJECT | Từ chối | ROW-OPS-SVC | button | mgr* | pending only | POST reject | | reason VI default |
| F-SVC-EMPTY-T | Không có yêu cầu | SCR-OPS-SVC-EMPTY | title | N | | | | |
| F-SVC-EMPTY-H | Kéo xuống để làm mới. | SCR-OPS-SVC-EMPTY | hint | N | | | | |
| F-SCOPE-CID | UUID công ty (ops) | SCR-OPS-ROOT | internal | Y | missing → scope error | `getAttendanceCompanyId()` | UUID | **SPEC_GAP** copy «Cần UUID…» — user-facing scope message |
| F-LIST-REFRESH | Pull refresh | SCR-OPS-*-LIST | gesture | N | | reload GET both | | focus reload on mount |

**Đếm fields:** **24** (+ family rows)

---

## 3. Function inventory

| fn_id | UI (nút/menu) | screen_id | precond | API / nav | success FE + reopen | fail / edge | HDSD |
|-------|---------------|-----------|---------|-----------|---------------------|-------------|------|
| FN-OPS-FOCUS-LOAD | Mở màn / focus | SCR-OPS-ROOT | signed in · UUID scope | parallel GET tasks + services | lists or empty · shimmer ends | no cid → scope error · partial banner | UC-MOB-11 |
| FN-OPS-REFRESH | Kéo làm mới | SCR-OPS-*-LIST | online | same GET | rows update · refreshing false | error text append | |
| FN-OPS-TAB-TASK | Chọn tab Việc | SCR-OPS-TABS | | local | create card visible · task list | | |
| FN-OPS-TAB-SVC | Chọn tab Yêu cầu DV | SCR-OPS-TABS | | local | create hidden · service list | | |
| FN-OPS-CREATE | Thêm task | SCR-OPS-CREATE | cid · online | POST tasks | row mới or list refresh · input reset default | Alert API · offline alert | U65: tạo từ FE |
| FN-OPS-TASK-DONE | Xong | ROW-OPS-TASK | status ≠ done | PATCH status done | row status VI «Hoàn thành» · button hidden | Alert · offline | FR-HRM-OP-03 |
| FN-OPS-SVC-APPROVE | Duyệt | ROW-OPS-SVC | pending | POST approve | status chip update · actions hidden | 403/validation Alert | FR-HRM-11 |
| FN-OPS-SVC-REJECT | Từ chối | ROW-OPS-SVC | pending | POST reject | terminal status · actions hidden | Alert | FR-HRM-11 |
| FN-SET-NAV-OPS | Settings → Vận hành | *(MOB-SETTINGS)* | `isManager` | nav Operations | SCR-OPS-ROOT | hidden ESS | §12.9 |
| FN-HOME-TILE-OPS | Home tile Vận hành | *(MOB-HOME)* | tile in grid | nav Operations | mount | stub N/A (not stub) | AC-PERS-TILE-TSK-01 |
| FN-HUB-OPS | Hub navigate Operations | *(MOB-HOME)* | manager hub | nav | mount | emp → notif target instead | dashboardHub |
| FN-NOTIF-OPS | Inbox → Vận hành | *(MOB-PROFILE)* | deep link type | nav Operations | mount | | |
| FN-OPS-BACK | Back stack | SCR-OPS-ROOT | | pop | Settings or Home prior | | L2.5 entry |

**Đếm functions:** **13** in-pack depth (+ 3 cross-ref entries documented)

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-MOB-OPS-<area>-<nnn>` · Type: `HP` · `FD` · `BD` · `AU` · `UX` · `NAV` · `REG` · `PAR`
- **Layer:** DEVICE · UNIT · API (optional parity)
- **Status:** `PLANNED` (design pack)
- **Precond U65:** task/service rows chỉ sau **login** + **tạo/lấy từ UI hoặc dữ liệu env pilot sẵn có** — **cấm** `pnpm seed:*` / script density trong evidence nghiệm thu.

### 4.1 Navigation · J-MOB-17 ext · cross-pack entry

| TC-ID | Type | Covers | Persona | Precond | Steps (HDSD) | Expected | Automate | Status |
|-------|------|--------|---------|---------|--------------|----------|----------|--------|
| TC-MOB-OPS-NAV-001 | NAV | FN-SET-NAV-OPS | uat.nv0001 | U65 login | Hồ sơ → **Cài đặt** → **Vận hành** | Header **Vận hành** · tabs visible · no uncaught | DEVICE | PLANNED |
| TC-MOB-OPS-NAV-002 | NAV | FN-HOME-TILE-OPS | uat.nv0003 | Home grid | Trang chủ → tile **Vận hành** | Same mount · **no** Settings row required | DEVICE | PLANNED |
| TC-MOB-OPS-NAV-003 | NAV | FN-OPS-BACK | uat.nv0001 | from Settings | Back from Operations | Returns Settings · stack sane | DEVICE | PLANNED |
| TC-MOB-OPS-NAV-004 | NAV | FN-HUB-OPS | uat.nv0001 | manager home hub | Trigger hub item → Operations if exposed | Operations mount | DEVICE | PLANNED |
| TC-MOB-OPS-J17-REG-001 | REG | J-MOB-17 ext | uat.nv0001 | MOB-UX-12d baseline | Settings→Vận hành · observe elevated cards | ≥1 `ElevatedCard` row or honest empty · labels not raw enum | DEVICE | PLANNED |

### 4.2 Load · scope · refresh · tabs

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-OPS-LD-HP-001 | HP | FN-OPS-FOCUS-LOAD | uat.nv0001 | valid UUID scope | Open Operations | GET tasks + GET services **2xx** (DevTools) · shimmer → content/empty | DEVICE | PLANNED |
| TC-MOB-OPS-LD-HP-002 | HP | FN-OPS-TAB-SVC | uat.nv0001 | loaded | Tap **Yêu cầu DV** | Create card **hidden** · service list or empty | DEVICE | PLANNED |
| TC-MOB-OPS-LD-HP-003 | HP | FN-OPS-TAB-TASK | uat.nv0001 | on services tab | Tap **Việc** | Create card visible | DEVICE | PLANNED |
| TC-MOB-OPS-LD-UX-001 | UX | FN-OPS-REFRESH | uat.nv0001 | list shown | Pull refresh | `refreshing` ends · data stable or updated | DEVICE | PLANNED |
| TC-MOB-OPS-LD-FD-001 | FD | F-SCOPE-CID | repro no UUID | break attendance company id if QA harness | Open Operations | Scope error VI · empty lists · **no** silent crash | DEVICE | PLANNED |
| TC-MOB-OPS-LD-FD-002 | FD | F-OPS-ERR | uat.nv0001 | stop hrm-api or force 500 one leg | Open Operations | Error banner text · failed leg empty · other leg may still show | DEVICE | PLANNED |

### 4.3 Tasks — create · done · empty · labels (U65 mutate)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-OPS-TSK-HP-001 | HP | FN-OPS-CREATE | uat.nv0003 | empty or any | Tab Việc · sửa tiêu đề → **Thêm task** | POST **201** `HRM-OPS-201` · row appears · FE refresh | DEVICE | PLANNED |
| TC-MOB-OPS-TSK-HP-002 | HP | FN-OPS-TASK-DONE | uat.nv0003 | open/in_progress row | Tap **Xong** | PATCH **202** · status chip **Hoàn thành** · **Xong** hidden | DEVICE | PLANNED |
| TC-MOB-OPS-TSK-HP-003 | HP | F-TASK-SUB | uat.nv0001 | row with due_date | Read subtitle | Contains VI status · priority · `dd/MM` hạn | DEVICE | PLANNED |
| TC-MOB-OPS-TSK-FD-001 | FD | FN-OPS-CREATE | uat.nv0003 | offline mode | Thêm task | Offline alert · **no** new row | DEVICE | PLANNED |
| TC-MOB-OPS-TSK-FD-002 | FD | FN-OPS-CREATE | uat.nv0003 | invalid body if reproducible | POST fail | Alert VI · list unchanged | DEVICE | PLANNED |
| TC-MOB-OPS-TSK-BD-001 | BD | F-CREATE-INPUT | uat.nv0003 | | Clear input → Thêm task | POST with fallback title `Task` · success | DEVICE | PLANNED |
| TC-MOB-OPS-TSK-UX-001 | UX | SCR-OPS-TASK-EMPTY | uat.nv0003 | no tasks · no error | Tab Việc | `operations-tasks-empty` copy · hint refresh | DEVICE | PLANNED |
| TC-MOB-OPS-TSK-AU-001 | AU | F-TASK-DONE | uat.nv0003 | done row | Observe actions | **No** Xong button | DEVICE | PLANNED |

### 4.4 Service requests — list · approve/reject · labels

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-OPS-SVC-HP-001 | HP | FN-OPS-SVC-APPROVE | uat.nv0001 | pending row (FE-created or env) | Tab DV → **Duyệt** | POST approve **2xx** · status VI · buttons hidden | DEVICE | PLANNED |
| TC-MOB-OPS-SVC-HP-002 | HP | FN-OPS-SVC-REJECT | uat.nv0001 | another pending | **Từ chối** | POST reject **2xx** · terminal badge | DEVICE | PLANNED |
| TC-MOB-OPS-SVC-HP-003 | HP | F-SVC-TITLE | uat.nv0001 | known `service_type` | Read title | **Bãi đỗ xe** / mapped VI · not `parking` raw | DEVICE | PLANNED |
| TC-MOB-OPS-SVC-FD-001 | FD | F-SVC-TITLE | uat.nv0001 | unknown type row | Read title | **—** per U72 · no underscore spacing hack | DEVICE | PLANNED |
| TC-MOB-OPS-SVC-FD-002 | FD | FN-OPS-SVC-APPROVE | uat.nv0003 | ESS on pending if visible | Tap Duyệt if shown | **403** or hidden actions · Alert if forced | DEVICE | PLANNED |
| TC-MOB-OPS-SVC-UX-001 | UX | SCR-OPS-SVC-EMPTY | uat.nv0001 | no services · no error | Tab DV | `operations-services-empty` | DEVICE | PLANNED |
| TC-MOB-OPS-SVC-AU-001 | AU | F-SVC-APPROVE | uat.nv0001 | approved row | Observe | **No** Duyệt/Từ chối | DEVICE | PLANNED |

### 4.5 Auth · persona · display (MOB-SETTINGS dedupe boundary)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-OPS-AU-001 | AU | FN-SET-NAV-OPS | uat.nv0003 | ESS | Settings scroll | **No** row Vận hành · tile home still OK (NAV-002) | DEVICE | PLANNED |
| TC-MOB-OPS-AU-002 | AU | FN-SET-NAV-OPS | uat.nv0001 | QL | Settings | Row **Vận hành** visible · maps **TC-MOB-SET-AU-001** downstream | DEVICE | PLANNED |
| TC-MOB-OPS-UX-001 | UX | touch targets | uat.nv0001 | | Tap segment + primary buttons | ≥44px effective · no overlap | DEVICE | PLANNED |

### 4.6 Unit / static parity

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-OPS-UNIT-001 | HP | operationsLabels | — | | `pnpm --filter hrm-mobile test operationsLabels` | exit 0 · known maps | UNIT | PLANNED |
| TC-MOB-OPS-UNIT-002 | HP | mobUx12d | — | | `pnpm --filter hrm-mobile test mobUx12d` | OperationsScreen uses ElevatedCard + labels | UNIT | PLANNED |

### 4.7 Coverage check

| Check | Count required | Count in matrix | GAP |
|-------|----------------|-----------------|-----|
| Functions với ≥1 HP | 13 | 13 | **0** |
| Mutate fns với ≥1 FD | 5 (create, done, approve, reject, offline) | 5 | **0** |
| Required tabs/fields với ≥1 TC | 4 (tabs, create, task row, svc row) | 4 | **0** |
| Empty states | 2 | 2 (TSK-UX-001, SVC-UX-001) | **0** |
| Entry cross-pack | Settings + Home | NAV-001..002 + AU-001/002 | **0** |
| Alerts | 2 | TSK-FD-001 + LD-FD-* | **0** |

**TC count:** **32** PLANNED (design)

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec / doc | API | Catalog / J-* | HDSD |
|-------|----------|----------------|-----|---------------|------|
| TC-MOB-OPS-NAV-001 | UC-HRM-MOB-11 | MOB-UX-12d | — | **J-MOB-17 ext** · **TC-MOB-SET-AU-001** entry | Cài đặt → Vận hành |
| TC-MOB-OPS-NAV-002 | UC-HRM-MOB-11 | MOBILE_PERSONA UX | — | **AC-PERS-TILE-TSK-01** | Trang chủ tile |
| TC-MOB-OPS-TSK-HP-001 | FR-HRM-OP-01 | TECHSPEC §16.5 | POST tasks | U65 mutate | Tạo việc nhanh |
| TC-MOB-OPS-TSK-HP-002 | FR-HRM-OP-03 | same | PATCH status | | Xong |
| TC-MOB-OPS-SVC-HP-001/002 | FR-HRM-11 | HRM-SV-02 | approve/reject | **AC-PERS-TILE-SR-01** | Duyệt DV |
| TC-MOB-OPS-LD-HP-001 | UC-HRM-MOB-11 | PLAN mobile | GET both lists | H8b API smoke ref | Mở màn |
| TC-MOB-OPS-UNIT-001 | U72 M-F-06 | display-label rule | — | | Label VI |

---

## 6. Out of scope / cross-pack

| Item | Owner pack | TC in MOB-OPERATIONS |
|------|------------|----------------------|
| Settings row visibility (mgr/ESS) | **MOB-SETTINGS** | AU-001/002 boundary · NAV-001 depth |
| Home tile inventory · FAB | **MOB-HOME** | NAV-002 entry · không hub «Việc cần làm» depth |
| Profile ESS tabs · Contracts | **MOB-PROFILE** | screen name cross-ref only |
| ManagerApprovals leave/att | **MOB-LEAVE-APPR** | không duplicate |
| Web CC `/hrm/tasks` · internal-services full CRUD | **HRM-TASKS** / web packs | API parity note only |
| Service request **create** on mobile | **SPEC_GAP** / web HRM-SV | list+decide only |
| Task **detail** GET-by-id | web GWC 404 residual | mobile inline actions only |
| `pnpm seed:hrm:operations-density` | **cấm U65** evidence | env data only |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-mob-operations-01.md
next_owner: qa-synth (roster MOB-OPERATIONS + dedupe TC-MOB-SET-AU-001 vs TC-MOB-OPS-NAV-*)
counts: screens=14 fields=24 functions=13 tcs=32 (all PLANNED design)
catalog_map: UC-HRM-MOB-11 · J-MOB-17 ext · AC-PERS-TILE-TSK/SR-01 · MOB-UX-12d
cross_ref: MOB-SETTINGS · MOB-HOME · MOB-PROFILE (entry only)
```

*PO-ECO-TC-MOB-OPERATIONS-01 · WORLD-STANDARD depth pack · no UAT execution claim*
