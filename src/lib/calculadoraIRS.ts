export function calcularIRS(params: {
  rendimentoBruto: number;
  tipo: 'A' | 'B' | 'pensao';
  retencoesFonte: number;
  contribuicoesSS: number;
  estadoCivil: string;
  dependentes: number;
  deficiencia: boolean;
  irsJovem: boolean;
  anoIrsJovem?: number;
  despesasSaude: number;
  despesasEducacao: number;
  despesasHabitacao: number;
  ppr: number;
  lares: number;
  escaloes: any[];
  deducoesColeta: any[];
  deducaoEspecifica: number;
  minimoExistencia: number;
  irsJovemConfig: any[];
}) {
  // 1. Rendimento colectável = bruto - dedução específica - contribuições SS
  // A dedução específica para categoria A é tipicamente 4104€ ou as contribuições para a SS se superiores
  const deducaoEsp = params.tipo === 'A' ? Math.max(params.deducaoEspecifica, params.contribuicoesSS) : 0;
  const rendimentoColetavel = Math.max(0, params.rendimentoBruto - deducaoEsp);

  // 2. Aplicar quociente conjugal se casado tributação conjunta (simplificado)
  const base = params.estadoCivil === 'casado_conjunto' ? rendimentoColetavel / 2 : rendimentoColetavel;

  // 3. Encontrar escalão e calcular coleta parcial
  let coletaUnitaria = 0;
  const sortedEscaloes = [...params.escaloes].sort((a, b) => a.de - b.de);
  
  for (const e of sortedEscaloes) {
    if (base <= e.ate || e.ate === 999999) {
      coletaUnitaria = base * (e.taxa / 100) - e.parcela;
      break;
    }
  }
  
  let coletaBruta = params.estadoCivil === 'casado_conjunto' ? coletaUnitaria * 2 : coletaUnitaria;

  // 4. Dedução por dependentes (600€ por dependente base)
  const deducaoDependentes = params.dependentes * 600;

  // 5. Deduções à coleta discriminadas
  const dSaude = Math.min(params.despesasSaude * 0.15, 1000);
  const dEducacao = Math.min(params.despesasEducacao * 0.30, 800);
  const dHabitacao = Math.min(params.despesasHabitacao * 0.15, 502);
  const dPpr = Math.min(params.ppr * 0.20, 400);
  const dLares = Math.min(params.lares * 0.25, 403.75);

  let totalDeducoes = deducaoDependentes + dSaude + dEducacao + dHabitacao + dPpr + dLares;

  // 6. IRS Jovem
  let irsJovemIsencao = 0;
  if (params.irsJovem && params.anoIrsJovem) {
    const config = params.irsJovemConfig.find((c: any) => c.ano === params.anoIrsJovem);
    if (config) {
      // Isenção sobre a coleta bruta (com limites legais, aqui simplificado)
      irsJovemIsencao = coletaBruta * (config.isencao / 100);
    }
  }

  // 7. Coleta líquida
  const coletaLiquida = Math.max(0, coletaBruta - totalDeducoes - irsJovemIsencao);

  // 8. Mínimo de Existência (se rendimento líquido após IRS for inferior ao mínimo, o IRS é reduzido)
  // Simplificação: apenas garante que coleta não excede o que faria o rendimento cair abaixo do mínimo
  const coletaFinal = Math.min(coletaLiquida, Math.max(0, params.rendimentoBruto - params.minimoExistencia));

  // 9. IRS a pagar ou a receber
  const resultado = coletaFinal - params.retencoesFonte;

  return {
    rendimentoBruto: params.rendimentoBruto,
    deducaoEspecifica: deducaoEsp,
    rendimentoColetavel: Math.round(rendimentoColetavel),
    coletaBruta: Math.round(coletaBruta),
    deducoesColeta: {
      dependentes: deducaoDependentes,
      saude: Math.round(dSaude),
      educacao: Math.round(dEducacao),
      habitacao: Math.round(dHabitacao),
      ppr: Math.round(dPpr),
      lares: Math.round(dLares),
      total: Math.round(totalDeducoes)
    },
    irsJovemIsencao: Math.round(irsJovemIsencao),
    coletaLiquida: Math.round(coletaFinal),
    retencoesFonte: params.retencoesFonte,
    resultado: Math.round(Math.abs(resultado)),
    taxaEfetiva: params.rendimentoBruto > 0 ? parseFloat(((coletaFinal / params.rendimentoBruto) * 100).toFixed(1)) : 0,
    aPagar: resultado > 0,
  };
}
