'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Award, BookOpen, CheckCircle, Target, Zap, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgressItem {
  id: string;
  tutorial_id: string;
  completado: boolean;
  pontuacao: number;
  badge_atribuido: string | null;
  data: string;
  tutoriais: {
    titulo: string;
    plataformas: { nome: string };
  };
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ProgressoPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalBadges: 0,
    avgScore: 0,
    studyTime: '0h',
  });

  useEffect(() => {
    async function fetchProgress() {
      const { data } = await supabase
        .from('progresso')
        .select('*, tutoriais(titulo, plataformas(nome))')
        .order('data', { ascending: false });

      if (data) {
        const items = data as ProgressItem[];
        setProgress(items);
        
        const completed = items.filter(i => i.completado).length;
        const badges = items.filter(i => i.badge_atribuido).length;
        const scores = items.filter(i => i.pontuacao !== null).map(i => i.pontuacao);
        const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        
        setStats({
          totalCompleted: completed,
          totalBadges: badges,
          avgScore: avg,
          studyTime: `${Math.round(completed * 10 / 60)}h`, // Estimate 10min per tutorial
        });
      }
      setLoading(false);
    }
    fetchProgress();
  }, []);

  // Data for Chart: Group by month
  const chartData = [
    { name: 'Jan', completados: 0 },
    { name: 'Fev', completados: 0 },
    { name: 'Mar', completados: 0 },
    { name: 'Abr', completados: progress.length }, // Simple for now
  ];

  // Data for Knowledge Areas
  const areasMap = new Map<string, number>();
  progress.forEach(p => {
    const plat = p.tutoriais?.plataformas?.nome || 'Geral';
    areasMap.set(plat, (areasMap.get(plat) || 0) + 1);
  });
  const categoryData = Array.from(areasMap.entries()).map(([name, value]) => ({ name, value }));
  if (categoryData.length === 0) categoryData.push({ name: 'Sem dados', value: 1 });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 text-foreground">O Teu Progresso</h1>
          <p className="text-muted-foreground text-lg">Acompanha a tua jornada de literacia digital em tempo real.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border border-primary/20 shadow-lg shadow-primary/5">
            <Zap className="text-yellow-500 fill-yellow-500" size={24} />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Ritmo Atual</p>
              <p className="font-bold text-lg leading-none">Aprendiz Ativo</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<CheckCircle size={24} />} label="Atividades Concluídas" value={stats.totalCompleted.toString()} sub="Tutoriais e Quizzes" />
        <StatCard icon={<Award size={24} />} label="Badges Conquistados" value={stats.totalBadges.toString()} sub="Reconhecimentos oficiais" />
        <StatCard icon={<Target size={24} />} label="Média de Pontuação" value={`${stats.avgScore}%`} sub="Performance em Quizzes" />
        <StatCard icon={<TrendingUp size={24} />} label="Tempo Estimado" value={stats.studyTime} sub="Dedicação à plataforma" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Histórico de Atividade</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Calendar size={14} /> Últimos 4 meses
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'rgba(37, 99, 235, 0.05)'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="completados" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold mb-8">Áreas Dominadas</h3>
          <div className="h-[200px] w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                  <span className="text-sm font-medium text-muted-foreground">{cat.name}</span>
                </div>
                <span className="text-sm font-bold">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Conquistas e Histórico</h3>
          {progress.length > 0 && <span className="text-xs font-bold uppercase tracking-widest text-primary">Sincronizado com Supabase</span>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
             [1,2].map(i => <div key={i} className="h-20 bg-accent animate-pulse rounded-2xl" />)
          ) : progress.length > 0 ? (
            progress.map((p, idx) => (
              <AchievementItem 
                key={p.id}
                title={p.badge_atribuido ? "Novo Badge Ganho!" : "Tutorial Concluído"} 
                desc={`${p.tutoriais?.titulo} (${p.pontuacao ? p.pontuacao + '%' : 'Lido'})`}
                date={new Date(p.data).toLocaleDateString('pt-PT')}
                icon={p.badge_atribuido ? "🏆" : "✅"}
                highlight={!!p.badge_atribuido}
              />
            ))
          ) : (
            <div className="md:col-span-2 text-center py-16 bg-accent/50 rounded-3xl border-2 border-dashed border-border">
              <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground font-medium">Ainda não tens atividades registadas. Começa um tutorial!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string, sub: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all"
    >
      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">{icon}</div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-bold">{label}</p>
      <h4 className="text-3xl font-black mb-1 text-foreground">{value}</h4>
      <p className="text-[10px] text-muted-foreground font-medium">{sub}</p>
    </motion.div>
  );
}

function AchievementItem({ title, desc, date, icon, highlight }: { title: string, desc: string, date: string, icon: string, highlight?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-5 p-5 rounded-3xl border transition-all ${highlight ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' : 'bg-card border-border hover:border-primary/20'}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${highlight ? 'bg-white' : 'bg-accent'}`}>{icon}</div>
      <div className="flex-grow">
        <h5 className={`font-bold text-base ${highlight ? 'text-primary' : 'text-foreground'}`}>{title}</h5>
        <p className="text-sm text-muted-foreground line-clamp-1">{desc}</p>
      </div>
      <div className="text-right">
        <span className="text-[10px] uppercase font-black text-muted-foreground block">{date}</span>
      </div>
    </motion.div>
  );
}
