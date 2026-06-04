'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, BookOpen, Clock, ChevronRight, Video, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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

export default function TutoriaisPage() {
  const tTrans = useTranslations('Tutoriais');
  const tF = useTranslations('Filters');

  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [filters, setFilters] = useState<Record<string, string | null>>({ idioma: null, tipo: null, plataforma: null });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [prefPlatform, setPrefPlatform] = useState<string | null>(null);

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
          setPrefPlatform(profile.plataforma_preferida);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold mb-4">{tTrans('title')}</h1>
        <p className="text-muted-foreground text-lg">{tTrans('subtitle')}</p>
      </header>

      {/* Search + Filter */}
      <div className="flex items-center gap-4 mb-12">
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

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-accent animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filtered.map((t, idx) => {
            const tipoCfg = TIPO_CONFIG[t.tipo] || TIPO_CONFIG.video;
            const TipoIcon = tipoCfg.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Link href={`/tutoriais/${t.id}`} className="card-hover p-6 flex flex-col h-full block">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">
                      {t.plataformas?.nome}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${tipoCfg.color}`}>
                      <TipoIcon size={12} />
                      {tTrans(t.tipo)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{t.titulo}</h3>
                  <StarRating readOnly averageRating={t.avaliacao_media} totalRatings={t.total_avaliacoes} conteudoId={t.id} tipoConteudo="tutorial" />
                  <p className="text-sm text-muted-foreground mt-2 mb-6 flex-grow">{t.descricao}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={14} />
                      {t.duracao_min} {tTrans('minutes')}
                    </div>
                    <div className="flex items-center gap-1 text-primary font-semibold text-sm">
                      {t.progresso?.completado ? tTrans('review') : tTrans('open')} <ChevronRight size={18} />
                    </div>
                  </div>

                  {/* Progress bar */}
                  {session && t.progresso && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {t.progresso.completado ? tTrans('completed') : tTrans('started')}
                        </span>
                        <span className="text-[10px] font-bold text-primary">{t.progresso.completado ? '100%' : '50%'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: t.progresso.completado ? '100%' : '50%' }}
                          className={`h-full rounded-full ${t.progresso.completado ? 'bg-primary' : 'bg-yellow-500'}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Checkmark */}
                  {session && t.progresso?.completado && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-background animate-in zoom-in duration-300">
                      <CheckCircle size={18} />
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-accent rounded-3xl">
          <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-xl font-bold">{tTrans('notFound')}</h3>
          <p className="text-muted-foreground">{tTrans('notFoundSub')}</p>
        </div>
      )}
    </div>
  );
}
