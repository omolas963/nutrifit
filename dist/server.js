// server/index.ts
import express from "express";
import cors from "cors";
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";

// server/config.ts
import dotenv from "dotenv";
dotenv.config();
var config = {
  port: parseInt(process.env.PORT || "5000", 10),
  aiProvider: (process.env.AI_PROVIDER || "gemini").toLowerCase(),
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  usdaApiKey: process.env.USDA_API_KEY || "DEMO_KEY"
};

// server/routes/food.ts
import { Router } from "express";

// server/services/openFoodFactsService.ts
async function searchOpenFoodFacts(query) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const encoded = encodeURIComponent(query.trim());
    const url = `https://es.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}&search_simple=1&action=process&json=1&page_size=10`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "NutriFitDesktop/1.0 (contact@nutrifit.app)",
        "Accept": "application/json"
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeout));
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    if (!data.products || !Array.isArray(data.products)) {
      return [];
    }
    const results = [];
    for (const p of data.products) {
      const nutriments = p.nutriments || {};
      const energyKcal = nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"] ?? (nutriments["energy_100g"] ? Math.round(nutriments["energy_100g"] / 4.184) : 0);
      const protein = nutriments["proteins_100g"] ?? nutriments["proteins"] ?? 0;
      const carbs = nutriments["carbohydrates_100g"] ?? nutriments["carbohydrates"] ?? 0;
      const fat = nutriments["fat_100g"] ?? nutriments["fat"] ?? 0;
      const name = p.product_name_es || p.product_name || query;
      const brand = p.brands ? p.brands.split(",")[0].trim() : void 0;
      if (name && (energyKcal > 0 || protein > 0 || carbs > 0 || fat > 0)) {
        results.push({
          name: name.trim(),
          brand,
          caloriesPer100g: Math.round(Number(energyKcal) || 0),
          proteinPer100g: Number((Number(protein) || 0).toFixed(1)),
          carbsPer100g: Number((Number(carbs) || 0).toFixed(1)),
          fatPer100g: Number((Number(fat) || 0).toFixed(1)),
          source: "Open Food Facts",
          barcode: p.code
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}
async function getProductByBarcode(barcode) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const cleanCode = barcode.trim();
    const url = `https://world.openfoodfacts.org/api/v2/product/${cleanCode}.json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3e3);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "NutriFitDesktop/1.0 (contact@nutrifit.app)",
        "Accept": "application/json"
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeout));
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== 1 || !data.product) {
      return null;
    }
    const p = data.product;
    const nutriments = p.nutriments || {};
    const energyKcal = nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"] ?? (nutriments["energy_100g"] ? Math.round(nutriments["energy_100g"] / 4.184) : 0);
    const protein = nutriments["proteins_100g"] ?? nutriments["proteins"] ?? 0;
    const carbs = nutriments["carbohydrates_100g"] ?? nutriments["carbohydrates"] ?? 0;
    const fat = nutriments["fat_100g"] ?? nutriments["fat"] ?? 0;
    return {
      name: p.product_name_es || p.product_name || "Producto escaneado",
      brand: p.brands ? p.brands.split(",")[0].trim() : void 0,
      caloriesPer100g: Math.round(Number(energyKcal) || 0),
      proteinPer100g: Number((Number(protein) || 0).toFixed(1)),
      carbsPer100g: Number((Number(carbs) || 0).toFixed(1)),
      fatPer100g: Number((Number(fat) || 0).toFixed(1)),
      source: "Open Food Facts",
      barcode: p.code
    };
  } catch {
    return null;
  }
}

// server/services/foodDatabase.ts
var SPANISH_FOOD_DATABASE = [
  // ==========================================
  // PANES, TOSTADAS Y MASAS (BREADS & BAKERY)
  // ==========================================
  {
    id: "pan_hacendado_integral_molde",
    name: "Pan de molde 100% integral",
    brand: "Hacendado (Mercadona)",
    category: "Panes",
    caloriesPer100g: 228,
    proteinPer100g: 9.2,
    carbsPer100g: 40.5,
    fatPer100g: 2.4,
    portionName: "1 rebanada",
    portionGrams: 28,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "molde", "integral", "hacendado", "mercadona", "rebanada"]
  },
  {
    id: "pan_hacendado_blanco_sincorteza",
    name: "Pan de molde blanco sin corteza",
    brand: "Hacendado (Mercadona)",
    category: "Panes",
    caloriesPer100g: 242,
    proteinPer100g: 8.3,
    carbsPer100g: 46,
    fatPer100g: 2.2,
    portionName: "1 rebanada",
    portionGrams: 26,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "molde", "blanco", "sin corteza", "hacendado", "mercadona"]
  },
  {
    id: "pan_bimbo_artesano",
    name: "Pan de molde Artesano",
    brand: "Bimbo",
    category: "Panes",
    caloriesPer100g: 258,
    proteinPer100g: 8.8,
    carbsPer100g: 48,
    fatPer100g: 3.2,
    portionName: "1 rebanada gruesa",
    portionGrams: 38,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "bimbo", "artesano", "molde", "rebanada"]
  },
  {
    id: "pan_bimbo_silueta_integral",
    name: "Pan Silueta 100% Integral sin corteza",
    brand: "Bimbo",
    category: "Panes",
    caloriesPer100g: 215,
    proteinPer100g: 9.8,
    carbsPer100g: 36.5,
    fatPer100g: 2.1,
    portionName: "1 rebanada",
    portionGrams: 25,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "bimbo", "silueta", "integral", "sin corteza", "dieta"]
  },
  {
    id: "pan_bimbo_thins_integral",
    name: "Pan Thins 100% Integral 8 Cereales",
    brand: "Bimbo",
    category: "Panes",
    caloriesPer100g: 248,
    proteinPer100g: 11.2,
    carbsPer100g: 41.5,
    fatPer100g: 2.5,
    portionName: "1 panecillo (2 caras)",
    portionGrams: 39,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "thins", "bimbo", "integral", "cereales", "hamburguesa"]
  },
  {
    id: "pan_barra_rustica_hacendado",
    name: "Barra de pan r\xFAstica de panader\xEDa",
    brand: "Hacendado (Mercadona)",
    category: "Panes",
    caloriesPer100g: 252,
    proteinPer100g: 8.5,
    carbsPer100g: 51,
    fatPer100g: 1.1,
    portionName: "1 raci\xF3n / trozo",
    portionGrams: 60,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "barra", "rustica", "baguette", "hacendado", "mercadona", "bocadillo"]
  },
  {
    id: "pan_barra_integral_hacendado",
    name: "Barra de pan 100% integral",
    brand: "Hacendado (Mercadona)",
    category: "Panes",
    caloriesPer100g: 238,
    proteinPer100g: 9,
    carbsPer100g: 45.2,
    fatPer100g: 1.6,
    portionName: "1 trozo",
    portionGrams: 60,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "barra", "integral", "hacendado", "mercadona", "bocadillo"]
  },
  {
    id: "pan_tostado_integral_ortiz",
    name: "Pan tostado 100% integral",
    brand: "Ortiz",
    category: "Panes",
    caloriesPer100g: 382,
    proteinPer100g: 13,
    carbsPer100g: 64,
    fatPer100g: 5.5,
    portionName: "1 rebanada tostada",
    portionGrams: 10,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "tostado", "ortiz", "integral", "tostada", "desayuno"]
  },
  {
    id: "pan_tostado_clasico_ortiz",
    name: "Pan tostado cl\xE1sico crujiente",
    brand: "Ortiz",
    category: "Panes",
    caloriesPer100g: 395,
    proteinPer100g: 12,
    carbsPer100g: 70,
    fatPer100g: 6.2,
    portionName: "1 rebanada tostada",
    portionGrams: 10,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "tostado", "clasico", "ortiz", "tostada"]
  },
  {
    id: "pan_centeno_hacendado",
    name: "Pan de centeno 50% rebanado",
    brand: "Hacendado (Mercadona)",
    category: "Panes",
    caloriesPer100g: 218,
    proteinPer100g: 6.8,
    carbsPer100g: 41,
    fatPer100g: 1.6,
    portionName: "1 rebanada",
    portionGrams: 42,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "centeno", "hacendado", "mercadona", "aleman"]
  },
  {
    id: "pan_pita_hacendado",
    name: "Pan de pita blanco",
    brand: "Hacendado (Mercadona)",
    category: "Panes",
    caloriesPer100g: 265,
    proteinPer100g: 9.1,
    carbsPer100g: 52,
    fatPer100g: 1.5,
    portionName: "1 pan de pita",
    portionGrams: 70,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "pita", "hacendado", "mercadona", "kebab"]
  },
  {
    id: "pan_hamburguesa_brioche_hacendado",
    name: "Pan de hamburguesa estilo Brioche",
    brand: "Hacendado (Mercadona)",
    category: "Panes",
    caloriesPer100g: 312,
    proteinPer100g: 9,
    carbsPer100g: 50,
    fatPer100g: 7.8,
    portionName: "1 bollo",
    portionGrams: 75,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "hamburguesa", "brioche", "hacendado", "burger"]
  },
  {
    id: "pan_hamburguesa_bimbo_maxi",
    name: "Pan de hamburguesa Maxi Burger con s\xE9samo",
    brand: "Bimbo",
    category: "Panes",
    caloriesPer100g: 288,
    proteinPer100g: 8.5,
    carbsPer100g: 51,
    fatPer100g: 5,
    portionName: "1 bollo",
    portionGrams: 75,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "hamburguesa", "bimbo", "maxi", "sesamo", "burger"]
  },
  {
    id: "pan_molde_carrefour_bio",
    name: "Pan de molde espelta integral Bio",
    brand: "Carrefour Bio",
    category: "Panes",
    caloriesPer100g: 235,
    proteinPer100g: 9.5,
    carbsPer100g: 42,
    fatPer100g: 2.8,
    portionName: "1 rebanada",
    portionGrams: 30,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "carrefour", "bio", "espelta", "integral", "molde"]
  },
  {
    id: "pan_cristal_hacendado",
    name: "Pan de cristal redondo",
    brand: "Hacendado (Mercadona)",
    category: "Panes",
    caloriesPer100g: 260,
    proteinPer100g: 8.4,
    carbsPer100g: 53,
    fatPer100g: 1.4,
    portionName: "1 unidad",
    portionGrams: 80,
    source: "Open Food Facts",
    popularSearchTerms: ["pan", "cristal", "hacendado", "mercadona", "tosta"]
  },
  {
    id: "tortillas_trigo_hacendado",
    name: "Tortillas de trigo para fajitas / wraps",
    brand: "Hacendado (Mercadona)",
    category: "Panes",
    caloriesPer100g: 305,
    proteinPer100g: 8.2,
    carbsPer100g: 53,
    fatPer100g: 6.5,
    portionName: "1 tortilla",
    portionGrams: 40,
    source: "Open Food Facts",
    popularSearchTerms: ["tortilla", "fajita", "wrap", "trigo", "hacendado", "mercadona"]
  },
  {
    id: "picos_camperos_hacendado",
    name: "Picos camperos con aceite de oliva",
    brand: "Hacendado (Mercadona)",
    category: "Panes",
    caloriesPer100g: 412,
    proteinPer100g: 10.5,
    carbsPer100g: 72,
    fatPer100g: 8.5,
    portionName: "1 bolsita / pu\xF1ado",
    portionGrams: 30,
    source: "Open Food Facts",
    popularSearchTerms: ["picos", "pan", "camperos", "colines", "hacendado", "mercadona"]
  },
  // ==========================================
  // LÁCTEOS, BEBIDAS Y DERIVADOS (DAIRY)
  // ==========================================
  {
    id: "leche_entera_hacendado",
    name: "Leche entera UHT",
    brand: "Hacendado (Mercadona)",
    category: "L\xE1cteos",
    caloriesPer100g: 63,
    proteinPer100g: 3.1,
    carbsPer100g: 4.8,
    fatPer100g: 3.6,
    portionName: "1 vaso",
    portionGrams: 250,
    source: "Open Food Facts",
    popularSearchTerms: ["leche", "entera", "hacendado", "mercadona", "vaso"]
  },
  {
    id: "leche_semi_hacendado",
    name: "Leche semidesnatada UHT",
    brand: "Hacendado (Mercadona)",
    category: "L\xE1cteos",
    caloriesPer100g: 46,
    proteinPer100g: 3.2,
    carbsPer100g: 4.9,
    fatPer100g: 1.6,
    portionName: "1 vaso",
    portionGrams: 250,
    source: "Open Food Facts",
    popularSearchTerms: ["leche", "semidesnatada", "semi", "hacendado", "mercadona", "vaso"]
  },
  {
    id: "leche_desnatada_hacendado",
    name: "Leche desnatada UHT 0%",
    brand: "Hacendado (Mercadona)",
    category: "L\xE1cteos",
    caloriesPer100g: 35,
    proteinPer100g: 3.2,
    carbsPer100g: 4.9,
    fatPer100g: 0.2,
    portionName: "1 vaso",
    portionGrams: 250,
    source: "Open Food Facts",
    popularSearchTerms: ["leche", "desnatada", "cero", "0%", "hacendado", "mercadona", "vaso"]
  },
  {
    id: "leche_entera_asturiana",
    name: "Leche entera cl\xE1sica",
    brand: "Central Lechera Asturiana",
    category: "L\xE1cteos",
    caloriesPer100g: 64,
    proteinPer100g: 3.2,
    carbsPer100g: 4.7,
    fatPer100g: 3.6,
    portionName: "1 vaso",
    portionGrams: 250,
    source: "Open Food Facts",
    popularSearchTerms: ["leche", "entera", "asturiana", "central lechera"]
  },
  {
    id: "leche_suprema_asturiana",
    name: "Leche Suprema rica en prote\xEDnas y calcio",
    brand: "Central Lechera Asturiana",
    category: "L\xE1cteos",
    caloriesPer100g: 57,
    proteinPer100g: 6.2,
    carbsPer100g: 4.8,
    fatPer100g: 1.4,
    portionName: "1 vaso",
    portionGrams: 250,
    source: "Open Food Facts",
    popularSearchTerms: ["leche", "suprema", "asturiana", "proteina", "calcio"]
  },
  {
    id: "leche_desnatada_pascual",
    name: "Leche desnatada bienestar animal",
    brand: "Pascual",
    category: "L\xE1cteos",
    caloriesPer100g: 35,
    proteinPer100g: 3.3,
    carbsPer100g: 4.8,
    fatPer100g: 0.3,
    portionName: "1 vaso",
    portionGrams: 250,
    source: "Open Food Facts",
    popularSearchTerms: ["leche", "desnatada", "pascual"]
  },
  {
    id: "queso_fresco_batido_hacendado",
    name: "Queso fresco batido 0% desnatado",
    brand: "Hacendado (Mercadona)",
    category: "L\xE1cteos",
    caloriesPer100g: 46,
    proteinPer100g: 8,
    carbsPer100g: 3.5,
    fatPer100g: 0.1,
    portionName: "1 tarrina peque\xF1a / raci\xF3n",
    portionGrams: 125,
    source: "Open Food Facts",
    popularSearchTerms: ["queso", "batido", "fresco", "desnatado", "hacendado", "mercadona", "proteina"]
  },
  {
    id: "yogur_natural_danone",
    name: "Yogur natural cl\xE1sico",
    brand: "Danone",
    category: "L\xE1cteos",
    caloriesPer100g: 61,
    proteinPer100g: 3.4,
    carbsPer100g: 4.2,
    fatPer100g: 3.3,
    portionName: "1 yogur",
    portionGrams: 125,
    source: "Open Food Facts",
    popularSearchTerms: ["yogur", "natural", "danone"]
  },
  {
    id: "yogur_griego_hacendado",
    name: "Yogur griego natural",
    brand: "Hacendado (Mercadona)",
    category: "L\xE1cteos",
    caloriesPer100g: 125,
    proteinPer100g: 3.8,
    carbsPer100g: 3.9,
    fatPer100g: 10.5,
    portionName: "1 yogur",
    portionGrams: 125,
    source: "Open Food Facts",
    popularSearchTerms: ["yogur", "griego", "natural", "hacendado", "mercadona"]
  },
  {
    id: "yogur_proteinas_fresa_hacendado",
    name: "Postre l\xE1cteo +Prote\xEDnas sabor Fresa",
    brand: "Hacendado (Mercadona)",
    category: "L\xE1cteos",
    caloriesPer100g: 52,
    proteinPer100g: 10,
    carbsPer100g: 2.8,
    fatPer100g: 0.1,
    portionName: "1 tarrina",
    portionGrams: 120,
    source: "Open Food Facts",
    popularSearchTerms: ["yogur", "proteina", "+proteinas", "fresa", "hacendado", "mercadona"]
  },
  {
    id: "skyr_natural_milbona",
    name: "Skyr natural estilo island\xE9s",
    brand: "Milbona (Lidl)",
    category: "L\xE1cteos",
    caloriesPer100g: 62,
    proteinPer100g: 11,
    carbsPer100g: 4,
    fatPer100g: 0.2,
    portionName: "1 vaso",
    portionGrams: 150,
    source: "Open Food Facts",
    popularSearchTerms: ["skyr", "milbona", "lidl", "proteina", "yogur"]
  },
  {
    id: "queso_cottage_hacendado",
    name: "Queso Cottage bajo en grasa",
    brand: "Hacendado (Mercadona)",
    category: "L\xE1cteos",
    caloriesPer100g: 98,
    proteinPer100g: 12,
    carbsPer100g: 2.8,
    fatPer100g: 4.2,
    portionName: "1 raci\xF3n",
    portionGrams: 100,
    source: "Open Food Facts",
    popularSearchTerms: ["queso", "cottage", "hacendado", "mercadona", "granulado"]
  },
  {
    id: "queso_mozzarella_hacendado",
    name: "Queso Mozzarella rallado especial pizza",
    brand: "Hacendado (Mercadona)",
    category: "L\xE1cteos",
    caloriesPer100g: 285,
    proteinPer100g: 24,
    carbsPer100g: 2.5,
    fatPer100g: 20,
    portionName: "1 pu\xF1ado",
    portionGrams: 30,
    source: "Open Food Facts",
    popularSearchTerms: ["queso", "mozzarella", "rallado", "hacendado", "pizza"]
  },
  // ==========================================
  // HUEVOS Y PROTEÍNAS (EGGS & MEATS)
  // ==========================================
  {
    id: "huevo_entero_fresco",
    name: "Huevo fresco campero tama\xF1o L",
    brand: "Origen Espa\xF1a",
    category: "Huevos",
    caloriesPer100g: 143,
    proteinPer100g: 12.6,
    carbsPer100g: 0.7,
    fatPer100g: 9.9,
    portionName: "1 huevo mediano/grande (L)",
    portionGrams: 63,
    source: "Open Food Facts",
    popularSearchTerms: ["huevo", "huevos", "campero", "tortilla", "frito", "cocido"]
  },
  {
    id: "claras_huevo_hacendado",
    name: "Claras de huevo l\xEDquidas pasteurizadas",
    brand: "Hacendado (Mercadona)",
    category: "Huevos",
    caloriesPer100g: 49,
    proteinPer100g: 11.1,
    carbsPer100g: 0.7,
    fatPer100g: 0.1,
    portionName: "1 clara equivalente",
    portionGrams: 35,
    source: "Open Food Facts",
    popularSearchTerms: ["clara", "claras", "huevo", "hacendado", "mercadona", "proteina"]
  },
  {
    id: "pechuga_pollo_fresca",
    name: "Pechuga de pollo fresca sin piel",
    brand: "Carnicer\xEDa / Fresco",
    category: "Carnes",
    caloriesPer100g: 110,
    proteinPer100g: 23.1,
    carbsPer100g: 0,
    fatPer100g: 1.2,
    portionName: "1 filete mediano",
    portionGrams: 125,
    source: "Open Food Facts",
    popularSearchTerms: ["pechuga", "pollo", "filete", "fresco", "plancha", "carne"]
  },
  {
    id: "pechuga_pollo_asada_hacendado",
    name: "Tiras de pechuga de pollo al natural",
    brand: "Hacendado (Mercadona)",
    category: "Carnes",
    caloriesPer100g: 104,
    proteinPer100g: 22.5,
    carbsPer100g: 1.2,
    fatPer100g: 1.1,
    portionName: "1 raci\xF3n",
    portionGrams: 70,
    source: "Open Food Facts",
    popularSearchTerms: ["pollo", "tiras", "asado", "pechuga", "hacendado", "ensalada"]
  },
  {
    id: "pavo_braseado_elpozo",
    name: "Pechuga de pavo braseada 90% carne",
    brand: "El Pozo",
    category: "Embutidos",
    caloriesPer100g: 88,
    proteinPer100g: 18.2,
    carbsPer100g: 1.5,
    fatPer100g: 1,
    portionName: "2 lonchas",
    portionGrams: 40,
    source: "Open Food Facts",
    popularSearchTerms: ["pavo", "pechuga", "braseada", "el pozo", "lonchas"]
  },
  {
    id: "pavo_reducido_sal_hacendado",
    name: "Pechuga de pavo reducida en sal lonchas",
    brand: "Hacendado (Mercadona)",
    category: "Embutidos",
    caloriesPer100g: 85,
    proteinPer100g: 18,
    carbsPer100g: 1.2,
    fatPer100g: 0.9,
    portionName: "2 lonchas",
    portionGrams: 40,
    source: "Open Food Facts",
    popularSearchTerms: ["pavo", "pechuga", "hacendado", "mercadona", "lonchas"]
  },
  {
    id: "jamon_serrano_hacendado",
    name: "Jam\xF3n serrano Reserva lonchas",
    brand: "Hacendado (Mercadona)",
    category: "Embutidos",
    caloriesPer100g: 225,
    proteinPer100g: 31,
    carbsPer100g: 0.5,
    fatPer100g: 11,
    portionName: "2 lonchas",
    portionGrams: 40,
    source: "Open Food Facts",
    popularSearchTerms: ["jamon", "serrano", "reserva", "hacendado", "mercadona", "tostada"]
  },
  {
    id: "jamon_cocido_campofrio",
    name: "Jam\xF3n cocido extra calidad superior",
    brand: "Campofr\xEDo",
    category: "Embutidos",
    caloriesPer100g: 96,
    proteinPer100g: 18.5,
    carbsPer100g: 1.2,
    fatPer100g: 1.8,
    portionName: "2 lonchas",
    portionGrams: 40,
    source: "Open Food Facts",
    popularSearchTerms: ["jamon", "cocido", "york", "campofrio", "sandwich"]
  },
  {
    id: "carne_picada_ternera",
    name: "Carne picada de ternera magra 100%",
    brand: "Carnicer\xEDa / Fresco",
    category: "Carnes",
    caloriesPer100g: 172,
    proteinPer100g: 20.5,
    carbsPer100g: 0,
    fatPer100g: 10,
    portionName: "1 hamburguesa / raci\xF3n",
    portionGrams: 150,
    source: "Open Food Facts",
    popularSearchTerms: ["ternera", "carne picada", "hamburguesa", "carne"]
  },
  {
    id: "lomo_cerdo_fresco",
    name: "Cinta de lomo de cerdo fresca",
    brand: "Carnicer\xEDa / Fresco",
    category: "Carnes",
    caloriesPer100g: 135,
    proteinPer100g: 22,
    carbsPer100g: 0,
    fatPer100g: 5,
    portionName: "2 filetes",
    portionGrams: 120,
    source: "Open Food Facts",
    popularSearchTerms: ["lomo", "cerdo", "cinta", "filete"]
  },
  // ==========================================
  // PESCADOS Y MARISCOS (SEAFOOD)
  // ==========================================
  {
    id: "atun_natural_hacendado",
    name: "At\xFAn claro al natural en lata",
    brand: "Hacendado (Mercadona)",
    category: "Pescados",
    caloriesPer100g: 101,
    proteinPer100g: 23.5,
    carbsPer100g: 0,
    fatPer100g: 0.8,
    portionName: "1 lata escurrida",
    portionGrams: 60,
    source: "Open Food Facts",
    popularSearchTerms: ["atun", "natural", "lata", "hacendado", "mercadona", "ensalada"]
  },
  {
    id: "atun_aceite_oliva_hacendado",
    name: "At\xFAn claro en aceite de oliva en lata",
    brand: "Hacendado (Mercadona)",
    category: "Pescados",
    caloriesPer100g: 192,
    proteinPer100g: 25,
    carbsPer100g: 0,
    fatPer100g: 10.2,
    portionName: "1 lata escurrida",
    portionGrams: 60,
    source: "Open Food Facts",
    popularSearchTerms: ["atun", "aceite", "oliva", "hacendado", "calvo"]
  },
  {
    id: "salmon_fresco_noruego",
    name: "Salm\xF3n fresco en lomos",
    brand: "Pescader\xEDa / Fresco",
    category: "Pescados",
    caloriesPer100g: 208,
    proteinPer100g: 20,
    carbsPer100g: 0,
    fatPer100g: 13.5,
    portionName: "1 lomo mediano",
    portionGrams: 150,
    source: "Open Food Facts",
    popularSearchTerms: ["salmon", "pescado", "omega 3", "plancha", "lomo"]
  },
  {
    id: "merluza_filetes_pescanova",
    name: "Filetes de merluza sin piel",
    brand: "Pescanova",
    category: "Pescados",
    caloriesPer100g: 78,
    proteinPer100g: 16.5,
    carbsPer100g: 0,
    fatPer100g: 1.2,
    portionName: "1 filete",
    portionGrams: 120,
    source: "Open Food Facts",
    popularSearchTerms: ["merluza", "pescanova", "pescado", "blanco", "filete"]
  },
  // ==========================================
  // ARROZ, PASTAS, CEREALES Y LEGUMBRES
  // ==========================================
  {
    id: "arroz_redondo_hacendado",
    name: "Arroz redondo extra",
    brand: "Hacendado (Mercadona)",
    category: "Cereales",
    caloriesPer100g: 345,
    proteinPer100g: 7,
    carbsPer100g: 77,
    fatPer100g: 0.8,
    portionName: "1 raci\xF3n en crudo",
    portionGrams: 70,
    source: "Open Food Facts",
    popularSearchTerms: ["arroz", "redondo", "hacendado", "mercadona", "paella"]
  },
  {
    id: "arroz_basmati_sos",
    name: "Arroz Basmati arom\xE1tico",
    brand: "SOS",
    category: "Cereales",
    caloriesPer100g: 350,
    proteinPer100g: 8.5,
    carbsPer100g: 77,
    fatPer100g: 0.9,
    portionName: "1 raci\xF3n en crudo",
    portionGrams: 70,
    source: "Open Food Facts",
    popularSearchTerms: ["arroz", "basmati", "sos", "guarnicion"]
  },
  {
    id: "arroz_brillante_vasito",
    name: "Arroz blanco redondo vasito 1 minuto",
    brand: "Brillante",
    category: "Cereales",
    caloriesPer100g: 152,
    proteinPer100g: 3.2,
    carbsPer100g: 31.5,
    fatPer100g: 1.4,
    portionName: "1 vasito individual",
    portionGrams: 125,
    source: "Open Food Facts",
    popularSearchTerms: ["arroz", "vasito", "brillante", "microondas"]
  },
  {
    id: "avena_copos_hacendado",
    name: "Copos de avena integral finos",
    brand: "Hacendado (Mercadona)",
    category: "Cereales",
    caloriesPer100g: 375,
    proteinPer100g: 13.5,
    carbsPer100g: 58,
    fatPer100g: 7,
    portionName: "1 raci\xF3n desayuno / porridge",
    portionGrams: 40,
    source: "Open Food Facts",
    popularSearchTerms: ["avena", "copos", "porridge", "hacendado", "mercadona", "desayuno"]
  },
  {
    id: "avena_quaker_suave",
    name: "Copos de avena suave Instant",
    brand: "Quaker",
    category: "Cereales",
    caloriesPer100g: 368,
    proteinPer100g: 12,
    carbsPer100g: 60,
    fatPer100g: 6.8,
    portionName: "1 raci\xF3n",
    portionGrams: 40,
    source: "Open Food Facts",
    popularSearchTerms: ["avena", "quaker", "desayuno"]
  },
  {
    id: "pasta_espaguetis_gallo",
    name: "Espaguetis cl\xE1sicos trigo duro",
    brand: "Gallo",
    category: "Cereales",
    caloriesPer100g: 350,
    proteinPer100g: 12,
    carbsPer100g: 71,
    fatPer100g: 1.5,
    portionName: "1 plato en crudo",
    portionGrams: 80,
    source: "Open Food Facts",
    popularSearchTerms: ["pasta", "espaguetis", "gallo", "macarrones"]
  },
  {
    id: "pasta_macarrones_integral_gallo",
    name: "Macarrones pluma 100% integral",
    brand: "Gallo",
    category: "Cereales",
    caloriesPer100g: 335,
    proteinPer100g: 13,
    carbsPer100g: 65,
    fatPer100g: 2.2,
    portionName: "1 plato en crudo",
    portionGrams: 80,
    source: "Open Food Facts",
    popularSearchTerms: ["pasta", "integral", "macarrones", "gallo"]
  },
  {
    id: "lentejas_cocidas_hacendado",
    name: "Lentejas cocidas bote de cristal",
    brand: "Hacendado (Mercadona)",
    category: "Legumbres",
    caloriesPer100g: 85,
    proteinPer100g: 6.8,
    carbsPer100g: 11.5,
    fatPer100g: 0.6,
    portionName: "1 plato hondo escurrido",
    portionGrams: 200,
    source: "Open Food Facts",
    popularSearchTerms: ["lentejas", "cocidas", "legumbres", "bote", "hacendado", "mercadona"]
  },
  {
    id: "garbanzos_cocidos_hacendado",
    name: "Garbanzos cocidos bote de cristal",
    brand: "Hacendado (Mercadona)",
    category: "Legumbres",
    caloriesPer100g: 110,
    proteinPer100g: 6.5,
    carbsPer100g: 15,
    fatPer100g: 2.2,
    portionName: "1 plato hondo escurrido",
    portionGrams: 200,
    source: "Open Food Facts",
    popularSearchTerms: ["garbanzos", "cocidos", "legumbres", "hacendado", "hummus"]
  },
  // ==========================================
  // FRUTAS, VERDURAS Y FRUTOS SECOS
  // ==========================================
  {
    id: "platano_canarias",
    name: "Pl\xE1tano de Canarias IGP fresco",
    brand: "Pl\xE1tano de Canarias",
    category: "Frutas",
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 21,
    fatPer100g: 0.3,
    portionName: "1 pl\xE1tano mediano sin piel",
    portionGrams: 100,
    source: "Open Food Facts",
    popularSearchTerms: ["platano", "banana", "canarias", "fruta", "potasio"]
  },
  {
    id: "manzana_golden",
    name: "Manzana Golden fresca",
    brand: "Fruter\xEDa / Fresco",
    category: "Frutas",
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 12,
    fatPer100g: 0.2,
    portionName: "1 manzana mediana",
    portionGrams: 160,
    source: "Open Food Facts",
    popularSearchTerms: ["manzana", "golden", "fruta", "postre"]
  },
  {
    id: "fresas_frescas",
    name: "Fresas frescas de Huelva",
    brand: "Fruter\xEDa / Fresco",
    category: "Frutas",
    caloriesPer100g: 33,
    proteinPer100g: 0.7,
    carbsPer100g: 5.5,
    fatPer100g: 0.3,
    portionName: "1 cuenco / raci\xF3n",
    portionGrams: 150,
    source: "Open Food Facts",
    popularSearchTerms: ["fresas", "fresa", "frutos rojos", "fruta"]
  },
  {
    id: "aguacate_hass",
    name: "Aguacate fresco variedad Hass",
    brand: "Fruter\xEDa / Fresco",
    category: "Frutas",
    caloriesPer100g: 160,
    proteinPer100g: 2,
    carbsPer100g: 2,
    fatPer100g: 15,
    portionName: "Medio aguacate sin hueso ni piel",
    portionGrams: 80,
    source: "Open Food Facts",
    popularSearchTerms: ["aguacate", "palta", "tostada", "grasa saludable"]
  },
  {
    id: "nueces_peladas_hacendado",
    name: "Nueces peladas naturales",
    brand: "Hacendado (Mercadona)",
    category: "Frutos Secos",
    caloriesPer100g: 654,
    proteinPer100g: 15,
    carbsPer100g: 7,
    fatPer100g: 65,
    portionName: "1 pu\xF1ado / raci\xF3n",
    portionGrams: 30,
    source: "Open Food Facts",
    popularSearchTerms: ["nueces", "nuez", "frutos secos", "hacendado", "mercadona"]
  },
  {
    id: "almendras_tostadas_hacendado",
    name: "Almendras tostadas sin sal a\xF1adida",
    brand: "Hacendado (Mercadona)",
    category: "Frutos Secos",
    caloriesPer100g: 610,
    proteinPer100g: 21,
    carbsPer100g: 6,
    fatPer100g: 53,
    portionName: "1 pu\xF1ado",
    portionGrams: 30,
    source: "Open Food Facts",
    popularSearchTerms: ["almendras", "frutos secos", "hacendado", "mercadona"]
  },
  {
    id: "crema_cacahuete_hacendado",
    name: "Crema de cacahuete 100% cacahuetes",
    brand: "Hacendado (Mercadona)",
    category: "Cremas",
    caloriesPer100g: 618,
    proteinPer100g: 30,
    carbsPer100g: 7,
    fatPer100g: 50,
    portionName: "1 cucharada colmada",
    portionGrams: 15,
    source: "Open Food Facts",
    popularSearchTerms: ["crema cacahuete", "mantequilla de mani", "peanut butter", "hacendado", "proteina"]
  },
  {
    id: "aceite_oliva_virgen_extra",
    name: "Aceite de oliva virgen extra (AOVE)",
    brand: "Hacendado / Gran Selecci\xF3n",
    category: "Aceites",
    caloriesPer100g: 884,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 100,
    portionName: "1 cucharada sopera",
    portionGrams: 10,
    source: "Open Food Facts",
    popularSearchTerms: ["aceite", "oliva", "aove", "virgen extra", "cucharada"]
  },
  {
    id: "proteina_whey_optimum",
    name: "Prote\xEDna 100% Whey Gold Standard",
    brand: "Optimum Nutrition",
    category: "Suplementos",
    caloriesPer100g: 375,
    proteinPer100g: 78,
    carbsPer100g: 5,
    fatPer100g: 4.5,
    portionName: "1 cazo (scoop)",
    portionGrams: 30,
    source: "Open Food Facts",
    popularSearchTerms: ["proteina", "whey", "batido", "suplemento", "optimum", "gym"]
  }
];
function searchLocalFoodDatabase(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];
  const tokens = query.split(/\s+/).filter(Boolean);
  const scored = SPANISH_FOOD_DATABASE.map((item) => {
    let score = 0;
    const nameLower = item.name.toLowerCase();
    const brandLower = (item.brand || "").toLowerCase();
    const catLower = item.category.toLowerCase();
    const searchTerms = item.popularSearchTerms || [];
    if (nameLower === query) score += 100;
    if (brandLower === query) score += 80;
    for (const token of tokens) {
      if (nameLower.includes(token)) score += 30;
      if (brandLower.includes(token)) score += 25;
      if (catLower.includes(token)) score += 15;
      if (searchTerms.some((t) => t.includes(token))) score += 20;
    }
    if (nameLower.startsWith(query)) score += 40;
    return { item, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 25).map((s) => ({
    name: s.item.name,
    brand: s.item.brand,
    caloriesPer100g: s.item.caloriesPer100g,
    proteinPer100g: s.item.proteinPer100g,
    carbsPer100g: s.item.carbsPer100g,
    fatPer100g: s.item.fatPer100g,
    source: s.item.source,
    barcode: s.item.barcode,
    portionName: s.item.portionName,
    portionGrams: s.item.portionGrams
  }));
}

// server/routes/food.ts
var foodRouter = Router();
foodRouter.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.json({ results: [] });
    }
    const localResults = searchLocalFoodDatabase(q);
    let offResults = [];
    try {
      offResults = await searchOpenFoodFacts(q);
    } catch {
      offResults = [];
    }
    const seen = /* @__PURE__ */ new Set();
    const combined = [];
    for (const item of localResults) {
      const key = `${item.name.toLowerCase()}_${(item.brand || "").toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }
    for (const item of offResults) {
      const key = `${item.name.toLowerCase()}_${(item.brand || "").toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }
    return res.json({ results: combined });
  } catch (error) {
    console.error("Error in food search route:", error);
    return res.status(500).json({ error: "Error al buscar alimentos" });
  }
});
foodRouter.get("/barcode/:code", async (req, res) => {
  try {
    const barcode = req.params.code;
    if (!barcode) {
      return res.status(400).json({ error: "C\xF3digo de barras no proporcionado" });
    }
    const product = await getProductByBarcode(barcode);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado con este c\xF3digo de barras" });
    }
    return res.json({ product });
  } catch (error) {
    console.error("Error in barcode lookup route:", error);
    return res.status(500).json({ error: "Error al consultar c\xF3digo de barras" });
  }
});

// server/routes/ai.ts
import { Router as Router2 } from "express";

// server/services/aiProvider.ts
var COMMON_FOODS = {
  huevo: { cal: 155, p: 13, c: 1.1, f: 11, defaultGrams: 60 },
  huevos: { cal: 155, p: 13, c: 1.1, f: 11, defaultGrams: 120 },
  pan: { cal: 265, p: 9, c: 49, f: 3.2, defaultGrams: 40 },
  "pan integral": { cal: 247, p: 11, c: 41, f: 3.5, defaultGrams: 40 },
  arroz: { cal: 130, p: 2.7, c: 28, f: 0.3, defaultGrams: 150 },
  pollo: { cal: 165, p: 31, c: 0, f: 3.6, defaultGrams: 150 },
  "pechuga de pollo": { cal: 165, p: 31, c: 0, f: 3.6, defaultGrams: 150 },
  salmon: { cal: 208, p: 20, c: 0, f: 13, defaultGrams: 150 },
  salm\u00F3n: { cal: 208, p: 20, c: 0, f: 13, defaultGrams: 150 },
  avena: { cal: 389, p: 16.9, c: 66, f: 6.9, defaultGrams: 50 },
  platano: { cal: 89, p: 1.1, c: 23, f: 0.3, defaultGrams: 120 },
  pl\u00E1tano: { cal: 89, p: 1.1, c: 23, f: 0.3, defaultGrams: 120 },
  banana: { cal: 89, p: 1.1, c: 23, f: 0.3, defaultGrams: 120 },
  manzana: { cal: 52, p: 0.3, c: 14, f: 0.2, defaultGrams: 160 },
  aguacate: { cal: 160, p: 2, c: 8.5, f: 15, defaultGrams: 80 },
  brocoli: { cal: 34, p: 2.8, c: 7, f: 0.4, defaultGrams: 120 },
  br\u00F3coli: { cal: 34, p: 2.8, c: 7, f: 0.4, defaultGrams: 120 },
  yogur: { cal: 63, p: 5.3, c: 7, f: 1.6, defaultGrams: 125 },
  "yogur griego": { cal: 97, p: 9, c: 3.6, f: 5, defaultGrams: 125 },
  leche: { cal: 46, p: 3.2, c: 4.8, f: 1.6, defaultGrams: 200 },
  almendras: { cal: 579, p: 21, c: 22, f: 50, defaultGrams: 25 },
  nueces: { cal: 654, p: 15, c: 14, f: 65, defaultGrams: 25 },
  atun: { cal: 130, p: 28, c: 0, f: 1.5, defaultGrams: 100 },
  at\u00FAn: { cal: 130, p: 28, c: 0, f: 1.5, defaultGrams: 100 },
  queso: { cal: 350, p: 25, c: 1.3, f: 28, defaultGrams: 40 },
  tomate: { cal: 18, p: 0.9, c: 3.9, f: 0.2, defaultGrams: 120 },
  ensalada: { cal: 25, p: 1.5, c: 4, f: 0.3, defaultGrams: 150 },
  aceite: { cal: 884, p: 0, c: 0, f: 100, defaultGrams: 10 },
  "aceite de oliva": { cal: 884, p: 0, c: 0, f: 100, defaultGrams: 10 },
  patata: { cal: 77, p: 2, c: 17, f: 0.1, defaultGrams: 150 },
  cafe: { cal: 2, p: 0.1, c: 0, f: 0, defaultGrams: 150 },
  caf\u00E9: { cal: 2, p: 0.1, c: 0, f: 0, defaultGrams: 150 }
};
function estimateFromMock(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const [key, val] of Object.entries(COMMON_FOODS)) {
    if (lower.includes(key)) {
      let grams = val.defaultGrams;
      const gramRegex = new RegExp(`(\\d+)\\s*(?:g|gr|gramos)\\s*(?:de\\s*)?${key}`, "i");
      const gramMatch = lower.match(gramRegex);
      if (gramMatch && gramMatch[1]) {
        grams = parseInt(gramMatch[1], 10);
      } else {
        const countRegex = new RegExp(`(\\d+)\\s*${key}`, "i");
        const countMatch = lower.match(countRegex);
        if (countMatch && countMatch[1]) {
          const qty = parseInt(countMatch[1], 10);
          grams = Math.round(val.defaultGrams * (qty > 1 ? qty / 2 : 1));
        }
      }
      const factor = grams / 100;
      found.push({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        estimatedGrams: grams,
        estimatedCalories: Math.round(val.cal * factor),
        estimatedProtein: Number((val.p * factor).toFixed(1)),
        estimatedCarbs: Number((val.c * factor).toFixed(1)),
        estimatedFat: Number((val.f * factor).toFixed(1))
      });
    }
  }
  if (found.length === 0) {
    const defaultGrams = 120;
    found.push({
      name: text.slice(0, 40) || "Alimento registrado",
      estimatedGrams: defaultGrams,
      estimatedCalories: 180,
      estimatedProtein: 10,
      estimatedCarbs: 22,
      estimatedFat: 5
    });
  }
  return found;
}
async function analyzeFoodWithAI(params) {
  const { imageBase64, text } = params;
  const provider = config.aiProvider;
  if (provider === "gemini" && config.geminiApiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`;
      const contents = [];
      const parts = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64
          }
        });
        parts.push({
          text: "Identifica los alimentos individuales visibles en el plato. Para cada uno, estima su nombre en espa\xF1ol, los gramos aproximados que se ven en la porci\xF3n, y sus calor\xEDas y macronutrientes estimados por esa porci\xF3n."
        });
      } else if (text) {
        parts.push({
          text: `Analiza este texto de comida consumida: "${text}". Separa cada alimento individual, estima sus gramos basados en el texto o en porciones est\xE1ndar realistas, y calcula calor\xEDas y macronutrientes estimados.`
        });
      }
      parts.push({
        text: `Responde \xDANICAMENTE con un JSON v\xE1lido sin markdown ni texto extra, con esta estructura exacta:
[
  {
    "name": "Nombre del alimento en espa\xF1ol",
    "estimatedGrams": 150,
    "estimatedCalories": 240,
    "estimatedProtein": 28.5,
    "estimatedCarbs": 2.1,
    "estimatedFat": 12.0
  }
]`
      });
      contents.push({ parts });
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      });
      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Gemini API call failed, using smart fallback:", e);
    }
  }
  if (provider === "openai" && config.openaiApiKey) {
    try {
      const messages = [
        {
          role: "system",
          content: 'Eres un nutricionista experto. Analiza la imagen o texto de comida y responde exclusivamente con un JSON array de alimentos identificados con "name" (en espa\xF1ol), "estimatedGrams", "estimatedCalories", "estimatedProtein", "estimatedCarbs", "estimatedFat".'
        }
      ];
      if (imageBase64) {
        const formattedUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
        messages.push({
          role: "user",
          content: [
            { type: "text", text: "Analiza los alimentos en esta foto." },
            { type: "image_url", image_url: { url: formattedUrl } }
          ]
        });
      } else {
        messages.push({
          role: "user",
          content: `Alimentos consumidos: ${text}`
        });
      }
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          response_format: { type: "json_object" }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        const parsed = JSON.parse(content);
        const list = Array.isArray(parsed) ? parsed : parsed.foods || parsed.alimentos || Object.values(parsed)[0];
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      }
    } catch (e) {
      console.error("OpenAI API call failed, using smart fallback:", e);
    }
  }
  if (provider === "claude" && config.anthropicApiKey) {
    try {
      const contentParts = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        contentParts.push({
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: cleanBase64
          }
        });
      }
      contentParts.push({
        type: "text",
        text: `Identifica los alimentos de: ${text || "la imagen adjunta"}. Responde \xDANICAMENTE en JSON con formato: [{"name": string, "estimatedGrams": number, "estimatedCalories": number, "estimatedProtein": number, "estimatedCarbs": number, "estimatedFat": number}]`
      });
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.anthropicApiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1e3,
          messages: [{ role: "user", content: contentParts }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const rawText = data.content?.[0]?.text || "";
        const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Claude API call failed, using smart fallback:", e);
    }
  }
  if (imageBase64 && !text) {
    return [
      {
        name: "Pechuga de pollo a la plancha",
        estimatedGrams: 160,
        estimatedCalories: 264,
        estimatedProtein: 49.6,
        estimatedCarbs: 0,
        estimatedFat: 5.8
      },
      {
        name: "Arroz jazm\xEDn al vapor",
        estimatedGrams: 150,
        estimatedCalories: 195,
        estimatedProtein: 4.1,
        estimatedCarbs: 42,
        estimatedFat: 0.5
      },
      {
        name: "Br\xF3coli salteado",
        estimatedGrams: 100,
        estimatedCalories: 35,
        estimatedProtein: 2.8,
        estimatedCarbs: 7,
        estimatedFat: 0.4
      },
      {
        name: "Aceite de oliva virgen extra",
        estimatedGrams: 10,
        estimatedCalories: 88,
        estimatedProtein: 0,
        estimatedCarbs: 0,
        estimatedFat: 10
      }
    ];
  }
  return estimateFromMock(text || "Alimento variado");
}
async function generateRecipeWithAI(params) {
  const { remainingCalories, remainingMacros, ingredientsAvailable, goal } = params;
  if (config.geminiApiKey) {
    try {
      const prompt = `Crea una receta deliciosa y f\xE1cil adaptada al objetivo "${goal}".
Calor\xEDas restantes objetivo: ${remainingCalories} kcal.
Macros restantes objetivo: ${remainingMacros.protein}g prote\xEDna, ${remainingMacros.carbs}g carbohidratos, ${remainingMacros.fat}g grasas.
Ingredientes disponibles que el usuario tiene: ${ingredientsAvailable || "despensa general saludable"}.

Responde \xDANICAMENTE con un JSON estructurado as\xED:
{
  "title": "Nombre de la receta",
  "description": "Breve descripci\xF3n apetitosa de 1 o 2 oraciones",
  "prepTimeMinutes": 20,
  "portions": 1,
  "ingredients": [
    { "name": "Nombre ingrediente", "grams": 150, "calories": 200, "protein": 30, "carbs": 0, "fat": 8 }
  ],
  "steps": [
    "Paso 1...",
    "Paso 2..."
  ],
  "caloriesPerPortion": 450,
  "macrosPerPortion": { "protein": 38, "carbs": 42, "fat": 12 }
}`;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      if (res.ok) {
        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.title && Array.isArray(parsed.ingredients)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error in recipe generation with Gemini:", e);
    }
  }
  const cals = Math.max(300, Math.min(850, Math.round(remainingCalories || 480)));
  const p = Math.max(20, Math.min(60, Math.round(remainingMacros.protein || 35)));
  const c = Math.max(20, Math.min(90, Math.round(remainingMacros.carbs || 45)));
  const f = Math.max(8, Math.min(30, Math.round(remainingMacros.fat || 14)));
  return {
    title: "Bowl Mediterr\xE1neo de Pollo Dorado y Quinoa",
    description: "Plato equilibrado y nutritivo, dise\xF1ado especialmente para cuadrar tus calor\xEDas y macronutrientes restantes de hoy.",
    prepTimeMinutes: 18,
    portions: 1,
    ingredients: [
      { name: "Pechuga de pollo en tiras", grams: 150, calories: 248, protein: 46.5, carbs: 0, fat: 5.4 },
      { name: "Quinoa cocida", grams: 120, calories: 144, protein: 5.3, carbs: 25.6, fat: 2.3 },
      { name: "Tomates cherry", grams: 80, calories: 14, protein: 0.7, carbs: 3.1, fat: 0.2 },
      { name: "Aguacate en dados", grams: 40, calories: 64, protein: 0.8, carbs: 3.4, fat: 6 },
      { name: "Aceite de oliva virgen extra", grams: 8, calories: 71, protein: 0, carbs: 0, fat: 8 }
    ],
    steps: [
      "Sazona las tiras de pechuga de pollo con sal, pimienta negra y un toque de or\xE9gano o piment\xF3n.",
      "Calienta una sart\xE9n antiadherente con la mitad del aceite de oliva y dora el pollo a fuego medio-alto durante 6 a 8 minutos hasta que est\xE9 bien cocido y jugoso.",
      "En un bowl amplio, sirve la base de quinoa templada o a temperatura ambiente.",
      "A\xF1ade el pollo dorado, los tomates cherry partidos por la mitad y el aguacate en cubitos.",
      "Roc\xEDa con el resto de aceite de oliva, unas gotas de lim\xF3n y sirve inmediatamente."
    ],
    caloriesPerPortion: cals,
    macrosPerPortion: { protein: p, carbs: c, fat: f }
  };
}
async function generateMealPlanWithAI(params) {
  const { targetCalories, targetMacros, goal } = params;
  const breakfastCals = Math.round(targetCalories * 0.25);
  const lunchCals = Math.round(targetCalories * 0.35);
  const snackCals = Math.round(targetCalories * 0.15);
  const dinnerCals = Math.round(targetCalories * 0.25);
  return {
    summary: `Plan diario adaptado para ${goal === "lose" ? "d\xE9ficit cal\xF3rico y p\xE9rdida de grasa" : goal === "gain" ? "super\xE1vit y ganancia muscular" : "mantenimiento"} con un balance \xF3ptimo de micronutrientes y saciedad.`,
    meals: [
      {
        type: "desayuno",
        title: "Tostada de Centeno con Huevos Revueltos y Fruta",
        description: "Energ\xEDa sostenida y alto poder saciante para comenzar el d\xEDa sin picos de insulina.",
        calories: breakfastCals,
        macros: {
          protein: Math.round(targetMacros.protein * 0.25),
          carbs: Math.round(targetMacros.carbs * 0.25),
          fat: Math.round(targetMacros.fat * 0.25)
        },
        foods: [
          { name: "Huevos enteros camperos", grams: 120, calories: 186, protein: 15.6, carbs: 1.3, fat: 13.2 },
          { name: "Pan 100% integral o de centeno", grams: 60, calories: 150, protein: 6.6, carbs: 26.4, fat: 1.8 },
          { name: "Pl\xE1tano en rodajas", grams: 100, calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
          { name: "Caf\xE9 o infusi\xF3n sin az\xFAcar", grams: 150, calories: 2, protein: 0.1, carbs: 0.2, fat: 0 }
        ],
        alternatives: [
          {
            title: "Bowl de avena con yogur griego, canela y frutos rojos",
            calories: breakfastCals,
            macros: {
              protein: Math.round(targetMacros.protein * 0.25),
              carbs: Math.round(targetMacros.carbs * 0.25),
              fat: Math.round(targetMacros.fat * 0.25)
            }
          },
          {
            title: "Tortilla de claras y espinacas con pan de espelta y aguacate",
            calories: breakfastCals,
            macros: {
              protein: Math.round(targetMacros.protein * 0.28),
              carbs: Math.round(targetMacros.carbs * 0.22),
              fat: Math.round(targetMacros.fat * 0.22)
            }
          }
        ]
      },
      {
        type: "comida",
        title: "Pechuga de Pollo Asada con Arroz Integral y Verduras",
        description: "Comida rica en prote\xEDnas magras y carbohidratos complejos para reponer gluc\xF3geno.",
        calories: lunchCals,
        macros: {
          protein: Math.round(targetMacros.protein * 0.35),
          carbs: Math.round(targetMacros.carbs * 0.35),
          fat: Math.round(targetMacros.fat * 0.35)
        },
        foods: [
          { name: "Pechuga de pollo a la plancha", grams: 180, calories: 297, protein: 55.8, carbs: 0, fat: 6.5 },
          { name: "Arroz integral cocido", grams: 180, calories: 216, protein: 4.5, carbs: 46, fat: 1.6 },
          { name: "Br\xF3coli y zanahoria al vapor", grams: 150, calories: 52, protein: 3.5, carbs: 9.8, fat: 0.5 },
          { name: "Aceite de oliva virgen extra", grams: 10, calories: 88, protein: 0, carbs: 0, fat: 10 }
        ],
        alternatives: [
          {
            title: "Salm\xF3n al horno con patata asada y ensalada verde",
            calories: lunchCals,
            macros: {
              protein: Math.round(targetMacros.protein * 0.33),
              carbs: Math.round(targetMacros.carbs * 0.32),
              fat: Math.round(targetMacros.fat * 0.4)
            }
          },
          {
            title: "Lentejas estofadas con verduras y solomillo de pavo",
            calories: lunchCals,
            macros: {
              protein: Math.round(targetMacros.protein * 0.38),
              carbs: Math.round(targetMacros.carbs * 0.36),
              fat: Math.round(targetMacros.fat * 0.24)
            }
          }
        ]
      },
      {
        type: "merienda",
        title: "Yogur Griego con Manzana y Nueces",
        description: "Snack saciante de digesti\xF3n lenta rico en probi\xF3ticos y \xE1cidos grasos esenciales.",
        calories: snackCals,
        macros: {
          protein: Math.round(targetMacros.protein * 0.15),
          carbs: Math.round(targetMacros.carbs * 0.15),
          fat: Math.round(targetMacros.fat * 0.15)
        },
        foods: [
          { name: "Yogur griego natural 0% o regular", grams: 150, calories: 120, protein: 12, carbs: 6, fat: 4.5 },
          { name: "Manzana en dados con canela", grams: 120, calories: 62, protein: 0.4, carbs: 16, fat: 0.2 },
          { name: "Nueces peladas", grams: 15, calories: 98, protein: 2.3, carbs: 2.1, fat: 9.8 }
        ],
        alternatives: [
          {
            title: "Batido de prote\xEDna con leche vegetal y pu\xF1ado de almendras",
            calories: snackCals,
            macros: {
              protein: Math.round(targetMacros.protein * 0.2),
              carbs: Math.round(targetMacros.carbs * 0.1),
              fat: Math.round(targetMacros.fat * 0.15)
            }
          },
          {
            title: "Tortitas de arroz con reques\xF3n y frutos rojos",
            calories: snackCals,
            macros: {
              protein: Math.round(targetMacros.protein * 0.14),
              carbs: Math.round(targetMacros.carbs * 0.18),
              fat: Math.round(targetMacros.fat * 0.1)
            }
          }
        ]
      },
      {
        type: "cena",
        title: "Lubina o Merluza con Crema de Calabac\xEDn y Patata Ligera",
        description: "Cena digestiva y rica en amino\xE1cidos para favorecer la recuperaci\xF3n nocturna.",
        calories: dinnerCals,
        macros: {
          protein: Math.round(targetMacros.protein * 0.25),
          carbs: Math.round(targetMacros.carbs * 0.25),
          fat: Math.round(targetMacros.fat * 0.25)
        },
        foods: [
          { name: "Lomo de merluza o lubina al horno", grams: 180, calories: 160, protein: 32, carbs: 0, fat: 3.2 },
          { name: "Crema casera de calabac\xEDn y puerro", grams: 250, calories: 95, protein: 3, carbs: 12, fat: 3.5 },
          { name: "Patata peque\xF1a cocida o al vapor", grams: 120, calories: 92, protein: 2.4, carbs: 20.4, fat: 0.1 },
          { name: "Aceite de oliva virgen extra", grams: 8, calories: 71, protein: 0, carbs: 0, fat: 8 }
        ],
        alternatives: [
          {
            title: "Ensalada tibia de quinoa, can\xF3nigos, at\xFAn claro y huevo poch\xE9",
            calories: dinnerCals,
            macros: {
              protein: Math.round(targetMacros.protein * 0.26),
              carbs: Math.round(targetMacros.carbs * 0.24),
              fat: Math.round(targetMacros.fat * 0.26)
            }
          },
          {
            title: "Hamburguesa casera de pavo con esp\xE1rragos trigueros a la parrilla",
            calories: dinnerCals,
            macros: {
              protein: Math.round(targetMacros.protein * 0.3),
              carbs: Math.round(targetMacros.carbs * 0.18),
              fat: Math.round(targetMacros.fat * 0.25)
            }
          }
        ]
      }
    ],
    groceryList: [
      {
        category: "Carnicer\xEDa y Pescader\xEDa",
        items: [
          { name: "Pechuga de pollo fresca", quantity: "500 g", checked: false },
          { name: "Lomos de merluza o lubina", quantity: "360 g", checked: false },
          { name: "Huevos camperos (docena)", quantity: "1 caja", checked: false }
        ]
      },
      {
        category: "Frutas y Verduras",
        items: [
          { name: "Pl\xE1tanos maduros", quantity: "4 unidades", checked: false },
          { name: "Manzanas Golden o Fuji", quantity: "4 unidades", checked: false },
          { name: "Br\xF3coli fresco", quantity: "1 pieza (400g)", checked: false },
          { name: "Calabacines", quantity: "2 unidades", checked: false },
          { name: "Zanahorias y puerro", quantity: "1 manojo", checked: false },
          { name: "Patatas de guarnici\xF3n", quantity: "1 kg", checked: false }
        ]
      },
      {
        category: "L\xE1cteos y Refrigerados",
        items: [
          { name: "Yogur griego natural sin az\xFAcares a\xF1adidos", quantity: "4 tarrinas", checked: false }
        ]
      },
      {
        category: "Despensa y Granos",
        items: [
          { name: "Pan 100% integral de centeno en rebanadas", quantity: "1 hogaza", checked: false },
          { name: "Arroz integral", quantity: "500 g", checked: false },
          { name: "Nueces peladas naturales", quantity: "150 g", checked: false },
          { name: "Aceite de oliva virgen extra", quantity: "1 botella", checked: true }
        ]
      }
    ]
  };
}

// server/services/usdaService.ts
async function searchUSDA(query) {
  try {
    const encoded = encodeURIComponent(query);
    const apiKey = config.usdaApiKey || "DEMO_KEY";
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encoded}&pageSize=5&api_key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    if (!data.foods || !Array.isArray(data.foods)) return [];
    const results = [];
    for (const food of data.foods) {
      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      if (Array.isArray(food.foodNutrients)) {
        for (const n of food.foodNutrients) {
          const name = (n.nutrientName || "").toLowerCase();
          const number = n.nutrientNumber;
          const val = Number(n.value || 0);
          if (number === "1008" || name.includes("energy") || name.includes("calorie")) {
            if (n.unitName === "KCAL" || !calories) calories = Math.round(val);
          } else if (number === "1003" || name.includes("protein")) {
            protein = Number(val.toFixed(1));
          } else if (number === "1005" || name.includes("carbohydrate")) {
            carbs = Number(val.toFixed(1));
          } else if (number === "1004" || name.includes("total lipid") || name === "fat") {
            fat = Number(val.toFixed(1));
          }
        }
      }
      if (calories > 0 || protein > 0 || carbs > 0 || fat > 0) {
        results.push({
          name: food.description || query,
          brand: food.brandOwner,
          caloriesPer100g: calories,
          proteinPer100g: protein,
          carbsPer100g: carbs,
          fatPer100g: fat,
          source: "USDA"
        });
      }
    }
    return results;
  } catch (error) {
    console.error("Error querying USDA:", error);
    return [];
  }
}

// server/routes/ai.ts
var aiRouter = Router2();
aiRouter.post("/analyze-food", async (req, res) => {
  try {
    const { imageBase64, text } = req.body;
    if (!imageBase64 && (!text || !text.trim())) {
      return res.status(400).json({ error: "Debes proporcionar una imagen o texto para analizar." });
    }
    const detectedItems = await analyzeFoodWithAI({ imageBase64, text });
    const verifiedFoods = await Promise.all(
      detectedItems.map(async (item) => {
        const grams = Math.max(1, Math.round(item.estimatedGrams || 100));
        let matched100g = null;
        const offMatches = await searchOpenFoodFacts(item.name);
        if (offMatches.length > 0) {
          matched100g = offMatches[0];
        } else {
          const usdaMatches = await searchUSDA(item.name);
          if (usdaMatches.length > 0) {
            matched100g = usdaMatches[0];
          }
        }
        if (matched100g) {
          const factor = grams / 100;
          return {
            id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: matched100g.name || item.name,
            grams,
            calories: Math.round(matched100g.caloriesPer100g * factor),
            protein: Number((matched100g.proteinPer100g * factor).toFixed(1)),
            carbs: Number((matched100g.carbsPer100g * factor).toFixed(1)),
            fat: Number((matched100g.fatPer100g * factor).toFixed(1)),
            source: matched100g.source,
            isEstimated: false
          };
        }
        return {
          id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: item.name,
          grams,
          calories: Math.round(item.estimatedCalories || 100),
          protein: Number((item.estimatedProtein || 5).toFixed(1)),
          carbs: Number((item.estimatedCarbs || 10).toFixed(1)),
          fat: Number((item.estimatedFat || 3).toFixed(1)),
          source: "Estimado por IA",
          isEstimated: true
        };
      })
    );
    return res.json({ foods: verifiedFoods });
  } catch (error) {
    console.error("Error analyzing food:", error);
    return res.status(500).json({ error: "Error al procesar el an\xE1lisis de alimentos con IA" });
  }
});
aiRouter.post("/generate-recipe", async (req, res) => {
  try {
    const { remainingCalories, remainingMacros, ingredientsAvailable, goal } = req.body;
    const recipe = await generateRecipeWithAI({
      remainingCalories: Number(remainingCalories || 500),
      remainingMacros: remainingMacros || { protein: 30, carbs: 50, fat: 15 },
      ingredientsAvailable: ingredientsAvailable || "",
      goal: goal || "maintain"
    });
    return res.json({ recipe });
  } catch (error) {
    console.error("Error in generate-recipe route:", error);
    return res.status(500).json({ error: "Error al generar la receta con IA" });
  }
});
aiRouter.post("/generate-meal-plan", async (req, res) => {
  try {
    const { targetCalories, targetMacros, goal } = req.body;
    const plan = await generateMealPlanWithAI({
      targetCalories: Number(targetCalories || 2e3),
      targetMacros: targetMacros || { protein: 140, carbs: 220, fat: 60 },
      goal: goal || "maintain"
    });
    return res.json({ plan });
  } catch (error) {
    console.error("Error in generate-meal-plan route:", error);
    return res.status(500).json({ error: "Error al generar el plan de comidas" });
  }
});

// server/routes/auth.ts
import { Router as Router3 } from "express";

// server/db/database.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var PROJECT_ROOT = fs.existsSync(path.join(__dirname, "..", "package.json")) ? path.resolve(__dirname, "..") : fs.existsSync(path.join(__dirname, "package.json")) ? __dirname : path.resolve(process.cwd());
var DATA_DIR = path.resolve(PROJECT_ROOT, "server", "data");
var DB_FILE = path.join(DATA_DIR, "nutrifit.json");
var Database = class {
  data;
  constructor() {
    this.data = this.loadData();
  }
  loadData() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error("[DB] Error al cargar la base de datos local:", e);
    }
    return {
      users: [],
      profiles: {},
      foodEntries: {},
      waterLogs: {},
      weightLogs: {},
      recipes: {},
      mealPlans: {}
    };
  }
  persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), "utf-8");
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error("[DB] Error al guardar datos en disco:", e);
    }
  }
  hashPassword(password) {
    return crypto.createHash("sha256").update(password.trim()).digest("hex");
  }
  // --- Users ---
  findUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }
  findUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }
  createUser(params) {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user = {
      id,
      email: params.email.trim().toLowerCase(),
      name: params.name.trim(),
      provider: params.provider,
      avatarUrl: params.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.name)}`,
      hasCompletedAssessment: Boolean(params.hasCompletedAssessment),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      ...params.password ? { passwordHash: this.hashPassword(params.password) } : {}
    };
    this.data.users.push(user);
    this.data.foodEntries[id] = [];
    this.data.waterLogs[id] = {};
    this.data.weightLogs[id] = [];
    this.data.recipes[id] = [];
    this.persist();
    return user;
  }
  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    this.persist();
    return user;
  }
  // --- User Nutrition Data ---
  getUserData(userId) {
    return {
      profile: this.data.profiles[userId] || null,
      foodEntries: this.data.foodEntries[userId] || [],
      waterLogs: this.data.waterLogs[userId] || {},
      weightLogs: this.data.weightLogs[userId] || [],
      recipes: this.data.recipes[userId] || [],
      mealPlan: this.data.mealPlans[userId] || null
    };
  }
  saveProfile(userId, profile) {
    this.data.profiles[userId] = profile;
    const user = this.findUserById(userId);
    if (user && !user.hasCompletedAssessment) {
      user.hasCompletedAssessment = true;
    }
    this.persist();
    return profile;
  }
  saveFoodEntry(userId, entry) {
    if (!this.data.foodEntries[userId]) this.data.foodEntries[userId] = [];
    const index = this.data.foodEntries[userId].findIndex((e) => e.id === entry.id);
    if (index >= 0) {
      this.data.foodEntries[userId][index] = entry;
    } else {
      this.data.foodEntries[userId].push(entry);
    }
    this.persist();
    return entry;
  }
  deleteFoodEntry(userId, entryId) {
    if (!this.data.foodEntries[userId]) return false;
    this.data.foodEntries[userId] = this.data.foodEntries[userId].filter((e) => e.id !== entryId);
    this.persist();
    return true;
  }
  saveWater(userId, date, amountMl) {
    if (!this.data.waterLogs[userId]) this.data.waterLogs[userId] = {};
    this.data.waterLogs[userId][date] = amountMl;
    this.persist();
    return amountMl;
  }
  saveWeightLog(userId, log) {
    if (!this.data.weightLogs[userId]) this.data.weightLogs[userId] = [];
    const index = this.data.weightLogs[userId].findIndex((l) => l.id === log.id || l.date === log.date);
    if (index >= 0) {
      this.data.weightLogs[userId][index] = log;
    } else {
      this.data.weightLogs[userId].push(log);
    }
    this.persist();
    return log;
  }
  saveRecipe(userId, recipe) {
    if (!this.data.recipes[userId]) this.data.recipes[userId] = [];
    const index = this.data.recipes[userId].findIndex((r) => r.id === recipe.id);
    if (index >= 0) {
      this.data.recipes[userId][index] = recipe;
    } else {
      this.data.recipes[userId].push(recipe);
    }
    this.persist();
    return recipe;
  }
  deleteRecipe(userId, recipeId) {
    if (!this.data.recipes[userId]) return false;
    this.data.recipes[userId] = this.data.recipes[userId].filter((r) => r.id !== recipeId);
    this.persist();
    return true;
  }
  saveMealPlan(userId, plan) {
    this.data.mealPlans[userId] = plan;
    this.persist();
    return plan;
  }
};
var db = new Database();

// server/routes/auth.ts
var authRouter = Router3();
function parseGoogleJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = Buffer.from(parts[1], "base64").toString("utf-8");
      return JSON.parse(payload);
    }
  } catch (e) {
    console.warn("[Auth] No se pudo decodificar Google JWT:", e);
  }
  return null;
}
authRouter.post("/register", (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Introduce un correo electr\xF3nico v\xE1lido." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "La contrase\xF1a debe tener al menos 6 caracteres." });
    }
    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Ya existe una cuenta registrada con este correo. Inicia sesi\xF3n." });
    }
    const user = db.createUser({
      email,
      name: name || email.split("@")[0],
      provider: "email",
      password,
      hasCompletedAssessment: false
    });
    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      user: safeUser,
      token: `token_${safeUser.id}_${Date.now()}`
    });
  } catch (error) {
    console.error("[Auth] Error en registro:", error);
    return res.status(500).json({ error: "Error al registrar usuario." });
  }
});
authRouter.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Introduce tu correo y contrase\xF1a." });
    }
    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "No existe una cuenta con este correo. Reg\xEDstrate primero." });
    }
    if (user.provider === "email") {
      const hash = db.hashPassword(password);
      if (user.passwordHash !== hash) {
        return res.status(401).json({ error: "Contrase\xF1a incorrecta. Int\xE9ntalo de nuevo." });
      }
    }
    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      user: safeUser,
      token: `token_${safeUser.id}_${Date.now()}`
    });
  } catch (error) {
    console.error("[Auth] Error en login:", error);
    return res.status(500).json({ error: "Error al iniciar sesi\xF3n." });
  }
});
authRouter.post("/google", (req, res) => {
  try {
    const { credential, email, name, avatarUrl } = req.body;
    let userEmail = email;
    let userName = name;
    let userAvatar = avatarUrl;
    if (credential) {
      const decoded = parseGoogleJwt(credential);
      if (decoded && decoded.email) {
        userEmail = decoded.email;
        userName = decoded.name || decoded.given_name || userEmail.split("@")[0];
        userAvatar = decoded.picture;
      }
    }
    if (!userEmail || !userEmail.includes("@")) {
      return res.status(400).json({ error: "No se recibieron datos de cuenta de Google v\xE1lidos." });
    }
    let user = db.findUserByEmail(userEmail);
    if (!user) {
      user = db.createUser({
        email: userEmail,
        name: userName || userEmail.split("@")[0],
        provider: "google",
        avatarUrl: userAvatar,
        hasCompletedAssessment: false
      });
    } else {
      user = db.updateUser(user.id, {
        provider: "google",
        name: userName || user.name,
        avatarUrl: userAvatar || user.avatarUrl
      }) || user;
    }
    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      user: safeUser,
      token: `token_${safeUser.id}_${Date.now()}`
    });
  } catch (error) {
    console.error("[Auth] Error en login con Google:", error);
    return res.status(500).json({ error: "Error al autenticar con Google." });
  }
});
authRouter.post("/samsung", (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Introduce una cuenta Samsung v\xE1lida." });
    }
    let user = db.findUserByEmail(email);
    if (!user) {
      user = db.createUser({
        email,
        name: name || email.split("@")[0],
        provider: "samsung",
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
        hasCompletedAssessment: false
      });
    }
    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      user: safeUser,
      token: `token_${safeUser.id}_${Date.now()}`
    });
  } catch (error) {
    console.error("[Auth] Error en login con Samsung:", error);
    return res.status(500).json({ error: "Error al autenticar con Samsung Account." });
  }
});
authRouter.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  const userId = req.headers["x-user-id"];
  if (userId) {
    const user = db.findUserById(userId);
    if (user) {
      const { passwordHash, ...safeUser } = user;
      return res.json({ user: safeUser });
    }
  }
  return res.status(401).json({ error: "No autenticado." });
});

// server/routes/userData.ts
import { Router as Router4 } from "express";
var userDataRouter = Router4();
function getUserId(req) {
  const userId = req.headers["x-user-id"];
  if (userId) return userId;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer token_")) {
    const parts = auth.split("_");
    if (parts.length >= 2) return parts[1];
  }
  return null;
}
userDataRouter.get("/all", (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const data = db.getUserData(userId);
  return res.json(data);
});
userDataRouter.post("/profile", (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const profile = req.body;
  const saved = db.saveProfile(userId, profile);
  return res.json({ success: true, profile: saved });
});
userDataRouter.post("/food", (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const entry = req.body;
  if (!entry.id) {
    entry.id = `food_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }
  const saved = db.saveFoodEntry(userId, entry);
  return res.json({ success: true, entry: saved });
});
userDataRouter.delete("/food/:id", (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const { id } = req.params;
  const ok = db.deleteFoodEntry(userId, id);
  return res.json({ success: ok });
});
userDataRouter.post("/water", (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const { date, amountMl } = req.body;
  db.saveWater(userId, date, amountMl);
  return res.json({ success: true, date, amountMl });
});
userDataRouter.post("/weight", (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const log = req.body;
  if (!log.id) {
    log.id = `wt_${Date.now()}`;
  }
  const saved = db.saveWeightLog(userId, log);
  return res.json({ success: true, log: saved });
});
userDataRouter.post("/recipe", (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const recipe = req.body;
  if (!recipe.id) {
    recipe.id = `rec_${Date.now()}`;
  }
  const saved = db.saveRecipe(userId, recipe);
  return res.json({ success: true, recipe: saved });
});
userDataRouter.delete("/recipe/:id", (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const { id } = req.params;
  const ok = db.deleteRecipe(userId, id);
  return res.json({ success: ok });
});

