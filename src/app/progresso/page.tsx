'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Award, BookOpen, CheckCircle, Target, Zap, TrendingUp, Calendar, Loader2, Lock, Info } from 'lucide-react';
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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);

  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalBadges: 0,
    avgScore: 0,
    activeDays: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Profile
      const { data: profile } = await supabase
        .from('utilizadores')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserProfile(profile);

      // Fetch Progress with Joins
      const { data: progressData } = await supabase
        .from('progresso')
        .select(`
          *,
          tutoriais (
            titulo,
            plataformas (
              nome
            )
          )
        `)
        .eq('utilizador_id', user.id)
        .order('data', { ascending: false });

      if (progressData) {
        const items = progressData as any[];
        setProgress(items);
        
        const completed = items.filter(i => i.completado).length;
        const scores = items.filter(i => i.pontuacao !== null).map(i => i.pontuacao);
        const avg = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
        
        // Count distinct days
        const distinctDays = new Set(items.map(i => new Date(i.data).toDateString())).size;
        
        setStats(prev => ({ ...prev, totalCompleted: completed, avgScore: avg, activeDays: distinctDays }));
      }

      // Fetch Badges
      const { data: bDefs } = await supabase.from('badges_definicoes').select('*').order('nome');
      if (bDefs) setAllBadges(bDefs);

      const { data: uBadges } = await supabase
        .from('utilizador_badges')
        .select('*, badges_definicoes(*)')
        .eq('utilizador_id', user.id)
        .order('data_conquista', { ascending: false });
      
      if (uBadges) {
        setEarnedBadges(uBadges);
        setStats(prev => ({ ...prev, totalBadges: uBadges.length }));
      }

      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  // Data for Bar Chart: Completed by Platform
  const platformStats = new Map<string, number>();
  progress.forEach(p => {
    const platName = p.tutoriais?.plataformas?.nome || 'Outros';
    if (p.completado) {
      platformStats.set(platName, (platformStats.get(platName) || 0) + 1);
    }
  });
  
  const barData = Array.from(platformStats.entries()).map(([name, value]) => ({ name, completados: value }));

  // Data for Pie Chart: Area Distribution
  const categoryData = barData.length > 0 ? barData.map(d => ({ name: d.name, value: d.completados })) : [{ name: 'Sem dados', value: 1 }];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badge_id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 text-foreground">Olá, {userProfile?.nome?.split(' ')[0] || 'Utilizador'}</h1>
          <p className="text-muted-foreground text-lg">
            {userProfile?.perfil === 'idoso' && "A aprender ao seu próprio ritmo para dominar o mundo digital."}
            {userProfile?.perfil === 'imigrante' && "Facilitando a sua integração em Portugal através dos serviços públicos."}
            {userProfile?.perfil === 'adulto' && "Superando barreiras e simplificando o seu dia-a-dia digital."}
            {userProfile?.perfil === 'jovem_adulto' && "Gerindo o seu futuro e serviços públicos com total autonomia."}
            {!['idoso', 'imigrante', 'adulto', 'jovem_adulto'].includes(userProfile?.perfil) && "Aqui está o resumo da tua jornada de aprendizagem."}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border border-primary/20 shadow-lg shadow-primary/5">
            <Zap className="text-yellow-500 fill-yellow-500" size={24} />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Ritmo Atual</p>
              <p className="font-bold text-lg leading-none">{stats.activeDays > 0 ? 'Focado' : 'Iniciante'}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<CheckCircle size={24} />} label="Concluídos" value={stats.totalCompleted.toString()} sub="Total de tutoriais" />
        <StatCard icon={<Award size={24} />} label="Badges" value={stats.totalBadges.toString()} sub="Conquistas ganhas" />
        <StatCard icon={<Target size={24} />} label="Média" value={`${stats.avgScore}%`} sub="Performance global" />
        <StatCard icon={<Calendar size={24} />} label="Dias Ativos" value={stats.activeDays.toString()} sub="Dias de aprendizagem" />
      </div>

      {/* Badges Slider Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">As Minhas Conquistas</h3>
          <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {stats.totalBadges} de {allBadges.length} desbloqueados
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar snap-x">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const earnedInfo = earnedBadges.find(ub => ub.badge_id === badge.id);
            
            return (
              <div 
                key={badge.id} 
                className={`snap-start shrink-0 w-[280px] p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                  isEarned 
                  ? 'bg-card border-primary/30 hover:border-primary hover:shadow-xl hover:-translate-y-1' 
                  : 'bg-muted/30 border-border opacity-70 hover:opacity-100'
                }`}
              >
                {!isEarned && (
                  <div className="absolute top-4 right-4 text-muted-foreground/50">
                    <Lock size={20} />
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 ${
                  isEarned ? 'bg-primary/10 group-hover:scale-110 group-hover:rotate-6' : 'bg-background grayscale opacity-50'
                }`}>
                  <span className="text-3xl drop-shadow-sm">{badge.icone}</span>
                </div>

                <h4 className={`text-lg font-bold mb-2 leading-tight ${!isEarned && 'text-muted-foreground'}`}>{badge.nome}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">{badge.descricao}</p>

                {isEarned ? (
                  <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-bold text-emerald-500">
                    <CheckCircle size={14} /> 
                    Conquistado em {new Date(earnedInfo.data_conquista).toLocaleDateString('pt-PT')}
                  </div>
                ) : (
                  <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Info size={14} /> Bloqueado
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Platform Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Domínio por Plataforma</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <TrendingUp size={14} /> Tutoriais concluídos
            </div>
          </div>
          <div className="h-[300px] w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(37, 99, 235, 0.05)'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Bar dataKey="completados" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-muted/20 rounded-2xl">
                <p className="text-muted-foreground">Sem dados para mostrar</p>
              </div>
            )}
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold mb-8">Distribuição de Foco</h3>
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

      {/* History */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Histórico de Atividades</h3>
          {progress.length > 0 && <span className="text-xs font-bold uppercase tracking-widest text-primary">Dados Reais</span>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progress.length > 0 ? (
            progress.map((p) => (
              <AchievementItem 
                key={p.id}
                title={p.badge_atribuido ? "Novo Badge: " + p.badge_atribuido : "Tutorial Concluído"} 
                desc={`${p.tutoriais?.titulo} - ${p.tutoriais?.plataformas?.nome}`}
                score={p.pontuacao}
                date={new Date(p.data).toLocaleDateString('pt-PT')}
                icon={p.badge_atribuido ? "🏆" : "✅"}
                highlight={!!p.badge_atribuido}
              />
            ))
          ) : (
            <div className="md:col-span-2 text-center py-16 bg-accent/50 rounded-3xl border-2 border-dashed border-border">
              <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground font-medium">Ainda não tens atividades registadas. Começa a tua jornada!</p>
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

function AchievementItem({ title, desc, score, date, icon, highlight }: { title: string, desc: string, score: number, date: string, icon: string, highlight?: boolean }) {
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
        {score !== null && (
          <div className="mt-2 w-full bg-accent h-1.5 rounded-full overflow-hidden max-w-[150px]">
            <div className="bg-primary h-full" style={{ width: `${score}%` }} />
          </div>
        )}
      </div>
      <div className="text-right">
        {score !== null && <span className="text-xs font-bold text-primary block mb-1">{score}%</span>}
        <span className="text-[10px] uppercase font-black text-muted-foreground block">{date}</span>
      </div>
    </motion.div>
  );
}
