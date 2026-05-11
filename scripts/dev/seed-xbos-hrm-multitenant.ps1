param(
  [string]$XbosApi = "http://localhost:3002",
  [string]$HrmApi = "http://localhost:3001",
  [string]$InternalApiKey = "xevn-dev-internal-key",
  [string]$ServiceJwtSecret = "xevn-dev-jwt-secret"
)

$ErrorActionPreference = "Stop"

function Publish-Catalog {
  param(
    [string]$CatalogKey,
    [string]$TenantId,
    [string]$CompanyId,
    [string]$Name,
    [string]$Domain,
    [array]$Items
  )

  $uri = "$XbosApi/api/xbos/config-sync/catalog/$CatalogKey/publish"
  $payload = @{
    tenantId = $TenantId
    companyId = $CompanyId
    name = $Name
    domain = $Domain
    assignedTo = @("hrm", "xbos", "web-portal")
    items = $Items
    actor = "seed-script"
  } | ConvertTo-Json -Depth 8

  Invoke-RestMethod -Method Post -Uri $uri -Headers @{
    "x-internal-api-key" = $InternalApiKey
    "Content-Type" = "application/json"
  } -Body $payload | Out-Null
}

function New-InternalJwt {
  param(
    [string]$TenantId,
    [string]$CompanyId,
    [string]$ModuleCode
  )

  $headerJson = '{"alg":"HS256","typ":"JWT"}'
  $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $payloadObj = [ordered]@{
    iss = "xevn-internal"
    aud = "xevn-api"
    iat = $now
    exp = $now + 3600
    tenantId = $TenantId
    companyId = $CompanyId
    mod = $ModuleCode
  }
  $payloadJson = $payloadObj | ConvertTo-Json -Compress

  function Convert-ToBase64Url([byte[]]$Bytes) {
    $base64 = [Convert]::ToBase64String($Bytes)
    return $base64.TrimEnd("=").Replace("+", "-").Replace("/", "_")
  }

  $header = Convert-ToBase64Url ([Text.Encoding]::UTF8.GetBytes($headerJson))
  $payload = Convert-ToBase64Url ([Text.Encoding]::UTF8.GetBytes($payloadJson))
  $unsigned = "$header.$payload"

  $hmac = New-Object System.Security.Cryptography.HMACSHA256
  $hmac.Key = [Text.Encoding]::UTF8.GetBytes($ServiceJwtSecret)
  $signature = Convert-ToBase64Url ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($unsigned)))
  $hmac.Dispose()

  return "$unsigned.$signature"
}

function Sync-HrmCatalogs {
  param(
    [string]$TenantId,
    [string]$CompanyId
  )

  Invoke-RestMethod -Method Post -Uri "$HrmApi/api/hrm/settings-catalogs/sync-from-xbos" -Headers @{
    "x-internal-api-key" = $InternalApiKey
    "x-tenant-id" = $TenantId
    "x-company-id" = $CompanyId
    "Content-Type" = "application/json"
  } -Body "{}" | Out-Null
}

function Add-HrmExtension {
  param(
    [string]$TenantId,
    [string]$CompanyId,
    [string]$CatalogKey,
    [array]$Items
  )

  $payload = @{ items = $Items } | ConvertTo-Json -Depth 8
  Invoke-RestMethod -Method Post -Uri "$HrmApi/api/hrm/settings-catalogs/$CatalogKey/extension-items" -Headers @{
    "x-internal-api-key" = $InternalApiKey
    "x-tenant-id" = $TenantId
    "x-company-id" = $CompanyId
    "Content-Type" = "application/json"
  } -Body $payload | Out-Null
}

function Create-Asset {
  param(
    [string]$TenantId,
    [string]$CompanyId,
    [string]$ModuleCode,
    [hashtable]$AssetDto
  )

  $token = New-InternalJwt -TenantId $TenantId -CompanyId $CompanyId -ModuleCode $ModuleCode
  $payload = $AssetDto | ConvertTo-Json -Depth 12
  try {
    Invoke-RestMethod -Method Post -Uri "$XbosApi/api/xbos/assets" -Headers @{
      "authorization" = "Bearer $token"
      "x-module-code" = $ModuleCode
      "x-internal-api-key" = $InternalApiKey
      "Content-Type" = "application/json"
    } -Body $payload | Out-Null
  } catch {
    $responseText = ""
    if ($_.Exception.Response) {
      $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
      $responseText = $reader.ReadToEnd()
      $reader.Close()
    }
    if ($responseText -like "*ASSET-REG-409*") {
      Write-Output "Skip existing asset: $($AssetDto.assetCode) in $TenantId/$CompanyId"
      return
    }
    throw
  }
}

$companies = @(
  @{
    tenant = "acme"
    company = "acme-hn"
    legalName = "ACME Logistics Vietnam"
    hq = "Hanoi"
  },
  @{
    tenant = "nova"
    company = "nova-hcm"
    legalName = "Nova Retail Group"
    hq = "Ho Chi Minh City"
  }
)

