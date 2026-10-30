# NutriFit — Aplicación Profesional de Control de Calorías y Macros

Aplicación web completa, responsive, mobile-first e instalable como PWA para el cálculo y control inteligente de calorías y macronutrientes (proteínas, carbohidratos y grasas), diseñada con la estética y fluidez de Fitia.

---

## Características Principales

1. **Onboarding de 4 pasos**:
   - Selección de objetivo: bajar de peso (-500 kcal), mantener o subir/ganancia muscular (+300 kcal).
   - Datos biométricos: sexo, edad, altura, peso actual y peso objetivo.
   - Nivel de actividad física (multiplicadores de 1.2 a 1.9).
   - Cálculo clínico con la ecuación **Mifflin-St Jeor**, ratios de proteína (1.8 a 2.0 g/kg), grasas (~27%) y carbohidratos restantes. Mínimos biológicos de seguridad (1.500 kcal en hombres, 1.200 kcal en mujeres) y aviso médico sanitario.
2. **Pantalla Principal (Hoy)**:
   - Anillo animado SVG con calorías restantes, consumidas y meta.
   - Barras de progreso de macronutrientes: Proteína (Coral), Carbohidratos (Ámbar) y Grasas (Verde salvia).
   - Registro interactivo de hidratación diaria (+250 ml, +500 ml).
   - Diario de comidas (Desayuno, Comida, Merienda, Cena, Snacks) con edición de porción en gramos y eliminación.
   - Navegación ágil entre días (selector de calendario, día anterior y posterior).
3. **Añadir Comida en 4 Modalidades**:
   - **Foto**: captura con cámara o subida de galería. La IA detecta los alimentos del plato y estima los gramos. El backend consulta las APIs de **Open Food Facts** y **USDA FoodData Central** para calcular calorías y macros reales por porción. Si no existe coincidencia, usa la estimación de la IA y se marca como "Estimado". Pantalla de revisión editable antes de guardar.
   - **Escribir**: texto libre ("2 huevos revueltos y tostada integral con aguacate") analizado e itemizado por IA.
   - **Voz**: dictado en directo con la **Web Speech API** en español (`es-ES`) conectado al mismo flujo de análisis nutricional.
   - **Buscar y Código de Barras**: buscador instantáneo de alimentos y escáner de código de barras con consulta en tiempo real a Open Food Facts.
4. **Recetas**:
   - Creación de recetas con ingredientes buscados en base de datos, raciones y cálculo automático de calorías y macros por ración.
   - Marcador de favoritas y botón para añadir directamente al diario.
   - **Generador de Recetas con IA**: crea platos a medida a partir de tus calorías/macros restantes de hoy y de los ingredientes disponibles en tu despensa.
5. **Plan de Comidas y Lista de la Compra**:
   - Plan diario completo de 4 comidas ajustado a tus metas energéticas, con alternativas intercambiables por comida.
   - Botón para volcar todo el menú del día directamente al diario.
   - Lista de la compra interactiva clasificada por categorías (carnicería, frutería, lácteos, despensa) con casillas de verificación.
6. **Ayuda para mi Peso (Objetivo)**:
   - Ritmo semanal recomendado (0,5 kg/sem para bajar, 0,25 kg/sem para subir).
   - Fecha estimada de llegada a tu peso ideal.
   - Consejos prácticos basados en evidencia.
   - Registro de peso con **recálculo automático de objetivos** al registrar un nuevo pesaje.
7. **Progreso**:
   - Contador de racha activa de días consecutivos registrados.
   - Gráfica de evolución de peso con línea de meta (Recharts).
   - Historial de calorías y macronutrientes ingeridos de los últimos 7 y 30 días con línea de referencia.
8. **Ajustes y Privacidad Local**:
   - Edición completa de perfil y objetivos.
   - Unidades métricas (kg/cm) e imperiales (lb/in).
   - Modo Claro y Modo Oscuro.
   - Exportación e importación de copias de seguridad en formato JSON.
   - Datos almacenados en el navegador mediante **IndexedDB** desacoplado mediante Repository Pattern (`IDataRepository`).

---

## Estructura del Proyecto

