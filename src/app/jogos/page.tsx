'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Gamepad2, ArrowRight, Clock, Star, Lock, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import StarRating from '@/components/StarRating';
import FilterDropdown from '@/components/FilterDropdown';

interface Jogo {
  id: string;
  titulo: string;
  descricao: string;
  nivel: string;
  duracao_min: number;
  conteudo_url: string | null;
  idioma: string | null;
  plataformas: { nome: string } | null;
  avaliacao_media?: number;
  total_avaliacoes?: number;
}

const PALETA = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
];
const EMOJIS = ['🃏', '🎯', '🏆', '🌐', '🏦'];

const EM_BREVE: { titulo: string; descricao: string; tags: string[]; duracao: string; emoji: string; cor: string }[] = [];

export default function JogosPage() {
  const t = useTranslations('Jogos');
  const tF = useTranslations('Filters');
  const tS = useTranslations('status');
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string | null>>({ idioma: null, plataforma: null });
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchJogos() {
      const [{ data }, { data: { session } }] = await Promise.all([
        supabase
          .from('tutoriais')
          .select('id, titulo, descricao, nivel, duracao_min, conteudo_url, idioma, avaliacao_media, total_avaliacoes, plataformas(nome)')
          .eq('tipo', 'jogo')
          .order('created_at', { ascending: true }),
        supabase.auth.getSession(),
      ]);
      setJogos((data as unknown as Jogo[]) ?? []);
      if (session) {
        const { data: prog } = await supabase
          .from('progresso')
          .select('tutorial_id')
          .eq('utilizador_id', session.user.id)
          .eq('completado', true);
        if (prog) setCompletedIds(new Set(prog.map(p => p.tutorial_id)));
      }
      setLoading(false);
    }
    fetchJogos();
  }, []);

  const filterGroups = [
    {
      key: 'idioma',
      label: tF('idioma'),
      options: [
        { label: tF('pt'), value: 'Português' },
        { label: tF('en'), value: 'English' },
      ],
    },
    {
      key: 'plataforma',
      label: tF('plataforma'),
      options: [
        { label: tF('ss'),           value: 'Segurança Social' },
        { label: tF('financas'),     value: 'Portal das Finanças' },
        { label: tF('sns'),          value: 'SNS24' },
        { label: tF('irn'),          value: 'IRN' },
        { label: tF('autenticacao'), value: 'Autenticação.gov' },
        { label: tF('apoio'),        value: 'Apoio ao Imigrante' },
        { label: tF('eportugal'),    value: 'ePortugal' },
      ],
    },
  ];

  const jogosFiltrados = jogos.filter(j => {
    const matchesIdioma = !filters.idioma || (j.idioma ?? 'Português') === filters.idioma;
    const matchesPlat   = !filters.plataforma || j.plataformas?.nome === filters.plataforma;
    return matchesIdioma && matchesPlat;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Gamepad2 size={26} className="text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold">{t('title')}</h1>
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>
        </div>
        <FilterDropdown
          groups={filterGroups}
          filters={filters}
          onChange={(key, value) => setFilters(f => ({ ...f, [key]: value }))}
          onClear={() => setFilters({ idioma: null, plataforma: null })}
          buttonLabel={tF('button')}
          clearLabel={tF('clear')}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Jogos da base de dados */}
          {jogosFiltrados.map((jogo, idx) => {
            const isCompleted = completedIds.has(jogo.id);
            return (
            <div
              key={jogo.id}
              className={`group relative bg-card border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 ${isCompleted ? 'border-green-500' : 'border-border'}`}
            >
              <div className={`h-2 bg-gradient-to-r ${PALETA[idx % PALETA.length]}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{EMOJIS[idx % EMOJIS.length]}</span>
                  {isCompleted && (
                    <div className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      ✓ {tS('completed')}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-1">{jogo.titulo}</h3>
                <StarRating readOnly averageRating={jogo.avaliacao_media} totalRatings={jogo.total_avaliacoes} conteudoId={jogo.id} tipoConteudo="jogo" />
                <p className="text-sm text-muted-foreground leading-relaxed mt-2 mb-4">{jogo.descricao}</p>
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
                  {t('playNow')} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            );
          })}

          {/* Jogos "em breve" hardcoded — sempre visíveis */}
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
                    <Lock size={11} /> {t('comingSoon')}
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
                  <Star size={14} /> {t('arrivingSoon')}
                </div>
              </div>
            </div>
          ))}

          {/* Empty state — só aparece se não há jogos nem itens em breve */}
          {jogos.length === 0 && EM_BREVE.length === 0 && (
            <div className="col-span-full text-center py-20 bg-accent rounded-3xl">
              <Gamepad2 size={48} className="mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold">{t('noGames')}</h3>
              <p className="text-muted-foreground">{t('noGamesSub')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