// server/index.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var app = express();
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use("/api/auth", authRouter);
app.use("/api/user", userDataRouter);
app.use("/api/food", foodRouter);
app.use("/api/ai", aiRouter);
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    aiProvider: config.aiProvider,
    hasGeminiKey: Boolean(config.geminiApiKey),
    hasOpenAIKey: Boolean(config.openaiApiKey),
    hasClaudeKey: Boolean(config.anthropicApiKey)
  });
});
var possiblePaths = [
  path2.resolve(process.cwd(), "dist"),
  path2.resolve(__dirname2, "..", "dist"),
  path2.resolve(__dirname2, "dist"),
  path2.resolve(__dirname2)
];
var distPath = possiblePaths.find((p) => fs2.existsSync(path2.join(p, "index.html"))) || path2.resolve(process.cwd(), "dist");
if (fs2.existsSync(distPath) && fs2.existsSync(path2.join(distPath, "index.html"))) {
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }
    }
  }));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/assets") || req.path.includes(".")) {
      return res.status(404).json({ error: "Recurso no encontrado" });
    }
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path2.join(distPath, "index.html"));
  });
} else {
  console.warn("[NutriFit] Advertencia: No se encontr\xF3 index.html en", distPath);
}
app.listen(config.port, "0.0.0.0", () => {
  console.log(`[NutriFit] Servidor activo en http://127.0.0.1:${config.port}`);
  console.log(`[NutriFit] Proveedor de IA: ${config.aiProvider.toUpperCase()}`);
});
