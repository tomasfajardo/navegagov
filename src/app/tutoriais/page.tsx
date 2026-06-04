'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, BookOpen, Clock, ChevronRight, Video, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import StarRating from '@/components/StarRating';
import FilterDropdown from '@/components/FilterDropdown';

interface Tutorial {
  id: string;
  titulo: string;
  descricao: string;
  duracao_min: number;
  nivel: string;
  tipo: 'video' | 'manual';
  plataforma_id: string;
  plataformas: { nome: string };
  progresso?: { completado: boolean; pontuacao: number };
  plataforma?: string;
  tipo_conteudo?: string;
  idioma?: string;
  avaliacao_media?: number;
  total_avaliacoes?: number;
}

const TIPO_CONFIG = {
  video:  { icon: Video,    color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
  manual: { icon: FileText, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
};

const PORTAL_ORDER = [
  'Portal das Finanças',
  'Segurança Social',
  'SNS24',
  'Autenticação.gov',
  'IRN',
  'ePortugal',
  'Apoio ao Imigrante',
];

export default function TutoriaisPage() {
  const tTrans = useTranslations('Tutoriais');
  const tF = useTranslations('Filters');

  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [filters, setFilters] = useState<Record<string, string | null>>({ idioma: null, tipo: null, plataforma: null });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);

    const { data: { session: currentSession } } = await supabase.auth.getSession();
    setSession(currentSession);

    const { data: tuts } = await supabase
      .from('tutoriais')
      .select('*, plataformas(nome)')
      .in('tipo', ['video', 'manual']);

    if (tuts) {
      if (currentSession) {
        const { data: userProg } = await supabase
          .from('progresso')
          .select('tutorial_id, completado, pontuacao')
          .eq('utilizador_id', currentSession.user.id);

        const tutsWithProg = tuts.map(t => ({
          ...t,
          progresso: userProg?.find(p => p.tutorial_id === t.id)
        }));

        const { data: profile } = await supabase
          .from('utilizadores')
          .select('plataforma_preferida')
          .eq('id', currentSession.user.id)
          .single();

        if (profile?.plataforma_preferida) {
          const sorted = [...tutsWithProg].sort((a, b) => {
            const aMatch = a.plataformas?.nome?.toLowerCase().includes(profile.plataforma_preferida.toLowerCase());
            const bMatch = b.plataformas?.nome?.toLowerCase().includes(profile.plataforma_preferida.toLowerCase());
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
          });
          setTutorials(sorted);
        } else {
          setTutorials(tutsWithProg);
        }
      } else {
        setTutorials(tuts);
      }
    }
    setLoading(false);
  }

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
      key: 'tipo',
      label: tF('tipo'),
      options: [
        { label: tF('video'), value: 'Vídeo' },
        { label: tF('manual'), value: 'Manual PDF' },
      ],
    },
    {
      key: 'plataforma',
      label: tF('plataforma'),
      options: [
        { label: tF('ss'),          value: 'Segurança Social' },
        { label: tF('financas'),    value: 'Portal das Finanças' },
        { label: tF('sns'),         value: 'SNS24' },
        { label: tF('irn'),         value: 'IRN' },
        { label: tF('autenticacao'),value: 'Autenticação.gov' },
        { label: tF('apoio'),       value: 'Apoio ao Imigrante' },
        { label: tF('eportugal'),   value: 'ePortugal' },
      ],
    },
  ];

  const filtered = tutorials.filter(t => {
    const resolvedPlat = t.plataforma || (t.plataformas?.nome ? (() => {
      const name = t.plataformas.nome.toLowerCase();
      if (name.includes('segurança social')) return 'Segurança Social';
      if (name.includes('finanças')) return 'Portal das Finanças';
      if (name.includes('sns24')) return 'SNS24';
      if (name.includes('irn')) return 'IRN';
      if (name.includes('autenticação')) return 'Autenticação.gov';
      if (name.includes('imigrante')) return 'Apoio ao Imigrante';
      if (name.includes('eportugal')) return 'ePortugal';
      return null;
    })() : null);

    const resolvedType = t.tipo_conteudo || (t.tipo === 'video' ? 'Vídeo' : 'Manual PDF');
    const resolvedLang = t.idioma || 'Português';

    const matchesIdioma = !filters.idioma || resolvedLang === filters.idioma;
    const matchesTipo   = !filters.tipo   || resolvedType === filters.tipo;
    const matchesPlat   = !filters.plataforma || resolvedPlat === null || resolvedPlat === filters.plataforma;
    const matchesSearch =
      t.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (t.descricao || '').toLowerCase().includes(search.toLowerCase());

    return matchesIdioma && matchesTipo && matchesPlat && matchesSearch;
  });

  // Group filtered tutorials by portal, following PORTAL_ORDER
  const grouped: { portal: string; items: Tutorial[] }[] = PORTAL_ORDER
    .map(portal => ({
      portal,
      items: filtered.filter(t => t.plataformas?.nome === portal),
    }))
    .filter(g => g.items.length > 0);

  // Tutorials whose portal isn't in PORTAL_ORDER go at the end
  const knownPortals = new Set(PORTAL_ORDER);
  const otherItems = filtered.filter(t => !knownPortals.has(t.plataformas?.nome));
  if (otherItems.length > 0) {
    grouped.push({ portal: 'Outros', items: otherItems });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold mb-2">{tTrans('title')}</h1>
        <p className="text-muted-foreground text-lg">{tTrans('subtitle')}</p>
      </header>

      {/* Search + Filter */}
      <div className="flex items-center gap-4 mb-10">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder={tTrans('search')}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-accent focus:ring-2 focus:ring-primary/50 focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <FilterDropdown
          groups={filterGroups}
          filters={filters}
          onChange={(key, value) => setFilters(f => ({ ...f, [key]: value }))}
          onClear={() => setFilters({ idioma: null, tipo: null, plataforma: null })}
          buttonLabel={tF('button')}
          clearLabel={tF('clear')}
        />
      </div>

      {loading ? (
        <div className="space-y-10">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-6 w-48 bg-accent animate-pulse rounded mb-4" />
              <div className="space-y-3">
                {[1, 2].map(j => <div key={j} className="h-24 bg-accent animate-pulse rounded-2xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : grouped.length > 0 ? (
        <div className="space-y-12">
          {grouped.map(({ portal, items }) => (
            <section key={portal}>
              {/* Section header */}
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-xl font-bold" style={{ fontSize: '21px' }}>{portal}</h2>
                <span className="text-sm text-muted-foreground font-medium">
                  {items.length} {items.length === 1 ? 'tutorial' : 'tutoriais'}
                </span>
              </div>
              <div className="h-px bg-border mb-5" />

              {/* Tutorial rows */}
              <div className="space-y-3">
                {items.map(t => {
                  const tipoCfg = TIPO_CONFIG[t.tipo] || TIPO_CONFIG.video;
                  const TipoIcon = tipoCfg.icon;
                  return (
                    <Link
                      key={t.id}
                      href={`/tutoriais/${t.id}`}
                      className="flex items-center gap-6 px-5 py-4 rounded-2xl bg-card transition-colors duration-150 group"
                      style={{
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFF')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      {/* Left: title + description */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-base leading-snug truncate">{t.titulo}</h3>
                          {session && t.progresso?.completado && (
                            <CheckCircle size={15} className="text-green-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{t.descricao}</p>

                        {/* Progress bar — only when logged in and started */}
                        {session && t.progresso && (
                          <div className="mt-2 h-1 w-full max-w-xs bg-accent rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${t.progresso.completado ? 'bg-primary' : 'bg-yellow-500'}`}
                              style={{ width: t.progresso.completado ? '100%' : '50%' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Right: metadata + button */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={13} />
                          <span>{t.duracao_min} min</span>
                        </div>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${tipoCfg.color}`}>
                          <TipoIcon size={11} />
                          {tTrans(t.tipo)}
                        </span>
                        <StarRating
                          readOnly
                          averageRating={t.avaliacao_media}
                          totalRatings={t.total_avaliacoes}
                          conteudoId={t.id}
                          tipoConteudo="tutorial"
                        />
                        <span className="flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                          {t.progresso?.completado ? tTrans('review') : tTrans('open')}
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-accent rounded-3xl">
          <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-xl font-bold">{tTrans('notFound')}</h3>
          <p className="text-muted-foreground">{tTrans('notFoundSub')}</p>
        </div>
      )}
    </div>
  );
}
