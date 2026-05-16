'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Plane, Monitor, GraduationCap, 
  ArrowRight, ArrowLeft, Loader2, 
  CheckCircle2, Sparkles, BookOpen, 
  Video, FileText, Gamepad2, BrainCircuit, X
} from 'lucide-react';
import Link from 'next/link';

const QUESTIONS = [
  {
    id: 1,
    question: 'Qual é a tua situação atual?',
    options: [
      'Sou reformado(a) ou tenho mais de 60 anos',
      'Vim recentemente para Portugal',
      'Tenho dificuldades com tecnologia',
      'Sou jovem e quero aprender a gerir os meus serviços'
    ]
  },
  {
    id: 2,
    question: 'Com que frequência usas serviços online do governo?',
    options: [
      'Nunca usei',
      'Já tentei mas tive dificuldades',
      'Uso às vezes mas quero melhorar',
      'Uso regularmente mas quero aprender mais'
    ]
  },
  {
    id: 3,
    question: 'Qual é o serviço que mais precisas de usar?',
    options: [
      'Segurança Social (pensões, subsídios, desemprego)',
      'Portal das Finanças (IRS, NIF, impostos)',
      'SNS24 (saúde, consultas, receitas)',
      'Documentos e registos (cartão de cidadão, passaporte, IRN)'
    ]
  },
  {
    id: 4,
    question: 'Como preferes aprender?',
    options: [
      'Ver vídeos passo a passo',
      'Ler guias e manuais',
      'Praticar com jogos e quizzes',
      'Uma mistura de tudo'
    ]
  },
  {
    id: 5,
    question: 'Qual é o teu maior obstáculo?',
    options: [
      'Não percebo a linguagem técnica dos portais',
      'Não sei por onde começar',
      'Tenho medo de cometer erros',
      'Não tenho ninguém que me ajude'
    ]
  }
];

