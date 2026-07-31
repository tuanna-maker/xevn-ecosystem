/**
 * Gợi ý dispatch cụ thể cho PM (100% tiếng Việt) — dùng chung stop + subagentStop.
 */

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

const INBOX_SEG = [".cursor", "team", "inbox", "subagent-stop.jsonl"];

export async function readLatestInbox(root) {
  const p = path.join(root, ...INBOX_SEG);
  try {
    const raw = await fs.readFile(p, "utf8");
    const lines = raw.trim().split(/\r?\n/).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const rec = JSON.parse(lines[i]);
        const st = String(rec.status || "").toLowerCase();
        if (st === "completed" || st === "success") return rec;
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* no file */
  }
  return null;
}

function pickWorkItem(text) {
  const m = text.match(/P1-EX-[A-Z0-9-]+/i);
  return m ? m[0].toUpperCase() : "";
}

function qaToQcWorkItem(id) {
  if (!id) return "P1-EX-QC-HTTPS-WAVE-TIEP";
  return id.replace(/^P1-EX-QA-/, "P1-EX-QC-");
}

function feResidualNextRound(id) {
  const m = String(id || "").match(/-R(\d+)$/i);
  const n = m ? Number.parseInt(m[1], 10) + 1 : 5;
  return `P1-EX-FE-BE-HTTPS-RESIDUAL-03-R${n}`;
}

/** ack gần nhất trong đuôi bus (không quét cả file). */
function parseLatestAck(busTail) {
  const tail = (busTail || "").split(/\r?\n/).slice(-120).join("\n");
  if (/ack_status:\s*`FAIL_TO_PM`/i.test(tail) || /ack_status:\s*\*\*FAIL_TO_PM\*\*/i.test(tail))
    return "FAIL_TO_PM";
  if (/ack_status:\s*`PASS_TO_PM`/i.test(tail) || /ack_status:\s*\*\*PASS_TO_PM\*\*/i.test(tail))
    return "PASS_TO_PM";
  if (/Overall QA Verdict[\s\S]{0,400}\*\*FAIL\*\*/i.test(tail)) return "FAIL_TO_PM";
  if (/\|\s*qa\s*->\s*pm[\s\S]{0,600}FAIL/i.test(tail)) return "FAIL_TO_PM";
  return "";
}

function lastPmDispatchRole(busTail) {
  const lines = busTail.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const L = lines[i];
    const m = L.match(/^\#\#.*\|\s*pm\s*->\s*(\w+)/i);
    if (m && /DISPATCHED/i.test(busTail.slice(Math.max(0, busTail.indexOf(L) - 200), busTail.indexOf(L) + 400)))
      return m[1].toLowerCase();
  }
  return "";
}

const ORCH_STATE_SEG = ["docs", "program", "PM_ORCHESTRATION_STATE.json"];

export async function readOrchestrationState(root) {
  try {
    const raw = await fs.readFile(path.join(root, ...ORCH_STATE_SEG), "utf8");
    return JSON.parse(raw);
  } catch {
    return { closed_work_items: [] };
  }
}

export async function isWorkItemClosed(root, workItemId) {
  const st = await readOrchestrationState(root);
  const id = String(workItemId || "").toUpperCase();
  return (st.closed_work_items || []).some((w) => String(w).toUpperCase() === id);
}

