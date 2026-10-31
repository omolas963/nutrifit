# NutriFit — Contador Inteligente de Calorías y Macros (Producción 24/7)

NutriFit es una aplicación web progresiva (PWA) profesional, responsive y mobile-first para el control inteligente de nutrición, calorías y macronutrientes. Diseñada para funcionar como una sola aplicación (backend y frontend en el mismo dominio) sin depender de ningún ordenador encendido, lista para desplegar en **Render** y accesible desde cualquier dispositivo.

---

## 🚀 Despliegue en Render (Paso a Paso)

La aplicación está completamente configurada con `render.yaml` y `package.json` para desplegarse en la capa gratuita de Render con 0 €/mes de coste.

### Opción A: Despliegue Automático con Blueprint (Recomendado)
1. Sube este repositorio a tu cuenta de **GitHub**:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/nutrifit.git
   git push -u origin main
   ```
2. Entra en tu panel de [Render](https://dashboard.render.com).
3. Haz clic en **New +** y selecciona **Blueprint**.
4. Conecta tu repositorio de GitHub `nutrifit`.
5. Render detectará automáticamente el archivo `render.yaml` con:
   - **Environment:** `Node`
   - **Plan:** `Free`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start` (ejecuta `node dist/server.js`)
   - **Health Check Path:** `/health`
6. En la variable de entorno `GEMINI_API_KEY`, introduce tu clave de Google AI Studio (o déjala vacía para usar el motor de IA autónomo integrado).
7. Haz clic en **Apply**. ¡Tu app estará online en 2 minutos!

### Opción B: Despliegue Manual como Web Service
1. En [Render](https://dashboard.render.com), haz clic en **New +** → **Web Service**.
2. Conecta tu repositorio de GitHub.
3. Configura los siguientes campos:
   - **Name:** `nutrifit-app`
   - **Region:** `Frankfurt` (o la más cercana)
   - **Branch:** `main`
   - **Root Directory:** (dejar en blanco)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. En **Advanced** → **Health Check Path**, escribe: `/health`.
5. En **Environment Variables**, añade:
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(tu API key de Gemini)*
6. Haz clic en **Create Web Service**.

---

## 🛡️ Arquitectura y Seguridad de Producción

1. **Una Sola Aplicación (Single Origin):**
   - El servidor Express en `server/index.ts` sirve simultáneamente la API REST (`/api/*`), los endpoints de salud (`/health` y `/api/health`) y la SPA compilada (`dist/`).
   - El frontend consume la API mediante **rutas relativas** (`/api/...`). No hay ninguna referencia fija a `localhost` ni a `127.0.0.1`.
2. **Host y Puerto Dinámicos:**
   - El servidor escucha en `0.0.0.0` y lee el puerto de `process.env.PORT` (por defecto `10000` en Render).
3. **Verificación Estricta de Certificados TLS:**
   - La directiva insegura `NODE_TLS_REJECT_UNAUTHORIZED=0` ha sido **eliminada por completo** de todo el código, scripts y configuraciones.
   - La verificación de certificados SSL/TLS está 100% activa en producción, protegiendo las llamadas a Gemini, Open Food Facts y USDA contra ataques Man-in-the-Middle.
4. **Protección de Datos y Privacidad:**
   - Los datos de usuario, diarios, recetas y recuerdos residen de forma segura en el almacenamiento local del navegador (`localStorage` / `IndexedDB`), por lo que no se pierden en reinicios de contenedores efímeros de la nube.
5. **Cero Secretos en el Historial:**
   - Ninguna API key real está presente en el código ni en ningún commit de Git.

---

## 📱 Instalación como PWA en Dispositivos

NutriFit está configurada como una **Progressive Web App (PWA)** instalable con Service Worker y modo standalone:

- **En Android (Chrome / Samsung Internet):**
  Abre la URL de Render, toca el menú de 3 puntos (`⋮`) y pulsa **"Instalar aplicación"** o **"Añadir a pantalla de inicio"**.
- **En iPhone / iPad (Safari):**
  Abre la URL en Safari, pulsa el botón **Compartir** (cuadrado con flecha hacia arriba) y selecciona **"Añadir a pantalla de inicio"**.
- **En Windows / Mac (Chrome / Edge):**
  Haz clic en el icono de instalación que aparece a la derecha de la barra de direcciones (**"Instalar NutriFit"**).

---

## 💡 Características Principales de NutriFit

- **Buscador Bilingüe Inteligente (Español y Catalán):**
  Catálogo verificado con más de 570 alimentos de España (marcas de Mercadona/Hacendado, Bonpreu, Bimbo, platos caseros tradicionales). Tolerancia a faltas ortográficas y normalización de singulares/plurales y género.
- **Análisis Fotográfico con Desglose Multi-Alimento:**
  - Desglose exhaustivo de platos combinados en elementos individuales con método de cocinado y rango de gramos.
  - **Pines interactivos numerados (1, 2, 3...)** sobre la foto que resaltan y navegan a la tarjeta del alimento.
  - Botón **«Cambiar»** con las 3 alternativas más probables de la base de datos oficial.
  - Botón **«Ver ingredientes»** en platos inseparables (paella, tortilla, lentejas, lasaña, pizza) con opción de desglose a ingredientes individuales.
  - Cero nombres genéricos prohibidos (*"plato combinado"* erradicado).
- **Asistente Nutricional con IA Clínica y Deportiva:**
  - Conectado a tus datos reales (peso, calorías meta, macros restantes de hoy).
  - Consejos dinámicos y variados: explicación metabólica de estancamientos (NEAT, retención hídrica), cálculo matemático de reparto de macronutrientes, ideas con ingredientes de la nevera y rotación de cenas.
  - Botones de acción directa dentro del chat para registrar comidas en 1 toque.
  - Protocolos de seguridad activos para prevención de Trastornos de la Conducta Alimentaria (TCA) y derivación médica.
- **Planes de Comidas y Lista de la Compra:**
  - Generación de planes diarios seguros (mínimo 1200 kcal mujeres / 1500 kcal hombres) accesibles desde *Hoy* y *Objetivo*.
  - Lista de la compra interactiva categorizada en *Recetas*.

---

## 🛠️ Comandos de Desarrollo y Compilación

```bash
# Instalar dependencias
npm install

# Compilar frontend y backend para producción
npm run build

# Iniciar el servidor de producción (puerto 10000 por defecto)
npm start
```
