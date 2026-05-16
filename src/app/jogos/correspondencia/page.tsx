'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, RotateCcw, Gamepad2, ArrowLeft, Trophy } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { registarProgresso } from '@/app/actions/progresso';

// Set NEXT_PUBLIC_JOGO_CORRESPONDENCIA_TUTORIAL_ID in .env.local to enable progress tracking
const TUTORIAL_ID = process.env.NEXT_PUBLIC_JOGO_CORRESPONDENCIA_TUTORIAL_ID ?? '';

const PARES_ORIGINAIS = [
  { id: '1', conceito: 'NIF', definicao: 'Número de Identificação Fiscal — necessário para pagar impostos e abrir conta bancária' },
  { id: '2', conceito: 'NISS', definicao: 'Número de Identificação da Segurança Social — necessário para aceder a prestações sociais' },
  { id: '3', conceito: 'NNU', definicao: 'Número Nacional de Utente — necessário para aceder ao Serviço Nacional de Saúde' },
  { id: '4', conceito: 'CMD', definicao: 'Chave Móvel Digital — permite autenticar-se nos portais do Estado com telemóvel' },
  { id: '5', conceito: 'Cartão de Cidadão', definicao: 'Documento de identificação português que substitui o Bilhete de Identidade' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildInitialState() {
  return {
    definicoesBaralhadas: shuffle(PARES_ORIGINAIS),
    ligacoes: {} as Record<string, string>,
    corretos: new Set<string>(),
    erros: new Set<string>(),
    arrastando: null as string | null,
    selecionado: null as string | null,
    tentativas: 0,
  };
}

export default function JogoCorrespondenciaPage() {
  const [estado, setEstado] = useState(buildInitialState);
  const [celebrado, setCelebrado] = useState(false);
  const concluido = estado.corretos.size === PARES_ORIGINAIS.length;

  useEffect(() => {
    if (!concluido || celebrado) return;
    setCelebrado(true);

    const end = Date.now() + 3000;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#3B82F6', '#10B981', '#F59E0B'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#3B82F6', '#10B981', '#F59E0B'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    if (TUTORIAL_ID) {
      const pontuacao = Math.max(Math.round((PARES_ORIGINAIS.length / Math.max(estado.tentativas, PARES_ORIGINAIS.length)) * 100), 50);
      registarProgresso(TUTORIAL_ID, pontuacao, true).catch(() => {});
    }
  }, [concluido, celebrado, estado.tentativas]);

  function handleDrop(conceitoId: string, definicaoId: string) {
    setEstado(prev => {
      if (prev.corretos.has(conceitoId)) return prev;
      const tentativas = prev.tentativas + 1;

      if (conceitoId === definicaoId) {
        const corretos = new Set(prev.corretos).add(conceitoId);
        return { ...prev, corretos, ligacoes: { ...prev.ligacoes, [conceitoId]: definicaoId }, selecionado: null, tentativas };
      }

      const erros = new Set(prev.erros).add(conceitoId);
      setTimeout(() => {
        setEstado(s => {
          const e = new Set(s.erros);
          e.delete(conceitoId);
          return { ...s, erros: e };
        });
      }, 600);
      return { ...prev, erros, selecionado: null, tentativas };
    });
  }

  function handleReset() {
    setEstado(buildInitialState());
    setCelebrado(false);
  }

  const definicaoUsadas = new Set(Object.values(estado.ligacoes));
  const pontuacao = estado.tentativas > 0
    ? Math.max(Math.round((PARES_ORIGINAIS.length / estado.tentativas) * 100), 50)
    : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/jogos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={16} /> Voltar aos Jogos
      </Link>

      {/* Title + progress */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Gamepad2 size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Documentos Portugueses</h1>
            <p className="text-sm text-muted-foreground">Liga cada sigla à sua definição correta</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <div className="flex-grow h-2 bg-accent rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${(estado.corretos.size / PARES_ORIGINAIS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-sm font-bold text-muted-foreground shrink-0">
            {estado.corretos.size}/{PARES_ORIGINAIS.length}
          </span>
        </div>
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left — Conceitos (drop zones) */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center">
            Conceitos
          </h2>
          <div className="space-y-3">
            {PARES_ORIGINAIS.map(par => {
              const isCerto = estado.corretos.has(par.id);
              const isErro = estado.erros.has(par.id);
              const isAlvo = !!estado.selecionado && !isCerto;

              return (
                <motion.div
                  key={par.id}
                  animate={isErro ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.5 }}
                  onDragOver={!isCerto ? (e: React.DragEvent) => e.preventDefault() : undefined}
                  onDrop={!isCerto ? (e: React.DragEvent) => {
                    e.preventDefault();
                    const defId = e.dataTransfer.getData('definicaoId');
                    if (defId) handleDrop(par.id, defId);
                  } : undefined}
                  onClick={isAlvo && estado.selecionado ? () => handleDrop(par.id, estado.selecionado!) : undefined}
                  className={`
                    flex items-center justify-between gap-3 p-4 rounded-2xl border-2 transition-all duration-200 select-none
                    ${isCerto
                      ? 'bg-green-50 border-green-400 dark:bg-green-950/30'
                      : isErro
                      ? 'bg-red-50 border-red-400 dark:bg-red-950/30'
                      : isAlvo
                      ? 'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10 shadow-md'
                      : 'bg-[#0A0F2C] border-[#0A0F2C]'
                    }
                  `}
                >
                  <span className={`font-bold text-base ${isCerto ? 'text-green-700 dark:text-green-300' : isErro ? 'text-red-700 dark:text-red-300' : 'text-white'}`}>
                    {par.conceito}
                  </span>
                  {isCerto
                    ? <CheckCircle size={20} className="text-green-500 shrink-0" />
                    : <div className={`w-8 h-8 rounded-xl border-2 border-dashed shrink-0 transition-colors ${isAlvo ? 'border-primary bg-primary/20' : 'border-white/30'}`} />
                  }
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right — Definições (draggable) */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center">
            Definições <span className="hidden md:inline">— arrasta para o conceito</span>
          </h2>
          <div className="space-y-3">
            {estado.definicoesBaralhadas.map(par => {
              const isUsada = definicaoUsadas.has(par.id);
              const isArrastando = estado.arrastando === par.id;
              const isSelecionada = estado.selecionado === par.id;

              if (isUsada) {
                return <div key={par.id} className="h-[72px] rounded-2xl border-2 border-dashed border-border opacity-20" />;
              }

              return (
                <div
                  key={par.id}
                  draggable
                  onDragStart={(e: React.DragEvent) => {
                    e.dataTransfer.setData('definicaoId', par.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setEstado(s => ({ ...s, arrastando: par.id, selecionado: null }));
                  }}
                  onDragEnd={() => setEstado(s => ({ ...s, arrastando: null }))}
                  onClick={() => setEstado(s => ({ ...s, selecionado: s.selecionado === par.id ? null : par.id }))}
                  className={`
                    p-4 rounded-2xl border-2 text-sm leading-snug cursor-grab active:cursor-grabbing select-none
                    transition-all duration-150
                    ${isSelecionada
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/15 ring-2 ring-primary/20'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                  style={{
                    transform: `scale(${isArrastando ? 1.05 : 1})`,
                    opacity: isArrastando ? 0.6 : 1,
                    boxShadow: isArrastando ? '0 20px 40px rgba(59,130,246,0.25)' : undefined,
                  }}
                >
                  {par.definicao}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4 md:hidden">
            Toca numa definição para a selecionar, depois toca no conceito correspondente.
          </p>
        </div>
      </div>

      {/* Completion modal */}
      <AnimatePresence>
        {concluido && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-[40px] p-10 max-w-md w-full text-center shadow-2xl"
            >
              <motion.div
                animate={{ y: [0, -16, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-white"
              >
                <Trophy size={48} />
              </motion.div>

              <h2 className="text-3xl font-black mb-2">Excelente! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                Conheces bem os documentos portugueses!
              </p>

              <div className="bg-primary/5 rounded-2xl p-6 mb-8 border border-primary/10">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Pontuação</p>
                <p className="text-5xl font-black text-primary">{pontuacao}%</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {PARES_ORIGINAIS.length} pares em {estado.tentativas} tentativa{estado.tentativas !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold bg-accent hover:bg-accent/80 transition-colors"
                >
                  <RotateCcw size={16} /> Jogar de Novo
                </button>
                <Link href="/jogos" className="btn-primary flex items-center justify-center gap-2 py-3 text-sm">
                  Outros Jogos
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
