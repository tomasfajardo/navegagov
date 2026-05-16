import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const BASE_SYSTEM_PROMPT = `És um assistente do NavegaGov, uma plataforma de literacia digital portuguesa. Ajudas cidadãos a usar serviços públicos digitais em Portugal.

PORTAIS OFICIAIS:
- Segurança Social Direta: https://www.seg-social.pt
- Portal das Finanças AT: https://www.portaldasfinancas.gov.pt
- SNS24: https://www.sns24.gov.pt
- Autenticação.gov: https://www.autenticacao.gov.pt
- IRN: https://irn.justica.gov.pt

REGRAS: Responde em português europeu, linguagem simples, máximo 3 parágrafos.`;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    return NextResponse.json({ error: true, reply: "Chave API não configurada." });
  }

  let message: string;
  let history: { role: string; content: string }[] = [];

  try {
    const body = await req.json();
    message = body.message;
    history = Array.isArray(body.history) ? body.history : [];
    if (!message) return NextResponse.json({ error: true, reply: "Mensagem inválida." });
  } catch {
    return NextResponse.json({ error: true, reply: "Erro ao ler mensagem." });
  }

  let contextTutoriais = "";
  let contextProgresso = "Não autenticado";
  let contextPerfil = "Desconhecido";

  try {
    const supabase = await createClient();

    const { data: tutoriais } = await supabase
      .from("tutoriais")
      .select("titulo, nivel, plataformas(nome)")
      .limit(20);

    if (tutoriais && tutoriais.length > 0) {
      contextTutoriais = tutoriais
        .map((t: any) => `- "${t.titulo}" (${t.plataformas?.nome}, ${t.nivel})`)
        .join("\n");
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: prog } = await supabase
        .from("progresso")
        .select("completado, pontuacao, tutoriais(titulo)")
        .eq("utilizador_id", user.id);

      if (prog && prog.length > 0) {
        contextProgresso = prog
          .map((p: any) => `- ${p.tutoriais?.titulo}: ${p.completado ? "concluído" : "em progresso"}`)
          .join("\n");
      }

      const { data: profile } = await supabase
        .from("utilizadores")
        .select("perfil, plataforma_preferida")
        .eq("id", user.id)
        .single();

      if (profile) {
        contextPerfil = `Perfil: ${profile.perfil}, Plataforma: ${profile.plataforma_preferida || "Nenhuma"}`;
      }
    }
  } catch {}

  const systemPrompt =
    BASE_SYSTEM_PROMPT +
    (contextTutoriais ? `\n\nTUTORIAIS:\n${contextTutoriais}` : "") +
    `\n\nUTILIZADOR:\n${contextPerfil}\n\nPROGRESSO:\n${contextProgresso}`;

  const contents = [
    ...history.map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });
    const result = await model.generateContent({ contents });
    return NextResponse.json({ reply: result.response.text() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: true, reply: `Erro Gemini: ${msg}` });
  }
}