/** Wave đã PASS_TO_PM / VERIFIED trên bus hoặc state file → không watchdog dispatch lại. */
export function isWaveClosedOnBus(busTail) {
  const tail = (busTail || "").split(/\r?\n/).slice(-200).join("\n");
  if (/HTTPS-PILOT-WAVE-CLOSED|WATCHDOG stale.*JWT already GO/i.test(tail)) return true;
  if (/WATCHDOG-LOOP-BREAK|HTTPS-RESIDUAL-03-R4.*CLOSED|SUPERSEDE.*HTTPS-RESIDUAL-03-R4|R4-LOOP-BREAK/i.test(tail))
    return true;
  if (/P1-EX-BE-HTTPS-P-CC-01-JWT[\s\S]{0,800}PASS_TO_PM[\s\S]{0,400}GO/i.test(tail))
    return true;
  if (/P1-EX-PM-HTTPS-PROBE-PROMOTE[\s\S]{0,200}VERIFIED/i.test(tail)) return true;
  if (/P1-EX-QC-HTTPS-P-CC-01-JWT[\s\S]{0,400}PASS_TO_PM/i.test(tail)) return true;
  // 2026-07-28: QC GWC freshness closed + SUPERSEDE re-dispatch — stop JWT loop
  if (/SUPERSEDE(#\d+)?\s+P1-EX-BE-HTTPS-P-CC-01-JWT/i.test(tail)) return true;
  if (/P-CC-01-jwt\s+\*\*CLOSED\*\*/i.test(tail)) return true;
  if (/INTAKE\s+P1-EX-QC-HTTPS-P-CC-01-JWT[\s\S]{0,200}GWC/i.test(tail)) return true;
  if (/IDLE-OK.*JWT|JWT already QC GO|JWT-LOOP-BREAK/i.test(tail)) return true;
  return false;
}

/** work_item đã có QA PASS + QC verdict trên bus → không dispatch lại (tránh loop R4). */
export function isWorkItemVerdictClosedOnBus(busTail, workItemId) {
  const id = String(workItemId || "").toUpperCase();
  if (!id) return false;
  const tail = (busTail || "").split(/\r?\n/).slice(-250).join("\n");
  const qaPass = new RegExp(`${id}[\\s\\S]{0,1200}qa\\s*->\\s*pm[\\s\\S]{0,400}PASS_TO_PM`, "i").test(
    tail
  );
  const qcPass = new RegExp(
    `${id.replace(/^P1-EX-QA-/, "P1-EX-QC-")}[\\s\\S]{0,1200}qc\\s*->\\s*pm[\\s\\S]{0,400}PASS_TO_PM`,
    "i"
  ).test(tail);
  return qaPass && qcPass;
}

/** Ưu tiên wave P100 đang mở từ đuôi bus (không đào RESIDUAL cũ). */
function deriveP100NextFromBus(busTail) {
  const tail = (busTail || "").split(/\r?\n/).slice(-80).join("\n");
  if (/P1-P100-W10-DEVICE-02[\s\S]{0,600}FAIL/i.test(tail))
    return {
      workItemId: "P1-P100-W10-MOB-FIX-01",
      role: "dev-mobile",
      actionVi:
        "DEVICE-02 FAIL — sửa MOB-HEADER: x-company-id phải legal UUID, không slug main; rebuild APK; READY_FOR_QA.",
      closed: false,
    };
  if (/P1-P100-W10-QC-01[\s\S]{0,600}PASS_TO_PM/i.test(tail) && !/P1-P100-W11/i.test(tail))
    return {
      workItemId: "P1-P100-W11-SA-01",
      role: "sa",
      actionVi: "Wave 11 governance — SA NFR sign-off; đọc p1-p100-w10-tm-01 + qa-01 evidence.",
      closed: false,
    };
  if (/P1-P100-W10-QA-01[\s\S]{0,400}PASS_TO_PM/i.test(tail))
    return {
      workItemId: "P1-P100-W10-QC-01",
      role: "qc",
      actionVi: "QC W10 — chỉ nếu chưa có verdict trên bus.",
      closed: /P1-P100-W10-QC-01[\s\S]{0,600}PASS_TO_PM/i.test(tail),
    };
  return null;
}

/** Trả về { workItemId, role, actionVi, doneWhenVi, fromRole, fromTitle } */
export function deriveDispatchHint({ busTail, inboxRec, root: rootArg }) {
  const root = rootArg || process.cwd();
  let backlog = null;
  try {
    const p = path.join(root, "docs", "program", "PM_OPEN_BACKLOG.json");
    const st = fsSync.statSync(p);
    if (Date.now() - st.mtimeMs < 30 * 60 * 1000) {
      backlog = JSON.parse(fsSync.readFileSync(p, "utf8"));
    }
  } catch {
    /* stale or missing */
  }

  if (backlog?.dispatchRequired?.length) {
    const top = backlog.dispatchRequired[0];
    return {
      workItemId: top.workItemId,
      role: top.role,
      actionVi: top.reason,
      doneWhenVi: "Chạy pm:scan:backlog sau dispatch; Task trước bus DISPATCHED.",
      fromRole: String(inboxRec?.subagent_type || "pm").toLowerCase(),
      fromTitle: inboxRec?.title || "",
      closed: false,
    };
  }

  const role = String(inboxRec?.subagent_type || "").toLowerCase();
  const title = String(inboxRec?.title || "").toLowerCase();
  const bus = busTail || "";
  const blob = `${bus}\n${title}`;

  const p100 = deriveP100NextFromBus(bus);
  if (p100) {
    return {
      ...p100,
      doneWhenVi: "Task trước, ghi bus DISPATCHED sau.",
      fromRole: role,
      fromTitle: inboxRec?.title || "",
    };
  }

  if (isWaveClosedOnBus(bus)) {
    return {
      workItemId: "P1-EX-PM-IDLE",
      role: "pm",
      actionVi:
        "Wave HTTPS pilot đã đóng (QC GO probe). Chỉ cập nhật TEAM_WORKING_NOW + bus VERIFIED; không Task trùng.",
      doneWhenVi: "Không dispatch lại P-CC-01-jwt.",
      fromRole: role,
      fromTitle: inboxRec?.title || "",
      closed: true,
    };
  }

  let workItemId = pickWorkItem(bus) || "P1-P100-W11-SA-01";
  if (isWorkItemVerdictClosedOnBus(bus, workItemId)) {
    return {
      workItemId: "P1-P100-W11-SA-01",
      role: "sa",
      actionVi:
        "Work item cũ đã đóng trên bus — mở Wave 11 (SA/BA/QA-02), không lặp HTTPS RESIDUAL R4.",
      doneWhenVi: "Không Task R4.",
      fromRole: role,
      fromTitle: inboxRec?.title || "",
      closed: true,
    };
  }
  if (/residual-03-r4-deploy|deploy residual r4/i.test(blob))
    workItemId = "P1-EX-QA-HTTPS-RESIDUAL-03-R4";
  else if (/residual.*r4|residual-03-r4/i.test(blob)) workItemId = "P1-EX-QA-HTTPS-RESIDUAL-03-R4";
  if (isWorkItemVerdictClosedOnBus(bus, workItemId)) {
    return {
      workItemId: "P1-P100-W11-SA-01",
      role: "sa",
      actionVi: "HTTPS RESIDUAL-03-R4 đã QA+QC PASS — Wave 11 governance.",
      doneWhenVi: "Không lặp R4.",
      fromRole: role,
      fromTitle: inboxRec?.title || "",
      closed: true,
    };
  }
  else if (/residual.*r3/i.test(blob)) workItemId = "P1-EX-QA-HTTPS-RESIDUAL-03-R3";
  else if (/browser-auth-02-r2|auth.*r2/i.test(blob)) workItemId = "P1-EX-QA-HTTPS-BROWSER-AUTH-02-R2";
  else if (/l25|data-journey|data-seed/i.test(blob)) workItemId = "P1-EX-QA-HTTPS-L25-DATA-JOURNEY-01";

  let nextRole = "qa";
  let actionVi =
    "Đọc 30 dòng cuối docs/program/AGENT_MESSAGE_BUS.md; dispatch owner theo ack_status (READY_FOR_QA → qa, FAIL → dev-fe).";

  if (role === "dev-fe" || role === "dev-be") {
    nextRole = "qa";
    actionVi =
      "QA retest runtime HTTPS ngay: attendance ?portal=1&companyId=main, xác nhận không còn fallback 127.0.0.1:54321 và API attendance 200.";
  } else if (role === "devops") {
    nextRole = "qa";
    actionVi =
      "QA smoke sau deploy: xác nhận bản build mới trên http://14.225.217.232:8088 và ghi evidence PASS/FAIL.";
  } else if (role === "qa") {
    const ack = parseLatestAck(bus);
    // R4 attendance localhost already CLOSED (2026-05-31) — never re-inject
    if (
      /HTTPS-RESIDUAL-03-R4|P1-EX-FE-BE-HTTPS-RESIDUAL-03-R4|R4-LOOP-BREAK/i.test(bus) &&
      /CLOSED|PASS_TO_PM|SUPERSEDE/i.test(bus)
    ) {
      nextRole = "pm";
      workItemId = "P1-EX-PM-IDLE";
      actionVi = "HTTPS RESIDUAL-03-R4 đã CLOSED — không Task Dev-FE 54321; đọc wave mở (ERP fidelity / Claude).";
    } else if (ack === "FAIL_TO_PM" && /54321|fallbackAllCount\s*[>:=]\s*[1-9]/i.test(bus)) {
      nextRole = "dev-fe";
      workItemId = feResidualNextRound(workItemId);
      actionVi =
        "QA FAIL (fallback 127.0.0.1:54321 còn >0): loại hết Supabase localhost trên attendance HTTPS; READY_FOR_QA.";
    } else if (ack === "FAIL_TO_PM") {
      nextRole = "pm";
      workItemId = "P1-EX-PM-IDLE";
      actionVi = "QA FAIL — đọc residual thật trên bus/evidence; không mặc định R4 54321.";
    } else {
      nextRole = "qc";
      workItemId = qaToQcWorkItem(workItemId);
      actionVi = "QC gate: đọc evidence QA, GO / GWC / NO-GO.";
    }
  } else if (role === "qc") {
    // JWT residual đã CLOSED (GWC dual 86400) — không fallback Dev-BE JWT nữa
    if (
      /SUPERSEDE(#\d+)?\s+P1-EX-BE-HTTPS-P-CC-01-JWT|P-CC-01-jwt\s+\*\*CLOSED\*\*|JWT-LOOP-BREAK/i.test(
        bus
      )
    ) {
      nextRole = "pm";
      workItemId = "P1-EX-PM-IDLE";
      actionVi =
        "P-CC-01-jwt đã CLOSED — không Task Dev-BE JWT; intake wave mở (nip.io / UX) nếu còn.";
    } else if (
      (/P-CC-01-jwt|C-JCC03-01/i.test(bus) || /j-cc-03|p-cc-04c/i.test(title)) &&
      /FAIL|expiresInSec(?!\s*=\s*86400)|probe exit\s*1/i.test(bus)
    ) {
      nextRole = "dev-be";
      workItemId = "P1-EX-BE-HTTPS-P-CC-01-JWT-01";
      actionVi =
        "QC GWC — sửa P-CC-01-jwt (probe expiresInSec); chạy lại tmp-p1-ex-qa-https-01-probe exit 0.";
    } else if (/FAIL_TO_PM|NO-GO/i.test(bus)) {
      nextRole = "dev-fe";
      workItemId = workItemId.replace(/^P1-EX-QC-/, "P1-EX-FE-BE-HTTPS-RESIDUAL-");
      if (!workItemId.includes("RESIDUAL")) workItemId = "P1-EX-FE-BE-HTTPS-RESIDUAL-03-R4";
      actionVi = "QC NO-GO — dev-fe/dev-be sửa residual P0; READY_FOR_QA.";
    } else {
      nextRole = "pm";
      workItemId = "P1-EX-PM-IDLE";
      actionVi = "QC xong — đọc Residual; chỉ Task nếu còn P0 mở (không mặc định JWT).";
    }
  } else if (role === "pm") {
    const dispatched = lastPmDispatchRole(bus);
    nextRole = dispatched || "qa";
    actionVi = `Kiểm tra DISPATCHED cuối bus; nếu owner là ${nextRole} thì Task ${nextRole} chạy ngay, không chỉ cập nhật tài liệu.`;
  }

  const doneWhenVi = "Task trước, ghi bus DISPATCHED sau.";

  return {
    workItemId,
    role: nextRole,
    actionVi,
    doneWhenVi,
    fromRole: role,
    fromTitle: inboxRec?.title || "",
  };
}

export function buildPmFollowupVi({ hint, variant, waitedMin }) {
  const wi = hint.workItemId || "P1-EX-WAVE-TIEP";
  const role = hint.role || "qa";
  const head =
    variant === "watchdog"
      ? `[PM Watchdog ~${waitedMin ?? "?"}p — chưa DISPATCHED]`
      : "[PM — làm ngay]";
  return `${head}\nTool 1: Task subagent_type="${role}" work_item_id="${wi}"\n${hint.actionVi}\nTool 2: bus DISPATCHED pm->${role}. Không plan.`;
}

/** Đã dispatch đúng role trong 5 phút gần đây → bỏ qua followup trùng. */
export function hasFreshDispatch(busTail, expectedRole) {
  const lines = busTail.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const L = lines[i];
    if (!/DISPATCHED/i.test(L)) continue;
    const m = L.match(/^##\s+([0-9T:+\-\.Z]+)/);
    if (!m) continue;
    const t = Date.parse(m[1]);
    if (!Number.isFinite(t) || Date.now() - t > 5 * 60 * 1000) return false;
    if (expectedRole && !new RegExp(`pm\\s*->\\s*${expectedRole}`, "i").test(L)) continue;
    return true;
  }
  return false;
}
