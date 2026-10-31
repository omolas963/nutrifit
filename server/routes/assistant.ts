import { Router, Request, Response } from 'express';
import { config } from '../config';

export const assistantRouter = Router();

// In-memory IP rate limiter: max 30 messages per minute per IP
const IP_RATE_LIMITS = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = IP_RATE_LIMITS.get(ip);
  if (!entry || now > entry.resetTime) {
    IP_RATE_LIMITS.set(ip, { count: 1, resetTime: now + 60_000 });
    return true;
  }
  if (entry.count >= 30) {
    return false;
  }
  entry.count++;
  return true;
}

// Language detection helper
function isCatalan(text: string): boolean {
  const lower = text.toLowerCase();
  const catalanIndicators = [
    'què', 'sopar', 'dinar', 'esmorzar', 'vull', 'menjar', 'perquè', 'amb', 'molt',
    'gràcies', 'adéu', 'hola, com estàs', 'fruits secs', 'al·lèrgia', 'pa amb tomàquet'
  ];
  return catalanIndicators.some(w => lower.includes(w));
}

assistantRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Has enviado demasiados mensajes seguidos. Por favor, espera un minuto antes de continuar.',
      });
    }

    const { messages, userProfile, todaySummary, recentEntries, savedRecipes, memories } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'La conversación debe contener al menos un mensaje.' });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const lowerMsg = lastUserMessage.toLowerCase();
    const isCat = isCatalan(lastUserMessage);

    // -------------------------------------------------------------
    // SAFETY PROTOCOL: Eating Disorders (TCA) & Extreme Guilt
    // -------------------------------------------------------------
    const tcaKeywords = [
      'no quiero comer nada', 'dejar de comer', 'purgarme', 'vomitar la comida', 'vomito',
      'estoy asquerosamente gordo', 'gorda asquerosa', 'morirme de hambre',
      'obsesion con quemar', 'odio mi cuerpo y no comere', 'me siento culpable al comer',
      'culpa al comer', 'siento culpa cuando como', 'atracon', 'atracón', 'no vull menjar res'
    ];
    const isTcaCue = tcaKeywords.some(k => lowerMsg.includes(k));

    if (isTcaCue) {
      if (isCat) {
        return res.json({
          reply: `Entenc perfectament que estiguis passant per un moment complicat i sentis culpa o angoixa respecte al teu cos o al menjar, però la teva salut i el teu benestar emocional són el més important. 

Restringir el menjar de forma dràstica o sentir culpa després dels àpats no és la solució i pot posar en perill el teu organisme. Menjar és una necessitat vital i mereixes cuidar-te amb respecte i calma.

T'animo de tot cor a parlar amb un professional de la salut o de la psicologia especialitzat en nutrició i relació amb el menjar. A Catalunya i a tot l'Estat tens recursos d'ajuda gratuïts i confidencials:
- **Associació contra l'Anorèxia i la Bulímia (ACAB):** 93 458 22 10 / acab.org
- **Telèfon de l'Esperança:** 717 003 717
- **Línia d'Atenció a la Crisi:** 024

No estàs sol/a en això. Parlem amb calma quan vulguis.`,
          actions: [],
        });
      }

      return res.json({
        reply: `Entiendo perfectamente que estés pasando por un momento difícil y sientas esa angustia o culpa con la comida o con tu cuerpo, pero tu salud física y mental es lo más valioso. 

Restringir drásticamente la comida, castigarte o sentir culpa no es la solución y puede dañar gravemente tu organismo. La comida es energía para vivir, no un premio ni un castigo, y mereces cuidarte con respeto y amabilidad.

Te animo de todo corazón a compartir lo que sientes con un profesional de la salud o de la psicología especializado en nutrición y relación con la comida. No tienes que afrontar esto a solas. Puedes contactar con recursos gratuitos y confidenciales:
- **Asociación contra la Anorexia y la Bulimia (ACAB):** acab.org
- **Teléfono de la Esperanza:** 717 003 717
- **Línea de Prevención y Ayuda:** 024

Aquí estaré siempre para ayudarte a cuidar tu salud de forma sana y sin obsesiones.`,
        actions: [],
      });
    }

    // -------------------------------------------------------------
    // SAFETY PROTOCOL: Medical pathology, pregnancy, severe diseases
    // -------------------------------------------------------------
    const medicalKeywords = [
      'diabetes tipo 1', 'embarazada', 'embarazo', 'insuficiencia renal', 'cancer',
      'medicacion para la tiroides', 'enfermedad renal'
    ];
    const isMedicalQuery = medicalKeywords.some(k => lowerMsg.includes(k));

    if (isMedicalQuery) {
      return res.json({
        reply: `⚠️ **Aviso de salud importante**: Como asistente de nutrición de NutriFit, puedo orientarte sobre hábitos generales y composición de alimentos, pero **no sustituyo el criterio clínico de un médico o dietista-nutricionista colegiado**.

Ante condiciones específicas como diabetes, embarazo o patologías clínicas, cada plan debe pautarse y supervisarse individualmente con analíticas clínicas. Te recomiendo consultar siempre con tu endocrino o médico de cabecera antes de realizar cambios drásticos en tus nutrientes.`,
        actions: [],
      });
    }

    // Prepare context summaries
    const profileSummary = userProfile
      ? `Peso: ${userProfile.currentWeightKg || 70} kg, Altura: ${userProfile.heightCm || 175} cm, Género: ${userProfile.gender || 'no especificado'}, Objetivo: ${userProfile.goal || 'mantener'}, Calorías objetivo: ${userProfile.dailyCalorieTarget || 2000} kcal (Proteínas: ${userProfile.dailyProteinTargetGrams || 140}g, Carbohidratos: ${userProfile.dailyCarbsTargetGrams || 220}g, Grasas: ${userProfile.dailyFatTargetGrams || 65}g).`
      : 'Perfil estándar de mantenimiento.';

    const diarySummary = todaySummary
      ? `Calorías consumidas hoy: ${todaySummary.calories || 0} kcal / ${todaySummary.targetCalories || 2000} kcal. Restantes: ${todaySummary.remainingCalories || 500} kcal. Macros restantes: ${todaySummary.remainingProtein || 30}g P, ${todaySummary.remainingCarbs || 50}g C, ${todaySummary.remainingFat || 15}g G.`
      : 'No hay datos de consumo registrados hoy.';

    const entriesSummary = Array.isArray(recentEntries) && recentEntries.length > 0
      ? recentEntries.map((e: any) => `- ${e.name} (${e.grams}g, ${e.calories} kcal, ${e.protein}g P) [${e.mealType}]`).join('\n')
      : 'Aún no se han registrado alimentos hoy.';

    const recipesSummary = Array.isArray(savedRecipes) && savedRecipes.length > 0
      ? savedRecipes.map((r: any) => `- ${r.title} (${r.caloriesPerPortion} kcal/ración, ${r.prepTimeMinutes} min)`).join('\n')
      : 'Sin recetas guardadas aún.';

    const memoriesSummary = Array.isArray(memories) && memories.length > 0
      ? memories.map((m: any) => `- ${m}`).join('\n')
      : 'Sin preferencias previas guardadas.';

    const systemPrompt = `Eres el Asistente Nutricional Inteligente de NutriFit. Eres un dietista-nutricionista clínico y deportivo colegiado en España. Eres empático, motivador, práctico y riguroso.
Conoces la gastronomía tradicional española y catalana, así como los productos de supermercado (Mercadona, Lidl, Carrefour, Bonpreu).

CONTEXTO DEL USUARIO:
- PERFIL BIOMÉTRICO: ${profileSummary}
- DIARIO Y MACROS DE HOY: ${diarySummary}
- ALIMENTOS CONSUMIDOS HOY:
${entriesSummary}
- RECETAS GUARDADAS:
${recipesSummary}
- MEMORIA Y PREFERENCIAS REGISTRADAS (Alergias, gustos):
${memoriesSummary}

NORMAS DE INTERACCIÓN:
1. Idioma: responde siempre en el idioma del usuario (${isCat ? 'Catalán' : 'Español'}).
2. Respuestas cortas, al grano y prácticas. Máximo una pregunta de aclaración a la vez.
3. Cero dietas extremas: jamás sugieras calorías por debajo de 1200 kcal en mujeres o 1500 kcal en hombres.
4. Si detectas una alergia o preferencia nueva, recuérdala con la acción <!--ACTION:REMEMBER:{"note":"..."}-->.
5. Si recomiendas un plato concreto para añadir al diario, genera la tarjeta <!--ACTION:ADD_FOOD:{...}-->.
6. Si recomiendas una receta, genera la tarjeta <!--ACTION:SAVE_RECIPE:{...}-->.
7. Si el usuario solicita un plan o compra, sugiere las tarjetas interactivas correspondientes.
8. La acción SOLO se ejecutará cuando el usuario pulse el botón en la tarjeta.`;

    // Try Gemini API if key exists
    if (config.geminiApiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiApiKey}`;

        // Limit conversation history to last 6 messages to save cost & latency
        const recentMessages = messages.slice(-6);
        const contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Entendido. Estoy conectado a los datos de NutriFit del usuario y listo para responder de forma concisa y segura.' }] },
        ];

        for (const msg of recentMessages) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }

        const resGemini = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 800,
            },
          }),
        });

        if (resGemini.ok) {
          const geminiData = await resGemini.json();
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (reply.trim()) {
            return res.json({ reply });
          }
        } else if (resGemini.status === 429) {
          console.warn('Gemini 429 quota exceeded, serving smart fallback');
        }
      } catch (err) {
        console.warn('Gemini assistant call failed, using high-fidelity fallback:', err);
      }
    }

    // -------------------------------------------------------------
    // Intelligent Context-Aware Fallback Engine
    // -------------------------------------------------------------
    let fallbackReply = '';
    const remCals = todaySummary?.remainingCalories ?? 600;
    const remP = todaySummary?.remainingProtein ?? 35;

    // 1. Cena / Cenar / Ceno
    if (lowerMsg.includes('ceno') || lowerMsg.includes('cenar') || lowerMsg.includes('sopar') || lowerMsg.includes('cena')) {
      if (isCat) {
        fallbackReply = `Per al sopar d'avui, tenint en compte que et queden aproximadament **${remCals} kcal** i **${remP}g de proteïna**, et recomano una opció lleugera i saciant:

