# Start Telegram PM channel at Windows logon (sponsor optional — one-time setup)
# Copy shortcut to: shell:startup  OR  Task Scheduler → At logon
$ErrorActionPreference = 'Stop'
$Repo = 'C:\xevn-ecosystem'
if (-not (Test-Path $Repo)) {
  $Repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
}
Set-Location $Repo
node .cursor/team/telegram-pm/ensure-channel.mjs | Out-File -Append docs/qa/evidence/_tmp-telegram-channel-startup.log
