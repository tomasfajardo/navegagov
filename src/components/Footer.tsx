import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">N</div>
              <span className="text-2xl font-extrabold tracking-tight text-primary">Navega<span className="text-secondary">Gov</span></span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              Capacitamos os cidadãos portugueses e imigrantes com o conhecimento necessário para utilizar os serviços públicos digitais de forma autónoma e segura.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">PT</div>
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">EU</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Plataforma</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/tutoriais" className="text-muted-foreground hover:text-primary transition-colors">Galeria de Tutoriais</Link></li>
              <li><Link href="/quizzes" className="text-muted-foreground hover:text-primary transition-colors">Quizzes Interativos</Link></li>
              <li><Link href="/progresso" className="text-muted-foreground hover:text-primary transition-colors">O Teu Progresso</Link></li>
              <li><Link href="/apoio-imigrante" className="text-muted-foreground hover:text-primary transition-colors">Apoio ao Imigrante</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Suporte</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Linhas de Apoio</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacidade</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} NavegaGov. Projeto desenvolvido para Literacia Digital em Portugal.</p>
          <div className="flex gap-6">
            <span>Acessibilidade WCAG 2.1</span>
            <span>Versão 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
