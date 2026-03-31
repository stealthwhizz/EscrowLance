# Starts backend and frontend dev servers in separate PowerShell windows
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$root/backend'; npm run dev"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$root/frontend'; npm run dev"

Write-Host "Launched backend (npm run dev) and frontend (npm run dev) in new terminals."
