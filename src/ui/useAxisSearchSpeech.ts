import * as React from "react";

type RecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognition(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as Window & { webkitSpeechRecognition?: RecognitionCtor };
  return window.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/**
 * Browser speech-to-text for search fields and the command palette (does not open this overlay).
 */
export function useAxisSearchSpeech(onFinalText: (text: string) => void) {
  const [listening, setListening] = React.useState(false);
  const [supported, setSupported] = React.useState(() => !!getSpeechRecognition());

  const startListening = React.useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0]?.[0]?.transcript?.trim();
      if (text) onFinalText(text);
    };
    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  }, [onFinalText]);

  return { startListening, listening, supported };
}
