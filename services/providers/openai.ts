import { IModelProvider, ProviderConnectionResult } from './types';
import { AppSettings, Message, StreamChunk } from '../../types';
import { openaiService } from '../openai';

export const openaiProvider: IModelProvider = {
  id: 'openai',
  name: 'OpenAI (GPT-4o & o-series Reasoning)',
  description: 'GPT-4o, o3, o4-mini, gpt-4.1 — flagship multimodal + frontier reasoning',
  requiresApiKey: true,
  apiKeyField: 'openaiApiKey',
  docsUrl: 'https://platform.openai.com/api-keys',
  models: [
    // ── GPT-4o Series ─────────────────────────────────────────────────────────
    {
      id: 'gpt-4o',
      label: 'GPT-4o (Latest, Multimodal)',
      contextWindow: 128000,
      tags: ['vision', 'fast', 'code'],
      description: 'Flagship multimodal — text, image, audio in one model'
    },
    {
      id: 'gpt-4o-mini',
      label: 'GPT-4o Mini (Affordable Fast)',
      contextWindow: 128000,
      tags: ['fast', 'vision', 'code'],
      description: 'Small, smart, fast — 60% cheaper than GPT-4o'
    },
    {
      id: 'chatgpt-4o-latest',
      label: 'ChatGPT-4o Latest (Continuously Updated)',
      contextWindow: 128000,
      tags: ['vision', 'fast', 'code'],
      description: 'Dynamically updated GPT-4o build — always latest'
    },
    // ── GPT-4.1 Series (2025) ─────────────────────────────────────────────────
    {
      id: 'gpt-4.1',
      label: 'GPT-4.1 ✦ (Apr 2025 Best Coding)',
      contextWindow: 1048576,
      tags: ['code', 'long-context', 'vision'],
      description: 'Best coding model — 1M context, improved instruction following'
    },
    {
      id: 'gpt-4.1-mini',
      label: 'GPT-4.1 Mini ✦ (Apr 2025 Fast)',
      contextWindow: 1048576,
      tags: ['fast', 'code', 'long-context'],
      description: 'Fastest GPT-4.1 variant — great balance of speed and quality'
    },
    {
      id: 'gpt-4.1-nano',
      label: 'GPT-4.1 Nano ✦ (Apr 2025 Cheapest)',
      contextWindow: 1048576,
      tags: ['fast', 'free'],
      description: 'Most cost-efficient OpenAI model with 1M context'
    },
    // ── o-series Reasoning ────────────────────────────────────────────────────
    {
      id: 'o3',
      label: 'o3 ✦ (2025 Frontier Reasoning)',
      contextWindow: 200000,
      tags: ['reasoning', 'long-context', 'code'],
      description: 'Most powerful reasoning model — SOTA on math, science, coding'
    },
    {
      id: 'o4-mini',
      label: 'o4-mini ✦ (2025 Fast Reasoning)',
      contextWindow: 200000,
      tags: ['reasoning', 'fast', 'code'],
      description: 'Fast efficient reasoning — best o-mini performance ever'
    },
    {
      id: 'o3-mini',
      label: 'o3-mini (High Speed Reasoning)',
      contextWindow: 200000,
      tags: ['reasoning', 'code', 'fast'],
      description: 'High-speed STEM reasoning model'
    },
    {
      id: 'o1',
      label: 'o1 (Full Chain-of-Thought)',
      contextWindow: 200000,
      tags: ['reasoning', 'long-context'],
      description: 'Full deep reasoning for complex workflows'
    },
    {
      id: 'o1-mini',
      label: 'o1-mini (Fast Reasoning)',
      contextWindow: 128000,
      tags: ['reasoning', 'fast', 'code'],
      description: 'Fast o1 variant for code and STEM tasks'
    },
    // ── GPT-4 Legacy ──────────────────────────────────────────────────────────
    {
      id: 'gpt-4-turbo',
      label: 'GPT-4 Turbo (128k Legacy)',
      contextWindow: 128000,
      tags: ['code', 'vision', 'long-context'],
      description: '128k context vision-capable GPT-4'
    }
  ],
  async testConnection(settings: AppSettings): Promise<ProviderConnectionResult> {
    const key = settings.openaiApiKey;
    if (!key) {
      return { success: false, message: 'OpenAI API key is missing. Get one at https://platform.openai.com/api-keys' };
    }
    const start = Date.now();
    try {
      const valid = await openaiService.verifyApiKey(key);
      const latency = Date.now() - start;
      if (valid) {
        return { success: true, message: `Connected to OpenAI (${latency}ms) — 12 models including o3, o4-mini, GPT-4.1`, latencyMs: latency, modelsCount: 12 };
      }
      return { success: false, message: 'OpenAI authentication failed — invalid key' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'OpenAI connection test failed' };
    }
  },
  async *streamChat(settings: AppSettings, messages: Message[], signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    yield* openaiService.streamChat(settings, messages, signal);
  }
};
