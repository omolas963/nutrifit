import { Router, Request, Response } from 'express';
import { config } from '../config';
import { callGemini } from '../services/aiProvider';

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
      'diabetes tipo 1', 'diabetes gestacional', 'embarazada', 'embarazo', 'insuficiencia renal', 'cancer',
      'cáncer', 'medicacion para la tiroides', 'enfermedad renal'
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
    const userWeight = userProfile?.currentWeightKg || 70;
    const targetCals = userProfile?.dailyCalorieTarget || 2000;
    const targetProt = userProfile?.dailyProteinTargetGrams || Math.round(userWeight * 2);
    const targetCarbs = userProfile?.dailyCarbsTargetGrams || Math.round((targetCals * 0.45) / 4);
    const targetFat = userProfile?.dailyFatTargetGrams || Math.round((targetCals * 0.25) / 9);

    const remCals = todaySummary?.remainingCalories ?? 600;
    const remP = todaySummary?.remainingProtein ?? 35;
    const remC = todaySummary?.remainingCarbs ?? 45;
    const remG = todaySummary?.remainingFat ?? 15;

    const profileSummary = `Peso: ${userWeight} kg, Altura: ${userProfile?.heightCm || 175} cm, Género: ${userProfile?.gender || 'no especificado'}, Objetivo: ${userProfile?.goal || 'mantener'}, Calorías objetivo: ${targetCals} kcal (Proteínas: ${targetProt}g, Carbohidratos: ${targetCarbs}g, Grasas: ${targetFat}g).`;

    const diarySummary = `Calorías consumidas hoy: ${todaySummary?.calories || 0} kcal / ${targetCals} kcal. Restantes: ${remCals} kcal. Macros restantes: ${remP}g P, ${remC}g C, ${remG}g G.`;

    const entriesSummary = Array.isArray(recentEntries) && recentEntries.length > 0
      ? recentEntries.map((e: any) => `- ${e.name} (${e.grams}g, ${e.calories} kcal, ${e.protein}g P) [${e.mealType}]`).join('\n')
      : 'Aún no se han registrado alimentos hoy.';

    const recipesSummary = Array.isArray(savedRecipes) && savedRecipes.length > 0
      ? savedRecipes.map((r: any) => `- ${r.title} (${r.caloriesPerPortion} kcal/ración, ${r.prepTimeMinutes} min)`).join('\n')
      : 'Sin recetas guardadas aún.';

    const memoriesSummary = Array.isArray(memories) && memories.length > 0
      ? memories.map((m: any) => `- ${m}`).join('\n')
      : 'Sin preferencias previas guardadas.';

    const systemPrompt = `Eres el Asistente Nutricional de NutriFit, una IA conversacional de nutrición, gastronomía y salud impulsada por Gemini.

TU PERSONALIDAD Y ESTILO:
1. Habla con total naturalidad, calidez, fluidez y cercanía, exactamente como hablar con Gemini o ChatGPT, pero con especialización profunda en nutrición humana, dietética deportiva y cocina saludable.
2. NUNCA respondas con plantillas robóticas fijas ni sermones enlatados. Conversa de manera abierta, empática y motivadora.
3. Si el usuario simplemente te saluda ("hola", "buenas", "qué tal", etc.), responde con un saludo breve, simpático y natural (ej: "¡Hola! ¿Cómo estás hoy? ¿En qué te puedo echar una mano con tus comidas o tus objetivos?"), sin soltar discursos largos innecesarios.
4. Si el usuario te hace una pregunta (ej: "¿el huevo frito es sano?", "¿qué puedo cenar hoy?", "¿por qué tengo antojos?", "dame una receta con atún y tomate", o cualquier duda libre), responde de forma amena, comprensible, fundamentada en evidencia científica y con consejos prácticos.
5. Si el usuario te pide una receta o idea con los alimentos que tiene por casa (ej: "tengo atún y huevo", "qué hago con calabacín y tomate"), tu receta o propuesta DEBE usar OBLIGATORIAMENTE esos alimentos que tiene, sin inventar carnes, pescados ni ingredientes principales que no haya mencionado. Pregúntale o recomiéndale con amabilidad condimentos o básicos de despensa si los tiene a mano (aceite de oliva, sal, ajo, especias, etc.).
6. Conoces en detalle la gastronomía española y catalana, así como los alimentos y marcas habituales de supermercado (Mercadona, Lidl, Carrefour, Bonpreu, etc.).
7. Idioma: responde siempre en el idioma que hable el usuario (${isCat ? 'Catalán' : 'Español'}).

CONTEXTO DEL USUARIO (úsalo de forma sutil y contextual cuando aporte valor, sin recitarlo mecánicamente):
- Perfil: ${profileSummary}
- Diario de hoy: ${diarySummary}
- Alimentos consumidos hoy: ${entriesSummary}
- Recetas guardadas: ${recipesSummary}
- Alergias y recuerdos previos: ${memoriesSummary}

ACCIONES INTERACTIVAS ÚTILES (opcionales):
- Si le sugieres una comida o cena para hoy y quieres que pueda registrarla con 1 toque en su diario, incluye al final:
  <!--ACTION:ADD_FOOD:{"name":"Nombre del plato","grams":número,"calories":número,"protein":número,"carbs":número,"fat":número,"mealType":"cena"|"comida"|"desayuno"|"snacks"}-->
- Si le explicas una receta completa que pueda guardar en su recetario, añade:
  <!--ACTION:SAVE_RECIPE:{"title":"...","prepTimeMinutes":...,"portions":...,"caloriesPerPortion":...,"macrosPerPortion":{"protein":...,"carbs":...,"fat":...},"ingredients":[...],"steps":[...]}-->
- Si el usuario te comparte una alergia, preferencia o intolerancia ("no me gusta el pescado", "soy intolerante a la lactosa"), anótala con:
  <!--ACTION:REMEMBER:{"note":"..."}-->`;

    // Try Gemini API if key exists
    if (config.geminiApiKey) {
      try {
        const recentMessages = messages.slice(-10);
        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        for (const msg of recentMessages) {
          const role = msg.role === 'assistant' ? 'model' : 'user';
          const text = (msg.content || '').trim();
          if (!text) continue;

          // Merge consecutive same-role messages
          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += `\n${text}`;
          } else {
            contents.push({
              role,
              parts: [{ text }],
            });
          }
        }

        // Ensure first message has role 'user'
        if (contents.length > 0 && contents[0].role === 'model') {
          contents.unshift({ role: 'user', parts: [{ text: 'Hola' }] });
        }

        if (contents.length > 0) {
          const reply = await callGemini(contents, {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 1200,
          });

          if (reply && reply.trim()) {
            return res.json({ reply: reply.trim() });
          }
        }
      } catch (err) {
        console.warn('Gemini assistant call failed, using high-fidelity fallback:', err);
      }
    }

    // -------------------------------------------------------------
    // Intelligent Clinical Nutrition Fallback Engine
    // -------------------------------------------------------------
    let fallbackReply = '';
    const conversationLength = messages.length;

    // 1. Cena / Cenar / Ceno / Sopar (Dynamic with rotation to prevent repetition)
    if (lowerMsg.includes('ceno') || lowerMsg.includes('cenar') || lowerMsg.includes('sopar') || lowerMsg.includes('cena')) {
      const dinnerVariations = [
        {
          name: 'Merluza a la plancha con crema de calabacín',
          nameCat: 'Lluç a la planxa amb crema de carbassó',
          grams: 380,
          cals: 285,
          p: 32.0,
          c: 14.0,
          f: 5.0,
          desc: '180g de lomo de merluza a la plancha con 200g de crema de calabacín y puerro casera sin nata.',
          descCat: '180g de filet de lluç a la planxa amb 200g de crema de carbassó i porro casolana.',
        },
        {
          name: 'Revuelto de gambas con espárragos trigueros y champiñones',
          nameCat: 'Remenat de gambes amb espàrrecs de marge i xampinyons',
          grams: 320,
          cals: 260,
          p: 29.0,
          c: 6.0,
          f: 12.0,
          desc: '2 huevos enteros, 1 clara, 100g de gambas al ajillo suave y 120g de trigueros salteados con 1 cucharadita de AOVE.',
          descCat: '2 ous, 1 clara, 100g de gambes i 120g d espàrrecs saltejats amb un raig d oli d oliva verge extra.',
        },
        {
          name: 'Pechuga de pavo con ensalada templada de canónigos y tomate',
          nameCat: 'Pit de gall d indi amb amanida tèbia de canonges i tomàquet',
          grams: 350,
          cals: 290,
          p: 35.0,
          c: 8.0,
          f: 6.5,
          desc: '160g de solomillo de pavo con especias provenzales, 1 tomate raf y 80g de canónigos con vinagre de manzana y AOVE.',
          descCat: '160g de gall d indi a la planxa, 1 tomàquet raf i 80g de canonges amanits amb vinagre de poma i oli d oliva.',
        },
      ];

      const chosen = dinnerVariations[conversationLength % dinnerVariations.length];

      if (isCat) {
        fallbackReply = `Tenint en compte el teu perfil de ${userWeight} kg i que avui et queden **${remCals} kcal** i **${remP}g de proteïna**, et proposo una opció digestiva i altament saciant:

- **${chosen.nameCat}**: ${chosen.descCat}
- **Aportació nutricional:** **${chosen.cals} kcal** · **${chosen.p}g P** · **${chosen.c}g C** · **${chosen.f}g G**.

Satisfer el requisit proteic a la nit millora la recuperació muscular sense sobrecarregar la digestió abans de dormir.

<!--ACTION:ADD_FOOD:{"name":"${chosen.nameCat}","grams":${chosen.grams},"calories":${chosen.cals},"protein":${chosen.p},"carbs":${chosen.c},"fat":${chosen.f},"mealType":"cena"}-->`;
      } else {
        fallbackReply = `Analizando tu objetivo y considerando que te quedan unas **${remCals} kcal** y **${remP}g de proteína** para cerrar el día, te propongo esta cena:

- **${chosen.name}**: ${chosen.desc}
- **Aporte nutricional:** **${chosen.cals} kcal** · **${chosen.p}g P** · **${chosen.c}g C** · **${chosen.f}g G**.

Cumple con tus necesidades de proteína para preservar masa magra durante la noche y tiene un volumen alto con fibra para evitar despertares con hambre. Puedes registrarla directamente:

<!--ACTION:ADD_FOOD:{"name":"${chosen.name}","grams":${chosen.grams},"calories":${chosen.cals},"protein":${chosen.p},"carbs":${chosen.c},"fat":${chosen.f},"mealType":"cena"}-->`;
      }
    }

    // 2. ¿Por qué no bajo de peso? / Estancamiento
    else if (
      lowerMsg.includes('no bajo de peso') ||
      lowerMsg.includes('no adelgazo') ||
      lowerMsg.includes('estancad') ||
      lowerMsg.includes('por que no bajo') ||
      lowerMsg.includes('por qué no bajo') ||
      lowerMsg.includes('no pierdo peso')
    ) {
      fallbackReply = `El estancamiento en la báscula es una de las consultas clínicas más frecuentes. Cuando el peso no baja durante 2 o 3 semanas, suele deberse a alguno de estos factores fisiológicos reales:

1. **Retención de líquidos por cortisol o entrenamiento:** Si has aumentado la intensidad o entrenas fuerza, las microrroturas musculares retienen agua intramuscular (hasta 1.5 - 2 kg), enmascarando la pérdida real de grasa.
2. **Disminución inconsciente del NEAT (actividad no deportiva):** Al estar en déficit, el cuerpo reduce gestos cotidianos (caminar menos, levantarse menos). Apunta a un mínimo de **8.000 a 10.000 pasos diarios**.
3. **Calorías invisibles en el pesaje:** Aceites para cocinar (+120 kcal por cucharada no contada), picoteos casuales o salsas comerciales.
4. **Desviaciones del fin de semana:** Un superávit de 800 kcal el sábado y domingo puede compensar el déficit de lunes a viernes.

**Plan de acción para esta semana:**
- Pésate solo **3 mañanas por semana en ayunas** tras ir al baño y haz la media semanal.
- Con tu peso actual (${userWeight} kg) y tu objetivo de ${targetCals} kcal, mantén la ingesta constante 7 días consecutivos antes de bajar más calorías.`;
    }

    // 3. ¿Cómo repartir macros? / Distribución de macros
    else if (
      lowerMsg.includes('repartir macros') ||
      lowerMsg.includes('distribucion de macros') ||
      lowerMsg.includes('distribución de macros') ||
      lowerMsg.includes('cuanta proteina') ||
      lowerMsg.includes('cuánta proteína') ||
      lowerMsg.includes('reparto de macros')
    ) {
      const recProtGrams = Math.round(userWeight * 2.0);
      const recFatGrams = Math.round(userWeight * 0.9);
      const calsFromProtFat = (recProtGrams * 4) + (recFatGrams * 9);
      const remainingForCarbs = Math.max(200, targetCals - calsFromProtFat);
      const recCarbsGrams = Math.round(remainingForCarbs / 4);

      fallbackReply = `Para tu peso actual de **${userWeight} kg** y tu objetivo diario de **${targetCals} kcal**, la distribución de macronutrientes con mayor respaldo clínico y deportivo es:

- **Proteína (2.0 g/kg):** **${recProtGrams}g al día** (~${recProtGrams * 4} kcal). Esencial para mantener masa magra, saciedad y termogénesis inducida por la dieta.
- **Grasas saludables (0.9 g/kg):** **${recFatGrams}g al día** (~${recFatGrams * 9} kcal). Claves para el entorno hormonal, absorción de vitaminas liposolubles y salud celular.
- **Carbohidratos:** **${recCarbsGrams}g al día** (~${remainingForCarbs} kcal). La fuente principal de energía glucolítica para rendir en los entrenamientos y preservar la tiroides.

**Distribución práctica en tus 4 comidas:**
1. **Desayuno (~25%):** ~${Math.round(recProtGrams * 0.25)}g P · ~${Math.round(recCarbsGrams * 0.3)}g C · ~${Math.round(recFatGrams * 0.25)}g G.
2. **Comida (~35%):** ~${Math.round(recProtGrams * 0.35)}g P · ~${Math.round(recCarbsGrams * 0.4)}g C · ~${Math.round(recFatGrams * 0.35)}g G.
3. **Merienda (~15%):** ~${Math.round(recProtGrams * 0.15)}g P · ~${Math.round(recCarbsGrams * 0.15)}g C · ~${Math.round(recFatGrams * 0.15)}g G.
4. **Cena (~25%):** ~${Math.round(recProtGrams * 0.25)}g P · ~${Math.round(recCarbsGrams * 0.15)}g C · ~${Math.round(recFatGrams * 0.25)}g G.`;
    }

    // 4. Me paso de calorías
    else if (lowerMsg.includes('paso de calorias') || lowerMsg.includes('paso de calorías') || lowerMsg.includes('pasado de calorias') || lowerMsg.includes('me he pasado')) {
      fallbackReply = `¡Tranquilidad total! Pasarse de calorías en un día puntual es completamente normal y **no arruina tu progreso ni tu composición corporal**. El balance energético real funciona por promedios semanales, no en periodos de 24 horas.

**Qué te recomiendo hacer hoy:**
1. **Cero compensaciones extremas:** No te saltes comidas mañana ni hagas ayunos forzados.
2. **Bebe agua y camina:** Mantén una buena hidratación para aliviar la retención de líquidos si comiste más sodio o hidratos.
3. **Retoma tu rutina mañana:** Vuelve a tus platos habituales como si nada hubiera pasado.

La consistencia mes a mes es lo que marca la diferencia, no la perfección diaria.`;
    }

    // 5. Hambre por la noche / Ansiedad nocturna
    else if (lowerMsg.includes('hambre por la noche') || lowerMsg.includes('antojo nocturno') || lowerMsg.includes('fam a la nit') || lowerMsg.includes('antojo')) {
      fallbackReply = `Tener hambre por la noche suele deberse a dos motivos: o comiste poca proteína/fibra durante el día, o es hambre fisiológica por el descanso.

Te propongo tres opciones rápidas de menos de 150 kcal que calman el apetito y favorecen el sueño:
1. **Yogur griego natural o queso fresco batido 0%** (125g, ~70 kcal, rico en caseína de absorción lenta).
2. **Un puñado mediano de nueces o almendras** (15g, ~90 kcal, magnesio y grasas buenas).
3. **Infusión relajante (manzanilla o tila) con una cucharadita de miel o canela**.

¿Quieres que añadamos un snack ligero de queso batido a tu diario?
<!--ACTION:ADD_FOOD:{"name":"Queso fresco batido 0% desnatado","grams":125,"calories":60,"protein":10.5,"carbs":4.5,"fat":0.1,"mealType":"snacks"}-->`;
    }

    // 6. Alergia a los frutos secos
    else if (lowerMsg.includes('frutos secos') || lowerMsg.includes('alergia') || lowerMsg.includes('fruits secs')) {
      fallbackReply = `Anotado en tu memoria clínica: **alergia estricta a los frutos secos**.

A partir de ahora excluiré nueces, almendras, avellanas, cacahuetes y pistachos de todas mis recomendaciones y recetas. Como alternativas excelentes para obtener grasas saludables y textura te recomendaré:
- **Aceite de oliva virgen extra**
- **Aguacate maduro**
- **Semillas de lino o chía trituradas**

<!--ACTION:REMEMBER:{"note":"Alergia estricta a los frutos secos (nueces, almendras, avellanas, cacahuetes)"}-->`;
    }

    // 7. Ideas con lo que tengo en la nevera
    else if (lowerMsg.includes('nevera') || lowerMsg.includes('que tengo') || lowerMsg.includes('despensa')) {
      fallbackReply = `Dime qué 3 o 4 ingredientes tienes por la nevera (ej: huevos, tomate, latas de atún, arroz o verduras) y te diseño al instante una receta adaptada a tus macros.

Si tienes **huevos y verduras**, una tortilla francesa jugosa con pisto o calabacín salteado se hace en 8 minutos y te aporta ~240 kcal y 18g de proteína.`;
    }

    // 8. Receta para guardar
    else if (lowerMsg.includes('guardar receta') || lowerMsg.includes('receta')) {
      fallbackReply = `Aquí tienes una receta mediterránea completa lista para guardar en tu recetario:

### Salmón al horno con espárragos trigueros
- **Tiempo:** 20 minutos | **Porciones:** 1
- **Nutrición:** ~380 kcal | 38g Proteína | 4g Carbohidratos | 21g Grasas

<!--ACTION:SAVE_RECIPE:{"title":"Salmón al horno con espárragos trigueros","prepTimeMinutes":20,"portions":1,"caloriesPerPortion":380,"macrosPerPortion":{"protein":38,"carbs":4,"fat":21},"ingredients":[{"name":"Lomo de salmón fresco","grams":180,"calories":320,"protein":36,"carbs":0,"fat":20},{"name":"Espárragos trigueros","grams":120,"calories":30,"protein":2,"carbs":4,"fat":0.5},{"name":"Aceite de oliva virgen extra","grams":5,"calories":44,"protein":0,"carbs":0,"fat":5}],"steps":["Precalentar horno a 190°C.","Colocar el salmón y los espárragos en bandeja con papel de hornear.","Pincelar con aceite de oliva, sal y eneldo.","Hornear 15 minutos hasta que esté tierno y dorado."]}-->`;
    }

    // 9. Lista de la compra o plan
    else if (lowerMsg.includes('compra') || lowerMsg.includes('lista') || lowerMsg.includes('plan')) {
      fallbackReply = `Para gestionar tus planes y compras dispones de dos accesos directos en la app:
- **Crear un plan nuevo:** En la pestaña **Hoy** o en **Objetivo**, toca el botón «Plan diario».
- **Lista de la compra:** En la pestaña **Recetas**, pulsa el botón «Lista de la compra» superior para ver los productos categorizados y marcar lo que vas comprando.

¿Quieres que te sugiera qué productos básicos añadir según tus macros?`;
    }

    // 10. Post-entreno
    else if (lowerMsg.includes('entrenar') || lowerMsg.includes('entreno') || lowerMsg.includes('gimnasio')) {
      fallbackReply = `Para después de entrenar, lo ideal es combinar proteína de rápida asimilación con un carbohidrato simple para rellenar glucógeno:

- **1 Plátano de Canarias maduro** (80g): ~70 kcal de hidratos rápidos.
- **Queso fresco batido 0% o batido de proteína** (150g): ~80 kcal y 15g de proteína.

Aporte total: **~150 kcal** y **15g de proteína**. ¿Te lo apunto en el diario?

<!--ACTION:ADD_FOOD:{"name":"Plátano con queso batido post-entreno","grams":230,"calories":150,"protein":15.0,"carbs":21.0,"fat":0.3,"mealType":"snacks"}-->`;
    }

    // 11. Digestión, gases o hinchazón
    else if (lowerMsg.includes('hinchazon') || lowerMsg.includes('hinchazón') || lowerMsg.includes('gases') || lowerMsg.includes('inflamacion') || lowerMsg.includes('inflamación')) {
      fallbackReply = `La sensación de hinchazón o gases abdominales casi siempre responde a uno de estos motivos dietéticos:
1. **Consumo excesivo de polialcoholes:** Edulcorantes como maltitol, sorbitol o xilitol (muy habituales en barritas proteicas y chicles sin azúcar) fermentan rápidamente en el colon.
2. **Subida brusca de fibra:** Pasar de 15g a 35g de fibra al día sin suficiente agua produce gases. Aumenta las legumbres y verduras de forma gradual.
3. **Comer rápido o masticar poco:** Provoca aerofagia (tragar aire al comer).
4. **Legumbres sin reposo:** Remojar las legumbres 12 horas con una hoja de laurel o triturarlas (hummus) reduce los oligosacáridos no digeribles.

Si la hinchazón persiste más de 2 semanas de forma dolorosa, consúltalo con tu médico para descartar intolerancias a la fructosa o lactosa.`;
    }

    // 12. Borrar recuerdos y memoria
    else if (lowerMsg.includes('recuerdo') || lowerMsg.includes('memoria') || lowerMsg.includes('borrar')) {
      fallbackReply = `Tienes el control absoluto de tu información:
1. **Ver y borrar recuerdos:** En la parte superior derecha de esta pantalla, pulsa el botón **«Memoria»** (icono de cerebro). Podrás eliminar notas individuales o pulsar **«Borrar todo»**.
2. **Reiniciar conversación:** Pulsa el icono de la papelera arriba a la derecha para vaciar el historial de mensajes.
3. **Privacidad:** Ninguna memoria se guarda en archivos del servidor; residen 100% en tu propio navegador.`;
    }

    // 13. General greeting or query
    else {
      fallbackReply = `¡Hola! ¿Cómo estás hoy? ¿En qué te puedo echar una mano con tus comidas o tus objetivos? Puedes preguntarme qué comer hoy según tus calorías restantes (${remCals} kcal), ideas con lo que tengas en la nevera o cualquier duda sobre nutrición.`;
    }

    return res.json({ reply: fallbackReply });
  } catch (error) {
    console.error('Error in assistant chat endpoint:', error);
    return res.status(500).json({ error: 'Error procesando la consulta del asistente.' });
  }
});
