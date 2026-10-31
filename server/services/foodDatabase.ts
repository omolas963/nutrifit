import { FoodNutrients100g } from './openFoodFactsService';

export interface BrandedFoodItem extends FoodNutrients100g {
  id: string;
  category: string;
  popularSearchTerms?: string[];
}

export const SPANISH_FOOD_DATABASE: BrandedFoodItem[] = [
  // ==========================================
  // PANES, BOLLERÍA Y TOSTADAS
  // ==========================================
  // 1. Versión Estándar / Normal (Siempre arriba en búsquedas generales)
  {
    id: 'pan_blanco_estandar',
    name: 'Pan blanco común (Estándar / Normal)',
    brand: 'Estándar / Panadería',
    category: 'Panes',
    caloriesPer100g: 265,
    proteinPer100g: 8.5,
    carbsPer100g: 53.0,
    fatPer100g: 1.5,
    portionName: '1 trozo / rebanada',
    portionGrams: 40,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['pan', 'pan normal', 'pan blanco', 'pan común', 'pan estandar', 'barra de pan']
  },
  {
    id: 'pan_integral_estandar',
    name: 'Pan integral de trigo (Estándar / Normal)',
    brand: 'Estándar / Panadería',
    category: 'Panes',
    caloriesPer100g: 245,
    proteinPer100g: 9.0,
    carbsPer100g: 45.0,
    fatPer100g: 2.0,
    portionName: '1 rebanada / trozo',
    portionGrams: 40,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['pan integral', 'pan normal', 'pan integral estandar']
  },
  // Pan Bimbo específico (Búsqueda exacta: "pan bimbo")
  {
    id: 'pan_bimbo_clasico',
    name: 'Pan Bimbo (Pan de molde blanco clásico)',
    brand: 'Bimbo',
    category: 'Panes',
    caloriesPer100g: 250,
    proteinPer100g: 8.2,
    carbsPer100g: 47.0,
    fatPer100g: 3.0,
    portionName: '1 rebanada',
    portionGrams: 28,
    source: 'Base de datos oficial',
    popularSearchTerms: ['pan bimbo', 'bimbo', 'pan de molde bimbo', 'pan bimbo clasico', 'sandwich']
  },
  {
    id: 'pan_bimbo_artesano',
    name: 'Pan Bimbo Artesano rebanada gruesa',
    brand: 'Bimbo',
    category: 'Panes',
    caloriesPer100g: 258,
    proteinPer100g: 8.8,
    carbsPer100g: 48.0,
    fatPer100g: 3.2,
    portionName: '1 rebanada gruesa',
    portionGrams: 38,
    source: 'Base de datos oficial',
    popularSearchTerms: ['pan bimbo', 'bimbo', 'artesano', 'pan artesano bimbo']
  },
  {
    id: 'pan_bimbo_silueta_integral',
    name: 'Pan Bimbo Silueta 100% Integral sin corteza',
    brand: 'Bimbo',
    category: 'Panes',
    caloriesPer100g: 215,
    proteinPer100g: 9.8,
    carbsPer100g: 36.5,
    fatPer100g: 2.1,
    portionName: '1 rebanada',
    portionGrams: 25,
    source: 'Base de datos oficial',
    popularSearchTerms: ['pan bimbo', 'bimbo', 'silueta', 'pan silueta bimbo', 'integral']
  },
  {
    id: 'pan_bimbo_thins',
    name: 'Pan Bimbo Thins 100% Integral 8 Cereales',
    brand: 'Bimbo',
    category: 'Panes',
    caloriesPer100g: 248,
    proteinPer100g: 11.2,
    carbsPer100g: 41.5,
    fatPer100g: 2.5,
    portionName: '1 panecillo (2 caras)',
    portionGrams: 39,
    source: 'Base de datos oficial',
    popularSearchTerms: ['pan bimbo', 'bimbo', 'thins', 'pan thins bimbo']
  },
  {
    id: 'pan_hamburguesa_maxi_bimbo',
    name: 'Pan de hamburguesa Maxi Burger con sésamo',
    brand: 'Bimbo',
    category: 'Panes',
    caloriesPer100g: 288,
    proteinPer100g: 8.5,
    carbsPer100g: 51.0,
    fatPer100g: 5.0,
    portionName: '1 bollo',
    portionGrams: 75,
    source: 'Base de datos oficial',
    popularSearchTerms: ['pan bimbo', 'bimbo', 'pan hamburguesa bimbo', 'burger']
  },
  // Panes de Mercadona / Hacendado
  {
    id: 'pan_hacendado_integral_molde',
    name: 'Pan de molde 100% integral',
    brand: 'Hacendado (Mercadona)',
    category: 'Panes',
    caloriesPer100g: 228,
    proteinPer100g: 9.2,
    carbsPer100g: 40.5,
    fatPer100g: 2.4,
    portionName: '1 rebanada',
    portionGrams: 28,
    source: 'Base de datos oficial',
    popularSearchTerms: ['pan mercadona', 'pan hacendado', 'pan de molde mercadona', 'molde integral']
  },
  {
    id: 'pan_hacendado_blanco_sincorteza',
    name: 'Pan de molde blanco sin corteza',
    brand: 'Hacendado (Mercadona)',
    category: 'Panes',
    caloriesPer100g: 242,
    proteinPer100g: 8.3,
    carbsPer100g: 46.0,
    fatPer100g: 2.2,
    portionName: '1 rebanada',
    portionGrams: 26,
    source: 'Base de datos oficial',
    popularSearchTerms: ['pan mercadona', 'pan hacendado', 'sin corteza', 'pan blanco mercadona']
  },
  {
    id: 'pan_barra_rustica_hacendado',
    name: 'Barra de pan rústica de panadería',
    brand: 'Hacendado (Mercadona)',
    category: 'Panes',
    caloriesPer100g: 252,
    proteinPer100g: 8.5,
    carbsPer100g: 51.0,
    fatPer100g: 1.1,
    portionName: '1 trozo / ración',
    portionGrams: 60,
    source: 'Base de datos oficial',
    popularSearchTerms: ['barra de pan', 'pan mercadona', 'pan rustico', 'baguette']
  },
  {
    id: 'pan_tostado_integral_ortiz',
    name: 'Pan tostado 100% integral',
    brand: 'Ortiz',
    category: 'Panes',
    caloriesPer100g: 382,
    proteinPer100g: 13.0,
    carbsPer100g: 64.0,
    fatPer100g: 5.5,
    portionName: '1 tostada',
    portionGrams: 10,
    source: 'Base de datos oficial',
    popularSearchTerms: ['pan tostado', 'tostada ortiz', 'ortiz']
  },
  {
    id: 'pan_tostado_clasico_ortiz',
    name: 'Pan tostado clásico crujiente',
    brand: 'Ortiz',
    category: 'Panes',
    caloriesPer100g: 395,
    proteinPer100g: 12.0,
    carbsPer100g: 70.0,
    fatPer100g: 6.2,
    portionName: '1 tostada',
    portionGrams: 10,
    source: 'Base de datos oficial',
    popularSearchTerms: ['pan tostado', 'ortiz', 'tostada']
  },

  // ==========================================
  // BOLLOS Y DULCES (BOLLOS DEL MERCADONA Y ESTÁNDAR)
  // ==========================================
  // Versión estándar
  {
    id: 'bollos_leche_estandar',
    name: 'Bollos de leche tiernos (Estándar / Normal)',
    brand: 'Estándar / Panadería',
    category: 'Bollería',
    caloriesPer100g: 340,
    proteinPer100g: 8.0,
    carbsPer100g: 53.0,
    fatPer100g: 10.0,
    portionName: '1 bollo',
    portionGrams: 35,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['bollo', 'bollos', 'bollos de leche', 'bollo normal', 'bollos estandar', 'brioche']
  },
  // Bollos específicos de Mercadona (Búsqueda exacta: "bollos del mercadona")
  {
    id: 'bollos_leche_hacendado',
    name: 'Bollos de leche Hacendado (Bollos del Mercadona)',
    brand: 'Hacendado (Mercadona)',
    category: 'Bollería',
    caloriesPer100g: 345,
    proteinPer100g: 8.5,
    carbsPer100g: 54.0,
    fatPer100g: 10.5,
    portionName: '1 bollo (unidad)',
    portionGrams: 35,
    source: 'Base de datos oficial',
    popularSearchTerms: [
      'bollos del mercadona',
      'bollos mercadona',
      'bollos de leche mercadona',
      'bollo mercadona',
      'bollos hacendado',
      'bollos de leche'
    ]
  },
  {
    id: 'bollos_suizos_hacendado',
    name: 'Bollos suizos con azúcar Hacendado (Bollos del Mercadona)',
    brand: 'Hacendado (Mercadona)',
    category: 'Bollería',
    caloriesPer100g: 360,
    proteinPer100g: 8.0,
    carbsPer100g: 58.0,
    fatPer100g: 11.0,
    portionName: '1 bollo suizo',
    portionGrams: 55,
    source: 'Base de datos oficial',
    popularSearchTerms: [
      'bollos del mercadona',
      'bollos mercadona',
      'bollos suizos mercadona',
      'suizo mercadona',
      'bollo suizo'
    ]
  },
  {
    id: 'bollos_brioche_chocolate_hacendado',
    name: 'Bollos brioche con pepitas de chocolate (Bollos del Mercadona)',
    brand: 'Hacendado (Mercadona)',
    category: 'Bollería',
    caloriesPer100g: 385,
    proteinPer100g: 7.5,
    carbsPer100g: 52.0,
    fatPer100g: 16.5,
    portionName: '1 bollo con chocolate',
    portionGrams: 45,
    source: 'Base de datos oficial',
    popularSearchTerms: [
      'bollos del mercadona',
      'bollos mercadona',
      'bollos con chocolate',
      'doowap mercadona',
      'pan de leche chocolate'
    ]
  },
  {
    id: 'croissant_estandar',
    name: 'Croissant clásico de mantequilla (Estándar / Normal)',
    brand: 'Estándar / Panadería',
    category: 'Bollería',
    caloriesPer100g: 406,
    proteinPer100g: 8.2,
    carbsPer100g: 45.8,
    fatPer100g: 21.0,
    portionName: '1 croissant',
    portionGrams: 50,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['croissant', 'cruasan', 'croasant', 'bolleria']
  },
  {
    id: 'magdalenas_estandar',
    name: 'Magdalenas clásicas caseras (Estándar / Normal)',
    brand: 'Estándar / Panadería',
    category: 'Bollería',
    caloriesPer100g: 385,
    proteinPer100g: 6.0,
    carbsPer100g: 52.0,
    fatPer100g: 17.0,
    portionName: '1 magdalena',
    portionGrams: 35,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['magdalena', 'magdalenas', 'muffin']
  },

  // ==========================================
  // LÁCTEOS (MILK & DAIRY)
  // ==========================================
  // Versiones estándar
  {
    id: 'leche_semi_estandar',
    name: 'Leche semidesnatada (Estándar / Normal)',
    brand: 'Estándar / Común',
    category: 'Lácteos',
    caloriesPer100g: 46,
    proteinPer100g: 3.2,
    carbsPer100g: 4.9,
    fatPer100g: 1.6,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['leche', 'leche normal', 'leche semidesnatada', 'vaso de leche', 'leche estandar']
  },
  {
    id: 'leche_entera_estandar',
    name: 'Leche entera de vaca (Estándar / Normal)',
    brand: 'Estándar / Común',
    category: 'Lácteos',
    caloriesPer100g: 63,
    proteinPer100g: 3.1,
    carbsPer100g: 4.8,
    fatPer100g: 3.6,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['leche entera', 'leche normal', 'vaso de leche']
  },
  {
    id: 'leche_desnatada_estandar',
    name: 'Leche desnatada 0% (Estándar / Normal)',
    brand: 'Estándar / Común',
    category: 'Lácteos',
    caloriesPer100g: 34,
    proteinPer100g: 3.2,
    carbsPer100g: 4.9,
    fatPer100g: 0.2,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['leche desnatada', 'leche 0%']
  },
  // Lácteos con marca
  {
    id: 'leche_semi_hacendado',
    name: 'Leche semidesnatada UHT Hacendado',
    brand: 'Hacendado (Mercadona)',
    category: 'Lácteos',
    caloriesPer100g: 46,
    proteinPer100g: 3.2,
    carbsPer100g: 4.9,
    fatPer100g: 1.6,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Base de datos oficial',
    popularSearchTerms: ['leche mercadona', 'leche hacendado', 'leche semidesnatada mercadona']
  },
  {
    id: 'leche_entera_hacendado',
    name: 'Leche entera UHT Hacendado',
    brand: 'Hacendado (Mercadona)',
    category: 'Lácteos',
    caloriesPer100g: 63,
    proteinPer100g: 3.1,
    carbsPer100g: 4.8,
    fatPer100g: 3.6,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Base de datos oficial',
    popularSearchTerms: ['leche mercadona', 'leche hacendado', 'leche entera mercadona']
  },
  {
    id: 'leche_entera_asturiana',
    name: 'Leche entera clásica Central Lechera Asturiana',
    brand: 'Central Lechera Asturiana',
    category: 'Lácteos',
    caloriesPer100g: 64,
    proteinPer100g: 3.2,
    carbsPer100g: 4.7,
    fatPer100g: 3.6,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Base de datos oficial',
    popularSearchTerms: ['leche asturiana', 'central lechera asturiana', 'leche entera']
  },
  {
    id: 'leche_suprema_asturiana',
    name: 'Leche Suprema rica en proteínas y calcio',
    brand: 'Central Lechera Asturiana',
    category: 'Lácteos',
    caloriesPer100g: 57,
    proteinPer100g: 6.2,
    carbsPer100g: 4.8,
    fatPer100g: 1.4,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Base de datos oficial',
    popularSearchTerms: ['leche suprema', 'leche proteinas', 'asturiana']
  },
  {
    id: 'leche_desnatada_pascual',
    name: 'Leche desnatada Pascual',
    brand: 'Pascual',
    category: 'Lácteos',
    caloriesPer100g: 35,
    proteinPer100g: 3.3,
    carbsPer100g: 4.8,
    fatPer100g: 0.3,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Base de datos oficial',
    popularSearchTerms: ['leche pascual', 'pascual desnatada']
  },

  // ==========================================
  // YOGURES Y POSTRES LÁCTEOS
  // ==========================================
  {
    id: 'yogur_natural_estandar',
    name: 'Yogur natural sin azúcar (Estándar / Normal)',
    brand: 'Estándar / Lácteo',
    category: 'Lácteos',
    caloriesPer100g: 61,
    proteinPer100g: 3.5,
    carbsPer100g: 4.5,
    fatPer100g: 3.3,
    portionName: '1 yogur',
    portionGrams: 125,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['yogur', 'yogur normal', 'yogur natural', 'yogur estandar']
  },
  {
    id: 'yogur_natural_danone',
    name: 'Yogur natural Danone clásico',
    brand: 'Danone',
    category: 'Lácteos',
    caloriesPer100g: 61,
    proteinPer100g: 3.4,
    carbsPer100g: 4.2,
    fatPer100g: 3.3,
    portionName: '1 yogur',
    portionGrams: 125,
    source: 'Base de datos oficial',
    popularSearchTerms: ['yogur danone', 'danone natural']
  },
  {
    id: 'yogur_griego_hacendado',
    name: 'Yogur griego natural Hacendado',
    brand: 'Hacendado (Mercadona)',
    category: 'Lácteos',
    caloriesPer100g: 125,
    proteinPer100g: 3.8,
    carbsPer100g: 3.9,
    fatPer100g: 10.5,
    portionName: '1 yogur',
    portionGrams: 125,
    source: 'Base de datos oficial',
    popularSearchTerms: ['yogur griego', 'griego mercadona', 'griego hacendado']
  },
  {
    id: 'queso_fresco_batido_hacendado',
    name: 'Queso fresco batido 0% desnatado',
    brand: 'Hacendado (Mercadona)',
    category: 'Lácteos',
    caloriesPer100g: 46,
    proteinPer100g: 8.0,
    carbsPer100g: 3.5,
    fatPer100g: 0.1,
    portionName: '1 tarrina pequeña / ración',
    portionGrams: 125,
    source: 'Base de datos oficial',
    popularSearchTerms: ['queso batido', 'queso fresco batido mercadona', 'queso batido hacendado']
  },
  {
    id: 'yogur_proteinas_fresa_hacendado',
    name: 'Postre lácteo +Proteínas sabor Fresa',
    brand: 'Hacendado (Mercadona)',
    category: 'Lácteos',
    caloriesPer100g: 52,
    proteinPer100g: 10.0,
    carbsPer100g: 2.8,
    fatPer100g: 0.1,
    portionName: '1 tarrina',
    portionGrams: 120,
    source: 'Base de datos oficial',
    popularSearchTerms: ['yogur proteinas mercadona', '+proteinas', 'proteinas fresa']
  },

  // ==========================================
  // HUEVOS Y PROTEÍNAS
  // ==========================================
  {
    id: 'huevo_entero_estandar',
    name: 'Huevo fresco campero clase L (Estándar / Normal)',
    brand: 'Estándar / Fresco',
    category: 'Huevos',
    caloriesPer100g: 143,
    proteinPer100g: 12.6,
    carbsPer100g: 0.7,
    fatPer100g: 9.9,
    portionName: '1 huevo L mediano',
    portionGrams: 63,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['huevo', 'huevos', 'huevo frito', 'huevo cocido', 'huevo normal', 'huevo estandar']
  },
  {
    id: 'claras_huevo_hacendado',
    name: 'Claras de huevo pasteurizadas Hacendado',
    brand: 'Hacendado (Mercadona)',
    category: 'Huevos',
    caloriesPer100g: 49,
    proteinPer100g: 11.1,
    carbsPer100g: 0.7,
    fatPer100g: 0.1,
    portionName: '1 clara equivalente',
    portionGrams: 35,
    source: 'Base de datos oficial',
    popularSearchTerms: ['claras mercadona', 'claras hacendado', 'bote claras', 'claras de huevo']
  },
  {
    id: 'pechuga_pollo_estandar',
    name: 'Pechuga de pollo fresca a la plancha (Estándar / Normal)',
    brand: 'Estándar / Fresco',
    category: 'Carnes',
    caloriesPer100g: 110,
    proteinPer100g: 23.1,
    carbsPer100g: 0.0,
    fatPer100g: 1.2,
    portionName: '1 filete mediano',
    portionGrams: 125,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['pollo', 'pechuga', 'pechuga de pollo', 'pollo normal', 'pollo estandar']
  },
  {
    id: 'pechuga_pollo_asada_hacendado',
    name: 'Tiras de pechuga de pollo al natural Hacendado',
    brand: 'Hacendado (Mercadona)',
    category: 'Carnes',
    caloriesPer100g: 104,
    proteinPer100g: 22.5,
    carbsPer100g: 1.2,
    fatPer100g: 1.1,
    portionName: '1 ración',
    portionGrams: 70,
    source: 'Base de datos oficial',
    popularSearchTerms: ['pollo mercadona', 'tiras pollo hacendado', 'pollo asado mercadona']
  },
  {
    id: 'pavo_braseado_elpozo',
    name: 'Pechuga de pavo braseada 90% El Pozo',
    brand: 'El Pozo',
    category: 'Embutidos',
    caloriesPer100g: 88,
    proteinPer100g: 18.2,
    carbsPer100g: 1.5,
    fatPer100g: 1.0,
    portionName: '2 lonchas',
    portionGrams: 40,
    source: 'Base de datos oficial',
    popularSearchTerms: ['pavo el pozo', 'pavo braseado', 'embutido pavo']
  },

  // ==========================================
  // ARROZ, PASTAS Y CEREALES
  // ==========================================
  {
    id: 'arroz_blanco_estandar',
    name: 'Arroz blanco hervido (Estándar / Normal)',
    brand: 'Estándar / Común',
    category: 'Cereales',
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28.2,
    fatPer100g: 0.3,
    portionName: '1 ración cocida',
    portionGrams: 150,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['arroz', 'arroz blanco', 'arroz normal', 'arroz estandar', 'arroz cocido']
  },
  {
    id: 'arroz_redondo_hacendado',
    name: 'Arroz redondo extra Hacendado',
    brand: 'Hacendado (Mercadona)',
    category: 'Cereales',
    caloriesPer100g: 345,
    proteinPer100g: 7.0,
    carbsPer100g: 77.0,
    fatPer100g: 0.8,
    portionName: '1 ración en crudo',
    portionGrams: 70,
    source: 'Base de datos oficial',
    popularSearchTerms: ['arroz mercadona', 'arroz hacendado', 'arroz redondo mercadona']
  },
  {
    id: 'arroz_basmati_sos',
    name: 'Arroz Basmati aromático SOS',
    brand: 'SOS',
    category: 'Cereales',
    caloriesPer100g: 350,
    proteinPer100g: 8.5,
    carbsPer100g: 77.0,
    fatPer100g: 0.9,
    portionName: '1 ración en crudo',
    portionGrams: 70,
    source: 'Base de datos oficial',
    popularSearchTerms: ['arroz basmati', 'arroz sos', 'sos']
  },
  {
    id: 'arroz_brillante_vasito',
    name: 'Arroz blanco redondo vasito microondas 1 min',
    brand: 'Brillante',
    category: 'Cereales',
    caloriesPer100g: 152,
    proteinPer100g: 3.2,
    carbsPer100g: 31.5,
    fatPer100g: 1.4,
    portionName: '1 vasito individual',
    portionGrams: 125,
    source: 'Base de datos oficial',
    popularSearchTerms: ['arroz vasito', 'arroz brillante', 'brillante']
  },

  // ==========================================
  // PATATAS Y TUBÉRCULOS (Comida real de plato, no de bolsa)
  // ==========================================
  {
    id: 'patata_cocida_estandar',
    name: 'Patata cocida / asada (Estándar / Normal)',
    brand: 'Estándar / Tubérculo',
    category: 'Tubérculos',
    caloriesPer100g: 77,
    proteinPer100g: 2.0,
    carbsPer100g: 17.0,
    fatPer100g: 0.1,
    portionName: '1 patata mediana cocida',
    portionGrams: 150,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['patata', 'patata cocida', 'patata asada', 'patatas', 'papas', 'patata hervida', 'patata al vapor']
  },
  {
    id: 'patatas_fritas_caseras',
    name: 'Patatas fritas caseras / de sartén',
    brand: 'Casero / Hostelería',
    category: 'Tubérculos',
    caloriesPer100g: 280,
    proteinPer100g: 3.5,
    carbsPer100g: 36.0,
    fatPer100g: 14.0,
    portionName: '1 ración de patatas fritas',
    portionGrams: 150,
    source: 'Base de datos oficial',
    popularSearchTerms: ['patatas fritas', 'patatas fritas caseras', 'patata frita', 'papas fritas', 'patatas']
  },
  {
    id: 'patatas_bravas_tapa',
    name: 'Patatas bravas con salsa',
    brand: 'Tapa tradicional',
    category: 'Tubérculos',
    caloriesPer100g: 210,
    proteinPer100g: 3.0,
    carbsPer100g: 26.0,
    fatPer100g: 10.5,
    portionName: '1 ración de bravas',
    portionGrams: 180,
    source: 'Base de datos oficial',
    popularSearchTerms: ['patatas bravas', 'bravas', 'patata brava', 'papas bravas']
  },
  {
    id: 'pasta_estandar',
    name: 'Pasta / Espaguetis hervidos (Estándar / Normal)',
    brand: 'Estándar / Común',
    category: 'Cereales',
    caloriesPer100g: 140,
    proteinPer100g: 5.0,
    carbsPer100g: 27.5,
    fatPer100g: 0.8,
    portionName: '1 plato cocido',
    portionGrams: 180,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['pasta', 'macarrones', 'espaguetis', 'pasta normal', 'pasta estandar']
  },
  {
    id: 'pasta_espaguetis_gallo',
    name: 'Espaguetis clásicos trigo duro Gallo',
    brand: 'Gallo',
    category: 'Cereales',
    caloriesPer100g: 350,
    proteinPer100g: 12.0,
    carbsPer100g: 71.0,
    fatPer100g: 1.5,
    portionName: '1 ración en crudo',
    portionGrams: 80,
    source: 'Base de datos oficial',
    popularSearchTerms: ['espaguetis gallo', 'pasta gallo', 'gallo']
  },
  {
    id: 'avena_estandar',
    name: 'Copos de avena suaves (Estándar / Normal)',
    brand: 'Estándar / Cereal',
    category: 'Cereales',
    caloriesPer100g: 370,
    proteinPer100g: 13.0,
    carbsPer100g: 59.0,
    fatPer100g: 6.9,
    portionName: '1 ración / tazón',
    portionGrams: 40,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['avena', 'avena normal', 'copos de avena', 'porridge']
  },
  {
    id: 'avena_copos_hacendado',
    name: 'Copos de avena integral finos Hacendado',
    brand: 'Hacendado (Mercadona)',
    category: 'Cereales',
    caloriesPer100g: 375,
    proteinPer100g: 13.5,
    carbsPer100g: 58.0,
    fatPer100g: 7.0,
    portionName: '1 ración',
    portionGrams: 40,
    source: 'Base de datos oficial',
    popularSearchTerms: ['avena mercadona', 'avena hacendado', 'copos avena mercadona']
  },

  // ==========================================
  // PESCADOS Y ATÚN
  // ==========================================
  {
    id: 'atun_natural_estandar',
    name: 'Atún claro al natural escurrido (Estándar / Normal)',
    brand: 'Estándar / Pescado',
    category: 'Pescados',
    caloriesPer100g: 101,
    proteinPer100g: 23.5,
    carbsPer100g: 0.0,
    fatPer100g: 0.8,
    portionName: '1 lata escurrida',
    portionGrams: 60,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['atun', 'atun natural', 'atun normal', 'lata de atun']
  },
  {
    id: 'atun_natural_hacendado',
    name: 'Atún claro al natural en lata Hacendado',
    brand: 'Hacendado (Mercadona)',
    category: 'Pescados',
    caloriesPer100g: 101,
    proteinPer100g: 23.5,
    carbsPer100g: 0.0,
    fatPer100g: 0.8,
    portionName: '1 lata escurrida',
    portionGrams: 60,
    source: 'Base de datos oficial',
    popularSearchTerms: ['atun mercadona', 'atun hacendado', 'atun al natural mercadona']
  },
  {
    id: 'salmon_fresco_noruego',
    name: 'Salmón fresco en lomos a la plancha',
    brand: 'Pescadería / Fresco',
    category: 'Pescados',
    caloriesPer100g: 208,
    proteinPer100g: 20.0,
    carbsPer100g: 0.0,
    fatPer100g: 13.5,
    portionName: '1 lomo mediano',
    portionGrams: 150,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['salmon', 'salmon normal', 'salmon fresco', 'pescado']
  },

  // ==========================================
  // FRUTAS Y ACEITES
  // ==========================================
  {
    id: 'platano_estandar',
    name: 'Plátano fresco (Estándar / Normal)',
    brand: 'Frutería / Fresco',
    category: 'Frutas',
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 21.0,
    fatPer100g: 0.3,
    portionName: '1 plátano mediano',
    portionGrams: 100,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['platano', 'banana', 'platano normal']
  },
  {
    id: 'platano_canarias',
    name: 'Plátano de Canarias IGP',
    brand: 'Plátano de Canarias',
    category: 'Frutas',
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 21.0,
    fatPer100g: 0.3,
    portionName: '1 plátano',
    portionGrams: 100,
    source: 'Base de datos oficial',
    popularSearchTerms: ['platano canarias', 'canarias']
  },
  {
    id: 'manzana_estandar',
    name: 'Manzana fresca con piel (Estándar / Normal)',
    brand: 'Frutería / Fresco',
    category: 'Frutas',
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 12.0,
    fatPer100g: 0.2,
    portionName: '1 manzana mediana',
    portionGrams: 160,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['manzana', 'manzana normal']
  },
  {
    id: 'aove_estandar',
    name: 'Aceite de oliva virgen extra AOVE (Estándar / Normal)',
    brand: 'Estándar / Aceite',
    category: 'Aceites',
    caloriesPer100g: 884,
    proteinPer100g: 0.0,
    carbsPer100g: 0.0,
    fatPer100g: 100.0,
    portionName: '1 cucharada sopera',
    portionGrams: 10,
    source: 'Base de datos oficial',
    isStandard: true,
    popularSearchTerms: ['aceite', 'aove', 'aceite de oliva', 'aceite normal', 'cucharada de aceite']
  },
  {
    id: 'aove_hacendado',
    name: 'Aceite de oliva virgen extra Gran Selección',
    brand: 'Hacendado (Mercadona)',
    category: 'Aceites',
    caloriesPer100g: 884,
    proteinPer100g: 0.0,
    carbsPer100g: 0.0,
    fatPer100g: 100.0,
    portionName: '1 cucharada',
    portionGrams: 10,
    source: 'Base de datos oficial',
    popularSearchTerms: ['aceite mercadona', 'aceite hacendado', 'aove mercadona']
  }
];

