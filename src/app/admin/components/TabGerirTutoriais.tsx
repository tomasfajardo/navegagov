'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Pencil, Trash2, Video, FileText, Gamepad2, ExternalLink } from 'lucide-react';

export default function TabGerirTutoriais({ onEdit }: { onEdit?: (tutorial: any) => void }) {
  const [tutoriais, setTutoriais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTutoriais = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tutoriais')
      .select('*, plataformas(nome)')
      .in('tipo', ['video', 'manual'])
      .order('created_at', { ascending: false });

    if (data) setTutoriais(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTutoriais();
  }, []);

  const deleteTutorial = async (id: string, url: string) => {
    if (!confirm('Tens a certeza que queres eliminar este tutorial?')) return;

    try {
      // If it's a storage file, delete it
      if (url && url.includes('storage/v1/object/public/conteudos/')) {
        const path = url.split('conteudos/')[1];
        await supabase.storage.from('conteudos').remove([path]);
      }

      const { error } = await supabase.from('tutoriais').delete().eq('id', id);
      if (error) throw error;
      
      setTutoriais(t => t.filter(item => item.id !== id));
    } catch (err: any) {
      alert('Erro ao eliminar: ' + err.message);
    }
  };

  if (loading) return <div className="flex justify-center p-20 text-muted-foreground">A carregar tutoriais...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border text-sm text-muted-foreground font-medium">
            <th className="px-4 py-4">Tutorial</th>
            <th className="px-4 py-4">Plataforma</th>
            <th className="px-4 py-4">Nível</th>
            <th className="px-4 py-4">Tipo</th>
            <th className="px-4 py-4">Conteúdo</th>
            <th className="px-4 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tutoriais.map((t) => (
            <tr key={t.id} className="border-b border-border hover:bg-accent/30 transition-colors group">
              <td className="px-4 py-4">
                <p className="font-semibold text-sm">{t.titulo}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{t.descricao}</p>
              </td>
              <td className="px-4 py-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {t.plataformas?.nome}
                </span>
              </td>
              <td className="px-4 py-4 capitalize text-sm">{t.nivel}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2 text-sm">
                  {t.tipo === 'video' && <Video size={16} className="text-blue-500" />}
                  {t.tipo === 'manual' && <FileText size={16} className="text-green-500" />}
                  {(t.tipo === 'jogo' || t.tipo === 'quiz') && <Gamepad2 size={16} className="text-purple-500" />}
                  <span className="capitalize">{t.tipo}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                {t.conteudo_url && (
                  <a href={t.conteudo_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                    Link <ExternalLink size={14} />
                  </a>
                )}
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit?.(t)}
                    className="p-2 hover:bg-accent rounded-lg text-primary transition-colors"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => deleteTutorial(t.id, t.conteudo_url)}
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
  );
}
