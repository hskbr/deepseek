import React, { useState } from 'react';
import { User, Sparkles, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageItemProps {
  message: ChatMessage;
  isLastAssistant: boolean;
  onRetry?: () => void;
  isLoading?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isLastAssistant,
  onRetry,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Falha ao copiar:', e);
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(timestamp));
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`group w-full py-4 px-4 sm:px-6 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-[#0e1526]/50 border-y border-slate-800/40'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start gap-3.5 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-cyan-200">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white shadow-md shadow-cyan-900/40">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Header info */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">
                {isUser ? 'Você' : 'DeepSeek'}
              </span>
              <span className="text-[10px] text-slate-500">
                {formatTime(message.createdAt)}
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {message.content && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  title="Copiar mensagem"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {message.error && (
            <div className="my-2 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-rose-300">Falha ao obter resposta</p>
                  <p className="text-xs text-rose-200/90 mt-0.5 whitespace-pre-wrap">{message.error}</p>
                </div>
              </div>
              {onRetry && !isLoading && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-rose-900/50 hover:bg-rose-800/60 text-white rounded-lg border border-rose-600/40 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Message Text / Markdown */}
          {isUser ? (
            <p className="text-slate-100 text-[15px] leading-relaxed whitespace-pre-wrap select-text">
              {message.content}
            </p>
          ) : (
            <div>
              {message.content ? (
                <MarkdownRenderer content={message.content} />
              ) : message.isStreaming ? (
                <div className="flex items-center gap-2 text-sm text-cyan-400 animate-pulse py-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>DeepSeek está pensando...</span>
                </div>
              ) : null}

              {/* Streaming blinking cursor */}
              {message.isStreaming && message.content && (
                <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 translate-y-0.5 animate-pulse rounded-xs" />
              )}
            </div>
          )}

          {/* Assistant Retry button below response when completed */}
          {!isUser && !message.isStreaming && isLastAssistant && onRetry && !message.error && (
            <div className="mt-3 pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onRetry}
                disabled={isLoading}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Regenerar resposta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
