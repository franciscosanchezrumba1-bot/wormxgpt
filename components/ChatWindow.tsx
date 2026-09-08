import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Terminal, Sparkles, ShieldAlert, Cpu, Eye, ArrowDown, Loader2,
  ArrowRightLeft, CheckCircle, XCircle, Zap, Activity
} from 'lucide-react';
import { useWormGPT } from '../context/GlobalContext';
import { ChatMessage } from './ChatMessage';
import { SUGGESTED_PROMPTS } from '../constants';

// ── Live Generation Status Bar ────────────────────────────────────────────────
const GenerationStatusBar: React.FC<{
  model: string;
  provider: string;
  activeToolCalling?: string | null;
  isFree?: boolean;
}> = ({ model, provider, activeToolCalling, isFree }) => (
  <div className="mx-4 sm:mx-6 md:mx-8 mb-3 px-4 py-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 shadow-lg shadow-indigo-950/30 flex items-center justify-between text-xs font-mono">
    <div className="flex items-center gap-3 min-w-0">
      {/* Pulsing dot */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-400" />
      </span>

      {activeToolCalling ? (
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-300 font-semibold">Tool:</span>
          <span className="text-amber-200 font-bold truncate">{activeToolCalling}</span>
          <span className="text-slate-500 animate-pulse">executing...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-slate-400">Generating via</span>
          <span className="text-indigo-200 font-bold truncate">{model}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">{provider}</span>
        </div>
      )}
    </div>

    <div className="flex items-center gap-2 shrink-0">
      {isFree && (
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px]">
          FREE
        </span>
      )}
      <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 text-[10px] animate-pulse">
        STREAMING
      </span>
    </div>
  </div>
);

// ── Fallback Event Card ────────────────────────────────────────────────────────
const FallbackEventCard: React.FC<{
  failed: string;
  succeeded: string;
  reason: string;
  onDismiss: () => void;
}> = ({ failed, succeeded, reason, onDismiss }) => (
  <div className="mx-4 sm:mx-6 md:mx-8 mb-3 px-3 py-2.5 rounded-xl bg-amber-950/40 border border-amber-500/25 flex items-center justify-between text-xs font-mono animate-in slide-in-from-bottom duration-300">
    <div className="flex items-center gap-2 min-w-0">
      <ArrowRightLeft className="w-4 h-4 text-amber-400 shrink-0" />
      <div className="min-w-0">
        <span className="text-amber-300 font-semibold">Auto-Fallback:</span>
        <span className="text-slate-400 ml-1.5">
          <span className="text-rose-400 line-through">{failed}</span>
          <span className="text-slate-500 mx-1">→</span>
          <span className="text-emerald-400">{succeeded}</span>
        </span>
        {reason && <span className="text-slate-500 ml-1.5 truncate">({reason.slice(0, 50)})</span>}
      </div>
    </div>
    <button onClick={onDismiss} className="text-slate-600 hover:text-slate-400 transition-colors ml-2 shrink-0">
      <XCircle className="w-3.5 h-3.5" />
    </button>
  </div>
);

