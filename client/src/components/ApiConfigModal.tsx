import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { useApiKeys } from "@/hooks/useApiKeys";
import { toast } from "sonner";

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiConfigModal({ isOpen, onClose }: ApiConfigModalProps) {
  const { keys, saveKeys, clearKeys } = useApiKeys();
  const [geminiKey, setGeminiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [errors, setErrors] = useState<{ gemini?: string; elevenLabs?: string }>({});

  useEffect(() => {
    // Load keys from hook on mount
    setGeminiKey(keys.gemini);
    setElevenLabsKey(keys.elevenLabs);
    setErrors({});
  }, [isOpen, keys]);

  const validateKeys = () => {
    const newErrors: typeof errors = {};

    if (geminiKey.trim().length === 0) {
      newErrors.gemini = "Chave do Gemini é obrigatória";
    } else if (geminiKey.trim().length < 10) {
      newErrors.gemini = "Chave do Gemini parece ser inválida";
    }

    if (elevenLabsKey.trim().length === 0) {
      newErrors.elevenLabs = "Chave do ElevenLabs é obrigatória";
    } else if (elevenLabsKey.trim().length < 10) {
      newErrors.elevenLabs = "Chave do ElevenLabs parece ser inválida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateKeys()) {
      setSavedStatus("error");
      setTimeout(() => setSavedStatus("idle"), 2000);
      return;
    }

    setSavedStatus("saving");
    try {
      const success = saveKeys({
        gemini: geminiKey.trim(),
        elevenLabs: elevenLabsKey.trim(),
      });

      if (success) {
        setSavedStatus("saved");
        toast.success("Chaves de API salvas com sucesso!");
        setTimeout(() => {
          setSavedStatus("idle");
          onClose();
        }, 1500);
      } else {
        setSavedStatus("error");
        toast.error("Erro ao salvar as chaves de API");
        setTimeout(() => setSavedStatus("idle"), 2000);
      }
    } catch (error) {
      console.error("Error saving API keys:", error);
      setSavedStatus("error");
      toast.error("Erro ao salvar as chaves de API");
      setTimeout(() => setSavedStatus("idle"), 2000);
    }
  };

  const handleClear = () => {
    if (window.confirm("Tem certeza que deseja limpar todas as chaves de API?")) {
      const success = clearKeys();
      if (success) {
        setGeminiKey("");
        setElevenLabsKey("");
        setErrors({});
        toast.success("Chaves de API removidas");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Chaves de API</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              Suas chaves de API são armazenadas apenas localmente no seu navegador. Nunca são
              enviadas para servidores externos.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gemini-key">Chave do Gemini API</Label>
            <Input
              id="gemini-key"
              type="password"
              placeholder="Insira sua chave do Gemini..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Obtenha em{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="elevenlabs-key">Chave do ElevenLabs API</Label>
            <Input
              id="elevenlabs-key"
              type="password"
              placeholder="Insira sua chave do ElevenLabs..."
              value={elevenLabsKey}
              onChange={(e) => setElevenLabsKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Obtenha em{" "}
              <a
                href="https://elevenlabs.io/app/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ElevenLabs Dashboard
              </a>
            </p>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">
                {Object.values(errors).map((error, idx) => (
                  <p key={idx}>{error}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="ghost"
              onClick={handleClear}
              className="text-destructive hover:text-destructive"
              title="Limpar todas as chaves"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSave}
              disabled={savedStatus === "saving"}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {savedStatus === "saving" && "Salvando..."}
              {savedStatus === "saved" && (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Salvo!
                </span>
              )}
              {savedStatus === "error" && "Erro ao salvar"}
              {savedStatus === "idle" && "Salvar Chaves"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
