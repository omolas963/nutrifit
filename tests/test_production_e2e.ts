async function runE2E() {
  const base = 'http://127.0.0.1:10000';
  console.log('Testing full production server on', base);

  // 1. /health
  const hRes = await fetch(base + '/health');
  if (!hRes.ok) throw new Error(`/health returned status ${hRes.status}`);
  const hJson: any = await hRes.json();
  console.log('[1] /health OK ->', JSON.stringify(hJson));

  // 2. /api/health
  const ahRes = await fetch(base + '/api/health');
  if (!ahRes.ok) throw new Error(`/api/health returned status ${ahRes.status}`);
  console.log('[2] /api/health OK');

  // 3. Frontend index.html served on root
  const fRes = await fetch(base + '/');
  if (!fRes.ok) throw new Error(`Root GET returned status ${fRes.status}`);
  const fHtml = await fRes.text();
  const hasRoot = fHtml.includes('id="root"');
  if (!hasRoot) throw new Error('Root HTML does not contain #root mounting point');
  console.log('[3] Frontend SPA index.html served OK (contains #root)');

  // 4. Food Search
  const sRes = await fetch(base + '/api/food/search?q=huevo%20frito');
  const sData: any = await sRes.json();
  const sResults = sData.results || sData;
  if (!Array.isArray(sResults) || sResults.length === 0) throw new Error('Search returned no results');
  console.log(`[4] Food Search OK -> "${sResults[0].name}" (${sResults[0].caloriesPer100g} kcal/100g) [Total results: ${sResults.length}]`);

  // 5. Vision Analyze Food (Multi-item)
  const vRes = await fetch(base + '/api/ai/analyze-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'huevo frito con patatas fritas y pechuga de pollo' }),
  });
  const vJson: any = await vRes.json();
  if (!vJson.confirmedItems || vJson.confirmedItems.length < 2) throw new Error('Vision breakdown failed');
  console.log(`[5] Vision multi-item breakdown OK -> ${vJson.confirmedItems.length} items (${vJson.confirmedItems.map((i: any) => i.name).join(', ')})`);

  // 6. Assistant AI
  const aRes = await fetch(base + '/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: '¿Qué ceno hoy?' }],
      userProfile: { currentWeightKg: 70, dailyCalorieTarget: 2000 },
      todaySummary: { remainingCalories: 500, remainingProtein: 35 },
    }),
  });
  const aJson: any = await aRes.json();
  if (!aJson.reply) throw new Error('Assistant did not return reply');
  console.log(`[6] Assistant AI reply OK -> ${aJson.reply.slice(0, 80)}...`);

  // 7. Meal plan generator
  const pRes = await fetch(base + '/api/ai/generate-meal-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetCalories: 1800, dietType: 'mediterranean' }),
  });
  const pJson: any = await pRes.json();
  if (!pJson.plan && !pJson.days) throw new Error('Meal plan generation failed');
  console.log('[7] Meal plan generation OK');

  console.log('\n===========================================');
  console.log('🎉 TODOS LOS TESTS E2E DE PRODUCCIÓN SUPERADOS');
  console.log('===========================================');
}

runE2E().catch((err) => {
  console.error('E2E FAILURE:', err);
  process.exit(1);
});
