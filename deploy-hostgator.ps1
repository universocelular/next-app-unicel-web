# ========================================================
# UNIVERSO CELULAR - Script de Despliegue para HostGator
# ========================================================

param(
    [switch]$SkipBuild = $false,
    [switch]$SkipClean = $false
)

$ErrorActionPreference = "Stop"

# Colores para output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host " UNIVERSO CELULAR - Deploy HostGator" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# ========================================================
# 1. VERIFICACIONES INICIALES
# ========================================================

Write-Info "Verificando requisitos..."

if (!(Test-Path "package.json")) {
    Write-Error "No se encontro package.json. Ejecuta este script desde la raiz del proyecto."
    exit 1
}

Write-Success "Verificacion completada"

# ========================================================
# 2. LIMPIEZA
# ========================================================

if (!$SkipClean) {
    Write-Info ""
    Write-Info "Limpiando archivos anteriores..."
    
    if (Test-Path ".next") {
        Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "out") {
        Remove-Item "out" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "hostgator-deploy") {
        Remove-Item "hostgator-deploy" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "hostgator-deploy.zip") {
        Remove-Item "hostgator-deploy.zip" -Force -ErrorAction SilentlyContinue
    }
    
    Write-Success "Limpieza completada"
}

# ========================================================
# 3. BUILD DEL PROYECTO
# ========================================================

if (!$SkipBuild) {
    Write-Info ""
    Write-Info "Construyendo proyecto para produccion..."
    Write-Info "Esto puede tardar varios minutos..."
    Write-Info ""
    
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Error en el build"
        }
        Write-Success ""
        Write-Success "Build completado exitosamente"
    } catch {
        Write-Error "Error durante el build: $_"
        exit 1
    }
} else {
    Write-Warning "Omitiendo build"
    if (!(Test-Path "out")) {
        Write-Error "No existe la carpeta 'out'. Ejecuta el script sin -SkipBuild"
        exit 1
    }
}

# ========================================================
# 4. PREPARAR ARCHIVOS PARA HOSTGATOR
# ========================================================

Write-Info ""
Write-Info "Preparando archivos para HostGator..."

$deployFolder = ".\hostgator-deploy"
New-Item -ItemType Directory -Path $deployFolder -Force | Out-Null

Write-Info "Copiando archivos del sitio..."
if (Test-Path "out") {
    Copy-Item "out\*" -Destination $deployFolder -Recurse -Force
} else {
    Write-Error "No se encontro la carpeta 'out'. El build no se completo correctamente."
    exit 1
}

Write-Info "Creando archivo .htaccess..."

$htaccessContent = @'
# UNIVERSO CELULAR - Configuracion para HostGator
# ===============================================

RewriteEngine On

# Forzar HTTPS (descomentar si tienes SSL)
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Redirigir www a no-www (opcional)
# RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
# RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

# Configuracion para Next.js Export (SPA Routing)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L,QSA]

# Prevenir acceso a archivos sensibles
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

# Tipos MIME
AddType application/javascript .js
AddType text/css .css
AddType image/svg+xml .svg

# Compresion GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# Configuracion de cache
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Imagenes
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    
    # CSS y JavaScript
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    
    # HTML
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Headers de seguridad
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
'@

Set-Content -Path "$deployFolder\.htaccess" -Value $htaccessContent -Encoding UTF8

Write-Info "Creando archivo README..."

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$readmeContent = @"
UNIVERSO CELULAR - Instrucciones de Despliegue
===============================================

Generado el: $timestamp

PASOS PARA SUBIR A HOSTGATOR:

1. Ve a cPanel de HostGator
2. Abre el Administrador de Archivos (File Manager)
3. Navega a la carpeta public_html
4. IMPORTANTE: Elimina todo el contenido actual (haz backup primero)
5. Sube el archivo hostgator-deploy.zip
6. Click derecho en el ZIP -> Extract
7. Elimina el archivo ZIP despues de extraer
8. Verifica que los archivos esten directamente en public_html

VERIFICACION:

- Visita tu dominio en el navegador
- Verifica que el sitio cargue correctamente
- Prueba la navegacion entre paginas
- Revisa la consola del navegador (F12) por errores

CONFIGURACION SSL:

Si tienes certificado SSL, edita .htaccess y descomenta:
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

PROBLEMAS COMUNES:

- Error 404: Verifica que .htaccess este en public_html
- CSS no carga: Verifica permisos (644 archivos, 755 carpetas)
- Pagina en blanco: Revisa consola del navegador y error_log en cPanel

Para mas detalles, lee INSTRUCCIONES-HOSTGATOR.md en el proyecto.
"@

Set-Content -Path "$deployFolder\README.txt" -Value $readmeContent -Encoding UTF8

Write-Success "Archivos preparados en: $deployFolder"

# ========================================================
# 5. CREAR ARCHIVO ZIP
# ========================================================

Write-Info ""
Write-Info "Creando archivo ZIP..."

$zipPath = ".\hostgator-deploy.zip"

try {
    Compress-Archive -Path "$deployFolder\*" -DestinationPath $zipPath -Force -CompressionLevel Optimal
    
    $zipSize = (Get-Item $zipPath).Length / 1MB
    $zipSizeRounded = [math]::Round($zipSize, 2)
    
    Write-Success "Archivo ZIP creado exitosamente: hostgator-deploy.zip"
    Write-Success "Tamanio: $zipSizeRounded MB"
} catch {
    Write-Error "Error al crear el archivo ZIP: $_"
    exit 1
}

# ========================================================
# 6. RESUMEN FINAL
# ========================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " DESPLIEGUE PREPARADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Archivos generados:" -ForegroundColor White
Write-Host "  - hostgator-deploy/     (carpeta)" -ForegroundColor Gray
Write-Host "  - hostgator-deploy.zip  (archivo para subir)" -ForegroundColor Gray
Write-Host ""

Write-Host "PROXIMOS PASOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ve a cPanel de HostGator" -ForegroundColor Yellow
Write-Host "2. Abre Administrador de Archivos" -ForegroundColor Yellow
Write-Host "3. Navega a public_html" -ForegroundColor Yellow
Write-Host "4. ELIMINA todo el contenido actual" -ForegroundColor Yellow
Write-Host "5. Sube hostgator-deploy.zip" -ForegroundColor Yellow
Write-Host "6. Extrae el ZIP (click derecho)" -ForegroundColor Yellow
Write-Host "7. Elimina el archivo ZIP" -ForegroundColor Yellow
Write-Host "8. Verifica tu sitio en el navegador" -ForegroundColor Yellow
Write-Host ""

Write-Host "Lee README.txt en hostgator-deploy/ para mas detalles" -ForegroundColor Cyan
Write-Host ""
Write-Success "Listo para desplegar!"
Write-Host ""
