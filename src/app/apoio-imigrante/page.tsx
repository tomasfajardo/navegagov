'use client';

import { UserPlus, FileText, Globe, Landmark, ShieldCheck, MapPin, ExternalLink, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const MapaImigrante = dynamic(() => import('@/components/MapaImigrante'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] md:h-[500px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center">
      <p className="text-muted-foreground font-medium">A carregar mapa...</p>
    </div>
  )
});

const resources = [
  {
    title: "Obter o NIF",
    icon: <FileText size={24} />,
    description: "O Número de Identificação Fiscal é essencial para trabalhar, alugar casa ou abrir conta bancária.",
    steps: ["Encontrar um representante fiscal (se fora da UE)", "Agendar nas Finanças ou ir a um balcão", "Levar passaporte e comprovativo de morada"],
    link: "https://eportugal.gov.pt/servicos/pedir-o-numero-de-identificacao-fiscal-para-pessoa-singular"
  },
  {
    title: "Segurança Social (NISS)",
    icon: <ShieldCheck size={24} />,
    description: "Necessário para contribuições e acesso ao sistema de saúde e apoios sociais.",
    steps: ["Pedido online ou presencial", "Contrato de trabalho ou promessa", "Identificação válida"],
    link: "https://www.seg-social.pt/pedido-de-niss"
  },
  {
    title: "Residência CPLP",
    icon: <Globe size={24} />,
    description: "Processo simplificado para cidadãos da Comunidade de Países de Língua Portuguesa.",
    steps: ["Inscrição no portal AIMA", "Pagamento de taxas", "Certificado digital de residência"],
    link: "https://aima.gov.pt"
  },
  {
    title: "Conta Bancária",
    icon: <Landmark size={24} />,
    description: "Como abrir uma conta base para receber o salário e pagar contas.",
    steps: ["NIF português", "Comprovativo de morada", "Documento de identificação"],
    link: "#"
  }
];

export default function ApoioImigrante() {
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
        <h1 className="text-5xl font-extrabold mb-6">Bem-vindo a Portugal</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Sabemos que começar num novo país pode ser complexo. Reunimos aqui os passos essenciais para a tua integração digital e legal.
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
                  <p className="text-sm font-bold uppercase tracking-wider text-primary">Passos Principais:</p>
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
          <h2 className="text-3xl font-bold mb-4">Encontra Serviços Perto de Ti</h2>
          <p className="text-muted-foreground">
            Descobre onde ficam as agências AIMA, Lojas do Cidadão, Centros de Saúde, Finanças e Juntas de Freguesia mais próximos da tua localização.
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
