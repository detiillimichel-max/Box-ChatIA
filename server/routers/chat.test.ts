import { describe, it, expect, vi, beforeEach } from "vitest";
import { chatRouter } from "./chat";
import type { TrpcContext } from "../_core/context";

// Mock the database functions
vi.mock("../db", () => ({
  saveChatMessage: vi.fn(),
  getChatHistory: vi.fn(),
}));

// Mock the Gemini integration
vi.mock("../gemini", () => ({
  sendToGemini: vi.fn(),
}));

// Mock the ElevenLabs integration
vi.mock("../elevenlabs", () => ({
  synthesizeSpeech: vi.fn(),
}));

function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("chatRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendMessage", () => {
    it("should send a message and return a response", async () => {
      const { sendToGemini } = await import("../gemini");
      const { saveChatMessage } = await import("../db");

      vi.mocked(sendToGemini).mockResolvedValue("This is a test response from Gemini");
      vi.mocked(saveChatMessage).mockResolvedValue(undefined);

      const ctx = createMockContext();
      const caller = chatRouter.createCaller(ctx);

      const result = await caller.sendMessage({
        message: "Hello, AI!",
        conversationHistory: [],
      });

      expect(result.success).toBe(true);
      expect(result.response).toBe("This is a test response from Gemini");
      expect(saveChatMessage).toHaveBeenCalledTimes(2); // User message + AI response
    });

    it("should reject empty messages", async () => {
      const ctx = createMockContext();
      const caller = chatRouter.createCaller(ctx);

      await expect(
        caller.sendMessage({
          message: "",
          conversationHistory: [],
        })
      ).rejects.toThrow();
    });

    it("should include conversation history in the request", async () => {
      const { sendToGemini } = await import("../gemini");
      const { saveChatMessage } = await import("../db");

      vi.mocked(sendToGemini).mockResolvedValue("Response");
      vi.mocked(saveChatMessage).mockResolvedValue(undefined);

      const ctx = createMockContext();
      const caller = chatRouter.createCaller(ctx);

      const history = [
        { role: "user" as const, content: "Previous message" },
        { role: "assistant" as const, content: "Previous response" },
      ];

      await caller.sendMessage({
        message: "New message",
        conversationHistory: history,
      });

      // Verify that sendToGemini was called with the full history
      expect(sendToGemini).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: "user", content: "Previous message" }),
          expect.objectContaining({ role: "assistant", content: "Previous response" }),
          expect.objectContaining({ role: "user", content: "New message" }),
        ])
      );
    });
  });

  describe("getHistory", () => {
    it("should return chat history for the user", async () => {
      const { getChatHistory } = await import("../db");

      const mockHistory = [
        { id: 1, userId: 1, role: "user" as const, content: "Hello", createdAt: new Date() },
        { id: 2, userId: 1, role: "assistant" as const, content: "Hi!", createdAt: new Date() },
      ];

      vi.mocked(getChatHistory).mockResolvedValue(mockHistory);

      const ctx = createMockContext();
      const caller = chatRouter.createCaller(ctx);

      const result = await caller.getHistory({ limit: 50 });

      expect(result).toEqual(mockHistory);
      expect(getChatHistory).toHaveBeenCalledWith(1, 50);
    });

    it("should respect the limit parameter", async () => {
      const { getChatHistory } = await import("../db");

      vi.mocked(getChatHistory).mockResolvedValue([]);

      const ctx = createMockContext();
      const caller = chatRouter.createCaller(ctx);

      await caller.getHistory({ limit: 10 });

      expect(getChatHistory).toHaveBeenCalledWith(1, 10);
    });
  });

  describe("synthesizeAudio", () => {
    it("should synthesize audio from text", async () => {
      const { synthesizeSpeech } = await import("../elevenlabs");

      const mockAudioUrl = "data:audio/mpeg;base64,ABC123";
      vi.mocked(synthesizeSpeech).mockResolvedValue(mockAudioUrl);

      const ctx = createMockContext();
      const caller = chatRouter.createCaller(ctx);

      const result = await caller.synthesizeAudio({
        text: "Hello world",
        apiKey: "test-api-key",
      });

      expect(result.success).toBe(true);
      expect(result.audioUrl).toBe(mockAudioUrl);
      expect(synthesizeSpeech).toHaveBeenCalledWith("Hello world", "test-api-key", undefined);
    });

    it("should use custom voice ID if provided", async () => {
      const { synthesizeSpeech } = await import("../elevenlabs");

      vi.mocked(synthesizeSpeech).mockResolvedValue("data:audio/mpeg;base64,ABC123");

      const ctx = createMockContext();
      const caller = chatRouter.createCaller(ctx);

      await caller.synthesizeAudio({
        text: "Hello world",
        apiKey: "test-api-key",
        voiceId: "custom-voice-id",
      });

      expect(synthesizeSpeech).toHaveBeenCalledWith(
        "Hello world",
        "test-api-key",
        "custom-voice-id"
      );
    });

    it("should reject empty text", async () => {
      const ctx = createMockContext();
      const caller = chatRouter.createCaller(ctx);

      await expect(
        caller.synthesizeAudio({
          text: "",
          apiKey: "test-api-key",
        })
      ).rejects.toThrow();
    });
  });

  describe("clearHistory", () => {
    it("should return success", async () => {
      const ctx = createMockContext();
      const caller = chatRouter.createCaller(ctx);

      const result = await caller.clearHistory();

      expect(result.success).toBe(true);
    });
  });
});
