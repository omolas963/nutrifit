# NutriFit — Aplicación Profesional de Control de Calorías y Macros

Aplicación web completa, responsive, mobile-first e instalable como PWA para el cálculo y control inteligente de calorías y macronutrientes (proteínas, carbohidratos y grasas).

---

## 1. URLs de Acceso y Estado del Despliegue

| Entorno | URL | Estado |
| :--- | :--- | :--- |
| **Local / Red Local** | `http://127.0.0.1:5000` | **Activo 100%** (independiente de Antigravity) |
| **PWA Web Pública (Netlify)** | `https://admirable-lamington-5194ca.netlify.app` *(Password: My-Drop-Site)* | **Desplegado y Funcional** |
| **Repositorio GitHub** | `https://github.com/omolas23-hub/nutrifit` | **Creado y Vinculado** |
| **Web Service en la Nube (Render)** | `https://nutrifit-app.onrender.com` | **Listo para compilación continua** |

---

## 2. Cómo Instalar la App en Móvil y Ordenador

NutriFit está configurada como una **Progressive Web App (PWA)** de última generación con Service Worker, caché inteligente de recursos y funcionamiento offline:

- **En Android (Chrome / Samsung Internet):**
  1. Abre la URL en el navegador.
  2. Pulsa en los 3 puntos (`⋮`) arriba a la derecha y selecciona **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**.
  3. Se instalará un icono nativo en tu cajón de aplicaciones con pantalla completa (modo standalone sin barra de direcciones).
- **En iPhone / iPad (Safari):**
  1. Abre la URL en Safari.
  2. Pulsa el botón de **Compartir** (cuadrado con flecha hacia arriba).
  3. Selecciona **"Añadir a la pantalla de inicio"**.
- **En Windows / Mac (Edge / Chrome):**
  1. Abre la URL en el navegador.
  2. En la barra de direcciones verás un icono de pantalla con una flecha: haz clic en **"Instalar NutriFit"** o pulsa en `Iniciar_NutriFit.bat` en tu PC.

---

## 3. Dónde Ver Logs, Cómo Actualizar y Cambiar la API Key

- **Ver Logs del Servidor:**
  - En local: el servidor escribe en `server.log` o en la consola del proceso Node.
  - En Render: dentro de tu panel en `dashboard.render.com` → pulsa en tu servicio → pestaña **Logs** en vivo.
- **Actualizar la Aplicación:**
  - Los cambios en la rama `main` de GitHub se compilan automáticamente.
  - En local basta con ejecutar `npm run build` y el servidor cargará la nueva distribución.
- **Cambiar la API Key:**
  - En local: edita el archivo `.env` (`GEMINI_API_KEY=tu_nueva_clave`).
  - En Render: ve a **Settings** → **Environment Variables** → edita `GEMINI_API_KEY` y pulsa **Save Changes**.

---

## 4. Coste Mensual Real

- **0,00 €/mes (Gratis)**.
- Despliegue en capa gratuita de Render (750 horas mensuales continuas) y CDN global de Netlify.

---

## 5. Acciones Realizadas en esta Conversión a Producción

1. **Aislamiento Total de Antigravity:** El backend ya no depende de comandos ni terminales del editor; se ejecuta como proceso de sistema desacoplado y en el inicio automático de Windows (`Startup`).
2. **Seguridad de Secretos:** Todas las credenciales externas (Google Gemini, OpenAI, Claude, USDA) se extrajeron a variables de entorno con `.env.example` y exclusión estricta en `.gitignore`.
3. **Platos Reales en Reconocimiento de Voz y Texto:** Consultas como *"patatas con arroz con pollo"* extraen patatas cocidas/asadas, arroz blanco y pechuga de pollo de plato real, eliminando coincidencias de patatas fritas de bolsa.
4. **Buscador de Alimentos Mejorado:** Priorización estricta de productos nacionales españoles (*Pan Bimbo*, marcas de *Mercadona/Hacendado*, *Ortiz*, etc.) y badges de alimentos estándar (`⭐ Estándar / Normal`).
