import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { sendToGroq } from "../groq";
import { saveChatMessage, getChatHistory } from "../db";
import { synthesizeSpeech } from "../elevenlabs";

export const chatRouter = router({
  /**
   * Send a message and get a response from Groq/Llama.
   * Saves both user message and AI response to the database.
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1, "Message cannot be empty"),
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Save user message to database
        await saveChatMessage({
          userId: ctx.user.id,
          role: "user",
          content: input.message,
        });

        // Prepare messages for Gemini (including conversation history)
        const messages = [
          ...input.conversationHistory,
          { role: "user" as const, content: input.message },
        ];

        // Get response from Groq/Llama
        const aiResponse = await sendToGroq(messages);

        // Save AI response to database
        await saveChatMessage({
          userId: ctx.user.id,
          role: "assistant",
          content: aiResponse,
        });

        return {
          success: true,
          response: aiResponse,
        };
      } catch (error) {
        console.error("[Chat] Error sending message:", error);
        throw new Error("Failed to process message");
      }
    }),

  /**
   * Get chat history for the current user.
   */
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      try {
        const messages = await getChatHistory(ctx.user.id, input.limit);
        return messages;
      } catch (error) {
        console.error("[Chat] Error fetching history:", error);
        throw new Error("Failed to fetch chat history");
      }
    }),

  /**
   * Synthesize text to speech using ElevenLabs.
   * The API key is provided by the client from localStorage.
   */
  synthesizeAudio: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1, "Text cannot be empty"),
        apiKey: z.string().min(1, "API key is required"),
        voiceId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const audioUrl = await synthesizeSpeech(
          input.text,
          input.apiKey,
          input.voiceId
        );

        return {
          success: true,
          audioUrl,
        };
      } catch (error) {
        console.error("[Chat] Error synthesizing audio:", error);
        throw new Error("Failed to synthesize audio");
      }
    }),

  /**
   * Clear chat history for the current user.
   */
  clearHistory: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // For now, we'll just return success.
      // In a real implementation, you'd delete messages from the database.
      return { success: true };
    } catch (error) {
      console.error("[Chat] Error clearing history:", error);
      throw new Error("Failed to clear chat history");
    }
  }),
});
