import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { LayoutDashboard, LogOut, Settings, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('utilizadores')
    .select('perfil')
    .eq('id', user.id)
    .single();

  if (profile?.perfil !== 'admin') {
    redirect('/progresso');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">NavegaGov <span className="text-primary">Admin</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Voltar ao Site</Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserCircle size={20} className="text-muted-foreground" />
              <span>Admin</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
