'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Clock, ArrowLeft, Video, FileText, Gamepad2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Quiz {
  id: string;
  pergunta: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  resposta_correta: 'a' | 'b' | 'c';
}

interface Tutorial {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'video' | 'manual' | 'jogo';
  conteudo_url: string | null;
  nivel: string;
  duracao_min: number;
  plataformas: { nome: string };
}

export default function TutorialDetailPage({ params }: { params: { id: string } }) {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function fetchTutorial() {
      const { data: tut } = await supabase
        .from('tutoriais')
        .select('*, plataformas(nome)')
        .eq('id', params.id)
        .single();
      if (!tut) { setLoading(false); return; }
      setTutorial(tut);

      if (tut.tipo === 'jogo') {
        const { data: qs } = await supabase
          .from('quizzes')
          .select('*')
          .eq('tutorial_id', params.id);
        if (qs) setQuizzes(qs);
      }
      setLoading(false);
    }
    fetchTutorial();
  }, [params.id]);

  function handleAnswer(opt: string) {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === quizzes[currentQ].resposta_correta) setScore(s => s + 1);
  }

  function nextQuestion() {
    if (currentQ < quizzes.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse">
      <div className="h-10 bg-accent rounded-xl mb-6 w-2/3" />
      <div className="h-80 bg-accent rounded-3xl" />
    </div>
  );

  if (!tutorial) return notFound();

  const pct = Math.round((score / (quizzes.length || 1)) * 100);
  const passed = pct >= 70;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Back */}
      <Link href="/tutoriais" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={16} /> Voltar à Galeria
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">{tutorial.plataformas?.nome}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={13} /> {tutorial.duracao_min} min
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-accent capitalize">{tutorial.nivel}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{tutorial.titulo}</h1>
        <p className="text-muted-foreground">{tutorial.descricao}</p>
      </div>

      {/* Content by tipo */}
      {tutorial.tipo === 'video' && tutorial.conteudo_url && (
        <div className="rounded-3xl overflow-hidden shadow-2xl aspect-video mb-12 bg-black">
          <iframe
            src={tutorial.conteudo_url}
            title={tutorial.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {tutorial.tipo === 'manual' && tutorial.conteudo_url && (
        <div className="mb-12 space-y-4">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-border" style={{ height: '600px' }}>
            <iframe
              src={`${tutorial.conteudo_url}#toolbar=1`}
              title={tutorial.titulo}
              className="w-full h-full"
            />
          </div>
          <a
            href={tutorial.conteudo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-primary"
          >
            <FileText size={18} /> Descarregar PDF
          </a>
        </div>
      )}

      {tutorial.tipo === 'jogo' && (
        <div className="mb-12">
          {quizzes.length === 0 ? (
            <div className="text-center py-16 bg-accent rounded-3xl">
              <Gamepad2 size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Nenhuma pergunta disponível para este tutorial.</p>
            </div>
          ) : finished ? (
            /* Score screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-3xl p-12 text-center ${passed ? 'bg-green-50 border-2 border-green-200 dark:bg-green-950/30 dark:border-green-800' : 'bg-red-50 border-2 border-red-200 dark:bg-red-950/30 dark:border-red-800'}`}
            >
              <div className="text-6xl mb-4">{passed ? '🏆' : '📚'}</div>
              <h2 className="text-3xl font-extrabold mb-2">
                {passed ? 'Parabéns! Passaste!' : 'Continua a tentar!'}
              </h2>
              <p className="text-6xl font-black my-6 text-primary">{pct}%</p>
              <p className="text-muted-foreground mb-8">
                Acertaste em <strong>{score}</strong> de <strong>{quizzes.length}</strong> perguntas.
              </p>
              {passed && (
                <div className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-6 py-3 rounded-2xl font-bold text-lg mb-8">
                  🥇 Badge conquistado: Especialista em {tutorial.plataformas?.nome}
                </div>
              )}
              <button
                onClick={() => { setCurrentQ(0); setScore(0); setSelected(null); setAnswered(false); setFinished(false); }}
                className="btn-primary mx-auto block"
              >
                Tentar Novamente
              </button>
            </motion.div>
          ) : (
            /* Quiz card */
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="bg-card border border-border rounded-3xl p-8 shadow-sm"
              >
                {/* Progress */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex-grow h-2 bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${((currentQ) / quizzes.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">{currentQ + 1}/{quizzes.length}</span>
                </div>

                <h2 className="text-xl font-bold mb-8">{quizzes[currentQ].pergunta}</h2>

                <div className="space-y-3 mb-8">
                  {(['a','b','c'] as const).map(opt => {
                    const text = quizzes[currentQ][`opcao_${opt}` as keyof Quiz] as string;
                    const isCorrect = quizzes[currentQ].resposta_correta === opt;
                    const isSelected = selected === opt;
                    let cls = 'w-full text-left p-4 rounded-2xl border-2 font-medium transition-all ';
                    if (!answered) {
                      cls += 'border-border hover:border-primary hover:bg-primary/5 cursor-pointer';
                    } else if (isCorrect) {
                      cls += 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300';
                    } else if (isSelected) {
                      cls += 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300';
                    } else {
                      cls += 'border-border opacity-50';
                    }
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <button onClick={nextQuestion} className="btn-primary w-full">
                      {currentQ < quizzes.length - 1 ? 'Próxima Pergunta →' : 'Ver Resultado'}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}
