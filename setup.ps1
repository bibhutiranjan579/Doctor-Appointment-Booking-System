#!/usr/bin/env pwsh
# ============================================
# SETUP SCRIPT - Doctor Appointment System
# Run this after extracting the zip file
# ============================================

Write-Host "`n===== Doctor Appointment System - Setup =====" -ForegroundColor Cyan

# Check prerequisites
Write-Host "`n[1/5] Checking prerequisites..." -ForegroundColor Yellow

$dotnetVersion = dotnet --version 2>$null
if (-not $dotnetVersion) { Write-Host "  ERROR: .NET SDK not found. Install from https://dotnet.microsoft.com/download/dotnet/10.0" -ForegroundColor Red; exit 1 }
Write-Host "  .NET SDK: $dotnetVersion" -ForegroundColor Green

$nodeVersion = node --version 2>$null
if (-not $nodeVersion) { Write-Host "  ERROR: Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red; exit 1 }
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

$npmVersion = npm --version 2>$null
Write-Host "  npm: $npmVersion" -ForegroundColor Green

# Restore Backend
Write-Host "`n[2/5] Restoring backend NuGet packages..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot/Backend"
dotnet restore
if ($LASTEXITCODE -ne 0) { Write-Host "  ERROR: Backend restore failed!" -ForegroundColor Red; Pop-Location; exit 1 }
Write-Host "  Backend packages restored!" -ForegroundColor Green
Pop-Location

# Install Frontend
Write-Host "`n[3/5] Installing frontend npm packages..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot/Frontend/doctor-appointment"
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "  ERROR: Frontend install failed!" -ForegroundColor Red; Pop-Location; exit 1 }
Write-Host "  Frontend packages installed!" -ForegroundColor Green
Pop-Location

# Build Backend
Write-Host "`n[4/5] Building backend..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot/Backend"
dotnet build --no-restore
if ($LASTEXITCODE -ne 0) { Write-Host "  ERROR: Backend build failed!" -ForegroundColor Red; Pop-Location; exit 1 }
Write-Host "  Backend built successfully!" -ForegroundColor Green
Pop-Location

# Build Frontend
Write-Host "`n[5/5] Building frontend..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot/Frontend/doctor-appointment"
npx ng build
if ($LASTEXITCODE -ne 0) { Write-Host "  WARNING: Frontend build had issues (may still work)" -ForegroundColor DarkYellow }
else { Write-Host "  Frontend built successfully!" -ForegroundColor Green }
Pop-Location

Write-Host "`n===== Setup Complete! =====" -ForegroundColor Cyan
Write-Host "`nTo run the application:" -ForegroundColor White
Write-Host "  Terminal 1: cd Backend/src/DoctorAppointment.API && dotnet run" -ForegroundColor Gray
Write-Host "  Terminal 2: cd Frontend/doctor-appointment && ng serve" -ForegroundColor Gray
Write-Host "  Open: http://localhost:4200`n" -ForegroundColor Gray
