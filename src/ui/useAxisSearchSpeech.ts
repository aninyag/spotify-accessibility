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
export function useAxisSearchSpeech(
  onFinalText: (text: string) => void,
  opts?: {
    /** When true, report interim (live) transcript while user is speaking. */
    interim?: boolean;
    /** Optional callback for interim transcript updates. */
    onInterimText?: (text: string) => void;
  },
) {
  const [listening, setListening] = React.useState(false);
  const [supported, setSupported] = React.useState(() => !!getSpeechRecognition());
  const [interimText, setInterimText] = React.useState("");

  const startListening = React.useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = !!opts?.interim;
    recognition.continuous = false;
    recognition.onstart = () => {
      setInterimText("");
      setListening(true);
    };
    recognition.onend = () => {
      setListening(false);
      setInterimText("");
    };
    recognition.onerror = () => {
      setListening(false);
      setInterimText("");
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Aggregate interim transcript from the latest results.
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const t = res?.[0]?.transcript?.trim() ?? "";
        if (!t) continue;
        if (res.isFinal) finalText = t;
        else interim = t;
      }
      if (interim) {
        setInterimText(interim);
        opts?.onInterimText?.(interim);
      }
      if (finalText) {
        setInterimText("");
        onFinalText(finalText);
      }
    };
    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  }, [onFinalText, opts]);

  return { startListening, listening, supported, interimText };
}
