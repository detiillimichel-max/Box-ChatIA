import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onMicClick: () => void;
  onSettingsClick: () => void;
  isLoading?: boolean;
  isMicActive?: boolean;
}

export function ChatInput({
  onSendMessage,
  onMicClick,
  onSettingsClick,
  isLoading,
  isMicActive,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <Button
        variant="ghost"
        size="icon"
        onClick={onSettingsClick}
        className="text-muted-foreground hover:text-foreground"
        title="Configurar APIs"
      >
        <Settings className="w-5 h-5" />
      </Button>

      <div className="flex-1 relative">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva sua mensagem..."
          disabled={isLoading}
          className="pr-12"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onMicClick}
        disabled={isLoading}
        className={cn(
          "text-muted-foreground hover:text-foreground transition-colors",
          isMicActive && "text-red-500 bg-red-500/10"
        )}
        title="Usar microfone"
      >
        <Mic className="w-5 h-5" />
      </Button>

      <Button
        onClick={handleSend}
        disabled={!message.trim() || isLoading}
        size="icon"
        className="bg-primary hover:bg-primary/90"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}
