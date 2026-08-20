$hrmDir = 'C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\api\hrm-api'
$env:HRM_BE_PORT = '28001'
$env:NODE_ENV = 'development'
while ($true) {
  $p = Start-Process -FilePath 'node' -ArgumentList @('--enable-source-maps','dist/main.js') -WorkingDirectory $hrmDir -PassThru -WindowStyle Hidden -RedirectStandardOutput "$hrmDir\logs\l0-watchdog-hrm-stdout.log" -RedirectStandardError "$hrmDir\logs\l0-watchdog-hrm-stderr.log"
  Set-Content "$hrmDir\logs\l0-watchdog-hrm.pid" $p.Id
  $p.WaitForExit()
  Start-Sleep -Seconds 2
}