const PROFILES = {
  idoso: {
    label: 'Idoso',
    id: 'idoso',
    icon: User,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Personalizamos a tua experiência para ser simples, clara e focada nos serviços de reforma e saúde.'
  },
  imigrante: {
    label: 'Imigrante',
    id: 'imigrante',
    icon: Plane,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    description: 'Focamos nos serviços de residência, documentos e integração para facilitar a tua vida em Portugal.'
  },
  adulto: {
    label: 'Adulto com dificuldades',
    id: 'adulto',
    icon: Monitor,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    description: 'Guias passo a passo e linguagem simples para te ajudar a superar qualquer barreira digital.'
  },
  jovem_adulto: {
    label: 'Jovem adulto',
    id: 'jovem_adulto',
    icon: GraduationCap,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Explora todos os serviços públicos de forma autónoma e eficiente com as nossas dicas rápidas.'
  }
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0); // 0 to 4: questions, 5: loading, 6: result
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState('');
  const [determinedProfile, setDeterminedProfile] = useState<any>(null);
  const [suggestedTutorials, setSuggestedTutorials] = useState<any[]>([]);
  const [hasProfile, setHasProfile] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserName(user.user_metadata.full_name?.split(' ')[0] || 'lá');

      // Verificar se já tem perfil definido
      const { data: utilizador } = await supabase
        .from('utilizadores')
        .select('perfil')
        .eq('id', user.id)
        .single();
      
      const perfisValidos = ['idoso', 'imigrante', 'adulto', 'jovem_adulto'];
      if (utilizador?.perfil && perfisValidos.includes(utilizador.perfil)) {
        setHasProfile(true);
      }

      setLoading(false);
    };
    checkUser();
  }, [supabase, router]);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[step] = answer;
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      processResults(newAnswers);
    }
  };

  const processResults = async (finalAnswers: string[]) => {
    setStep(5); // Loading
    
    // Auto profile determination logic
    const determineProfileKey = (res: string[]) => {
      const r0 = res[0] || '';
      if (r0.includes('60 anos') || r0.includes('reformado'))
        return 'idoso';
      if (r0.includes('Portugal') || r0.includes('vim') || r0.includes('recentemente'))
        return 'imigrante';
      if (r0.includes('dificuldades'))
        return 'adulto';
      if (r0.includes('jovem') || r0.includes('jovem_adulto'))
        return 'jovem_adulto';
      return 'adulto';
    };

    const profileKey = determineProfileKey(finalAnswers);
    const profile = PROFILES[profileKey as keyof typeof PROFILES];
    setDeterminedProfile(profile);

    // Platform mapping for Question 3
    const platformMap: Record<string, string> = {
      'Segurança Social': 'Segurança Social',
      'Portal das Finanças': 'Portal das Finanças',
      'SNS24': 'SNS24',
      'Documentos e registos': 'IRN'
    };
    
    let selectedPlatformName = '';
    for (const key in platformMap) {
      if (finalAnswers[2].includes(key)) {
        selectedPlatformName = platformMap[key];
        break;
      }
    }

    // Artificial delay for "Personalizing experience"
    setTimeout(async () => {
      // Fetch tutorials for the selected platform
      const { data: platforms } = await supabase
        .from('plataformas')
        .select('id')
        .ilike('nome', `%${selectedPlatformName || 'Segurança Social'}%`)
        .limit(1);

      const platformId = platforms?.[0]?.id;

      if (platformId) {
        const { data: tuts } = await supabase
          .from('tutoriais')
          .select('*, plataformas(nome)')
          .eq('plataforma_id', platformId)
          .limit(3);
        setSuggestedTutorials(tuts || []);
      }

      setStep(6); // Show result
    }, 1500);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      console.log('1. User ID:', user.id);
      console.log('2. Perfil determinado:', determinedProfile?.id);
      console.log('3. Respostas:', answers);

      // Platform name for saving
      const platformMap: Record<string, string> = {
        'Segurança Social': 'Segurança Social',
        'Portal das Finanças': 'Portal das Finanças',
        'SNS24': 'SNS24',
        'Documentos e registos': 'IRN'
      };
      
      let plataformaPreferida = '';
      for (const key in platformMap) {
        if (answers[2].includes(key)) {
          plataformaPreferida = platformMap[key];
          break;
        }
      }

      console.log('4. A verificar se utilizador existe...');
      const { data: existe, error: checkError } = await supabase
        .from('utilizadores')
        .select('id, perfil')
        .eq('id', user.id)
        .single();
      
      console.log('Utilizador existe na tabela:', existe);
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar existência:', checkError);
      }

      if (!existe) {
        console.log('Utilizador não encontrado, a criar registo...');
        const { error: insertError } = await supabase.from('utilizadores').insert({
          id: user.id,
          nome: user.user_metadata?.full_name || user.email,
          email: user.email,
          perfil: determinedProfile.id
        });
        if (insertError) {
          console.error('Erro no INSERT:', insertError);
          throw insertError;
        }
      }

      console.log('5. A tentar update...');
      const { data, error } = await supabase
        .from('utilizadores')
        .update({ 
          perfil: determinedProfile.id,
          onboarding_respostas: answers,
          plataforma_preferida: plataformaPreferida,
          estilo_aprendizagem: answers[3]
        })
        .eq('id', user.id)
        .select();

      console.log('6. Resultado do Update:', { data, error });

      if (error) {
        console.error('Erro detalhado:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      router.push('/tutoriais');
    } catch (err) {
      console.error('Erro no processo final:', err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/5 blur-[120px] rounded-full -z-10" />
      
      <div className="w-full max-w-2xl relative">
        {/* Botão Cancelar Integrado */}
        {hasProfile && (
          <div className="absolute -top-12 right-0 z-50">
            <button 
              type="button"
              onClick={() => {
                console.log('Cancelando onboarding...');
                router.push('/perfil');
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors font-bold text-sm"
            >
              <X size={16} /> Cancelar Inquérito
            </button>
          </div>
        )}
        <AnimatePresence mode="wait">
          {step < 5 ? (
            <motion.div
              key={`question-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Inquérito de Perfil</span>
                  <span>{step + 1} de {QUESTIONS.length}</span>
                </div>
                <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="text-center">
                <h1 className="text-3xl font-black mb-4">
                  {QUESTIONS[step].question}
                </h1>
                <p className="text-muted-foreground">
                  {step === 0 ? `Olá ${userName}, ajuda-nos a conhecer-te melhor.` : 'Escolhe a opção que mais se adequa a ti.'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {QUESTIONS[step].options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option)}
                    className="p-6 text-left rounded-3xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all font-bold text-lg group flex items-center justify-between"
                  >
                    {option}
                    <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" size={20} />
                  </motion.button>
                ))}
              </div>

              {step > 0 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors mx-auto"
                >
                  <ArrowLeft size={18} /> Voltar à pergunta anterior
                </button>
              )}
            </motion.div>
          ) : step === 5 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="relative w-32 h-32 mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="text-primary animate-pulse" size={40} />
                </div>
              </div>
              <h2 className="text-3xl font-black animate-pulse">
                A personalizar a tua experiência...
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Estamos a analisar as tuas respostas para criar o percurso de aprendizagem ideal para ti.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="bg-card border-2 border-primary/20 rounded-[40px] p-8 text-center relative overflow-hidden shadow-2xl">
                <div className={`absolute top-0 right-0 w-32 h-32 ${determinedProfile.bgColor} rounded-bl-full -z-0`} />
                
                <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center ${determinedProfile.bgColor} ${determinedProfile.color}`}>
                  <determinedProfile.icon size={40} />
                </div>

                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">O teu perfil ideal</h2>
                <h3 className="text-4xl font-black mb-6">{determinedProfile.label}</h3>
                
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto mb-8">
                  {determinedProfile.description}
                </p>

                <div className="flex items-center justify-center gap-3 py-4 px-6 bg-accent/50 rounded-2xl w-fit mx-auto border border-border">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  <span className="font-bold">Perfil configurado com sucesso!</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="text-primary" size={24} />
                  <h4 className="text-xl font-bold">Sugestões para começares:</h4>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {suggestedTutorials.map((tut) => (
                    <div key={tut.id} className="bg-card border border-border p-5 rounded-3xl flex items-center gap-4 hover:border-primary/30 transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        {tut.tipo === 'video' ? <Video size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="flex-grow">
                        <h5 className="font-bold leading-tight">{tut.titulo}</h5>
                        <p className="text-xs text-muted-foreground">{tut.plataformas?.nome} • {tut.duracao_min} min</p>
                      </div>
                      <ArrowRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
                    </div>
                  ))}
                  
                  {suggestedTutorials.length === 0 && (
                    <div className="bg-accent/30 border-2 border-dashed border-border p-8 rounded-3xl text-center">
                      <p className="text-muted-foreground font-medium italic">Preparamos uma seleção variada para ti na galeria.</p>
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFinish}
                disabled={saving}
                className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={28} />
                ) : (
                  <>
                    Começar a aprender
                    <ArrowRight size={24} />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
