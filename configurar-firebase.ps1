# Script para configurar variables de Firebase de forma interactiva
Write-Host "`n🔥 Configurador de Firebase para HostGator`n" -ForegroundColor Magenta

Write-Host "Este script te ayudará a crear el archivo .env.production.local con tus credenciales de Firebase.`n" -ForegroundColor Cyan

Write-Host "📋 Necesitarás tu configuración de Firebase Console:" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com/ → Tu Proyecto → Settings → General → Your apps`n" -ForegroundColor Gray

# Preguntar por cada valor
Write-Host "Por favor, ingresa los siguientes valores:`n" -ForegroundColor White

$apiKey = Read-Host "FIREBASE_API_KEY"
$authDomain = Read-Host "FIREBASE_AUTH_DOMAIN (ejemplo: tu-proyecto.firebaseapp.com)"
$projectId = Read-Host "FIREBASE_PROJECT_ID"
$storageBucket = Read-Host "FIREBASE_STORAGE_BUCKET (ejemplo: tu-proyecto.appspot.com)"
$messagingSenderId = Read-Host "FIREBASE_MESSAGING_SENDER_ID"
$appId = Read-Host "FIREBASE_APP_ID"

# Crear contenido del archivo
$envContent = @"
# Firebase Configuration - PRODUCCIÓN
# =====================================
# Generado automáticamente el $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

NEXT_PUBLIC_FIREBASE_API_KEY=$apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=$appId

# NO usar emuladores en producción
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false

# Modo de desarrollo
NODE_ENV=production
"@

# Guardar archivo
$envFile = ".env.production.local"
Set-Content -Path $envFile -Value $envContent -Encoding UTF8

Write-Host "`n✅ Archivo creado exitosamente: $envFile" -ForegroundColor Green
Write-Host "`n📝 Contenido del archivo:`n" -ForegroundColor Cyan
Write-Host $envContent -ForegroundColor Gray

Write-Host "`n⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   • Este archivo contiene información sensible" -ForegroundColor White
Write-Host "   • NO lo subas a Git (ya está en .gitignore)" -ForegroundColor White
Write-Host "   • Guarda una copia segura de estas credenciales`n" -ForegroundColor White

Write-Host "🎯 Próximo paso: Ejecuta .\deploy-hostgator.ps1 para generar el despliegue`n" -ForegroundColor Green


