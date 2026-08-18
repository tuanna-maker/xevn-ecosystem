# QC — audit of BA-CTR-TPL-8-CLAUSE-MAP-01 §7.6 "all 6 open items CLOSED"

| Meta | Value |
|---|---|
| work_item_id | QC-BA-CTR-TPL-8-CLAUSE-MAP-01-S7-01 |
| audited_file | docs/program/specs/BA-CTR-TPL-8-CLAUSE-MAP-01.md |
| method | Read-only cross-check of §7.6 against §7.1 (verbatim sponsor answers), §7.2–§7.5, and TEAM_CLAUDE_ROLLING_QUEUE.md §3 item #10 |
| ack_status | **PASS_TO_PM** |

## Verdict per §7.6 row

| # | Was | Disposition | Verdict | Evidence |
|---|---|---|---|---|
| 1 | Q1 competitor evidence (AMIS HRM BH-base field) | DEFERRED to research phase | **HONEST** | §7.1 Q1 verbatim asks for exactly this research ("nghiên cứu quy định ở nước Việt Nam đi, có thể nghiên cứu thêm cả AMIS HRM..."). Deferring is the only faithful reading — the answer is an instruction to research, not a decision. |
| 2 | Q1 regulation text (is QĐ 127A/2022/QĐ-TTg the current BH-base cap?) | DEFERRED | **HONEST** | §7.1 has no separate Q1-cap row; the cap question was folded into Q1's "nghiên cứu quy định" branch. §7.2 line 161 records the cap as "genuine business logic" but §7.2 line 170-175 explicitly says "NOT YET VERIFIED... I will not fabricate". DEFERRED is the correct, non-downgraded reading. |
| 3 | Q2 — bind 6 or 8 of the 8 starter templates? | CLOSED — bind exactly 6, drop 2 TV | **HONEST** | §7.1 Q2 = "bind 6 thôi". A one-word decision. CLOSED is correct. |
| 4 | Q1 cap — accept 2× regional-minimum cap hint? | CONDITIONAL | **HONEST** | Not separately answered in §7.1; governed by Q1's "nếu chỉ là con số..." branch. CONDITIONAL is *weaker* than CLOSED, so no silent downgrade. Correct. |
| 5 | Q3 — insurance bootstrap mandatory or optional? | CLOSED — optional | **HONEST** | §7.1 Q3 = "optional thôi". CLOSED correct. |
| 6 | Q4 — bind per template or one common clause? | CLOSED — per-template dynamic, empty = manual fill | **HONEST** | §7.1 Q4 = "bind theo template, phải cấu hình động... có thể option nữa là để trống rồi điền tay". CLOSED correct, and §7.5 implements exactly that option. |

**No row is stronger than its sponsor answer.** Rows 1/2/4 are DEFERRED or CONDITIONAL precisely because the sponsor did not decide them — the table does not upgrade a non-answer into a closure.

## The 6 checks

**Check 1 — Verbatim fidelity of §7.1.** PASS. All six §7.1 cells reproduce the sponsor's words without paraphrase that changes meaning: Q1 keeps the full two-branch sentence; Q2/Q3 are single-word answers quoted as-is; Q4 keeps "để trống rồi điền tay". No editorialising.

**Check 2 — Disposition honesty.** PASS. See verdict table above. The one subtlety: §7.6 row 3 labels Q2 "CLOSED" and §7.3 then writes a full design (which 6, drop 2 TV, hide the TV tab). That is a *design for a dev WI*, not a claim of shipped code — and §7.3's own wording ("The composer UI hides the TV tab when bind_count=6 is active; it can be re-enabled by flipping a config flag") reads as configuration intent, not implementation status. Acceptable.

**Check 3 — No fabrication.** PASS. §7.2 lines 169-175 state in capitals: "NOT YET VERIFIED. The WebSearch/WebFetch gateway is returning 400... I have not seen live AMIS HRM screens, and I will not fabricate their BH-base modelling." The spec does not claim competitor data it does not have. The cap rule (§7.2 line 161, §7.6 row 2/4) is labelled "Must be verified against the live text before go-live" and "display-only, computed, not user-editable" — it is recorded as an unverified hint, not as settled law. No fabricated regulation.

**Check 4 — No invented open items.** PASS. §7.6 closes with "No new open items invented." Scan of the whole file finds exactly four question markers, all in §6 and all resolved in §7.6. §7.3/§7.4/§7.5 are design sections, not open questions. Nothing unresolved is left dangling without a disposition.

**Check 5 — Downstream consistency.** PASS. §7.3/§7.4/§7.5 are explicitly design-for-a-dev-WI: §7.5 line 219 "The composer resolves the final clause list per template at render time — no hard-coded mapping"; §7.3 line 192 "it can be re-enabled by flipping a config flag". The file's Handoff block (line 107-110) still reads `ack_status: PASS_TO_PM`, `Dev unlock: NO — docs-only, no apps/** changes`. No §7.3-§7.5 line claims code exists. Consistent.

**Check 6 — Rolling queue consistency.** PASS. `TEAM_CLAUDE_ROLLING_QUEUE.md` §3 item #10 reads `BA-CTR-TPL-8-CLAUSE-MAP-01 | DONE | ba-process (docs-only) | ... — **không** ghi apps/**`. No §3 row was flipped to claim code work as a result of this closure. Item #10 remains correctly docs-only.

## Honest limitation

This audit is **text-only**. It verifies internal consistency of the spec document against the recorded sponsor answers — it does not verify the sponsor answers themselves against the live regulation text or against AMIS HRM screens (both deferred per §7.6 rows 1/2, and both blocked by the `400 ENABLE_WEB_SERVER_TO_TOOLS=false` gateway). That verification is the research-phase work, not this QC's scope.

**ack_status: PASS_TO_PM** — all 6 checks pass, no fabricated resolutions, no invented open items, no silent downgrade of a CLOSED to a softer state.
