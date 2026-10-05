import React, { useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isLoading,
  disabled,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Max height approx 200px
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <div className="relative rounded-2xl bg-[#12192a] border border-slate-700/80 shadow-xl focus-within:border-cyan-500/80 focus-within:ring-1 focus-within:ring-cyan-500/40 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Envie uma mensagem para o DeepSeek..."
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent px-4 py-3.5 pr-14 text-slate-100 placeholder-slate-400 text-sm sm:text-base focus:outline-hidden resize-none min-h-[52px] max-h-[200px] leading-relaxed"
        />

        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md cursor-pointer"
              title="Parar geração"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!input.trim() || disabled}
              className={`p-2 rounded-xl transition-all shadow-md cursor-pointer ${
                input.trim() && !disabled
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Enviar mensagem (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-slate-400">
        <span>DeepSeek v4 Flash via Roteia AI</span>
        <span className="hidden sm:inline">Pressione <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">Enter</kbd> para enviar, <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">Shift+Enter</kbd> para nova linha</span>
      </div>
    </div>
  );
};
