param(
  [string]$XbosApi = "http://localhost:3002",
  [string]$HrmApi = "http://localhost:3001",
  [string]$InternalApiKey = "xevn-dev-internal-key",
  [string]$DbHost = "113.20.107.184",
  [string]$DbPort = "6432",
  [string]$DbUser = "app1",
  [string]$DbPassword = "",
  [string]$DbXbos = "xevn_xbos",
  [string]$DbHrm = "xevn_hrm"
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($DbPassword)) {
  throw "DbPassword is required."
}

function Invoke-JsonPost {
  param(
    [string]$Uri,
    [hashtable]$Body
  )
  $payload = $Body | ConvertTo-Json -Depth 12
  Invoke-RestMethod -Method Post -Uri $Uri -Headers @{
    "x-internal-api-key" = $InternalApiKey
    "Content-Type" = "application/json"
  } -Body $payload | Out-Null
}

function Publish-Catalog {
  param(
    [string]$CatalogKey,
    [string]$TenantId,
    [string]$CompanyId,
    [string]$Name,
    [string]$Domain,
    [array]$Items
  )

  Invoke-JsonPost -Uri "$XbosApi/api/xbos/config-sync/catalog/$CatalogKey/publish" -Body @{
    tenantId = $TenantId
    companyId = $CompanyId
    name = $Name
    domain = $Domain
    assignedTo = @("hrm", "xbos", "web-portal")
    items = $Items
    actor = "seed-detailed-script"
  }
}

function Sync-HrmCatalogs {
  param([string]$TenantId, [string]$CompanyId)
  Invoke-RestMethod -Method Post -Uri "$HrmApi/api/hrm/settings-catalogs/sync-from-xbos" -Headers @{
    "x-internal-api-key" = $InternalApiKey
    "x-tenant-id" = $TenantId
    "x-company-id" = $CompanyId
    "Content-Type" = "application/json"
  } -Body "{}" | Out-Null
}

function Add-HrmExtension {
  param([string]$TenantId, [string]$CompanyId, [string]$CatalogKey, [array]$Items)
  $payload = @{ items = $Items } | ConvertTo-Json -Depth 10
  Invoke-RestMethod -Method Post -Uri "$HrmApi/api/hrm/settings-catalogs/$CatalogKey/extension-items" -Headers @{
    "x-internal-api-key" = $InternalApiKey
    "x-tenant-id" = $TenantId
    "x-company-id" = $CompanyId
    "Content-Type" = "application/json"
  } -Body $payload | Out-Null
}