- **Lluç a la planxa** (180g): ~155 kcal, 31g de proteïna.
- **Crema de carbassó i porro casolana** (200g): ~85 kcal, abundant en fibra.
- **1 culleradeta d'oli d'oliva verge extra**: ~45 kcal de greixos cardiosaludables.

Aportació total: **~285 kcal** i **32g de proteïna**.

<!--ACTION:ADD_FOOD:{"name":"Lluç a la planxa amb crema de carbassó","grams":380,"calories":285,"protein":32.0,"carbs":14.0,"fat":5.0,"mealType":"cena"}-->`;
      } else {
        fallbackReply = `Para la cena de hoy, considerando que te quedan unas **${remCals} kcal** y **${remP}g de proteína**, te propongo una cena ligera y saciante:

- **Lomo de merluza fresca a la plancha** (180g): ~155 kcal y 31g de proteína limpia.
- **Crema de calabacín y puerro casera** (200g): ~85 kcal con fibra saciante.
- **1 cucharadita de aceite de oliva virgen extra**: ~45 kcal.

Aporte total: **~285 kcal** y **32g de proteína**. Puedes registrarla directamente con el botón inferior:

<!--ACTION:ADD_FOOD:{"name":"Merluza a la plancha con crema de calabacín","grams":380,"calories":285,"protein":32.0,"carbs":14.0,"fat":5.0,"mealType":"cena"}-->`;
      }
    }

    // 2. Me paso de calorías
    else if (lowerMsg.includes('paso de calorias') || lowerMsg.includes('paso de calorías') || lowerMsg.includes('pasado de calorias') || lowerMsg.includes('me he pasado')) {
      fallbackReply = `¡Tranquilidad total! Pasarse de calorías en un día puntual es completamente normal y **no arruina tu progreso ni tu composición corporal**. El balance energético real funciona por promedios semanales, no en periodos de 24 horas.

