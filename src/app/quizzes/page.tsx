'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HelpCircle, ChevronRight, CheckCircle, XCircle, Award, RotateCcw, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizWithMeta {
  id: string;
  pergunta: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  resposta_correta: 'a' | 'b' | 'c';
  tutorial_id: string;
  tutoriais: { titulo: string; plataformas: { nome: string } };
}

interface GroupedSet {
  plataforma: string;
  titulo: string;
  tutorial_id: string;
  perguntas: QuizWithMeta[];
}

export default function QuizzesPage() {
  const [groups, setGroups] = useState<GroupedSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<GroupedSet | null>(null);

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; selected: string; right: string }[]>([]);

  useEffect(() => {
    async function fetchQuizzes() {
      const { data } = await supabase
        .from('quizzes')
        .select('*, tutoriais(titulo, plataformas(nome))');

      if (!data) { setLoading(false); return; }

      // Group by tutorial
      const map = new Map<string, GroupedSet>();
      for (const q of data as QuizWithMeta[]) {
        if (!map.has(q.tutorial_id)) {
          map.set(q.tutorial_id, {
            plataforma: q.tutoriais?.plataformas?.nome || 'Geral',
            titulo: q.tutoriais?.titulo || 'Quiz',
            tutorial_id: q.tutorial_id,
            perguntas: [],
          });
        }
        map.get(q.tutorial_id)!.perguntas.push(q);
      }
      setGroups(Array.from(map.values()));
      setLoading(false);
    }
    fetchQuizzes();
  }, []);

  function startQuiz(g: GroupedSet) {
    setActiveGroup(g);
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setAnswers([]);
  }

  function handleAnswer(opt: string) {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    const correct = activeGroup!.perguntas[currentQ].resposta_correta === opt;
    if (correct) setScore(s => s + 1);
    setAnswers(prev => [...prev, { correct, selected: opt, right: activeGroup!.perguntas[currentQ].resposta_correta }]);
  }

  function nextQuestion() {
    if (!activeGroup) return;
    if (currentQ < activeGroup.perguntas.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
      // Save to Supabase progresso (no user auth yet — anonymous)
      supabase.from('progresso').insert({
        tutorial_id: activeGroup.tutorial_id,
        completado: true,
        pontuacao: Math.round((score / activeGroup.perguntas.length) * 100),
        badge_atribuido: (score / activeGroup.perguntas.length) >= 0.7 ? `Expert em ${activeGroup.plataforma}` : null,
      }).then(() => {});
    }
  }

  const pct = activeGroup ? Math.round(((score) / activeGroup.perguntas.length) * 100) : 0;
  const passed = pct >= 70;

  // --- List View ---
  if (!activeGroup) {
    // Group by plataforma
    const byPlat = new Map<string, GroupedSet[]>();
    for (const g of groups) {
      if (!byPlat.has(g.plataforma)) byPlat.set(g.plataforma, []);
      byPlat.get(g.plataforma)!.push(g);
    }

    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-4xl font-extrabold mb-4">Quizzes</h1>
          <p className="text-muted-foreground text-lg">Testa os teus conhecimentos e ganha badges ao atingir 70% ou mais.</p>
        </header>

        {loading ? (
          <div className="space-y-8">
            {[1,2].map(i => <div key={i} className="h-48 bg-accent animate-pulse rounded-3xl" />)}
          </div>
        ) : (
          <div className="space-y-12">
            {Array.from(byPlat.entries()).map(([plat, sets]) => (
              <section key={plat}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-2 h-6 bg-primary rounded-full" />
                  {plat}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sets.map(g => (
                    <motion.div
                      key={g.tutorial_id}
                      whileHover={{ y: -4 }}
                      className="card-hover p-6 cursor-pointer"
                      onClick={() => startQuiz(g)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">{g.plataforma}</span>
                        <span className="text-xs text-muted-foreground">{g.perguntas.length} perguntas</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">{g.titulo}</h3>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Award size={16} /> Badge disponível
                        </div>
                        <div className="flex items-center gap-1 text-primary font-semibold text-sm">
                          Iniciar <ChevronRight size={16} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
            {groups.length === 0 && (
              <div className="text-center py-20 bg-accent rounded-3xl">
                <HelpCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium text-muted-foreground">Nenhum quiz disponível de momento.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- Quiz Active View ---
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button onClick={() => setActiveGroup(null)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={16} /> Voltar aos Quizzes
      </button>

      <header className="mb-8">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-3 inline-block">{activeGroup.plataforma}</span>
        <h1 className="text-2xl font-extrabold">{activeGroup.titulo}</h1>
      </header>

      <AnimatePresence mode="wait">
        {finished ? (
          /* Result Screen */
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-3xl p-10 text-center ${passed ? 'bg-green-50 border-2 border-green-200 dark:bg-green-950/30 dark:border-green-800' : 'bg-red-50 border-2 border-red-200 dark:bg-red-950/30 dark:border-red-800'}`}
          >
            <div className="text-6xl mb-4">{passed ? '🏆' : '📚'}</div>
            <h2 className="text-3xl font-extrabold mb-1">{passed ? 'Excelente!' : 'Quase lá!'}</h2>
            <p className="text-muted-foreground mb-6">Acertaste em {score} de {activeGroup.perguntas.length} perguntas</p>
            <p className="text-7xl font-black text-primary mb-8">{pct}%</p>

            {passed && (
              <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-6 py-3 rounded-2xl font-bold text-base mb-8">
                <Award size={20} /> Badge: Expert em {activeGroup.plataforma}
              </div>
            )}

            {/* Feedback per question */}
            <div className="text-left space-y-3 my-8">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Revisão das Respostas</h3>
              {answers.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-sm ${a.correct ? 'bg-green-100/50 dark:bg-green-950/20' : 'bg-red-100/50 dark:bg-red-950/20'}`}>
                  {a.correct ? <CheckCircle size={18} className="text-green-500 flex-shrink-0" /> : <XCircle size={18} className="text-red-500 flex-shrink-0" />}
                  <span><strong>Pergunta {i+1}:</strong> {a.correct ? 'Correto' : `Errado — Resposta certa: ${a.right.toUpperCase()}`}</span>
                </div>
              ))}
            </div>

            <button onClick={() => startQuiz(activeGroup)} className="btn-primary inline-flex items-center gap-2">
              <RotateCcw size={16} /> Tentar Novamente
            </button>
          </motion.div>
        ) : (
          /* Question Card */
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="bg-card border border-border rounded-3xl p-8 shadow-sm"
          >
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-grow h-2 bg-accent rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(currentQ / activeGroup.perguntas.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">{currentQ + 1} / {activeGroup.perguntas.length}</span>
            </div>

            <h2 className="text-xl font-bold mb-8">{activeGroup.perguntas[currentQ].pergunta}</h2>

            <div className="space-y-3 mb-8">
              {(['a','b','c'] as const).map(opt => {
                const text = activeGroup.perguntas[currentQ][`opcao_${opt}` as keyof QuizWithMeta] as string;
                const isCorrect = activeGroup.perguntas[currentQ].resposta_correta === opt;
                const isSelected = selected === opt;
                let cls = 'w-full text-left p-4 rounded-2xl border-2 font-medium transition-all ';
                if (!answered) cls += 'border-border hover:border-primary hover:bg-primary/5 cursor-pointer';
                else if (isCorrect) cls += 'border-green-500 bg-green-50 dark:bg-green-950/30';
                else if (isSelected) cls += 'border-red-500 bg-red-50 dark:bg-red-950/30';
                else cls += 'border-border opacity-40';
                return (
                  <button key={opt} className={cls} onClick={() => handleAnswer(opt)} disabled={answered}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase">{opt}</span>
                      {text}
                      {answered && isCorrect && <CheckCircle size={18} className="ml-auto text-green-500" />}
                      {answered && isSelected && !isCorrect && <XCircle size={18} className="ml-auto text-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className={`p-4 rounded-2xl mb-4 text-sm font-medium ${selected === activeGroup.perguntas[currentQ].resposta_correta ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300'}`}>
                  {selected === activeGroup.perguntas[currentQ].resposta_correta
                    ? '✅ Correto! Muito bem!'
                    : `❌ Errado. A resposta correta era a opção ${activeGroup.perguntas[currentQ].resposta_correta.toUpperCase()}.`}
                </div>
                <button onClick={nextQuestion} className="btn-primary w-full">
                  {currentQ < activeGroup.perguntas.length - 1 ? 'Próxima Pergunta →' : 'Ver Resultado Final'}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