```
.
├── .env.example                     # Plantilla de variables de entorno
├── .env                             # Configuración local de backend e IA
├── index.html                       # Entrada HTML con fuentes Google (Fraunces & Figtree)
├── package.json                     # Scripts y dependencias
├── tailwind.config.js               # Paleta cálida (solar, cream, bark, macros)
├── tsconfig.json                    # Configuración TypeScript
├── vite.config.ts                   # Configuración Vite con proxy a /api
├── public/
│   ├── favicon.svg                  # Icono de la aplicación
│   ├── manifest.json                # Manifiesto PWA instalable
│   └── sw.js                        # Service worker para caché local
├── server/                          # Backend proxy en Node.js + Express
│   ├── config.ts                    # Carga de variables de entorno
│   ├── index.ts                     # Servidor Express (puerto 5000)
│   ├── routes/
│   │   ├── ai.ts                    # Endpoints de IA (analizar comida, receta, plan)
│   │   └── food.ts                  # Endpoints de búsqueda y código de barras
│   └── services/
│       ├── aiProvider.ts            # Capa intercambiable: Gemini, OpenAI, Claude + Fallback local
│       ├── openFoodFactsService.ts  # Cliente de API Open Food Facts
│       └── usdaService.ts           # Cliente de API USDA FoodData Central
└── src/                             # Frontend React + TypeScript
    ├── main.tsx                     # Montaje React y registro Service Worker
    ├── App.tsx                      # Enrutamiento React Router
    ├── index.css                    # Directivas Tailwind y estilos globales
    ├── types/                       # Interfaces TypeScript de dominio
    ├── lib/
    │   ├── utils.ts                 # Formateo de fechas, números y clases CSS
    │   ├── nutritionCalc.ts         # Fórmula clínica Mifflin-St Jeor y ritmos
    │   └── speechRecognition.ts     # Wrapper para Web Speech API
    ├── services/
    │   ├── api.ts                   # Llamadas HTTP al backend
    │   └── dal/
    │       ├── repositoryInterface.ts # Contrato del Data Access Layer (DAL)
    │       ├── indexedDBRepo.ts       # Implementación nativa IndexedDB
    │       └── seedData.ts            # Datos realistas de demostración inicial
    ├── context/
    │   └── AppContext.tsx           # Contexto React de estado global y racha
    ├── components/
    │   ├── layout/                  # Header, BottomNav y AppShell
    │   ├── common/                  # Modal, BottomSheet, CircularProgress, Toast, MacroBar
    │   ├── today/                   # CalorieRing, DayNavigator, MealSection, FoodItemRow
    │   ├── addFood/                 # PhotoTab, TextTab, VoiceTab, SearchTab, BarcodeScanner
    │   ├── recipes/                 # RecipeCard, CreateRecipeModal, AiRecipeModal
    │   ├── mealPlan/                # MealPlanCard, GroceryListView
    │   ├── weight/                  # WeightSummaryCard, LogWeightModal, GoalTipsCard
    │   ├── progress/                # StreakCard, WeightChart, CalorieMacroChart
    │   ├── settings/                # ProfileEditor, BackupManager
    │   └── onboarding/              # Flujo guiado de 4 pasos para nuevos usuarios
    └── pages/
        ├── TodayPage.tsx            # Pantalla principal (Hoy)
        ├── RecipesPage.tsx          # Pantalla de Recetas
        ├── MealPlanPage.tsx         # Plan de comidas y lista de la compra
        ├── WeightPage.tsx           # Ayuda para mi peso y objetivos
        ├── ProgressPage.tsx         # Gráficas de peso, calorías y racha
        └── SettingsPage.tsx         # Ajustes, tema, unidades y backup
```

---

## Requisitos Previos

- **Node.js**: versión 18 o superior.
- **npm** (incluido con Node.js).

---

## Puesta en Marcha (Paso a Paso)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno (Opcional)

El archivo `.env` ya se encuentra creado con valores por defecto. Si deseas conectar una clave propia de IA:

- **Google Gemini**: Añade tu clave en `GEMINI_API_KEY` (utiliza `gemini-1.5-flash` con visión).
- **OpenAI**: Configura `AI_PROVIDER=openai` y añade tu clave en `OPENAI_API_KEY`.
- **Claude**: Configura `AI_PROVIDER=claude` y añade tu clave en `ANTHROPIC_API_KEY`.

> *Nota*: Si no introduces ninguna clave de API, la aplicación funciona de forma autónoma mediante su motor heurístico local simulado, permitiendo probar la app, el análisis de alimentos, las recetas y el plan de comidas sin coste ni tarjetas de crédito.

### 3. Ejecutar la aplicación en desarrollo

Ejecuta el siguiente comando para iniciar simultáneamente el servidor backend (puerto 5000) y la interfaz frontend (puerto 3000):

```bash
npm run dev
```

Abre tu navegador en:
**[http://localhost:3000](http://localhost:3000)**

---

## Compilación para Producción

```bash
npm run build
```
Generará la build optimizada en el directorio `dist/`.
