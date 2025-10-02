# Unicel Server - Proyecto en Firebase Studio

¡Bienvenido a tu proyecto! Esta aplicación ha sido construida con un stack de tecnologías moderno y está diseñada para ser rápida, escalable y fácil de mantener. Este documento te servirá como guía para entender cómo funciona todo.

## 1. Tecnologías Utilizadas (Stack)

- **Framework**: **Next.js 15** con **App Router**. La aplicación aprovecha los Server Components para un rendimiento óptimo, renderizando gran parte del contenido en el servidor.
- **Lenguaje**: **TypeScript**. Para un código más robusto y con menos errores.
- **Base de Datos**: **Firebase Firestore**. Es una base de datos NoSQL (orientada a documentos) alojada en la nube. Toda la información de tus marcas, modelos, servicios y precios se almacena aquí.
- **Estilos**: **Tailwind CSS** para la utilidad de clases y **ShadCN UI** para un sistema de componentes pre-construidos y personalizables.
- **Hosting**: Preparado para **Firebase App Hosting**.

---

## 2. ¿Cómo Gestiono la Información de mi Web?

Toda la información (marcas, modelos, precios, etc.) se gestiona **exclusivamente a través del Panel de Administración**. No necesitas interactuar directamente con la base de datos.

**Para acceder al panel:**
1.  Una vez publicada tu aplicación, configura un subdominio (ej. `admin.tudominio.com`) en tu proveedor de DNS para que apunte a tu web de Firebase.
2.  Navega a tu subdominio de administrador (ej. `https://admin.tudominio.com`). Serás redirigido a la página de login.
3.  Usa las siguientes credenciales:
    - **Usuario:** `unicel@admin`
    - **Contraseña:** `Unicel_@admin2026`

Una vez dentro, podrás:
- **Añadir/Editar/Eliminar Marcas y Modelos** en la sección "Marcas y Modelos".
- **Crear/Gestionar Servicios y Sub-servicios** en la sección "Servicios".
- **Establecer Precios Personalizados** por modelo o en lote en la sección "Precios".
- **Configurar Modos Globales** como el "Modo Descuento" o el "Modo Gratis".
- Y mucho más.

Cada vez que guardas un cambio en el panel, la aplicación se comunica con Firebase Firestore para actualizar los datos, y la web pública refleja esos cambios automáticamente.

---

## 3. Estructura de Carpetas Clave

Aquí tienes un desglose de las carpetas más importantes y lo que contienen:

- **/src/app/**: El corazón de la aplicación.
  - `(main)/...`: Contiene las páginas públicas de la web (inicio, flujo de selección de servicios, etc.).
  - `(admin)/...`: **Contiene todas las páginas del Panel de Administración**. El acceso a este grupo de rutas está controlado por el middleware.
  - `/login/`: La página de inicio de sesión para el panel de admin.
  - `page.tsx`: La página de inicio que ven tus usuarios.
  - `layout.tsx`: La plantilla principal que envuelve toda la aplicación.
  - `globals.css`: Los estilos globales y variables de color de la aplicación.

- **/src/components/**: "Bloques" de React reutilizables que forman la interfaz.
  - `/admin/`: Componentes específicos para el panel de administración (ej. `BrandsAndModels`).
  - `/home/`: Componentes para la página de inicio (ej. `HeroSection`).
  - `/layout/`: Componentes estructurales como el `Header`.
  - `/model/`: Componentes para el flujo de selección de servicios (ej. `PricingDisplay`).
  - `/ui/`: Componentes base de ShadCN (Button, Card, Input, etc.).

- **/src/lib/**: Lógica central, datos y utilidades.
  - `/actions/`: **Carpeta Crucial**. Contiene las **Server Actions**. Estas son las funciones de "backend" que se ejecutan en el servidor y se comunican directamente con Firebase Firestore para obtener, crear, actualizar o eliminar datos.
  - `/db/`: Define los "tipos" (`types.ts`) de datos y contiene datos estáticos (como la lista de países y operadoras en `data.ts`).
  - `firebase.ts`: Contiene la configuración para conectar con tu proyecto de Firebase.
  - `utils.ts`: Funciones de utilidad reutilizables.

- **/src/middleware.ts**: Un archivo clave que intercepta las peticiones. Su función es revisar si el acceso viene de un subdominio `admin.*` y, en ese caso, dirigir al usuario a las páginas del panel de administración.

---

## 4. Flujo de Datos

1.  **Usuario visita la web**: Next.js renderiza una página en el servidor.
2.  **Petición de datos**: La página (ej. `src/app/page.tsx`) llama a una Server Action (ej. `getModels()` desde `src/lib/actions/models.ts`).
3.  **Acción del Servidor**: La Server Action consulta la base de datos de Firebase Firestore.
4.  **Respuesta**: Firestore devuelve los datos a la Server Action.
5.  **Renderizado**: La Server Action devuelve los datos a la página, que se renderiza con la información actualizada y se envía al navegador del usuario.

Este ciclo asegura que tu web siempre muestre la información más reciente de tu base de datos.
