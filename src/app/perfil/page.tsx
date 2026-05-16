'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Plane, Monitor, GraduationCap, Check, 
  Calendar, Mail, Star, Zap,
  TrendingUp, BookOpen, Loader2, Lock, Info
} from 'lucide-react';

const profiles = [
  { 
    id: 'idoso', 
    label: 'Idoso', 
    icon: User, 
    color: 'bg-blue-500',
    description: 'Quero aprender a usar os serviços digitais do Estado' 
  },
  { 
    id: 'imigrante', 
    label: 'Imigrante', 
    icon: Plane, 
    color: 'bg-emerald-500',
    description: 'Sou novo em Portugal e preciso de ajuda com documentação' 
  },
  { 
    id: 'adulto', 
    label: 'Adulto com dificuldades', 
    icon: Monitor, 
    color: 'bg-orange-500',
    description: 'Tenho dificuldade em usar plataformas digitais' 
  },
  { 
    id: 'jovem_adulto', 
    label: 'Jovem adulto', 
    icon: GraduationCap, 
    color: 'bg-purple-500',
    description: 'Quero aprender a gerir os meus serviços públicos' 
  },
];

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);

  const [stats, setStats] = useState({
    completedCount: 0,
    platformCount: 0,
    avgScore: 0,
    streak: 0,
    favoritePlatform: '---',
  });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchAllData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch Profile
      const { data: profile } = await supabase
        .from('utilizadores')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfileData(profile);

      // Fetch all badge definitions
      const { data: bDefs } = await supabase.from('badges_definicoes').select('*').order('nome');
      if (bDefs) setAllBadges(bDefs);

      // Fetch earned badges
      const { data: uBadges } = await supabase
        .from('utilizador_badges')
        .select('*, badges_definicoes(*)')
        .eq('utilizador_id', user.id)
        .order('data_conquista', { ascending: false });
      
      if (uBadges) setEarnedBadges(uBadges);

      // Fetch Progress with Joins
      const { data: progress } = await supabase
        .from('progresso')
        .select('*, tutoriais(plataforma_id, plataformas(nome))')
        .eq('utilizador_id', user.id);

      if (progress) {
        const completed = progress.filter(p => p.completado);
        const scores = completed.filter(p => p.pontuacao !== null).map(p => p.pontuacao);
        
        // Favorite Platform
        const platformCounts = new Map<string, number>();
        completed.forEach(p => {
          const name = p.tutoriais?.plataformas?.nome || 'Geral';
          platformCounts.set(name, (platformCounts.get(name) || 0) + 1);
        });
        
        let fav = '---';
        let max = 0;
        platformCounts.forEach((count, name) => {
          if (count > max) {
            max = count;
            fav = name;
          }
        });

        // Unique Platforms
        const uniquePlatforms = new Set(progress.map(p => p.tutoriais?.plataforma_id)).size;

        // Streak logic
        const dates = [...new Set(progress.map(p => new Date(p.data).toDateString()))]
          .map(d => new Date(d).getTime())
          .sort((a, b) => b - a);
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let currentCheck = today.getTime();

        // If no activity today, check if yesterday had activity to continue streak
        if (dates.length > 0 && dates[0] < currentCheck) {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          currentCheck = yesterday.getTime();
        }

        for (const date of dates) {
          if (date === currentCheck) {
            streak++;
            currentCheck -= 86400000; // one day in ms
          } else if (date < currentCheck) {
            break;
          }
        }

        setStats({
          completedCount: completed.length,
          platformCount: uniquePlatforms,
          avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
          streak,
          favoritePlatform: fav,
        });
      }

      setLoading(false);
    }
    fetchAllData();
  }, [supabase, router]);

  const updateProfile = async (newProfile: string) => {
    if (profileData?.perfil === newProfile) return;
    setUpdating(true);
    
    try {
      const { error } = await supabase
        .from('utilizadores')
        .update({ perfil: newProfile })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfileData({ ...profileData, perfil: newProfile });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const resetOnboarding = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('utilizadores')
        .update({ 
          onboarding_respostas: null,
          plataforma_preferida: null,
          estilo_aprendizagem: null
        })
        .eq('id', user.id);

      if (error) throw error;
      router.push('/onboarding');
    } catch (err) {
      console.error(err);
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const userInitials = profileData?.nome
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badge_id));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold"
          >
            <Check size={20} />
            Perfil atualizado!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Info and Stats */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Profile Header Card */}
          <div className="bg-card border border-border rounded-[40px] p-8 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
            
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-background shadow-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white text-3xl font-black">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : userInitials}
              </div>
              
              <h2 className="text-2xl font-black mb-1">{profileData?.nome || 'Utilizador'}</h2>
              <p className="text-muted-foreground text-sm mb-4 flex items-center justify-center gap-2">
                <Mail size={14} /> {user?.email}
              </p>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
                {profileData?.perfil || 'Novo Membro'}
              </div>

              <div className="mt-8 pt-8 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Calendar size={14} /> 
                Membro desde {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }) : '---'}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-card border border-border rounded-[40px] p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Estatísticas
            </h3>
            
            <div className="space-y-6">
              <StatItem icon={BookOpen} label="Tutoriais Concluídos" value={stats.completedCount} color="text-blue-500" />
              <StatItem icon={Star} label="Plataforma Favorita" value={stats.favoritePlatform} color="text-emerald-500" isText />
              <StatItem icon={TrendingUp} label="Pontuação Média" value={`${stats.avgScore}%`} color="text-orange-500" />
              <StatItem icon={Zap} label="Sequência de Dias" value={`${stats.streak} dias`} color="text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Right Column: Perfil Switcher and Badges */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Switcher */}
          <div className="bg-card border border-border rounded-[40px] p-8 shadow-sm">
            <div className="mb-8">
              <h3 className="text-2xl font-black mb-2">O Meu Perfil</h3>
              <p className="text-muted-foreground">Escolhe o perfil que melhor descreve as tuas necessidades atuais.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  disabled={updating}
                  onClick={() => updateProfile(p.id)}
                  className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${
                    profileData?.perfil === p.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  {profileData?.perfil === p.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                    profileData?.perfil === p.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                  }`}>
                    <p.icon size={24} />
                  </div>
                  
                  <h4 className="font-bold text-lg mb-1">{p.label}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <button
                onClick={resetOnboarding}
                disabled={updating}
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-bold transition-all"
              >
                <Zap size={18} className="fill-primary/20" />
                Refazer inquérito de perfil completo
              </button>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-card border border-border rounded-[40px] p-8 shadow-sm">
            
            {/* Recent achievements */}
            {earnedBadges.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Conquistas Recentes</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  {earnedBadges.slice(0, 3).map(ub => (
                    <div key={ub.id} className="flex items-center gap-4 bg-accent/50 border border-border rounded-2xl p-4 min-w-[250px]">
                      <div className="text-4xl drop-shadow-md">
                        {ub.badges_definicoes.icone}
                      </div>
                      <div>
                        <h4 className="font-bold leading-tight mb-1">{ub.badges_definicoes.nome}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase">{new Date(ub.data_conquista).toLocaleDateString('pt-PT')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-2xl font-black mb-8">Todos os Badges</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-center">
              {allBadges.map((badge) => {
                const isEarned = earnedBadgeIds.has(badge.id);
                return (
                  <div key={badge.id} className="relative group cursor-help flex flex-col items-center">
                    <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center mb-3 transition-all duration-500 ${
                      isEarned 
                      ? `bg-accent ring-2 ring-primary/20 shadow-lg group-hover:scale-110 group-hover:rotate-3` 
                      : 'bg-muted/50 grayscale opacity-40'
                    }`}>
                      <span className="text-4xl drop-shadow-sm">{badge.icone}</span>
                      
                      {!isEarned && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground shadow-sm">
                          <Lock size={14} />
                        </div>
                      )}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-wider leading-tight px-2 ${
                      isEarned ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {badge.nome}
                    </span>
                    
                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-foreground text-background text-xs rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                      <p className="font-bold mb-1">{badge.nome}</p>
                      <p className="opacity-80">{badge.descricao}</p>
                      {!isEarned && (
                        <div className="mt-2 pt-2 border-t border-background/20 flex items-center gap-1 text-[10px] text-yellow-300">
                          <Info size={12} /> Falta completar
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color, isText = false }: any) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center transition-colors group-hover:bg-primary/10 group-hover:text-primary`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">{label}</p>
        <p className={`font-black ${isText ? 'text-base' : 'text-xl'} ${color}`}>{value}</p>
      </div>
    </div>
  );
}
