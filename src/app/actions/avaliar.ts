'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function submeterAvaliacao(
  conteudoId: string,
  tipoConteudo: 'tutorial' | 'quiz' | 'jogo',
  avaliacao: number
): Promise<{ success?: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'not_authenticated' };

  const { error } = await supabase
    .from('avaliacoes')
    .upsert(
      {
        utilizador_id: user.id,
        conteudo_id: conteudoId,
        tipo_conteudo: tipoConteudo,
        avaliacao,
      },
      { onConflict: 'utilizador_id,conteudo_id,tipo_conteudo' }
    );

  if (error) return { error: error.message };
  return { success: true };
}
