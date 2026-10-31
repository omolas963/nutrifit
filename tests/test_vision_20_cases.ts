import { runTwoPassFoodVision } from '../server/services/aiVisionEngine';

interface TestCase {
  id: number;
  description: string;
  query: string;
  expectedResult: {
    isFood: boolean;
    imageQuality?: string;
    shouldReject?: boolean;
    expectedItems?: string[];
    forbiddenItems?: string[];
    expectedGramsRange?: Record<string, [number, number]>;
    isOCR?: boolean;
    hasDoubtful?: boolean;
  };
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    description: 'Paella valenciana tradicional',
    query: 'paella valenciana tradicional con pollo y verduras',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Paella valenciana'],
      forbiddenItems: ['salsa barbacoa', 'ketchup', 'aceite de freir'],
      expectedGramsRange: { 'Paella valenciana': [250, 450] },
    },
  },
  {
    id: 2,
    description: 'Tortilla de patatas casera',
    query: 'trozo de tortilla de patatas casera',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Tortilla de patatas casera'],
      forbiddenItems: ['mayonesa', 'salsa brava', 'aceite residual'],
      expectedGramsRange: { 'Tortilla de patatas casera': [150, 250] },
    },
  },
  {
    id: 3,
    description: 'Lentejas estofadas',
    query: 'plato de lentejas estofadas con zanahoria',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Lentejas estofadas'],
      forbiddenItems: ['sal fina añadida'],
      expectedGramsRange: { 'Lentejas': [250, 450] },
    },
  },
  {
    id: 4,
    description: 'Cocido madrileño completo',
    query: 'plato de cocido madrileño con garbanzos y carnes',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Cocido madrileño'],
      expectedGramsRange: { 'Cocido': [300, 500] },
    },
  },
  {
    id: 5,
    description: 'Huevos fritos con patatas (estricto: sin salsa inventada)',
    query: 'dos huevos fritos con patatas fritas',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Huevo frito', 'Patatas fritas'],
      forbiddenItems: ['salsa de tomate', 'mayonesa', 'ketchup', 'aceite de freir'],
      expectedGramsRange: { 'Huevo frito': [80, 150], 'Patatas fritas': [100, 200] },
    },
  },
  {
    id: 6,
    description: 'Ensaimada de Mallorca individual',
    query: 'ensaimada mallorquina espolvoreada con azucar',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Ensaimada'],
      forbiddenItems: ['chocolate', 'nata'],
      expectedGramsRange: { 'Ensaimada': [50, 100] },
    },
  },
  {
    id: 7,
    description: 'Ensalada mixta (solo lo visible, sin aceite inventado)',
    query: 'ensalada con lechuga tomate atun y maiz',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Lechuga', 'Tomate', 'Atún', 'Maíz'],
      forbiddenItems: ['aceite de oliva virgen', 'sal añadida', 'vinagre'],
      expectedGramsRange: { 'Lechuga': [40, 120] },
    },
  },
  {
    id: 8,
    description: 'Pechuga de pollo a la plancha con arroz blanco',
    query: 'pechuga de pollo y arroz blanco cocido',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Pollo', 'Arroz'],
      forbiddenItems: ['salsa curry', 'aceite residual'],
      expectedGramsRange: { 'Pollo': [100, 200], 'Arroz': [120, 250] },
    },
  },
  {
    id: 9,
    description: 'Pasta boloñesa con queso dudoso',
    query: 'macarrones con pasta boloñesa y posible queso',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Macarrones'],
      hasDoubtful: true,
      expectedGramsRange: { 'Macarrones': [200, 400] },
    },
  },
  {
    id: 10,
    description: 'Bocadillo de jamón serrano en pan de barra',
    query: 'bocadillo de jamon serrano en media barra',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Barra', 'Jamón'],
      forbiddenItems: ['mantequilla', 'mayonesa'],
      expectedGramsRange: { 'Barra': [70, 140], 'Jamón': [40, 80] },
    },
  },
  {
    id: 11,
    description: 'Salmón a la plancha con espárragos trigueros',
    query: 'salmon a la plancha con esparragos verdes',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Salmón', 'Espárragos'],
      expectedGramsRange: { 'Salmón': [140, 220] },
    },
  },
  {
    id: 12,
    description: 'Yogur natural con plátano y nueces',
    query: 'bol de yogur natural con platano y nueces',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Yogur', 'Plátano', 'Nueces'],
      expectedGramsRange: { 'Yogur': [100, 150] },
    },
  },
  {
    id: 13,
    description: 'Gazpacho andaluz tradicional',
    query: 'vaso de gazpacho andaluz',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Gazpacho'],
      expectedGramsRange: { 'Gazpacho': [200, 300] },
    },
  },
  {
    id: 14,
    description: 'Croquetas de jamón caseras',
    query: 'cuatro croquetas de jamon caseras doradas',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Croquetas'],
      expectedGramsRange: { 'Croquetas': [120, 200] },
    },
  },
  {
    id: 15,
    description: 'Pizza margarita artesanal',
    query: 'porcion de pizza margarita con mozzarella y tomate',
    expectedResult: {
      isFood: true,
      imageQuality: 'good',
      expectedItems: ['Pizza margarita artesanal'],
      expectedGramsRange: { 'Pizza margarita artesanal': [250, 450] },
    },
  },
  {
    id: 16,
    description: 'Etiqueta nutricional de leche entera (OCR exacto)',
    query: 'etiqueta con informacion nutricional de leche entera UHT',
    expectedResult: {
      isFood: true,
      isOCR: true,
      expectedItems: ['Leche entera UHT'],
    },
  },
  {
    id: 17,
    description: 'Lata de atún en aceite con tabla nutricional (OCR exacto)',
    query: 'lata con informacion nutricional de atun en aceite de oliva',
    expectedResult: {
      isFood: true,
      isOCR: true,
      expectedItems: ['Atún claro en aceite de oliva'],
    },
  },
  {
    id: 18,
    description: 'Foto desenfocada / muy borrosa (rechazo de calidad)',
    query: 'foto muy borrosa y desenfocada del plato',
    expectedResult: {
      isFood: true,
      shouldReject: true,
      imageQuality: 'blurry',
    },
  },
  {
    id: 19,
    description: 'Foto de un escritorio sin comida (objeto no comestible)',
    query: 'mesa con ordenador teclado y boligrafo sin comida',
    expectedResult: {
      isFood: false,
      shouldReject: true,
    },
  },
  {
    id: 20,
    description: 'Foto totalmente oscura / negra (aviso de iluminación)',
    query: 'foto negra y oscura sin luz',
    expectedResult: {
      isFood: true,
      shouldReject: true,
      imageQuality: 'too_dark',
    },
  },
];

