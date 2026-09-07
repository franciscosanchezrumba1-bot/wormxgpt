import { IModelProvider, ProviderConnectionResult } from './types';
import { AppSettings, Message, StreamChunk } from '../../types';
import { geminiService } from '../gemini';

export const geminiProvider: IModelProvider = {
  id: 'gemini',
  name: 'Google Gemini',
  description: 'Gemini 2.5 Pro/Flash — Multimodal with 1M-2M context, free tier available',
  requiresApiKey: false,
  apiKeyField: 'geminiApiKey',
  docsUrl: 'https://aistudio.google.com/app/apikey',
  models: [
    // ── Gemini 2.5 Series (2025 Latest) ───────────────────────────────────────
    {
      id: 'gemini-2.5-pro',
      label: 'Gemini 2.5 Pro ✦ (Jun 2025 Best Reasoning)',
      contextWindow: 2097152,
      tags: ['reasoning', 'vision', 'long-context', 'code'],
      description: 'Best-in-class multimodal model — #1 on benchmarks, 2M context, thinking'
    },
    {
      id: 'gemini-2.5-flash',
      label: 'Gemini 2.5 Flash ✦ (2025 Recommended Fast)',
      contextWindow: 1048576,
      tags: ['fast', 'vision', 'long-context', 'code', 'free'],
      description: 'Best price-performance — 1M context, thinking, fast multimodal',
      isFree: true
    },
    {
      id: 'gemini-2.5-flash-8b',
      label: 'Gemini 2.5 Flash 8B (Ultra Lite)',
      contextWindow: 1048576,
      tags: ['fast', 'free'],
      description: 'Smallest fastest Gemini 2.5 — ideal for high-frequency lightweight tasks',
      isFree: true
    },
    // ── Gemini 2.0 Series ─────────────────────────────────────────────────────
    {
      id: 'gemini-2.0-flash',
      label: 'Gemini 2.0 Flash (Free, Native Tools)',
      contextWindow: 1048576,
      tags: ['fast', 'vision', 'code', 'free'],
      isFree: true,
      description: 'Free, fast, multimodal with native search/code tools'
    },
    {
      id: 'gemini-2.0-flash-lite',
      label: 'Gemini 2.0 Flash-Lite (Free Instant)',
      contextWindow: 1048576,
      tags: ['fast', 'free'],
      isFree: true,
      description: 'Fastest lightweight free Gemini for cost-sensitive workloads'
    },
    {
      id: 'gemini-2.0-flash-thinking-exp',
      label: 'Gemini 2.0 Flash Thinking Exp (Chain-of-Thought)',
      contextWindow: 1048576,
      tags: ['reasoning', 'code', 'vision'],
      description: 'Experimental reasoning that exposes internal thinking tokens'
    },
    {
      id: 'gemini-2.0-pro-exp',
      label: 'Gemini 2.0 Pro Experimental',
      contextWindow: 2097152,
      tags: ['reasoning', 'vision', 'long-context', 'code'],
      description: 'Experimental Pro-class 2.0 model with extended reasoning'
    },
    // ── Gemini 1.5 Series ─────────────────────────────────────────────────────
    {
      id: 'gemini-1.5-pro',
      label: 'Gemini 1.5 Pro (2M Context Legacy)',
      contextWindow: 2097152,
      tags: ['vision', 'long-context', 'code'],
      description: 'Stable production 2M context multimodal model'
    },
    {
      id: 'gemini-1.5-flash',
      label: 'Gemini 1.5 Flash (1M Context Legacy)',
      contextWindow: 1048576,
      tags: ['fast', 'vision'],
      description: 'Lightweight high-speed 1M context'
    },
    {
      id: 'gemini-1.5-flash-8b',
      label: 'Gemini 1.5 Flash-8B (Compact)',
      contextWindow: 1048576,
      tags: ['fast', 'free'],
      isFree: true,
      description: 'Smallest fastest 1.5 Flash — ideal for summarization and classification'
    }
  ],
  async testConnection(settings: AppSettings): Promise<ProviderConnectionResult> {
    const key = settings.geminiApiKey || (typeof process !== 'undefined' ? (process.env?.GEMINI_API_KEY || process.env?.API_KEY) : '') || '';
    if (!key) {
      return { success: false, message: 'Gemini API key not configured. Get free key at https://aistudio.google.com/app/apikey' };
    }
    const start = Date.now();
    try {
      const valid = await geminiService.verifyApiKey(key);
      const latency = Date.now() - start;
      if (valid) {
        return { success: true, message: `Connected to Google Gemini (${latency}ms) — 10 models available, free tier active`, latencyMs: latency, modelsCount: 10 };
      }
      return { success: false, message: 'Gemini API key validation failed — check key at aistudio.google.com' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gemini connection test failed' };
    }
  },
  async *streamChat(settings: AppSettings, messages: Message[], signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    yield* geminiService.streamChat(settings, messages, signal);
  }
};
