'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Trophy, Plus, Save, Trash2, Edit2, CheckCircle2, UserPlus, Search, Filter } from 'lucide-react';

const COLORS = [
  { id: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { id: 'green', label: 'Verde', class: 'bg-emerald-500' },
  { id: 'yellow', label: 'Amarelo', class: 'bg-yellow-500' },
  { id: 'gold', label: 'Dourado', class: 'bg-amber-400' },
  { id: 'orange', label: 'Laranja', class: 'bg-orange-500' },
  { id: 'purple', label: 'Roxo', class: 'bg-purple-500' },
  { id: 'red', label: 'Vermelho', class: 'bg-red-500' },
  { id: 'teal', label: 'Teal', class: 'bg-teal-500' },
  { id: 'gray', label: 'Cinzento', class: 'bg-slate-500' },
];

export default function TabGerirBadges() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Section A State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    icone: '🏆',
    cor: 'blue',
    tipo: 'tutorial',
    condicao_tipo: 'completar_n_tutoriais',
    condicao_valor: 1,
    condicao_plataforma: '',
  });

  // Section C State
  const [manualUserId, setManualUserId] = useState('');
  const [manualBadgeId, setManualBadgeId] = useState('');
  const [manualStatus, setManualStatus] = useState('');

  // KPIs
  const [kpis, setKpis] = useState({
    total: 0,
    mostEarned: '',
    topUser: '',
    thisWeek: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    
    // Fetch Definitions
    const { data: defs } = await supabase.from('badges_definicoes').select('*').order('created_at', { ascending: true });
    if (defs) setDefinitions(defs);

    // Fetch History
    const { data: hist } = await supabase
      .from('utilizador_badges')
      .select('*, utilizadores(nome, email), badges_definicoes(nome, icone, cor)')
      .order('data_conquista', { ascending: false });
    
    if (hist) {
      setHistory(hist);
      
      // Calculate KPIs
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const thisWeekCount = hist.filter(h => new Date(h.data_conquista) > oneWeekAgo).length;
      
      const badgeCounts = hist.reduce((acc: any, h: any) => {
        acc[h.badges_definicoes?.nome] = (acc[h.badges_definicoes?.nome] || 0) + 1;
        return acc;
      }, {});
      const mostEarned = Object.keys(badgeCounts).sort((a, b) => badgeCounts[b] - badgeCounts[a])[0] || 'Nenhum';

      const userCounts = hist.reduce((acc: any, h: any) => {
        const uName = h.utilizadores?.nome || 'Desconhecido';
        acc[uName] = (acc[uName] || 0) + 1;
        return acc;
      }, {});
      const topUser = Object.keys(userCounts).sort((a, b) => userCounts[b] - userCounts[a])[0] || 'Nenhum';

      setKpis({
        total: hist.length,
        mostEarned,
        topUser,
        thisWeek: thisWeekCount,
      });
    }

    // Fetch Users for Dropdown
    const { data: usr } = await supabase.from('utilizadores').select('id, nome, email').order('nome');
    if (usr) setUsers(usr);

    setLoading(false);
  }

  const handleSaveBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;

    const payload = {
      ...formData,
      condicao_valor: formData.condicao_valor || null,
      condicao_plataforma: formData.condicao_plataforma || null,
    };

    if (editingId) {
      await supabase.from('badges_definicoes').update(payload).eq('id', editingId);
    } else {
      await supabase.from('badges_definicoes').insert([payload]);
    }

    setEditingId(null);
    setFormData({
      nome: '', descricao: '', icone: '🏆', cor: 'blue', tipo: 'tutorial',
      condicao_tipo: 'completar_n_tutoriais', condicao_valor: 1, condicao_plataforma: '',
    });
    fetchData();
  };

  const handleDeleteBadge = async (id: string) => {
    if (!confirm('Eliminar este badge?')) return;
    await supabase.from('badges_definicoes').delete().eq('id', id);
    fetchData();
  };

  const handleEditBadge = (badge: any) => {
    setEditingId(badge.id);
    setFormData({
      nome: badge.nome,
      descricao: badge.descricao || '',
      icone: badge.icone || '🏆',
      cor: badge.cor || 'blue',
      tipo: badge.tipo || 'tutorial',
      condicao_tipo: badge.condicao_tipo || 'completar_n_tutoriais',
      condicao_valor: badge.condicao_valor || 1,
      condicao_plataforma: badge.condicao_plataforma || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAssignBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUserId || !manualBadgeId) return;

    setManualStatus('A atribuir...');
    
    // Check if already has it
    const { data: existing } = await supabase
      .from('utilizador_badges')
      .select('id')
      .eq('utilizador_id', manualUserId)
      .eq('badge_id', manualBadgeId)
      .single();

    if (existing) {
      setManualStatus('Utilizador já tem este badge.');
      setTimeout(() => setManualStatus(''), 3000);
      return;
    }

    const { error } = await supabase.from('utilizador_badges').insert([{
      utilizador_id: manualUserId,
      badge_id: manualBadgeId
    }]);

    if (error) {
      setManualStatus('Erro ao atribuir.');
    } else {
      setManualStatus('Atribuído com sucesso!');
      
      // Update users total_badges
      await supabase.rpc('increment_total_badges', { u_id: manualUserId, amount: 1 }).catch(async () => {
         const { data: user } = await supabase.from('utilizadores').select('total_badges').eq('id', manualUserId).single();
         await supabase.from('utilizadores').update({ total_badges: (user?.total_badges || 0) + 1 }).eq('id', manualUserId);
      });

      setManualUserId('');
      setManualBadgeId('');
      fetchData();
    }

    setTimeout(() => setManualStatus(''), 3000);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando dados da gamificação...</div>;

  return (
    <div className="space-y-12">
      
      {/* Secção A: Definições de Badges */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-xl text-primary"><Trophy size={24} /></div>
          <h2 className="text-2xl font-bold">Definições de Badges</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="xl:col-span-1 bg-card border border-border rounded-2xl p-6 shadow-sm h-fit">
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Editar Badge' : 'Novo Badge'}</h3>
            <form onSubmit={handleSaveBadge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Nome</label>
                <input required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: Primeiros Passos" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Descrição</label>
                <textarea value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]" placeholder="Breve descrição da conquista..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Ícone</label>
                  <div className="flex gap-2">
                    <input value={formData.icone} onChange={e => setFormData({...formData, icone: e.target.value})} className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-center text-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Cor</label>
                  <select value={formData.cor} onChange={e => setFormData({...formData, cor: e.target.value})} className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {COLORS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Categoria</label>
                <select value={formData.tipo} onChange={e => {
                  const newTipo = e.target.value;
                  let defCond = 'completar_n_tutoriais';
                  if (newTipo === 'quiz') defCond = 'pontuacao_quiz';
                  if (newTipo === 'plataforma') defCond = 'plataforma_especifica';
                  if (newTipo === 'especial') defCond = 'especial';
                  setFormData({...formData, tipo: newTipo, condicao_tipo: defCond});
                }} className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm mb-4">
                  <option value="tutorial">Tutorial</option>
                  <option value="quiz">Quiz</option>
                  <option value="plataforma">Plataforma</option>
                  <option value="especial">Especial</option>
                </select>

                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Condição</label>
                
                {formData.tipo === 'tutorial' && (
                  <div className="space-y-2">
                    <select value={formData.condicao_tipo} onChange={e => setFormData({...formData, condicao_tipo: e.target.value})} className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm">
                      <option value="completar_n_tutoriais">Completar N Tutoriais</option>
                    </select>
                    <input type="number" min="1" value={formData.condicao_valor} onChange={e => setFormData({...formData, condicao_valor: parseInt(e.target.value)})} placeholder="Número de tutoriais" className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm" />
                  </div>
                )}

                {formData.tipo === 'quiz' && (
                  <div className="space-y-2">
                    <select value={formData.condicao_tipo} onChange={e => setFormData({...formData, condicao_tipo: e.target.value})} className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm">
                      <option value="pontuacao_quiz">Pontuação Mínima (%)</option>
                    </select>
                    <input type="number" min="1" max="100" value={formData.condicao_valor} onChange={e => setFormData({...formData, condicao_valor: parseInt(e.target.value)})} placeholder="Ex: 100" className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm" />
                  </div>
                )}

                {formData.tipo === 'plataforma' && (
                  <div className="space-y-2">
                    <select value={formData.condicao_tipo} onChange={e => setFormData({...formData, condicao_tipo: e.target.value})} className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm">
                      <option value="plataforma_especifica">Completar tutoriais numa Plataforma</option>
                      <option value="multiplas_plataformas">Dominar Múltiplas Plataformas</option>
                    </select>
                    
                    {formData.condicao_tipo === 'plataforma_especifica' && (
                      <>
                        <input type="text" value={formData.condicao_plataforma} onChange={e => setFormData({...formData, condicao_plataforma: e.target.value})} placeholder="Nome da Plataforma (ex: SNS 24)" className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm" />
                        <input type="number" min="1" max="100" value={formData.condicao_valor} onChange={e => setFormData({...formData, condicao_valor: parseInt(e.target.value)})} placeholder="Percentagem (%) a completar (ex: 100)" className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm" />
                      </>
                    )}
                    
                    {formData.condicao_tipo === 'multiplas_plataformas' && (
                      <input type="number" min="1" value={formData.condicao_valor} onChange={e => setFormData({...formData, condicao_valor: parseInt(e.target.value)})} placeholder="Número de Plataformas" className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm" />
                    )}
                  </div>
                )}

                {formData.tipo === 'especial' && (
                  <div className="space-y-2">
                    <select value={formData.condicao_tipo} onChange={e => setFormData({...formData, condicao_tipo: e.target.value})} className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm">
                      <option value="primeiro_login">Primeiro Login / Registo</option>
                      <option value="especial">Condição Personalizada Livre</option>
                    </select>
                    {formData.condicao_tipo === 'especial' && (
                      <input type="text" value={formData.condicao_plataforma} onChange={e => setFormData({...formData, condicao_plataforma: e.target.value})} placeholder="Descreve a condição" className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm" />
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-2">
                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                  <Save size={16} /> {editingId ? 'Guardar' : 'Adicionar'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => setEditingId(null)} className="px-4 bg-accent text-foreground py-2 rounded-lg font-bold hover:bg-accent/80 transition-colors">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tabela de Definições */}
          <div className="xl:col-span-2 bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-accent/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4 font-bold">Badge</th>
                    <th className="p-4 font-bold">Tipo</th>
                    <th className="p-4 font-bold">Condição</th>
                    <th className="p-4 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {definitions.map((def) => (
                    <tr key={def.id} className="hover:bg-accent/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-xl shadow-sm`}>
                            {def.icone}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{def.nome}</p>
                            <p className="text-xs text-muted-foreground max-w-[200px] truncate">{def.descricao}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-md tracking-wide">
                          {def.tipo}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {def.condicao_tipo === 'completar_n_tutoriais' && `${def.condicao_valor} tutoriais`}
                        {def.condicao_tipo === 'pontuacao_quiz' && `${def.condicao_valor}% em Quiz`}
                        {def.condicao_tipo === 'plataforma_especifica' && `${def.condicao_valor}% em ${def.condicao_plataforma}`}
                        {def.condicao_tipo === 'multiplas_plataformas' && `${def.condicao_valor} Plataformas`}
                        {def.condicao_tipo === 'primeiro_login' && `Ao Registar`}
                        {def.condicao_tipo === 'especial' && `${def.condicao_plataforma}`}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditBadge(def)} className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteBadge(def.id)} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {definitions.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Nenhum badge definido.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Secção B: Histórico e KPIs */}
      <section className="pt-8 border-t border-border">
        <h2 className="text-2xl font-bold mb-6">Badges Conquistados</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Total Atribuídos" value={kpis.total} />
          <KpiCard label="Mais Conquistado" value={kpis.mostEarned} />
          <KpiCard label="Utilizador Top" value={kpis.topUser} />
          <KpiCard label="Atribuídos esta Semana" value={kpis.thisWeek} />
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-accent/50 border-b border-border flex items-center gap-4">
            <Filter size={16} className="text-muted-foreground" />
            <span className="text-sm font-bold text-muted-foreground">Histórico de Atribuições</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-card sticky top-0 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider z-10 shadow-sm">
                <tr>
                  <th className="p-4 font-bold">Utilizador</th>
                  <th className="p-4 font-bold">Badge</th>
                  <th className="p-4 font-bold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((hist) => (
                  <tr key={hist.id} className="hover:bg-accent/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-foreground">{hist.utilizadores?.nome || 'Desconhecido'}</p>
                      <p className="text-xs text-muted-foreground">{hist.utilizadores?.email || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{hist.badges_definicoes?.icone}</span>
                        <span className="font-bold">{hist.badges_definicoes?.nome}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(hist.data_conquista).toLocaleString('pt-PT')}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Nenhum badge conquistado ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Secção C: Atribuição Manual */}
      <section className="pt-8 border-t border-border">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <UserPlus className="text-primary" size={24} /> Atribuição Manual
        </h2>
        
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-2xl">
          <p className="text-sm text-muted-foreground mb-6">Utiliza esta ferramenta para atribuir badges a utilizadores em situações excecionais, resolução de bugs ou recompensas manuais.</p>
          
          <form onSubmit={handleAssignBadge} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Utilizador</label>
              <select required value={manualUserId} onChange={e => setManualUserId(e.target.value)} className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">Selecione um utilizador...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>)}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Badge</label>
              <select required value={manualBadgeId} onChange={e => setManualBadgeId(e.target.value)} className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">Selecione um badge...</option>
                {definitions.map(b => <option key={b.id} value={b.id}>{b.icone} {b.nome}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full sm:w-auto bg-primary text-white px-6 py-2 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-primary/90 transition-colors">
              Atribuir
            </button>
          </form>
          {manualStatus && (
            <p className="mt-4 text-sm font-bold text-primary">{manualStatus}</p>
          )}
        </div>
      </section>
      
    </div>
  );
}

function KpiCard({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-foreground truncate" title={value.toString()}>{value}</p>
    </div>
  );
}