async function runAllTests() {
  console.log('================================================================');
  console.log('   SUITE DE PRUEBAS DEL NUEVO SISTEMA DE VISIÓN NUTRIFIT (20 CASOS)');
  console.log('================================================================\n');

  let passedCount = 0;
  const resultsTable: any[] = [];

  for (const tc of TEST_CASES) {
    const res = await runTwoPassFoodVision({ text: tc.query });

    let passed = true;
    const failures: string[] = [];

    // Check non-food or quality rejection
    if (tc.expectedResult.shouldReject) {
      if (!tc.expectedResult.isFood && res.isFood) {
        passed = false;
        failures.push(`Debió rechazar como no-comida pero devolvió isFood: true`);
      }
      if (tc.expectedResult.imageQuality && res.imageQuality !== tc.expectedResult.imageQuality) {
        passed = false;
        failures.push(`imageQuality esperada: ${tc.expectedResult.imageQuality}, obtenida: ${res.imageQuality}`);
      }
    } else {
      // Must be food and good quality
      if (!res.isFood) {
        passed = false;
        failures.push(`Rechazó erróneamente con motivo: ${res.rejectionReason}`);
      }
      if (res.imageQuality !== 'good') {
        passed = false;
        failures.push(`Calidad no fue 'good': ${res.imageQuality}`);
      }

      // Check expected items
      const confirmedNames = res.confirmedItems.map((c) => c.name.toLowerCase());
      for (const expected of tc.expectedResult.expectedItems || []) {
        const found = confirmedNames.some((c) => c.includes(expected.toLowerCase()));
        if (!found) {
          passed = false;
          failures.push(`No encontró alimento esperado: "${expected}"`);
        }
      }

      // Check forbidden items (hallucinated oils, sauces)
      for (const forbidden of tc.expectedResult.forbiddenItems || []) {
        const found = confirmedNames.some((c) => c.includes(forbidden.toLowerCase()));
        if (found) {
          passed = false;
          failures.push(`Alucinación no deseada detectada: "${forbidden}"`);
        }
      }

      // Check grams range
      for (const [foodName, [minG, maxG]] of Object.entries(tc.expectedResult.expectedGramsRange || {})) {
        const item = res.confirmedItems.find((c) => c.name.toLowerCase().includes(foodName.toLowerCase()));
        if (item) {
          if (item.grams < minG || item.grams > maxG) {
            passed = false;
            failures.push(`Gramos de ${foodName} (${item.grams}g) fuera de rango [${minG}-${maxG}g]`);
          }
        }
      }

      // Check OCR
      if (tc.expectedResult.isOCR && !res.isNutritionLabelOrReceipt) {
        passed = false;
        failures.push('Debió marcar isNutritionLabelOrReceipt: true');
      }

      // Check doubtful items
      if (tc.expectedResult.hasDoubtful && res.doubtfulItems.length === 0) {
        passed = false;
        failures.push('Debió clasificar el ingrediente dudoso en doubtfulItems');
      }

      // Check that calories > 0 and macros match
      for (const item of res.confirmedItems) {
        if (item.calories <= 0) {
          passed = false;
          failures.push(`Calorías 0 o negativas en ${item.name}`);
        }
      }
    }

    if (passed) passedCount++;

    const detectedSummary = res.confirmedItems.map((c) => `${c.name} (${c.grams}g, ${c.calories}kcal)`).join(', ') || res.rejectionReason || 'Rechazado';
    const doubtfulSummary = res.doubtfulItems.map((d) => `${d.name} (${d.confidencePercent}%)`).join(', ') || 'Ninguno';

    resultsTable.push({
      ID: tc.id,
      Descripción: tc.description,
      'Detectado Real': detectedSummary,
      'Dudosos': doubtfulSummary,
      'Total Kcal': res.totalCalories,
      Resultado: passed ? 'PASÓ' : 'FALLÓ',
    });

    console.log(`[${passed ? '✓ PASÓ' : '✗ FALLÓ'}] Caso ${tc.id}: ${tc.description}`);
    if (!passed) {
      console.log(`   Motivos de fallo: ${failures.join(' | ')}`);
    }
  }

  console.log('\n================================================================');
  console.log(`RESUMEN: ${passedCount} / ${TEST_CASES.length} PRUEBAS SUPERADAS (${Math.round((passedCount / TEST_CASES.length) * 100)}%)`);
  console.log('================================================================\n');

  console.table(resultsTable);
}

runAllTests().catch((e) => {
  console.error('Error in tests:', e);
  process.exit(1);
});
