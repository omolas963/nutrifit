import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { apiChatAssistant } from '../services/api';
import { MealType, FoodEntry, Recipe } from '../types';
import { stepsService } from '../services/stepsService';
import {
  Sparkles,
  Send,
  Loader2,
  Brain,
  Trash2,
  Plus,
  BookmarkPlus,
  AlertCircle,
  X,
  CheckCircle2,
  Utensils
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: Array<{
    type: 'ADD_FOOD' | 'SAVE_RECIPE' | 'REMEMBER';
    payload: any;
    executed?: boolean;
  }>;
}

export const AssistantPage: React.FC = () => {
  const { profile, foodEntries, selectedDate, addFood, saveRecipe, recipes, showToast } = useApp();

  // Load chat messages from localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem('nutrifit_assistant_history');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `¡Hola! Soy tu asistente de **NutriFit**. Pregúntame lo que necesites sobre nutrición, cómo perder grasa o ganar músculo, o qué cocinar con lo que tengas en la nevera. Iré directo a responder exactamente lo que me pidas, sin rodeos.`,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // User persistent memories stored in localStorage
  const [memories, setMemories] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('nutrifit_assistant_memories');
      return stored ? JSON.parse(stored) : [
        'Prefiere la dieta mediterránea tradicional con aceite de oliva virgen extra',
      ];
    } catch {
      return [];
    }
  });

  const [showMemoriesModal, setShowMemoriesModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nutrifit_assistant_history', JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  }, [messages]);

  // Save memories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nutrifit_assistant_memories', JSON.stringify(memories));
    } catch (e) {
      console.error(e);
    }
  }, [memories]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Calculate today's summary
  const todayEntries = foodEntries.filter((f) => f.date === selectedDate);
  const consumedCalories = todayEntries.reduce((s, e) => s + e.calories, 0);
  const consumedProtein = todayEntries.reduce((s, e) => s + e.protein, 0);
  const consumedCarbs = todayEntries.reduce((s, e) => s + e.carbs, 0);
  const consumedFat = todayEntries.reduce((s, e) => s + e.fat, 0);

  const targetCalories = profile?.dailyCalorieTarget || 2000;
  const targetProtein = profile?.dailyProteinTargetGrams || 140;
  const targetCarbs = profile?.dailyCarbsTargetGrams || 220;
  const targetFat = profile?.dailyFatTargetGrams || 65;

  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  const remainingProtein = Math.max(0, targetProtein - consumedProtein);
  const remainingCarbs = Math.max(0, targetCarbs - consumedCarbs);
  const remainingFat = Math.max(0, targetFat - consumedFat);

  // Parse action tags from AI response
  const parseActionTags = (text: string) => {
    const actions: Array<{ type: 'ADD_FOOD' | 'SAVE_RECIPE' | 'REMEMBER'; payload: any }> = [];
    const actionRegex = /<!--ACTION:(ADD_FOOD|SAVE_RECIPE|REMEMBER):(.*?)-->/g;
    let match;

    while ((match = actionRegex.exec(text)) !== null) {
      try {
        const type = match[1] as any;
        const payload = JSON.parse(match[2]);
        actions.push({ type, payload });
      } catch (e) {
        console.error('Error parsing action tag:', e);
      }
    }

    const cleanContent = text.replace(actionRegex, '').trim();
    return { cleanContent, actions };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const payload = {
        messages: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        userProfile: profile,
        todaySummary: {
          calories: consumedCalories,
          targetCalories,
          remainingCalories,
          protein: Math.round(consumedProtein),
          targetProtein,
          remainingProtein: Math.round(remainingProtein),
          carbs: Math.round(consumedCarbs),
          targetCarbs,
          remainingCarbs: Math.round(remainingCarbs),
          fat: Math.round(consumedFat),
          targetFat,
          remainingFat: Math.round(remainingFat),
        },
        recentEntries: todayEntries.map((e) => ({
          name: e.name,
          grams: e.grams,
          calories: e.calories,
          protein: e.protein,
          mealType: e.mealType,
        })),
        stepSummary: {
          todaySteps: stepsService.getState().todaySteps,
          todayCalories: stepsService.getState().todayCalories,
          includeInCalorieGoal: stepsService.getState().includeCaloriesInDailyGoal,
        },
        savedRecipes: recipes.map((r) => ({
          title: r.title,
          caloriesPerPortion: r.caloriesPerPortion,
          prepTimeMinutes: r.prepTimeMinutes,
        })),
        memories,
      };

      const rawReply = await apiChatAssistant(payload);
      const { cleanContent, actions } = parseActionTags(rawReply);

      // Handle any memory additions automatically
      actions.forEach((act) => {
        if (act.type === 'REMEMBER' && act.payload?.note) {
          const newNote = act.payload.note.trim();
          if (!memories.includes(newNote)) {
            setMemories((m) => [...m, newNote]);
          }
        }
      });

      // Streaming typing effect
      const assistantMsgId = `asst-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          actions: [],
        },
      ]);
      setIsThinking(false);

      const words = cleanContent.split(' ');
      let currentContent = '';
      for (let i = 0; i < words.length; i++) {
        currentContent += (i > 0 ? ' ' : '') + words[i];
        const isLast = i === words.length - 1;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: currentContent,
                  actions: isLast ? actions.map((a) => ({ ...a, executed: false })) : [],
                }
              : m
          )
        );
        if (!isLast && i % 2 === 0) {
          await new Promise((r) => setTimeout(r, 16));
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          role: 'assistant',
          content: 'Disculpa, hubo un problema al conectar con el servidor. Por favor, inténtalo de nuevo.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Execute interactive action: Add Food to diary
  const handleExecuteAddFood = async (msgId: string, actionIdx: number, item: any) => {
    const entry: Omit<FoodEntry, 'id'> = {
      name: item.name,
      grams: item.grams || 100,
      calories: item.calories || 150,
      protein: item.protein || 10,
      carbs: item.carbs || 10,
      fat: item.fat || 5,
      source: 'Estimado por IA',
      isEstimated: true,
      mealType: (item.mealType as MealType) || 'cena',
      date: selectedDate,
      loggedAt: new Date().toISOString(),
    };

    await addFood(entry);
    showToast(`Añadido ${entry.name} (${entry.grams}g) a ${entry.mealType}`, 'success');

    // Mark as executed
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.actions && msg.actions[actionIdx]) {
          const updatedActions = [...msg.actions];
          updatedActions[actionIdx] = { ...updatedActions[actionIdx], executed: true };
          return { ...msg, actions: updatedActions };
        }
        return msg;
      })
    );
  };

  // Execute interactive action: Save Recipe
  const handleExecuteSaveRecipe = async (msgId: string, actionIdx: number, rec: any) => {
    const newRecipe: Recipe = {
      id: `rec-${Date.now()}`,
      title: rec.title,
      description: rec.description || 'Receta recomendada por tu Asistente NutriFit',
      prepTimeMinutes: rec.prepTimeMinutes || 20,
      portions: rec.portions || 1,
      isFavorite: true,
      ingredients: rec.ingredients || [],
      steps: rec.steps || [],
      caloriesPerPortion: rec.caloriesPerPortion || 350,
      proteinPerPortion: rec.macrosPerPortion?.protein || 25,
      carbsPerPortion: rec.macrosPerPortion?.carbs || 30,
      fatPerPortion: rec.macrosPerPortion?.fat || 10,
      createdAt: new Date().toISOString(),
    };

    await saveRecipe(newRecipe);
    showToast(`Receta "${newRecipe.title}" guardada en tus recetas`, 'success');

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.actions && msg.actions[actionIdx]) {
          const updatedActions = [...msg.actions];
          updatedActions[actionIdx] = { ...updatedActions[actionIdx], executed: true };
          return { ...msg, actions: updatedActions };
        }
        return msg;
      })
    );
  };

  const handleClearHistory = () => {
    if (confirm('¿Deseas reiniciar la conversación del asistente?')) {
      const resetMsg: ChatMessage = {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        content: 'Conversación reiniciada. ¿Qué consulta o plan deseas revisar ahora?',
        timestamp: new Date().toISOString(),
      };
      setMessages([resetMsg]);
      showToast('Historial reiniciado', 'info');
    }
  };

  const handleRemoveMemory = (index: number) => {
    setMemories((m) => m.filter((_, i) => i !== index));
    showToast('Recuerdo eliminado', 'info');
  };

  const quickPrompts = [
    '¿Cómo puedo bajar de peso?',
    '¿Qué ceno hoy?',
    'Me paso de calorías',
    'Tengo hambre por la noche',
    'Ideas con lo que tengo en la nevera',
    'Què puc sopar si vull poques calories?',
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-8.5rem)] w-full max-w-[480px] mx-auto animate-in fade-in duration-200">
      {/* Header bar with Disclaimer and Memory toggle */}
      <div className="bg-cream-100 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl p-3 mb-2 shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-solar flex items-center justify-center text-bark-900 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-bark-900 dark:text-dark-text leading-tight">
                Asistente NutriFit
              </h3>
              <p className="text-[11px] text-bark-500 dark:text-dark-muted">
                Restantes hoy: {remainingCalories} kcal · {Math.round(remainingProtein)}g P
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowMemoriesModal(true)}
              className="py-1 px-2.5 rounded-xl bg-white dark:bg-dark-card border border-cream-200 dark:border-dark-border text-xs font-bold text-bark-700 dark:text-dark-muted hover:border-solar flex items-center space-x-1 shadow-2xs"
              title="Ver preferencias y notas que recuerda el asistente"
            >
              <Brain className="w-3.5 h-3.5 text-solar-700" />
              <span>Memoria ({memories.length})</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-bark-400 hover:text-red-500 rounded-xl"
              title="Borrar conversación"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Healthcare disclaimer banner */}
        <div className="text-[10px] text-bark-500 dark:text-dark-muted flex items-center space-x-1 border-t border-cream-200/80 dark:border-dark-border/60 pt-1.5">
          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
          <span>
            Orientación nutricional basada en tus datos. No sustituye el diagnóstico ni criterio médico o dietista colegiado.
          </span>
        </div>
      </div>

      {/* Quick Prompts Chips Carousel */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none shrink-0">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="py-1 px-3 bg-white dark:bg-dark-surface border border-cream-200 dark:border-dark-border hover:border-solar rounded-full text-xs font-medium text-bark-800 dark:text-dark-text whitespace-nowrap shadow-2xs transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                msg.role === 'user'
                  ? 'bg-solar text-bark-900 font-medium rounded-br-none shadow-xs'
                  : 'bg-white dark:bg-dark-surface text-bark-900 dark:text-dark-text border border-cream-200 dark:border-dark-border rounded-bl-none shadow-xs'
              }`}
            >
              {/* Message text with basic Markdown handling */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Action Cards (Add Food / Save Recipe) */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-cream-200 dark:border-dark-border">
                  {msg.actions.map((act, idx) => {
                    if (act.type === 'ADD_FOOD') {
                      const f = act.payload;
                      return (
                        <div
                          key={idx}
                          className="p-2.5 bg-solar-50 dark:bg-solar/10 border border-solar/40 rounded-xl space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-bark-900 dark:text-solar">
                              {f.name}
                            </span>
                            <span className="text-[10px] font-semibold text-bark-500 capitalize">
                              {f.mealType || 'Comida'}
                            </span>
                          </div>
                          <p className="text-[11px] text-bark-600 dark:text-dark-muted">
                            {f.grams}g · {f.calories} kcal · {f.protein}g P · {f.carbs}g C · {f.fat}g G
                          </p>
                          <button
                            type="button"
                            disabled={act.executed}
                            onClick={() => handleExecuteAddFood(msg.id, idx, f)}
                            className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 shadow-2xs transition-colors ${
                              act.executed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-solar hover:bg-solar-600 text-bark-900'
                            }`}
                          >
                            {act.executed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Añadido al diario de hoy</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Añadir a mi diario</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    }

                    if (act.type === 'SAVE_RECIPE') {
                      const r = act.payload;
                      return (
                        <div
                          key={idx}
                          className="p-2.5 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-xl space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-bark-900 dark:text-dark-text">
                              {r.title}
                            </span>
                            <span className="text-[10px] text-bark-500">
                              {r.prepTimeMinutes || 20} min
                            </span>
                          </div>
                          <p className="text-[11px] text-bark-600 dark:text-dark-muted">
                            {r.caloriesPerPortion} kcal / ración
                          </p>
                          <button
                            type="button"
                            disabled={act.executed}
                            onClick={() => handleExecuteSaveRecipe(msg.id, idx, r)}
                            className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 shadow-2xs transition-colors ${
                              act.executed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-bark-900 dark:bg-dark-elevated text-white hover:bg-bark-800'
                            }`}
                          >
                            {act.executed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Receta guardada</span>
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="w-3.5 h-3.5" />
                                <span>Guardar en mis recetas</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              )}
            </div>
            <span className="text-[9px] text-bark-400 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center space-x-2 p-3 bg-white dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-2xl w-fit shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-solar-700 dark:text-solar" />
            <span className="text-xs text-bark-600 dark:text-dark-muted font-medium">
              Analizando tu diario y pensando respuesta...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field & Send Button */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntale al asistente sobre tus comidas o macros..."
            className="flex-1 py-3 px-4 bg-white dark:bg-dark-surface border border-cream-300 dark:border-dark-border rounded-2xl text-xs font-medium text-bark-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-solar shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="p-3 bg-solar hover:bg-solar-600 active:scale-95 disabled:opacity-40 text-bark-900 rounded-2xl shadow-sm transition-transform shrink-0"
            aria-label="Enviar mensaje"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* Memory Viewer Modal */}
      {showMemoriesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bark-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-card border border-cream-300 dark:border-dark-border rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-cream-200 dark:border-dark-border pb-3">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-solar-700" />
                <h4 className="font-display font-bold text-base text-bark-900 dark:text-dark-text">
                  Memoria del Asistente
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowMemoriesModal(false)}
                className="p-1 text-bark-400 hover:text-bark-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-bark-600 dark:text-dark-muted">
              El asistente recuerda tus gustos, alergias e indicaciones para personalizar sus sugerencias. Puedes eliminar cualquier nota cuando quieras:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {memories.length === 0 ? (
                <p className="text-xs text-bark-400 text-center py-4">
                  Aún no hay memorias guardadas.
                </p>
              ) : (
                memories.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-cream-50 dark:bg-dark-surface border border-cream-200 dark:border-dark-border rounded-xl flex items-center justify-between space-x-2 text-xs text-bark-800 dark:text-dark-text"
                  >
                    <span>{note}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMemory(idx)}
                      className="p-1 text-bark-400 hover:text-red-500 shrink-0"
                      title="Eliminar recuerdo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setMemories([]);
                  showToast('Todas las memorias han sido borradas', 'info');
                }}
                className="text-xs text-red-500 font-bold hover:underline"
              >
                Borrar todo
              </button>
              <button
                type="button"
                onClick={() => setShowMemoriesModal(false)}
                className="py-1.5 px-4 bg-solar text-bark-900 font-bold rounded-xl text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
