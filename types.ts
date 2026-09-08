declare module '@google/adk';

// ── Shared Provider Type ─────────────────────────────────────────────────────
export type ProviderType =
  | 'gemini' | 'groq' | 'pollinations' | 'cerebras' | 'siliconflow'
  | 'together' | 'openrouter' | 'openai' | 'anthropic' | 'deepseek'
  | 'mistral' | 'perplexity' | 'xai' | 'moonshot' | 'ollama'
  | 'cohere' | 'wisgate' | 'nvidia' | 'fireworks' | 'sambanova'
  | 'hyperbolic' | 'huggingface' | 'replicate' | 'azure' | 'bedrock'
  | 'vertexai' | 'cloudflare' | 'deepinfra' | 'novita' | 'featherless'
  | 'lambdaai' | 'nebius' | 'tinyfish' | 'ai21' | 'uncloseai' | 'llm7' | 'puter'
  | 'llamacpp' | 'lmstudio' | 'jan' | 'vllm' | 'sglang' | 'localai' | 'gpt4all'
  | 'local_openai_proxy' | 'unsloth' | 'webgpu' | 'webbrain_cloud' | 'azure_openai' | 'aws_bedrock'
  | 'minimax' | 'kimi' | 'alibaba' | 'z_ai' | 'zhipuai'
  // New 2025/2026 providers
  | 'groq_free' | 'openrouter_free' | 'huggingface_free' | 'puter_free'
  | 'google_free' | 'mistral_free' | 'together_free' | 'cerebras_free'
  | 'chutes' | 'neets' | 'avian' | 'lepton' | 'anyscale' | 'octoai'
  | 'replicate_free' | 'modal' | 'banana' | 'beam' | 'baseten'
  | 'writer' | 'cohere_free' | 'ai21_free' | 'inflection'
  | 'github_models' | 'azure_free' | 'vertexai_free'
  | 'lambda' | 'vast' | 'runpod' | 'salad' | 'coreweave'
  | 'scaleway' | 'nscale' | 'fal' | 'gradient' | 'brev'
  | (string & {});

// ── Generation Metadata (Whitebox) ────────────────────────────────────────────
export interface GeneratedBy {
  model: string;
  provider: ProviderType;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  attemptedProviders?: string[];
  fallbackReason?: string;
  isFree?: boolean;
  streamingEnabled?: boolean;
}

// ── Provider Routing Event (Whitebox) ─────────────────────────────────────────
export interface RoutingEvent {
  type: 'attempt' | 'success' | 'fallback' | 'failure';
  provider: string;
  model: string;
  timestamp: number;
  latencyMs?: number;
  error?: string;
  nextProvider?: string;
}

// ── Stream Response ──────────────────────────────────────────────────────────
export interface StreamChunk {
  text: string;
  images: string[];
  video?: string;
  audio?: string;
  sources?: { title: string; url: string }[];
  toolInvocations?: ToolInvocation[];
  // Whitebox metadata
  provider?: string;
  model?: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  attemptedProviders?: string[];
  fallbackReason?: string;
  isFree?: boolean;
  routingEvents?: RoutingEvent[];
  isStreaming?: boolean;
  streamDone?: boolean;
}

// ── Live Stream Events ────────────────────────────────────────────────────────
export type StreamEventType =
  | 'token'          // new text token arrived
  | 'tool_start'     // tool call beginning
  | 'tool_end'       // tool call completed
  | 'provider_attempt'  // trying a provider
  | 'provider_fallback' // falling back to next provider
  | 'provider_success'  // provider responded
  | 'error'          // stream error
  | 'done';          // stream complete

export interface StreamEvent {
  type: StreamEventType;
  text?: string;
  toolName?: string;
  toolArgs?: any;
  toolResult?: any;
  provider?: string;
  model?: string;
  error?: string;
  latencyMs?: number;
  timestamp: number;
}

