import pathlib, json
from datetime import datetime, timezone, timedelta
ICT = timezone(timedelta(hours=7))
now = datetime.now(ICT).isoformat()
inbox = pathlib.Path('.cursor/team/inbox/peer-pm.jsonl')
bus = pathlib.Path('.cursor/team/AGENT_MESSAGE_BUS.md')
items = [
    ("ALL", "BROADCAST", "UNLOCK-WAVE-B-20260729",
     "Sponsor chot Wave B 2026-07-28; members tu nhan theo role"),
    ("qc", "DISPATCHED", "MOB-XEVN-BRAND-TOKENS-L1-01",
     "Brand token L1 verification; emit qc->pm verdict"),
    ("qc", "DISPATCHED", "MOB-XEVN-BRAND-PRIMITIVES-L2-01",
     "Brand primitives L2 verification; emit qc->pm verdict"),
    ("qc", "DISPATCHED", "HRM-EMP-COMPANY-COL-01",
     "Company-col sync visual regression; emit qc->pm verdict"),
    ("qa", "DISPATCHED", "MOB-SPEC-ORPHAN-CODE-SAMPLE-01",
     "Orphan code sample audit; emit qa->pm READY_FOR_QC"),
    ("qc", "DISPATCHED", "P1-EX-QA-HTTPS-RESIDUAL-03-R3",
     "HTTPS residual R3 verification; reconcile state"),
    ("qa", "DISPATCHED", "HRM-SETTINGS-MASTER-DATA-01",
     "Master data settlement QA probe; emit qa->pm PASS_TO_PM"),
    ("qc", "DISPATCHED", "HOOK-qa-276034_5",
     "Narrow probe ERP fidelity multi-domain spot"),
    ("qc", "DISPATCHED", "HOOK-qa-309fd5_5",
     "Narrow probe HRM settings picker spot"),
    ("qc", "DISPATCHED", "HRM-MD-PICKER-SPOT-01",
     "Verify markdown picker spot on HRM settings"),
]
with inbox.open('a', encoding='utf-8') as f:
    for to, ack, wid, topic in items:
        entry = {"at": now, "to": to, "from": "pm", "ack_status": ack,
                 "topic": topic, "work_item_id": wid}
        f.write(json.dumps(entry, ensure_ascii=False) + '\n')
bus_tail = bus.read_text(encoding='utf-8', errors='replace').splitlines()[-5:]
bus_entry = []
bus_entry.append('')
bus_entry.append('### {} | PM -> {} | {}'.format(now, items[0][0], items[0][1]))
bus_entry.append('- **Type:** UNLOCK_WAVE_B_ALL')
bus_entry.append('- **Items:** ' + ', '.join(i[2] for i in items[1:]))
bus_entry.append('- **Rule:** members tu nhan theo role; moi item = 1 deliverable')
bus_entry.append('')
with bus.open('a', encoding='utf-8') as f:
    f.write('\n'.join(bus_entry))
print('OK:', len(items), 'entries ->', inbox)
print('Bus updated ->', bus)
