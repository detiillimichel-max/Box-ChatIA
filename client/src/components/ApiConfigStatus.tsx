import { useApiKeys } from "@/hooks/useApiKeys";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiConfigStatusProps {
  onClick?: () => void;
}

export function ApiConfigStatus({ onClick }: ApiConfigStatusProps) {
  const { isConfigured, isLoaded } = useApiKeys();

  if (!isLoaded) {
    return null;
  }

  const isReady = isConfigured();

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
        isReady
          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
          : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      )}
      title={isReady ? "APIs configuradas" : "APIs não configuradas"}
    >
      {isReady ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          <span>Configurado</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Configurar</span>
        </>
      )}
    </button>
  );
}
