'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HelpCircle, ChevronRight, CheckCircle, Award, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Questionario {
  id: string;
  titulo: string;
  descricao: string;
  nivel: string;
  duracao_min: number;
  plataforma_id: string;
  plataformas: { id: string; nome: string };
  progresso?: { completado: boolean; pontuacao: number };
}

interface Grupo {
  plataforma: string;
  plataforma_id: string;
  items: Questionario[];
}

export default function QuestionariosPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlat, setSelectedPlat] = useState('all');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      const { data: tuts } = await supabase
        .from('tutoriais')
        .select('*, plataformas(id, nome)')
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
      for (const t of tuts as any[]) {
        const platId = t.plataformas?.id;
        const platNome = t.plataformas?.nome || 'Geral';
        if (!platMap.has(platId)) {
          platMap.set(platId, { plataforma: platNome, plataforma_id: platId, items: [] });
        }
        platMap.get(platId)!.items.push({
          ...t,
          progresso: userProg.find(p => p.tutorial_id === t.id),
        });
      }

      setGrupos(Array.from(platMap.values()));
      setLoading(false);
    }
    fetchData();
  }, []);

  const allPlats = grupos.map(g => ({ id: g.plataforma_id, nome: g.plataforma }));
  const filtrados = selectedPlat === 'all' ? grupos : grupos.filter(g => g.plataforma_id === selectedPlat);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Questionários</h1>
        <p className="text-muted-foreground text-lg">Testa os teus conhecimentos e ganha badges exclusivos.</p>
      </header>

      {/* Filtro de plataformas */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-12 border-b border-border">
        <button
          onClick={() => setSelectedPlat('all')}
          className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-all ${selectedPlat === 'all' ? 'bg-primary text-white' : 'hover:bg-accent'}`}
        >
          Todas
        </button>
        {allPlats.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlat(p.id)}
            className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-all ${selectedPlat === p.id ? 'bg-primary text-white' : 'hover:bg-accent'}`}
          >
            {p.nome}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-24 bg-accent rounded-[40px]">
          <HelpCircle size={64} className="mx-auto mb-6 opacity-10" />
          <h2 className="text-2xl font-bold mb-2">Sem questionários encontrados</h2>
          <p className="text-muted-foreground">Tenta selecionar outra plataforma.</p>
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
                      className="card-hover p-8 flex flex-col h-full block group relative overflow-hidden"
                    >
                      {item.progresso?.completado && (
                        <div className="absolute top-4 right-4 bg-primary/10 text-primary p-2 rounded-full">
                          <CheckCircle size={18} />
                        </div>
                      )}

                      <div className="mb-6 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-accent px-3 py-1 rounded-full">
                          {item.nivel}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">{item.duracao_min} min</span>
                      </div>

                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{item.titulo}</h3>
                      <p className="text-sm text-muted-foreground mb-6 flex-grow line-clamp-2">{item.descricao}</p>

                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/50">
                        {item.progresso ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Melhor pontuação</span>
                            <span className="text-lg font-black text-primary">{item.progresso.pontuacao}%</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award size={16} /> Badge disponível
                          </div>
                        )}
                        <div className="btn-primary px-5 py-2 text-xs flex items-center gap-2 group-hover:gap-3 transition-all">
                          {item.progresso ? 'Repetir' : 'Começar'} <ChevronRight size={14} />
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
