import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  vi: 'LUÔN trả lời bằng tiếng Việt.',
  en: 'ALWAYS respond in English.',
  zh: '始终用中文回答。',
  lo: 'ຕອບເປັນພາສາລາວສະເໝີ.',
  km: 'ឆ្លើយតបជាភាសាខ្មែរជានិច្ច។',
  my: 'အမြဲတမ်းမြန်မာဘာသာဖြင့်ဖြေပါ။',
};

const BASE_SYSTEM_PROMPT = `You are an intelligent AI assistant specialized in Human Resource Management (HRM) for the UniHRM system. You have deep knowledge and can provide detailed answers about:

1. **Attendance & Shifts**: Attendance rules, work shifts, check-in/out times, GPS, FaceID, QR Code, overtime, late arrival/early departure
2. **Leave**: Leave types (annual, sick, maternity, unpaid), remaining days, application and approval process
3. **Salary & Benefits**: Salary calculation, salary components (base, allowances, deductions), income tax, salary templates, bonus policies
4. **Insurance**: Social insurance, health insurance, unemployment insurance - contribution rates, benefits, company policies
5. **Recruitment**: Recruitment process, open positions, campaign progress
6. **Training & Development**: Training programs, certificates, employee KPIs
7. **Contracts**: Employment contract info, renewals, expirations
8. **Internal Processes**: Leave requests, overtime registration, business trips, shift changes, attendance updates, salary advances

SPECIAL CAPABILITIES:
- Analyze and provide insights based on actual company data
- Suggest specific actions when users need help
- Quick calculations related to salary, leave, insurance
- Explain processes step by step clearly

RULES:
- ONLY answer based on the user's company data (provided below).
- ABSOLUTELY DO NOT reveal other companies' data.
- If no data available, clearly state so and suggest contacting HR department.
- Detect the user's input language and respond in that same language. If a preferred language is specified, use that language.
- Use markdown format for readable responses (bullet points, bold, tables when needed).
- When answering about processes, list steps clearly.

DATA DISPLAY RULES:
- When presenting numerical data (employees by department, leave stats, salary structure, etc.), ALWAYS use markdown tables (| Col1 | Col2 |).
- Ensure number columns contain only pure numbers (don't add units like "people", "requests" in number columns).
- The system will automatically create visual charts from numerical tables.
- Each table should have a brief title above it.`;


