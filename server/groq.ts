import Groq from "groq-sdk";

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.warn("[Groq] GROQ_API_KEY não configurada. Groq será desabilitado.");
}

const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

export interface Message {
  role: "user" | "assistant";
  content: string;
}

/**
 * Envia uma mensagem para o Groq/Llama e retorna a resposta.
 * Usa o modelo llama-3.1-70b-versatile por padrão.
 */
export async function sendToGroq(messages: Message[]): Promise<string> {
  if (!groq) {
    throw new Error("Groq não configurado. Configure GROQ_API_KEY nas variáveis de ambiente.");
  }

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: 2048,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Nenhuma resposta recebida do Groq");
    }

    return content;
  } catch (error) {
    console.error("[Groq] Erro ao enviar mensagem:", error);
    throw error;
  }
}
