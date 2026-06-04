'use client';

import Link from 'next/link';
import { BookOpen, Calculator, UserPlus, ArrowRight, ShieldCheck, Zap, Globe, HelpCircle, User, Plane, Monitor, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');

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
              {t('title1')} <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-primary">{t('title2')}</span>
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-1 left-0 h-3 bg-primary/20 -z-0 rounded-full"
                />
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              {t('description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/tutoriais" className="btn-primary">
                {t('getStarted')}
              </Link>
              <Link href="/progresso" className="px-6 py-3 rounded-full font-semibold border border-border hover:bg-accent transition-colors">
                {t('viewProgress')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Profile Selection Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('chooseProfile')}</h2>
          <p className="text-muted-foreground">{t('profileSub')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ProfileCard 
            index={0}
            icon={<User size={32} />}
            title={t('idoso')}
            description={t('idosoDesc')}
            color="#4F46E5"
            bgColor="#EEF2FF"
            link="/tutoriais"
            exploreText={t('explore')}
          />
          <ProfileCard 
            index={1}
            icon={<Plane size={32} />}
            title={t('imigrante')}
            description={t('imigranteDesc')}
            color="#059669"
            bgColor="#ECFDF5"
            link="/tutoriais"
            exploreText={t('explore')}
          />
          <ProfileCard 
            index={2}
            icon={<Monitor size={32} />}
            title={t('adulto')}
            description={t('adultoDesc')}
            color="#EA580C"
            bgColor="#FFF7ED"
            link="/tutoriais"
            exploreText={t('explore')}
          />
          <ProfileCard 
            index={3}
            icon={<GraduationCap size={32} />}
            title={t('jovem')}
            description={t('jovemDesc')}
            color="#9333EA"
            bgColor="#FAF5FF"
            link="/tutoriais"
            exploreText={t('explore')}
          />
        </div>
      </section>

      {/* Feature Cards (Original) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<BookOpen className="text-primary" size={32} />}
            title={t('galleryTitle')}
            description={t('galleryDesc')}
            link="/tutoriais"
            learnMoreText={t('learnMore')}
          />
          <FeatureCard 
            icon={<HelpCircle className="text-primary" size={32} />}
            title={t('quizzesTitle')}
            description={t('quizzesDesc')}
            link="/quizzes"
            learnMoreText={t('learnMore')}
          />
          <FeatureCard 
            icon={<Calculator className="text-secondary" size={32} />}
            title={t('irsTitle')}
            description={t('irsDesc')}
            link="/simulador-irs"
            learnMoreText={t('learnMore')}
          />
          <FeatureCard 
            icon={<UserPlus className="text-primary" size={32} />}
            title={t('imigranteTitle')}
            description={t('imigranteDesc2')}
            link="/apoio-imigrante"
            learnMoreText={t('learnMore')}
          />
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-accent/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">{t('whyTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mx-auto text-primary">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-bold text-xl">{t('secure')}</h3>
              <p className="text-sm text-muted-foreground">{t('secureDesc')}</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mx-auto text-secondary">
                <Zap size={32} />
              </div>
              <h3 className="font-bold text-xl">{t('fast')}</h3>
              <p className="text-sm text-muted-foreground">{t('fastDesc')}</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mx-auto text-primary">
                <Globe size={32} />
              </div>
              <h3 className="font-bold text-xl">{t('forAll')}</h3>
              <p className="text-sm text-muted-foreground">{t('forAllDesc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileCard({ index, icon, title, description, color, bgColor, link, exploreText }: { index: number, icon: React.ReactNode, title: string, description: string, color: string, bgColor: string, link: string, exploreText: string }) {
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
            {exploreText} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description, link, learnMoreText }: { icon: React.ReactNode, title: string, description: string, link: string, learnMoreText: string }) {
  return (
    <Link href={link} className="card-hover group p-8">
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground mb-6 text-sm">{description}</p>
      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all text-sm">
        {learnMoreText} <ArrowRight size={20} />
      </div>
    </Link>
  );
}
