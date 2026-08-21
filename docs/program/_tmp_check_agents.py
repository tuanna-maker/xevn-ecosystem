from pathlib import Path
import json

base = Path(
    r"c:\Users\ADMIN\.cursor\projects\c-Users-ADMIN-OneDrive-Ta-i-li-u-Vibe-Coding-projects-xevn-ecosystem\agent-transcripts\47a387e2-2923-4e57-aa06-5b6bf2253b7d\subagents"
)
agents = {
    "WBS-FROM-GAP": "222509fd-06f3-46fd-b9db-678eed852584",
    "GAP-R2": "36fbf08f-5942-4de9-95af-bd50db640605",
    "ATT-QA": "b85695ea-ffe5-44db-9981-60a8c2ccdd09",
    "PAY-API": "25fa6c1a-24a8-4e34-9228-8d98d445b8e5",
    "EXPORT-QC": "f1ab751f-8f15-4b8b-ba3d-9fdce35c5061",
    "UC-GAP-01": "dd763c8f-4e9b-416c-a30c-a1ca89d072f7",
}
for label, aid in agents.items():
    p = base / f"{aid}.jsonl"
    if not p.exists():
        print(f"{label}: MISSING")
        continue
    t = p.read_text(encoding="utf-8", errors="replace")
    ended = "turn_ended" in t
    roles = []
    for line in t.splitlines():
        if line.startswith("{"):
            try:
                roles.append(json.loads(line).get("role", "?"))
            except Exception:
                pass
    print(
        f"{label}: size={p.stat().st_size} ended={ended} n={len(roles)} last={roles[-1] if roles else '?'}"
    )

print("--- evidence ---")
for f in [
    "docs/qa/evidence/po-hrm-bp-wbs-from-gap-01.md",
    "docs/qa/evidence/po-hrm-bp-synth-docs-01.md",
    "docs/qa/evidence/po-hrm-bp-uc-gap-matrix-r2.md",
    "docs/qa/evidence/po-hrm-bp-att-deep-qa-01.md",
    "docs/qa/evidence/po-hrm-bp-uc-gap-matrix-01.md",
    "docs/qa/evidence/po-hrm-bp-synth-pay-api-01.md",
    "docs/qa/evidence/po-mfd-m3-emp-export-qc-01.md",
    "docs/qa/professional/menu-fidelity/ATT_SURFACE_INVENTORY_DEEP.md",
]:
    pp = Path(f)
    print(("OK" if pp.exists() else "MISS"), f, pp.stat().st_size if pp.exists() else 0)

# Tail WBS and ATT-QA for failure hint
for label, aid in [
    ("WBS-FROM-GAP", "222509fd-06f3-46fd-b9db-678eed852584"),
    ("ATT-QA", "b85695ea-ffe5-44db-9981-60a8c2ccdd09"),
    ("GAP-R2", "36fbf08f-5942-4de9-95af-bd50db640605"),
]:
    p = base / f"{aid}.jsonl"
    if not p.exists():
        continue
    t = p.read_text(encoding="utf-8", errors="replace")
    print(f"\n=== {label} TAIL ===")
    # find last turn_ended or last assistant text snippet
    if "turn_ended" in t:
        idx = t.rfind("turn_ended")
        print(t[max(0, idx - 200) : idx + 120].replace("\n", " ")[:300])
    else:
        print("NO turn_ended — likely aborted mid-run")
        print(t[-400:].replace("\n", " ")[:300])
