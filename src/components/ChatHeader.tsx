import React from 'react';
import { Sparkles, Trash2, ShieldCheck, AlertCircle, Settings2 } from 'lucide-react';
import { ApiStatus } from '../types/chat';

interface ChatHeaderProps {
  status: ApiStatus | null;
  onOpenConfig: () => void;
  onClearChat: () => void;
  onOpenSettings: () => void;
  messageCount: number;
  model: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  status,
  onOpenConfig,
  onClearChat,
  onOpenSettings,
  messageCount,
  model,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Brand & Model */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 shadow-md shadow-cyan-900/30">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0f1d]"></span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              deepseek
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
              {model}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Roteia AI</span>
            <span>•</span>
            <span className="text-slate-500">v1/chat/completions</span>
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Status pill button */}
        <button
          type="button"
          onClick={onOpenConfig}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
            status?.configured
              ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/50'
              : 'bg-amber-950/30 text-amber-300 border-amber-500/30 hover:bg-amber-950/50'
          }`}
          title={status?.configured ? 'API Roteia conectada' : 'Clique para configurar ROTEIA_API_KEY'}
        >
          {status?.configured ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">API Pronta</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden md:inline">Chave Pendente</span>
            </>
          )}
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
          title="Opções do modelo e prompt de sistema"
          aria-label="Opções"
        >
          <Settings2 className="w-4 h-4" />
        </button>

        {/* Clear chat button */}
        {messageCount > 0 && (
          <button
            type="button"
            onClick={onClearChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors border border-transparent hover:border-rose-900/40 cursor-pointer"
            title="Limpar histórico da conversa"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        )}
      </div>
    </header>
  );
};
