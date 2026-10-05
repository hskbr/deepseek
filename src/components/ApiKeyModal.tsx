import React from 'react';
import { X, Key, ShieldCheck, Server, AlertTriangle } from 'lucide-react';
import { ApiStatus } from '../types/chat';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ApiStatus | null;
  onCheckStatus: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  status,
  onCheckStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#101726] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d1422]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Configuração da API Roteia</h2>
              <p className="text-xs text-slate-400">DeepSeek v4 Flash Proxy Seguro</p>
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
        <div className="p-5 space-y-4 text-sm">
          {/* Status banner */}
          {status?.configured ? (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
              <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-medium text-emerald-200">ROTEIA_API_KEY Configurada!</p>
                <p className="text-xs text-emerald-400/90 mt-0.5">
                  O proxy seguro do backend está pronto para encaminhar suas mensagens para a API Roteia.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200">
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-amber-400" />
              <div>
                <p className="font-medium text-amber-200">ROTEIA_API_KEY Não Detectada</p>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Para enviar mensagens, configure a variável de ambiente <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-amber-100">ROTEIA_API_KEY</code> no servidor.
                </p>
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Como funciona</h3>
            <div className="p-3 bg-[#0a0f1a] rounded-xl border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Server className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Proxy de Backend Seguro:</strong> A chave de API nunca é exposta no navegador ou no código do front-end. O front-end chama o endpoint <code className="text-cyan-300 font-mono">/api/chat</code>, e o Node.js adiciona o header <code className="text-cyan-300 font-mono">Authorization: Bearer</code> antes de requisitar a Roteia.
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Parâmetros Atuais</h3>
            <div className="bg-[#0a0f1a] rounded-xl border border-slate-800 p-3 space-y-1.5 font-mono text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Modelo padrão:</span>
                <span className="text-cyan-300 font-semibold">{status?.defaultModel || 'deepseek/deepseek-v4-flash'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Endpoint:</span>
                <span className="text-slate-200">https://api.roteia.ai/v1/chat/completions</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Variável:</span>
                <span className="text-amber-300">ROTEIA_API_KEY</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status no servidor:</span>
                <span className={status?.configured ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                  {status?.configured ? 'Chave ativa' : 'Pendente de configuração'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-3 text-xs text-slate-400 leading-relaxed border border-slate-800">
            <strong>Dica:</strong> Se você acabou de definir a variável de ambiente, clique no botão abaixo para revalidar a conexão com o servidor.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-[#0d1422]">
          <button
            type="button"
            onClick={onCheckStatus}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            Verificar status do servidor
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