// Helper to remove accents and special characters
function normalizeStr(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function searchLocalFoodDatabase(rawQuery: string): FoodNutrients100g[] {
  const query = rawQuery.trim();
  if (!query) return [];

  const normQuery = normalizeStr(query);

  // Stop words to strip out for matching (like "de", "del", "el", "la", "unos")
  const stopWords = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'al', 'en', 'para', 'y']);

  const rawTokens = normQuery.split(/\s+/).filter(Boolean);
  const meaningfulTokens = rawTokens.filter(t => !stopWords.has(t));
  const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

  // Detect if user has a specific brand or supermarket intent in the search
  const brandKeywords = [
    'bimbo', 'mercadona', 'hacendado', 'carrefour', 'lidl', 'milbona',
    'danone', 'ortiz', 'gallo', 'pascual', 'asturiana', 'el pozo', 'campofrio',
    'calvo', 'sos', 'quaker'
  ];
  const hasBrandIntent = brandKeywords.some(b => normQuery.includes(b));

  // Score matching items
  const scored = SPANISH_FOOD_DATABASE.map(item => {
    let score = 0;
    const nameNorm = normalizeStr(item.name);
    const brandNorm = normalizeStr(item.brand || '');
    const catNorm = normalizeStr(item.category || '');
    const searchTerms = (item.popularSearchTerms || []).map(normalizeStr);

    // 1. Exact query match on name or popular term
    if (nameNorm === normQuery) score += 600;
    if (searchTerms.includes(normQuery)) score += 550;

    // 2. Exact match for popular colloquial queries (e.g. "pan bimbo", "bollos del mercadona")
    for (const term of searchTerms) {
      if (term === normQuery) {
        score += 500;
      } else if (normQuery.includes(term) || term.includes(normQuery)) {
        score += 300;
      }
    }

    // 3. Name contains full normalized query
    if (nameNorm.includes(normQuery)) {
      score += 350;
    }

    // 4. Token matches
    let matchedTokenCount = 0;
    for (const token of tokens) {
      let tokenMatched = false;
      if (nameNorm.includes(token)) {
        score += 80;
        tokenMatched = true;
      }
      if (brandNorm.includes(token)) {
        score += 70;
        tokenMatched = true;
      }
      if (searchTerms.some(t => t.includes(token))) {
        score += 65;
        tokenMatched = true;
      }
      if (catNorm.includes(token)) {
        score += 30;
        tokenMatched = true;
      }
      if (tokenMatched) matchedTokenCount++;
    }

    // All tokens match boost
    if (tokens.length > 1 && matchedTokenCount === tokens.length) {
      score += 250;
    }

    // Colloquial alias: "mercadona" matches "hacendado"
    if (normQuery.includes('mercadona') && (brandNorm.includes('hacendado') || nameNorm.includes('hacendado') || searchTerms.some(t => t.includes('mercadona')))) {
      score += 300;
    }

    // Colloquial alias: "bimbo" matches Bimbo products
    if (normQuery.includes('bimbo') && (brandNorm.includes('bimbo') || nameNorm.includes('bimbo'))) {
      score += 300;
    }

    // Standard version logic:
    // Only boost standard items if they actually relate to the user's search!
    if (item.isStandard && (matchedTokenCount > 0 || score > 0)) {
      if (!hasBrandIntent) {
        score += 450; // Guaranteed Top #1 for generic queries of that food
      } else {
        score += 20;  // Lower priority if user specifically typed a brand
      }
    }

    // Prefix match boost
    if (nameNorm.startsWith(normQuery)) score += 60;

    return { item, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map(s => ({
      name: s.item.name,
      brand: s.item.brand,
      caloriesPer100g: s.item.caloriesPer100g,
      proteinPer100g: s.item.proteinPer100g,
      carbsPer100g: s.item.carbsPer100g,
      fatPer100g: s.item.fatPer100g,
      source: s.item.source,
      barcode: s.item.barcode,
      portionName: s.item.portionName,
      portionGrams: s.item.portionGrams,
      isStandard: s.item.isStandard,
    }));
}
