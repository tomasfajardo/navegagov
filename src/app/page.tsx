'use client';

import { motion } from 'framer-motion';
import { 
  BookOpen, 
  ShieldQuestion, 
  LayoutDashboard, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider uppercase bg-primary/10 text-primary rounded-full">
              Digitaliza Portugal 🇵🇹
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
              Domina os Serviços Públicos <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Sem Complicações
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              A plataforma NavegaGov ajuda-te a navegar no Portal das Finanças, Segurança Social e muito mais, com tutoriais interativos e ajuda em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tutoriais" className="btn-primary flex items-center gap-2 group">
                Explorar Tutoriais <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/apoio-imigrante" className="btn-secondary flex items-center gap-2">
                Apoio ao Imigrante <ShieldCheck size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 glass rounded-[2.5rem] border border-white/20">
          {[
            { label: 'Tutoriais', val: '50+' },
            { label: 'Utilizadores', val: '10k+' },
            { label: 'Sucesso', val: '98%' },
            { label: 'Gratuito', val: '100%' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-primary mb-1">{s.val}</p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo o que precisas num só lugar</h2>
          <p className="text-muted-foreground">Ferramentas desenhadas para tornar a burocracia digital simples para todos.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: 'Tutoriais Guiados',
              desc: 'Vídeos e manuais passo-a-passo para Finanças, SS Direta e ePortugal.',
              icon: BookOpen,
              href: '/tutoriais',
              color: 'bg-blue-500'
            },
            {
              title: 'Quizzes Interativos',
              desc: 'Testa o teu conhecimento e ganha badges de especialista digital.',
              icon: HelpCircle,
              href: '/quizzes',
              color: 'bg-yellow-500'
            },
            {
              title: 'Apoio ao Imigrante',
              desc: 'Guias específicos sobre CPLP, NIF, NISS e autorizações de residência.',
              icon: ShieldQuestion,
              href: '/apoio-imigrante',
              color: 'bg-green-500'
            },
            {
              title: 'Painel de Progresso',
              desc: 'Acompanha as tuas conquistas e vê o que ainda podes aprender.',
              icon: LayoutDashboard,
              href: '/progresso',
              color: 'bg-purple-500'
            }
          ].map((f, i) => (
            <Link key={i} href={f.href}>
              <motion.div 
                whileHover={{ y: -8 }}
                className="card-hover p-8 h-full flex flex-col group"
              >
                <div className={`w-14 h-14 ${f.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${f.color.split('-')[1]}/20`}>
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground text-sm mb-6 flex-grow">{f.desc}</p>
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  Começar agora <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Platforms Section */}
      <section className="bg-accent/50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-6">Cobertura total dos serviços públicos</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Não importa se precisas de entregar o IRS, pedir o abono de família ou renovar o cartão de cidadão. O NavegaGov tem o guia certo para ti.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Finanças', icon: Zap },
                  { name: 'Seg. Social', icon: ShieldCheck },
                  { name: 'Saúde (SNS24)', icon: HeartIcon },
                  { name: 'Justiça/Registo', icon: Globe },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
                    <p.icon size={20} className="text-primary" />
                    <span className="font-bold">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[3rem] flex items-center justify-center border border-white/20">
                <div className="grid grid-cols-2 gap-4 p-8 w-full h-full">
                   <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 flex flex-col justify-between">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Zap size={20}/></div>
                      <p className="font-bold">Portal das Finanças</p>
                   </div>
                   <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 flex flex-col justify-between translate-y-8">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600"><ShieldCheck size={20}/></div>
                      <p className="font-bold">SS Direta</p>
                   </div>
                   <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 flex flex-col justify-between -translate-y-4">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600"><HeartIcon size={20}/></div>
                      <p className="font-bold">SNS 24</p>
                   </div>
                   <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 flex flex-col justify-between translate-y-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600"><Globe size={20}/></div>
                      <p className="font-bold">ePortugal</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="bg-primary p-12 md:p-20 rounded-[3rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <h2 className="text-4xl md:text-5xl font-black mb-6 relative">Pronto para começar?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-xl mx-auto relative">Junta-te a milhares de portugueses que já simplificaram a sua vida digital.</p>
          <Link href="/tutoriais" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
            Ver Todos os Tutoriais <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function HeartIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
