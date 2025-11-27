import React, { useState } from 'react';
import { Download, Copy, ChevronDown, ChevronRight, FileCode, Check, Eye } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface MarkdownRendererProps {
  content: string;
  language: Language;
  onPreview?: (code: string) => void;
}

const CodeFileCard: React.FC<{ language: string, code: string, appLang: Language, onPreview?: (code: string) => void }> = ({ language, code, appLang, onPreview }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const t = TRANSLATIONS[appLang];

  // Try to extract filename from the first line comment
  const firstLine = code.split('\n')[0] || '';
  let filename = `script.${language}`;
  if (firstLine.includes('//') || firstLine.includes('#') || firstLine.includes('<!--')) {
    const parts = firstLine.split(/[\/\#]|<!--|-->/);
    const potentialName = parts.find(p => p.trim().includes('.'))?.trim();
    if (potentialName) {
      filename = potentialName;
    }
  }
  
  // Clean filename if language is missing
  if (filename.endsWith('text')) filename = 'snippet.txt';
  
  const isHtml = language.toLowerCase() === 'html' || filename.endsWith('.html');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(code);
    }
  };

  const lineCount = code.split('\n').length;

  return (
    <>
      <div className="my-4 rounded-xl overflow-hidden border border-slate-700 bg-[#0d1117] shadow-lg w-full max-w-full">
        {/* File Header */}
        <div className="flex flex-wrap items-center justify-between px-3 py-3 bg-slate-800/80 border-b border-slate-700 gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 flex-shrink-0">
              <FileCode size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-200 truncate pr-2">{filename}</div>
              <div className="text-[10px] text-slate-500 font-mono uppercase truncate">{language} • {lineCount} {t.lines}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
             {isHtml && onPreview && (
              <button
                onClick={handlePreview}
                className="p-1.5 md:p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
                title={t.viewOnline}
              >
                <Eye size={14} />
                <span className="hidden sm:inline">{t.viewOnline}</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-1.5 md:p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title={t.copy}
            >
              {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              <span className="hidden sm:inline">{isCopied ? t.copied : t.copy}</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 md:p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title={t.download}
            >
              <Download size={14} />
              <span className="hidden sm:inline">{t.download}</span>
            </button>
          </div>
        </div>

        {/* Expansion Toggle */}
        <div className="flex items-center px-4 py-2 bg-slate-900/50 cursor-pointer hover:bg-slate-900 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
          <button 
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors focus:outline-none w-full"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {isExpanded ? t.hideCode : t.previewCode}
          </button>
        </div>

        {/* Code Area (Collapsible) - FIXED SCROLLING */}
        {isExpanded && (
          <div className="w-full bg-[#0d1117] border-t border-slate-800 max-w-full">
            <pre 
              className="p-4 text-xs md:text-sm font-mono text-slate-300 overflow-x-auto whitespace-pre w-full block scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
              style={{ touchAction: 'pan-x pan-y' }}
            >
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, language, onPreview }) => {
  // Split content by code blocks
  const parts = content.split(/```/);

  return (
    <div className="text-sm md:text-base leading-relaxed space-y-2 w-full max-w-full overflow-hidden">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          // Inside a code block
          const [langLine, ...codeLines] = part.split('\n');
          const code = codeLines.join('\n');
          const lang = langLine.trim() || 'text';
          
          return <CodeFileCard key={index} language={lang} code={code} appLang={language} onPreview={onPreview} />;
        } else {
          // Regular text rendering
          const paragraphs = part.split('\n\n').filter(p => p.trim());
          
          return (
            <React.Fragment key={index}>
              {paragraphs.map((p, pIndex) => (
                <div key={pIndex} className="mb-3 whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>
                  {p.split(/(\*\*.*?\*\*|`[^`]+`)/).map((segment, i) => {
                    if (segment.startsWith('**') && segment.endsWith('**')) {
                      return <strong key={i} className="font-semibold text-blue-200">{segment.slice(2, -2)}</strong>;
                    } else if (segment.startsWith('`') && segment.endsWith('`')) {
                      return (
                        <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-xs border border-slate-700 break-all">
                          {segment.slice(1, -1)}
                        </code>
                      );
                    } else {
                      return <span key={i}>{segment}</span>;
                    }
                  })}
                </div>
              ))}
            </React.Fragment>
          );
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;