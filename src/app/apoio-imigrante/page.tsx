'use client';

import { UserPlus, FileText, Globe, Landmark, ShieldCheck, MapPin, ExternalLink, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <section className="bg-slate-900 text-white rounded-[3rem] p-12 overflow-hidden relative">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Onde encontrar ajuda presencial?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <MapPin className="text-secondary flex-shrink-0" />
                <div>
                  <p className="font-bold">CNAIM - Centros Nacionais de Apoio</p>
                  <p className="text-sm text-white/70">Lisboa, Porto, Coimbra e Faro.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <HelpCircle className="text-secondary flex-shrink-0" />
                <div>
                  <p className="font-bold">Linha de Apoio ao Migrante</p>
                  <p className="text-sm text-white/70">808 257 257 (Rede fixa) | 21 810 61 91 (Rede móvel)</p>
                </div>
              </div>
            </div>
            <button className="mt-10 px-8 py-4 bg-secondary text-white rounded-full font-bold hover:scale-105 transition-transform">
              Ver Mapa de Balcões
            </button>
          </div>
          <div className="hidden md:block">
            {/* Visual element representing a map or network */}
            <div className="w-full h-64 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center">
              <Globe size={120} className="text-white/10 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </section>
    </div>
  );
}
