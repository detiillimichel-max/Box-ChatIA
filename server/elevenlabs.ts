/**
 * ElevenLabs API integration for text-to-speech synthesis.
 * Note: API keys are provided by the client from localStorage.
 */

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
}

/**
 * Synthesize text to speech using ElevenLabs API.
 * Requires the API key to be provided by the client.
 * Returns the audio as a base64-encoded string or URL.
 */
export async function synthesizeSpeech(
  text: string,
  apiKey: string,
  voiceId: string = "21m00Tcm4TlvDq8ikWAM" // Default voice: Rachel
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`ElevenLabs API error: ${error.detail?.message || response.statusText}`);
    }

    // Get audio as blob
    const audioBlob = await response.blob();
    
    // Convert to base64
    const buffer = await audioBlob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    return `data:audio/mpeg;base64,${base64}`;
  } catch (error) {
    console.error("[ElevenLabs] Error synthesizing speech:", error);
    throw new Error("Failed to synthesize speech with ElevenLabs API");
  }
}

/**
 * Get available voices from ElevenLabs.
 * Requires the API key to be provided by the client.
 */
export async function getAvailableVoices(apiKey: string): Promise<ElevenLabsVoice[]> {
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error("[ElevenLabs] Error fetching voices:", error);
    throw new Error("Failed to fetch available voices from ElevenLabs API");
  }
}
