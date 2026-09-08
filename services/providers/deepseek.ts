import { IModelProvider, ProviderConnectionResult } from './types';
import { AppSettings, Message, StreamChunk } from '../../types';
import { deepseekService } from '../deepseek';

export const deepseekProvider: IModelProvider = {
  id: 'deepseek',
  name: 'DeepSeek AI',
  description: 'DeepSeek V3-0324 & R1 — frontier open-source 671B MoE models at low cost',
  requiresApiKey: true,
  apiKeyField: 'deepseekApiKey',
  docsUrl: 'https://platform.deepseek.com/api_keys',
  models: [
    // ── DeepSeek V3 Series ────────────────────────────────────────────────────
    {
      id: 'deepseek-chat',
      label: 'DeepSeek V3 0324 ✦ (Mar 2025 Chat/Code)',
      contextWindow: 65536,
      tags: ['fast', 'code', 'long-context'],
      description: 'Latest DeepSeek V3 — 671B MoE, best coding performance at fraction of GPT-4 cost'
    },
    // ── DeepSeek R1 Reasoning ─────────────────────────────────────────────────
    {
      id: 'deepseek-reasoner',
      label: 'DeepSeek R1 ✦ (Jan 2025 Reasoning 671B)',
      contextWindow: 65536,
      tags: ['reasoning', 'code', 'long-context'],
      description: 'Breakthrough open-source reasoning — matches o1 on benchmarks'
    },
    // ── DeepSeek R1 Distillations ─────────────────────────────────────────────
    {
      id: 'deepseek-r1-distill-qwen-32b',
      label: 'DeepSeek R1 Distill Qwen 32B',
      contextWindow: 65536,
      tags: ['reasoning', 'fast', 'code'],
      description: 'Qwen-based R1 distillation — strong reasoning in smaller footprint'
    },
    {
      id: 'deepseek-r1-distill-llama-70b',
      label: 'DeepSeek R1 Distill Llama 70B',
      contextWindow: 65536,
      tags: ['reasoning', 'code'],
      description: 'Llama-architecture R1 distillation — best open 70B reasoning'
    },
    {
      id: 'deepseek-r1-distill-qwen-14b',
      label: 'DeepSeek R1 Distill Qwen 14B',
      contextWindow: 65536,
      tags: ['reasoning', 'fast'],
      description: 'Compact 14B R1 distillation for low-resource reasoning tasks'
    },
    {
      id: 'deepseek-r1-distill-qwen-7b',
      label: 'DeepSeek R1 Distill Qwen 7B',
      contextWindow: 65536,
      tags: ['reasoning', 'fast'],
      description: 'Smallest R1 distillation — edge deployment reasoning'
    },
    // ── DeepSeek Coder ────────────────────────────────────────────────────────
    {
      id: 'deepseek-coder',
      label: 'DeepSeek Coder V2.5 (128k)',
      contextWindow: 128000,
      tags: ['code', 'fast'],
      description: 'Specialized code model — repo-level understanding, FIM, autocomplete'
    }
  ],
  async testConnection(settings: AppSettings): Promise<ProviderConnectionResult> {
    const key = settings.deepseekApiKey;
    if (!key) {
      return { success: false, message: 'DeepSeek API key missing — get one at https://platform.deepseek.com/api_keys' };
    }
    const start = Date.now();
    try {
      const valid = await deepseekService.verifyApiKey(key);
      const latency = Date.now() - start;
      if (valid) {
        return { success: true, message: `Connected to DeepSeek (${latency}ms) — 7 models, V3-0324 + R1`, latencyMs: latency, modelsCount: 7 };
      }
      return { success: false, message: 'DeepSeek API key rejected — verify at platform.deepseek.com' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'DeepSeek connection test failed' };
    }
  },
  async *streamChat(settings: AppSettings, messages: Message[], signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    yield* deepseekService.streamChat(settings, messages, signal);
  }
};
