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
        if (text.trim()) {
          handleSendMessage(text);
          resetTranscript();
        }
      },
      onError: (error) => {
        toast.error(error);
      },
    });

  // Carregar histórico de chat do servidor
  const getHistoryQuery = trpc.chat.getHistory.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  // Mutation para enviar mensagem via servidor (Groq/Llama)
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // Mutation para síntese de áudio
  const synthesizeAudioMutation = trpc.chat.synthesizeAudio.useMutation();

  // Carregar histórico quando disponível
  useEffect(() => {
    if (getHistoryQuery.data) {
      setMessages(getHistoryQuery.data);
    }
  }, [getHistoryQuery.data]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !user) return;

    // Adiciona a mensagem do usuário na tela
    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Enviar mensagem via servidor (Groq/Llama)
      const response = await sendMessageMutation.mutateAsync({
        message,
        conversationHistory: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      if (!response.success) {
        throw new Error("Falha ao processar mensagem");
      }

      // Tentar síntese de áudio se ElevenLabs estiver configurado
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
          console.error("Erro ao sintetizar áudio:", error);
          // Continua mesmo se áudio falhar
        }
      }

      // Adiciona a resposta da IA na tela
      const aiMessage: Message = {
        role: "assistant",
        content: response.response,
        audioUrl,
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao conectar com a IA. Tente novamente.");
      // Remove a mensagem do usuário se houve erro
      setMessages((prev) => prev.slice(0, -1));
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
              Box-ChatIA
            </h1>
            <p className="text-lg text-muted-foreground">Conversando com IA Generativa</p>
          </div>
          <p className="text-muted-foreground max-w-md">
            Faça login para começar a conversar com Groq/Llama
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex flex-col">
      {/* Header com Glassmorphism */}
      <header className="border-b border-white/10 bg-card/30 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Box-ChatIA
            </h1>
            <p className="text-sm text-muted-foreground">Powered by Groq/Llama</p>
          </div>
          <div className="flex items-center gap-2">
            <ApiConfigStatus onClick={() => setShowConfigModal(true)} />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>
      </header>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Bem-vindo ao Box-ChatIA</h2>
                <p className="text-muted-foreground">
                  Comece uma conversa digitando uma mensagem ou usando o microfone.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                <button
                  onClick={() => handleSendMessage("Olá! Como você funciona?")}
                  className="p-4 rounded-xl bg-card/50 border border-white/10 hover:border-primary/50 hover:bg-card/70 transition-all backdrop-blur-sm text-left text-sm group"
                >
                  <p className="font-medium group-hover:text-primary transition-colors">
                    Comece uma conversa
                  </p>
                  <p className="text-xs text-muted-foreground">Olá! Como você funciona?</p>
                </button>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="p-4 rounded-xl bg-card/50 border border-white/10 hover:border-primary/50 hover:bg-card/70 transition-all backdrop-blur-sm text-left text-sm group"
                >
                  <p className="font-medium group-hover:text-primary transition-colors">
                    Configurar APIs
                  </p>
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

      {/* Área de Input com Glassmorphism */}
      <div className="border-t border-white/10 bg-card/30 backdrop-blur-xl sticky bottom-0 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            onMicClick={handleMicClick}
            onSettingsClick={() => setShowConfigModal(true)}
            isLoading={isLoading}
            isMicActive={isListening}
          />
        </div>
      </div>

      {/* Modal de Configuração */}
      <ApiConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />
    </div>
  );
}
