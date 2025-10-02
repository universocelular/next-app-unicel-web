# UNIVERSO CELULAR - Script de Despliegue para Hostgator (PowerShell)
# ===================================================================

Write-Host "🚀 Iniciando despliegue de UNIVERSO CELULAR..." -ForegroundColor Cyan

function Write-Error-Exit {
    param($Message)
    Write-Host "❌ Error: $Message" -ForegroundColor Red
    exit 1
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Error-Exit "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
}

# Verificar variables de entorno
if (-not (Test-Path ".env.local")) {
    Write-Warning "No se encontró .env.local. Asegúrate de configurar las variables de entorno."
}

Write-Info "Limpiando archivos temporales..."
npm run clean
if ($LASTEXITCODE -ne 0) { Write-Error-Exit "Error al limpiar archivos temporales" }

Write-Info "Instalando dependencias..."
npm install
if ($LASTEXITCODE -ne 0) { Write-Error-Exit "Error al instalar dependencias" }

Write-Info "Ejecutando verificación de tipos..."
npm run typecheck
if ($LASTEXITCODE -ne 0) { Write-Error-Exit "Error en verificación de tipos" }

Write-Info "Ejecutando linter..."
npm run lint
if ($LASTEXITCODE -ne 0) { Write-Error-Exit "Error en linter" }

Write-Info "Construyendo aplicación para producción..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error-Exit "Error al construir la aplicación" }

# Crear directorio de despliegue
$DeployDir = "deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $DeployDir -Force | Out-Null

Write-Info "Copiando archivos para despliegue en $DeployDir..."

# Copiar archivos necesarios
if (Test-Path "out") {
    Copy-Item -Path "out\*" -Destination $DeployDir -Recurse -Force
} elseif (Test-Path ".next\static") {
    New-Item -ItemType Directory -Path "$DeployDir\_next" -Force | Out-Null
    Copy-Item -Path ".next\static" -Destination "$DeployDir\_next\" -Recurse -Force
    Write-Warning "Usando archivos de .next/static en lugar de 'out'"
}

# Copiar archivos públicos
if (Test-Path "public\.htaccess") { Copy-Item -Path "public\.htaccess" -Destination $DeployDir -Force }
if (Test-Path "public\manifest.json") { Copy-Item -Path "public\manifest.json" -Destination $DeployDir -Force }
if (Test-Path "public\favicon.svg") { Copy-Item -Path "public\favicon.svg" -Destination $DeployDir -Force }
if (Test-Path "public\apple-touch-icon.png") { Copy-Item -Path "public\apple-touch-icon.png" -Destination $DeployDir -Force }

# Crear archivo de instrucciones
$InstructionsContent = @"
INSTRUCCIONES PARA DESPLIEGUE EN HOSTGATOR
==========================================

1. Sube todos los archivos de esta carpeta al directorio public_html de tu cPanel
2. Asegúrate de que el archivo .htaccess se haya subido correctamente
3. Configura las variables de entorno en cPanel:
   - Ve a "Variables de Entorno" en cPanel
   - Agrega las variables del archivo .env.example
4. Si usas un subdominio para admin, configúralo en cPanel
5. Verifica que el SSL esté habilitado para HTTPS

ARCHIVOS IMPORTANTES:
- .htaccess: Configuración de servidor
- manifest.json: Configuración PWA
- favicon.svg: Icono principal
- apple-touch-icon.png: Icono para iOS

¡Tu sitio estará listo en tu dominio de Hostgator!
"@

Set-Content -Path "$DeployDir\INSTRUCCIONES_HOSTGATOR.txt" -Value $InstructionsContent -Encoding UTF8

Write-Success "Despliegue preparado en directorio: $DeployDir"
Write-Success "Sube el contenido de esta carpeta a public_html en tu cPanel"

Write-Host ""
Write-Info "Archivos generados:"
Get-ChildItem -Path $DeployDir | Format-Table Name, Length, LastWriteTime

Write-Host ""
Write-Success "🎉 ¡Despliegue completado exitosamente!"