// ── Provider Health Stats ────────────────────────────────────────────────────
export interface ProviderHealthStats {
  provider: ProviderType;
  totalCalls: number;
  successCalls: number;
  failedCalls: number;
  avgLatencyMs: number;
  lastLatencyMs: number;
  lastError?: string;
  lastErrorAt?: number;
  isHealthy: boolean;
  isFree: boolean;
}

// ── Multi-Agent / Sub-Agent Types ────────────────────────────────────────────
export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  provider: ProviderType;
  model: string;
  systemPrompt: string;
  tools?: string[];
  parentId?: string;
}

export interface AgentTask {
  id: string;
  agentId: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  error?: string;
  startedAt?: number;
  completedAt?: number;
  subTasks?: AgentTask[];
}

export interface AgentOrchestrationConfig {
  enabled: boolean;
  maxAgents: number;
  maxDepth: number;
  timeout: number;
  agents: AgentConfig[];
}

// ── Core Types ───────────────────────────────────────────────────────────────

export interface Message {
  id?: string;
  role: 'user' | 'model' | 'assistant' | 'tool';
  content: string;
  thinking?: string;
  timestamp: number;
  images?: string[];
  video?: string;
  audio?: string;
  sources?: { title: string; url: string }[];
  toolInvocations?: ToolInvocation[];
  agentId?: string;
  // Whitebox generation metadata
  generatedBy?: GeneratedBy;
  // Error state
  isError?: boolean;
  errorType?: 'network' | 'api_key' | 'rate_limit' | 'context_overflow' | 'model_unavailable' | 'unknown';
  errorRaw?: string;
  // Routing log
  routingEvents?: RoutingEvent[];
}

export interface ToolInvocation {
  state: 'call' | 'result';
  toolCallId: string;
  toolName: string;
  args: any;
  result?: any;
  latencyMs?: number;
  startedAt?: number;
  completedAt?: number;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  title: string;
  updatedAt?: number;
  createdAt?: number;
}

