import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Protected routes check
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserRoute = pathname.startsWith('/progresso');

  if (isAdminRoute || isUserRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // For admin routes, check the profile
    if (isAdminRoute) {
      // We need to re-initialize supabase to get the profile from the database
      // since the session only has auth metadata. 
      // But we can also check the user's public metadata if we synced it.
      // However, the database is the source of truth for the 'admin' role.
      
      // Using a quick hack: if we're in middleware, we can't easily wait for DB
      // unless we use a fast check or trust the token's app_metadata.
      // I'll check the 'utilizadores' table.
      
      const { createServerClient } = await import('@supabase/ssr');
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {},
          },
        }
      );
      
      const { data: profile } = await supabase
        .from('utilizadores')
        .select('perfil, onboarding_respostas')
        .eq('id', user.id)
        .single();

      // Check if onboarding is completed or profile exists
      const perfisValidos = ['idoso', 'imigrante', 'adulto', 'jovem_adulto'];
      const jaTemPerfil = profile?.perfil && perfisValidos.includes(profile.perfil);

      if (!profile?.onboarding_respostas && !jaTemPerfil && pathname !== '/onboarding' && profile?.perfil !== 'admin') {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      if (isAdminRoute && profile?.perfil !== 'admin') {
        // Not an admin, redirect to progress or home
        return NextResponse.redirect(new URL('/progresso', request.url));
      }
    }
  }

  // Enforce onboarding for all authenticated users on other routes
  if (user && pathname !== '/onboarding' && !pathname.startsWith('/auth') && !pathname.startsWith('/api') && pathname !== '/login') {
    const { createServerClient } = await import('@supabase/ssr');
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );
    const { data: profile } = await supabase
      .from('utilizadores')
      .select('perfil, onboarding_respostas')
      .eq('id', user.id)
      .single();

    const perfisValidos = ['idoso', 'imigrante', 'adulto', 'jovem_adulto'];
    const jaTemPerfil = profile?.perfil && perfisValidos.includes(profile.perfil);

    if (!profile?.onboarding_respostas && !jaTemPerfil && profile?.perfil !== 'admin') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // If user is logged in and tries to go to /login, redirect to their home
  if (pathname === '/login' && user) {
    const { createServerClient } = await import('@supabase/ssr');
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );
    const { data: profile } = await supabase
      .from('utilizadores')
      .select('perfil')
      .eq('id', user.id)
      .single();

    if (profile?.perfil === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/progresso', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
