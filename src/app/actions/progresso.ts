'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { verificarEAtribuirBadges } from '@/lib/gamification';

export async function registarProgresso(tutorialId: string, pontuacao: number | null, completado: boolean) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Upsert progress
  const { error } = await supabase
    .from('progresso')
    .upsert({
      utilizador_id: user.id,
      tutorial_id: tutorialId,
      completado: completado,
      pontuacao: pontuacao,
      ultima_visualizacao: new Date().toISOString(),
      data: new Date().toISOString()
    }, {
      onConflict: 'utilizador_id,tutorial_id'
    });

  if (error) {
    console.error('Error saving progress:', error);
    return { success: false, error };
  }

  // Check badges if completed
  let newBadges: any[] = [];
  if (completado) {
    newBadges = await verificarEAtribuirBadges(supabase as any, user.id);
  }

  return { success: true, newBadges };
}
