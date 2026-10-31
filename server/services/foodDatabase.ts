import { FoodNutrients100g } from './openFoodFactsService';
import { FULL_SPANISH_CATALOG, BrandedFoodItem } from './foodCatalogData';

export type { BrandedFoodItem };

// In-memory cache for dynamic AI estimations and user-added foods
const DYNAMIC_FOOD_CACHE: BrandedFoodItem[] = [];

// Helper to remove accents and special characters
export function normalizeStr(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[·.,;:!?'"()\[\]{}]/g, ' ')
    .trim();
}

// Supermarket brand aliases mapping
export const BRAND_ALIASES: Record<string, string[]> = {
  mercadona: ['hacendado', 'deliplus', 'mercadona'],
  hacendado: ['hacendado', 'mercadona'],
  deliplus: ['deliplus', 'mercadona'],
  lidl: ['milbona', 'lidl'],
  milbona: ['milbona', 'lidl'],
  bonpreu: ['bonpreu', 'esclat'],
  esclat: ['bonpreu', 'esclat'],
  carrefour: ['carrefour'],
  dia: ['dia'],
  eroski: ['eroski'],
  alcampo: ['alcampo', 'auchan'],
  auchan: ['alcampo', 'auchan'],
  consum: ['consum'],
  condis: ['condis'],
  bimbo: ['bimbo'],
  danone: ['danone'],
  pascual: ['pascual'],
  asturiana: ['central lechera asturiana', 'asturiana'],
  calvo: ['calvo'],
  sos: ['sos'],
  heura: ['heura'],
  oatly: ['oatly'],
  alpro: ['alpro'],
};

// Word variants / lemmatization dictionary
export const STEM_DICTIONARY: Record<string, string> = {
  huevos: 'huevo', huebo: 'huevo', huebos: 'huevo', ou: 'huevo', ous: 'huevo',
  frita: 'frito', fritos: 'frito', fritas: 'frito', ferrat: 'frito', ferrats: 'frito', fregit: 'frito', fregits: 'frito',
  cocida: 'cocido', cocidos: 'cocido', cocidas: 'cocido', cuit: 'cocido', cuits: 'cocido', bullit: 'cocido', bullits: 'cocido', duro: 'cocido', duros: 'cocido',
  patatas: 'patata', papas: 'patata', papa: 'patata', patates: 'patata',
  croquetas: 'croqueta', croquetes: 'croqueta', croketa: 'croqueta', croketas: 'croqueta',
  lentejas: 'lenteja', llenties: 'llentia',
  alubias: 'alubia', mongetes: 'mongeta', judias: 'alubia', mongeta: 'mongeta',
  garbanzos: 'garbanzo', cigrons: 'cigro',
  ensaimadas: 'ensaimada', ensaimades: 'ensaimada', ensaimda: 'ensaimada',
  calamares: 'calamar', calamars: 'calamar',
  fresas: 'fresa', maduixes: 'maduixa',
  platanos: 'platano', platans: 'platan', banana: 'platano', bananas: 'platano',
  manzanas: 'manzana', poma: 'manzana', pomes: 'manzana',
  naranjas: 'naranja', taronja: 'naranja', taronges: 'naranja',
  leches: 'leche', llet: 'leche', llets: 'leche',
  pollos: 'pollo', pollastre: 'pollo', pollastres: 'pollo', pit: 'pechuga',
  arroces: 'arroz', arros: 'arroz', arrossos: 'arroz',
  panes: 'pan', pa: 'pan',
  tomates: 'tomate', tomaquet: 'tomate', tomacons: 'tomate',
  aceites: 'aceite', oli: 'aceite', olis: 'aceite', aove: 'aceite',
};

export function getCanonical(word: string): string {
  const norm = normalizeStr(word);
  return STEM_DICTIONARY[norm] || norm;
}

export function matchesToken(candidateWords: string[], queryToken: string): boolean {
  const qCanon = getCanonical(queryToken);

  for (const cWord of candidateWords) {
    const cCanon = getCanonical(cWord);
    if (cCanon === qCanon || cWord === queryToken) return true;
    if (cCanon.startsWith(qCanon) && qCanon.length >= 4) return true;
    if (qCanon.startsWith(cCanon) && cCanon.length >= 4) return true;
  }
  return false;
}

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], prev, row[j]) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

