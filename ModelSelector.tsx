import React, { useState, useRef, useEffect } from 'react';
import { Persona, Language, PersonaConfig } from '../types';
import { PERSONA_CONFIGS, TRANSLATIONS } from '../constants';
import { ChevronDown, Zap, Layers } from 'lucide-react';

interface ModelSelectorProps {
  currentPersona: Persona;
  onSelectPersona: (p: Persona) => void;
  disabled: boolean;
  language: Language;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ currentPersona, onSelectPersona, disabled, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  const activeConfig = PERSONA_CONFIGS[currentPersona];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (persona: Persona) => {
    switch(persona) {
      case Persona.SCYNO_CORE: return <Layers size={14} className="text-indigo-400" />;
      default: return <Zap size={14} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
          ${isOpen ? 'bg-slate-800 text-white' : 'bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white'}
          border border-slate-700
        `}
      >
        {getIcon(currentPersona)}
        <span>{activeConfig.shortName}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          <div className="p-2 space-y-1">
            {(Object.values(PERSONA_CONFIGS) as PersonaConfig[]).map((config) => (
              <button
                key={config.id}
                onClick={() => {
                  onSelectPersona(config.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left p-2 rounded-lg flex items-start gap-3 transition-colors
                  ${currentPersona === config.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'}
                `}
              >
                <div className={`mt-0.5 p-1.5 rounded-md bg-slate-950 border border-slate-800`}>
                  {getIcon(config.id)}
                </div>
                <div>
                  <div className={`text-xs font-bold ${config.color}`}>{config.name}</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{t[config.descriptionKey] || config.descriptionKey}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;