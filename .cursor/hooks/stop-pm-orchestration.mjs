/**
 * stop hook — khi Composer Agent kết thúc một vòng, có thể tự gửi prompt tiếp theo (followup_message).
 * Docs: https://cursor.com/docs/agent/hooks — `stop` + `loop_limit`.
 *
 * Bật liên tục: tạo/ghi file `.cursor/team/PM_ORCHESTRATION_MODE` với nội dung dòng đầu là `RUN`.
 * Tắt: ghi `STOP`.
 *
 * Env tuỳ chọn:
 *   PM_STOP_LOOP_MAX — số lần auto-followup tối đa mỗi phiên (mặc định 12).
 */

import fs from "node:fs/promises";
import path from "node:path";

const MODE_PATH_SEG = [".cursor", "team", "PM_ORCHESTRATION_MODE"];
const MAX_DEFAULT = 12;

async function readMode(root) {
  const p = path.join(root, ...MODE_PATH_SEG);
  try {
    const raw = (await fs.readFile(p, "utf8")).trim();
    const first = raw.split(/\r?\n/)[0]?.trim().toUpperCase() ?? "";
    return first === "RUN" ? "RUN" : "STOP";
  } catch {
    return "STOP";
  }
}

async function readLiveStatusLine(root) {
  try {
    const p = path.join(root, "docs", "program", "TEAM_LIVE_STATUS.md");
    const raw = await fs.readFile(p, "utf8");
    const line =
      raw.split(/\r?\n/).find((l) => l.includes("Last updated:")) ?? "";
    const s = line.trim();
    return s.length ? s.slice(0, 260) : "(no Last updated line)";
  } catch {
    return "(TEAM_LIVE_STATUS.md unreadable)";
  }
}

/** Last chunk of formal bus — large enough to include `QA -> PM` after long Dev-BE handoffs. */
async function readBusTailHint(root) {
  const p = path.join(root, "docs", "program", "AGENT_MESSAGE_BUS.md");
  const maxBytes = 56 * 1024;
  try {
    const fh = await fs.open(p, "r");
    try {
      const st = await fh.stat();
      if (st.size === 0) return { tail: "", verdict: "" };
      const n = Math.min(st.size, maxBytes);
      const buf = Buffer.alloc(n);
      await fh.read(buf, 0, n, st.size - n);
      let text = buf.toString("utf8");
      const cut = text.indexOf("\n");
      if (st.size > n && cut >= 0) text = text.slice(cut + 1);
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const tail = lines
        .slice(-8)
        .map((l) => l.trim().replace(/\s+/g, " ").slice(0, 160))
        .join(" | ");
      let verdict = "";
      for (let i = lines.length - 1; i >= 0; i--) {
        const L = lines[i];
        if (L.startsWith("## ") && L.includes("QA -> PM")) {
          verdict = L.trim().slice(0, 220);
          break;
        }
      }
      if (!verdict && /\*\*`PASS_TO_PM`\*\*/.test(text))
        verdict = "(tail includes QA PASS_TO_PM — see full bus)";
      const out = tail.length > 560 ? tail.slice(-560) : tail;
      return { tail: out, verdict };
    } finally {
      await fh.close();
    }
  } catch {
    return { tail: "", verdict: "" };
  }
}

async function buildFollowup(root, loopCount) {
  const snap = await readLiveStatusLine(root);
  const { tail: busHint, verdict: busVerdict } = await readBusTailHint(root);
  return [
    "[PM_ORCHESTRATION auto-followup]",
    "**SLO lượt này (tránh treo):** Nếu `Bus verdict hint` / đuôi bus đã là `QA -> PM` + `PASS_TO_PM` và **không** có `READY_FOR_QA` **sau** entry đó → **chỉ** ghi 1 dòng `PM -> ALL` idle/backlog trên bus **hoặc** khuyến nghị user `STOP` hook — **không** gọi Task QA trùng, **không** viết plan dài trước khi đọc bus.",
    `**Live snapshot:** ${snap}`,
    busVerdict ? `**Bus verdict hint:** ${busVerdict}` : "",
    busHint ? `**Bus tail (formal):** ${busHint}` : "**Bus tail:** (unreadable)",
    `**Hook loop_count:** ${loopCount} (reset về 0 khi mở phiên Composer mới — “Vòng #1” lặp lại là bình thường; tiến độ thật nằm ở bus + dòng snapshot phía trên.)`,
    `Vòng tự động #${loopCount + 1} — PM Auto Mode: đọc ngay đuôi \`docs/program/AGENT_MESSAGE_BUS.md\` + \`docs/program/TEAM_LIVE_STATUS.md\` + (nếu có) vài dòng cuối \`.cursor/team/inbox/subagent-stop.jsonl\`.`,
    "Quyết định bước kế: nếu có READY_FOR_QA / PASS_TO_PM / blocker thì gọi Task (qa/dev-be/dev-fe/qc/tm) tương ứng; không kết thúc chỉ bằng một câu xác nhận.",
    "**Quan trọng:** prompt auto-followup **không** tự chạy subagent / Task — chỉ là user message. Subagent chỉ chạy khi **agent trong phiên gọi tool Task** (hoặc bạn bấm chạy). Luôn **đọc đuôi bus** trước; có thể work đã xong trên disk mà UI chưa hiện subagent.",
    "Khi muốn dừng hẳn vòng tự động: ghi \`STOP\` vào \`.cursor/team/PM_ORCHESTRATION_MODE\` (dòng đầu).",
    "Lưu ý nền tảng Cursor: hook \`stop\` **chỉ** inject follow-up khi agent kết thúc với \`status: completed\`; abort/error → **không** có prompt tiếp theo (xem Cursor docs Agent hooks / \`followup_message\`).",
  ]
    .filter((line) => String(line).trim().length > 0)
    .join("\n");
}

async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    const payload = raw ? JSON.parse(raw) : {};
    const status = String(payload.status ?? "");
    const loopCount = Number(payload.loop_count ?? 0);
    const root = process.cwd();

    const mode = await readMode(root);
    if (mode !== "RUN") {
      process.stdout.write(JSON.stringify({}));
      return;
    }

    const maxLoops = Math.max(
      1,
      Number.parseInt(String(process.env.PM_STOP_LOOP_MAX ?? MAX_DEFAULT), 10) || MAX_DEFAULT
    );
    if (loopCount >= maxLoops) {
      process.stdout.write(JSON.stringify({}));
      return;
    }

    if (status !== "completed") {
      process.stdout.write(JSON.stringify({}));
      return;
    }

    process.stdout.write(
      JSON.stringify({
        followup_message: await buildFollowup(root, loopCount),
      })
    );
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
}

main();
