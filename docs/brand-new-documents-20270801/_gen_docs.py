import os

OUT = "docs/brand-new-documents-20270801"
os.makedirs(OUT, exist_ok=True)

BRD = """
# BRD-XEVN-NEW v1.0
So yeu cau nghiep vu - He sinh thai XeVN OS
Ngay: 2026-08-01 | Phan phoi: Chu dau tu / PM / BA / DEV / QA
Trang thai: Chinh thuc

---

## 1. Gioi thieu

### 1.1. Muc dich
Dinh nghia yeu cau nghiep vu cap doanh nghiep cho he sinh thai XeVN OS - nen tang phan mem da phan he quan tri nguon nhan luc (HRM) va dieu hanh doi van chuyen (Logistics) theo mo hinh multi-tenant SaaS. Tai lieu la nguon chan ly (SoT) cho SRS, TechSpec, API Design, DB Design.

### 1.2. Doi tuong doc
- Chu dau tu / Founder
- Quan ly du an (PM)
- Chuyen vien phan tich nghiep vu (BA)
- Kien truc su / Tech Lead
- Nha phat trien FE/BE
- QA / Tester

### 1.3. Thuat ngu

| Thuat ngu | Dinh nghia |
|---|---|
| Tenant | Mot cong ty/chi nhanh dung rieng he thong, du lieu cach ly tuyet doi |
| Platform Admin | Quan tri vien nen tang - xem/quan ly qua tat ca tenant |
| Tenant Admin | Quan tri vien ben trong mot tenant |
| Catalogue | Bo du lieu chuan do Platform quan ly; tenant chi mo rong |
| Workflow Engine | Bo may tao luong phe duyet tu dong theo cap, SLA |
| RBAC | Phan quyen dua tren vai tro |
| Event-Driven | Tich hop thong qua su kien noi bo |
| SLA | Thoi gian giai quyet toi da |
| Escalation | Tu dong chuyen don len cap tren neu qua han |
""".strip()

with open(os.path.join(OUT, "BRD_NEW.md"), "w", encoding="utf-8") as f:
    f.write(BRD)
print("OK BRD size:", os.path.getsize(os.path.join(OUT, "BRD_NEW.md")))
