import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "./AudioPlayer";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
  audioUrl?: string;
}

export function ChatMessage({ role, content, isLoading, audioUrl }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg space-y-2",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground border border-border rounded-bl-none"
        )}
      >
        {isLoading ? (
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
          </div>
        ) : (
          <>
            <Streamdown className="prose prose-invert prose-sm max-w-none">
              {content}
            </Streamdown>
            {audioUrl && !isUser && (
              <div className="mt-2">
                <AudioPlayer audioUrl={audioUrl} isLoading={isLoading} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
