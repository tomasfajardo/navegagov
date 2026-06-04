const { createClient } = require('@supabase/supabase-js');

// Read env variables
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const supabaseAnonKey = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing supabase credentials in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: tutorials, error } = await supabase
    .from('tutoriais')
    .select('*, plataformas(nome)')
    .in('tipo', ['video', 'manual']);

  if (error) {
    console.error("Error fetching tutorials:", error);
    return;
  }

  console.log(`Fetched ${tutorials.length} tutorials.`);
  
  tutorials.forEach(t => {
    // Resolve platform fallback matching substring of platforms.nome
    const resolvedPlat = t.plataforma || (t.plataformas?.nome ? (() => {
      const name = t.plataformas.nome.toLowerCase();
      if (name.includes('segurança social')) return 'Segurança Social';
      if (name.includes('finanças')) return 'Portal das Finanças';
      if (name.includes('sns24')) return 'SNS24';
      if (name.includes('irn')) return 'IRN';
      if (name.includes('autenticação')) return 'Autenticação.gov';
      if (name.includes('imigrante')) return 'Apoio ao Imigrante';
      if (name.includes('eportugal')) return 'ePortugal';
      return null;
    })() : null);
    
    // Resolve content type fallback from base tipo field
    const resolvedType = t.tipo_conteudo || (t.tipo === 'video' ? 'Vídeo' : t.tipo === 'manual' ? 'Manual PDF' : null);
    
    // Resolve language fallback defaulting to Português
    const resolvedLang = t.idioma || 'Português';

    console.log(`- Title: "${t.titulo}"`);
    console.log(`  - Original: tipo="${t.tipo}", plataforma_id="${t.plataforma_id}", plataformas.nome="${t.plataformas?.nome}"`);
    console.log(`  - Resolved: Plat="${resolvedPlat}", Type="${resolvedType}", Lang="${resolvedLang}"`);
  });
}

run();