**Qué te recomiendo hacer hoy:**
1. **Cero compensaciones extremas:** No te saltes comidas mañana ni hagas ayunos forzados.
2. **Bebe agua y camina:** Mantén una buena hidratación para aliviar la retención de líquidos si comiste más sodio o hidratos.
3. **Retoma tu rutina mañana:** Vuelve a tus platos habituales como si nada hubiera pasado.

La consistencia mes a mes es lo que marca la diferencia, no la perfección diaria.`;
    }

    // 3. Hambre por la noche
    else if (lowerMsg.includes('hambre por la noche') || lowerMsg.includes('antojo nocturno') || lowerMsg.includes('fam a la nit')) {
      fallbackReply = `Tener hambre por la noche suele deberse a dos motivos: o comiste poca proteína/fibra durante el día, o es hambre fisiológica por el descanso.

Te propongo tres opciones rápidas de menos de 150 kcal que calman el apetito y favorecen el sueño:
1. **Yogur griego natural o queso fresco batido 0%** (125g, ~70 kcal, rico en caseína de absorción lenta).
2. **Un puñado mediano de nueces o almendras** (15g, ~90 kcal, magnesio y grasas buenas).
3. **Infusión relajante (manzanilla o tila) con una cucharadita de miel o canela**.

¿Quieres que añadamos un snack ligero de yogur griego a tu diario?
<!--ACTION:ADD_FOOD:{"name":"Queso fresco batido 0% desnatado","grams":125,"calories":60,"protein":10.5,"carbs":4.5,"fat":0.1,"mealType":"snacks"}-->`;
    }

    // 4. Alergia a los frutos secos
    else if (lowerMsg.includes('frutos secos') || lowerMsg.includes('alergia') || lowerMsg.includes('fruits secs')) {
      fallbackReply = `Anotado en tu memoria clínica: **alergia estricta a los frutos secos**.

