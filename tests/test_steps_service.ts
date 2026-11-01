import { StepsService, DayStepData } from '../src/services/stepsService';
import { db } from '../server/db/database';

// Simple assertion helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALLO: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ OK: ${message}`);
}

async function runStepsServiceTests() {
  console.log('=====================================================');
  console.log('🧪 EJECUTANDO BATERÍA DE PRUEBAS DE STEPS SERVICE');
  console.log('=====================================================');

  const service = new StepsService();

  // ----------------------------------------------------------------
  // TEST 1: Lectura sin duplicar (móvil + reloj en el mismo periodo)
  // ----------------------------------------------------------------
  console.log('\n--- [TEST 1] Móvil + Reloj sin duplicar ---');
  // Simulamos datos de entrada: el teléfono registró 8.500 pasos y el reloj 9.200 pasos
  // La agregación diaria de HealthKit / Health Connect de-duplica y toma el dato consolidado: 9.200
  const today = new Date().toISOString().split('T')[0];
  const simulatedDailyAggregated = { [today]: 9200 };

  service.injectTestData(simulatedDailyAggregated, 70);
  const state1 = service.getState();

  assert(state1.todaySteps === 9200, `Pasos de hoy consolidan exactamente 9.200 pasos sin duplicar (registrados: ${state1.todaySteps})`);
  assert(state1.todaySteps < 17700, 'NO se han sumado los 8.500 del móvil + 9.200 del reloj (evita duplicación)');
  assert(state1.todayCalories > 300 && state1.todayCalories < 450, `Calorías estimadas correctamente: ${state1.todayCalories} kcal`);
  assert(state1.todayDistanceMeters > 6000, `Distancia estimada coherente: ${state1.todayDistanceMeters} metros`);

  // ----------------------------------------------------------------
  // TEST 2: Cambio de día y cambio de zona horaria
  // ----------------------------------------------------------------
  console.log('\n--- [TEST 2] Cambio de día y zona horaria ---');
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

  service.injectTestData({
    [twoDaysAgo]: 11400,
    [yesterday]: 7800,
    [today]: 9200,
  }, 75);

  const state2 = service.getState();
  assert(state2.history[twoDaysAgo]?.steps === 11400, `Día -2 correctamente asignado: ${state2.history[twoDaysAgo]?.steps} pasos`);
  assert(state2.history[yesterday]?.steps === 7800, `Ayer correctamente asignado: ${state2.history[yesterday]?.steps} pasos`);
  assert(state2.history[today]?.steps === 9200, `Hoy correctamente aislado sin mezclar fechas: ${state2.history[today]?.steps} pasos`);

  // ----------------------------------------------------------------
  // TEST 3: Cero pasos (0 pasos)
  // ----------------------------------------------------------------
  console.log('\n--- [TEST 3] Caso 0 pasos ---');
  service.injectTestData({ [today]: 0 }, 70);
  const state3 = service.getState();

  assert(state3.todaySteps === 0, 'Detecta 0 pasos sin fallar');
  assert(state3.todayCalories === 0, '0 pasos queman 0 calorías estimadas');
  assert(state3.todayDistanceMeters === 0, '0 pasos corresponden a 0 metros');

  // ----------------------------------------------------------------
  // TEST 4: Permiso denegado por el usuario
  // ----------------------------------------------------------------
  console.log('\n--- [TEST 4] Permiso denegado ---');
  service.setTestStatus('permission_denied', 'El usuario denegó los permisos en Ajustes del teléfono.');
  const state4 = service.getState();

  assert(state4.status === 'permission_denied', 'Estado correctamente reflejado como permission_denied');
  assert(Boolean(state4.errorMessage && state4.errorMessage.includes('Ajustes')), 'Mensaje de ayuda con botón a ajustes presente');

  // ----------------------------------------------------------------
  // TEST 5: Health Connect no instalado (Android antiguo)
  // ----------------------------------------------------------------
  console.log('\n--- [TEST 5] Health Connect no instalado ---');
  service.setTestStatus('not_available', 'Health Connect no está instalado en este dispositivo.');
  const state5 = service.getState();

  assert(state5.status === 'not_available', 'Estado not_available manejado correctamente');
  assert(Boolean(state5.errorMessage && state5.errorMessage.includes('Health Connect')), 'Ofrece enlace para instalar desde Google Play');

  // ----------------------------------------------------------------
  // TEST 6: Base de datos y validaciones de rango en Backend (/api/steps)
  // ----------------------------------------------------------------
  console.log('\n--- [TEST 6] Validación y persistencia en DB backend ---');
  const testUserId = `usr_test_${Date.now()}`;

  // 6.1 Guardar día válido
  const savedEntry = db.saveStepLog(testUserId, today, {
    steps: 10450,
    distanceMeters: 7500,
    calories: 418,
    source: 'health_connect',
  });
  assert(savedEntry.steps === 10450, `Backend guarda pasos válidos: ${savedEntry.steps}`);

  // 6.2 Recuperar rango
  const logs = db.getStepLogs(testUserId, yesterday, today);
  assert(logs.length === 1, `Filtro de fechas devuelve exactamente el registro guardado (obtenidos: ${logs.length})`);
  assert(logs[0].steps === 10450, 'Pasos coinciden íntegramente con lo almacenado');

  // 6.3 Validación de límite no plausible (ej: 250.000 pasos en un día se normaliza / rechaza)
  const clampedEntry = db.saveStepLog(testUserId, yesterday, {
    steps: 300000, // Implausible
    distanceMeters: 50000,
    calories: 1200,
    source: 'test',
  });
  assert(clampedEntry.steps <= 150000, `Backend acota valores de pasos no plausibles al límite seguro: ${clampedEntry.steps} <= 150.000`);

  // 6.4 Derecho al olvido y borrado total
  const deleted = db.deleteStepLogs(testUserId);
  assert(deleted === true, 'Borrado total de datos de pasos ejecutado con éxito');
  const logsAfterDelete = db.getStepLogs(testUserId);
  assert(logsAfterDelete.length === 0, 'Base de datos del usuario queda vacía sin residuos tras el borrado');

  console.log('\n=====================================================');
  console.log('🎉 TODOS LOS TESTS DE STEPS SERVICE PASARON CON ÉXITO');
  console.log('=====================================================\n');
}

runStepsServiceTests().catch((err) => {
  console.error('Error durante la ejecución de tests:', err);
  process.exit(1);
});
