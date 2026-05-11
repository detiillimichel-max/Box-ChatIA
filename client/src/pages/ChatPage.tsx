import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ApiConfigModal } from "@/components/ApiConfigModal";
import { ApiConfigStatus } from "@/components/ApiConfigStatus";
import { useAuth } from "@/_core/hooks/useAuth";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
}

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isListening, transcript, startListening, stopListening, resetTranscript } =
    useSpeechRecognition({
      language: "pt-BR",
      onTranscript: (text) => {
        // Auto-send transcribed text
        if (text.trim()) {
          handleSendMessage(text);
          resetTranscript();
        }
      },
      onError: (error) => {
        toast.error(error);
      },
    });

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const getHistoryQuery = trpc.chat.getHistory.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );
  const synthesizeAudioMutation = trpc.chat.synthesizeAudio.useMutation();

  // Load chat history on mount
  useEffect(() => {
    if (getHistoryQuery.data) {
      setMessages(getHistoryQuery.data);
    }
  }, [getHistoryQuery.data]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !user) return;

    // Add user message to UI
    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message,
        conversationHistory: messages,
      });

      if (response.success) {
        // Try to synthesize speech for the response
        let audioUrl: string | undefined;
        const elevenLabsKey = localStorage.getItem("elevenlabs_api_key");
        if (elevenLabsKey) {
          try {
            const audioResponse = await synthesizeAudioMutation.mutateAsync({
              text: response.response,
              apiKey: elevenLabsKey,
            });

            if (audioResponse.success) {
              audioUrl = audioResponse.audioUrl;
            }
          } catch (error) {
            console.error("Error synthesizing audio:", error);
          }
        }

        // Add AI response to UI
        const aiMessage: Message = {
          role: "assistant",
          content: response.response,
          audioUrl,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem. Verifique suas chaves de API.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    toast.success("Histórico de chat limpo.");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Box-ChatIA</h1>
          <p className="text-muted-foreground mb-6">Faça login para começar a conversar com IA</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Box-ChatIA</h1>
            <p className="text-sm text-muted-foreground">Conversando com IA Generativa</p>
          </div>
          <div className="flex items-center gap-2">
            <ApiConfigStatus onClick={() => setShowConfigModal(true)} />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Bem-vindo ao Box-ChatIA</h2>
              <p className="text-muted-foreground mb-6">
                Comece uma conversa digitando uma mensagem ou usando o microfone.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                <button
                  onClick={() => handleSendMessage("Olá! Como você funciona?")}
                  className="p-3 rounded-lg bg-card border border-border hover:border-primary transition-colors text-left text-sm"
                >
                  <p className="font-medium">Comece uma conversa</p>
                  <p className="text-xs text-muted-foreground">Olá! Como você funciona?</p>
                </button>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="p-3 rounded-lg bg-card border border-border hover:border-primary transition-colors text-left text-sm"
                >
                  <p className="font-medium">Configurar APIs</p>
                  <p className="text-xs text-muted-foreground">Adicione suas chaves</p>
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                role={msg.role}
                content={msg.content}
                audioUrl={msg.audioUrl}
                isLoading={isLoading && idx === messages.length - 1 && msg.role === "assistant"}
              />
            ))
          )}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <ChatMessage role="assistant" content="" isLoading={true} />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            onMicClick={handleMicClick}
            onSettingsClick={() => setShowConfigModal(true)}
            isLoading={isLoading}
            isMicActive={isListening}
          />
        </div>
      </div>

      {/* Config Modal */}
      <ApiConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />
    </div>
  );
}
