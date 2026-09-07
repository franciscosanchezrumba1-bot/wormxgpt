import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, X, Zap, Eye, Cpu, Brain, Code, Sparkles, Check, Layers,
  Gift, ExternalLink, Info, ChevronDown, ChevronRight, Star, Shield,
  Globe, Lock, Activity, ArrowRightLeft, Settings
} from 'lucide-react';
import { useWormGPT } from '../context/GlobalContext';
import { providerRegistry, ModelCapability, ModelTag } from '../services/providers/registry';
import { MODEL_OPTIONS } from '../constants';

type TabType = 'free' | 'text' | 'vision' | 'custom' | 'providers';

const TAG_ICONS: Record<string, React.ReactNode> = {
  free: <Gift className="w-3 h-3" />,
  fast: <Zap className="w-3 h-3" />,
  vision: <Eye className="w-3 h-3" />,
  reasoning: <Brain className="w-3 h-3" />,
  code: <Code className="w-3 h-3" />,
  'long-context': <Layers className="w-3 h-3" />,
};

const TAG_COLORS: Record<string, string> = {
  free: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  fast: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  vision: 'text-violet-300 border-violet-500/30 bg-violet-500/10',
  reasoning: 'text-blue-300 border-blue-500/30 bg-blue-500/10',
  code: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
  'long-context': 'text-indigo-300 border-indigo-500/30 bg-indigo-500/10',
};

interface ModelCardProps {
  model: ModelCapability & { provider: any; providerName: string; isFree?: boolean };
  isSelected: boolean;
  onSelect: () => void;
  isCurrent: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, isSelected, onSelect, isCurrent }) => {
  const contextK = model.contextWindow >= 1000000
    ? `${(model.contextWindow / 1000000).toFixed(1)}M`
    : model.contextWindow >= 1000
    ? `${Math.round(model.contextWindow / 1000)}K`
    : `${model.contextWindow}`;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 hover:scale-[1.005] group ${
        isSelected
          ? 'bg-indigo-600/20 border-indigo-500/60 shadow-md shadow-indigo-950/40'
          : isCurrent
          ? 'bg-slate-800/50 border-slate-600/60'
          : 'bg-slate-900/50 border-slate-800/60 hover:bg-slate-800/70 hover:border-slate-700/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Left: model info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {model.isFree && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                <Gift className="w-2.5 h-2.5" />FREE
              </span>
            )}
            <span className={`text-sm font-semibold leading-snug ${isSelected ? 'text-indigo-100' : 'text-slate-200'} group-hover:text-white transition-colors`}>
              {model.label}
            </span>
            {isCurrent && !isSelected && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400 font-mono">CURRENT</span>
            )}
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-slate-500">{model.providerName}</span>
            <span className="text-slate-700">·</span>
            <span className="text-[10px] font-mono text-slate-500">{contextK} ctx</span>
            {model.tags.slice(0, 3).map(tag => (
              <span key={tag} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[9px] font-mono ${TAG_COLORS[tag] || 'text-slate-400 border-slate-700 bg-slate-800/50'}`}>
                {TAG_ICONS[tag]}{tag}
              </span>
            ))}
          </div>

          {model.description && (
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed truncate">{model.description}</p>
          )}
        </div>

        {/* Right: checkmark */}
        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
          isSelected
            ? 'bg-indigo-500 border-indigo-400'
            : 'border-slate-700 group-hover:border-slate-500'
        }`}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>
    </button>
  );
};

