import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { StarterPrompts } from './components/StarterPrompts';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SettingsModal } from './components/SettingsModal';
import { ChatMessage, ApiStatus } from './types/chat';
import { Sparkles, ArrowDown, AlertTriangle, Key } from 'lucide-react';

const STORAGE_KEY = 'deepseek_chat_messages_v1';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((m: any) => ({
            ...m,
            isStreaming: false, // reset any stuck streaming flag
          }));
        }
      }
    } catch (e) {
      console.error('Falha ao restaurar mensagens:', e);
    }
    return [];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Settings
  const [model, setModel] = useState('deepseek/deepseek-v4-flash');
  const [systemPrompt, setSystemPrompt] = useState(
    'Você é um assistente de inteligência artificial DeepSeek prestativo, preciso, conciso e cordial. Responda em português brasileiro com excelente formatação em markdown.'
  );
  const [temperature, setTemperature] = useState(0.7);
  const [streamEnabled, setStreamEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check API status on mount
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setApiStatus(data);
      }
    } catch (err) {
      console.error('Falha ao verificar status da API:', err);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Persist messages in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Falha ao salvar mensagens:', e);
    }
  }, [messages]);

  // Scroll handler for floating button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 180);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom('smooth');
    }
  }, [messages, showScrollBottom]);

  // Stop generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    );
  };

  // Clear conversation
  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm('Tem certeza de que deseja limpar todo o histórico do chat?')) {
      handleStop();
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend !== undefined ? textToSend : input).trim();
    if (!content || isLoading) return;

    setInput('');

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content,
      createdAt: Date.now(),
    };

    const assistantId = `ast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      isStreaming: true,
      error: null,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, assistantMessage]);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build conversation history for API
      const outgoingMessages = [];

      if (systemPrompt.trim()) {
        outgoingMessages.push({
          role: 'system',
          content: systemPrompt.trim(),
        });
      }

      for (const m of updatedMessages) {
        if (!m.error) {
          outgoingMessages.push({
            role: m.role,
            content: m.content,
          });
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: outgoingMessages,
          stream: streamEnabled,
          temperature,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMsg = `Erro ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData?.error) {
            errorMsg = typeof errData.error === 'string' ? errData.error : JSON.stringify(errData.error);
          }
        } catch {
          // not json
        }

        // Show config modal if it's missing key error
        if (response.status === 401) {
          setShowConfigModal(true);
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  isStreaming: false,
                  error: errorMsg,
                }
              : m
          )
        );
        setIsLoading(false);
        return;
      }

      // Handle streaming or JSON
      if (streamEnabled && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;

            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(dataStr);
                const deltaContent = parsed?.choices?.[0]?.delta?.content || '';
                if (deltaContent) {
                  fullText += deltaContent;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: fullText } : m
                    )
                  );
                }
              } catch {
                // partial JSON or unexpected token
              }
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: fullText,
                  isStreaming: false,
                }
              : m
          )
        );
      } else {
        // Non-streaming JSON response
        const data = await response.json();
        const replyText =
          data?.choices?.[0]?.message?.content ||
          data?.message ||
          'Nenhuma resposta retornada pelo modelo.';

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: replyText,
                  isStreaming: false,
                }
              : m
          )
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        );
      } else {
        console.error('Erro na chamada da API:', err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  isStreaming: false,
                  error:
                    err?.message ||
                    'Não foi possível conectar ao servidor proxy. Verifique sua conexão e a chave ROTEIA_API_KEY.',
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Retry logic
  const handleRetry = () => {
    if (isLoading || messages.length === 0) return;

    // Find the last user message
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessageIndex = i;
        break;
      }
    }

    if (lastUserMessageIndex === -1) return;

    const userText = messages[lastUserMessageIndex].content;
    // Remove messages after this user message
    const trimmed = messages.slice(0, lastUserMessageIndex);
    setMessages(trimmed);

    // Re-send that text
    setTimeout(() => {
      handleSendMessage(userText);
    }, 50);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0f1d] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <ChatHeader
        status={apiStatus}
        onOpenConfig={() => setShowConfigModal(true)}
        onClearChat={handleClearChat}
        onOpenSettings={() => setShowSettingsModal(true)}
        messageCount={messages.length}
        model={model}
      />

      {/* Main chat viewport */}
      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative scroll-smooth focus:outline-hidden"
      >
        {/* Warning banner if API key is not configured */}
        {apiStatus && !apiStatus.configured && (
          <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 max-w-3xl mx-auto w-full">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Variável ROTEIA_API_KEY ausente:</strong> Configure a chave no ambiente do servidor para enviar mensagens.
              </span>
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="ml-auto underline font-medium text-amber-300 hover:text-white cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Key className="w-3.5 h-3.5" />
                Instruções
              </button>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="min-h-full flex flex-col items-center justify-center py-12 px-4 text-center">
            {/* Hero / Empty state */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-xl shadow-cyan-950/50 mb-4 animate-in zoom-in-90 duration-300">
              <div className="w-full h-full bg-[#0d1424] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
              deepseek
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
              Chat inteligente em português conectado via proxy seguro à API Roteia com o modelo <span className="text-cyan-300 font-mono text-xs font-semibold">{model}</span>.
            </p>

            {/* Suggestions */}
            <div className="w-full">
              <div className="text-xs uppercase font-semibold tracking-wider text-slate-500 mb-2">
                Sugestões para começar
              </div>
              <StarterPrompts onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
            </div>
          </div>
        ) : (
          <div className="pb-8">
            {messages.map((message, idx) => {
              const isLastAssistant =
                idx === messages.length - 1 && message.role === 'assistant';
              return (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  isLastAssistant={isLastAssistant}
                  onRetry={handleRetry}
                  isLoading={isLoading}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Floating scroll to bottom button */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom('smooth')}
            className="fixed bottom-24 right-6 p-2.5 rounded-full bg-[#162035] border border-slate-700 text-cyan-400 hover:text-white shadow-xl hover:bg-slate-700 transition-all cursor-pointer z-20 animate-in fade-in"
            title="Rolar para o fim"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}
      </main>

      {/* Input area */}
      <footer className="shrink-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/95 to-transparent pt-3 pb-2">
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSendMessage()}
          onStop={handleStop}
          isLoading={isLoading}
        />
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        status={apiStatus}
        onCheckStatus={checkStatus}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        model={model}
        setModel={setModel}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        temperature={temperature}
        setTemperature={setTemperature}
        streamEnabled={streamEnabled}
        setStreamEnabled={setStreamEnabled}
      />
    </div>
  );
}