async function fetchCompanyContext(supabase: any, companyIds: string[], userId: string) {
  const context: string[] = [];

  // Run all queries in parallel for performance
  const [
    companiesRes, departmentsRes, employeesRes, leaveRes, rulesRes,
    contractsRes, jobPostingsRes, shiftsRes, salaryComponentsRes,
    insurancePoliciesRes, bonusPoliciesRes, overtimeRes, trainingRes,
    userMembershipRes
  ] = await Promise.all([
    // Company info
    supabase.from('companies')
      .select('name, industry, address, phone, email, employee_count')
      .in('id', companyIds),
    // Departments
    supabase.from('departments')
      .select('name, manager_name, employee_count, status')
      .in('company_id', companyIds).eq('status', 'active').limit(50),
    // Employees stats
    supabase.from('employees')
      .select('status, department, position', { count: 'exact' })
      .in('company_id', companyIds).is('deleted_at', null),
    // Leave requests (30 days)
    supabase.from('leave_requests')
      .select('status, leave_type, total_days, employee_name')
      .in('company_id', companyIds)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(200),
    // Attendance rules
    supabase.from('attendance_rules')
      .select('work_days, hours_per_day, standard_days_per_month, gps_enabled, faceid_enabled, qr_enabled, auto_checkout, notify_late, round_in_minutes, round_out_minutes')
      .in('company_id', companyIds).limit(1).single(),
    // Active contracts
    supabase.from('employee_contracts')
      .select('contract_type, status, expiry_date', { count: 'exact' })
      .in('company_id', companyIds).eq('status', 'active'),
    // Job postings
    supabase.from('job_postings')
      .select('title, department, positions_count, status')
      .in('company_id', companyIds).eq('status', 'open').limit(20),
    // Work shifts
    supabase.from('work_shifts')
      .select('name, start_time, end_time, break_minutes, status')
      .in('company_id', companyIds).eq('status', 'active').limit(20),
    // Salary components
    supabase.from('salary_components')
      .select('name, code, type, category, default_value, is_taxable, is_insurance_base')
      .in('company_id', companyIds).eq('is_active', true).limit(50),
    // Insurance policies
    supabase.from('insurance_policies')
      .select('name, type, employee_rate, employer_rate, status, participant_count')
      .in('company_id', companyIds).eq('status', 'active').limit(10),
    // Bonus policies
    supabase.from('bonus_policies')
      .select('name, type, calculation_method, base_value, status, participant_count')
      .in('company_id', companyIds).eq('status', 'active').limit(10),
    // Overtime requests (30 days)
    supabase.from('overtime_requests')
      .select('status, total_hours')
      .in('company_id', companyIds)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100),
    // Training records
    supabase.from('employee_training')
      .select('training_name, status, training_type')
      .in('company_id', companyIds).limit(50),
    // Current user's membership info
    supabase.from('user_company_memberships')
      .select('role, full_name, employee_id')
      .eq('user_id', userId).in('company_id', companyIds).eq('status', 'active').limit(1).single(),
  ]);

  // Company info
  if (companiesRes.data?.length) {
    context.push(`\n## Thông tin công ty:\n${companiesRes.data.map((c: any) =>
      `- **${c.name}** | Ngành: ${c.industry || 'N/A'} | SĐT: ${c.phone || 'N/A'} | Email: ${c.email || 'N/A'} | Số NV: ${c.employee_count || 0}`
    ).join('\n')}`);
  }

  // User info
  if (userMembershipRes.data) {
    const u = userMembershipRes.data;
    context.push(`\n## Người dùng hiện tại: ${u.full_name || 'N/A'} | Vai trò: ${u.role || 'N/A'}`);
  }

  // Departments
  if (departmentsRes.data?.length) {
    context.push(`\n## Phòng ban (${departmentsRes.data.length}):\n${departmentsRes.data.map((d: any) =>
      `- ${d.name} | Trưởng phòng: ${d.manager_name || 'N/A'} | Nhân viên: ${d.employee_count || 0}`
    ).join('\n')}`);
  }

  // Employee stats with department breakdown
  if (employeesRes.count !== null) {
    const emps = employeesRes.data || [];
    const working = emps.filter((e: any) => e.status === 'working' || e.status === 'active').length;
    const deptBreakdown: Record<string, number> = {};
    emps.forEach((e: any) => {
      const dept = e.department || 'Chưa phân bổ';
      deptBreakdown[dept] = (deptBreakdown[dept] || 0) + 1;
    });
    let deptStr = Object.entries(deptBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([dept, count]) => `  - ${dept}: ${count} người`)
      .join('\n');
    context.push(`\n## Tổng quan nhân sự: ${employeesRes.count} nhân viên (${working} đang làm việc)\n### Phân bổ theo phòng ban:\n${deptStr}`);
  }

  // Attendance rules
  if (rulesRes.data) {
    const r = rulesRes.data;
    context.push(`\n## Quy định chấm công:\n- Giờ làm/ngày: ${r.hours_per_day || 8}h\n- Ngày công chuẩn/tháng: ${r.standard_days_per_month || 22}\n- Ngày làm việc: ${r.work_days?.join(', ') || 'T2-T6'}\n- GPS: ${r.gps_enabled ? 'Bật' : 'Tắt'} | FaceID: ${r.faceid_enabled ? 'Bật' : 'Tắt'} | QR: ${r.qr_enabled ? 'Bật' : 'Tắt'}\n- Tự động checkout: ${r.auto_checkout ? 'Có' : 'Không'} | Thông báo đi muộn: ${r.notify_late ? 'Có' : 'Không'}\n- Làm tròn vào: ${r.round_in_minutes || 0} phút | Làm tròn ra: ${r.round_out_minutes || 0} phút`);
  }

  // Work shifts
  if (shiftsRes.data?.length) {
    context.push(`\n## Ca làm việc (${shiftsRes.data.length}):\n${shiftsRes.data.map((s: any) =>
      `- **${s.name}**: ${s.start_time || '?'} - ${s.end_time || '?'} | Nghỉ: ${s.break_minutes || 0} phút`
    ).join('\n')}`);
  }

  // Leave requests
  if (leaveRes.data?.length) {
    const leaves = leaveRes.data;
    const pending = leaves.filter((l: any) => l.status === 'pending').length;
    const approved = leaves.filter((l: any) => l.status === 'approved').length;
    const rejected = leaves.filter((l: any) => l.status === 'rejected').length;
    const typeBreakdown: Record<string, number> = {};
    leaves.forEach((l: any) => {
      const t = l.leave_type || 'Khác';
      typeBreakdown[t] = (typeBreakdown[t] || 0) + 1;
    });
    let typeStr = Object.entries(typeBreakdown).map(([t, c]) => `  - ${t}: ${c} đơn`).join('\n');
    context.push(`\n## Nghỉ phép (30 ngày gần nhất): ${leaves.length} đơn\n- Chờ duyệt: ${pending} | Đã duyệt: ${approved} | Từ chối: ${rejected}\n### Theo loại:\n${typeStr}`);
  }

  // Overtime
  if (overtimeRes.data?.length) {
    const ot = overtimeRes.data;
    const otPending = ot.filter((o: any) => o.status === 'pending').length;
    const totalHours = ot.reduce((sum: number, o: any) => sum + (o.total_hours || 0), 0);
    context.push(`\n## Làm thêm giờ (30 ngày): ${ot.length} đơn | Chờ duyệt: ${otPending} | Tổng giờ: ${totalHours.toFixed(1)}h`);
  }

  // Contracts
  if (contractsRes.count !== null) {
    const contracts = contractsRes.data || [];
    const expiringSoon = contracts.filter((c: any) => {
      if (!c.expiry_date) return false;
      const diff = new Date(c.expiry_date).getTime() - Date.now();
      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
    }).length;
    context.push(`\n## Hợp đồng đang hiệu lực: ${contractsRes.count}${expiringSoon > 0 ? ` | ⚠️ Sắp hết hạn (30 ngày): ${expiringSoon}` : ''}`);
  }

  // Salary components
  if (salaryComponentsRes.data?.length) {
    const comps = salaryComponentsRes.data;
    const earnings = comps.filter((c: any) => c.type === 'earning' || c.type === 'allowance');
    const deductions = comps.filter((c: any) => c.type === 'deduction');
    context.push(`\n## Cấu trúc lương: ${comps.length} thành phần (${earnings.length} khoản thu nhập, ${deductions.length} khoản khấu trừ)\n### Các thành phần chính:\n${comps.slice(0, 15).map((c: any) =>
      `- ${c.name} (${c.code}) | Loại: ${c.type} | Giá trị mặc định: ${c.default_value || 0} | Chịu thuế: ${c.is_taxable ? 'Có' : 'Không'} | Tính BH: ${c.is_insurance_base ? 'Có' : 'Không'}`
    ).join('\n')}`);
  }

  // Insurance policies
  if (insurancePoliciesRes.data?.length) {
    context.push(`\n## Chính sách bảo hiểm:\n${insurancePoliciesRes.data.map((p: any) =>
      `- **${p.name}** (${p.type}) | NV đóng: ${p.employee_rate || 0}% | Cty đóng: ${p.employer_rate || 0}% | Tham gia: ${p.participant_count || 0} người`
    ).join('\n')}`);
  }

  // Bonus policies
  if (bonusPoliciesRes.data?.length) {
    context.push(`\n## Chính sách thưởng:\n${bonusPoliciesRes.data.map((b: any) =>
      `- **${b.name}** | Loại: ${b.type} | Cách tính: ${b.calculation_method} | Giá trị: ${b.base_value || 0} | Tham gia: ${b.participant_count || 0} người`
    ).join('\n')}`);
  }

  // Job postings
  if (jobPostingsRes.data?.length) {
    context.push(`\n## Vị trí đang tuyển (${jobPostingsRes.data.length}):\n${jobPostingsRes.data.map((j: any) =>
      `- ${j.title} | Phòng: ${j.department || 'N/A'} | Số lượng: ${j.positions_count || 1}`
    ).join('\n')}`);
  }

  // Training
  if (trainingRes.data?.length) {
    const trainings = trainingRes.data;
    const completed = trainings.filter((t: any) => t.status === 'completed').length;
    const inProgress = trainings.filter((t: any) => t.status === 'in_progress').length;
    context.push(`\n## Đào tạo: ${trainings.length} chương trình (${completed} hoàn thành, ${inProgress} đang thực hiện)`);
  }

  return context.join('\n');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Authenticate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Chưa đăng nhập" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Phiên đăng nhập không hợp lệ" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's company IDs
    const { data: memberships } = await supabaseAdmin
      .from('user_company_memberships')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    const companyIds = memberships?.map(m => m.company_id) || [];

    if (companyIds.length === 0) {
      return new Response(JSON.stringify({ error: "Bạn chưa thuộc công ty nào" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch company-specific context
    const companyContext = await fetchCompanyContext(supabaseAdmin, companyIds, user.id);

    const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS['en'] || 'Respond in the same language the user uses.';

    const systemPrompt = `${BASE_SYSTEM_PROMPT}

LANGUAGE: ${langInstruction}

--- COMPANY DATA ---
${companyContext}
--- END DATA ---

Use only the data above to answer. Do not fabricate data. Respond in markdown format.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Đã vượt quá giới hạn yêu cầu, vui lòng thử lại sau." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Cần nạp thêm credits, vui lòng liên hệ quản trị viên." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Lỗi kết nối AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("HRM AI Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Lỗi không xác định" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
