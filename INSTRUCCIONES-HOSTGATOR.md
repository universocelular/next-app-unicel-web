# 🚀 Guía Completa de Despliegue en HostGator

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

1. ✅ Cuenta de HostGator activa con cPanel
2. ✅ Node.js instalado en tu computadora (v18 o superior)
3. ✅ Firebase configurado y proyecto creado
4. ✅ Variables de entorno configuradas

---

## 🔧 Paso 1: Configurar Variables de Entorno

### 1.1 Crear archivo `.env.production.local`

Crea un archivo llamado `.env.production.local` en la raíz del proyecto con tu configuración de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_real
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
NODE_ENV=production
```

**⚠️ IMPORTANTE:** Reemplaza TODOS los valores con tus credenciales reales de Firebase.

### 1.2 Obtener credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Click en el ícono de configuración ⚙️ → "Project settings"
4. En la sección "Your apps", busca tu app web
5. Copia todos los valores de configuración

---

## 📦 Paso 2: Generar Archivos de Despliegue

### 2.1 Ejecutar el script de despliegue

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
.\deploy-hostgator.ps1
```

Este script hará automáticamente:
- ✅ Limpieza de archivos anteriores
- ✅ Build de producción de Next.js
- ✅ Exportación estática
- ✅ Creación de carpeta `hostgator-deploy/`
- ✅ Generación de archivo `.htaccess`
- ✅ Creación de archivo ZIP listo para subir

### 2.2 Verificar que se generaron los archivos

Deberías ver:
- 📁 `hostgator-deploy/` - Carpeta con todos los archivos
- 📦 `hostgator-deploy.zip` - Archivo ZIP (este es el que subirás)

---

## 🌐 Paso 3: Subir a HostGator

### 3.1 Acceder a cPanel

1. Inicia sesión en tu cuenta de HostGator
2. Ve a cPanel
3. Busca y abre "**Administrador de Archivos**" (File Manager)

### 3.2 Preparar la carpeta public_html

⚠️ **MUY IMPORTANTE - HAZ BACKUP PRIMERO:**

1. Si tienes archivos importantes en `public_html`, descárgalos primero
2. Selecciona TODO el contenido dentro de `public_html`
3. Click en "Delete" o "Eliminar"
4. Confirma la eliminación

### 3.3 Subir el archivo ZIP

1. Asegúrate de estar DENTRO de la carpeta `public_html`
2. Click en "Upload" (Subir)
3. Selecciona el archivo `hostgator-deploy.zip`
4. Espera a que termine la subida (puede tardar varios minutos dependiendo del tamaño)

### 3.4 Extraer el ZIP

1. Vuelve al Administrador de Archivos
2. Navega a `public_html`
3. Busca el archivo `hostgator-deploy.zip`
4. Click derecho → "**Extract**" (Extraer)
5. Selecciona extraer en "Current Directory" (Directorio actual)
6. Click "Extract File(s)"
7. Espera a que termine
8. **ELIMINA** el archivo `hostgator-deploy.zip` (ya no lo necesitas)

### 3.5 Verificar la estructura

La estructura en `public_html` debe verse así:

```
public_html/
├── .htaccess          ← IMPORTANTE
├── index.html
├── _next/
│   └── static/
├── images/
├── logos/
├── favicon.svg
└── ... (otros archivos)
```

**⚠️ CRÍTICO:** Los archivos deben estar DIRECTAMENTE en `public_html`, NO en una subcarpeta.

---

## ✅ Paso 4: Configurar y Verificar

### 4.1 Verificar permisos

En cPanel → File Manager:
- Archivos (`.html`, `.css`, `.js`, etc.): **644**
- Carpetas: **755**
- Archivo `.htaccess`: **644**

Si es necesario, selecciona archivos → Click en "Permissions" → Ajusta.

### 4.2 Configurar SSL (HTTPS)

Si tienes certificado SSL instalado:

1. Edita el archivo `.htaccess` en `public_html`
2. Busca estas líneas:

```apache
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

3. Quita el `#` para descomentarlas:

```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

4. Guarda el archivo

### 4.3 Configurar dominio con/sin WWW

Decide si quieres `www.tudominio.com` o `tudominio.com`.

**Para redirigir WWW → sin WWW:**

En `.htaccess`, descomenta:

```apache
RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]
```

### 4.4 Probar el sitio

1. Abre tu navegador
2. Ve a tu dominio: `https://tudominio.com`
3. Verifica que el sitio cargue correctamente
4. Prueba navegar entre diferentes páginas
5. Abre la consola del navegador (F12) y verifica que no haya errores

---

## 🐛 Solución de Problemas Comunes

