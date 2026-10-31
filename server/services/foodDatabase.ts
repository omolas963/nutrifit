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

// Singular/Plural stemming dictionary for frequent terms in ES and CA
function stemToken(token: string): string {
  const t = normalizeStr(token);
  if (t.length <= 3) return t;

  // Specific irregular / frequent food plurals
  const dictionary: Record<string, string> = {
    huevos: 'huevo',
    ous: 'ou',
    patatas: 'patata',
    patates: 'patata',
    papas: 'papa',
    croquetas: 'croqueta',
    croquetes: 'croqueta',
    lentejas: 'lenteja',
    llenties: 'llentia',
    alubias: 'alubia',
    mongetes: 'mongeta',
    garbanzos: 'garbanzo',
    cigrons: 'cigro',
    ensaimadas: 'ensaimada',
    ensaimades: 'ensaimada',
    calamares: 'calamar',
    calamars: 'calamar',
    boquerones: 'boqueron',
    seitons: 'seito',
    gambas: 'gamba',
    gambes: 'gamba',
    fresas: 'fresa',
    maduixes: 'maduixa',
    platanos: 'platano',
    platans: 'platan',
    manzanas: 'manzana',
    pomes: 'poma',
    naranjas: 'naranja',
    taronges: 'taronja',
    almendras: 'almendra',
    ametlles: 'ametlla',
    nueces: 'nuez',
    nous: 'nou',
    avellanas: 'avellana',
    avellanes: 'avellana',
    esparragos: 'esparrago',
    esparrecs: 'esparrec',
    mejillones: 'mejillon',
    musclos: 'musclo',
    almejas: 'almeja',
    cloisses: 'cloissa',
    churros: 'churro',
    xurros: 'xurro',
    porras: 'porra',
    porres: 'porra',
    canelones: 'canelon',
    canelons: 'canelo',
    fideos: 'fideo',
    fideus: 'fideu',
    macarrones: 'macarron',
    macarrons: 'macarro',
    faves: 'fava',
    habas: 'haba',
    caracoles: 'caracol',
    cargols: 'cargol',
    caragols: 'caragol',
    calcots: 'calcot',
  };

  if (dictionary[t]) return dictionary[t];

  // Generic stemming
  if (t.endsWith('es') && t.length > 4) return t.slice(0, -2);
  if (t.endsWith('s') && t.length > 3) return t.slice(0, -1);
  return t;
}

// Levenshtein distance for typo tolerance
function levenshteinDistance(a: string, b: string): number {
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

export function searchLocalFoodDatabase(rawQuery: string): FoodNutrients100g[] {
  const query = rawQuery.trim();
  if (!query) return [];

  const normQuery = normalizeStr(query);
  const stopWords = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'al', 'en', 'para', 'y', 'amb', 'd', 'dels', 'les']);

  const rawTokens = normQuery.split(/\s+/).filter(Boolean);
  const meaningfulTokens = rawTokens.filter(t => !stopWords.has(t));
  const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;
  const stemmedTokens = tokens.map(stemToken);

  // Brand intent detection
  const brandKeywords = [
    'bimbo', 'mercadona', 'hacendado', 'carrefour', 'lidl', 'milbona',
    'danone', 'ortiz', 'gallo', 'pascual', 'asturiana', 'el pozo', 'campofrio',
    'calvo', 'sos', 'quaker', 'oatly', 'alpro', 'heura'
  ];
  const hasBrandIntent = brandKeywords.some(b => normQuery.includes(b));

  const allItems = [...DYNAMIC_FOOD_CACHE, ...FULL_SPANISH_CATALOG];

  const scored = allItems.map(item => {
    let score = 0;
    const nameNorm = normalizeStr(item.name);
    const nameCaNorm = item.nameCa ? normalizeStr(item.nameCa) : '';
    const brandNorm = normalizeStr(item.brand || '');
    const catNorm = normalizeStr(item.category || '');
    const searchTerms = (item.popularSearchTerms || []).map(normalizeStr);

    const targetStrings = [nameNorm, nameCaNorm, ...searchTerms].filter(Boolean);

    // 1. Exact query match on name, catalan name, or popular terms
    if (nameNorm === normQuery) score += 900;
    if (nameCaNorm === normQuery) score += 850;
    if (searchTerms.includes(normQuery)) score += 800;

    // 2. Full phrase inclusion
    for (const str of targetStrings) {
      if (str.includes(normQuery)) {
        score += 450;
        if (str.startsWith(normQuery)) score += 150;
      }
    }

    // 3. Token-by-token matching (supporting both ES and CA and stemmed words)
    let matchedTokenCount = 0;
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const stemmed = stemmedTokens[i];
      let tokenMatched = false;

      for (const str of targetStrings) {
        if (str.includes(tok) || str.includes(stemmed)) {
          score += 100;
          tokenMatched = true;
          break;
        }
      }

      if (!tokenMatched && brandNorm.includes(tok)) {
        score += 80;
        tokenMatched = true;
      }

      if (!tokenMatched && catNorm.includes(tok)) {
        score += 40;
        tokenMatched = true;
      }

      // Fuzzy check for typos (words >= 4 chars, max distance 1 or 2)
      if (!tokenMatched && tok.length >= 4) {
        for (const str of targetStrings) {
          const strWords = str.split(/\s+/);
          for (const word of strWords) {
            if (word.length >= 4 && Math.abs(word.length - tok.length) <= 2) {
              const dist = levenshteinDistance(tok, word);
              if (dist <= 1 || (tok.length >= 6 && dist <= 2)) {
                score += 85;
                tokenMatched = true;
                break;
              }
            }
          }
          if (tokenMatched) break;
        }
      }

      if (tokenMatched) matchedTokenCount++;
    }

    // All tokens match boost
    if (tokens.length > 1 && matchedTokenCount === tokens.length) {
      score += 400;
    }

    // Colloquial alias: "mercadona" matches "hacendado"
    if (normQuery.includes('mercadona') && (brandNorm.includes('hacendado') || nameNorm.includes('hacendado') || searchTerms.some(t => t.includes('mercadona')))) {
      score += 350;
    }

    // Standard version boost:
    if (item.isStandard && (matchedTokenCount > 0 || score > 0)) {
      if (!hasBrandIntent) {
        score += 350; // Top position for generic inquiries
      } else {
        score += 20;
      }
    }

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
