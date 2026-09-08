import { IModelProvider, ProviderConnectionResult } from './types';
import { AppSettings, Message, StreamChunk } from '../../types';
import { anthropicService } from '../anthropic';

export const claudeProvider: IModelProvider = {
  id: 'anthropic',
  name: 'Anthropic Claude',
  description: 'Claude 4 Opus/Sonnet/Haiku — Frontier reasoning, 200K context, extended thinking',
  requiresApiKey: true,
  apiKeyField: 'anthropicApiKey',
  docsUrl: 'https://console.anthropic.com/settings/keys',
  models: [
    // ── Claude 4 Series (2025 Latest) ─────────────────────────────────────────
    {
      id: 'claude-opus-4-0',
      label: 'Claude Opus 4.0 ✦ (Jul 2025 Flagship)',
      contextWindow: 200000,
      tags: ['reasoning', 'vision', 'code', 'long-context'],
      description: 'Most intelligent Claude model — frontier multi-step reasoning, tool use, and 200K context',
      isFree: false
    },
    {
      id: 'claude-sonnet-4-5',
      label: 'Claude Sonnet 4.5 ✦ (Aug 2025 Recommended)',
      contextWindow: 200000,
      tags: ['reasoning', 'vision', 'code', 'long-context'],
      description: 'Highest performance-per-cost Claude model — excellent code, reasoning, vision',
      isFree: false
    },
    {
      id: 'claude-haiku-4-0',
      label: 'Claude Haiku 4.0 ✦ (2025 Fastest)',
      contextWindow: 200000,
      tags: ['fast', 'vision', 'code'],
      description: 'Ultra-fast Claude 4 with vision — ideal for real-time applications',
      isFree: false
    },
    // ── Claude 3.7 Series ─────────────────────────────────────────────────────
    {
      id: 'claude-3-7-sonnet-20250219',
      label: 'Claude 3.7 Sonnet (Feb 2025, Extended Thinking)',
      contextWindow: 200000,
      tags: ['reasoning', 'vision', 'code', 'long-context'],
      description: 'Hybrid reasoning — instant and chain-of-thought extended thinking modes'
    },
    {
      id: 'claude-3-7-sonnet-latest',
      label: 'Claude 3.7 Sonnet Latest (Alias)',
      contextWindow: 200000,
      tags: ['reasoning', 'vision', 'code', 'long-context'],
      description: 'Latest stable claude-3-7 alias'
    },
    // ── Claude 3.5 Series ─────────────────────────────────────────────────────
    {
      id: 'claude-3-5-sonnet-20241022',
      label: 'Claude 3.5 Sonnet (Oct 2024)',
      contextWindow: 200000,
      tags: ['vision', 'code', 'long-context'],
      description: 'State-of-the-art coding and vision reasoning'
    },
    {
      id: 'claude-3-5-haiku-20241022',
      label: 'Claude 3.5 Haiku (Oct 2024 Fast)',
      contextWindow: 200000,
      tags: ['fast', 'code'],
      description: 'Fastest Claude 3.5 for real-time tool-calling pipelines'
    },
    {
      id: 'claude-3-5-sonnet-latest',
      label: 'Claude 3.5 Sonnet Latest (Alias)',
      contextWindow: 200000,
      tags: ['vision', 'code'],
      description: 'Latest stable claude-3-5-sonnet alias'
    },
    // ── Claude 3 Series ───────────────────────────────────────────────────────
    {
      id: 'claude-3-opus-20240229',
      label: 'Claude 3 Opus (Deep Analysis)',
      contextWindow: 200000,
      tags: ['reasoning', 'long-context', 'vision'],
      description: 'Most intelligent Claude 3 model for complex enterprise workflows'
    },
    {
      id: 'claude-3-haiku-20240307',
      label: 'Claude 3 Haiku (Compact Legacy)',
      contextWindow: 200000,
      tags: ['fast'],
      description: 'Compact near-instant response for high-volume workloads'
    }
  ],
  async testConnection(settings: AppSettings): Promise<ProviderConnectionResult> {
    const key = settings.anthropicApiKey;
    if (!key) {
      return { success: false, message: 'Anthropic API key is missing. Get one at https://console.anthropic.com/settings/keys' };
    }
    const start = Date.now();
    try {
      const valid = await anthropicService.verifyApiKey(key);
      const latency = Date.now() - start;
      if (valid) {
        return { success: true, message: `Connected to Anthropic API (${latency}ms) — 10 models available`, latencyMs: latency, modelsCount: 10 };
      }
      return { success: false, message: 'Invalid Anthropic API Key — authentication rejected (401)' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Anthropic connection test failed' };
    }
  },
  async *streamChat(settings: AppSettings, messages: Message[], signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    yield* anthropicService.streamChat(settings, messages, signal);
  }
};
