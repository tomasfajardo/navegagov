'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, BookOpen, Clock, ChevronRight, Video, FileText, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Tutorial {
  id: string;
  titulo: string;
  descricao: string;
  duracao_min: number;
  nivel: string;
  tipo: 'video' | 'manual' | 'jogo';
  plataforma_id: string;
  plataformas: { nome: string };
}

interface Plataforma {
  id: string;
  nome: string;
}

const TIPO_CONFIG = {
  video:  { label: 'Vídeo',   icon: Video,    color: 'bg-red-100 text-red-700'  },
  manual: { label: 'Manual',  icon: FileText,  color: 'bg-blue-100 text-blue-700' },
  jogo:   { label: 'Jogo',    icon: Gamepad2,  color: 'bg-green-100 text-green-700' },
};

export default function TutoriaisPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
  const [selectedPlat, setSelectedPlat] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data: plats } = await supabase.from('plataformas').select('*');
    if (plats) setPlataformas(plats);
    const { data: tuts } = await supabase
      .from('tutoriais')
      .select('*, plataformas(nome)');
    if (tuts) setTutorials(tuts);
    setLoading(false);
  }

  const filtered = tutorials.filter(t => {
    const matchesPlat = selectedPlat === 'all' || t.plataforma_id === selectedPlat;
    const matchesSearch =
      t.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (t.descricao || '').toLowerCase().includes(search.toLowerCase());
    return matchesPlat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Galeria de Tutoriais</h1>
        <p className="text-muted-foreground text-lg">Vídeos, manuais e jogos interativos para aprender a usar os portais do Estado.</p>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Pesquisar tutorial..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-accent focus:ring-2 focus:ring-primary/50 focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedPlat('all')}
            className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-all ${selectedPlat === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-accent hover:bg-border'}`}
          >
            Todos
          </button>
          {plataformas.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlat(p.id)}
              className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-all ${selectedPlat === p.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-accent hover:bg-border'}`}
            >
              {p.nome}
            </button>
          ))}
        </div>
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
                    {/* Tipo badge */}
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${tipoCfg.color}`}>
                      <TipoIcon size={12} />
                      {tipoCfg.label}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.titulo}</h3>
                  <p className="text-sm text-muted-foreground mb-6 flex-grow">{t.descricao}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={14} />
                      {t.duracao_min} min
                    </div>
                    <div className="flex items-center gap-1 text-primary font-semibold text-sm">
                      Abrir <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-accent rounded-3xl">
          <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-xl font-bold">Nenhum tutorial encontrado</h3>
          <p className="text-muted-foreground">Tenta mudar os filtros ou a tua pesquisa.</p>
        </div>
      )}
    </div>
  );
}
