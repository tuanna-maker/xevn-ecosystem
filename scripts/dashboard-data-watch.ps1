param(
  [int]$IntervalSec = 10
)

$ErrorActionPreference = "Stop"

while ($true) {
  pnpm ops:dashboard:data | Out-Host
  Start-Sleep -Seconds $IntervalSec
}
