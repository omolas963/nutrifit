# NutriFit — Calorie & Macro Tracker (Producción 24/7)

NutriFit es una aplicación web progresiva (PWA) profesional, responsive y mobile-first para el control inteligente de nutrición, calorías y macronutrientes, con buscador bilingüe en capas y asistente nutricional impulsado por IA.

---

## 1. Informe de Cambios y Actualización del Sistema

### A) Diagnóstico y Renovación del Buscador de Alimentos
- **Causa del fallo previo con "huevos fritos" y "ensaimada":**
  1. *Open Food Facts*: Base de datos orientada exclusivamente a productos envasados de supermercado con código de barras. Platos de cocina tradicional no disponen de EAN/código y las búsquedas con términos compuestos a menudo arrojaban errores o no tenían correspondencia.
  2. *USDA FoodData Central*: Base de datos en inglés que carece de cobertura para términos y platos regionales de la gastronomía española y catalana (*ensaimada*, *fricandó*, *ous ferrats*, *botifarra amb seques*, *pa amb tomàquet*).
- **Nuevo Buscador en 3 Capas (Backend):**
  1. **Capa 1 (Base propia persistente):** Catálogo enriquecido con **más de 514 alimentos, platos e ingredientes habituales de España y Cataluña**. Soporte bilingüe completo (español y catalán), sinónimos coloquiales, marcas de supermercado (Mercadona/Hacendado, Bimbo), versión estándar destacada (`⭐ Estándar`), búsqueda difusa con tolerancia a faltas tipográficas y normalización de singulares/plurales y tildes.
  2. **Capa 2 (Fuentes externas en paralelo con timeout de 2.5s):** Consulta concurrente a Open Food Facts España y USDA (con traducción de términos de búsqueda).
  3. **Capa 3 (Fallback con Gemini y Auto-Aprendizaje):** Si ninguna capa previa arroja un resultado certero, Gemini estima el plato en formato JSON estricto (calorías, proteínas, carbohidratos, grasas, fibra, azúcares, sal y ración típica). Valida la coherencia energética ($kcal \approx 4P + 4C + 9G$) y lo guarda en la base propia para que las siguientes consultas se resuelvan al instante (0 ms).
- **Mejoras en la Interfaz de Búsqueda:**
  - Etiquetas visibles: **Verificado** (fuentes oficiales) o **Estimado por IA**.
  - Selector de unidades: Alterna entre **Gramos** o **Unidades / Ración típica** (ej. *1 huevo frito*, *1 ensaimada individual*, *1 trozo de pan de payés*).
  - Botón **"No encuentro mi alimento"**: Permite solicitar una estimación directa por IA o crear un alimento personalizado manualmente.
  - Historial de búsquedas recientes y pestaña de **Favoritos (★)** persistente.

---

### B) Reubicación de la Pestaña «Plan» y Lista de la Compra
- **Eliminación del menú inferior:** Se ha liberado el hueco de «Plan» en la barra de navegación para el nuevo Asistente de IA.
- **Acceso en menos de 2 toques:**
  - **Desde Hoy (Diario):** Tarjeta destacada para consultar o generar el *Plan de Comidas Diario* y botón directo a la *Lista de la Compra*.
  - **Desde Recetas:** Acceso directo a la *Lista de la compra* y a los planes de comidas.
  - **Desde Objetivo (Peso):** Botón para generar un menú mediterráneo ajustado al objetivo físico.
- **Seguridad calórica garantizada:** El generador de planes impone un suelo mínimo de **1200 kcal para mujeres** y **1500 kcal para hombres**, previniendo planes nutricionalmente deficientes. Todos los planes y listas existentes se preservan íntegros en el dispositivo.

---

### C) Nuevo Asistente Nutricional con IA (Pestaña «Asistente»)
- **Ubicación:** Tercer icono en el menú de navegación inferior (icono de chispa / *Sparkles*).
- **Interfaz y Experiencia:**
  - Chat limpio y moderno con persistencia en el dispositivo (no se borra al cambiar de pestaña).
  - Indicador de razonamiento (*"Pensando..."*), desplazamiento automático y selector de consultas rápidas (*chips*).
  - Aviso legal médico permanente en cabecera.
