import { useState, useCallback, useRef, useEffect } from "react";

interface VoiceConfig {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useVoiceAssistant(config?: VoiceConfig) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Only run on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check browser support
  const getSpeechRecognition = useCallback(() => {
    if (!isClient) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech Recognition API not supported in this browser");
      return null;
    }
    
    return new SpeechRecognition();
  }, [isClient]);

  // Start listening to voice
  const startListening = useCallback(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) return;

    recognition.lang = config?.language || "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
    };

    recognition.onresult = (event: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognitionEvent = event as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultEvent: any = recognitionEvent;
      
      for (let i = resultEvent.resultIndex; i < resultEvent.results.length; i++) {
        const recognizedTranscript = resultEvent.results[i][0].transcript;
        
        if (resultEvent.results[i].isFinal) {
          setTranscript(prev => prev + recognizedTranscript + " ");
        }
      }
    };

    recognition.onerror = (event: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorEvent = event as any;
      setError(`Speech recognition error: ${errorEvent.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [getSpeechRecognition, config]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Speak text using Web Speech API
  const speak = useCallback((text: string) => {
    if (!isClient) return;
    // Check if already speaking
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = config?.rate || 1;
    utterance.pitch = config?.pitch || 1;
    utterance.volume = config?.volume || 1;
    utterance.lang = config?.language || "en-US";

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorEvent = event as any;
      setError(`Speech synthesis error: ${errorEvent.error}`);
      setIsSpeaking(false);
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [config, isClient]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  // Check if browser supports Web Speech API
  const isSpeechRecognitionSupported = useCallback(() => {
    if (!isClient) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }, [isClient]);

  // Check if browser supports Web Speech Synthesis API
  const isSpeechSynthesisSupported = useCallback(() => {
    if (!isClient) return false;
    return !!window.speechSynthesis;
  }, [isClient]);

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
    isSpeechRecognitionSupported: isSpeechRecognitionSupported(),
    isSpeechSynthesisSupported: isSpeechSynthesisSupported(),
  };
}
