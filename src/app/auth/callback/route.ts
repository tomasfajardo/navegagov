import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verificarEAtribuirBadges } from '@/lib/gamification';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/progresso';

  if (code) {
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
              // Ignore if setAll is called from a Server Component
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const user = data.user;
      
      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('utilizadores')
        .select('perfil')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Auto-register user in 'utilizadores' table with empty profile to trigger onboarding
        await supabase
          .from('utilizadores')
          .insert({
            id: user.id,
            nome: user.user_metadata.full_name || user.email?.split('@')[0] || 'Utilizador',
            email: user.email,
            perfil: null, // Null to trigger onboarding
            created_at: new Date().toISOString()
          });
        
        // Trigger gamification logic for new users
        await verificarEAtribuirBadges(supabase as any, user.id);
        
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      // Check if profile is empty or null to redirect to onboarding
      if (!existingProfile.perfil) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      if (existingProfile.perfil === 'admin') {
        return NextResponse.redirect(`${origin}/admin`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
