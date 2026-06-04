'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HelpCircle, ChevronRight, Award, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import StarRating from '@/components/StarRating';
import FilterDropdown from '@/components/FilterDropdown';

interface Questionario {
  id: string;
  titulo: string;
  descricao: string;
  nivel: string;
  duracao_min: number;
  plataforma_id: string;
  idioma?: string;
  plataformas: { id: string; nome: string };
  progresso?: { completado: boolean; pontuacao: number };
  avaliacao_media?: number;
  total_avaliacoes?: number;
}

interface Grupo {
  plataforma: string;
  plataforma_id: string;
  items: Questionario[];
}

export default function QuestionariosPage() {
  const t = useTranslations('Questionarios');
  const tF = useTranslations('Filters');
  const tS = useTranslations('status');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string | null>>({ idioma: null, plataforma: null });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      const { data: tuts } = await supabase
        .from('tutoriais')
        .select('*, avaliacao_media, total_avaliacoes, plataformas(id, nome)')
        .eq('tipo', 'questionario')
        .order('titulo');

      if (!tuts) { setLoading(false); return; }

      let userProg: any[] = [];
      if (session) {
        const { data: prog } = await supabase
          .from('progresso')
          .select('tutorial_id, completado, pontuacao')
          .eq('utilizador_id', session.user.id);
        userProg = prog || [];
      }

      const platMap = new Map<string, Grupo>();
      for (const tut of tuts as any[]) {
        const platId = tut.plataformas?.id;
        const platNome = tut.plataformas?.nome || 'Geral';
        if (!platMap.has(platId)) {
          platMap.set(platId, { plataforma: platNome, plataforma_id: platId, items: [] });
        }
        platMap.get(platId)!.items.push({
          ...tut,
          progresso: userProg.find(p => p.tutorial_id === tut.id),
        });
      }

      setGrupos(Array.from(platMap.values()));
      setLoading(false);
    }
    fetchData();
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

  const filtrados = grupos
    .map(grupo => ({
      ...grupo,
      items: grupo.items.filter(item =>
        !filters.idioma || (item.idioma ?? 'Português') === filters.idioma
      ),
    }))
    .filter(grupo =>
      grupo.items.length > 0 &&
      (!filters.plataforma || grupo.plataforma === filters.plataforma)
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
        </div>
        <FilterDropdown
          groups={filterGroups}
          filters={filters}
          onChange={(key, value) => setFilters(f => ({ ...f, [key]: value }))}
          onClear={() => setFilters({ idioma: null, plataforma: null })}
          buttonLabel={tF('button')}
          clearLabel={tF('clear')}
        />
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-24 bg-accent rounded-[40px]">
          <HelpCircle size={64} className="mx-auto mb-6 opacity-10" />
          <h2 className="text-2xl font-bold mb-2">{t('notFound')}</h2>
          <p className="text-muted-foreground">{t('notFoundSub')}</p>
        </div>
      ) : (
        <div className="space-y-16">
          {filtrados.map(grupo => (
            <section key={grupo.plataforma_id}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-8 bg-primary rounded-full" />
                <h2 className="text-2xl font-bold">{grupo.plataforma}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {grupo.items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Link
                      href={`/tutoriais/${item.id}`}
                      className={`card-hover p-8 flex flex-col h-full block group relative overflow-hidden${item.progresso?.completado ? ' ring-2 ring-green-500/50' : ''}`}
                    >
                      {item.progresso?.completado && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          ✓ {tS('completed')}
                        </div>
                      )}

                      <div className="mb-6 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-accent px-3 py-1 rounded-full">
                          {item.nivel}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">{item.duracao_min} min</span>
                      </div>

                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{item.titulo}</h3>
                      <StarRating readOnly averageRating={item.avaliacao_media} totalRatings={item.total_avaliacoes} conteudoId={item.id} tipoConteudo="quiz" />
                      <p className="text-sm text-muted-foreground mt-2 mb-6 flex-grow line-clamp-2">{item.descricao}</p>

                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/50">
                        {item.progresso ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">{t('bestScore')}</span>
                            <span className="text-lg font-black text-primary">{item.progresso.pontuacao}%</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award size={16} /> {t('badgeAvailable')}
                          </div>
                        )}
                        <div className="btn-primary px-5 py-2 text-xs flex items-center gap-2 group-hover:gap-3 transition-all">
                          {item.progresso ? t('repeat') : t('start')} <ChevronRight size={14} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
