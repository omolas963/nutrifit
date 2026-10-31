import { Router, Request, Response } from 'express';
import { config } from '../config';

export const assistantRouter = Router();

assistantRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userProfile, todaySummary, recentEntries, savedRecipes, memories } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'La conversación debe contener al menos un mensaje.' });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Safety checks for eating disorders and severe health risks
    const lowerMsg = lastUserMessage.toLowerCase();
    const tcaKeywords = [
      'no quiero comer nada', 'dejar de comer', 'purgarme', 'vomitar la comida',
      'estoy asquerosamente gordo', 'gorda asquerosa', 'morirme de hambre',
      'obsesion con quemar', 'odio mi cuerpo y no comere'
    ];
    const isTcaCue = tcaKeywords.some(k => lowerMsg.includes(k));

    if (isTcaCue) {
      return res.json({
        reply: `Entiendo que estés pasando por un momento muy difícil y sientas esa frustración con la comida o con tu cuerpo, pero tu salud y tu bienestar son lo más valioso. Restringir drásticamente la alimentación o recurrir a métodos compensatorios no es la solución y puede poner en riesgo tu organismo y tu salud mental.

Te animo de todo corazón a hablar con un profesional de la salud o de la psicología especializado en nutrición y bienestar emocional. No estás solo/a en esto y mereces cuidar de ti con cariño y respeto. Si necesitas ayuda en España, puedes contactar con la Asociación contra la Anorexia y la Bulimia (ACAB) o el Teléfono de la Esperanza (717 003 717).`,
        actions: [],
      });
    }

    // Prepare context summary
    const profileSummary = userProfile
      ? `Peso: ${userProfile.weight || 70} kg, Altura: ${userProfile.height || 175} cm, Objetivo: ${userProfile.goal || 'mantener'}, Calorías objetivo: ${userProfile.dailyCalorieTarget || 2000} kcal (Proteínas: ${userProfile.dailyProteinTargetGrams || 140}g, Carbohidratos: ${userProfile.dailyCarbsTargetGrams || 220}g, Grasas: ${userProfile.dailyFatTargetGrams || 65}g).`
      : 'Perfil estándar de mantenimiento.';

    const diarySummary = todaySummary
      ? `Calorías consumidas hoy: ${todaySummary.calories} kcal / ${todaySummary.targetCalories} kcal. Restantes: ${todaySummary.remainingCalories} kcal. Macros restantes: ${todaySummary.remainingProtein}g P, ${todaySummary.remainingCarbs}g C, ${todaySummary.remainingFat}g G.`
      : 'No hay datos de consumo registrados hoy.';

    const entriesSummary = Array.isArray(recentEntries) && recentEntries.length > 0
      ? recentEntries.map((e: any) => `- ${e.name} (${e.grams}g, ${e.calories} kcal, ${e.protein}g P) [${e.mealType}]`).join('\n')
      : 'Aún no se han registrado alimentos hoy.';

    const recipesSummary = Array.isArray(savedRecipes) && savedRecipes.length > 0
      ? savedRecipes.map((r: any) => `- ${r.title} (${r.caloriesPerPortion} kcal/ración, ${r.prepTimeMinutes} min)`).join('\n')
      : 'Sin recetas guardadas aún.';

    const memoriesSummary = Array.isArray(memories) && memories.length > 0
      ? memories.map((m: any) => `- ${m}`).join('\n')
      : 'Sin notas previas.';

    const systemPrompt = `Eres el Asistente Nutricional Inteligente de NutriFit. Eres un dietista-nutricionista clínico y deportivo colegiado, cálido, empático, motivador y práctico. Conoces a fondo la gastronomía española y catalana, así como los alimentos cotidianos de supermercado (Mercadona, Carrefour, Lidl) y platos tradicionales.

CONTEXTO DEL USUARIO:
- PERFIL: ${profileSummary}
- DIARIO Y MACROS DE HOY: ${diarySummary}
- ALIMENTOS CONSUMIDOS HOY:
${entriesSummary}
- RECETAS GUARDADAS DEL USUARIO:
${recipesSummary}
- MEMORIA Y PREFERENCIAS DEL USUARIO:
${memoriesSummary}

REGLAS DE SEGURIDAD CRÍTICAS:
1. Jamás sugieras dietas por debajo de 1200 kcal en mujeres o 1500 kcal en hombres salvo indicación médica expresa.
2. Si el usuario consulta sobre patologías médicas (ej: diabetes tipo 1, enfermedad celíaca, cardiopatías, embarazo), recuerda siempre consultar con su médico especialista o dietista-nutricionista colegiado.
3. Respuestas estructuradas, empáticas y prácticas.

TARJETAS DE ACCIÓN INTERACTIVAS:
Si recomiendas alimentos específicos para una comida (ej: para la cena de hoy), recetas o detectas una preferencia/alergia, incluye al final de tu mensaje etiquetas estructuradas HTML comment. La app las transformará en tarjetas con botón interactivo:

Para añadir un alimento al diario:
<!--ACTION:ADD_FOOD:{"name":"Lomo de salmón a la plancha","grams":150,"calories":312,"protein":30.0,"carbs":0,"fat":20.2,"mealType":"cena"}-->

Para guardar una receta sugerida:
<!--ACTION:SAVE_RECIPE:{"title":"Tortilla de espinacas y queso feta","prepTimeMinutes":15,"portions":1,"caloriesPerPortion":280,"macrosPerPortion":{"protein":22,"carbs":4,"fat":19},"ingredients":[{"name":"Huevos","grams":120,"calories":180,"protein":15,"carbs":1,"fat":13},{"name":"Espinacas","grams":100,"calories":23,"protein":3,"carbs":3,"fat":0}],"steps":["Batir los huevos.","Saltear las espinacas.","Cocinar a fuego medio 3 min."]}-->

Para recordar una preferencia o alergia:
<!--ACTION:REMEMBER:{"note":"Es intolerante a la lactosa y prefiere la leche de avena"}-->

Responde con formato Markdown elegante, sin usar emojis excesivos y manteniendo el tono profesional y cercano.`;

    if (config.geminiApiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiApiKey}`;

        const contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Entendido. Estoy listo para asistir al usuario como su nutricionista personal de NutriFit, adaptándome a sus datos, comidas y objetivos.' }] },
        ];

        for (const msg of messages) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }

        const resGemini = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        });

        if (resGemini.ok) {
          const geminiData = await resGemini.json();
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          return res.json({ reply });
        }
      } catch (err) {
        console.error('Gemini assistant call failed:', err);
      }
    }

    // Dynamic smart fallback answering according to user's question
    let fallbackReply = '';
    const remCals = todaySummary?.remainingCalories ?? 650;
    const remP = todaySummary?.remainingProtein ?? 40;

    if (lowerMsg.includes('cenar') || lowerMsg.includes('cena')) {
      fallbackReply = `Para la cena de hoy, considerando que te quedan **${remCals} kcal** y **${remP}g de proteína**, te sugiero una opción ligera y saciante de la cocina mediterránea:

