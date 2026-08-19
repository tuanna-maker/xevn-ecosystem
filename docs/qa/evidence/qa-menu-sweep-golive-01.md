# QA Evidence — Menu Sweep Golive
**Date:** 2026-08-19
**Tester:** antigravity (Playwright headless)
**Method:** Playwright page.evaluate() auth inject — no source change

## Kết quả

| # | URL | Label | Status | Body len | Sidebar |
|---|-----|-------|--------|----------|---------|
| 1 | `/hr/` | Dashboard | OK | 378 | Y |
| 2 | `/hr/employees` | Nhan su | OK | 378 | Y |
| 3 | `/hr/contracts` | Hop dong | OK | 377 | Y |
| 4 | `/hr/attendance` | Cham cong | OK | 378 | Y |
| 5 | `/hr/payroll` | Luong | OK | 379 | Y |
| 6 | `/hr/recruitment` | Tuyen dung | OK | 379 | Y |
| 7 | `/hr/insurance` | Bao hiem | OK | 377 | Y |
| 8 | `/hr/decisions` | Quyet dinh | OK | 379 | Y |
| 9 | `/hr/fleet` | Phuong tien | OK | 368 | Y |
| 10 | `/hr/settings?tab=account` | Settings-account | OK | 376 | Y |
| 11 | `/hr/settings?tab=branding` | Settings-branding | OK | 376 | Y |
| 12 | `/hr/settings?tab=master-data` | Settings-master-data | OK | 376 | Y |
| 13 | `/hr/settings?tab=contract-clauses` | Settings-contract-clauses | OK | 376 | Y |
| 14 | `/hr/settings?tab=att-leave-types` | Settings-att-leave-types | OK | 376 | Y |
| 15 | `/hr/settings?tab=jd-master-library` | Settings-jd-master-library | OK | 376 | Y |
| 16 | `/hr/settings?tab=rec-pipeline-stages` | Settings-rec-pipeline-stages | OK | 376 | Y |
| 17 | `/hr/settings?tab=settings-defaults` | Settings-defaults | OK | 376 | Y |

## Raw JSON

```json
[
  {
    "n": 1,
    "path": "/hr/",
    "label": "Dashboard",
    "status": "OK",
    "bodyLen": 378,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 2,
    "path": "/hr/employees",
    "label": "Nhan su",
    "status": "OK",
    "bodyLen": 378,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/employees",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 3,
    "path": "/hr/contracts",
    "label": "Hop dong",
    "status": "OK",
    "bodyLen": 377,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/contracts",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 4,
    "path": "/hr/attendance",
    "label": "Cham cong",
    "status": "OK",
    "bodyLen": 378,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/attendance",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 5,
    "path": "/hr/payroll",
    "label": "Luong",
    "status": "OK",
    "bodyLen": 379,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/payroll",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 6,
    "path": "/hr/recruitment",
    "label": "Tuyen dung",
    "status": "OK",
    "bodyLen": 379,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/recruitment",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 7,
    "path": "/hr/insurance",
    "label": "Bao hiem",
    "status": "OK",
    "bodyLen": 377,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/insurance",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 8,
    "path": "/hr/decisions",
    "label": "Quyet dinh",
    "status": "OK",
    "bodyLen": 379,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/decisions",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 9,
    "path": "/hr/fleet",
    "label": "Phuong tien",
    "status": "OK",
    "bodyLen": 368,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/fleet",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 10,
    "path": "/hr/settings?tab=account",
    "label": "Settings-account",
    "status": "OK",
    "bodyLen": 376,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/settings?tab=account",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 11,
    "path": "/hr/settings?tab=branding",
    "label": "Settings-branding",
    "status": "OK",
    "bodyLen": 376,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/settings?tab=branding",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 12,
    "path": "/hr/settings?tab=master-data",
    "label": "Settings-master-data",
    "status": "OK",
    "bodyLen": 376,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/settings?tab=master-data",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 13,
    "path": "/hr/settings?tab=contract-clauses",
    "label": "Settings-contract-clauses",
    "status": "OK",
    "bodyLen": 376,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/settings?tab=contract-clauses",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 14,
    "path": "/hr/settings?tab=att-leave-types",
    "label": "Settings-att-leave-types",
    "status": "OK",
    "bodyLen": 376,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/settings?tab=att-leave-types",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 15,
    "path": "/hr/settings?tab=jd-master-library",
    "label": "Settings-jd-master-library",
    "status": "OK",
    "bodyLen": 376,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/settings?tab=jd-master-library",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 16,
    "path": "/hr/settings?tab=rec-pipeline-stages",
    "label": "Settings-rec-pipeline-stages",
    "status": "OK",
    "bodyLen": 376,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/settings?tab=rec-pipeline-stages",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  },
  {
    "n": 17,
    "path": "/hr/settings?tab=settings-defaults",
    "label": "Settings-defaults",
    "status": "OK",
    "bodyLen": 376,
    "hasSidebar": true,
    "hasReactError": false,
    "finalUrl": "http://localhost:8080/hr/settings?tab=settings-defaults",
    "snippet": "XeVN HRM MENU CHÍNH Tổng quan Nhân sự Tuyển dụng 3 Chấm công Tính lương Đánh giá UniAI Công việc Quy trình & Quy định Dịch vụ nội bộ Công cụ dụng cụ H"
  }
]
```
