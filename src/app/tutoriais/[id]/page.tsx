'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Clock, ArrowLeft, FileText, Gamepad2, CheckCircle, XCircle, Trophy, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { registarProgresso } from '@/app/actions/progresso';
import SimulacaoFormulario from '@/components/jogos/SimulacaoFormulario';
import JogoCorrespondencia from '@/components/jogos/JogoCorrespondencia';

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
  tipo: 'video' | 'manual' | 'questionario' | 'jogo';
  conteudo_url: string | null;
  nivel: string;
  duracao_min: number;
  plataformas: { nome: string };
}

export default function TutorialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  const [jaConcluido, setJaConcluido] = useState(false);
  const [pontuacaoAnterior, setPontuacaoAnterior] = useState<number | null>(null);
  const [jogoConteudo, setJogoConteudo] = useState<any>(null);
  const [pontuacaoJogoNovo, setPontuacaoJogoNovo] = useState(0);

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session: s } }: { data: { session: Session | null } }) => {
      setUser(s?.user ?? null);
    });

    // Escutar mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!user) return;
    async function checkProgresso() {
      const { data } = await supabase
        .from('progresso')
        .select('completado, pontuacao')
        .eq('utilizador_id', user.id)
        .eq('tutorial_id', id)
        .single();
      if (data?.completado) {
        setJaConcluido(true);
        setPontuacaoAnterior(data.pontuacao ?? null);
      }
    }
    checkProgresso();
  }, [user, id]);

  useEffect(() => {
    async function fetchTutorial() {
      const { data: tut } = await supabase
        .from('tutoriais')
        .select('*, plataformas(nome)')
        .eq('id', id)
        .single();
      if (!tut) { setLoading(false); return; }
      setTutorial(tut);

      if (tut.tipo === 'questionario') {
        const { data: qs } = await supabase
          .from('quizzes')
          .select('*')
          .eq('tutorial_id', id);
        if (qs) setQuizzes(qs);
      }

      if (tut.tipo === 'jogo') {
        const { data: jc } = await supabase
          .from('jogos_conteudo')
          .select('conteudo')
          .eq('tutorial_id', id)
          .single();
        if (jc) setJogoConteudo(jc.conteudo);
      }

      setLoading(false);
    }
    fetchTutorial();
  }, [id]);

  async function debugSaveProgress(pontuacao: number | null) {
    console.log('A INICIAR DEBUG DE PROGRESSO...');
    
    if (!user) {
      console.error('User state é null — não autenticado');
      return;
    }

    const { data: utilizadorExiste } = await supabase
      .from('utilizadores')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!utilizadorExiste) {
      console.log('Utilizador não existe na tabela utilizadores. A criar...');
      await supabase.from('utilizadores').insert({
        id: user.id,
        nome: user.user_metadata?.full_name || user.email,
        email: user.email,
        perfil: 'utilizador'
      })
    }

    console.log('1. Utilizador autenticado:', user?.id)
    console.log('2. Tutorial ID:', id)
    console.log('3. Pontuação:', pontuacao)
    console.log('4. A tentar inserir em progresso...')
    const { data, error } = await supabase.from('progresso').upsert({
      utilizador_id: user.id,
      tutorial_id: id,
      completado: true,
      pontuacao: pontuacao,
      ultima_visualizacao: new Date().toISOString(),
      data: new Date().toISOString()
    }, { onConflict: 'utilizador_id,tutorial_id' })
    console.log('5. Resultado insert:', { data, error })

    if (error) {
      console.error('Erro ao guardar progresso:', error)
    } else {
      console.log('Progresso guardado com sucesso!')
    }
  }

  function handleAnswer(opt: string) {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === quizzes[currentQ].resposta_correta) setScore(s => s + 1);
  }

  async function nextQuestion() {
    if (currentQ < quizzes.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
      const finalScore = score + (selected === quizzes[currentQ].resposta_correta ? 1 : 0);
      const pct = Math.round((finalScore / quizzes.length) * 100);
      
      setIsSaving(true);
      await debugSaveProgress(pct);
      const res = await registarProgresso(id, pct, true);
      setIsSaving(false);

      if (res.success) {
        setJaConcluido(true);
        setPontuacaoAnterior(pct);
        if (res.newBadges?.length) setEarnedBadges(res.newBadges);
      }
      
      if (pct >= 70) {
        triggerCelebration();
      }
    }
  }

  async function handleJogoConcluir(pontuacao: number) {
    setPontuacaoJogoNovo(pontuacao);
    setIsSaving(true);
    await debugSaveProgress(pontuacao);
    const res = await registarProgresso(id, pontuacao, true);
    setIsSaving(false);

    if (res.success) {
      setJaConcluido(true);
      setPontuacaoAnterior(pontuacao);
      if (res.newBadges?.length) setEarnedBadges(res.newBadges);
    }

    setFinished(true);
    triggerCelebration();
  }

  async function handleConcluirTutorial() {
    setIsSaving(true);
    await debugSaveProgress(null);
    const res = await registarProgresso(id, null, true);
    setIsSaving(false);

    if (res.success) {
      setJaConcluido(true);
      if (res.newBadges?.length) setEarnedBadges(res.newBadges);
    }

    setFinished(true);
    triggerCelebration();
  }

  function triggerCelebration() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse">
      <div className="h-10 bg-accent rounded-xl mb-6 w-2/3" />
      <div className="h-80 bg-accent rounded-3xl" />
    </div>
  );

  if (!tutorial) return notFound();

  const pct = Math.round((score / (quizzes.length || 1)) * 100);
  const passed = tutorial.tipo === 'questionario' ? pct >= 70 : true;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Back */}
      <Link
        href={tutorial.tipo === 'questionario' ? '/questionarios' : tutorial.tipo === 'jogo' ? '/jogos' : '/tutoriais'}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        {tutorial.tipo === 'questionario' ? 'Voltar aos Questionários' : tutorial.tipo === 'jogo' ? 'Voltar aos Jogos' : 'Voltar à Galeria'}
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
        <div className="mb-12">
          {tutorial.conteudo_url.includes('youtube.com') || tutorial.conteudo_url.includes('youtu.be') ? (
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-video mb-8 bg-black">
              <iframe
                src={tutorial.conteudo_url}
                title={tutorial.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <video controls className="w-full rounded-lg mb-8 shadow-2xl">
              <source src={tutorial.conteudo_url} type="video/mp4" />
              O seu navegador não suporta a reprodução de vídeos.
            </video>
          )}
          <div className="flex justify-end">
            {jaConcluido ? (
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-100 text-green-700 font-bold border border-green-200 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300">
                <CheckCircle size={20} />
                Tutorial já concluído
              </div>
            ) : (
              <button
                onClick={handleConcluirTutorial}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle size={20} />
                {isSaving ? 'A guardar...' : 'Marcar como Concluído'}
              </button>
            )}
          </div>
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
          <div className="flex items-center justify-between">
            <a
              href={tutorial.conteudo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-accent hover:bg-accent/80 transition-colors"
            >
              <FileText size={18} /> Descarregar PDF
            </a>
            {jaConcluido ? (
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-100 text-green-700 font-bold border border-green-200 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300">
                <CheckCircle size={20} />
                Tutorial já concluído
              </div>
            ) : (
              <button
                onClick={handleConcluirTutorial}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle size={20} />
                {isSaving ? 'A guardar...' : 'Marcar como Concluído'}
              </button>
            )}
          </div>
        </div>
      )}

      {tutorial.tipo === 'questionario' && (
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
              className={`rounded-3xl p-12 text-center relative overflow-hidden ${passed ? 'bg-green-50 border-2 border-green-200 dark:bg-green-950/30 dark:border-green-800' : 'bg-red-50 border-2 border-red-200 dark:bg-red-950/30 dark:border-red-800'}`}
            >
              <div className="text-6xl mb-4">{passed ? '🏆' : '📚'}</div>
              <h2 className="text-3xl font-extrabold mb-2">
                {passed ? 'Parabéns! Passaste!' : 'Continua a tentar!'}
              </h2>
              <p className="text-6xl font-black my-6 text-primary">{pct}%</p>
              <p className="text-muted-foreground mb-8">
                Acertaste em <strong>{score}</strong> de <strong>{quizzes.length}</strong> perguntas.
              </p>
              
              {!passed && (
                <button
                  onClick={() => { setCurrentQ(0); setScore(0); setSelected(null); setAnswered(false); setFinished(false); }}
                  className="btn-primary mx-auto block"
                >
                  Tentar Novamente
                </button>
              )}
            </motion.div>
          ) : (
            /* Quiz card */
            <>
            {jaConcluido && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300 mb-6">
                <CheckCircle size={18} className="shrink-0" />
                <span>
                  Já completaste este quiz{pontuacaoAnterior !== null ? ` com ${pontuacaoAnterior}%` : ''}. Podes repetir para melhorar a pontuação.
                </span>
              </div>
            )}
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
                      <button key={opt} className={cls} onClick={() => handleAnswer(opt)} disabled={answered || isSaving}>
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
                    <button onClick={nextQuestion} disabled={isSaving} className="btn-primary w-full flex justify-center">
                      {isSaving ? 'A guardar...' : (currentQ < quizzes.length - 1 ? 'Próxima Pergunta →' : 'Ver Resultado')}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
            </>
          )}
        </div>
      )}

      {tutorial.tipo === 'jogo' && jogoConteudo && (
        <div className="mb-12">
          {jaConcluido && (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300 mb-6">
              <CheckCircle size={18} className="shrink-0" />
              <span>
                Já completaste este jogo{pontuacaoAnterior !== null ? ` com ${pontuacaoAnterior}%` : ''}. Podes repetir.
              </span>
            </div>
          )}
          {jogoConteudo.campos ? (
            <SimulacaoFormulario
              titulo={tutorial.titulo}
              portal={tutorial.plataformas?.nome || 'Portal Governamental'}
              descricao={tutorial.descricao}
              campos={jogoConteudo.campos}
              onConcluir={handleJogoConcluir}
            />
          ) : jogoConteudo.pares ? (
            <JogoCorrespondencia
              titulo={tutorial.titulo}
              pares={jogoConteudo.pares}
              onConcluir={handleJogoConcluir}
            />
          ) : null}
        </div>
      )}

      {/* Celebration Modal Overlay (For all types) */}
      <AnimatePresence>
        {passed && finished && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-white"
              >
                <Trophy size={48} />
              </motion.div>
              
              <h2 className="text-4xl font-black mb-2">Parabéns! 🎉</h2>
              <p className="text-xl text-muted-foreground mb-6">
                Completaste <span className="font-bold text-foreground">{tutorial.titulo}</span>!
              </p>
              
              {(tutorial.tipo === 'questionario' || tutorial.tipo === 'jogo') && (
                <div className="bg-primary/5 rounded-2xl p-6 mb-8 border border-primary/10">
                  <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-1">Pontuação Final</p>
                  <p className="text-5xl font-black text-primary">
                    {tutorial.tipo === 'questionario' ? pct : pontuacaoJogoNovo}%
                  </p>
                </div>
              )}

              {earnedBadges.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-4">Novas Conquistas Desbloqueadas!</h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {earnedBadges.map((b, i) => (
                      <motion.div 
                        key={b.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.2 + 0.5, type: 'spring' }}
                        className="bg-accent rounded-2xl p-4 flex flex-col items-center gap-2 border border-border w-32"
                      >
                        <span className="text-4xl drop-shadow-md">{b.icone}</span>
                        <span className="text-xs font-bold leading-tight">{b.nome}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => router.push('/progresso')}
                  className="btn-primary py-4 text-lg flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} /> Ver o meu progresso
                </button>
                <button 
                  onClick={() => {
                    setFinished(false);
                    router.push('/tutoriais');
                  }}
                  className="px-6 py-4 rounded-full font-bold hover:bg-accent transition-colors"
                >
                  Continuar a explorar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