### Problema: "Error 404 - Página no encontrada" al navegar

**Causa:** El archivo `.htaccess` no está funcionando o no existe.

**Solución:**
1. Verifica que `.htaccess` esté en `public_html`
2. Verifica que los archivos ocultos estén visibles en File Manager (Settings → Show Hidden Files)
3. Verifica el contenido del `.htaccess`

### Problema: CSS o imágenes no cargan

**Causa:** Permisos incorrectos o rutas rotas.

**Solución:**
1. Verifica permisos de archivos (644) y carpetas (755)
2. Abre la consola del navegador (F12) → Network tab
3. Busca qué archivos fallan
4. Verifica que los archivos existan en el servidor

### Problema: Página en blanco

**Causa:** Error de JavaScript o configuración incorrecta.

**Solución:**
1. Abre la consola del navegador (F12)
2. Revisa errores en la pestaña Console
3. En cPanel → Metrics → Errors, revisa `error_log`
4. Verifica que las variables de Firebase estén correctas

### Problema: "Firebase configuration is incomplete"

**Causa:** Variables de entorno no se incluyeron en el build.

**Solución:**
1. Verifica que `.env.production.local` exista con valores correctos
2. Ejecuta de nuevo `.\deploy-hostgator.ps1`
3. Sube nuevamente el ZIP

### Problema: El ZIP no se puede extraer

**Causa:** ZIP corrupto o subida interrumpida.

**Solución:**
1. Elimina el ZIP del servidor
2. Genera uno nuevo: `.\deploy-hostgator.ps1 -SkipBuild` (si ya hiciste build)
3. Sube nuevamente usando **modo binario** en FTP
   O mejor, usa el File Manager de cPanel

---

## 🔄 Actualizaciones Futuras

Cuando necesites actualizar tu sitio:

1. Haz los cambios en tu código
2. Ejecuta: `.\deploy-hostgator.ps1`
3. Sube el nuevo `hostgator-deploy.zip` a `public_html`
4. Extrae (esto sobrescribirá archivos existentes)
5. Elimina el ZIP

**Tip:** Puedes usar `-SkipClean` para builds más rápidos si no cambiaste dependencias:

```powershell
.\deploy-hostgator.ps1 -SkipClean
```

---

## 📊 Optimizaciones Opcionales

### Habilitar caché del navegador

El `.htaccess` ya incluye configuración de caché. Si quieres ajustarla, edita las secciones `<IfModule mod_expires.c>`.

### Comprimir imágenes

Antes de subir, comprime tus imágenes usando:
- [TinyPNG](https://tinypng.com/)
- [Squoosh](https://squoosh.app/)

### CDN (Opcional)

Para mejor rendimiento global:
1. Cloudflare (gratis): https://www.cloudflare.com/
2. Configura tu dominio para usar Cloudflare
3. Habilita caché y minificación

---

## 🆘 Soporte Adicional

### Recursos útiles:

- **HostGator Knowledge Base:** https://www.hostgator.com/help
- **Firebase Documentation:** https://firebase.google.com/docs
- **Next.js Static Export:** https://nextjs.org/docs/app/building-your-application/deploying/static-exports

### Comandos útiles:

```powershell
# Build y deploy completo
.\deploy-hostgator.ps1

# Omitir limpieza (más rápido)
.\deploy-hostgator.ps1 -SkipClean

# Omitir build (si ya hiciste build)
.\deploy-hostgator.ps1 -SkipBuild

# Omitir ambos (solo crear ZIP)
.\deploy-hostgator.ps1 -SkipClean -SkipBuild
```

---

## ✨ Checklist Final

Antes de dar por terminado el despliegue:

- [ ] ✅ Variables de Firebase configuradas en `.env.production.local`
- [ ] ✅ Build exitoso sin errores
- [ ] ✅ ZIP generado correctamente
- [ ] ✅ Archivos subidos a `public_html`
- [ ] ✅ ZIP extraído correctamente
- [ ] ✅ Archivos en la ubicación correcta (NO en subcarpeta)
- [ ] ✅ Archivo `.htaccess` presente
- [ ] ✅ Permisos correctos (644 archivos, 755 carpetas)
- [ ] ✅ SSL configurado (si aplica)
- [ ] ✅ Sitio carga correctamente en navegador
- [ ] ✅ Navegación entre páginas funciona
- [ ] ✅ No hay errores en consola del navegador
- [ ] ✅ Datos de Firebase se cargan correctamente

---

**🎉 ¡Listo! Tu sitio debería estar funcionando en HostGator.**

Si encuentras algún problema, revisa la sección de **Solución de Problemas** o consulta los logs en cPanel → Metrics → Errors.


