'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Gamepad2, ArrowRight, Clock, Star, Lock, Loader2 } from 'lucide-react';

interface Jogo {
  id: string;
  titulo: string;
  descricao: string;
  nivel: string;
  duracao_min: number;
  conteudo_url: string | null;
  plataformas: { nome: string } | null;
}

const PALETA = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
];
const EMOJIS = ['🃏', '🎯', '🏆', '🌐', '🏦'];

const EM_BREVE = [
  {
    titulo: 'Portais do Estado',
    descricao: 'Liga cada endereço web ao portal governamental correspondente.',
    tags: ['Navegação', 'Iniciante'],
    duracao: '5 min',
    emoji: '🌐',
    cor: 'from-emerald-500 to-teal-600',
  },
  {
    titulo: 'Prestações Sociais',
    descricao: 'Liga cada prestação à sua descrição correta — subsídios, pensões e apoios.',
    tags: ['Segurança Social', 'Médio'],
    duracao: '7 min',
    emoji: '🏦',
    cor: 'from-amber-500 to-orange-600',
  },
];

export default function JogosPage() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJogos() {
      const { data } = await supabase
        .from('tutoriais')
        .select('id, titulo, descricao, nivel, duracao_min, conteudo_url, plataformas(nome)')
        .eq('tipo', 'jogo')
        .order('created_at', { ascending: true });
      setJogos((data as unknown as Jogo[]) ?? []);
      setLoading(false);
    }
    fetchJogos();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Gamepad2 size={26} className="text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold">Jogos Interativos</h1>
            <p className="text-muted-foreground mt-1">Aprende sobre serviços públicos de forma divertida e prática.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Jogos da base de dados */}
          {jogos.map((jogo, idx) => (
            <div
              key={jogo.id}
              className="group relative bg-card border border-border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
            >
              <div className={`h-2 bg-gradient-to-r ${PALETA[idx % PALETA.length]}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{EMOJIS[idx % EMOJIS.length]}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{jogo.titulo}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{jogo.descricao}</p>
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                    {jogo.nivel}
                  </span>
                  {jogo.plataformas?.nome && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-accent text-muted-foreground">
                      {jogo.plataformas.nome}
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} /> {jogo.duracao_min} min
                  </span>
                </div>
                <Link
                  href={jogo.conteudo_url || `/tutoriais/${jogo.id}`}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm"
                >
                  Jogar agora <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}

          {/* Jogos "em breve" hardcoded */}
          {EM_BREVE.map(jogo => (
            <div
              key={jogo.titulo}
              className="group relative bg-card border border-border rounded-3xl overflow-hidden opacity-70"
            >
              <div className={`h-2 bg-gradient-to-r ${jogo.cor}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{jogo.emoji}</span>
                  <span className="flex items-center gap-1 text-xs font-bold bg-accent px-3 py-1 rounded-full text-muted-foreground">
                    <Lock size={11} /> Em breve
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{jogo.titulo}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{jogo.descricao}</p>
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  {jogo.tags.map(tag => (
                    <span key={tag} className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {tag}
                    </span>
                  ))}
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} /> {jogo.duracao}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <Star size={14} /> A chegar em breve
                </div>
              </div>
            </div>
          ))}

          {/* Estado vazio — só aparece se não há jogos nem itens em breve */}
          {jogos.length === 0 && EM_BREVE.length === 0 && (
            <div className="col-span-full text-center py-20 bg-accent rounded-3xl">
              <Gamepad2 size={48} className="mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold">Nenhum jogo disponível</h3>
              <p className="text-muted-foreground">Os jogos estão a ser preparados. Volta em breve!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
