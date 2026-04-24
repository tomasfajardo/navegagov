'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Clock, ChevronRight, PlayCircle, FileText, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Tutorial {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'video' | 'manual' | 'jogo';
  nivel: string;
  duracao_min: number;
  plataforma_id: string;
  plataformas: { nome: string };
  completado?: boolean;
}

interface Plataforma {
  id: string;
  nome: string;
}

export default function TutoriaisPage() {
  const [tutoriais, setTutoriais] = useState<Tutorial[]>([]);
  const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlat, setSelectedPlat] = useState<string>('todas');

  useEffect(() => {
    async function fetchData() {
      const [tutsRes, platsRes] = await Promise.all([
        supabase.from('tutoriais').select('*, plataformas(nome)'),
        supabase.from('plataformas').select('*')
      ]);

      if (tutsRes.data) setTutoriais(tutsRes.data);
      if (platsRes.data) setPlataformas(platsRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = tutoriais.filter(t => {
    const matchesSearch = t.titulo.toLowerCase().includes(search.toLowerCase()) || 
                         t.descricao.toLowerCase().includes(search.toLowerCase());
    const matchesPlat = selectedPlat === 'todas' || t.plataforma_id === selectedPlat;
    return matchesSearch && matchesPlat;
  });

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return <PlayCircle size={14} />;
      case 'manual': return <FileText size={14} />;
      case 'jogo': return <Gamepad2 size={14} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Galeria de Tutoriais</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">Aprende a utilizar os serviços digitais do Estado passo-a-passo com vídeos, manuais e quizzes interativos.</p>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Pesquisar tutoriais (ex: IRS, Segurança Social...)"
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-card focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Filter className="text-muted-foreground shrink-0" size={20} />
          <button
            onClick={() => setSelectedPlat('todas')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedPlat === 'todas' ? 'bg-primary text-white shadow-md' : 'bg-accent hover:bg-accent/80'}`}
          >
            Todas
          </button>
          {plataformas.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlat(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedPlat === p.id ? 'bg-primary text-white shadow-md' : 'bg-accent hover:bg-accent/80'}`}
            >
              {p.nome}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-accent animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/tutoriais/${t.id}`} className="block group">
                <div className="card-hover h-full flex flex-col p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                      {t.plataformas?.nome}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${t.tipo === 'video' ? 'bg-red-100 text-red-700' : t.tipo === 'manual' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {getTipoIcon(t.tipo)}
                        {t.tipo.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{t.titulo}</h3>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-grow">{t.descricao}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock size={14} /> {t.duracao_min} min</span>
                      <span className="font-medium px-2 py-0.5 bg-accent rounded uppercase">{t.nivel}</span>
                    </div>
                    <ChevronRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-accent rounded-3xl">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-muted-foreground">Não encontrámos nenhum tutorial com esses critérios.</p>
          <button onClick={() => { setSearch(''); setSelectedPlat('todas'); }} className="mt-4 text-primary font-bold hover:underline">Ver todos os tutoriais</button>
        </div>
      )}
    </div>
  );
}