// Register a newly estimated food from AI or custom food from user
export function registerDynamicFood(food: BrandedFoodItem) {
  const normName = normalizeStr(food.name);
  const exists = [...DYNAMIC_FOOD_CACHE, ...FULL_SPANISH_CATALOG].some(
    f => normalizeStr(f.name) === normName
  );
  if (!exists) {
    DYNAMIC_FOOD_CACHE.unshift(food);
  }
}

// Strict filter for external items (Open Food Facts & USDA)
export function filterExternalFoodStrict(item: FoodNutrients100g, rawQuery: string): boolean {
  const normQuery = normalizeStr(rawQuery);
  const stopWords = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'al', 'en', 'para', 'y', 'amb', 'd', 'dels', 'les', 'sabor', 'con']);

  const rawTokens = normQuery.split(/\s+/).filter(Boolean);
  const meaningfulTokens = rawTokens.filter(t => !stopWords.has(t));
  const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

  const nameNorm = normalizeStr(item.name);
  const brandNorm = normalizeStr(item.brand || '');
  const allText = `${nameNorm} ${brandNorm}`;
  const candidateWords = allText.split(/\s+/).filter(Boolean);

  // Flavor penalty check
  const isFlavorProduct = (nameNorm.includes('sabor ') || nameNorm.includes('patatas fritas sabor') || nameNorm.includes('chips sabor'));
  const userSearchedFlavorOrSnack = normQuery.includes('sabor') || normQuery.includes('patatas') || normQuery.includes('chips');
  if (isFlavorProduct && !userSearchedFlavorOrSnack) return false;

  // Cooking method check
  const cookingMethods = ['frito', 'cocido', 'plancha', 'asado', 'crudo', 'hervido'];
  const requestedCookingMethod = tokens.map(getCanonical).find(t => cookingMethods.includes(t));
  if (requestedCookingMethod) {
    const itemHasCooking = candidateWords.map(getCanonical).includes(requestedCookingMethod);
    if (!itemHasCooking) return false;
  }

  // ALL tokens must be matched
  for (const tok of tokens) {
    const matched = matchesToken(candidateWords, tok);
    if (!matched) return false;
  }

  return true;
}

