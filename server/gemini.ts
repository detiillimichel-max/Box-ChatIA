import { invokeLLM } from "./_core/llm";

export interface GeminiMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Send a message to Gemini API and get a response.
 * Supports streaming for real-time responses.
 */
export async function sendToGemini(
  messages: GeminiMessage[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    // Convert messages to the format expected by invokeLLM
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const response = await invokeLLM({
      messages: formattedMessages,
    });

    // Extract the response content
    const messageContent = response.choices?.[0]?.message?.content;
    const content = typeof messageContent === "string" ? messageContent : "";

    if (onChunk) {
      onChunk(content);
    }

    return content;
  } catch (error) {
    console.error("[Gemini] Error sending message:", error);
    throw new Error("Failed to get response from Gemini API");
  }
}

/**
 * Generate a streaming response from Gemini.
 * This is useful for real-time chat responses.
 */
export async function* streamGeminiResponse(
  messages: GeminiMessage[]
): AsyncGenerator<string, void, unknown> {
  try {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const response = await invokeLLM({
      messages: formattedMessages,
    });

    const messageContent = response.choices?.[0]?.message?.content;
    const content = typeof messageContent === "string" ? messageContent : "";
    
    // Simulate streaming by yielding the content in chunks
    const chunkSize = 50;
    for (let i = 0; i < content.length; i += chunkSize) {
      yield content.slice(i, i + chunkSize);
    }
  } catch (error) {
    console.error("[Gemini] Error streaming response:", error);
    throw new Error("Failed to stream response from Gemini API");
  }
}