- **Lomo de merluza fresca a la plancha** (180g): 160 kcal, 32g de proteína pura.
- **Crema casera de calabacín y puerro con patata** (200g): 90 kcal, rica en fibra y micronutrientes.
- **1 cucharadita de aceite de oliva virgen extra**: 45 kcal de grasas saludables.

Esto te aportará unas **295 kcal** y **34g de proteína**, encajando a la perfección en tus objetivos de hoy.

<!--ACTION:ADD_FOOD:{"name":"Merluza a la plancha con crema de calabacín","grams":380,"calories":295,"protein":34.0,"carbs":16.0,"fat":5.5,"mealType":"cena"}-->`;
    } else if (lowerMsg.includes('proteina') || lowerMsg.includes('proteína') || lowerMsg.includes('como voy')) {
      fallbackReply = `Hoy llevas acumuladas **${todaySummary?.protein || 0}g de proteína** de tu objetivo diario. Te restan **${remP}g** para alcanzar tu meta.

Para completar tus proteínas fácilmente sin disparar las calorías:
1. **Pechuga de pollo o pavo a la plancha** (100g aportan ~23g de proteína y solo 110 kcal).
2. **Lata de atún al natural** (60g aportan ~14g de proteína con menos de 1g de grasa).
3. **Yogur griego natural o queso batido 0%** (125g aportan ~10g de proteína).`;
    } else if (lowerMsg.includes('receta')) {
      fallbackReply = `Te propongo una receta rápida y deliciosa que puedes preparar en 15 minutos:

### Salteado mediterráneo de pollo con verduras
- **Preparación:** 15 minutos
- **Calorías:** ~380 kcal | **Proteínas:** 42g | **Carbohidratos:** 12g | **Grasas:** 9g

<!--ACTION:SAVE_RECIPE:{"title":"Salteado mediterráneo de pollo con verduras","prepTimeMinutes":15,"portions":1,"caloriesPerPortion":380,"macrosPerPortion":{"protein":42,"carbs":12,"fat":9},"ingredients":[{"name":"Pechuga de pollo","grams":200,"calories":220,"protein":42,"carbs":0,"fat":2.4},{"name":"Calabacín y pimiento","grams":150,"calories":45,"protein":2,"carbs":8,"fat":0.5},{"name":"Aceite de oliva virgen extra","grams":12,"calories":106,"protein":0,"carbs":0,"fat":12}],"steps":["Cortar el pollo en tiras finas y salpimentar.","Dorar el pollo en sartén con aceite virgen extra a fuego fuerte 5 min.","Añadir las verduras troceadas y saltear 5 min más.","Servir caliente con un toque de orégano o perejil fresco."]}-->`;
    } else {
      fallbackReply = `Hola. Como tu asistente de NutriFit, estoy conectado a tu perfil y a lo que registras en el diario. 

Hoy tienes un objetivo de **${userProfile?.dailyCalorieTarget || 2000} kcal** y te quedan **${remCals} kcal** para terminar el día. 

¿En qué puedo ayudarte? Puedo sugerirte qué comer o cenar según tus macros restantes, analizar tus alimentos, o recomendarte recetas saludables.`;
    }

    return res.json({ reply: fallbackReply });
  } catch (error) {
    console.error('Error in assistant chat endpoint:', error);
    return res.status(500).json({ error: 'Error procesando la consulta del asistente.' });
  }
});
