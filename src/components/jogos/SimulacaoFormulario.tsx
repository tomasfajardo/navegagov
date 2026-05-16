'use client';

import { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, Send, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CampoFormulario {
  id: string;
  label: string;
  tipo: 'text' | 'select' | 'date' | 'number';
  placeholder: string;
  respostaCorreta: string;
  opcoes?: string[];
  dica?: string;
  validacao?: 'nif' | 'niss' | 'email' | 'telefone' | 'codigopostal' | 'livre';
}

interface SimulacaoFormularioProps {
  titulo: string;
  portal: string;
  descricao: string;
  campos: CampoFormulario[];
  onConcluir: (pontuacao: number) => void;
}

function validarCampo(valor: string, validacao?: string): boolean {
  if (!valor.trim()) return false;
  switch (validacao) {
    case 'nif':          return /^\d{9}$/.test(valor.replace(/\s/g, ''));
    case 'niss':         return /^\d{11}$/.test(valor.replace(/\s/g, ''));
    case 'email':        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    case 'telefone':     return /^\d{9}$/.test(valor.replace(/\s/g, ''));
    case 'codigopostal': return /^\d{4}-\d{3}$/.test(valor);
    default:             return valor.trim().length >= 2;
  }
}

function mensagemErro(validacao?: string): string {
  switch (validacao) {
    case 'nif':          return 'O NIF deve ter exactamente 9 dígitos';
    case 'niss':         return 'O NISS deve ter exactamente 11 dígitos';
    case 'email':        return 'Introduz um endereço de email válido';
    case 'telefone':     return 'O telefone deve ter 9 dígitos';
    case 'codigopostal': return 'Formato obrigatório: XXXX-XXX (ex: 1000-001)';
    default:             return 'Este campo é obrigatório';
  }
}

export default function SimulacaoFormulario({
  titulo, portal, descricao, campos, onConcluir,
}: SimulacaoFormularioProps) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [tooltipVisivel, setTooltipVisivel] = useState<string | null>(null);

  const validacoes = campos.reduce<Record<string, boolean>>((acc, c) => {
    acc[c.id] = validarCampo(valores[c.id] || '', c.validacao);
    return acc;
  }, {});

  const totalValidos = Object.values(validacoes).filter(Boolean).length;
  const pontuacao = Math.round((totalValidos / campos.length) * 100);
  const todosPreenchidos = campos.every(c => (valores[c.id] || '').trim().length > 0);

  function handleSubmit() {
    setSubmitted(true);
    if (totalValidos === campos.length) onConcluir(pontuacao);
  }

  if (submitted) {
    return (
      <div className="rounded-3xl overflow-hidden border border-border shadow-xl">
        <div className="p-4 text-white flex items-center gap-3" style={{ backgroundColor: '#0A2472' }}>
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center text-xs font-bold border border-white/30">
            AT
          </div>
          <span className="font-bold text-sm">{portal}</span>
        </div>

        <div className="bg-card p-8">
          <h3 className="text-xl font-bold mb-2 text-center">Resultado da Simulação</h3>
          <p className="text-sm text-muted-foreground text-center mb-8">{titulo}</p>

          <div className={`rounded-2xl p-6 mb-8 text-center border-2 ${pontuacao >= 70 ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'}`}>
            <p className="text-6xl font-black text-primary mb-2">{pontuacao}%</p>
            <p className="text-sm text-muted-foreground">
              {totalValidos} de {campos.length} campos corretos
            </p>
          </div>

          <div className="space-y-2 mb-8">
            {campos.map(campo => (
              <div key={campo.id} className={`flex items-center gap-3 p-3 rounded-xl border ${validacoes[campo.id] ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}`}>
                {validacoes[campo.id]
                  ? <CheckCircle size={16} className="text-green-500 shrink-0" />
                  : <XCircle size={16} className="text-red-500 shrink-0" />}
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium">{campo.label}</p>
                  {!validacoes[campo.id] && (
                    <p className="text-xs text-red-600 dark:text-red-400">{mensagemErro(campo.validacao)}</p>
                  )}
                </div>
                <span className="text-xs font-mono text-muted-foreground truncate max-w-[100px] shrink-0">
                  {valores[campo.id] || '—'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setValores({}); setSubmitted(false); }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold bg-accent hover:bg-accent/80 transition-colors"
            >
              <RotateCcw size={16} /> Tentar Novamente
            </button>
            <button
              onClick={() => onConcluir(pontuacao)}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} /> Concluir
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden border border-border shadow-xl">
      {/* Portal-style header */}
      <div className="p-4 text-white flex items-center gap-3" style={{ backgroundColor: '#0A2472' }}>
        <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center text-xs font-bold border border-white/30">
          AT
        </div>
        <div>
          <p className="font-bold text-sm">{portal}</p>
          <p className="text-xs text-white/60">{titulo}</p>
        </div>
      </div>

      <div className="bg-card p-6 md:p-8">
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900 mb-8">
          <p className="text-sm text-muted-foreground">{descricao}</p>
        </div>

        <div className="space-y-6">
          {campos.map(campo => {
            const valor = valores[campo.id] || '';
            const tocado = valor.length > 0;
            const isValid = tocado && validarCampo(valor, campo.validacao);
            const isInvalid = tocado && !isValid;

            return (
              <div key={campo.id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <label className="text-sm font-semibold">{campo.label}</label>
                  {campo.dica && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setTooltipVisivel(tooltipVisivel === campo.id ? null : campo.id)}
                        className="w-5 h-5 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                      >
                        <HelpCircle size={12} />
                      </button>
                      <AnimatePresence>
                        {tooltipVisivel === campo.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            className="absolute left-0 top-7 z-20 w-64 p-3 rounded-xl bg-foreground text-background text-xs shadow-xl leading-relaxed"
                          >
                            {campo.dica}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="relative">
                  {campo.tipo === 'select' ? (
                    <select
                      value={valor}
                      onChange={e => setValores(p => ({ ...p, [campo.id]: e.target.value }))}
                      className={`w-full px-4 py-3 pr-10 rounded-xl border-2 bg-background text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none ${isValid ? 'border-green-400' : isInvalid ? 'border-red-400' : 'border-border'}`}
                    >
                      <option value="">{campo.placeholder}</option>
                      {campo.opcoes?.map(op => <option key={op} value={op}>{op}</option>)}
                    </select>
                  ) : (
                    <input
                      type={campo.tipo}
                      value={valor}
                      placeholder={campo.placeholder}
                      onChange={e => setValores(p => ({ ...p, [campo.id]: e.target.value }))}
                      className={`w-full px-4 py-3 pr-10 rounded-xl border-2 bg-background text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${isValid ? 'border-green-400' : isInvalid ? 'border-red-400' : 'border-border'}`}
                    />
                  )}
                  {isValid && <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />}
                  {isInvalid && <XCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />}
                </div>

                {isInvalid && (
                  <p className="text-xs text-red-500 mt-1 ml-1">{mensagemErro(campo.validacao)}</p>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!todosPreenchidos}
          className="mt-10 w-full btn-primary flex items-center justify-center gap-2 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={18} /> Submeter Formulário
        </button>
      </div>
    </div>
  );
}