export const ChatWindow: React.FC<{
  onOpenModelSelector?: (mode?: 'text' | 'vision') => void;
}> = ({ onOpenModelSelector }) => {
  const {
    activeSession, settings, isStreaming, activeToolCalling, setInput,
    activeGeneratingModel, activeGeneratingProvider
  } = useWormGPT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef<boolean>(false);
  const [showScrollBottom, setShowScrollBottom] = useState<boolean>(false);
  const [fallbackEvent, setFallbackEvent] = useState<{ failed: string; succeeded: string; reason: string } | null>(null);

  const messages = useMemo(() => activeSession.messages, [activeSession.messages]);
  const lastMessage = messages[messages.length - 1];
  const lastMessageContent = lastMessage?.content;

  // Check for fallback in the last message's routing events
  useEffect(() => {
    if (lastMessage?.routingEvents) {
      const fallback = lastMessage.routingEvents.find(e => e.type === 'fallback');
      const success = lastMessage.routingEvents.find(e => e.type === 'success');
      if (fallback && success) {
        setFallbackEvent({
          failed: fallback.provider,
          succeeded: success.provider,
          reason: fallback.error || 'Provider unavailable'
        });
      }
    }
  }, [lastMessage?.routingEvents]);

  // Clear fallback event after 8 seconds
  useEffect(() => {
    if (fallbackEvent) {
      const timer = setTimeout(() => setFallbackEvent(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [fallbackEvent]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isUp = distanceFromBottom > 70;
    userScrolledUp.current = isUp;
    setShowScrollBottom(distanceFromBottom > 160);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (!scrollRef.current) return;
    userScrolledUp.current = false;
    setShowScrollBottom(false);
    if (smooth) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    } else {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    userScrolledUp.current = false;
    scrollToBottom(true);
  }, [messages.length, activeSession.id, scrollToBottom]);

  useEffect(() => {
    if (isStreaming && !userScrolledUp.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lastMessageContent, isStreaming]);

  const generatingModel = activeGeneratingModel || settings.model;
  const generatingProvider = activeGeneratingProvider || settings.aiProvider;
  const isFreeModel = lastMessage?.generatedBy?.isFree;

  return (
    <div className="flex-1 overflow-hidden flex flex-col relative bg-[#090d16] font-sans">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar relative z-10 select-text"
      >
        <div className="max-w-4xl mx-auto min-h-full flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-300">
              {/* Terminal Logo */}
              <div className="mb-6 relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-950/40">
                  <Terminal className="w-8 h-8" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#090d16] flex items-center justify-center">
                  <Activity className="w-2 h-2 text-white" />
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-100 mb-2">
                WormGPT Terminal & Model Harness
              </h2>
              <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                Full whitebox AI — see every model, provider, tool call, and routing decision in real time. Multi-provider fallback, 50+ AI providers.
              </p>

              {/* Whitebox Legend */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-5 text-[11px] font-mono">
                <span className="px-2 py-1 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
                  [model] shown per message
                </span>
                <span className="px-2 py-1 rounded bg-amber-950/40 border border-amber-500/25 text-amber-300">
                  Tool calls visible
                </span>
                <span className="px-2 py-1 rounded bg-emerald-950/40 border border-emerald-500/25 text-emerald-300">
                  FREE models marked ✓
                </span>
              </div>

              {/* Active Config Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                <div
                  onClick={() => onOpenModelSelector?.('text')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer hover:border-indigo-500/50 transition-all"
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Text: {settings.model}</span>
                  <span className="text-slate-500 text-[10px]">({settings.aiProvider})</span>
                </div>

                <div
                  onClick={() => onOpenModelSelector?.('vision')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer hover:border-violet-500/50 transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-violet-400" />
                  <span>Vision: {settings.visionModel || 'gemini-2.5-flash'}</span>
                </div>

                {settings.autoFallback && (
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Auto-Fallback ON</span>
                  </div>
                )}

                {settings.systemOverride && (
                  <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>System Override Active</span>
                  </div>
                )}
              </div>

              {/* Quick Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl px-4 text-left">
                {SUGGESTED_PROMPTS.slice(0, 4).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(p)}
                    className="p-3.5 bg-slate-900/40 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-xs text-slate-300 hover:text-slate-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{p}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-20 select-text">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={`${msg.timestamp || i}-${i}`}
                  message={msg}
                  settings={settings}
                  isGenerating={isStreaming && i === messages.length - 1 && (msg.role === 'model' || msg.role === 'assistant')}
                  activeToolCalling={isStreaming && i === messages.length - 1 ? activeToolCalling : null}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fallback Event Notification */}
      {fallbackEvent && !isStreaming && (
        <FallbackEventCard
          failed={fallbackEvent.failed}
          succeeded={fallbackEvent.succeeded}
          reason={fallbackEvent.reason}
          onDismiss={() => setFallbackEvent(null)}
        />
      )}

      {/* Live Generation Status Bar */}
      {isStreaming && (
        <GenerationStatusBar
          model={generatingModel}
          provider={String(generatingProvider)}
          activeToolCalling={activeToolCalling}
          isFree={isFreeModel}
        />
      )}

      {/* Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-6 right-6 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-950/60 hover:scale-105 active:scale-95 transition-all z-20 flex items-center justify-center"
          title="Scroll to latest message"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ChatWindow;
