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

  // Mantemos as queries antigas apenas para não quebrar a estrutura do React
  const getHistoryQuery = trpc.chat.getHistory.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );
  const synthesizeAudioMutation = trpc.chat.synthesizeAudio.useMutation();

  useEffect(() => {
    if (getHistoryQuery.data) {
      setMessages(getHistoryQuery.data);
    }
  }, [getHistoryQuery.data]);

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
      // --- INÍCIO DO BYPASS (CONEXÃO DIRETA E SEGURA COM O GEMINI) ---
      
      // 1. Pega a chave da API salva no navegador (Verifique se o nome no seu modal é esse mesmo)
      const geminiKey = localStorage.getItem("gemini_api_key"); 
      
      if (!geminiKey) {
        toast.error("Chave da API do Gemini não configurada. Clique na engrenagem.");
        setIsLoading(false);
        return;
      }

      // 2. Formata o histórico exatamente no padrão exigido pelo Google Gemini
      const formattedHistory = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));
      
      formattedHistory.push({
        role: "user",
        parts: [{ text: message }]
      });

      // 3. Faz o disparo direto para a API do Google (bypassando o servidor do Manus)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedHistory })
      });

      if (!response.ok) {
        throw new Error("Falha na comunicação direta com a API do Gemini.");
      }

      const data = await response.json();
      const aiTextResponse = data.candidates[0].content.parts[0].text;
      
      // --- FIM DO BYPASS ---

      let audioUrl: string | undefined;
      const elevenLabsKey = localStorage.getItem("elevenlabs_api_key");
      
      // Mantivemos a tentativa do áudio isolada para não quebrar o chat caso o trpc falhe aqui também
      if (elevenLabsKey) {
        try {
          const audioResponse = await synthesizeAudioMutation.mutateAsync({
            text: aiTextResponse,
            apiKey: elevenLabsKey,
          });

          if (audioResponse.success) {
            audioUrl = audioResponse.audioUrl;
          }
        } catch (error) {
          console.error("Erro no ElevenLabs (servidor local ausente):", error);
        }
      }

      // Adiciona a resposta da IA na tela
      const aiMessage: Message = {
        role: "assistant",
        content: aiTextResponse,
        audioUrl,
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao conectar com a IA. Verifique sua chave da API.");
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
