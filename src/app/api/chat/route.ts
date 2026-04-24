import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `És o assistente virtual da plataforma NavegaGov. 
O teu objetivo é ajudar cidadãos portugueses e imigrantes a navegar nos serviços públicos digitais de Portugal.
Deves ser amigável, paciente e usar uma linguagem simples e clara.
Foca-te em temas como:
- Portal das Finanças (IRS, NIF, Recibos Verdes, e-Fatura)
- Segurança Social Direta (Subsídios, Pensões, Desemprego)
- ePortugal (Cartão de Cidadão, Passaporte, Carta de Condução)
- SNS 24 (Saúde, Marcações, Urgências)
- Apoio ao Imigrante (CPLP, Vistos, NISS, Residência)

Se não souberes algo, sugere que o utilizador consulte os tutoriais na galeria da plataforma ou contacte as linhas de apoio oficiais.
Responde sempre em Português de Portugal. Sê conciso e claro.`;

export async function POST(req: Request) {
  // 1. Check for API key first
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    return NextResponse.json(
      {
        error: true,
        reply:
          "⚠️ A chave da API Gemini não está configurada. Adiciona a GEMINI_API_KEY ao ficheiro .env.local e reinicia o servidor.",
      },
      { status: 200 } // 200 so the chatbot shows the message instead of treating it as network error
    );
  }

  // 2. Parse body
  let message: string;
  try {
    const body = await req.json();
    message = body.message;
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: true, reply: "Mensagem inválida ou vazia." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: true, reply: "Erro ao ler a mensagem enviada." },
      { status: 400 }
    );
  }

  // 3. Call Gemini
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(message);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (err: unknown) {
    console.error("Gemini API Error:", err);

    // Try fallback model if 2.0-flash not available
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT,
      });
      const result = await model.generateContent(message);
      const text = result.response.text();
      return NextResponse.json({ reply: text });
    } catch (fallbackErr: unknown) {
      console.error("Gemini Fallback Error:", fallbackErr);
      const msg =
        fallbackErr instanceof Error ? fallbackErr.message : "Erro desconhecido";
      return NextResponse.json(
        {
          error: true,
          reply: `❌ Erro ao contactar o Gemini: ${msg}. Verifica que a GEMINI_API_KEY é válida.`,
        },
        { status: 200 }
      );
    }
  }
}
