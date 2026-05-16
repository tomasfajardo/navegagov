import { SupabaseClient } from '@supabase/supabase-js';

export async function verificarEAtribuirBadges(supabase: SupabaseClient, userId: string) {
  const { data: progressos } = await supabase
    .from('progresso')
    .select(`*, tutoriais(id, plataforma_id, plataformas(nome))`)
    .eq('utilizador_id', userId)
    .eq('completado', true);

  const { data: utilizadorBadges } = await supabase
    .from('utilizador_badges')
    .select('badge_id')
    .eq('utilizador_id', userId);

  const ownedBadgeIds = new Set(utilizadorBadges?.map((b: any) => b.badge_id) || []);

  const { data: definicoes } = await supabase
    .from('badges_definicoes')
    .select('*');

  if (!definicoes || !progressos) return [];

  const newBadges: any[] = [];
  const completedCount = progressos.length;

  const uniquePlatforms = new Set(
    progressos
      .map((p: any) => p.tutoriais?.plataformas?.nome)
      .filter(Boolean)
  );

  const completedPerPlatform: Record<string, number> = {};
  progressos.forEach((p: any) => {
    const platName = p.tutoriais?.plataformas?.nome;
    if (platName) {
      completedPerPlatform[platName] = (completedPerPlatform[platName] || 0) + 1;
    }
  });

  for (const badge of definicoes) {
    if (ownedBadgeIds.has(badge.id)) continue;

    let earned = false;

    switch (badge.condicao_tipo) {
      case 'completar_n_tutoriais':
        if (badge.condicao_valor && completedCount >= badge.condicao_valor) earned = true;
        break;

      case 'pontuacao_quiz':
        if (badge.condicao_valor) {
          const hasPerfectScore = progressos.some((p: any) => p.pontuacao === badge.condicao_valor);
          if (hasPerfectScore) earned = true;
        }
        break;

      case 'multiplas_plataformas':
        if (badge.condicao_valor && uniquePlatforms.size >= badge.condicao_valor) earned = true;
        break;

      case 'plataforma_especifica':
        if (badge.condicao_plataforma) {
          const { data: plat } = await supabase
            .from('plataformas')
            .select('id')
            .eq('nome', badge.condicao_plataforma)
            .single();
          if (plat) {
            const { count: totalInPlatform } = await supabase
              .from('tutoriais')
              .select('id', { count: 'exact', head: true })
              .eq('plataforma_id', plat.id);
            const userCompleted = completedPerPlatform[badge.condicao_plataforma] || 0;
            if (totalInPlatform && totalInPlatform > 0) {
              const percentageRequired = badge.condicao_valor || 100;
              if ((userCompleted / totalInPlatform) * 100 >= percentageRequired) earned = true;
            }
          }
        }
        break;

      case 'primeiro_login':
        earned = true;
        break;
    }

    if (earned) newBadges.push(badge);
  }

  if (newBadges.length > 0) {
    await supabase.from('utilizador_badges').insert(
      newBadges.map((b: any) => ({ utilizador_id: userId, badge_id: b.id }))
    );

    const { error: rpcError } = await supabase.rpc('increment_total_badges', {
      u_id: userId,
      amount: newBadges.length,
    });

    if (rpcError) {
      const { data: userRow } = await supabase
        .from('utilizadores')
        .select('total_badges')
        .eq('id', userId)
        .single();
      await supabase
        .from('utilizadores')
        .update({ total_badges: (userRow?.total_badges || 0) + newBadges.length })
        .eq('id', userId);
    }
  }

  return newBadges;
}