export interface AppSettings {
  thinkingEnabled?: boolean;
  temperature: number;
  model: string;
  systemInstruction: string;
  thinkingBudget: number;
  geminiApiKey?: string;
  groqApiKey?: string;
  llm7ApiKey?: string;
  puterApiKey?: string;
  pollinationsApiKey?: string;
  cerebrasApiKey?: string;
  siliconFlowApiKey?: string;
  togetherApiKey?: string;
  openRouterApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  deepseekApiKey?: string;
  mistralApiKey?: string;
  perplexityApiKey?: string;
  xaiApiKey?: string;
  aiProvider: ProviderType;
  enabledTools?: string[];
  mcpServerUrls?: string[];
  mcpEnabled?: boolean;
  topP?: number;
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  injectSystemPrompts?: boolean;
  inputTemplate?: string;
  attachedMessagesCount?: number;
  historyCompressionThreshold?: number;
  memoryPrompt?: boolean;
  moonshotApiKey?: string;
  ollamaApiKey?: string;
  ollamaHost?: string;
  ollamaUseLocalhost?: boolean;
  cohereApiKey?: string;
  wisGateApiKey?: string;
  wisGateHost?: string;
  // Provider API Keys
  nvidiaApiKey?: string;
  fireworksApiKey?: string;
  sambanovaApiKey?: string;
  hyperbolicApiKey?: string;
  huggingfaceApiKey?: string;
  replicateApiKey?: string;
  azureApiKey?: string;
  azureEndpoint?: string;
  bedrockAccessKey?: string;
  bedrockSecretKey?: string;
  bedrockRegion?: string;
  vertexaiProjectId?: string;
  vertexaiLocation?: string;
  cloudflareAccountId?: string;
  cloudflareApiKey?: string;
  deepinfraApiKey?: string;
  novitaApiKey?: string;
  featherlessApiKey?: string;
  lambdaaiApiKey?: string;
  nebiusApiKey?: string;
  ai21ApiKey?: string;
  // New 2025 Providers
  chutesApiKey?: string;
  githubModelsToken?: string;
  writerApiKey?: string;
  inflectionApiKey?: string;
  scalewayApiKey?: string;
  nscaleApiKey?: string;
  falApiKey?: string;
  lepton?: string;
  // Search & Crawl Keys
  witAiServerToken?: string;
  tavilyApiKey?: string;
  braveApiKey?: string;
  kagiApiKey?: string;
  mojeekApiKey?: string;
  serperApiKey?: string;
  serpapiApiKey?: string;
  firecrawlApiKey?: string;
  tinyfishApiKey?: string;
  // Local Hosts
  llamacppHost?: string;
  lmstudioHost?: string;
  janHost?: string;
  vllmHost?: string;
  // Advanced Model Parameters
  topK?: number;
  minP?: number;
  topA?: number;
  typicalP?: number;
  repetitionPenalty?: number;
  seed?: number;
  mirostat?: number;
  mirostatTau?: number;
  mirostatEta?: number;
  stopSequences?: string[];
  logitBias?: Record<string, number>;
  // Prompt Injection
  customPromptPrefix?: string;
  customPromptSuffix?: string;
  injectInUserMessage?: boolean;
  promptVariables?: Record<string, string>;
  // Model-specific overrides
  modelOverrides?: Record<string, Partial<AppSettings>>;
  // Reasoning parameters
  reasoningEffort?: 'low' | 'medium' | 'high';
  verbosity?: 'low' | 'medium' | 'high';
  // Token Usage Optimization
  useTokenOptimization?: boolean;
  maxContextTokens?: number;
  compressionThreshold?: number;
  // Prompt Injection Control
  promptInjectionEnabled?: boolean;
  promptInjectionMode?: 'always' | 'once' | 'manual';
  injectedPrompts?: string[];
  lastInjectedPrompt?: string;
  // Auto-Fallback & Free Model Selection
  autoFallback?: boolean;
  autoSelectFreeModel?: boolean;
  fallbackChain?: ProviderType[];
  preferFreeModels?: boolean;
  // Multi-Agent Orchestration
  multiAgentEnabled?: boolean;
  multiAgentConfig?: AgentOrchestrationConfig;
  // App Integrations
  githubToken?: string;
  gmailApiKey?: string;
  slackBotToken?: string;
  discordBotToken?: string;
  telegramBotToken?: string;
  whatsappToken?: string;
  whatsappPhoneNumberId?: string;
  teamsWebhookUrl?: string;
  googleCalendarApiKey?: string;
  googleDriveApiKey?: string;
  trelloApiKey?: string;
  trelloToken?: string;
  linkedinToken?: string;
  spotifyToken?: string;
  connectedApps?: string[];
  // Supabase OAuth
  supabaseAnonKey?: string;
  // Cache settings
  cacheEnabled?: boolean;
  redisUrl?: string;
  redisToken?: string;
  // A2A (Agent-to-Agent) Protocol
  a2aEnabled?: boolean;
  a2aAgentUrls?: string[];
  // Prompt Caching
  promptCachingEnabled?: boolean;
  promptCacheTTL?: number;
  // Multi-Model Orchestration & Model Router
  visionModel?: string;
  visionProvider?: ProviderType;
  modelRoutingMode?: 'auto' | 'manual';
  // System Override & Unrestricted Prompt Injection
  systemOverride?: boolean;
  liveModePrompt?: boolean;
  // UI Customization
  themePreference?: 'charcoal' | 'night' | 'slate';
  fontSize?: 'sm' | 'base' | 'lg';
  // Vision Arbitrage
  pxpipeEnabled?: boolean;
  pxpipeProxyUrl?: string;
  // Whitebox settings
  showGenerationMetadata?: boolean;
  showRoutingEvents?: boolean;
  showToolDetails?: boolean;
  showStreamingCursor?: boolean;
  [key: string]: any;
}
