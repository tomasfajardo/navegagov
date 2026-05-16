'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Users, BookOpen, Target, Award, Shield, User, Trash2, ArrowUpRight } from 'lucide-react';

export default function TabGerirUtilizadores() {
  const [utilizadores, setUtilizadores] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTutorials: 0,
    completionRate: 0,
    topTutorial: 'N/A'
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Stats
    const { count: uCount } = await supabase.from('utilizadores').select('*', { count: 'exact', head: true });
    const { count: tCount } = await supabase.from('tutoriais').select('*', { count: 'exact', head: true });
    const { data: pData } = await supabase.from('progresso').select('completado');
    
    // Fetch Users
    const { data: userData } = await supabase
      .from('utilizadores')
      .select('*')
      .order('created_at', { ascending: false });

    if (userData) setUtilizadores(userData);
    
    const completedCount = pData?.filter(p => p.completado).length || 0;
    const totalProgress = pData?.length || 1;

    setStats({
      totalUsers: uCount || 0,
      totalTutorials: tCount || 0,
      completionRate: Math.round((completedCount / totalProgress) * 100),
      topTutorial: 'Marcação SNS24' // Placeholder for now
    });
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleAdmin = async (user: any) => {
    const newRole = user.perfil === 'admin' ? 'utilizador' : 'admin';
    const { error } = await supabase
      .from('utilizadores')
      .update({ perfil: newRole })
      .eq('id', user.id);
    
    if (!error) fetchData();
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Eliminar utilizador permanentemente?')) return;
    const { error } = await supabase.from('utilizadores').delete().eq('id', id);
    if (!error) fetchData();
  };

  return (
    <div className="space-y-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          icon={<Users className="text-primary" size={24} />}
          label="Total Utilizadores"
          value={stats.totalUsers.toString()}
          trend="+5% este mês"
        />
        <KpiCard 
          icon={<BookOpen className="text-secondary" size={24} />}
          label="Total Tutoriais"
          value={stats.totalTutorials.toString()}
          trend="+2 novos"
        />
        <KpiCard 
          icon={<Target className="text-orange-500" size={24} />}
          label="Taxa de Conclusão"
          value={`${stats.completionRate}%`}
          trend="Estável"
        />
        <KpiCard 
          icon={<Award className="text-yellow-500" size={24} />}
          label="Mais Acedido"
          value={stats.topTutorial}
          trend="Destaque"
        />
      </div>

      {/* Users Table */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Users size={24} className="text-primary" /> Lista de Utilizadores
        </h3>
        <div className="overflow-x-auto glass rounded-3xl border border-border/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4">Utilizador</th>
                <th className="px-6 py-4">Perfil</th>
                <th className="px-6 py-4">Data de Registo</th>
                <th className="px-6 py-4">Badges</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {utilizadores.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {u.nome[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{u.nome}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${u.perfil === 'admin' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'}`}>
                      {u.perfil}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(u.created_at).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Award size={14} className="text-yellow-500" />
                      {u.total_badges}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleAdmin(u)}
                        title={u.perfil === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                      >
                        <Shield size={18} />
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <div className="glass p-6 rounded-3xl border-border/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className="mb-4 w-12 h-12 rounded-2xl bg-accent flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <h4 className="text-3xl font-bold mt-1">{value}</h4>
      <p className="text-xs text-primary font-semibold mt-3 flex items-center gap-1">
        <ArrowUpRight size={12} /> {trend}
      </p>
    </div>
  );
}
