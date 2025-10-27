#!/usr/bin/env pwsh
param(
  [switch]$Print
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path $ScriptDir -Parent
$envFile = Join-Path $ProjectRoot ".env"
if (-not (Test-Path $envFile)) {
  $envFile = Join-Path $ProjectRoot ".env.example"
}

if (-not (Test-Path $envFile)) {
  Write-Error "No .env or .env.example file found. Run 'npm run bootstrap' first."
  exit 1
}

$lines = Get-Content -Path $envFile
foreach ($line in $lines) {
  $trimmed = $line.Trim()
  if ($trimmed.StartsWith("#") -or $trimmed.Length -eq 0) {
    continue
  }
  $parts = $trimmed.Split("=",2)
  if ($parts.Length -ne 2) {
    continue
  }
  $key = $parts[0].Trim()
  $value = $parts[1]
  if ($Print) {
    Write-Output "setx $key $value"
  } else {
    Set-Item -Path Env:$key -Value $value
  }
}

if ($Print) {
  Write-Output "# Commands emitted for setx from $envFile"
} else {
  Write-Output "Environment variables loaded from $envFile"
  Write-Output "Use '. .\scripts\set-env.ps1' to apply in the current session."
}
