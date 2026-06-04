'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { submeterAvaliacao } from '@/app/actions/avaliar';

interface StarRatingProps {
  conteudoId: string;
  tipoConteudo: 'tutorial' | 'quiz' | 'jogo';
  readOnly?: boolean;
  averageRating?: number;
  totalRatings?: number;
}

export default function StarRating({
  conteudoId,
  tipoConteudo,
  readOnly,
  averageRating,
  totalRatings,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (readOnly) return;
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoggedIn(false); return; }
      setIsLoggedIn(true);
      const { data } = await supabase
        .from('avaliacoes')
        .select('avaliacao')
        .eq('utilizador_id', session.user.id)
        .eq('conteudo_id', conteudoId)
        .eq('tipo_conteudo', tipoConteudo)
        .single();
      if (data) setUserRating(data.avaliacao);
    }
    init();
  }, [conteudoId, tipoConteudo, readOnly]);

  // Read-only: show aggregate rating
  if (readOnly) {
    if (!totalRatings || !averageRating) return null;
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="text-amber-500 font-semibold">★ {averageRating.toFixed(1)}</span>
        ({totalRatings} avaliações)
      </span>
    );
  }

  // Interactive: submitted confirmation
  if (submitted) {
    return (
      <p className="text-sm text-primary font-semibold flex items-center gap-1">
        ★ Obrigado pelo feedback! ✓
      </p>
    );
  }

  // Interactive: not logged in
  if (isLoggedIn === false) {
    return (
      <p className="text-xs text-muted-foreground">
        <a href="/login" className="text-primary hover:underline">Inicia sessão</a>{' '}
        para avaliar este conteúdo.
      </p>
    );
  }

  async function handleRate(star: number) {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    setUserRating(star);
    const res = await submeterAvaliacao(conteudoId, tipoConteudo, star);
    setIsSubmitting(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      console.error('[StarRating] Failed to save rating:', res.error);
      setSubmitError(res.error ?? 'Erro desconhecido');
    }
  }

  const display = hovered || userRating;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Avaliar:</span>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            disabled={isSubmitting || isLoggedIn === null}
            className={`text-2xl leading-none transition-all hover:scale-110 ${
              star <= display ? 'text-[#3B82F6]' : 'text-gray-300 dark:text-gray-600'
            }`}
            aria-label={`${star} estrelas`}
          >
            ★
          </button>
        ))}
      </div>
      {submitError && (
        <p className="text-xs text-red-500">Erro ao guardar: {submitError}</p>
      )}
    </div>
  );
}