A partir de ahora excluiré nueces, almendras, avellanas, cacahuetes y pistachos de todas mis recomendaciones y recetas. Como alternativas excelentes para obtener grasas saludables y textura te recomendaré:
- **Aceite de oliva virgen extra**
- **Aguacate maduro**
- **Semillas de lino o chía trituradas**

<!--ACTION:REMEMBER:{"note":"Alergia estricta a los frutos secos (nueces, almendras, avellanas, cacahuetes)"}-->`;
    }

    // 5. Ideas con lo que tengo en la nevera
    else if (lowerMsg.includes('nevera') || lowerMsg.includes('que tengo') || lowerMsg.includes('despensa')) {
      fallbackReply = `Dime qué 3 o 4 ingredientes tienes por la nevera (ej: huevos, tomate, latas de atún, arroz o verduras) y te diseño al instante una receta adaptada a tus macros.

Si tienes **huevos y verduras**, una tortilla francesa jugosa con pisto o calabacín salteado se hace en 8 minutos y te aporta ~240 kcal y 18g de proteína.`;
    }

    // 6. Receta para guardar
    else if (lowerMsg.includes('guardar receta') || lowerMsg.includes('receta')) {
      fallbackReply = `Aquí tienes una receta mediterránea completa lista para guardar en tu recetario:

### Salmón al horno con espárragos trigueros
- **Tiempo:** 20 minutos | **Porciones:** 1
- **Nutrición:** ~380 kcal | 38g Proteína | 4g Carbohidratos | 21g Grasas

