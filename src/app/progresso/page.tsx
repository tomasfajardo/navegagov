'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, 
  Target, 
  Award, 
  History, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  BookOpen,
  LayoutDashboard
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'framer-motion';

interface ProgressData {
  id: string;
  tutorial_id: string;
  completado: boolean;
  pontuacao: number | null;
  badge_atribuido: string | null;
  created_at: string;
  tutoriais: {
    titulo: string;
    plataformas: { nome: string }
  }
}

export default function ProgressoPage() {
  const [data, setData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      const { data: res } = await supabase
        .from('progresso')
        .select('*, tutoriais(titulo, plataformas(nome))')
        .order('created_at', { ascending: false });
      
      if (res) setData(res);
      setLoading(false);
    }
    fetchProgress();
  }, []);

  const totalCompletados = data.filter(d => d.completado).length;
  const mediaPontuacao = data.filter(d => d.pontuacao !== null).length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + (curr.pontuacao || 0), 0) / data.filter(d => d.pontuacao !== null).length) 
    : 0;
  const badgesConquistados = data.filter(d => d.badge_atribuido).length;

  // Chart data: Scores per platform
  const scoresByPlatform = data.reduce((acc: any, curr) => {
    const plat = curr.tutoriais?.plataformas?.nome || 'Outros';
    if (!acc[plat]) acc[plat] = { name: plat, value: 0, count: 0 };
    if (curr.pontuacao !== null) {
      acc[plat].value += curr.pontuacao;
      acc[plat].count += 1;
    }
    return acc;
  }, {});

  const barData = Object.values(scoresByPlatform).map((p: any) => ({
    name: p.name,
    pontuacao: Math.round(p.value / (p.count || 1))
  }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-muted-foreground font-medium">A carregar o teu progresso...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">O Teu Progresso</h1>
          <p className="text-lg text-muted-foreground">Acompanha as tuas conquistas e estatísticas de aprendizagem.</p>
        </div>
        <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border shadow-sm">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <LayoutDashboard size={24} />
          </div>
          <div className="pr-4">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Nível Atual</p>
            <p className="font-bold">Explorador Digital</p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Tutoriais Concluídos', val: totalCompletados, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Média de Pontuação', val: `${mediaPontuacao}%`, icon: Target, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Badges Ganhos', val: badgesConquistados, icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: 'Tempo de Estudo', val: '2.5h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-6 rounded-3xl border border-border shadow-sm"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-3xl font-black">{stat.val}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card p-8 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 size={20} className="text-primary" />
              Domínio por Plataforma
            </h3>
            <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">Média %</div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', radius: 8 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="pontuacao" radius={[6, 6, 0, 0]} barSize={40}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm flex flex-col">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <History size={20} className="text-primary" />
            Atividade Recente
          </h3>
          <div className="space-y-6 flex-grow">
            {data.length > 0 ? data.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="mt-1 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10 shrink-0" />
                <div className="flex-grow">
                  <p className="text-sm font-bold group-hover:text-primary transition-colors">{item.tutoriais?.titulo}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString('pt-PT')}</p>
                    {item.pontuacao !== null && (
                      <span className="text-xs font-bold text-green-600">{item.pontuacao}%</span>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-50 italic text-sm">Ainda não tens atividade registada.</div>
            )}
          </div>
          <button className="mt-8 text-sm font-bold text-primary flex items-center gap-1 hover:underline mx-auto">
            Ver histórico completo <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Badges Section */}
      <section className="bg-card p-8 rounded-3xl border border-border shadow-sm">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
          <Award size={20} className="text-yellow-500" />
          Teu Quadro de Honra
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {data.filter(d => d.badge_atribuido).map((badge, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-3 shadow-inner group-hover:shadow-lg transition-all relative">
                <Award size={40} />
                <div className="absolute inset-0 rounded-full border-4 border-yellow-200/50 scale-110" />
              </div>
              <p className="text-xs font-bold leading-tight px-2">{badge.badge_atribuido}</p>
            </motion.div>
          ))}
          {badgesConquistados === 0 && (
            <div className="col-span-full py-8 text-center text-muted-foreground text-sm italic">
              Conclui quizzes com 70% ou mais para ganhares o teu primeiro badge!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
