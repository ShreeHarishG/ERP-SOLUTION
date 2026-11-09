'use client';

// =============================================================================
// ChainIQ ERP — Gnani AI Voice Mic Component
// Supports Flow 1 (Voice Q&A) & Flow 2 (Voice-Explained Risk Briefing)
// =============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2, Play, Pause, RotateCcw, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';
import { WavAudioRecorder } from '@/lib/voice-recorder';

export interface VoiceResult {
  transcript: string;
  response: string;
  audioUrl: string;
  detectedLanguage?: string;
  riskScore?: string;
  riskTier?: string;
  entityName?: string;
}

interface VoiceMicButtonProps {
  mode?: 'query' | 'risk';
  entityId?: string;
  variant?: 'pill' | 'button' | 'compact';
  onResult?: (result: VoiceResult) => void;
  className?: string;
}

export default function VoiceMicButton({
  mode = 'query',
  entityId,
  variant = 'button',
  onResult,
  className = '',
}: VoiceMicButtonProps) {
  const [activeMode, setActiveMode] = useState<'query' | 'risk'>(mode);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastResult, setLastResult] = useState<VoiceResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<WavAudioRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync mode prop when changed externally
  useEffect(() => {
    setActiveMode(mode);
  }, [mode]);

  // Clean up timer and audio on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recorderRef.current) recorderRef.current.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const recorder = new WavAudioRecorder();
      recorderRef.current = recorder;

      await recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 25) {
            // Auto stop after 25s
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('[VoiceMic] Microphone access error:', err);
      setErrorMessage('Microphone access denied or unavailable.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current || !isRecording) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setIsProcessing(true);

    try {
      const wavBlob = await recorderRef.current.stop();

      // Submit to appropriate endpoint
      const targetEndpoint = activeMode === 'risk'
        ? '/api/voice/risk-briefing'
        : '/api/voice/query';

      const formData = new FormData();
      formData.append('audio_file', wavBlob, 'recording.wav');
      if (activeMode === 'risk' && entityId) {
        formData.append('entity_id', entityId);
      }

      const res = await fetch(targetEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Voice server error: ${res.statusText}`);
      }

      // Extract metadata headers
      const rawTranscript = res.headers.get('x-transcript') || '';
      const rawAnswer = res.headers.get('x-response-text') || res.headers.get('x-spoken-briefing') || '';
      const detectedLang = res.headers.get('x-language-detected') || 'en-IN';
      const entityName = res.headers.get('x-entity-name') || '';
      const riskScore = res.headers.get('x-risk-score') || '';
      const riskTier = res.headers.get('x-risk-tier') || '';

      const transcript = decodeURIComponent(rawTranscript) || 'Voice command received';
      const response = decodeURIComponent(rawAnswer) || 'ERP intelligence briefing synthesized.';

      // Get audio blob and create local object URL
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const result: VoiceResult = {
        transcript,
        response,
        audioUrl,
        detectedLanguage: detectedLang,
        entityName: decodeURIComponent(entityName),
        riskScore,
        riskTier,
      };

      setLastResult(result);
      if (onResult) onResult(result);

      // Play audio automatically
      playAudio(audioUrl);
    } catch (err: any) {
      console.error('[VoiceMic] Processing failed:', err);
      setErrorMessage(err.message || 'Speech processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsPlaying(true);

    audio.onended = () => {
      setIsPlaying(false);
    };

    audio.onerror = () => {
      setIsPlaying(false);
    };

    audio.play().catch((err) => {
      console.warn('[Audio autoplay prevented]:', err);
      setIsPlaying(false);
    });
  };

  const toggleAudio = () => {
    if (!lastResult?.audioUrl) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        playAudio(lastResult.audioUrl);
      }
    }
  };

  // Compact Variant (Used inside Topbar / Chat input)
  if (variant === 'compact') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`p-2 rounded-xl transition-all flex items-center justify-center relative shadow-sm ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
              : isProcessing
              ? 'bg-amber-100 text-amber-700'
              : 'bg-[#4B164C]/10 text-[#4B164C] hover:bg-[#4B164C]/20 hover:scale-105'
          }`}
          title={isRecording ? 'Click to stop recording' : 'Click to speak via Gnani AI'}
        >
          {isProcessing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isRecording ? (
            <Square size={16} className="fill-current text-white" />
          ) : (
            <Mic size={16} />
          )}
        </button>

        {isRecording && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-mono font-bold rounded-md shadow-md animate-bounce">
            0:{recordingSeconds.toString().padStart(2, '0')}
          </span>
        )}
      </div>
    );
  }

  // Pill Variant (Topbar or action bar)
  if (variant === 'pill') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs border ${
            isRecording
              ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-400/40 animate-pulse'
              : isProcessing
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-white border-[#4B164C]/20 text-[#4B164C] hover:bg-[#F8E7F6]/50'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 size={14} className="animate-spin text-amber-600" />
              <span>Transcribing...</span>
            </>
          ) : isRecording ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span>Listening ({recordingSeconds}s)</span>
            </>
          ) : (
            <>
              <Mic size={14} className="text-[#4B164C]" />
              <span>Voice Copilot</span>
            </>
          )}
        </button>

        {lastResult && (
          <button
            type="button"
            onClick={toggleAudio}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title={isPlaying ? 'Pause Audio' : 'Replay Answer'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
        )}
      </div>
    );
  }

  // Standard Button Variant (Full Interactive Station)
  return (
    <div className={`flex flex-col gap-3 p-4 bg-white border border-surface-border rounded-2xl shadow-xs ${className}`}>
      {/* Mode Selector Toggle */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F8E7F6] flex items-center justify-center text-[#4B164C]">
            <Sparkles size={15} />
          </div>
          <div>
            <span className="text-xs font-bold text-text-primary block">Gnani AI Voice Station</span>
            <span className="text-[10px] text-text-muted">Prisma STT v3.0 + Timbre TTS</span>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setActiveMode('query')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeMode === 'query'
                ? 'bg-white text-[#4B164C] font-semibold shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            ERP Q&A
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('risk')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeMode === 'risk'
                ? 'bg-white text-rose-700 font-semibold shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Risk Briefing
          </button>
        </div>
      </div>

      {/* Main Recording Interactive Bar */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md relative group ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300'
                : isProcessing
                ? 'bg-amber-500 text-white cursor-not-allowed'
                : 'bg-gradient-to-br from-[#4B164C] to-[#6d256f] text-white hover:shadow-lg hover:scale-105'
            }`}
          >
            {isProcessing ? (
              <Loader2 size={22} className="animate-spin" />
            ) : isRecording ? (
              <Square size={20} className="fill-current" />
            ) : (
              <Mic size={22} className="group-hover:scale-110 transition-transform" />
            )}
          </button>

          <div>
            <p className="text-xs font-semibold text-text-primary">
              {isRecording
                ? 'Listening to microphone...'
                : isProcessing
                ? 'Synthesizing with Gnani Voice Stack...'
                : activeMode === 'risk'
                ? 'Ask about supplier or shipment risk'
                : 'Ask anything about inventory, revenue or KPIs'}
            </p>
            <p className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
              {isRecording ? (
                <span className="text-rose-600 font-mono font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping inline-block" />
                  Recording: 0:{recordingSeconds.toString().padStart(2, '0')} (Click button to finish)
                </span>
              ) : isProcessing ? (
                <span className="text-amber-700 font-medium">Prisma v3.0 REST inference in progress</span>
              ) : (
                <span>English & Indic languages supported (auto-detect)</span>
              )}
            </p>
          </div>
        </div>

        {lastResult && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isPlaying
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-surface-border text-text-primary hover:bg-slate-50'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause size={14} className="text-emerald-600" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Volume2 size={14} className="text-[#4B164C]" />
                  <span>Play Answer</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Results Display Card */}
      {lastResult && (
        <div className="mt-2 p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-text-muted flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Transcribed Voice Query ({lastResult.detectedLanguage || 'en-IN'}):
            </span>
            {lastResult.riskTier && (
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                  lastResult.riskTier.toLowerCase() === 'critical'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : lastResult.riskTier.toLowerCase() === 'high'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {lastResult.riskTier} Risk ({lastResult.riskScore}/100)
              </span>
            )}
          </div>

          <p className="text-xs font-medium text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200">
            &ldquo;{lastResult.transcript}&rdquo;
          </p>

          <div className="text-[11px] font-semibold text-text-muted flex items-center gap-1.5 pt-1">
            <Volume2 size={13} className="text-[#4B164C]" />
            Spoken Intelligence Output (Gnani Timbre v3.0 — Voice: Shivani):
          </div>

          <p className="text-xs text-text-primary leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
            {lastResult.response}
          </p>

          {/* Standard HTML5 Audio Element */}
          <div className="pt-1">
            <span className="text-[10px] text-text-muted font-medium block mb-1">Standard Audio Player:</span>
            <audio
              controls
              src={lastResult.audioUrl}
              className="w-full h-8 rounded-lg outline-none"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      )}
    </div>
  );
}

