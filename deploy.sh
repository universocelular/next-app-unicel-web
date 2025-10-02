#!/bin/bash

# UNIVERSO CELULAR - Script de Despliegue para Hostgator
# =====================================================

echo "🚀 Iniciando despliegue de UNIVERSO CELULAR..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar errores
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

# Función para mostrar éxito
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar información
info_msg() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Función para mostrar advertencias
warning_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error_exit "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
fi

# Verificar variables de entorno
if [ ! -f ".env.local" ]; then
    warning_msg "No se encontró .env.local. Asegúrate de configurar las variables de entorno."
fi

info_msg "Limpiando archivos temporales..."
npm run clean || error_exit "Error al limpiar archivos temporales"

info_msg "Instalando dependencias..."
npm install || error_exit "Error al instalar dependencias"

info_msg "Ejecutando verificación de tipos..."
npm run typecheck || error_exit "Error en verificación de tipos"

info_msg "Ejecutando linter..."
npm run lint || error_exit "Error en linter"

info_msg "Construyendo aplicación para producción..."
npm run build || error_exit "Error al construir la aplicación"

info_msg "Exportando archivos estáticos..."
npm run export || error_exit "Error al exportar archivos estáticos"

# Crear directorio de despliegue
DEPLOY_DIR="deploy_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$DEPLOY_DIR"

info_msg "Copiando archivos para despliegue en $DEPLOY_DIR..."

# Copiar archivos necesarios
cp -r out/* "$DEPLOY_DIR/" 2>/dev/null || warning_msg "No se encontró directorio 'out', usando '.next/static'"
cp -r .next/static "$DEPLOY_DIR/_next/" 2>/dev/null || true
cp public/.htaccess "$DEPLOY_DIR/" 2>/dev/null || warning_msg "No se encontró .htaccess"
cp public/manifest.json "$DEPLOY_DIR/" 2>/dev/null || true
cp public/favicon.svg "$DEPLOY_DIR/" 2>/dev/null || true
cp public/apple-touch-icon.png "$DEPLOY_DIR/" 2>/dev/null || true

# Crear archivo de instrucciones
cat > "$DEPLOY_DIR/INSTRUCCIONES_HOSTGATOR.txt" << EOF
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
EOF

success_msg "Despliegue preparado en directorio: $DEPLOY_DIR"
success_msg "Sube el contenido de esta carpeta a public_html en tu cPanel"

echo ""
info_msg "Archivos generados:"
ls -la "$DEPLOY_DIR"

echo ""
success_msg "🎉 ¡Despliegue completado exitosamente!"