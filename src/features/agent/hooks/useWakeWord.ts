import { usePorcupine } from "@picovoice/porcupine-react";
import { useEffect, useState } from "react";

// You can use the standard "Jarvis" keyword provided by Picovoice or train your own.
const JARVIS_KEYWORD = { publicPath: "/keywords/jarvis_wasm.ppn", label: "jarvis" }; // You will need to download the .ppn file or use the built-in 'Jarvis' if available in their default list.
// FOR MVP: Use the built-in "Porcupine" or "Jarvis" keyword model provided in the SDK docs.

export const useWakeWord = () => {
  const [isWakeWordDetected, setIsWakeWordDetected] = useState(false);

  const {
    keywordDetection,
    isLoaded,
    isListening,
    error,
    start,
    stop,
  } = usePorcupine(
    // @ts-ignore
    {
      accessKey: process.env.NEXT_PUBLIC_PICOVOICE_KEY || "", // READ FROM ENV
      keyword: { builtin: "Jarvis" }, // Use Built-in Jarvis
      onDetection: () => {
        console.log("🔥 JARVIS HEARD!");
        setIsWakeWordDetected(true);
      },
    });

  return {
    isWakeWordDetected,
    setIsWakeWordDetected,
    startWakeWord: start,
    stopWakeWord: stop,
    isLoaded,
    error
  };
};