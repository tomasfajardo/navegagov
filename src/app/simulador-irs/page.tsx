'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Calculator, Info, ArrowRight, RefreshCcw, 
  TrendingUp, AlertCircle, Loader2,
  Briefcase, GraduationCap, Heart, 
  BookOpen, Home, Wallet, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calcularIRS } from '@/lib/calculadoraIRS';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useTranslations } from 'next-intl';

export default function IRSSimulator() {
  const t = useTranslations('SimuladorIRS');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [config, setConfig] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    rendimentoBruto: '',
    tipo: 'A' as 'A' | 'B' | 'pensao',
    retencoesFonte: '',
    contribuicoesSS: '',
    estadoCivil: 'solteiro',
    dependentes: 0,
    deficiencia: false,
    irsJovem: false,
    anoIrsJovem: 1,
    despesasSaude: '',
    despesasEducacao: '',
    despesasHabitacao: '',
    ppr: '',
    lares: ''
  });

  const [result, setResult] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase
          .from('irs_configuracao')
          .select('*')
          .eq('ano', 2026);
        
        console.log('Config IRS carregada:', data, error);
        
        if (data && data.length > 0) {
          const mappedConfig = data.reduce((acc: any, item: any) => {
            acc[item.tipo] = item.valor;
            return acc;
            }, {});
          setConfig(mappedConfig);
        } else {
          console.warn('Tabela irs_configuracao vazia ou erro. Usando fallback.');
          // Fallback hardcoded values for 2026
          setConfig({
            escaloes: [
              { "de": 0, "ate": 8342, "taxa": 12.5, "parcela": 0 },
              { "de": 8342, "ate": 12587, "taxa": 15.7, "parcela": 266.94 },
              { "de": 12587, "ate": 17838, "taxa": 21.2, "parcela": 959.26 },
              { "de": 17838, "ate": 23089, "taxa": 24.1, "parcela": 1476.45 },
              { "de": 23089, "ate": 29397, "taxa": 31.1, "parcela": 3092.77 },
              { "de": 29397, "ate": 43090, "taxa": 34.9, "parcela": 4209.94 },
              { "de": 43090, "ate": 46566, "taxa": 43.1, "parcela": 7743.27 },
              { "de": 46566, "ate": 86634, "taxa": 44.6, "parcela": 8441.98 },
              { "de": 86634, "ate": 999999, "taxa": 48.0, "parcela": 11384.16 }
            ],
            deducao_especifica: [{valor: 4104}],
            minimo_existencia: [{valor: 12180}],
            irs_jovem: [
              {"ano": 1, "isencao": 100}, {"ano": 2, "isencao": 75},
              {"ano": 3, "isencao": 50}, {"ano": 4, "isencao": 25}, {"ano": 5, "isencao": 25}
            ]
          });
        }
      } catch (e) {
        console.error('Erro ao carregar config:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, [supabase]);

  // Auto-calculate SS contributions for Cat A
  useEffect(() => {
    if (formData.tipo === 'A' && formData.rendimentoBruto) {
      const bruto = parseFloat(formData.rendimentoBruto);
      const ss = bruto * 0.11;
      setFormData(prev => ({ ...prev, contribuicoesSS: ss.toFixed(0) }));
    }
  }, [formData.rendimentoBruto, formData.tipo]);

  const handleCalculate = () => {
    console.log('Botão de Simulação clicado');
    console.log('Dados do formulário:', formData);

    if (!config) {
      console.error('Configuração não carregada!');
      return;
    }
    
    setCalculating(true);
    
    setTimeout(() => {
      const res = calcularIRS({
        rendimentoBruto: parseFloat(formData.rendimentoBruto) || 0,
        tipo: formData.tipo,
        retencoesFonte: parseFloat(formData.retencoesFonte) || 0,
        contribuicoesSS: parseFloat(formData.contribuicoesSS) || 0,
        estadoCivil: formData.estadoCivil,
        dependentes: formData.dependentes,
        deficiencia: formData.deficiencia,
        irsJovem: formData.irsJovem,
        anoIrsJovem: formData.irsJovem ? formData.anoIrsJovem : undefined,
        despesasSaude: parseFloat(formData.despesasSaude) || 0,
        despesasEducacao: parseFloat(formData.despesasEducacao) || 0,
        despesasHabitacao: parseFloat(formData.despesasHabitacao) || 0,
        ppr: parseFloat(formData.ppr) || 0,
        lares: parseFloat(formData.lares) || 0,
        escaloes: config.escaloes,
        deducoesColeta: config.deducoes_coleta || [],
        deducaoEspecifica: config.deducao_especifica?.[0]?.valor || 4104,
        minimoExistencia: config.minimo_existencia?.[0]?.valor || 12180,
        irsJovemConfig: config.irs_jovem || []
      });
      
      console.log('Resultado do cálculo:', res);
      setResult(res);
      setCalculating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };

  const reset = () => {
    setResult(null);
    setFormData({
      rendimentoBruto: '',
      tipo: 'A',
      retencoesFonte: '',
      contribuicoesSS: '',
      estadoCivil: 'solteiro',
      dependentes: 0,
      deficiencia: false,
      irsJovem: false,
      anoIrsJovem: 1,
      despesasSaude: '',
      despesasEducacao: '',
      despesasHabitacao: '',
      ppr: '',
      lares: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const chartData = result ? [
    { name: t('gross'), valor: result.rendimentoBruto, fill: '#94a3b8' },
    { name: t('taxable'), valor: result.rendimentoColetavel, fill: '#3b82f6' },
    { name: t('coletaBruta'), valor: result.coletaBruta, fill: '#f59e0b' },
    { name: t('coletaLiquida'), valor: result.rendimentoBruto - result.coletaLiquida, fill: '#10b981' },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2">{t('title')}</h1>
          <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
        </div>
        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground bg-accent/50 rounded-xl transition-all">
          <RefreshCcw size={16} /> {t('clearAll')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORM SECTION */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section A: Rendimentos */}
          <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">A</span>
              {t('incomeTitle')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">{t('incomeType')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'A', label: t('dep'), icon: Briefcase },
                    { id: 'B', label: t('indep'), icon: GraduationCap },
                    { id: 'pensao', label: t('pensioner'), icon: Heart },
                    { id: 'misto', label: t('mixed'), icon: Calculator },
                  ].map((tItem) => (
                    <button
                      key={tItem.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo: tItem.id as any })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${formData.tipo === tItem.id ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-accent/50 text-muted-foreground hover:bg-accent'}`}
                    >
                      <tItem.icon size={20} />
                      <span className="text-xs font-bold">{tItem.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t('grossIncome')}</label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="number"
                    value={formData.rendimentoBruto}
                    onChange={(e) => setFormData({ ...formData, rendimentoBruto: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-accent border-none focus:ring-2 focus:ring-primary/50 font-bold"
                    placeholder="Ex: 24000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t('taxWithheld')}</label>
                <input
                  type="number"
                  value={formData.retencoesFonte}
                  onChange={(e) => setFormData({ ...formData, retencoesFonte: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-accent border-none focus:ring-2 focus:ring-primary/50"
                  placeholder={t('clearAll') ? 'Opcional' : ''}
                />
              </div>

              {formData.tipo === 'A' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">{t('ssContributions')}</label>
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-sm font-medium text-primary">{t('autoFilled')}</span>
                    <span className="font-black text-primary">{formData.contribuicoesSS}€</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Situação Pessoal */}
          <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center text-sm">B</span>
              {t('personalTitle')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold mb-2">{t('marital')}</label>
                <select 
                  value={formData.estadoCivil}
                  onChange={(e) => setFormData({...formData, estadoCivil: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-accent border-none focus:ring-2 focus:ring-primary/50 font-bold"
                >
                  <option value="solteiro">{t('single')}</option>
                  <option value="casado_conjunto">{t('marriedJoint')}</option>
                  <option value="casado_separada">{t('marriedSeparate')}</option>
                  <option value="uniao_facto">{t('union')}</option>
                  <option value="viuvo">{t('widowed')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">{t('dependents')}</label>
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, dependentes: Math.max(0, formData.dependentes - 1)})}
                    className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/80 font-black"
                  >-</button>
                  <span className="text-2xl font-black w-8 text-center">{formData.dependentes}</span>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, dependentes: Math.min(10, formData.dependentes + 1)})}
                    className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/80 font-black"
                  >+</button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-accent/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-orange-500" size={20} />
                  <span className="text-sm font-bold">{t('disabled')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, deficiencia: !formData.deficiencia})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.deficiencia ? 'bg-primary' : 'bg-muted'}`}
                >
                  <motion.div animate={{ x: formData.deficiencia ? 26 : 2 }} className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-accent/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <GraduationCap className="text-purple-500" size={20} />
                  <span className="text-sm font-bold">{t('youngIrs')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, irsJovem: !formData.irsJovem})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.irsJovem ? 'bg-primary' : 'bg-muted'}`}
                >
                  <motion.div animate={{ x: formData.irsJovem ? 26 : 2 }} className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>

              {formData.irsJovem && (
                <div className="md:col-span-2 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <label className="block text-sm font-bold mb-2">{t('youngIrsYear')}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((ano) => (
                      <button
                        key={ano}
                        type="button"
                        onClick={() => setFormData({...formData, anoIrsJovem: ano})}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${formData.anoIrsJovem === ano ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-muted-foreground'}`}
                      >
                        {ano}{t('youngIrsYearN')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section C: Deduções */}
          <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-500/10 text-orange-600 rounded-lg flex items-center justify-center text-sm">C</span>
              {t('deductionsTitle')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DeducaoInput icon={Heart} label={t('health')} value={formData.despesasSaude} onChange={(v: any) => setFormData({...formData, despesasSaude: v})} />
              <DeducaoInput icon={BookOpen} label={t('education')} value={formData.despesasEducacao} onChange={(v: any) => setFormData({...formData, despesasEducacao: v})} />
              <DeducaoInput icon={Home} label={t('housing')} value={formData.despesasHabitacao} onChange={(v: any) => setFormData({...formData, despesasHabitacao: v})} />
              <DeducaoInput icon={Wallet} label={t('ppr')} value={formData.ppr} onChange={(v: any) => setFormData({...formData, ppr: v})} />
              <DeducaoInput icon={Building2} label={t('lares')} value={formData.lares} onChange={(v: any) => setFormData({...formData, lares: v})} />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!formData.rendimentoBruto || calculating}
            className="w-full btn-primary py-6 text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 disabled:opacity-50"
          >
            {calculating ? (
              <Loader2 className="animate-spin" size={28} />
            ) : (
              <>{t('simulate')} <ArrowRight size={24} /></>
            )}
          </button>
        </div>

        {/* RESULT SECTION */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24 space-y-6"
              >
                {/* Main Result Card */}
                <div className={`rounded-[32px] p-8 shadow-xl relative overflow-hidden ${result.aPagar ? 'bg-destructive text-destructive-foreground' : 'bg-emerald-600 text-white'}`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full" />
                  
                  <h3 className="text-lg font-bold mb-2 uppercase tracking-widest opacity-80">
                    {result.aPagar ? t('resultToPay') : t('resultToReceive')}
                  </h3>
                  <p className="text-6xl font-black mb-6">
                    {result.resultado.toLocaleString('pt-PT')}€
                  </p>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-sm font-bold opacity-80">{t('effectiveRate')}</span>
                    <span className="text-2xl font-black">{result.taxaEfetiva}%</span>
                  </div>
                </div>

                {/* Breakdown Card */}
                <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                  <h4 className="font-black text-lg border-b border-border pb-4">{t('breakdown')}</h4>
                  
                  <div className="space-y-4">
                    <BreakdownItem label={t('gross')} value={result.rendimentoBruto} />
                    <BreakdownItem label={t('specific')} value={result.deducaoEspecifica} negative />
                    <div className="h-px bg-border my-2" />
                    <BreakdownItem label={t('taxable')} value={result.rendimentoColetavel} bold />
                    <BreakdownItem label={t('coletaBruta')} value={result.coletaBruta} />
                    <BreakdownItem label={t('deducoesColeta')} value={result.deducoesColeta.total} negative />
                    {result.irsJovemIsencao > 0 && <BreakdownItem label={t('irsJovemIsencao')} value={result.irsJovemIsencao} negative highlight />}
                    <div className="h-px bg-border my-2" />
                    <BreakdownItem label={t('coletaLiquida')} value={result.coletaLiquida} bold />
                    <BreakdownItem label={t('retencaoFonte')} value={result.retencoesFonte} negative />
                  </div>

                  {/* Chart */}
                  <div className="h-48 w-full pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          cursor={{fill: 'transparent'}}
                        />
                        <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-accent/50 p-6 rounded-[32px] border border-border">
                  <h5 className="font-bold mb-3 flex items-center gap-2">
                    <TrendingUp size={18} className="text-primary" />
                    {t('tipTitle')}
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {result.aPagar ? t('tipPay') : t('tipReceive')}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="sticky top-24 h-[600px] border-4 border-dashed border-border rounded-[32px] flex flex-col items-center justify-center text-center p-12 text-muted-foreground">
                <Calculator size={64} className="mb-6 opacity-10" />
                <h3 className="text-xl font-bold mb-2">{t('waitSimulation')}</h3>
                <p className="text-sm">{t('waitSimulationDesc')}</p>
                <div className="mt-8 flex gap-2">
                  <div className="w-2 h-2 bg-primary/20 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-primary/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function DeducaoInput({ icon: Icon, label, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
        <Icon size={12} /> {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-accent border-none focus:ring-2 focus:ring-primary/50 font-medium"
        placeholder="0.00€"
      />
    </div>
  );
}

function BreakdownItem({ label, value, negative = false, bold = false, highlight = false }: any) {
  return (
    <div className={`flex justify-between items-center text-sm ${bold ? 'font-black' : 'font-medium'} ${highlight ? 'text-primary' : ''}`}>
      <span className={negative ? 'text-muted-foreground' : ''}>{label}</span>
      <span className={negative ? 'text-muted-foreground' : ''}>
        {negative ? '-' : ''}{Math.round(value).toLocaleString('pt-PT')}€
      </span>
    </div>
  );
}
