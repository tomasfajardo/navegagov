'use client';

import Link from 'next/link';
import { Home, BookOpen, Calculator, UserPlus, BarChart2, Menu, X, HelpCircle, LogIn, User, LogOut, Gamepad2, SlidersHorizontal, Check, Type, SunMoon, MoveVertical } from 'lucide-react';
import { useAcessibilidade } from '@/hooks/useAcessibilidade';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const navItems = [
  { name: 'Início', href: '/', icon: Home },
  { name: 'Tutoriais', href: '/tutoriais', icon: BookOpen },
  { name: 'Questionários', href: '/questionarios', icon: HelpCircle },
  { name: 'Jogos', href: '/jogos', icon: Gamepad2 },
  { name: 'Simulador IRS', href: '/simulador-irs', icon: Calculator },
  { name: 'Apoio Imigrante', href: '/apoio-imigrante', icon: UserPlus },
  { name: 'Progresso', href: '/progresso', icon: BarChart2 },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { preferencias, setTamanho, toggleContraste, toggleEspacamento, isAtivo } = useAcessibilidade();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('utilizadores')
        .select('perfil')
        .eq('id', userId)
        .single();
      setProfile(data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0A0F2C] border-b border-white/10 text-white h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                <svg viewBox="0 0 40 40" width="40" height="40" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
                  {/* Bússola */}
                  <circle cx="20" cy="20" r="15" fill="none" stroke="#3B82F6" strokeWidth="1.5"/>
                  <circle cx="20" cy="20" r="11.5" fill="none" stroke="#1E3A6E" strokeWidth="0.8"/>
                  {/* Ticks cardeais */}
                  <line x1="20" y1="5"  x2="20" y2="8"  stroke="#3B82F6" strokeWidth="1.2"/>
                  <line x1="20" y1="32" x2="20" y2="35" stroke="#3B82F6" strokeWidth="1.2"/>
                  <line x1="5"  y1="20" x2="8"  y2="20" stroke="#3B82F6" strokeWidth="1.2"/>
                  <line x1="32" y1="20" x2="35" y2="20" stroke="#3B82F6" strokeWidth="1.2"/>
                  {/* Ticks diagonais */}
                  <line x1="30.6" y1="9.4"  x2="28.9" y2="11.1" stroke="#1E3A6E" strokeWidth="0.8"/>
                  <line x1="30.6" y1="30.6" x2="28.9" y2="28.9" stroke="#1E3A6E" strokeWidth="0.8"/>
                  <line x1="9.4"  y1="9.4"  x2="11.1" y2="11.1" stroke="#1E3A6E" strokeWidth="0.8"/>
                  <line x1="9.4"  y1="30.6" x2="11.1" y2="28.9" stroke="#1E3A6E" strokeWidth="0.8"/>
                  {/* Agulha Norte (branca) */}
                  <polygon points="20,8 17.5,20 20,18 22.5,20" fill="#F0F4FF"/>
                  {/* Agulha Sul (azul) */}
                  <polygon points="20,32 17.5,20 20,22 22.5,20" fill="#3B82F6"/>
                  {/* Ponto central */}
                  <circle cx="20" cy="20" r="1.8" fill="#0A0F2C" stroke="#3B82F6" strokeWidth="0.8"/>
                </svg>
                <span className="font-bold text-xl tracking-tight text-[#F0F4FF]">
                  Navega<span className="text-[#3B82F6]">Gov</span>
                </span>
              </Link>
            </div>
          
            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {session ? (
                <>
                  <Link 
                    href={profile?.perfil === 'admin' ? "/admin" : "/perfil"} 
                    className="flex px-3 sm:px-5 py-2 bg-[#3B82F6] text-white rounded-full text-sm font-bold items-center gap-2 hover:bg-[#60A5FA] transition-all shadow-lg shadow-[#3B82F6]/20"
                  >
                    <User size={16} />
                    <span className="hidden sm:inline">{profile?.perfil === 'admin' ? 'Painel Admin' : 'Perfil'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex p-2 sm:px-4 sm:py-2 border border-white/20 bg-transparent text-white hover:bg-white/10 rounded-full transition-all items-center gap-2"
                    title="Sair"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline text-sm font-medium">Sair</span>
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="flex px-3 sm:px-5 py-2 bg-[#3B82F6] text-white rounded-full text-sm font-bold items-center gap-2 hover:bg-[#60A5FA] transition-all shadow-lg shadow-[#3B82F6]/20"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Entrar</span>
                </Link>
              )}
              
              {/* Accessibility Button */}
              <div className="relative">
                <button
                  onClick={() => setIsAccessOpen(!isAccessOpen)}
                  className={`relative text-white p-2 focus:outline-none hover:bg-white/10 rounded-full transition-colors ${isAtivo ? 'bg-[#3B82F6]/20' : ''}`}
                  title="Acessibilidade"
                >
                  <SlidersHorizontal size={24} />
                  {isAtivo && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-[#0A0F2C]"></span>
                  )}
                </button>

                <AnimatePresence>
                  {isAccessOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsAccessOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-72 bg-[var(--background)] border border-[var(--border)] rounded-3xl shadow-2xl z-50 p-6 overflow-hidden"
                      >
                        <h4 className="text-[var(--foreground)] font-black text-lg mb-6 flex items-center gap-2">
                          <SlidersHorizontal size={20} className="text-primary" />
                          Acessibilidade
                        </h4>

                        <div className="space-y-8">
                          {/* Text Size */}
                          <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] opacity-70 flex items-center gap-2">
                              <Type size={14} /> Tamanho do Texto
                            </label>
                            <div className="flex gap-2">
                              {[
                                { id: 'normal', label: 'A', title: 'Normal' },
                                { id: 'grande', label: 'A+', title: 'Grande' },
                                { id: 'muito-grande', label: 'A++', title: 'Muito Grande' }
                              ].map((t) => (
                                <button
                                  key={t.id}
                                  onClick={() => setTamanho(t.id as any)}
                                  className={`flex-1 py-2 rounded-xl font-bold transition-all border-2 ${
                                    preferencias.tamanho === t.id 
                                    ? 'bg-primary border-primary text-white' 
                                    : 'bg-[var(--accent)] border-transparent text-[var(--foreground)] hover:border-primary/30'
                                  }`}
                                  title={t.title}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Contrast */}
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                              <SunMoon size={18} className="text-primary" />
                              Alto Contraste
                            </label>
                            <button
                              onClick={toggleContraste}
                              className={`w-12 h-6 rounded-full transition-colors relative ${
                                preferencias.contraste ? 'bg-primary' : 'bg-[var(--border)]'
                              }`}
                            >
                              <motion.div 
                                animate={{ x: preferencias.contraste ? 26 : 2 }}
                                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                              />
                            </button>
                          </div>

                          {/* Spacing */}
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                              <MoveVertical size={18} className="text-primary" />
                              Espaçamento
                            </label>
                            <button
                              onClick={toggleEspacamento}
                              className={`w-12 h-6 rounded-full transition-colors relative ${
                                preferencias.espacamento ? 'bg-primary' : 'bg-[var(--border)]'
                              }`}
                            >
                              <motion.div 
                                animate={{ x: preferencias.espacamento ? 26 : 2 }}
                                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                              />
                            </button>
                          </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-[var(--border)]">
                          <p className="text-[10px] text-[var(--foreground)] opacity-60 text-center font-medium italic">
                            As tuas preferências serão guardadas automaticamente.
                          </p>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Universal Hamburger Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="text-white p-2 focus:outline-none hover:bg-white/10 rounded-full transition-colors ml-1"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Universal Nav Drawer & Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-filter-none"
            />
            
            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-0 right-0 w-full sm:w-[280px] h-full bg-[#0A0F2C] border-l border-white/10 z-[60] flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
                <span className="text-lg font-bold text-white">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors focus:outline-none"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="flex flex-col">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-6 py-4 text-base font-medium text-white hover:bg-[#3B82F6]/20 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon size={20} />
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Visual Separator */}
                  <div className="my-4 border-t border-white/10 mx-6"></div>
                  
                  {session ? (
                    <div className="flex flex-col">
                      <Link
                        href={profile?.perfil === 'admin' ? "/admin" : "/perfil"}
                        className="flex items-center gap-3 px-6 py-4 text-base font-medium text-white hover:bg-[#3B82F6]/20 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <User size={20} />
                        {profile?.perfil === 'admin' ? 'Painel Admin' : 'O Meu Perfil'}
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-6 py-4 text-base font-medium text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <LogOut size={20} />
                        Sair
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <Link
                        href="/login"
                        className="flex items-center gap-3 px-6 py-4 text-base font-medium text-white hover:bg-[#3B82F6]/20 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <LogIn size={20} />
                        Entrar
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

