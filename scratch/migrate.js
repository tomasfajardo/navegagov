const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Attempting to call execute_sql RPC to add columns...');
  const ddl = `
    ALTER TABLE tutoriais 
    ADD COLUMN IF NOT EXISTS plataforma text,
    ADD COLUMN IF NOT EXISTS tipo_conteudo text,
    ADD COLUMN IF NOT EXISTS idioma text DEFAULT 'Português';
  `;
  const { data, error } = await supabase.rpc('execute_sql', { query: ddl });
  if (error) {
    console.log('execute_sql RPC failed:', error.message);
    console.log('This means DDL must be run directly in the Supabase SQL Editor by the user.');
  } else {
    console.log('Successfully executed SQL via RPC!', data);
  }
}

run();
