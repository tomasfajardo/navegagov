'use client';

import Link from 'next/link';
import { BookOpen, Calculator, UserPlus, ArrowRight, ShieldCheck, Zap, Globe, HelpCircle, User, Plane, Monitor, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary/10 to-transparent blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Domina os <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-primary">Serviços Públicos Digitais</span>
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-1 left-0 h-3 bg-primary/20 -z-0 rounded-full"
                />
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Aprende a navegar no Portal das Finanças, Segurança Social e muito mais com tutoriais simples, simuladores e ajuda inteligente.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/tutoriais" className="btn-primary">
                Começar a Aprender
              </Link>
              <Link href="/progresso" className="px-6 py-3 rounded-full font-semibold border border-border hover:bg-accent transition-colors">
                Ver o Meu Progresso
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Profile Selection Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Escolhe o teu perfil</h2>
          <p className="text-muted-foreground">Conteúdo personalizado para as tuas necessidades.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ProfileCard 
            index={0}
            icon={<User size={32} />}
            title="Idoso"
            description="Quero aprender a usar os serviços digitais do Estado com calma."
            color="#4F46E5"
            bgColor="#EEF2FF"
            link="/tutoriais"
          />
          <ProfileCard 
            index={1}
            icon={<Plane size={32} />}
            title="Imigrante"
            description="Sou novo em Portugal e preciso de ajuda com toda a documentação."
            color="#059669"
            bgColor="#ECFDF5"
            link="/tutoriais"
          />
          <ProfileCard 
            index={2}
            icon={<Monitor size={32} />}
            title="Adulto"
            description="Tenho algumas dificuldades mas quero tornar-me independente."
            color="#EA580C"
            bgColor="#FFF7ED"
            link="/tutoriais"
          />
          <ProfileCard 
            index={3}
            icon={<GraduationCap size={32} />}
            title="Jovem"
            description="Quero aprender a gerir os meus impostos e serviços públicos."
            color="#9333EA"
            bgColor="#FAF5FF"
            link="/tutoriais"
          />
        </div>
      </section>

      {/* Feature Cards (Original) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<BookOpen className="text-primary" size={32} />}
            title="Galeria de Tutoriais"
            description="Guias passo-a-passo para renovar o CC, pedir subsídios ou validar faturas."
            link="/tutoriais"
          />
          <FeatureCard 
            icon={<HelpCircle className="text-primary" size={32} />}
            title="Quizzes Interativos"
            description="Testa o teu conhecimento sobre os serviços públicos e ganha badges."
            link="/quizzes"
          />
          <FeatureCard 
            icon={<Calculator className="text-secondary" size={32} />}
            title="Simulador de IRS"
            description="Calcula uma estimativa do teu imposto de forma simples e rápida."
            link="/simulador-irs"
          />
          <FeatureCard 
            icon={<UserPlus className="text-primary" size={32} />}
            title="Apoio ao Imigrante"
            description="Recursos essenciais para quem acaba de chegar a Portugal."
            link="/apoio-imigrante"
          />
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-accent/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Porquê usar a NavegaGov?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mx-auto text-primary">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-bold text-xl">Seguro e Confiável</h3>
              <p className="text-sm text-muted-foreground">Informação atualizada com base nos portais governamentais oficiais.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mx-auto text-secondary">
                <Zap size={32} />
              </div>
              <h3 className="font-bold text-xl">Rápido e Simples</h3>
              <p className="text-sm text-muted-foreground">Evita filas e burocracia excessiva com guias diretos ao assunto.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mx-auto text-primary">
                <Globe size={32} />
              </div>
              <h3 className="font-bold text-xl">Para Todos</h3>
              <p className="text-sm text-muted-foreground">Interface acessível para idosos, imigrantes e jovens adultos.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileCard({ index, icon, title, description, color, bgColor, link }: { index: number, icon: React.ReactNode, title: string, description: string, color: string, bgColor: string, link: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={link} className="block h-full">
        <motion.div 
          whileHover={{ scale: 1.03, y: -5 }}
          transition={{ duration: 0.2 }}
          className="h-full p-8 rounded-3xl border border-border shadow-sm hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
          style={{ background: `linear-gradient(135deg, ${bgColor} 0%, white 100%)` }}
        >
          {/* Decorative background circle */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500" style={{ backgroundColor: color }} />
          
          <motion.div 
            whileHover={{ rotate: 10 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
            style={{ backgroundColor: color, color: 'white' }}
          >
            {icon}
          </motion.div>
          
          <h3 className="text-2xl font-bold mb-3">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">{description}</p>
          
          <div className="flex items-center gap-2 font-bold text-sm" style={{ color }}>
            Explorar <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: string, link: string }) {
  return (
    <Link href={link} className="card-hover group p-8">
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground mb-6 text-sm">{description}</p>
      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all text-sm">
        Saber mais <ArrowRight size={20} />
      </div>
    </Link>
  );
}
