import { IModelProvider, ProviderConnectionResult } from './types';
import { AppSettings, Message, StreamChunk } from '../../types';
import { mistralService } from '../mistral';

export const mistralProvider: IModelProvider = {
  id: 'mistral',
  name: 'Mistral AI',
  description: 'European frontier AI — Mistral Large 2411, Devstral, Codestral, Pixtral Vision',
  requiresApiKey: true,
  apiKeyField: 'mistralApiKey',
  docsUrl: 'https://console.mistral.ai/api-keys',
  models: [
    // ── Mistral Large (Flagship) ───────────────────────────────────────────────
    {
      id: 'mistral-large-latest',
      label: 'Mistral Large Latest (Flagship)',
      contextWindow: 131072,
      tags: ['reasoning', 'code', 'long-context'],
      description: 'Top-tier flagship — math, reasoning, multilingual, tool calling'
    },
    {
      id: 'mistral-large-2411',
      label: 'Mistral Large 2411 ✦ (Nov 2024)',
      contextWindow: 131072,
      tags: ['reasoning', 'code', 'long-context'],
      description: 'November 2024 Mistral Large — upgraded function calling and reasoning'
    },
    // ── Mistral Medium ────────────────────────────────────────────────────────
    {
      id: 'mistral-medium-latest',
      label: 'Mistral Medium Latest',
      contextWindow: 131072,
      tags: ['reasoning', 'code'],
      description: 'Balanced performance and cost for enterprise workloads'
    },
    // ── Codestral (Code Specialist) ───────────────────────────────────────────
    {
      id: 'codestral-latest',
      label: 'Codestral Latest (256k Code)',
      contextWindow: 256000,
      tags: ['code', 'fast', 'long-context'],
      description: 'Best Mistral code model — 256k context, code completion, FIM'
    },
    {
      id: 'codestral-2501',
      label: 'Codestral 2501 ✦ (Jan 2025, 256k)',
      contextWindow: 256000,
      tags: ['code', 'long-context'],
      description: 'Latest Codestral January 2025 — improved repo-level code tasks'
    },
    // ── Devstral (Agentic Coding) ─────────────────────────────────────────────
    {
      id: 'devstral-small-2505',
      label: 'Devstral Small 2505 ✦ (May 2025 Agentic)',
      contextWindow: 131072,
      tags: ['code', 'fast'],
      description: 'Agentic software engineering — builds, debugs, writes code autonomously'
    },
    // ── Pixtral (Vision) ──────────────────────────────────────────────────────
    {
      id: 'pixtral-large-latest',
      label: 'Pixtral Large (Vision 128k)',
      contextWindow: 131072,
      tags: ['vision', 'long-context', 'reasoning'],
      description: 'Flagship multimodal — chart, document, image analysis at scale'
    },
    {
      id: 'pixtral-12b-2409',
      label: 'Pixtral 12B (Fast Vision)',
      contextWindow: 131072,
      tags: ['vision', 'fast'],
      description: 'Lightweight multimodal with efficient image token compression'
    },
    // ── Mistral Small ─────────────────────────────────────────────────────────
    {
      id: 'mistral-small-latest',
      label: 'Mistral Small Latest',
      contextWindow: 32768,
      tags: ['fast', 'code'],
      description: 'Cost-efficient low-latency instruction model'
    },
    {
      id: 'mistral-small-2503',
      label: 'Mistral Small 2503 ✦ (Mar 2025)',
      contextWindow: 32768,
      tags: ['fast', 'code'],
      description: 'Small but mighty — competitive with larger models on benchmarks'
    },
    // ── Mistral NeMo ──────────────────────────────────────────────────────────
    {
      id: 'open-mistral-nemo',
      label: 'Mistral NeMo 12B (128k)',
      contextWindow: 131072,
      tags: ['fast', 'long-context', 'code'],
      description: 'NVIDIA-collaborated 128k multilingual model — Apache 2.0'
    },
    // ── Ministral ─────────────────────────────────────────────────────────────
    {
      id: 'ministral-8b-latest',
      label: 'Ministral 8B (Edge)',
      contextWindow: 131072,
      tags: ['fast', 'code'],
      description: 'Best-in-class edge model — device-local or low-cost cloud'
    },
    {
      id: 'ministral-3b-latest',
      label: 'Ministral 3B (Smallest, Fastest)',
      contextWindow: 131072,
      tags: ['fast'],
      description: 'Tiniest Mistral — ultra-low latency and minimal cost'
    }
  ],
  async testConnection(settings: AppSettings): Promise<ProviderConnectionResult> {
    const key = settings.mistralApiKey;
    if (!key) {
      return { success: false, message: 'Mistral API key missing — get one at https://console.mistral.ai/api-keys' };
    }
    const start = Date.now();
    try {
      const valid = await mistralService.verifyApiKey(key);
      const latency = Date.now() - start;
      if (valid) {
        return { success: true, message: `Connected to Mistral AI (${latency}ms) — 13 models including Devstral, Codestral 2501`, latencyMs: latency, modelsCount: 13 };
      }
      return { success: false, message: 'Mistral API key rejected — verify at console.mistral.ai' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Mistral connection test failed' };
    }
  },
  async *streamChat(settings: AppSettings, messages: Message[], signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    yield* mistralService.streamChat(settings, messages, signal);
  }
};
