'use client';

import { useState, useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ParCorrespondencia {
  id: string;
  conceito: string;
  definicao: string;
}

interface JogoCorrespondenciaProps {
  titulo: string;
  pares: ParCorrespondencia[];
  onConcluir: (pontuacao: number) => void;
}

export default function JogoCorrespondencia({ pares, onConcluir }: JogoCorrespondenciaProps) {
  const definicoesBaralhadas = useMemo(
    () => [...pares].sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [definicaoSelecionada, setDefinicaoSelecionada] = useState<string | null>(null);
  const [pareamentoCorreto, setPareamentoCorreto] = useState<Map<string, string>>(new Map());
  const [erroConceito, setErroConceito] = useState<string | null>(null);
  const [erros, setErros] = useState(0);

  const definicoesUsadas = new Set(pareamentoCorreto.values());
  const paresCertos = pareamentoCorreto.size;
  const total = pares.length;
  const concluido = paresCertos === total;

  function handleDefinicaoClick(parId: string) {
    if (definicoesUsadas.has(parId)) return;
    setDefinicaoSelecionada(prev => (prev === parId ? null : parId));
  }

  function handleConceitoClick(conceitoId: string) {
    if (pareamentoCorreto.has(conceitoId) || !definicaoSelecionada) return;

    if (definicaoSelecionada === conceitoId) {
      const novoMapa = new Map(pareamentoCorreto);
      novoMapa.set(conceitoId, definicaoSelecionada);
      setPareamentoCorreto(novoMapa);
      setDefinicaoSelecionada(null);

      if (novoMapa.size === total) {
        const pontuacao = Math.max(Math.round((total / (total + erros)) * 100), 50);
        onConcluir(pontuacao);
      }
    } else {
      setErros(e => e + 1);
      setErroConceito(conceitoId);
      setTimeout(() => {
        setErroConceito(null);
        setDefinicaoSelecionada(null);
      }, 700);
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-grow h-2 bg-accent rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${(paresCertos / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-sm font-bold text-muted-foreground shrink-0">{paresCertos}/{total}</span>
      </div>

      {concluido ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-12 text-center bg-green-50 border-2 border-green-200 dark:bg-green-950/30 dark:border-green-800"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-extrabold mb-2">Parabéns!</h3>
          <p className="text-muted-foreground">Ligaste todos os {total} pares corretamente.</p>
        </motion.div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground text-center">
            Clica numa <strong>definição</strong> (direita) para a selecionar, depois clica no <strong>conceito</strong> correspondente (esquerda).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conceitos — esquerda */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center mb-2">Conceitos</h4>
              {pares.map(par => {
                const isCerto = pareamentoCorreto.has(par.id);
                const isErro = erroConceito === par.id;
                const isAlvo = !!definicaoSelecionada && !isCerto;

                return (
                  <motion.button
                    key={par.id}
                    onClick={() => handleConceitoClick(par.id)}
                    disabled={isCerto}
                    animate={isErro ? { x: [0, -10, 10, -7, 7, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`w-full text-left p-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 ${
                      isCerto
                        ? 'border-green-400 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 cursor-default'
                        : isErro
                        ? 'border-red-400 bg-red-50 dark:bg-red-950/30'
                        : isAlvo
                        ? 'border-primary bg-primary/5 hover:bg-primary/10 cursor-pointer shadow-sm shadow-primary/10'
                        : 'border-border bg-card opacity-60 cursor-default'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{par.conceito}</span>
                      {isCerto && <CheckCircle size={16} className="text-green-500 shrink-0" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Definições — direita */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center mb-2">Definições</h4>
              {definicoesBaralhadas.map(par => {
                const isUsada = definicoesUsadas.has(par.id);
                const isSelecionada = definicaoSelecionada === par.id;

                return (
                  <motion.button
                    key={par.id}
                    onClick={() => handleDefinicaoClick(par.id)}
                    whileTap={!isUsada ? { scale: 0.97 } : {}}
                    className={`w-full text-left p-4 rounded-2xl border-2 text-sm transition-all duration-200 ${
                      isUsada
                        ? 'border-green-400 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 opacity-50 cursor-default'
                        : isSelecionada
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10 cursor-pointer ring-2 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                    }`}
                  >
                    {par.definicao}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
