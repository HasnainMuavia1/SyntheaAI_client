// src/features/agent/hooks/useVoiceAgent.ts
import { useState, useEffect, useRef, useCallback } from 'react';

type AgentState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';

interface UseVoiceAgentReturn {
  state: AgentState;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
}

export const useVoiceAgent = (): UseVoiceAgentReturn => {
  const [state, setState] = useState<AgentState>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const finalTranscriptRef = useRef<string>('');

  const stopListening = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (state === 'LISTENING') {
      setState('IDLE');
    }
  }, [state]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const buildWsUrl = () => {
    const isSecure = window.location.protocol === 'https:';
    const wsProtocol = isSecure ? 'wss:' : 'ws:';

    // Prefer explicit WS URL if provided
    if (process.env.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }

    // Derive from API base URL when available (keeps host/port consistent with Django)
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      try {
        const apiUrl = new URL(process.env.NEXT_PUBLIC_API_BASE_URL);
        return `${wsProtocol}//${apiUrl.host}/ws/voice/`;
      } catch {
        // fall through to default
      }
    }

    // Fallback: assume Django on port 8000 with Channels routing at /ws/voice/
    return `${wsProtocol}//${window.location.hostname}:8000/ws/voice/`;
  };

  const startListening = useCallback(async () => {
    try {
      if (wsRef.current) {
        stopListening();
      }

      setTranscript('');
      finalTranscriptRef.current = '';
      setError(null);
      setState('LISTENING');

      // 1. Connect WebSocket
      // Do NOT set wsRef.current yet: React Strict Mode unmounts and runs cleanup,
      // which would close this socket before it's open. Set it only after onopen.
      const wsUrl = buildWsUrl();
      const ws = new WebSocket(wsUrl);
      let wsOpened = false;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.data && data.data.text) {
            const newText = data.data.text.trim();
            if (!data.is_partial) {
              finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + newText;
            }
            setTranscript((finalTranscriptRef.current + (data.is_partial ? ' ' + newText : '')).trim());
          }
        } catch (e) {
          console.error(e);
        }
      };

      // Wait for WS to be ready, fail fast on error/close instead of pure timeout
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          if (!wsOpened) {
            ws.close();
            reject(new Error("WS Timeline Timeout"));
          }
        }, 5000);

        ws.onopen = () => {
          wsOpened = true;
          clearTimeout(timeoutId);
          wsRef.current = ws; // Only now: cleanup can safely close this if user stops
          resolve();
        };

        ws.onerror = (e) => {
          console.error("Voice WebSocket Error:", e);
          clearTimeout(timeoutId);
          setError("WebSocket connection failed. Ensure backend is running.");
          setState('ERROR');
          if (!wsOpened) {
            reject(new Error("WebSocket failed to connect"));
          }
        };

        ws.onclose = () => {
          clearTimeout(timeoutId);
          wsRef.current = null;
          if (!wsOpened) {
            reject(new Error("WebSocket closed before opening"));
          }
          if (state === 'LISTENING') {
            setState('IDLE');
            stopListening();
          }
        };
      });

      // 2. Get Mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Setup AudioContext 
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);

      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const float32Array = e.inputBuffer.getChannelData(0);

          // Convert to PCM int16
          const int16Array = new Int16Array(float32Array.length);
          for (let i = 0; i < float32Array.length; i++) {
            let s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          ws.send(int16Array.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

    } catch (e: any) {
      console.error("Failed to start listening:", e);
      setError(e.message || "Microphone error");
      setState('ERROR');
      stopListening();
    }
  }, [stopListening, state]);

  const reset = useCallback(() => {
    setState('IDLE');
    setTranscript('');
    finalTranscriptRef.current = '';
    setError(null);
    stopListening();
  }, [stopListening]);

  return {
    state,
    transcript,
    error,
    startListening,
    stopListening,
    reset
  };
};