function Exec-PsqlFile {
  param([string]$DbName, [string]$SqlPath)
  docker run --rm -v "${SqlPath}:/tmp/seed.sql" -e PGPASSWORD="$DbPassword" postgres:16 `
    psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -v ON_ERROR_STOP=1 -f /tmp/seed.sql | Out-Null
}

$xevnHoldingTenant = "xevn"
$xevnHoldingCompany = "holding"

# 1) XBOS base catalogs at group-level (XeVN ecosystem map)
Publish-Catalog "xevn_business_domains" $xevnHoldingTenant $xevnHoldingCompany "XeVN Business Domains" "strategy" @(
  @{ code = "logistics"; label = "Logistics & Linehaul"; status = "active" },
  @{ code = "retail"; label = "Retail Distribution"; status = "active" },
  @{ code = "mobility"; label = "Mobility Services"; status = "active" },
  @{ code = "hr_services"; label = "HR Shared Services"; status = "active" },
  @{ code = "digital"; label = "Digital Platform"; status = "active" }
)

Publish-Catalog "xevn_subsidiaries" $xevnHoldingTenant $xevnHoldingCompany "XeVN Subsidiaries" "organization" @(
  @{ code = "xevn_logistics_north"; label = "XeVN Logistics North JSC"; status = "active" },
  @{ code = "xevn_logistics_south"; label = "XeVN Logistics South LLC"; status = "active" },
  @{ code = "xevn_retail_distribution"; label = "XeVN Retail Distribution Co."; status = "active" },
  @{ code = "xevn_mobility"; label = "XeVN Mobility Services"; status = "active" },
  @{ code = "xevn_digital"; label = "XeVN Digital Solutions"; status = "active" }
)

Publish-Catalog "xevn_governance_policies" $xevnHoldingTenant $xevnHoldingCompany "XeVN Governance Policies" "governance" @(
  @{ code = "std_attendance_v2"; label = "Attendance Standard v2"; status = "active" },
  @{ code = "std_payroll_cutoff"; label = "Payroll Cutoff Policy"; status = "active" },
  @{ code = "std_procurement_limit"; label = "Procurement Approval Limits"; status = "active" },
  @{ code = "std_data_privacy"; label = "Data Privacy & Access"; status = "active" }
)

# 2) Tenant operational catalogs
$tenants = @(
  @{
    tenant = "acme"; company = "acme-hn"; company_uuid = "11111111-1111-4111-8111-111111111111";
    legalName = "ACME Logistics Vietnam"; hq = "Ha Noi";
    depts = @(
      @{ code = "hr"; label = "Human Resources"; status = "active" },
      @{ code = "ops"; label = "Operations"; status = "active" },
      @{ code = "fin"; label = "Finance"; status = "active" },
      @{ code = "fleet"; label = "Fleet Control"; status = "active" },
      @{ code = "wh"; label = "Warehouse"; status = "active" },
      @{ code = "proc"; label = "Procurement"; status = "active" }
    )
  },
  @{
    tenant = "nova"; company = "nova-hcm"; company_uuid = "22222222-2222-4222-8222-222222222222";
    legalName = "Nova Retail Group"; hq = "Ho Chi Minh City";
    depts = @(
      @{ code = "hr"; label = "Human Resources"; status = "active" },
      @{ code = "ops"; label = "Store Operations"; status = "active" },
      @{ code = "fin"; label = "Finance"; status = "active" },
      @{ code = "buying"; label = "Merchandising & Buying"; status = "active" },
      @{ code = "wh"; label = "Fulfillment Warehouse"; status = "active" },
      @{ code = "qa"; label = "Quality Assurance"; status = "active" }
    )
  }
)

foreach ($t in $tenants) {
  Publish-Catalog "departments" $t.tenant $t.company "Departments" "organization" $t.depts
  Publish-Catalog "positions" $t.tenant $t.company "Positions" "organization" @(
    @{ code = "hr_manager"; label = "HR Manager"; status = "active" },
    @{ code = "ops_manager"; label = "Operations Manager"; status = "active" },
    @{ code = "payroll_exec"; label = "Payroll Executive"; status = "active" },
    @{ code = "warehouse_supervisor"; label = "Warehouse Supervisor"; status = "active" },
    @{ code = "recruiter"; label = "Recruiter"; status = "active" },
    @{ code = "team_lead"; label = "Team Lead"; status = "active" },
    @{ code = "staff"; label = "Staff"; status = "active" }
  )
  Publish-Catalog "insurance_providers" $t.tenant $t.company "Insurance Providers" "compliance" @(
    @{ code = "vbhx"; label = "Bao Hiem Xa Hoi Viet Nam"; status = "active" },
    @{ code = "pvi"; label = "PVI Insurance"; status = "active" },
    @{ code = "bao_viet"; label = "Bao Viet"; status = "active" },
    @{ code = "pti"; label = "PTI Insurance"; status = "active" }
  )
  Publish-Catalog "contract_types" $t.tenant $t.company "Contract Types" "hr-policy" @(
    @{ code = "indefinite"; label = "Indefinite-term"; status = "active" },
    @{ code = "fixed_12m"; label = "Fixed-term 12 months"; status = "active" },
    @{ code = "fixed_24m"; label = "Fixed-term 24 months"; status = "active" },
    @{ code = "probation_2m"; label = "Probation 2 months"; status = "active" }
  )
  Publish-Catalog "legal_entities" $t.tenant $t.company "Legal Entities" "organization" @(
    @{ code = "hq"; label = "$($t.legalName) - HQ $($t.hq)"; status = "active" },
    @{ code = "branch_1"; label = "$($t.legalName) - Branch 1"; status = "active" },
    @{ code = "branch_2"; label = "$($t.legalName) - Branch 2"; status = "active" }
  )
  Publish-Catalog "shift_templates" $t.tenant $t.company "Shift Templates" "workforce" @(
    @{ code = "day_shift"; label = "Day Shift 08:00-17:00"; status = "active" },
    @{ code = "night_shift"; label = "Night Shift 22:00-06:00"; status = "active" },
    @{ code = "split_shift"; label = "Split Shift"; status = "active" }
  )
  Publish-Catalog "asset_groups" $t.tenant $t.company "Asset Groups" "operations" @(
    @{ code = "fleet_truck"; label = "Fleet Trucks"; status = "active" },
    @{ code = "forklift"; label = "Warehouse Forklifts"; status = "active" },
    @{ code = "cold_chain"; label = "Cold-chain Equipment"; status = "active" },
    @{ code = "attendance_terminal"; label = "Attendance Terminals"; status = "active" }
  )

  Sync-HrmCatalogs $t.tenant $t.company
  Add-HrmExtension $t.tenant $t.company "positions" @(
    @{ code = "night_shift_allowance"; label = "Night Shift Allowance"; status = "active" },
    @{ code = "oncall_bonus"; label = "On-call Bonus"; status = "active" },
    @{ code = "attendance_compliance_bonus"; label = "Attendance Compliance Bonus"; status = "active" }
  )
  Add-HrmExtension $t.tenant $t.company "departments" @(
    @{ code = "internal_audit"; label = "Internal Audit"; status = "active" }
  )
}

# 3) Seed HRM employees: 30 per tenant (direct DB for realistic demo volume)
$sqlPath = [System.IO.Path]::Combine($env:TEMP, "xevn_hrm_seed_employees.sql")
$sql = @"
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_code TEXT NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  job_title_key TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  hired_at DATE NULL,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_company_code
ON public.employees (company_id, employee_code);
"@

[System.IO.File]::WriteAllText($sqlPath, $sql)
Exec-PsqlFile -DbName $DbHrm -SqlPath $sqlPath

$firstNames = @("An","Binh","Chi","Dung","Giang","Hanh","Khanh","Linh","Minh","Nam","Oanh","Phuc","Quang","Son","Trang")
$lastNames = @("Nguyen","Tran","Le","Pham","Hoang","Vu","Dang","Bui","Do","Ngo")
$jobKeys = @("hr_manager","ops_manager","payroll_exec","warehouse_supervisor","recruiter","team_lead","staff")

foreach ($t in $tenants) {
  for ($i = 1; $i -le 30; $i++) {
    $code = if ($t.tenant -eq "acme") { "ACM" + $i.ToString("000") } else { "NVA" + $i.ToString("000") }
    $first = $firstNames[($i - 1) % $firstNames.Count]
    $last = $lastNames[($i + 2) % $lastNames.Count]
    $name = "$last $first"
    $email = "$($t.tenant).$code@xevn-demo.vn".ToLower()
    $job = $jobKeys[($i - 1) % $jobKeys.Count]
    $hireDate = (Get-Date "2024-01-01").AddDays($i * 7).ToString("yyyy-MM-dd")
    $insertSql = @"
INSERT INTO public.employees (id, company_id, employee_code, email, full_name, job_title_key, hired_at, status)
VALUES (gen_random_uuid(), '$($t.company_uuid)'::uuid, '$code', '$email', '$name', '$job', '$hireDate'::date, 'active')
ON CONFLICT (company_id, employee_code) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    job_title_key = EXCLUDED.job_title_key,
    hired_at = EXCLUDED.hired_at,
    updated_at = NOW();
"@
    [System.IO.File]::WriteAllText($sqlPath, $insertSql)
    Exec-PsqlFile -DbName $DbHrm -SqlPath $sqlPath
  }
}

Remove-Item $sqlPath -Force -ErrorAction SilentlyContinue
Write-Output "Detailed seed completed: XBOS base + tenant configs + 30 employees per tenant."