// ── Provider Card ──────────────────────────────────────────────────────────────
const ProviderCard: React.FC<{
  provider: any;
  modelCount: number;
  hasFreeModels: boolean;
}> = ({ provider, modelCount, hasFreeModels }) => {
  return (
    <div className={`p-3.5 rounded-xl border transition-all ${
      hasFreeModels
        ? 'bg-emerald-950/20 border-emerald-500/25 hover:border-emerald-500/40'
        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {hasFreeModels && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                <Gift className="w-2.5 h-2.5" />FREE
              </span>
            )}
            <span className="text-sm font-semibold text-slate-200">{provider.name}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{provider.description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-mono text-slate-500">{modelCount} models</span>
            {!provider.requiresApiKey && (
              <span className="text-[10px] text-emerald-400 font-mono">No key needed</span>
            )}
            {provider.docsUrl && (
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
              >
                Docs <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ModelSelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetMode?: 'text' | 'vision';
}> = ({ isOpen, onClose, targetMode = 'text' }) => {
  const { settings, setSettings } = useWormGPT();
  const [activeTab, setActiveTab] = useState<TabType>(targetMode === 'vision' ? 'vision' : 'text');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<ModelTag | 'all' | 'free'>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [customModelId, setCustomModelId] = useState('');
  const [customProvider, setCustomProvider] = useState<string>(String(settings.aiProvider || 'openai'));

  useEffect(() => {
    if (isOpen) {
      setActiveTab(targetMode === 'vision' ? 'vision' : 'text');
      setSearchQuery('');
      setSelectedTag('all');
      setSelectedProvider('all');
    }
  }, [isOpen, targetMode]);

  const registryModels = useMemo(() => {
    const reg = providerRegistry.getAllModels();
    if (reg.length > 0) return reg;
    return MODEL_OPTIONS.map(m => ({
      id: m.value,
      label: m.label,
      provider: m.provider || 'pollinations',
      providerName: String(m.provider || 'Pollinations'),
      contextWindow: m.contextWindow || 32000,
      tags: (m.capabilities || ['fast']) as ModelTag[],
      isFree: m.isFree,
      description: `${m.label} via ${m.provider}`
    }));
  }, []);

  const freeModels = useMemo(() =>
    registryModels.filter(m => m.isFree || m.tags?.includes('free')),
    [registryModels]
  );

  const allProvidersList = useMemo(() => providerRegistry.getAllProviders(), []);

  const filteredModels = useMemo(() => {
    const baseList = activeTab === 'free' ? freeModels : registryModels;

    return baseList.filter(m => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        m.label.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.providerName.toLowerCase().includes(q);

      const matchesTag = selectedTag === 'all' || selectedTag === 'free'
        ? true
        : m.tags.includes(selectedTag as ModelTag);

      const matchesProvider = selectedProvider === 'all' || m.provider === selectedProvider;

      if (activeTab === 'vision' && selectedTag === 'all' && !searchQuery && selectedProvider === 'all') {
        return m.tags.includes('vision');
      }

      return matchesSearch && matchesTag && matchesProvider;
    });
  }, [registryModels, freeModels, searchQuery, selectedTag, selectedProvider, activeTab]);

  if (!isOpen) return null;

  const currentTextModel = settings.model;
  const currentVisionModel = settings.visionModel || 'gemini-2.5-flash';

  const handleSelectModel = (modelId: string, provider: any) => {
    if (activeTab === 'vision') {
      setSettings(prev => ({ ...prev, visionModel: modelId, visionProvider: provider }));
    } else {
      setSettings(prev => ({ ...prev, model: modelId, aiProvider: provider }));
    }
    onClose();
  };

  const handleCustomSubmit = () => {
    if (!customModelId.trim()) return;
    if (activeTab === 'vision' || activeTab === 'custom') {
      setSettings(prev => ({ ...prev, model: customModelId.trim(), aiProvider: customProvider as any }));
    }
    onClose();
  };

  const TAGS: (ModelTag | 'all' | 'free')[] = ['all', 'free', 'reasoning', 'fast', 'vision', 'code', 'long-context'];

  const TABS: { id: TabType; label: string; icon: React.ReactNode; count?: number; badge?: string }[] = [
    { id: 'free', label: 'FREE TIER', icon: <Gift className="w-3.5 h-3.5" />, count: freeModels.length, badge: '🎁' },
    { id: 'text', label: 'Text Models', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'vision', label: 'Vision Models', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'providers', label: 'All Providers', icon: <Globe className="w-3.5 h-3.5" />, count: allProvidersList.length },
    { id: 'custom', label: 'Custom', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  const currentModel = activeTab === 'vision' ? currentVisionModel : currentTextModel;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-[#0b0f1c] border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-slate-800/60 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Model & Provider Selector
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {registryModels.length} models across {allProvidersList.length} providers — {freeModels.length} free tier
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? tab.id === 'free'
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    tab.id === 'free' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Free Tier Banner */}
        {activeTab === 'free' && (
          <div className="px-5 py-3 bg-emerald-950/30 border-b border-emerald-500/20 shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-emerald-300 font-semibold">Zero-Cost AI — No Credit Card Needed</span>
                <p className="text-emerald-500/80 text-[10px] mt-0.5">
                  {freeModels.length} free models across Groq LPU, Gemini, Pollinations, Puter, GitHub Models, OpenRouter Free, Cerebras & more.
                  Many work with no API key at all.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search + Filter bar (not shown for providers/custom tabs) */}
        {activeTab !== 'providers' && activeTab !== 'custom' && (
          <div className="px-5 py-3 border-b border-slate-800/40 shrink-0">
            <div className="flex gap-2 flex-wrap">
              {/* Search */}
              <div className="flex-1 min-w-48 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder={activeTab === 'free' ? 'Search free models...' : 'Search models, providers...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
                  autoFocus
                />
              </div>

              {/* Provider filter */}
              <select
                value={selectedProvider}
                onChange={e => setSelectedProvider(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="all">All Providers</option>
                {allProvidersList.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Tag filters */}
            {activeTab !== 'free' && (
              <div className="flex gap-1.5 mt-2.5 flex-wrap">
                {TAGS.filter(t => t !== 'free').map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      selectedTag === tag
                        ? (TAG_COLORS[tag] || 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40')
                        : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {TAG_ICONS[tag]}{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

          {/* Current Selection Banner */}
          {activeTab !== 'providers' && activeTab !== 'custom' && currentModel && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs font-mono text-indigo-400 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-400">{activeTab === 'vision' ? 'Vision' : 'Text'} model:</span>
              <span className="font-bold text-indigo-200">{currentModel}</span>
              <span className="text-slate-500">({activeTab === 'vision' ? (settings.visionProvider || 'gemini') : settings.aiProvider})</span>
            </div>
          )}

          {/* Providers Tab */}
          {activeTab === 'providers' && (
            <div className="space-y-3">
              {/* FREE providers section */}
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  Free / No-Key Providers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {allProvidersList
                    .filter(p => !p.requiresApiKey || p.models.some(m => (m as any).isFree))
                    .map(p => (
                      <ProviderCard
                        key={p.id}
                        provider={p}
                        modelCount={p.models.length}
                        hasFreeModels={!p.requiresApiKey || p.models.some(m => (m as any).isFree)}
                      />
                    ))}
                </div>

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Paid / API Key Required
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allProvidersList
                    .filter(p => p.requiresApiKey && !p.models.some(m => (m as any).isFree))
                    .map(p => (
                      <ProviderCard
                        key={p.id}
                        provider={p}
                        modelCount={p.models.length}
                        hasFreeModels={false}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Custom Model Tab */}
          {activeTab === 'custom' && (
            <div className="max-w-lg space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Custom Model</span>
                    <p className="text-amber-500/80 mt-0.5 leading-relaxed">
                      Enter any OpenAI-compatible model ID and select its provider. The provider must support that model on its endpoint.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Model ID</label>
                <input
                  type="text"
                  placeholder="e.g. meta-llama/Llama-3.3-70B-Instruct"
                  value={customModelId}
                  onChange={e => setCustomModelId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Provider</label>
                <select
                  value={customProvider}
                  onChange={e => setCustomProvider(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60"
                >
                  {allProvidersList.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCustomSubmit}
                disabled={!customModelId.trim()}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all"
              >
                Use Custom Model
              </button>
            </div>
          )}

          {/* Model List */}
          {activeTab !== 'providers' && activeTab !== 'custom' && (
            <div>
              {filteredModels.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No models found for your search</p>
                  <p className="text-xs mt-1">Try adjusting filters or search term</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Free Models First (in free tab) */}
                  {activeTab === 'free' && (
                    <p className="text-[11px] text-slate-600 font-mono mb-3">
                      Showing {filteredModels.length} free models — sorted by speed
                    </p>
                  )}

                  {filteredModels.map(model => (
                    <ModelCard
                      key={`${model.provider}-${model.id}`}
                      model={model as any}
                      isSelected={
                        activeTab === 'vision'
                          ? currentVisionModel === model.id
                          : currentTextModel === model.id
                      }
                      isCurrent={
                        activeTab === 'vision'
                          ? currentVisionModel === model.id
                          : currentTextModel === model.id
                      }
                      onSelect={() => handleSelectModel(model.id, model.provider)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800/40 shrink-0 flex items-center justify-between">
          <div className="text-[11px] text-slate-600 font-mono">
            {activeTab !== 'providers' && activeTab !== 'custom'
              ? `${filteredModels.length} / ${registryModels.length} models shown`
              : activeTab === 'providers'
              ? `${allProvidersList.length} providers registered`
              : 'Custom model configuration'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
