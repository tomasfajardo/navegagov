'use client';

import { useAcessibilidade } from '@/hooks/useAcessibilidade';

export default function AccessibilityInitializer() {
  // O hook useAcessibilidade já trata da aplicação das classes no useEffect
  useAcessibilidade();
  return null;
}
