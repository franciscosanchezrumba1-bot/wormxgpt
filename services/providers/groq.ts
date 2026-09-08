import { IModelProvider, ProviderConnectionResult } from './types';
import { AppSettings, Message, StreamChunk } from '../../types';
import { groqService } from '../groq';

export const groqProvider: IModelProvider = {
  id: 'groq',
  name: 'Groq Cloud (Ultra LPU — FREE)',
  description: 'World\'s fastest inference — 300-2000 tokens/sec LPU, free tier, Llama 4 Scout',
  requiresApiKey: false,
  apiKeyField: 'groqApiKey',
  docsUrl: 'https://console.groq.com/keys',
  models: [
    // ── Llama 4 Series (2025 Latest) ──────────────────────────────────────────
    {
      id: 'meta-llama/llama-4-scout-17b-16e-instruct',
      label: 'Llama 4 Scout 17B ✦ (2025 Multimodal Free)',
      contextWindow: 131072,
      tags: ['fast', 'vision', 'code', 'free'],
      isFree: true,
      description: 'Meta\'s Llama 4 Scout with vision — fast free multimodal'
    },
    {
      id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      label: 'Llama 4 Maverick 17B ✦ (2025 Vision)',
      contextWindow: 131072,
      tags: ['fast', 'vision', 'code', 'free'],
      isFree: true,
      description: 'Llama 4 Maverick mixture-of-experts vision model'
    },
    // ── Llama 3.3 / 3.2 / 3.1 ────────────────────────────────────────────────
    {
      id: 'llama-3.3-70b-versatile',
      label: 'Llama 3.3 70B Versatile (FREE, 300 tps)',
      contextWindow: 128000,
      tags: ['fast', 'code', 'long-context', 'free'],
      isFree: true,
      description: 'Ultra-fast 70B model on LPU — best free general purpose'
    },
    {
      id: 'llama-3.3-70b-specdec',
      label: 'Llama 3.3 70B SpecDec (Fastest 70B)',
      contextWindow: 8192,
      tags: ['fast', 'code', 'free'],
      isFree: true,
      description: 'Speculative decoding accelerated — extreme throughput mode'
    },
    {
      id: 'llama-3.2-90b-vision-preview',
      label: 'Llama 3.2 90B Vision (FREE, Multimodal)',
      contextWindow: 128000,
      tags: ['vision', 'fast', 'free'],
      isFree: true,
      description: 'Largest free vision model on Groq LPU'
    },
    {
      id: 'llama-3.2-11b-vision-preview',
      label: 'Llama 3.2 11B Vision (FREE)',
      contextWindow: 128000,
      tags: ['vision', 'fast', 'free'],
      isFree: true,
      description: 'Fast free multimodal vision on LPU'
    },
    {
      id: 'llama-3.1-8b-instant',
      label: 'Llama 3.1 8B Instant (FREE, 800+ tps)',
      contextWindow: 128000,
      tags: ['fast', 'free'],
      isFree: true,
      description: 'Sub-second latency — 800+ tokens/sec on LPU silicon'
    },
    {
      id: 'llama-3.2-3b-preview',
      label: 'Llama 3.2 3B Preview (FREE Instant)',
      contextWindow: 128000,
      tags: ['fast', 'free'],
      isFree: true,
      description: 'Ultra-light compact model — instantaneous responses'
    },
    {
      id: 'llama-3.2-1b-preview',
      label: 'Llama 3.2 1B Preview (FREE Fastest)',
      contextWindow: 128000,
      tags: ['fast', 'free'],
      isFree: true,
      description: 'Fastest model on Groq — 2000+ tps'
    },
    // ── DeepSeek Distillation (Groq LPU) ─────────────────────────────────────
    {
      id: 'deepseek-r1-distill-llama-70b',
      label: 'DeepSeek R1 Distill Llama 70B (FREE Reasoning)',
      contextWindow: 128000,
      tags: ['reasoning', 'fast', 'code', 'free'],
      isFree: true,
      description: 'DeepSeek chain-of-thought distilled into fast LPU silicon'
    },
    {
      id: 'deepseek-r1-distill-qwen-32b',
      label: 'DeepSeek R1 Distill Qwen 32B',
      contextWindow: 128000,
      tags: ['reasoning', 'fast', 'code', 'free'],
      isFree: true,
      description: 'Qwen-based DeepSeek R1 distillation'
    },
    // ── Other Models ──────────────────────────────────────────────────────────
    {
      id: 'mixtral-8x7b-32768',
      label: 'Mixtral 8x7B (FREE, MoE)',
      contextWindow: 32768,
      tags: ['fast', 'code', 'free'],
      isFree: true,
      description: 'Sparse MoE model — great multilingual performance'
    },
    {
      id: 'gemma2-9b-it',
      label: 'Gemma 2 9B Instruct (FREE)',
      contextWindow: 8192,
      tags: ['fast', 'code', 'free'],
      isFree: true,
      description: 'Google open weights model on LPU'
    },
    {
      id: 'qwen-2.5-coder-32b',
      label: 'Qwen 2.5 Coder 32B (Groq)',
      contextWindow: 128000,
      tags: ['code', 'fast'],
      description: 'Best-in-class open coding model on LPU silicon'
    },
    {
      id: 'compound-beta',
      label: 'Compound Beta (Agentic Multi-Step)',
      contextWindow: 128000,
      tags: ['reasoning', 'code'],
      description: 'Groq compound model for multi-step agentic tasks'
    },
    {
      id: 'compound-beta-mini',
      label: 'Compound Beta Mini (Fast Agentic)',
      contextWindow: 128000,
      tags: ['fast', 'code'],
      description: 'Fast compound model — lightweight agentic tasks'
    }
  ],
  async testConnection(settings: AppSettings): Promise<ProviderConnectionResult> {
    const key = settings.groqApiKey || (typeof process !== 'undefined' ? process.env?.GROQ_API_KEY : '') || '';
    if (!key) {
      return { success: false, message: 'Groq API key needed for full access — free at https://console.groq.com/keys' };
    }
    const start = Date.now();
    try {
      const valid = await groqService.verifyApiKey(key);
      const latency = Date.now() - start;
      if (valid) {
        return { success: true, message: `Connected to Groq LPU (${latency}ms) — 16 models, all free tier`, latencyMs: latency, modelsCount: 16 };
      }
      return { success: false, message: 'Groq key rejected — get free key at console.groq.com' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Groq connection test failed' };
    }
  },
  async *streamChat(settings: AppSettings, messages: Message[], signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    yield* groqService.streamChat(settings, messages, signal);
  }
};
