export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">NavegaGov</h3>
            <p className="text-sm text-muted-foreground">
              Capacitando os cidadãos portugueses e imigrantes com literacia digital para o uso de serviços públicos.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Ligações Úteis</h4>
            <ul className="mt-4 space-y-2">
              <li><a href="https://eportugal.gov.pt" className="text-sm hover:text-primary transition-colors">ePortugal</a></li>
              <li><a href="https://www.seg-social.pt" className="text-sm hover:text-primary transition-colors">Segurança Social</a></li>
              <li><a href="https://portaldasfinancas.gov.pt" className="text-sm hover:text-primary transition-colors">Portal das Finanças</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Sobre o Projeto</h4>
            <p className="mt-4 text-sm text-muted-foreground">
              Desenvolvido para o projeto TSIG-PG 2026. Focado em acessibilidade e inclusão digital.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NavegaGov. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            {/* Social icons or other links */}
          </div>
        </div>
      </div>
    </footer>
  );
}