- **Conectividad total con la aplicación:**
  - Consulta en tiempo real el perfil biométrico (peso, altura, objetivo, calorías meta).
  - Analiza el diario de comidas de hoy y calcula los macros y calorías restantes.
  - Sugiere recetas del recetario personal del usuario.
  - **Memoria persistente:** Registra gustos, intolerancias y preferencias dietéticas. Incluye un visor modal donde el usuario puede consultar y borrar recuerdos cuando lo desee.
- **Tarjetas de Acción Directa:**
  - **Añadir a mi diario:** Si el asistente sugiere una comida (ej. cena), genera una tarjeta interactiva con botón para registrar el alimento, gramos y macros en un solo toque sin salir del chat.
  - **Guardar en mis recetas:** Si recomienda una receta, muestra una tarjeta con botón para guardarla directamente en el recetario.
- **Protocolos de Seguridad y Salud:**
  - No fomenta dietas extremas por debajo del umbral seguro.
  - Detección activa de conductas o mensajes asociados a Trastornos de la Conducta Alimentaria (TCA): responde con empatía, no ofrece consejos restrictivos y facilita recursos de ayuda (ACAB y Teléfono de la Esperanza: 717 003 717).
  - Recordatorio de consulta a médicos o dietistas-nutricionistas colegiados ante dudas patológicas (diabetes, embarazo, afecciones renales).

---

## 2. URLs de Producción y Repositorio

| Recurso | Enlace / URL | Estado |
| :--- | :--- | :--- |
| **Repositorio GitHub Fuente** | `https://github.com/omolas23-hub/nutrifit` | **Actualizado (Código fuente completo)** |
| **Servicio Web en Nube (Render)** | `https://nutrifit-app.onrender.com` | **Listo para autodespliegue continuo** |
| **PWA Web App (Netlify)** | `https://admirable-lamington-5194ca.netlify.app` | **Online 24/7** *(Clave temporal preview: `My-Drop-Site`)* |

---

## 3. Guía de Instalación como PWA (Móvil y PC)

NutriFit está configurada como una Aplicación Web Progresiva completa con manifiesto, iconos de alta resolución, Service Worker y soporte offline:

1. **Android (Chrome / Navegador predeterminado):**
   - Entra en la URL pública desde el navegador móvil.
   - Toca el menú de opciones (`⋮`) y pulsa **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**.
   - Se creará el acceso directo con icono nativo y abrirá a pantalla completa.
2. **iPhone / iPad (Safari):**
   - Abre la URL en Safari.
   - Pulsa el botón de **Compartir** (icono con flecha hacia arriba).
   - Selecciona **"Añadir a la pantalla de inicio"**.
3. **PC / Mac (Chrome / Edge / Brave):**
   - Abre la aplicación en tu navegador.
   - Haz clic en el icono de instalación (pantalla con flecha hacia abajo) en la barra de direcciones superior y confirma **"Instalar"**.

---

## 4. Gestión Operativa: Logs, API Keys y 24/7 Always-On

- **Visualizar Logs del Servidor:**
  - Accede a [dashboard.render.com](https://dashboard.render.com).
  - Selecciona tu servicio `nutrifit` y accede a la pestaña **Logs** para supervisar peticiones y búsquedas en tiempo real.
- **Configurar o Modificar la API Key de Gemini:**
  - En Render, dirígete a **Environment**.
  - Comprueba que la variable `GEMINI_API_KEY` contiene tu clave válida de Google AI Studio y pulsa **Save Changes**. El servicio se reiniciará automáticamente con la nueva configuración.
- **Garantizar Funcionamiento 24/7 Sin Suspensión:**
  - El plan gratuito de Render suspende los contenedores tras 15 minutos sin tráfico.
  - Para mantenerlo activo de manera ininterrumpida las 24 horas del día, da de alta un monitor de comprobación gratuito en [cron-job.org](https://cron-job.org) o [UptimeRobot](https://uptimerobot.com):
    - **URL:** `https://nutrifit-app.onrender.com/api/health`
    - **Frecuencia:** Cada 10 minutos.
    - **Método:** `GET`.
- **Coste Real del Despliegue:**
  - **0,00 € / mes.** Operación 100% gratuita aprovechando los niveles free de Render/Netlify, GitHub y Google Gemini Flash.
