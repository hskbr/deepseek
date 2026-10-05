import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none text-slate-100 text-[15px] leading-relaxed break-words space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            const codeString = String(children).replace(/\n$/, '');

            if (isInline) {
              return (
                <code
                  className="bg-[#18233c] text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono border border-cyan-900/40"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock language={match ? match[1] : 'texto'} code={codeString} />
            );
          },
          p({ children }) {
            return <p className="mb-3 last:mb-0 leading-relaxed text-slate-200">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-slate-200">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-slate-200">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold text-white mt-4 mb-2 pb-1 border-b border-slate-700/60">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-semibold text-white mt-4 mb-2 pb-1 border-b border-slate-700/40">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold text-cyan-200 mt-3 mb-1.5">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-cyan-500/60 pl-3 py-1 my-2 bg-slate-800/40 text-slate-300 italic rounded-r">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 border border-slate-700/80 rounded-lg">
                <table className="min-w-full text-left text-sm border-collapse">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-[#162035] text-cyan-200 border-b border-slate-700 font-semibold">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-3 py-2 text-xs uppercase tracking-wider">{children}</th>;
          },
          td({ children }) {
            return <td className="px-3 py-2 border-t border-slate-800/60 text-slate-300 text-sm">{children}</td>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 decoration-cyan-500/50 hover:decoration-cyan-300"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Falha ao copiar:', e);
    }
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-700/70 bg-[#0d1322] shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#141d33] border-b border-slate-700/60 text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 font-medium text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
          {language}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-700/50 hover:text-white transition-colors text-slate-300 cursor-pointer text-xs"
          title="Copiar código"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto font-mono text-sm leading-relaxed text-slate-200">
        <pre className="!m-0 !p-0 bg-transparent">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
