#!/usr/bin/env python3
"""Tạo lại data/org-seed-member-companies.json từ file Excel MTCV."""
import json
import os
import re
import sys
import unicodedata
from collections import defaultdict

try:
    import openpyxl
except ImportError:
    print('pip install openpyxl')
    sys.exit(1)

DEFAULT_XLSX = (
    '/Users/uranus/Desktop/Unicom Profile/C DIỆP GỬI, TỔNG HỢP MTCV VÀ QUY TRÌNH '
    'CÁC PHÒNG/HỆ THỐNG CHỨC DANH - Công ty thành viên.xlsx'
)

SLUG = {
    'Công ty Cổ phần Thương mại và Dịch vụ X.E': 'xe-tmdv',
    'Công ty TNHH Du lịch Visun': 'visun',
    'Công ty TNHH Du lịch X.E Việt Nam': 'xe-du-lich',
    'Công ty TNHH X.E Việt Nam': 'xe-vietnam',
}

SHORT = {
    'Công ty Cổ phần Thương mại và Dịch vụ X.E': 'X.E TM-DV',
    'Công ty TNHH Du lịch Visun': 'Visun',
    'Công ty TNHH Du lịch X.E Việt Nam': 'X.E Du lịch VN',
    'Công ty TNHH X.E Việt Nam': 'X.E Việt Nam',
}


def slugify(name: str) -> str:
    n = name.strip()
    return SLUG.get(n, re.sub(r'[^a-z0-9]+', '-', n.lower())[:40] or 'co-unknown')


def codeify(text: str, prefix: str, idx: int) -> str:
    s = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').upper()[:24]
    return s or f'{prefix}-{idx}'


def main() -> None:
    xlsx = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('SEED_EXCEL_PATH', DEFAULT_XLSX)
    wb = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)
    ws = wb.active
    companies: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        co = str(row[0]).strip()
        dept = str(row[1]).strip() if row[1] else ''
        pos = str(row[2]).strip() if row[2] else ''
        if dept and pos:
            companies[co][dept].add(pos)

    out = {
        'tenantId': 'xevn',
        'holding': {
            'companyId': 'holding',
            'code': 'XEVN-HOLDING',
            'name': 'Tập đoàn XeVN',
            'entityType': 'holding',
        },
        'subsidiaries': [],
    }
    for co_name, depts in sorted(companies.items()):
        cid = slugify(co_name)
        sub = {
            'companyId': cid,
            'code': cid.upper().replace('-', '_')[:20],
            'name': co_name,
            'shortName': SHORT.get(co_name, co_name[:40]),
            'entityType': 'subsidiary',
            'departments': [],
        }
        for di, (dept_name, positions) in enumerate(sorted(depts.items())):
            dc = codeify(dept_name, 'DEPT', di)
            dept = {'code': dc, 'name': dept_name, 'orgType': 'department', 'positions': []}
            for pi, pos_name in enumerate(sorted(positions)):
                dept['positions'].append({'code': f'{dc}-{codeify(pos_name, "POS", pi)}'[:48], 'name': pos_name})
            sub['departments'].append(dept)
        out['subsidiaries'].append(sub)

    out_path = os.path.join(os.path.dirname(__file__), '../data/org-seed-member-companies.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f'Wrote {out_path} ({len(out["subsidiaries"])} companies)')


if __name__ == '__main__':
    main()
