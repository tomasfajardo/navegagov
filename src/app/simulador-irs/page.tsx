'use client';

import { useState } from 'react';
import { Calculator, Info, ArrowRight, RefreshCcw, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IRSSimulator() {
  const [income, setIncome] = useState<string>('');
  const [status, setStatus] = useState<'single' | 'married'>('single');
  const [dependents, setDependents] = useState<number>(0);
  const [expenses, setExpenses] = useState<string>('');
  const [result, setResult] = useState<{ tax: number; rate: number; net: number } | null>(null);

  const calculateIRS = () => {
    const rawIncome = parseFloat(income) || 0;
    const rawExpenses = parseFloat(expenses) || 0;
    
    // Simplified Calculation for 2024 (Portugal)
    // 1. Specific deduction (4104€)
    let taxableBase = Math.max(0, rawIncome - 4104);
    
    // 2. Family Quotient
    const divisor = status === 'married' ? 2 : 1;
    const incomePerUnit = taxableBase / divisor;

    // 3. Simplified Brackets (Example values)
    let rate = 0;
    if (incomePerUnit <= 7703) rate = 0.13;
    else if (incomePerUnit <= 11623) rate = 0.18;
    else if (incomePerUnit <= 16472) rate = 0.23;
    else if (incomePerUnit <= 21321) rate = 0.26;
    else if (incomePerUnit <= 27146) rate = 0.32;
    else rate = 0.37;

    let totalTax = (taxableBase * rate) - (dependents * 600) - (rawExpenses * 0.15);
    totalTax = Math.max(0, totalTax);

    setResult({
      tax: totalTax,
      rate: rate * 100,
      net: rawIncome - totalTax
    });
  };

  const reset = () => {
    setIncome('');
    setExpenses('');
    setDependents(0);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calculator size={32} />
        </div>
        <h1 className="text-4xl font-extrabold mb-4">Simulador de IRS Simplificado</h1>
        <p className="text-muted-foreground text-lg">
          Calcula uma estimativa do teu imposto e percebe como os teus rendimentos são tributados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Form */}
        <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Info size={20} className="text-primary" />
            Dados de Rendimento
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Rendimento Bruto Anual (€)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="Ex: 18000"
                className="w-full px-4 py-3 rounded-xl bg-accent border-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estado Civil</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStatus('single')}
                  className={`py-2 rounded-xl border-2 transition-all ${status === 'single' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-transparent bg-accent'}`}
                >
                  Solteiro
                </button>
                <button
                  onClick={() => setStatus('married')}
                  className={`py-2 rounded-xl border-2 transition-all ${status === 'married' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-transparent bg-accent'}`}
                >
                  Casado
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Número de Dependentes</label>
              <div className="flex items-center gap-4">
                <button onClick={() => setDependents(Math.max(0, dependents - 1))} className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">-</button>
                <span className="text-xl font-bold w-8 text-center">{dependents}</span>
                <button onClick={() => setDependents(dependents + 1)} className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">+</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Despesas Gerais e Saúde (€)</label>
              <input
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                placeholder="Ex: 2500"
                className="w-full px-4 py-3 rounded-xl bg-accent border-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <button
              onClick={calculateIRS}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              Calcular Estimatíva <ArrowRight size={20} />
            </button>
          </div>
        </section>

        {/* Results */}
        <section>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary text-white rounded-3xl p-8 h-full flex flex-col shadow-xl shadow-primary/20"
              >
                <div className="flex justify-between items-start mb-8">
                  <h2 className="text-2xl font-bold">Resultado</h2>
                  <button onClick={reset} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <RefreshCcw size={20} />
                  </button>
                </div>

                <div className="space-y-8 flex-grow">
                  <div>
                    <p className="text-white/70 text-sm mb-1 uppercase tracking-wider font-semibold">Imposto Estimado (Anual)</p>
                    <p className="text-5xl font-extrabold">{result.tax.toFixed(2)}€</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <p className="text-white/70 text-xs mb-1">Escalão Médio</p>
                      <p className="text-xl font-bold">{result.rate.toFixed(1)}%</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <p className="text-white/70 text-xs mb-1">Rendimento Líquido</p>
                      <p className="text-xl font-bold">{result.net.toFixed(0)}€</p>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                    <div className="flex gap-3">
                      <TrendingUp size={24} className="flex-shrink-0" />
                      <p className="text-sm">
                        Este valor é apenas uma estimativa baseada nas tabelas gerais de 2024. 
                        O valor real pode variar dependendo de benefícios fiscais específicos.
                      </p>
                    </div>
                  </div>
                </div>

                <button className="mt-8 w-full py-4 bg-white text-primary rounded-2xl font-bold hover:bg-slate-100 transition-colors">
                  Ver Tutorial de Entrega
                </button>
              </motion.div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-3xl p-12 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <AlertCircle size={48} className="mb-4 opacity-20" />
                <p className="font-medium">Preenche os dados ao lado para veres a tua estimativa de IRS.</p>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* FAQ/Education Section */}
      <section className="mt-20 space-y-8">
        <h2 className="text-2xl font-bold">O que precisas de saber</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-accent">
            <h3 className="font-bold mb-2">O que é o Mínimo de Existência?</h3>
            <p className="text-sm text-muted-foreground">É um valor de rendimento líquido que o estado garante a todos os contribuintes. Se o teu rendimento for muito baixo, podes estar isento de imposto.</p>
          </div>
          <div className="p-6 rounded-2xl bg-accent">
            <h3 className="font-bold mb-2">Porquê validar faturas?</h3>
            <p className="text-sm text-muted-foreground">Cada fatura validada no E-Fatura pode reduzir o teu imposto a pagar ou aumentar o teu reembolso através de deduções à coleta.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
