import { FoodNutrients100g } from './openFoodFactsService';

export interface BrandedFoodItem extends FoodNutrients100g {
  id: string;
  category: string;
  portionName?: string;
  portionGrams?: number;
  popularSearchTerms?: string[];
}

export const SPANISH_FOOD_DATABASE: BrandedFoodItem[] = [
  // ==========================================
  // PANES, TOSTADAS Y MASAS (BREADS & BAKERY)
  // ==========================================
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
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'molde', 'integral', 'hacendado', 'mercadona', 'rebanada']
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
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'molde', 'blanco', 'sin corteza', 'hacendado', 'mercadona']
  },
  {
    id: 'pan_bimbo_artesano',
    name: 'Pan de molde Artesano',
    brand: 'Bimbo',
    category: 'Panes',
    caloriesPer100g: 258,
    proteinPer100g: 8.8,
    carbsPer100g: 48.0,
    fatPer100g: 3.2,
    portionName: '1 rebanada gruesa',
    portionGrams: 38,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'bimbo', 'artesano', 'molde', 'rebanada']
  },
  {
    id: 'pan_bimbo_silueta_integral',
    name: 'Pan Silueta 100% Integral sin corteza',
    brand: 'Bimbo',
    category: 'Panes',
    caloriesPer100g: 215,
    proteinPer100g: 9.8,
    carbsPer100g: 36.5,
    fatPer100g: 2.1,
    portionName: '1 rebanada',
    portionGrams: 25,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'bimbo', 'silueta', 'integral', 'sin corteza', 'dieta']
  },
  {
    id: 'pan_bimbo_thins_integral',
    name: 'Pan Thins 100% Integral 8 Cereales',
    brand: 'Bimbo',
    category: 'Panes',
    caloriesPer100g: 248,
    proteinPer100g: 11.2,
    carbsPer100g: 41.5,
    fatPer100g: 2.5,
    portionName: '1 panecillo (2 caras)',
    portionGrams: 39,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'thins', 'bimbo', 'integral', 'cereales', 'hamburguesa']
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
    portionName: '1 ración / trozo',
    portionGrams: 60,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'barra', 'rustica', 'baguette', 'hacendado', 'mercadona', 'bocadillo']
  },
  {
    id: 'pan_barra_integral_hacendado',
    name: 'Barra de pan 100% integral',
    brand: 'Hacendado (Mercadona)',
    category: 'Panes',
    caloriesPer100g: 238,
    proteinPer100g: 9.0,
    carbsPer100g: 45.2,
    fatPer100g: 1.6,
    portionName: '1 trozo',
    portionGrams: 60,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'barra', 'integral', 'hacendado', 'mercadona', 'bocadillo']
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
    portionName: '1 rebanada tostada',
    portionGrams: 10,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'tostado', 'ortiz', 'integral', 'tostada', 'desayuno']
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
    portionName: '1 rebanada tostada',
    portionGrams: 10,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'tostado', 'clasico', 'ortiz', 'tostada']
  },
  {
    id: 'pan_centeno_hacendado',
    name: 'Pan de centeno 50% rebanado',
    brand: 'Hacendado (Mercadona)',
    category: 'Panes',
    caloriesPer100g: 218,
    proteinPer100g: 6.8,
    carbsPer100g: 41.0,
    fatPer100g: 1.6,
    portionName: '1 rebanada',
    portionGrams: 42,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'centeno', 'hacendado', 'mercadona', 'aleman']
  },
  {
    id: 'pan_pita_hacendado',
    name: 'Pan de pita blanco',
    brand: 'Hacendado (Mercadona)',
    category: 'Panes',
    caloriesPer100g: 265,
    proteinPer100g: 9.1,
    carbsPer100g: 52.0,
    fatPer100g: 1.5,
    portionName: '1 pan de pita',
    portionGrams: 70,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'pita', 'hacendado', 'mercadona', 'kebab']
  },
  {
    id: 'pan_hamburguesa_brioche_hacendado',
    name: 'Pan de hamburguesa estilo Brioche',
    brand: 'Hacendado (Mercadona)',
    category: 'Panes',
    caloriesPer100g: 312,
    proteinPer100g: 9.0,
    carbsPer100g: 50.0,
    fatPer100g: 7.8,
    portionName: '1 bollo',
    portionGrams: 75,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'hamburguesa', 'brioche', 'hacendado', 'burger']
  },
  {
    id: 'pan_hamburguesa_bimbo_maxi',
    name: 'Pan de hamburguesa Maxi Burger con sésamo',
    brand: 'Bimbo',
    category: 'Panes',
    caloriesPer100g: 288,
    proteinPer100g: 8.5,
    carbsPer100g: 51.0,
    fatPer100g: 5.0,
    portionName: '1 bollo',
    portionGrams: 75,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'hamburguesa', 'bimbo', 'maxi', 'sesamo', 'burger']
  },
  {
    id: 'pan_molde_carrefour_bio',
    name: 'Pan de molde espelta integral Bio',
    brand: 'Carrefour Bio',
    category: 'Panes',
    caloriesPer100g: 235,
    proteinPer100g: 9.5,
    carbsPer100g: 42.0,
    fatPer100g: 2.8,
    portionName: '1 rebanada',
    portionGrams: 30,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'carrefour', 'bio', 'espelta', 'integral', 'molde']
  },
  {
    id: 'pan_cristal_hacendado',
    name: 'Pan de cristal redondo',
    brand: 'Hacendado (Mercadona)',
    category: 'Panes',
    caloriesPer100g: 260,
    proteinPer100g: 8.4,
    carbsPer100g: 53.0,
    fatPer100g: 1.4,
    portionName: '1 unidad',
    portionGrams: 80,
    source: 'Open Food Facts',
    popularSearchTerms: ['pan', 'cristal', 'hacendado', 'mercadona', 'tosta']
  },
  {
    id: 'tortillas_trigo_hacendado',
    name: 'Tortillas de trigo para fajitas / wraps',
    brand: 'Hacendado (Mercadona)',
    category: 'Panes',
    caloriesPer100g: 305,
    proteinPer100g: 8.2,
    carbsPer100g: 53.0,
    fatPer100g: 6.5,
    portionName: '1 tortilla',
    portionGrams: 40,
    source: 'Open Food Facts',
    popularSearchTerms: ['tortilla', 'fajita', 'wrap', 'trigo', 'hacendado', 'mercadona']
  },
  {
    id: 'picos_camperos_hacendado',
    name: 'Picos camperos con aceite de oliva',
    brand: 'Hacendado (Mercadona)',
    category: 'Panes',
    caloriesPer100g: 412,
    proteinPer100g: 10.5,
    carbsPer100g: 72.0,
    fatPer100g: 8.5,
    portionName: '1 bolsita / puñado',
    portionGrams: 30,
    source: 'Open Food Facts',
    popularSearchTerms: ['picos', 'pan', 'camperos', 'colines', 'hacendado', 'mercadona']
  },

  // ==========================================
  // LÁCTEOS, BEBIDAS Y DERIVADOS (DAIRY)
  // ==========================================
  {
    id: 'leche_entera_hacendado',
    name: 'Leche entera UHT',
    brand: 'Hacendado (Mercadona)',
    category: 'Lácteos',
    caloriesPer100g: 63,
    proteinPer100g: 3.1,
    carbsPer100g: 4.8,
    fatPer100g: 3.6,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Open Food Facts',
    popularSearchTerms: ['leche', 'entera', 'hacendado', 'mercadona', 'vaso']
  },
  {
    id: 'leche_semi_hacendado',
    name: 'Leche semidesnatada UHT',
    brand: 'Hacendado (Mercadona)',
    category: 'Lácteos',
    caloriesPer100g: 46,
    proteinPer100g: 3.2,
    carbsPer100g: 4.9,
    fatPer100g: 1.6,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Open Food Facts',
    popularSearchTerms: ['leche', 'semidesnatada', 'semi', 'hacendado', 'mercadona', 'vaso']
  },
  {
    id: 'leche_desnatada_hacendado',
    name: 'Leche desnatada UHT 0%',
    brand: 'Hacendado (Mercadona)',
    category: 'Lácteos',
    caloriesPer100g: 35,
    proteinPer100g: 3.2,
    carbsPer100g: 4.9,
    fatPer100g: 0.2,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Open Food Facts',
    popularSearchTerms: ['leche', 'desnatada', 'cero', '0%', 'hacendado', 'mercadona', 'vaso']
  },
  {
    id: 'leche_entera_asturiana',
    name: 'Leche entera clásica',
    brand: 'Central Lechera Asturiana',
    category: 'Lácteos',
    caloriesPer100g: 64,
    proteinPer100g: 3.2,
    carbsPer100g: 4.7,
    fatPer100g: 3.6,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Open Food Facts',
    popularSearchTerms: ['leche', 'entera', 'asturiana', 'central lechera']
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
    source: 'Open Food Facts',
    popularSearchTerms: ['leche', 'suprema', 'asturiana', 'proteina', 'calcio']
  },
  {
    id: 'leche_desnatada_pascual',
    name: 'Leche desnatada bienestar animal',
    brand: 'Pascual',
    category: 'Lácteos',
    caloriesPer100g: 35,
    proteinPer100g: 3.3,
    carbsPer100g: 4.8,
    fatPer100g: 0.3,
    portionName: '1 vaso',
    portionGrams: 250,
    source: 'Open Food Facts',
    popularSearchTerms: ['leche', 'desnatada', 'pascual']
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
    source: 'Open Food Facts',
    popularSearchTerms: ['queso', 'batido', 'fresco', 'desnatado', 'hacendado', 'mercadona', 'proteina']
  },
  {
    id: 'yogur_natural_danone',
    name: 'Yogur natural clásico',
    brand: 'Danone',
    category: 'Lácteos',
    caloriesPer100g: 61,
    proteinPer100g: 3.4,
    carbsPer100g: 4.2,
    fatPer100g: 3.3,
    portionName: '1 yogur',
    portionGrams: 125,
    source: 'Open Food Facts',
    popularSearchTerms: ['yogur', 'natural', 'danone']
  },
  {
    id: 'yogur_griego_hacendado',
    name: 'Yogur griego natural',
    brand: 'Hacendado (Mercadona)',
    category: 'Lácteos',
    caloriesPer100g: 125,
    proteinPer100g: 3.8,
    carbsPer100g: 3.9,
    fatPer100g: 10.5,
    portionName: '1 yogur',
    portionGrams: 125,
    source: 'Open Food Facts',
    popularSearchTerms: ['yogur', 'griego', 'natural', 'hacendado', 'mercadona']
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
    source: 'Open Food Facts',
    popularSearchTerms: ['yogur', 'proteina', '+proteinas', 'fresa', 'hacendado', 'mercadona']
  },
  {
    id: 'skyr_natural_milbona',
    name: 'Skyr natural estilo islandés',
    brand: 'Milbona (Lidl)',
    category: 'Lácteos',
    caloriesPer100g: 62,
    proteinPer100g: 11.0,
    carbsPer100g: 4.0,
    fatPer100g: 0.2,
    portionName: '1 vaso',
    portionGrams: 150,
    source: 'Open Food Facts',
    popularSearchTerms: ['skyr', 'milbona', 'lidl', 'proteina', 'yogur']
  },
  {
    id: 'queso_cottage_hacendado',
    name: 'Queso Cottage bajo en grasa',
    brand: 'Hacendado (Mercadona)',
    category: 'Lácteos',
    caloriesPer100g: 98,
    proteinPer100g: 12.0,
    carbsPer100g: 2.8,
    fatPer100g: 4.2,
    portionName: '1 ración',
    portionGrams: 100,
    source: 'Open Food Facts',
    popularSearchTerms: ['queso', 'cottage', 'hacendado', 'mercadona', 'granulado']
  },
  {
    id: 'queso_mozzarella_hacendado',
    name: 'Queso Mozzarella rallado especial pizza',
    brand: 'Hacendado (Mercadona)',
    category: 'Lácteos',
    caloriesPer100g: 285,
    proteinPer100g: 24.0,
    carbsPer100g: 2.5,
    fatPer100g: 20.0,
    portionName: '1 puñado',
    portionGrams: 30,
    source: 'Open Food Facts',
    popularSearchTerms: ['queso', 'mozzarella', 'rallado', 'hacendado', 'pizza']
  },

  // ==========================================
  // HUEVOS Y PROTEÍNAS (EGGS & MEATS)
  // ==========================================
  {
    id: 'huevo_entero_fresco',
    name: 'Huevo fresco campero tamaño L',
    brand: 'Origen España',
    category: 'Huevos',
    caloriesPer100g: 143,
    proteinPer100g: 12.6,
    carbsPer100g: 0.7,
    fatPer100g: 9.9,
    portionName: '1 huevo mediano/grande (L)',
    portionGrams: 63,
    source: 'Open Food Facts',
    popularSearchTerms: ['huevo', 'huevos', 'campero', 'tortilla', 'frito', 'cocido']
  },
  {
    id: 'claras_huevo_hacendado',
    name: 'Claras de huevo líquidas pasteurizadas',
    brand: 'Hacendado (Mercadona)',
    category: 'Huevos',
    caloriesPer100g: 49,
    proteinPer100g: 11.1,
    carbsPer100g: 0.7,
    fatPer100g: 0.1,
    portionName: '1 clara equivalente',
    portionGrams: 35,
    source: 'Open Food Facts',
    popularSearchTerms: ['clara', 'claras', 'huevo', 'hacendado', 'mercadona', 'proteina']
  },
  {
    id: 'pechuga_pollo_fresca',
    name: 'Pechuga de pollo fresca sin piel',
    brand: 'Carnicería / Fresco',
    category: 'Carnes',
    caloriesPer100g: 110,
    proteinPer100g: 23.1,
    carbsPer100g: 0.0,
    fatPer100g: 1.2,
    portionName: '1 filete mediano',
    portionGrams: 125,
    source: 'Open Food Facts',
    popularSearchTerms: ['pechuga', 'pollo', 'filete', 'fresco', 'plancha', 'carne']
  },
  {
    id: 'pechuga_pollo_asada_hacendado',
    name: 'Tiras de pechuga de pollo al natural',
    brand: 'Hacendado (Mercadona)',
    category: 'Carnes',
    caloriesPer100g: 104,
    proteinPer100g: 22.5,
    carbsPer100g: 1.2,
    fatPer100g: 1.1,
    portionName: '1 ración',
    portionGrams: 70,
    source: 'Open Food Facts',
    popularSearchTerms: ['pollo', 'tiras', 'asado', 'pechuga', 'hacendado', 'ensalada']
  },
  {
    id: 'pavo_braseado_elpozo',
    name: 'Pechuga de pavo braseada 90% carne',
    brand: 'El Pozo',
    category: 'Embutidos',
    caloriesPer100g: 88,
    proteinPer100g: 18.2,
    carbsPer100g: 1.5,
    fatPer100g: 1.0,
    portionName: '2 lonchas',
    portionGrams: 40,
    source: 'Open Food Facts',
    popularSearchTerms: ['pavo', 'pechuga', 'braseada', 'el pozo', 'lonchas']
  },
  {
    id: 'pavo_reducido_sal_hacendado',
    name: 'Pechuga de pavo reducida en sal lonchas',
    brand: 'Hacendado (Mercadona)',
    category: 'Embutidos',
    caloriesPer100g: 85,
    proteinPer100g: 18.0,
    carbsPer100g: 1.2,
    fatPer100g: 0.9,
    portionName: '2 lonchas',
    portionGrams: 40,
    source: 'Open Food Facts',
    popularSearchTerms: ['pavo', 'pechuga', 'hacendado', 'mercadona', 'lonchas']
  },
  {
    id: 'jamon_serrano_hacendado',
    name: 'Jamón serrano Reserva lonchas',
    brand: 'Hacendado (Mercadona)',
    category: 'Embutidos',
    caloriesPer100g: 225,
    proteinPer100g: 31.0,
    carbsPer100g: 0.5,
    fatPer100g: 11.0,
    portionName: '2 lonchas',
    portionGrams: 40,
    source: 'Open Food Facts',
    popularSearchTerms: ['jamon', 'serrano', 'reserva', 'hacendado', 'mercadona', 'tostada']
  },
  {
    id: 'jamon_cocido_campofrio',
    name: 'Jamón cocido extra calidad superior',
    brand: 'Campofrío',
    category: 'Embutidos',
    caloriesPer100g: 96,
    proteinPer100g: 18.5,
    carbsPer100g: 1.2,
    fatPer100g: 1.8,
    portionName: '2 lonchas',
    portionGrams: 40,
    source: 'Open Food Facts',
    popularSearchTerms: ['jamon', 'cocido', 'york', 'campofrio', 'sandwich']
  },
  {
    id: 'carne_picada_ternera',
    name: 'Carne picada de ternera magra 100%',
    brand: 'Carnicería / Fresco',
    category: 'Carnes',
    caloriesPer100g: 172,
    proteinPer100g: 20.5,
    carbsPer100g: 0.0,
    fatPer100g: 10.0,
    portionName: '1 hamburguesa / ración',
    portionGrams: 150,
    source: 'Open Food Facts',
    popularSearchTerms: ['ternera', 'carne picada', 'hamburguesa', 'carne']
  },
  {
    id: 'lomo_cerdo_fresco',
    name: 'Cinta de lomo de cerdo fresca',
    brand: 'Carnicería / Fresco',
    category: 'Carnes',
    caloriesPer100g: 135,
    proteinPer100g: 22.0,
    carbsPer100g: 0.0,
    fatPer100g: 5.0,
    portionName: '2 filetes',
    portionGrams: 120,
    source: 'Open Food Facts',
    popularSearchTerms: ['lomo', 'cerdo', 'cinta', 'filete']
  },

  // ==========================================
  // PESCADOS Y MARISCOS (SEAFOOD)
  // ==========================================
  {
    id: 'atun_natural_hacendado',
    name: 'Atún claro al natural en lata',
    brand: 'Hacendado (Mercadona)',
    category: 'Pescados',
    caloriesPer100g: 101,
    proteinPer100g: 23.5,
    carbsPer100g: 0.0,
    fatPer100g: 0.8,
    portionName: '1 lata escurrida',
    portionGrams: 60,
    source: 'Open Food Facts',
    popularSearchTerms: ['atun', 'natural', 'lata', 'hacendado', 'mercadona', 'ensalada']
  },
  {
    id: 'atun_aceite_oliva_hacendado',
    name: 'Atún claro en aceite de oliva en lata',
    brand: 'Hacendado (Mercadona)',
    category: 'Pescados',
    caloriesPer100g: 192,
    proteinPer100g: 25.0,
    carbsPer100g: 0.0,
    fatPer100g: 10.2,
    portionName: '1 lata escurrida',
    portionGrams: 60,
    source: 'Open Food Facts',
    popularSearchTerms: ['atun', 'aceite', 'oliva', 'hacendado', 'calvo']
  },
  {
    id: 'salmon_fresco_noruego',
    name: 'Salmón fresco en lomos',
    brand: 'Pescadería / Fresco',
    category: 'Pescados',
    caloriesPer100g: 208,
    proteinPer100g: 20.0,
    carbsPer100g: 0.0,
    fatPer100g: 13.5,
    portionName: '1 lomo mediano',
    portionGrams: 150,
    source: 'Open Food Facts',
    popularSearchTerms: ['salmon', 'pescado', 'omega 3', 'plancha', 'lomo']
  },
  {
    id: 'merluza_filetes_pescanova',
    name: 'Filetes de merluza sin piel',
    brand: 'Pescanova',
    category: 'Pescados',
    caloriesPer100g: 78,
    proteinPer100g: 16.5,
    carbsPer100g: 0.0,
    fatPer100g: 1.2,
    portionName: '1 filete',
    portionGrams: 120,
    source: 'Open Food Facts',
    popularSearchTerms: ['merluza', 'pescanova', 'pescado', 'blanco', 'filete']
  },

  // ==========================================
  // ARROZ, PASTAS, CEREALES Y LEGUMBRES
  // ==========================================
  {
    id: 'arroz_redondo_hacendado',
    name: 'Arroz redondo extra',
    brand: 'Hacendado (Mercadona)',
    category: 'Cereales',
    caloriesPer100g: 345,
    proteinPer100g: 7.0,
    carbsPer100g: 77.0,
    fatPer100g: 0.8,
    portionName: '1 ración en crudo',
    portionGrams: 70,
    source: 'Open Food Facts',
    popularSearchTerms: ['arroz', 'redondo', 'hacendado', 'mercadona', 'paella']
  },
  {
    id: 'arroz_basmati_sos',
    name: 'Arroz Basmati aromático',
    brand: 'SOS',
    category: 'Cereales',
    caloriesPer100g: 350,
    proteinPer100g: 8.5,
    carbsPer100g: 77.0,
    fatPer100g: 0.9,
    portionName: '1 ración en crudo',
    portionGrams: 70,
    source: 'Open Food Facts',
    popularSearchTerms: ['arroz', 'basmati', 'sos', 'guarnicion']
  },
  {
    id: 'arroz_brillante_vasito',
    name: 'Arroz blanco redondo vasito 1 minuto',
    brand: 'Brillante',
    category: 'Cereales',
    caloriesPer100g: 152,
    proteinPer100g: 3.2,
    carbsPer100g: 31.5,
    fatPer100g: 1.4,
    portionName: '1 vasito individual',
    portionGrams: 125,
    source: 'Open Food Facts',
    popularSearchTerms: ['arroz', 'vasito', 'brillante', 'microondas']
  },
  {
    id: 'avena_copos_hacendado',
    name: 'Copos de avena integral finos',
    brand: 'Hacendado (Mercadona)',
    category: 'Cereales',
    caloriesPer100g: 375,
    proteinPer100g: 13.5,
    carbsPer100g: 58.0,
    fatPer100g: 7.0,
    portionName: '1 ración desayuno / porridge',
    portionGrams: 40,
    source: 'Open Food Facts',
    popularSearchTerms: ['avena', 'copos', 'porridge', 'hacendado', 'mercadona', 'desayuno']
  },
  {
    id: 'avena_quaker_suave',
    name: 'Copos de avena suave Instant',
    brand: 'Quaker',
    category: 'Cereales',
    caloriesPer100g: 368,
    proteinPer100g: 12.0,
    carbsPer100g: 60.0,
    fatPer100g: 6.8,
    portionName: '1 ración',
    portionGrams: 40,
    source: 'Open Food Facts',
    popularSearchTerms: ['avena', 'quaker', 'desayuno']
  },
  {
    id: 'pasta_espaguetis_gallo',
    name: 'Espaguetis clásicos trigo duro',
    brand: 'Gallo',
    category: 'Cereales',
    caloriesPer100g: 350,
    proteinPer100g: 12.0,
    carbsPer100g: 71.0,
    fatPer100g: 1.5,
    portionName: '1 plato en crudo',
    portionGrams: 80,
    source: 'Open Food Facts',
    popularSearchTerms: ['pasta', 'espaguetis', 'gallo', 'macarrones']
  },
  {
    id: 'pasta_macarrones_integral_gallo',
    name: 'Macarrones pluma 100% integral',
    brand: 'Gallo',
    category: 'Cereales',
    caloriesPer100g: 335,
    proteinPer100g: 13.0,
    carbsPer100g: 65.0,
    fatPer100g: 2.2,
    portionName: '1 plato en crudo',
    portionGrams: 80,
    source: 'Open Food Facts',
    popularSearchTerms: ['pasta', 'integral', 'macarrones', 'gallo']
  },
  {
    id: 'lentejas_cocidas_hacendado',
    name: 'Lentejas cocidas bote de cristal',
    brand: 'Hacendado (Mercadona)',
    category: 'Legumbres',
    caloriesPer100g: 85,
    proteinPer100g: 6.8,
    carbsPer100g: 11.5,
    fatPer100g: 0.6,
    portionName: '1 plato hondo escurrido',
    portionGrams: 200,
    source: 'Open Food Facts',
    popularSearchTerms: ['lentejas', 'cocidas', 'legumbres', 'bote', 'hacendado', 'mercadona']
  },
  {
    id: 'garbanzos_cocidos_hacendado',
    name: 'Garbanzos cocidos bote de cristal',
    brand: 'Hacendado (Mercadona)',
    category: 'Legumbres',
    caloriesPer100g: 110,
    proteinPer100g: 6.5,
    carbsPer100g: 15.0,
    fatPer100g: 2.2,
    portionName: '1 plato hondo escurrido',
    portionGrams: 200,
    source: 'Open Food Facts',
    popularSearchTerms: ['garbanzos', 'cocidos', 'legumbres', 'hacendado', 'hummus']
  },

  // ==========================================
  // FRUTAS, VERDURAS Y FRUTOS SECOS
  // ==========================================
  {
    id: 'platano_canarias',
    name: 'Plátano de Canarias IGP fresco',
    brand: 'Plátano de Canarias',
    category: 'Frutas',
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 21.0,
    fatPer100g: 0.3,
    portionName: '1 plátano mediano sin piel',
    portionGrams: 100,
    source: 'Open Food Facts',
    popularSearchTerms: ['platano', 'banana', 'canarias', 'fruta', 'potasio']
  },
  {
    id: 'manzana_golden',
    name: 'Manzana Golden fresca',
    brand: 'Frutería / Fresco',
    category: 'Frutas',
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 12.0,
    fatPer100g: 0.2,
    portionName: '1 manzana mediana',
    portionGrams: 160,
    source: 'Open Food Facts',
    popularSearchTerms: ['manzana', 'golden', 'fruta', 'postre']
  },
  {
    id: 'fresas_frescas',
    name: 'Fresas frescas de Huelva',
    brand: 'Frutería / Fresco',
    category: 'Frutas',
    caloriesPer100g: 33,
    proteinPer100g: 0.7,
    carbsPer100g: 5.5,
    fatPer100g: 0.3,
    portionName: '1 cuenco / ración',
    portionGrams: 150,
    source: 'Open Food Facts',
    popularSearchTerms: ['fresas', 'fresa', 'frutos rojos', 'fruta']
  },
  {
    id: 'aguacate_hass',
    name: 'Aguacate fresco variedad Hass',
    brand: 'Frutería / Fresco',
    category: 'Frutas',
    caloriesPer100g: 160,
    proteinPer100g: 2.0,
    carbsPer100g: 2.0,
    fatPer100g: 15.0,
    portionName: 'Medio aguacate sin hueso ni piel',
    portionGrams: 80,
    source: 'Open Food Facts',
    popularSearchTerms: ['aguacate', 'palta', 'tostada', 'grasa saludable']
  },
  {
    id: 'nueces_peladas_hacendado',
    name: 'Nueces peladas naturales',
    brand: 'Hacendado (Mercadona)',
    category: 'Frutos Secos',
    caloriesPer100g: 654,
    proteinPer100g: 15.0,
    carbsPer100g: 7.0,
    fatPer100g: 65.0,
    portionName: '1 puñado / ración',
    portionGrams: 30,
    source: 'Open Food Facts',
    popularSearchTerms: ['nueces', 'nuez', 'frutos secos', 'hacendado', 'mercadona']
  },
  {
    id: 'almendras_tostadas_hacendado',
    name: 'Almendras tostadas sin sal añadida',
    brand: 'Hacendado (Mercadona)',
    category: 'Frutos Secos',
    caloriesPer100g: 610,
    proteinPer100g: 21.0,
    carbsPer100g: 6.0,
    fatPer100g: 53.0,
    portionName: '1 puñado',
    portionGrams: 30,
    source: 'Open Food Facts',
    popularSearchTerms: ['almendras', 'frutos secos', 'hacendado', 'mercadona']
  },
  {
    id: 'crema_cacahuete_hacendado',
    name: 'Crema de cacahuete 100% cacahuetes',
    brand: 'Hacendado (Mercadona)',
    category: 'Cremas',
    caloriesPer100g: 618,
    proteinPer100g: 30.0,
    carbsPer100g: 7.0,
    fatPer100g: 50.0,
    portionName: '1 cucharada colmada',
    portionGrams: 15,
    source: 'Open Food Facts',
    popularSearchTerms: ['crema cacahuete', 'mantequilla de mani', 'peanut butter', 'hacendado', 'proteina']
  },
  {
    id: 'aceite_oliva_virgen_extra',
    name: 'Aceite de oliva virgen extra (AOVE)',
    brand: 'Hacendado / Gran Selección',
    category: 'Aceites',
    caloriesPer100g: 884,
    proteinPer100g: 0.0,
    carbsPer100g: 0.0,
    fatPer100g: 100.0,
    portionName: '1 cucharada sopera',
    portionGrams: 10,
    source: 'Open Food Facts',
    popularSearchTerms: ['aceite', 'oliva', 'aove', 'virgen extra', 'cucharada']
  },
  {
    id: 'proteina_whey_optimum',
    name: 'Proteína 100% Whey Gold Standard',
    brand: 'Optimum Nutrition',
    category: 'Suplementos',
    caloriesPer100g: 375,
    proteinPer100g: 78.0,
    carbsPer100g: 5.0,
    fatPer100g: 4.5,
    portionName: '1 cazo (scoop)',
    portionGrams: 30,
    source: 'Open Food Facts',
    popularSearchTerms: ['proteina', 'whey', 'batido', 'suplemento', 'optimum', 'gym']
  }
];

export function searchLocalFoodDatabase(rawQuery: string): FoodNutrients100g[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const tokens = query.split(/\s+/).filter(Boolean);

  // Score matching items
  const scored = SPANISH_FOOD_DATABASE.map(item => {
    let score = 0;
    const nameLower = item.name.toLowerCase();
    const brandLower = (item.brand || '').toLowerCase();
    const catLower = item.category.toLowerCase();
    const searchTerms = item.popularSearchTerms || [];

    // Exact matches
    if (nameLower === query) score += 100;
    if (brandLower === query) score += 80;

    // Check each token
    for (const token of tokens) {
      if (nameLower.includes(token)) score += 30;
      if (brandLower.includes(token)) score += 25;
      if (catLower.includes(token)) score += 15;
      if (searchTerms.some(t => t.includes(token))) score += 20;
    }

    // Give high priority if starts with query
    if (nameLower.startsWith(query)) score += 40;

    return { item, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 25)
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
    }));
}
