'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Gamepad2, Trash2, ExternalLink, RefreshCw } from 'lucide-react';

export default function TabGerirJogos() {
  const [jogos, setJogos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchJogos = async () => {
    setLoading(true);
    setDbError(null);
    const { data: jogos, error } = await supabase
      .from('tutoriais')
      .select('*, plataformas(nome)')
      .eq('tipo', 'jogo')
      .order('created_at', { ascending: false });

    console.log('Jogos encontrados:', jogos, 'Erro:', error);

    if (error) setDbError(error.message);
    setJogos(jogos ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchJogos(); }, []);

  const deleteJogo = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este jogo?')) return;
    await supabase.from('jogos_conteudo').delete().eq('tutorial_id', id);
    const { error } = await supabase.from('tutoriais').delete().eq('id', id);
    if (error) alert('Erro ao eliminar: ' + error.message);
    else setJogos(j => j.filter(item => item.id !== id));
  };

  if (loading) return <div className="flex justify-center p-20 text-muted-foreground">A carregar jogos...</div>;

  return (
    <div>
      {dbError && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
          <strong>Erro Supabase:</strong> {dbError}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-sm text-muted-foreground font-medium">
              <th className="px-4 py-4">Jogo</th>
              <th className="px-4 py-4">Plataforma</th>
              <th className="px-4 py-4">Nível</th>
              <th className="px-4 py-4">Duração</th>
              <th className="px-4 py-4">URL</th>
              <th className="px-4 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {jogos.length === 0 && !dbError && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                  <Gamepad2 size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-semibold mb-1">Nenhum jogo encontrado</p>
                  <p className="text-sm">
                    Verifica se existem tutoriais com{' '}
                    <code className="font-mono bg-accent px-1 rounded">tipo = &apos;jogo&apos;</code>{' '}
                    na base de dados.
                  </p>
                  <button
                    onClick={fetchJogos}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-sm font-medium hover:bg-border transition-colors"
                  >
                    <RefreshCw size={14} /> Recarregar
                  </button>
                </td>
              </tr>
            )}
            {jogos.map((j) => (
              <tr key={j.id} className="border-b border-border hover:bg-accent/30 transition-colors group">
                <td className="px-4 py-4">
                  <p className="font-semibold text-sm">{j.titulo}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[220px]">{j.descricao}</p>
                </td>
                <td className="px-4 py-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {j.plataformas?.nome ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-4 capitalize text-sm">{j.nivel}</td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{j.duracao_min} min</td>
                <td className="px-4 py-4">
                  {j.conteudo_url ? (
                    <a
                      href={j.conteudo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-xs hover:underline truncate max-w-[120px] block"
                    >
                      {j.conteudo_url}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={j.conteudo_url || `/tutoriais/${j.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 hover:bg-accent rounded-lg text-primary transition-colors"
                      title="Ver jogo"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <button
                      onClick={() => deleteJogo(j.id)}
                      className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                      title="Eliminar"
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
  );
}
