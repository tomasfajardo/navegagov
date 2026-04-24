'use client';

import Link from 'next/link';
import { BookOpen, Calculator, UserPlus, ArrowRight, ShieldCheck, Zap, Globe, HelpCircle } from 'lucide-react';
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
              Domina os Serviços <br />
              <span className="text-primary">Públicos Digitais</span>
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

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

function FeatureCard({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: string, link: string }) {
  return (
    <Link href={link} className="card-hover group p-8">
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
        Saber mais <ArrowRight size={20} />
      </div>
    </Link>
  );
}
