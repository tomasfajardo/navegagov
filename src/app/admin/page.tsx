'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Database, HelpCircle, Users, Trophy, Gamepad2, Calculator } from 'lucide-react';
import TabAdicionarConteudo from './components/TabAdicionarConteudo';
import TabGerirTutoriais from './components/TabGerirTutoriais';
import TabGerirQuizzes from './components/TabGerirQuizzes';
import TabGerirJogos from './components/TabGerirJogos';
import TabGerirUtilizadores from './components/TabGerirUtilizadores';
import TabGerirBadges from './components/TabGerirBadges';
import TabConfiguracaoIRS from './components/TabConfiguracaoIRS';

const TABS = [
  { id: 'adicionar', label: 'Adicionar Tutorial', icon: <PlusCircle size={20} /> },
  { id: 'tutoriais', label: 'Gerir Tutoriais', icon: <Database size={20} /> },
  { id: 'questionarios', label: 'Gerir Questionários', icon: <HelpCircle size={20} /> },
  { id: 'jogos', label: 'Gerir Jogos', icon: <Gamepad2 size={20} /> },
  { id: 'badges', label: 'Gerir Badges', icon: <Trophy size={20} /> },
  { id: 'utilizadores', label: 'Gerir Utilizadores', icon: <Users size={20} /> },
  { id: 'irs', label: 'Configuração IRS', icon: <Calculator size={20} /> },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('adicionar');
  const [editingTutorial, setEditingTutorial] = useState<any>(null);

  const handleEdit = (tutorial: any) => {
    setEditingTutorial(tutorial);
    setActiveTab('adicionar');
  };

  const handleSuccess = () => {
    setEditingTutorial(null);
    setActiveTab('tutoriais');
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-accent/50 backdrop-blur-md border border-border rounded-2xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== 'adicionar') setEditingTutorial(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-[60vh]"
      >
        {activeTab === 'adicionar' && (
          <TabAdicionarConteudo 
            editingTutorial={editingTutorial} 
            onSuccess={handleSuccess} 
            onCancel={() => {
              setEditingTutorial(null);
              setActiveTab('tutoriais');
            }}
          />
        )}
        {activeTab === 'tutoriais' && <TabGerirTutoriais onEdit={handleEdit} />}
        {activeTab === 'questionarios' && <TabGerirQuizzes />}
        {activeTab === 'jogos' && <TabGerirJogos />}
        {activeTab === 'badges' && <TabGerirBadges />}
        {activeTab === 'utilizadores' && <TabGerirUtilizadores />}
        {activeTab === 'irs' && <TabConfiguracaoIRS />}
      </motion.div>
    </div>
  );
}
