$ErrorActionPreference = "Stop"

function ConvertTo-Base64Url {
  param([byte[]]$Bytes)
  return [Convert]::ToBase64String($Bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function New-ServiceJwt {
  $secret = if ($env:SERVICE_JWT_SECRET) { $env:SERVICE_JWT_SECRET } else { "xevn-dev-jwt-secret" }
  $issuer = if ($env:SERVICE_JWT_ISSUER) { $env:SERVICE_JWT_ISSUER } else { "xevn-internal" }
  $audience = if ($env:SERVICE_JWT_AUDIENCE) { $env:SERVICE_JWT_AUDIENCE } else { "xevn-api" }

  $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $headerJson = '{"alg":"HS256","typ":"JWT"}'
  $payloadJson = "{`"iss`":`"$issuer`",`"aud`":`"$audience`",`"iat`":$now,`"nbf`":$now,`"exp`":$($now + 900)}"

  $header = ConvertTo-Base64Url -Bytes ([Text.Encoding]::UTF8.GetBytes($headerJson))
  $payload = ConvertTo-Base64Url -Bytes ([Text.Encoding]::UTF8.GetBytes($payloadJson))
  $signingInput = "$header.$payload"

  $hmac = New-Object System.Security.Cryptography.HMACSHA256
  $hmac.Key = [Text.Encoding]::UTF8.GetBytes($secret)
  $signatureBytes = $hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($signingInput))
  $signature = ConvertTo-Base64Url -Bytes $signatureBytes
  return "$signingInput.$signature"
}

$serviceJwt = New-ServiceJwt
$defaultHeaders = @{
  "Authorization" = "Bearer $serviceJwt"
  "x-request-id" = [guid]::NewGuid().ToString()
}

$companyId = [guid]::NewGuid().ToString()
$employeeA = [guid]::NewGuid().ToString()
$employeeB = [guid]::NewGuid().ToString()
$employeeC = [guid]::NewGuid().ToString()

function Invoke-Json {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $false)]$Body
  )

  if ($null -eq $Body) {
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $defaultHeaders
  }

  return Invoke-RestMethod -Method $Method -Uri $Url -Headers $defaultHeaders -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 10)
}

Write-Host "=== HRM UAT Business Flow Simulation ==="
Write-Host "1) Service health check"
$health = Invoke-Json -Method Get -Url "http://localhost:3001/api/hrm"

Write-Host "2) Attendance flow with realistic matrix"
$attendanceA = Invoke-Json -Method Post -Url "http://localhost:3001/api/hrm/attendance/records" -Body @{
  company_id = $companyId
  employee_id = $employeeA
  attendance_date = "2026-04-22"
  check_in_at = "2026-04-22T08:55:00Z"
  check_out_at = "2026-04-22T18:02:00Z"
  status = "present"
  note = "Normal shift at Hanoi operations center"
  created_by = "qa-uat-agent"
}
$attendanceB = Invoke-Json -Method Post -Url "http://localhost:3001/api/hrm/attendance/records" -Body @{
  company_id = $companyId
  employee_id = $employeeB
  attendance_date = "2026-04-22"
  check_in_at = "2026-04-22T09:21:00Z"
  check_out_at = "2026-04-22T20:31:00Z"
  status = "present"
  note = "Late check-in with overtime delivery support"
  created_by = "qa-uat-agent"
}
$attendanceC = Invoke-Json -Method Post -Url "http://localhost:3001/api/hrm/attendance/records" -Body @{
  company_id = $companyId
  employee_id = $employeeC
  attendance_date = "2026-04-22"
  status = "leave"
  note = "Approved business trip and leave overlap edge case"
  created_by = "qa-uat-agent"
}
$attendanceList = Invoke-Json -Method Get -Url ("http://localhost:3001/api/hrm/attendance/records?company_id=$companyId&page=1&page_size=20")

Write-Host "3) Payroll period lifecycle flow"
$period = Invoke-Json -Method Post -Url "http://localhost:3001/api/hrm/payroll/periods" -Body @{
  company_id = $companyId
  period_label = "Apr 2026 - UAT"
  start_date = "2026-04-01"
  end_date = "2026-04-30"
  created_by = "qa-uat-agent"
}
$periodId = $period.data.id
$processed = Invoke-Json -Method Post -Url ("http://localhost:3001/api/hrm/payroll/periods/$periodId/process")
$closed = Invoke-Json -Method Post -Url ("http://localhost:3001/api/hrm/payroll/periods/$periodId/close")
$payrollList = Invoke-Json -Method Get -Url ("http://localhost:3001/api/hrm/payroll/periods?company_id=$companyId")

Write-Host "4) Recruitment flow (requisition -> candidate -> interview -> decision)"
$requisition = Invoke-Json -Method Post -Url "http://localhost:3001/api/hrm/recruitment/requisitions" -Body @{
  company_id = $companyId
  title = "Fleet Operations Supervisor"
  department = "Operations"
  employment_type = "full_time"
}
$candidate = Invoke-Json -Method Post -Url "http://localhost:3001/api/hrm/recruitment/candidates" -Body @{
  company_id = $companyId
  requisition_id = $requisition.data.id
  full_name = "Nguyen Minh Khoa"
  email = "khoa.nguyen.operations@xe.vn"
  source = "linkedin"
}
$interview = Invoke-Json -Method Post -Url "http://localhost:3001/api/hrm/recruitment/interviews" -Body @{
  company_id = $companyId
  candidate_id = $candidate.data.id
  scheduled_at = "2026-04-24T03:00:00Z"
  interviewer = "Tran Thu Ha"
}
$interviewUpdated = Invoke-Json -Method Patch -Url ("http://localhost:3001/api/hrm/recruitment/interviews/" + $interview.data.id + "/status") -Body @{
  status = "passed"
}
$candidateList = Invoke-Json -Method Get -Url ("http://localhost:3001/api/hrm/recruitment/candidates?company_id=$companyId&page=1&page_size=20")

Write-Host "5) Contracts & Insurance expiring checks"
$contract = Invoke-Json -Method Post -Url "http://localhost:3001/api/hrm/contracts-insurance/contracts" -Body @{
  company_id = $companyId
  employee_id = $employeeA
  contract_type = "fixed_term"
  start_date = "2025-05-01"
  end_date = "2026-05-01"
}
$insurance = Invoke-Json -Method Post -Url "http://localhost:3001/api/hrm/contracts-insurance/insurance" -Body @{
  company_id = $companyId
  employee_id = $employeeA
  provider = "Bao Viet"
  policy_number = "BV-HN-2026-00018"
  expiry_date = "2026-05-10"
}
$expiringContracts = Invoke-Json -Method Get -Url ("http://localhost:3001/api/hrm/contracts-insurance/contracts/expiring?company_id=$companyId&days=45")
$expiringInsurance = Invoke-Json -Method Get -Url ("http://localhost:3001/api/hrm/contracts-insurance/insurance/expiring?company_id=$companyId&days=45")

Write-Host "6) Operations tasks and business summary"
$task = Invoke-Json -Method Post -Url "http://localhost:3001/api/hrm/operations/tasks" -Body @{
  company_id = $companyId
  title = "Finalize month-end attendance anomalies"
  description = "Review late check-ins and leave overlap approvals before payroll lock."
  priority = "high"
  due_date = "2026-04-29"
}
$taskUpdated = Invoke-Json -Method Patch -Url ("http://localhost:3001/api/hrm/operations/tasks/" + $task.data.id + "/status") -Body @{
  status = "in_progress"
}
$taskList = Invoke-Json -Method Get -Url ("http://localhost:3001/api/hrm/operations/tasks?company_id=$companyId&page=1&page_size=20")
$summary = Invoke-Json -Method Get -Url ("http://localhost:3001/api/hrm/operations/reports/summary?company_id=$companyId")

$result = [PSCustomObject]@{
  hrm_health_ok = ($health.data.status -eq "ok")
  attendance_records_created = @($attendanceA, $attendanceB, $attendanceC).Count
  payroll_period_final_status = $closed.data.status
  interview_final_status = $interviewUpdated.data.status
  expiring_contracts_total = $expiringContracts.data.total
  expiring_insurance_total = $expiringInsurance.data.total
  tasks_total = $taskList.data.total
  summary = $summary.data
  integration_ready = (
    $health.data.status -eq "ok" -and
    $attendanceList.data.total -ge 3 -and
    $processed.data.status -eq "processed" -and
    $closed.data.status -eq "closed" -and
    $payrollList.data.total -ge 1 -and
    $candidateList.data.total -ge 1 -and
    $interviewUpdated.data.status -eq "passed" -and
    $expiringContracts.data.total -ge 1 -and
    $expiringInsurance.data.total -ge 1 -and
    $taskUpdated.data.status -eq "in_progress" -and
    $summary.data.attendance_records -ge 3 -and
    $summary.data.payroll_periods -ge 1 -and
    $summary.data.job_requisitions -ge 1 -and
    $summary.data.tasks -ge 1
  )
}

$result | ConvertTo-Json -Depth 10

if (-not $result.integration_ready) {
  throw "HRM UAT business flow failed."
}

Write-Host "HRM UAT business flow completed successfully."
