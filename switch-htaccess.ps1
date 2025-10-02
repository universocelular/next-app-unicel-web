# Script para cambiar entre configuraciones de .htaccess
# Uso: .\switch-htaccess.ps1 [dev|prod]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "prod")]
    [string]$Mode
)

$publicDir = ".\public"
$htaccessPath = "$publicDir\.htaccess"
$devPath = "$publicDir\.htaccess.dev"
$prodPath = "$publicDir\.htaccess.production"

if ($Mode -eq "dev") {
    if (Test-Path $htaccessPath) {
        Move-Item $htaccessPath $prodPath -Force
        Write-Host "Configuración actual guardada como .htaccess.production" -ForegroundColor Yellow
    }
    
    if (Test-Path $devPath) {
        Copy-Item $devPath $htaccessPath -Force
        Write-Host "Configuración de desarrollo activada" -ForegroundColor Green
    } else {
        Write-Host "Archivo .htaccess.dev no encontrado" -ForegroundColor Red
    }
} elseif ($Mode -eq "prod") {
    if (Test-Path $htaccessPath) {
        Move-Item $htaccessPath $devPath -Force
        Write-Host "Configuración actual guardada como .htaccess.dev" -ForegroundColor Yellow
    }
    
    if (Test-Path $prodPath) {
        Copy-Item $prodPath $htaccessPath -Force
        Write-Host "Configuración de producción activada" -ForegroundColor Green
    } else {
        Write-Host "Archivo .htaccess.production no encontrado" -ForegroundColor Red
    }
}

Write-Host "Configuración de .htaccess cambiada a modo: $Mode" -ForegroundColor Cyan