foreach ($c in $companies) {
  $departmentsKey = "departments"
  $positionsKey = "positions"
  $insuranceProvidersKey = "insurance_providers"
  $contractTypesKey = "contract_types"
  $legalEntitiesKey = "legal_entities"
  $shiftTemplatesKey = "shift_templates"
  $assetGroupsKey = "asset_groups"

  Publish-Catalog $departmentsKey $c.tenant $c.company "Departments" "organization" @(
    @{ code = "hr"; label = "Human Resources"; status = "active" },
    @{ code = "ops"; label = "Operations"; status = "active" },
    @{ code = "fin"; label = "Finance"; status = "active" },
    @{ code = "wh"; label = "Warehouse"; status = "active" }
  )

  Publish-Catalog $positionsKey $c.tenant $c.company "Positions" "organization" @(
    @{ code = "hr_manager"; label = "HR Manager"; status = "active" },
    @{ code = "payroll_exec"; label = "Payroll Executive"; status = "active" },
    @{ code = "warehouse_supervisor"; label = "Warehouse Supervisor"; status = "active" },
    @{ code = "recruiter"; label = "Recruiter"; status = "active" }
  )

  Publish-Catalog $insuranceProvidersKey $c.tenant $c.company "Insurance Providers" "compliance" @(
    @{ code = "vbhx"; label = "Bao Hiem Xa Hoi Viet Nam"; status = "active" },
    @{ code = "pvi"; label = "PVI Insurance"; status = "active" },
    @{ code = "bao_viet"; label = "Bao Viet"; status = "active" }
  )

  Publish-Catalog $contractTypesKey $c.tenant $c.company "Contract Types" "hr-policy" @(
    @{ code = "indefinite"; label = "Indefinite-term"; status = "active" },
    @{ code = "fixed_12m"; label = "Fixed-term 12 months"; status = "active" },
    @{ code = "probation_2m"; label = "Probation 2 months"; status = "active" }
  )

  Publish-Catalog $legalEntitiesKey $c.tenant $c.company "Legal Entities" "organization" @(
    @{ code = "hq"; label = "$($c.legalName) - HQ $($c.hq)"; status = "active" },
    @{ code = "branch_1"; label = "$($c.legalName) - Branch 1"; status = "active" }
  )

  Publish-Catalog $shiftTemplatesKey $c.tenant $c.company "Shift Templates" "workforce" @(
    @{ code = "day_shift"; label = "Day Shift 08:00-17:00"; status = "active" },
    @{ code = "night_shift"; label = "Night Shift 22:00-06:00"; status = "active" },
    @{ code = "warehouse_split"; label = "Warehouse Split Shift"; status = "active" }
  )

  Publish-Catalog $assetGroupsKey $c.tenant $c.company "Asset Groups" "operations" @(
    @{ code = "fleet_truck"; label = "Fleet Trucks"; status = "active" },
    @{ code = "forklift"; label = "Warehouse Forklifts"; status = "active" },
    @{ code = "cold_chain"; label = "Cold-chain Equipment"; status = "active" }
  )

  Sync-HrmCatalogs $c.tenant $c.company

  Add-HrmExtension $c.tenant $c.company $positionsKey @(
    @{ code = "night_shift_allowance"; label = "Night Shift Allowance"; status = "active" },
    @{ code = "oncall_bonus"; label = "On-call Bonus"; status = "active" }
  )

  Create-Asset $c.tenant $c.company "operations" @{
    tenantId = $c.tenant
    companyId = $c.company
    assetCode = "$($c.tenant.ToUpper())-TRK-001"
    assetName = "Prime Mover 18T - $($c.hq)"
    assetType = "truck"
    vin = "VF1AB2C3D4E5F6G7H"
    chassisNo = "$($c.tenant.ToUpper())CHS001A"
    status = "active"
    ownerModule = "operations"
    metadata = @{
      fleetGroup = "linehaul"
      model = "Hyundai HD320"
      year = 2023
      payloadTons = 18
      mileageKm = 48000
    }
  }

  Create-Asset $c.tenant $c.company "operations" @{
    tenantId = $c.tenant
    companyId = $c.company
    assetCode = "$($c.tenant.ToUpper())-FLT-002"
    assetName = "Warehouse Forklift 3T - $($c.hq)"
    assetType = "forklift"
    vin = "VF9LM8N7P6R5S4T3U"
    chassisNo = "$($c.tenant.ToUpper())CHS002B"
    status = "maintenance"
    ownerModule = "operations"
    metadata = @{
      warehouseZone = "A1"
      model = "Toyota 8FD30"
      batteryType = "Li-ion"
      serviceDueKm = 1200
    }
  }

  Create-Asset $c.tenant $c.company "hrm-admin" @{
    tenantId = $c.tenant
    companyId = $c.company
    assetCode = "$($c.tenant.ToUpper())-HR-001"
    assetName = "Biometric Attendance Kiosk - HQ"
    assetType = "attendance_terminal"
    status = "active"
    ownerModule = "hrm-admin"
    metadata = @{
      location = "HQ Lobby"
      vendor = "ZKTeco"
      serialNo = "$($c.tenant.ToUpper())-BIO-01"
    }
  }
}

Write-Output "Seed done for tenants: acme/acme-hn and nova/nova-hcm (catalogs + assets + hrm sync)"
