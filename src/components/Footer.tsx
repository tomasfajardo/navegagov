'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';

const PLATAFORMAS = [
  { nome: 'Segurança Social Direta', url: 'https://www.seg-social.pt' },
  { nome: 'Portal das Finanças', url: 'https://www.portaldasfinancas.gov.pt' },
  { nome: 'SNS24', url: 'https://www.sns24.gov.pt' },
  { nome: 'Autenticação.gov', url: 'https://www.autenticacao.gov.pt' },
  { nome: 'IRN', url: 'https://irn.justica.gov.pt' },
];

const NAVEGACAO = [
  { nome: 'Início', href: '/' },
  { nome: 'Tutoriais', href: '/tutoriais' },
  { nome: 'Quizzes', href: '/quizzes' },
  { nome: 'Apoio ao Imigrante', href: '/apoio-imigrante' },
  { nome: 'O Meu Progresso', href: '/progresso' },
];

const PARCEIROS = [
  'República Portuguesa',
  'AMA — Modernização Administrativa',
  'SNS — Saúde',
  'ePortugal / Gov.pt',
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0A0F2C' }} className="mt-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Coluna 1 — Identidade */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-white text-sm border border-white/20">
                N
              </div>
              <span className="font-extrabold text-lg tracking-tight">NavegaGov</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#F0F4FF', opacity: 0.85 }}>
              Literacia digital para todos os cidadãos portugueses.
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#F0F4FF', opacity: 0.5 }}>
              Uma iniciativa de apoio à inclusão digital em Portugal.
            </p>
          </div>

          {/* Coluna 2 — Plataformas */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#F0F4FF', opacity: 0.6 }}>
              Plataformas
            </h4>
            <ul className="space-y-3">
              {PLATAFORMAS.map((p) => (
                <li key={p.nome}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors duration-150"
                    style={{ color: '#F0F4FF' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#3B82F6')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#F0F4FF')}
                  >
                    {p.nome}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3 — Navegação */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#F0F4FF', opacity: 0.6 }}>
              Navegação
            </h4>
            <ul className="space-y-3">
              {NAVEGACAO.map((n) => (
                <li key={n.nome}>
                  <Link
                    href={n.href}
                    className="text-sm transition-colors duration-150"
                    style={{ color: '#F0F4FF' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#3B82F6')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#F0F4FF')}
                  >
                    {n.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4 — Parcerias */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#F0F4FF', opacity: 0.6 }}>
              Em parceria com
            </h4>
            <ul className="space-y-3">
              {PARCEIROS.map((parceiro) => (
                <li key={parceiro}>
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#F0F4FF', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <Building2 size={12} style={{ opacity: 0.7 }} />
                    {parceiro}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-xs" style={{ color: '#F0F4FF', opacity: 0.5 }}>
            © {new Date().getFullYear()} NavegaGov. Todos os direitos reservados.
          </p>
          <p className="text-xs" style={{ color: '#F0F4FF', opacity: 0.5 }}>
            Desenvolvido no âmbito da UC TSIG — Universidade de Aveiro
          </p>
        </div>
      </div>
    </footer>
  );
}
