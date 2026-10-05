import React from 'react';
import { Code2, Compass, Lightbulb, BookOpen } from 'lucide-react';

interface StarterPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const StarterPrompts: React.FC<StarterPromptsProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      icon: Code2,
      category: 'Programação',
      text: 'Escreva uma função em Python com tipagem para calcular a média móvel de uma lista.',
    },
    {
      icon: Lightbulb,
      category: 'Conceito',
      text: 'Explique computação quântica e entrelaçamento de forma simples e intuitiva.',
    },
    {
      icon: Compass,
      category: 'Planejamento',
      text: 'Crie um roteiro de viagem de 3 dias em Salvador focado em culinária e patrimônio histórico.',
    },
    {
      icon: BookOpen,
      category: 'Redação',
      text: 'Escreva um e-mail profissional em português solicitando feedback sobre um relatório trimestral.',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4 mx-auto my-6">
      {suggestions.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelectPrompt(item.text)}
            className="flex flex-col text-left p-3.5 rounded-xl bg-[#111828]/80 hover:bg-[#162138] border border-slate-800/80 hover:border-cyan-500/40 transition-all text-slate-200 group cursor-pointer shadow-sm hover:shadow-cyan-950/20"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs text-cyan-400 font-medium">
              <Icon className="w-3.5 h-3.5" />
              <span>{item.category}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 group-hover:text-white line-clamp-2 leading-relaxed">
              {item.text}
            </p>
          </button>
        );
      })}
    </div>
  );
};
