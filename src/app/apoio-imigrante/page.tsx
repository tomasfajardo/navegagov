'use client';

import { UserPlus, FileText, Globe, Landmark, ShieldCheck, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

function MapLoading() {
  const t = useTranslations('ApoioImigrante');
  return (
    <div className="w-full h-[350px] md:h-[500px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center">
      <p className="text-muted-foreground font-medium">{t('loadingMap')}</p>
    </div>
  );
}

const MapaImigrante = dynamic(() => import('@/components/MapaImigrante'), {
  ssr: false,
  loading: MapLoading
});

export default function ApoioImigrante() {
  const t = useTranslations('ApoioImigrante');

  const resources = [
    {
      title: t("nifTitle"),
      icon: <FileText size={24} />,
      description: t("nifDesc"),
      steps: t.raw("nifSteps") as string[],
      link: "https://eportugal.gov.pt/servicos/pedir-o-numero-de-identificacao-fiscal-para-pessoa-singular"
    },
    {
      title: t("nissTitle"),
      icon: <ShieldCheck size={24} />,
      description: t("nissDesc"),
      steps: t.raw("nissSteps") as string[],
      link: "https://www.seg-social.pt/pedido-de-niss"
    },
    {
      title: t("cplpTitle"),
      icon: <Globe size={24} />,
      description: t("cplpDesc"),
      steps: t.raw("cplpSteps") as string[],
      link: "https://aima.gov.pt"
    },
    {
      title: t("bankTitle"),
      icon: <Landmark size={24} />,
      description: t("bankDesc"),
      steps: t.raw("bankSteps") as string[],
      link: "#"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero */}
      <section className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6"
        >
          <UserPlus size={40} />
        </motion.div>
        <h1 className="text-5xl font-extrabold mb-6">{t('title')}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('subtitle')}
        </p>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
        {resources.map((res, idx) => (
          <motion.div
            key={res.title}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card-hover p-8 group"
          >
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                {res.icon}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{res.title}</h2>
                  <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <ExternalLink size={20} />
                  </a>
                </div>
                <p className="text-muted-foreground mb-6">{res.description}</p>
                <div className="space-y-3">
                  <p className="text-sm font-bold uppercase tracking-wider text-primary">{t('stepsHeader')}</p>
                  {res.steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[10px] font-bold">
                        {sIdx + 1}
                      </div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Map/Location Section */}
      <section className="bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-[3rem] p-8 md:p-12 mb-20 relative overflow-hidden">
        <div className="text-center mb-10 max-w-2xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold mb-4">{t('findServices')}</h2>
          <p className="text-muted-foreground">
            {t('findServicesDesc')}
          </p>
        </div>
        
        <div className="relative z-10">
          <MapaImigrante />
        </div>
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </section>
    </div>
  );
}
