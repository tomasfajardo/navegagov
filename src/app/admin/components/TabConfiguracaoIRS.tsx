'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Save, AlertCircle, Loader2, Edit3, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TabConfiguracaoIRS() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('irs_configuracao')
      .select('*')
      .order('ano', { ascending: false })
      .order('tipo');
    
    if (error) {
      console.error('Erro ao procurar configurações:', error);
      setError('Erro ao carregar dados do Supabase.');
    } else {
      setConfigs(data || []);
    }
    setLoading(false);
  };

  const startEdit = (config: any) => {
    setEditingId(config.id);
    setEditValue(JSON.stringify(config.valor, null, 2));
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setError(null);
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    setError(null);
    
    try {
      const parsedValue = JSON.parse(editValue);
      
      const { error } = await supabase
        .from('irs_configuracao')
        .update({ valor: parsedValue })
        .eq('id', id);

      if (error) throw error;
      
      setEditingId(null);
      fetchConfigs();
    } catch (err: any) {
      console.error('Erro ao guardar:', err);
      setError('Erro ao guardar: Verifica se o JSON é válido.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black mb-2">Configuração do Simulador IRS</h2>
          <p className="text-muted-foreground">Gere os escalões, deduções e parâmetros do simulador sem alterar o código.</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="font-bold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {configs.map((config) => (
          <div key={config.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex justify-between items-center bg-accent/30">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                    {config.ano}
                  </span>
                  <h3 className="font-bold text-lg">{config.descricao}</h3>
                </div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tipo: {config.tipo}</p>
              </div>
              
              {editingId !== config.id && (
                <button 
                  onClick={() => startEdit(config)}
                  className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-all"
                >
                  <Edit3 size={20} />
                </button>
              )}
            </div>

            <div className="p-6">
              {editingId === config.id ? (
                <div className="space-y-4">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={10}
                    className="w-full font-mono text-sm p-4 rounded-2xl bg-black text-emerald-400 border-2 border-primary/30 focus:border-primary outline-none transition-all"
                    placeholder="JSON aqui..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-accent transition-all"
                    >
                      <X size={16} /> Cancelar
                    </button>
                    <button
                      onClick={() => handleSave(config.id)}
                      disabled={saving}
                      className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                      Guardar Alterações
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-accent/50 rounded-2xl p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-muted-foreground">
                    {JSON.stringify(config.valor, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
