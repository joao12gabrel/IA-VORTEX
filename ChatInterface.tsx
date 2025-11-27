
import React, { useRef, useEffect, useState } from 'react';
import { Message, ChatState, Attachment, Persona, Language } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { Send, Loader2, Menu, Activity, Paperclip, X, ThumbsUp, ThumbsDown, RefreshCw, Play, Sparkles, Zap, ShieldCheck, Database, BrainCircuit, Hexagon } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface ChatInterfaceProps {
  chatState: ChatState;
  input: string;
  setInput: (s: string) => void;
  initialAttachments?: Attachment[];
  onSend: (attachments: Attachment[]) => void;
  onPersonaChange: (p: Persona) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onFeedback: (messageId: string, rating: 'positive' | 'negative', text?: string) => void;
  language: Language;
  onPreview?: (code: string) => void;
  minimalMode?: boolean; 
  onRetry?: () => void;
  onContinue?: () => void;
}

// ... (MessageFeedback Component kept same)
const MessageFeedback = ({ message, onFeedback, language }: { message: Message, onFeedback: (id: string, r: 'positive' | 'negative', t?: string) => void, language: Language }) => {
  const [rated, setRated] = useState<'positive' | 'negative' | null>(message.feedback?.rating || null);

  const handleRate = (rating: 'positive' | 'negative') => {
    setRated(rating);
    const tag = rating === 'positive' ? "Liked style" : "Disliked style";
    onFeedback(message.id, rating, tag);
  };

  return (
    <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
      <button 
        onClick={() => handleRate('positive')}
        className={`p-1 rounded-md transition-colors ${rated === 'positive' ? 'text-green-400 bg-green-500/10' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <ThumbsUp size={12} />
      </button>
      <button 
        onClick={() => handleRate('negative')}
        className={`p-1 rounded-md transition-colors ${rated === 'negative' ? 'text-red-400 bg-red-500/10' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <ThumbsDown size={12} />
      </button>
    </div>
  );
};

// --- RICH LOADING INDICATOR ---
const LoadingIndicator = ({ language }: { language: Language }) => {
  const [step, setStep] = useState(0);
  const t = TRANSLATIONS[language];
  const steps = [t.processing, t.analyzeContext, t.verifying];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2000); // Change text every 2s
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="px-4 py-2 rounded-2xl rounded-tl-sm bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-lg">
          <div className="relative flex items-center justify-center w-4 h-4">
             <span className="absolute w-full h-full border-2 border-cyan-500/30 rounded-full animate-ping"></span>
             <Loader2 size={14} className="animate-spin text-cyan-400" />
          </div>
          <span className="text-xs text-cyan-300/80 font-mono tracking-wide">{steps[step]}</span>
      </div>
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatState,
  input,
  setInput,
  initialAttachments,
  onSend,
  isSidebarOpen,
  onToggleSidebar,
  onFeedback,
  language,
  onPreview,
  minimalMode = false,
  onRetry,
  onContinue
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, isLoading } = chatState;
  const t = TRANSLATIONS[language];
  
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (initialAttachments && initialAttachments.length > 0) {
      setAttachments(initialAttachments);
    }
  }, [initialAttachments]);

  useEffect(() => {
    if (!minimalMode) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isLoading, minimalMode]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Increased max-height logic
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const isImage = file.type.startsWith('image/');
        const previewUri = isImage ? base64String : 'https://cdn-icons-png.flaticon.com/512/136/136538.png'; 

        setAttachments(prev => [...prev, {
          mimeType: file.type || 'text/plain',
          data: base64Data,
          previewUri: previewUri
        }]);
      };
      reader.readAsDataURL(file);
      e.target.value = ''; 
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendClick = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    onSend(attachments);
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const shouldShowContinue = (msg: Message, isLast: boolean) => {
    if (!isLast || msg.isError || isLoading || msg.role !== 'model') return false;
    const content = msg.content.trim();
    const hasUnclosedCodeBlock = (content.match(/```/g) || []).length % 2 !== 0;
    const endsWithPunctuation = /[.!?}]$/.test(content);
    return hasUnclosedCodeBlock || !endsWithPunctuation;
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-300 relative ${isSidebarOpen && !minimalMode ? 'md:ml-72' : ''} bg-transparent`}>
      
      {!minimalMode && (
        <>
          <div className="absolute inset-0 bg-grid z-0 pointer-events-none opacity-40"></div>

          <div className="absolute top-4 left-4 z-20 md:hidden">
            <button 
              onClick={onToggleSidebar}
              className="p-2 text-slate-400 hover:text-white bg-slate-900/80 rounded-lg border border-white/5 shadow-lg backdrop-blur-md"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth z-10 overscroll-contain">
            {messages.length === 0 && (
              <div className="min-h-full flex flex-col items-center justify-center text-slate-500 animate-fade-in p-6 pt-24 md:pt-12">
                
                {/* Main Logo Text - Replaced Hexagon with Typography */}
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter text-center leading-tight drop-shadow-2xl">
                  VORTEX <span className="text-cyan-400 font-light">OS</span>
                </h1>
                <p className="text-sm text-slate-400 mb-12 font-medium tracking-widest uppercase opacity-70 border-b border-cyan-500/30 pb-2">{t.welcomeSubtitle}</p>
                
                {/* Updates / Capabilities Dashboard */}
                <div className="w-full max-w-3xl">
                   <div className="flex items-center gap-2 mb-4 px-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.capabilities}</span>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1: Heuristics */}
                    <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-xl backdrop-blur-sm flex gap-4 hover:bg-slate-900/60 transition-colors group">
                      <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Zap size={20} />
                      </div>
                      <div>
                        <h3 className="text-slate-200 font-bold text-sm mb-1">{t.capLogicTitle}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed opacity-80">{t.capLogicDesc}</p>
                      </div>
                    </div>

                    {/* Card 2: Self-Correction */}
                    <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-xl backdrop-blur-sm flex gap-4 hover:bg-slate-900/60 transition-colors group">
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h3 className="text-slate-200 font-bold text-sm mb-1">{t.capCodeTitle}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed opacity-80">{t.capCodeDesc}</p>
                      </div>
                    </div>

                    {/* Card 3: Backup */}
                    <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-xl backdrop-blur-sm flex gap-4 hover:bg-slate-900/60 transition-colors group">
                      <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Database size={20} />
                      </div>
                      <div>
                        <h3 className="text-slate-200 font-bold text-sm mb-1">{t.capSpeedTitle}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed opacity-80">{t.capSpeedDesc}</p>
                      </div>
                    </div>

                    {/* Card 4: Learning */}
                    <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-xl backdrop-blur-sm flex gap-4 hover:bg-slate-900/60 transition-colors group">
                      <div className="p-3 bg-green-500/10 rounded-xl text-green-400 shrink-0 group-hover:scale-110 transition-transform">
                        <BrainCircuit size={20} />
                      </div>
                      <div>
                        <h3 className="text-slate-200 font-bold text-sm mb-1">{t.capLearnTitle}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed opacity-80">{t.capLearnDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              const showContinue = shouldShowContinue(msg, isLast);

              return (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col w-full min-w-0 max-w-[85vw] md:max-w-[80%] lg:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className={`flex flex-wrap gap-2 mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.attachments.map((att, idx) => (
                          <div key={idx} className="relative overflow-hidden rounded-lg border border-slate-700/50 w-24 md:w-32 shadow-lg bg-slate-900">
                            <img src={att.previewUri} alt="attachment" className="w-full h-16 md:h-24 object-cover opacity-80" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={`
                      relative px-4 py-3 shadow-md group max-w-full overflow-hidden
                      ${msg.role === 'user' 
                        ? 'bg-cyan-600/90 text-white rounded-2xl rounded-tr-sm bg-gradient-to-br from-cyan-600 to-blue-700 border border-cyan-500/50' 
                        : 'bg-slate-900/90 border border-slate-700/50 text-slate-200 rounded-2xl rounded-tl-sm w-full'}
                    `}>
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap leading-relaxed break-words text-sm" style={{ overflowWrap: 'anywhere' }}>{msg.content}</p>
                      ) : (
                        <>
                          {msg.isError && (
                            <div className="flex flex-col gap-2 mb-2 bg-red-900/10 p-2 rounded-lg border border-red-500/20">
                              <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                                <Activity size={12} />
                                {t.sysInterruption}
                              </div>
                              <p className="text-[10px] text-red-300/80">{t.errorGeneric}</p>
                            </div>
                          )}
                          
                          <div className="w-full min-w-0 overflow-hidden">
                              <MarkdownRenderer content={msg.content} language={language} onPreview={onPreview} />
                          </div>

                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                             <MessageFeedback message={msg} onFeedback={onFeedback} language={language} />
                             
                             <div className="flex items-center gap-2">
                               {msg.isError && onRetry && (
                                 <button 
                                  onClick={onRetry}
                                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-[10px] font-medium border border-red-500/30 flex items-center gap-1 transition-colors"
                                 >
                                   <RefreshCw size={10} />
                                   {t.retry}
                                 </button>
                               )}

                               {showContinue && onContinue && (
                                 <button 
                                   onClick={onContinue}
                                   className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-medium transition-all animate-pulse"
                                 >
                                   <span>{t.continue}</span>
                                   <Play size={8} fill="currentColor" />
                                 </button>
                               )}
                             </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isLoading && <LoadingIndicator language={language} />}
            <div ref={messagesEndRef} />
          </div>
        </>
      )}

      {/* Input Area (Minimal Mode & Normal Mode) */}
      <div className={`
         z-20 w-full transition-all duration-300
         ${minimalMode 
           ? 'bg-transparent pb-0 px-2' 
           : 'p-4 md:p-6 pb-6 bg-transparent'}
      `}>
        <div className={`mx-auto relative group ${minimalMode ? 'max-w-2xl' : 'max-w-4xl'}`}>
          
          <div className={`
            relative flex flex-col border transition-all duration-300
            ${minimalMode 
              ? 'bg-black/60 backdrop-blur-xl border-white/10 rounded-3xl shadow-2xl' 
              : 'bg-slate-950/95 rounded-2xl border-slate-800 shadow-2xl'}
          `}>

            {attachments.length > 0 && (
              <div className="px-3 pt-3 flex gap-2 overflow-x-auto touch-pan-x">
                {attachments.map((att, idx) => (
                  <div key={idx} className="relative w-12 h-12 rounded-md overflow-hidden border border-slate-700 group/preview flex-shrink-0">
                    <img src={att.previewUri} alt="upload" className="w-full h-full object-cover" />
                    <button onClick={() => removeAttachment(idx)} className="absolute top-0 right-0 bg-black/60 text-white p-0.5 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className={`flex items-end gap-2 ${minimalMode ? 'p-1.5' : 'p-3'}`}>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.go,.rs,.php,.rb,.html,.css,.json,.sql,.xml" 
                onChange={handleFileSelect} 
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className={`
                  text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50
                  ${minimalMode ? 'p-2 rounded-full' : 'p-2 rounded-xl'}
                `}
                title={t.uploadTooltip}
              >
                <Paperclip size={minimalMode ? 16 : 20} />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={minimalMode ? t.messagePlaceholder : `${t.messagePlaceholder}`}
                className={`
                  w-full bg-transparent text-slate-200 placeholder-slate-500 border-none focus:ring-0 resize-none overflow-y-auto
                  ${minimalMode ? 'min-h-[36px] py-2 text-sm' : 'min-h-[44px] py-2 text-sm md:text-base'}
                  leading-relaxed disabled:opacity-50
                `}
                rows={1}
                style={{ touchAction: 'manipulation', maxHeight: '200px' }}
              />
              
              <button
                onClick={handleSendClick}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className={`
                  transition-all duration-300 flex-shrink-0 flex items-center justify-center
                  ${minimalMode 
                    ? 'w-9 h-9 rounded-full' 
                    : 'p-2.5 rounded-xl'}
                  ${(!input.trim() && attachments.length === 0) || isLoading 
                    ? 'bg-white/5 text-slate-600' 
                    : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20'}
                `}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={minimalMode ? 16 : 20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
