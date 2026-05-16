'use client';

import { useState, useEffect, useCallback } from 'react';

type TamanhoTexto = 'normal' | 'grande' | 'muito-grande';

interface PreferenciasAcessibilidade {
  tamanho: TamanhoTexto;
  contraste: boolean;
  espacamento: boolean;
}

export function useAcessibilidade() {
  const [preferencias, setPreferencias] = useState<PreferenciasAcessibilidade>({
    tamanho: 'normal',
    contraste: false,
    espacamento: false,
  });

  // Carregar do localStorage na montagem
  useEffect(() => {
    const guardadas = localStorage.getItem('acessibilidade');
    if (guardadas) {
      try {
        const parsed = JSON.parse(guardadas);
        setPreferencias(parsed);
      } catch (e) {
        console.error('Erro ao carregar preferências de acessibilidade', e);
      }
    }
  }, []);

  // Aplicar classes ao documento
  const aplicarClasses = useCallback((prefs: PreferenciasAcessibilidade) => {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    
    html.classList.toggle('texto-grande', prefs.tamanho === 'grande');
    html.classList.toggle('texto-muito-grande', prefs.tamanho === 'muito-grande');
    html.classList.toggle('alto-contraste', prefs.contraste);
    html.classList.toggle('espacamento-aumentado', prefs.espacamento);
    
    localStorage.setItem('acessibilidade', JSON.stringify(prefs));
  }, []);

  useEffect(() => {
    aplicarClasses(preferencias);
  }, [preferencias, aplicarClasses]);

  const setTamanho = (tamanho: TamanhoTexto) => {
    setPreferencias(prev => ({ ...prev, tamanho }));
  };

  const toggleContraste = () => {
    setPreferencias(prev => ({ ...prev, contraste: !prev.contraste }));
  };

  const toggleEspacamento = () => {
    setPreferencias(prev => ({ ...prev, espacamento: !prev.espacamento }));
  };

  const isAtivo = preferencias.tamanho !== 'normal' || preferencias.contraste || preferencias.espacamento;

  return {
    preferencias,
    setTamanho,
    toggleContraste,
    toggleEspacamento,
    isAtivo
  };
}