export function searchLocalFoodDatabase(rawQuery: string): FoodNutrients100g[] {
  const query = rawQuery.trim();
  if (!query) return [];

  const normQuery = normalizeStr(query);
  const stopWords = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'al', 'en', 'para', 'y', 'amb', 'd', 'dels', 'les', 'sabor', 'con']);

  const rawTokens = normQuery.split(/\s+/).filter(Boolean);
  const meaningfulTokens = rawTokens.filter(t => !stopWords.has(t));
  const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

  // Detect brand in query
  let brandIntent: string | null = null;
  for (const tok of tokens) {
    if (BRAND_ALIASES[tok]) {
      brandIntent = tok;
      break;
    }
  }

  // Non-brand tokens
  const nonBrandTokens = brandIntent ? tokens.filter(t => t !== brandIntent) : tokens;

  // Cooking methods in query
  const cookingMethods = ['frito', 'cocido', 'plancha', 'asado', 'crudo', 'hervido'];
  const requestedCookingMethod = tokens.map(getCanonical).find(t => cookingMethods.includes(t));

  const allItems = [...DYNAMIC_FOOD_CACHE, ...FULL_SPANISH_CATALOG];
  const candidates: Array<{ item: BrandedFoodItem; score: number }> = [];

  for (const item of allItems) {
    const nameNorm = normalizeStr(item.name);
    const nameCaNorm = item.nameCa ? normalizeStr(item.nameCa) : '';
    const brandNorm = normalizeStr(item.brand || '');
    const searchTerms = (item.popularSearchTerms || []).map(normalizeStr);

    const allCandidateText = [nameNorm, nameCaNorm, ...searchTerms].join(' ');
    const candidateWords = allCandidateText.split(/\s+/).filter(Boolean);

    // 1. Strict Brand Match if brand was in query
    let brandMatched = true;
    if (brandIntent) {
      const allowedBrands = BRAND_ALIASES[brandIntent] || [brandIntent];
      const matchBrandField = allowedBrands.some(b => brandNorm.includes(b));
      const matchNameField = allowedBrands.some(b => nameNorm.includes(b) || searchTerms.some(st => st.includes(b)));
      if (!matchBrandField && !matchNameField) {
        brandMatched = false;
      }
    }

    if (!brandMatched) continue;

    // 2. Strict Token Match: ALL non-brand tokens must be present!
    let allTokensMatched = true;
    for (const tok of nonBrandTokens) {
      const matched = matchesToken(candidateWords, tok);
      if (!matched) {
        allTokensMatched = false;
        break;
      }
    }

    // Fuzzy check for typos (words >= 4 chars, max distance 1)
    if (!allTokensMatched && tokens.length <= 2) {
      let fuzzyAll = true;
      for (const tok of nonBrandTokens) {
        let tokFuzzy = false;
        if (tok.length >= 4) {
          for (const cw of candidateWords) {
            if (cw.length >= 4 && Math.abs(cw.length - tok.length) <= 1) {
              if (levenshteinDistance(tok, cw) <= 1) {
                tokFuzzy = true;
                break;
              }
            }
          }
        }
        if (!tokFuzzy) {
          fuzzyAll = false;
          break;
        }
      }
      if (fuzzyAll) allTokensMatched = true;
    }

    if (!allTokensMatched) continue; // STRICT DISCARD!

    // 3. Cooking method preference:
    // If user asked "huevo frito", cooking method is "frito".
    // Discard raw egg when asking for fried egg!
    if (requestedCookingMethod) {
      const itemHasCooking = candidateWords.map(getCanonical).includes(requestedCookingMethod);
      if (!itemHasCooking) continue;
    }

    // 4. Flavor / secondary ingredient penalty:
    const isFlavorProduct = (nameNorm.includes('sabor ') || nameNorm.includes('patatas fritas sabor') || nameNorm.includes('chips sabor'));
    const userSearchedFlavorOrSnack = normQuery.includes('sabor') || normQuery.includes('patatas') || normQuery.includes('chips');

    if (isFlavorProduct && !userSearchedFlavorOrSnack) {
      continue; // Completely eliminate "patatas fritas sabor huevo frito" when searching "huevo frito"!
    }

    // 5. Score calculation
    let score = 0;

    // Check if food starts with primary non-brand query
    const primaryQuery = nonBrandTokens.join(' ');
    const startsWithPrimary = nameNorm.startsWith(primaryQuery) || nameCaNorm.startsWith(primaryQuery);
    const startsWithAnyToken = nonBrandTokens.length > 0 && (nameNorm.startsWith(nonBrandTokens[0]) || nameCaNorm.startsWith(nonBrandTokens[0]));

    // (1) Exact match with full query
    if (nameNorm === normQuery || nameCaNorm === normQuery) {
      score += 50000;
    }
    // (2) Starts with query
    else if (nameNorm.startsWith(normQuery) || nameCaNorm.startsWith(normQuery)) {
      score += 35000;
    }
    // (3) Starts with primary food terms (e.g. "Huevo frito...", "Huevos fritos...")
    else if (startsWithPrimary) {
      score += 25000;
    }
    // (4) Starts with first token
    else if (startsWithAnyToken) {
      score += 18000;
    }
    // (5) Contains query phrase inside
    else if (nameNorm.includes(normQuery) || nameCaNorm.includes(normQuery)) {
      score += 10000;
    }
    else {
      score += 5000;
    }

    // Standard version boost:
    // If no brand intent, generic standard goes first among foods of that kind!
    if (item.isStandard) {
      score += 20000; // Guaranteed Top #1 for standard generic version
    }

    // If user searched a brand, boost that brand
    if (brandIntent && (brandNorm.includes(brandIntent) || BRAND_ALIASES[brandIntent]?.some(b => brandNorm.includes(b)))) {
      score += 15000;
    }

    // Shorter name wins at equal relevance
    score += Math.max(0, 100 - item.name.length);

    candidates.push({ item, score });
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map(s => ({
      name: s.item.name,
      brand: s.item.brand,
      caloriesPer100g: s.item.caloriesPer100g,
      proteinPer100g: s.item.proteinPer100g,
      carbsPer100g: s.item.carbsPer100g,
      fatPer100g: s.item.fatPer100g,
      fiberPer100g: s.item.fiberPer100g,
      sugarPer100g: s.item.sugarPer100g,
      saltPer100g: s.item.saltPer100g,
      source: s.item.source || 'Base de datos oficial',
      barcode: s.item.barcode,
      portionName: s.item.portionName,
      portionGrams: s.item.portionGrams,
      isStandard: s.item.isStandard,
    }));
}
