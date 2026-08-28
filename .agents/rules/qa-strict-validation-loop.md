# QA & Validation Loop Strict Enforcement

**Ban hành:** 2026-08-26
**Mục đích:** Ngăn chặn việc Agent tự ý "hardcode" hoặc đẩy test data vào Database rồi coi là xong task, trong khi UI/UX và Backend Validation chưa hỗ trợ.

1. **No Blind Seeding:** Mọi thao tác seeding hoặc tạo test data cho các field JSONB/phức tạp bắt buộc phải đi kèm bước kiểm tra (Code Review) xem API có validate DTO chuẩn không, và Frontend UI có form nhập liệu tương ứng không.
2. **Lifecycle Enforcement:** Tuân thủ vòng lặp: Rà soát SRS -> TechSpec -> API Contract -> UI/UX Spec -> Code Frontend/Backend -> QA. Không bao giờ skip bước kiểm định (Gap Analysis).
3. **Full-stack SOLID:** Mọi thay đổi về schema/JSONB phải được phản ánh đồng bộ qua tài liệu (Docs), Backend DTO (Zod/ClassValidator), DB (Prisma/SQL), và Frontend (Type/Form). Không để tình trạng BE nhận `Record<string, unknown>` rồi cast bừa.
