# -*- coding: utf-8 -*-
import json
from pathlib import Path

d = json.loads(Path("docs/qa/evidence/_tmp-sponsor-chot-remaining-read.json").read_text(encoding="utf-8"))
lines: list[str] = []
lines.append("===01===")
for row in d.get("01_Con_can_chot", []):
    v = row["v"]
    if row["r"] >= 4 and v[1]:
        lines.append("%s || %s || %s" % (v[1], v[5], v[6]))
lines.append("===02===")
for row in d.get("02_18_MISSING", []):
    v = row["v"]
    if row["r"] >= 4 and v[1]:
        lines.append("%s || %s || %s" % (v[1], v[4], v[5]))
lines.append("===03===")
for row in d.get("03_UC_Lich_EXPAND", []):
    v = row["v"]
    if row["r"] >= 4 and v[1]:
        lines.append("%s || %s || %s" % (v[1], v[4], v[5]))
Path("docs/qa/evidence/_tmp-remaining-summary.txt").write_text("\n".join(lines), encoding="utf-8")
print("ok", len(lines))