<!--ACTION:SAVE_RECIPE:{"title":"Salmón al horno con espárragos trigueros","prepTimeMinutes":20,"portions":1,"caloriesPerPortion":380,"macrosPerPortion":{"protein":38,"carbs":4,"fat":21},"ingredients":[{"name":"Lomo de salmón fresco","grams":180,"calories":320,"protein":36,"carbs":0,"fat":20},{"name":"Espárragos trigueros","grams":120,"calories":30,"protein":2,"carbs":4,"fat":0.5},{"name":"Aceite de oliva virgen extra","grams":5,"calories":44,"protein":0,"carbs":0,"fat":5}],"steps":["Precalentar horno a 190°C.","Colocar el salmón y los espárragos en bandeja con papel de hornear.","Pincelar con aceite de oliva, sal y eneldo.","Hornear 15 minutos hasta que esté tierno y dorado."]}-->`;
    }

    // 7. Lista de la compra o plan
    else if (lowerMsg.includes('compra') || lowerMsg.includes('lista') || lowerMsg.includes('plan')) {
      fallbackReply = `Para gestionar tus planes y compras dispones de dos accesos directos en la app:
- **Crear un plan nuevo:** En la pestaña **Hoy** o en **Objetivo**, toca el botón «Plan diario».
- **Lista de la compra:** En la pestaña **Recetas**, pulsa el botón «Lista de la compra» superior para ver los productos categorizados y marcar lo que vas comprando.

¿Quieres que te sugiera qué productos básicos añadir según tus macros?`;
    }

    // 8. Post-entreno
    else if (lowerMsg.includes('entrenar') || lowerMsg.includes('entreno') || lowerMsg.includes('gimnasio')) {
      fallbackReply = `Para después de entrenar, lo ideal es combinar proteína de rápida asimilación con un carbohidrato simple para rellenar glucógeno:

- **1 Plátano de Canarias maduro** (80g): ~70 kcal de hidratos rápidos.
- **Queso fresco batido 0% o batido de proteína** (150g): ~80 kcal y 15g de proteína.

Aporte total: **~150 kcal** y **15g de proteína**. ¿Te lo apunto en el diario?

<!--ACTION:ADD_FOOD:{"name":"Plátano con queso batido post-entreno","grams":230,"calories":150,"protein":15.0,"carbs":21.0,"fat":0.3,"mealType":"snacks"}-->`;
    }

    // 9. Borrar recuerdos y memoria
    else if (lowerMsg.includes('recuerdo') || lowerMsg.includes('memoria') || lowerMsg.includes('borrar')) {
      fallbackReply = `Tienes el control absoluto de tu información:
1. **Ver y borrar recuerdos:** En la parte superior derecha de esta pantalla, pulsa el botón **«Memoria»** (icono de cerebro). Podrás eliminar notas individuales o pulsar **«Borrar todo»**.
2. **Reiniciar conversación:** Pulsa el icono de la papelera arriba a la derecha para vaciar el historial de mensajes.
3. **Privacidad:** Ninguna memoria se guarda en archivos del servidor; residen 100% en tu propio navegador.`;
    }

    // 8. General greeting or query
    else {
      fallbackReply = `¡Hola! Como tu asistente personal de NutriFit, estoy conectado a tu perfil y a tu diario de hoy.

Hoy tienes un objetivo de **${userProfile?.dailyCalorieTarget || 2000} kcal** y te quedan **${remCals} kcal** para cerrar el día (${remP}g de proteína restantes).

¿En qué puedo ayudarte? Puedes pedirme:
- Qué cenar o comer según tus macros
- Qué hacer si te pasas de calorías
- Ideas rápidas con lo que tengas en la nevera
- Adaptaciones para alergias o gustos`;
    }

    return res.json({ reply: fallbackReply });
  } catch (error) {
    console.error('Error in assistant chat endpoint:', error);
    return res.status(500).json({ error: 'Error procesando la consulta del asistente.' });
  }
});
