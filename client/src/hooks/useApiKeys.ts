import { useState, useEffect, useCallback } from "react";

interface ApiKeys {
  gemini: string;
  elevenLabs: string;
}

const STORAGE_KEYS = {
  GEMINI: "gemini_api_key",
  ELEVENLABS: "elevenlabs_api_key",
};

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeys>({
    gemini: "",
    elevenLabs: "",
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load keys from localStorage on mount
  useEffect(() => {
    const geminiKey = localStorage.getItem(STORAGE_KEYS.GEMINI) || "";
    const elevenLabsKey = localStorage.getItem(STORAGE_KEYS.ELEVENLABS) || "";
    setKeys({
      gemini: geminiKey,
      elevenLabs: elevenLabsKey,
    });
    setIsLoaded(true);
  }, []);

  const saveKeys = useCallback((newKeys: Partial<ApiKeys>) => {
    try {
      if (newKeys.gemini !== undefined) {
        localStorage.setItem(STORAGE_KEYS.GEMINI, newKeys.gemini);
      }
      if (newKeys.elevenLabs !== undefined) {
        localStorage.setItem(STORAGE_KEYS.ELEVENLABS, newKeys.elevenLabs);
      }
      setKeys((prev) => ({ ...prev, ...newKeys }));
      return true;
    } catch (error) {
      console.error("Error saving API keys:", error);
      return false;
    }
  }, []);

  const clearKeys = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.GEMINI);
      localStorage.removeItem(STORAGE_KEYS.ELEVENLABS);
      setKeys({
        gemini: "",
        elevenLabs: "",
      });
      return true;
    } catch (error) {
      console.error("Error clearing API keys:", error);
      return false;
    }
  }, []);

  const isConfigured = useCallback(() => {
    return keys.gemini.length > 0 && keys.elevenLabs.length > 0;
  }, [keys]);

  return {
    keys,
    isLoaded,
    saveKeys,
    clearKeys,
    isConfigured,
  };
}
