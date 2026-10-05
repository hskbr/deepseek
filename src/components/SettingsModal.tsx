import React from 'react';
import { X, Sliders, MessageSquare, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: string;
  setModel: (m: string) => void;
  systemPrompt: string;
  setSystemPrompt: (p: string) => void;
  temperature: number;
  setTemperature: (t: number) => void;
  streamEnabled: boolean;
  setStreamEnabled: (s: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  model,
  setModel,
  systemPrompt,
  setSystemPrompt,
  temperature,
  setTemperature,
  streamEnabled,
  setStreamEnabled,
}) => {
  if (!isOpen) return null;

  const models = [
    { id: 'deepseek/deepseek-v4-flash', label: 'deepseek/deepseek-v4-flash', desc: 'Modelo padrão ultra-rápido recomendado' },
    { id: 'deepseek/deepseek-chat', label: 'deepseek/deepseek-chat', desc: 'Modelo geral DeepSeek Chat' },
    { id: 'deepseek/deepseek-coder', label: 'deepseek/deepseek-coder', desc: 'Especializado em código e engenharia de software' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#101726] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d1422]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Opções do Chat</h2>
              <p className="text-xs text-slate-400">Personalize parâmetros do DeepSeek</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-sm">
          {/* Model selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Modelo Roteia
            </label>
            <div className="space-y-2">
              {models.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    model === item.id
                      ? 'bg-blue-950/40 border-cyan-500 text-white shadow-sm shadow-cyan-950/40'
                      : 'bg-[#0a0f1a] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="modelSelection"
                    checked={model === item.id}
                    onChange={() => setModel(item.id)}
                    className="mt-1 accent-cyan-400"
                  />
                  <div>
                    <div className="font-mono text-xs font-semibold text-cyan-300">{item.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              Instrução do Sistema (Prompt Inicial)
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Ex: Você é um assistente prestativo em português brasileiro..."
              rows={3}
              className="w-full bg-[#0a0f1a] border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-hidden focus:border-cyan-500/80 resize-none placeholder-slate-500"
            />
          </div>

          {/* Temperature & Stream */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Criatividade (Temp):</span>
                <span className="font-mono text-cyan-300 font-semibold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
              <div className="text-xs">
                <div className="font-medium text-slate-200">Streaming</div>
                <div className="text-[11px] text-slate-400">Digitação em tempo real</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={streamEnabled}
                  onChange={(e) => setStreamEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3.5 border-t border-slate-800 bg-[#0d1422]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer"
          >
            Salvar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
