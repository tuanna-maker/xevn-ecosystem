filepath = "docs/brand-new-documents-20270801/BRD_NEW.md"
segment = """## 3. Phạm vi hệ thống và Ngoài phạm vi

### 3.1 Trong phạm vi (In Scope)

| Mã phân hệ | Tên đầy đủ | Giai đoạn | Ưu tiên | Mô tả |
|---|---|:---:|:---:|---|
| XBOS | X-Business Operating System | Phase 1 | P0 | Tenant CRUD, RBAC, Workflow, Catalog, Audit log, Org structure |
| HRM | Human Resource Management | Phase 1 | P0 | Employee, Attendance, Leave, Payroll, Recruitment, Reports |
| Portal/CC | Command Center | Phase 1 | P1 | SUPER_ADMIN dashboard, catalog management |
| Logistics | Vehicle/Driver/Trip Management | Phase 1 (Limited) | P1 | Vehicle, driver, trip, dispatch — giới hạn |
| Mobile | Ứng dụng Nhân viên | Phase 1 | P0 | Check-in GPS, leave submit, payslip view |

### 3.2 Ngoài phạm vi (Out of Scope)

- CRM, ERP nâng cao, AI/ML engine, Advanced BI, CMS
- Lý do: không phải lõi nghiệp vụ nội bộ, cần đánh giá kỹ sau

### 3.3 Giới hạn Phase 1
- Logistics: chỉ uỷ quyền API (tạo/xem xe, tài xế, chuyến), chưa điều độ thời gian thực
- HRM Reports: chỉ báo cáo mẫu cố định; báo cáo tùy chỉnh Phase 2
- Integration: chỉ nội bộ XBOS↔HRM↔Portal; chưa mở hệ thống bên thứ ba

---

"""
with open(filepath, "a", encoding="utf-8") as f:
    f.write(segment)
print("Section 3 appended")
