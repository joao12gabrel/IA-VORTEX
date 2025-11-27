import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, UserProfile, Language } from '../types';
import { Plus, MessageSquare, Trash2, LogOut, Search, Clock, Settings, X, Check, Download, Upload, Database, AlertCircle, User, Edit2 } from 'lucide-react';
import { TRANSLATIONS, AVATAR_OPTIONS } from '../constants';
import { StorageService } from '../services/storageService';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  user: UserProfile | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onClearAll: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId,
  user,
  onSelectSession, 
  onNewChat,
  onDeleteSession,
  onLogout,
  isOpen,
  onClose,
  language,
  onLanguageChange,
  onClearAll,
  onUpdateUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (user) {
      setEditName(user.name);
    }
  }, [user]);

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    StorageService.exportAllData();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      StorageService.importAllData(e.target.files[0])
        .then(() => {
          alert(t.importSuccess);
          window.location.reload();
        })
        .catch(() => alert(t.importError));
    }
  };

  const handleClearAllClick = () => {
    if (window.confirm(t.clearAllConfirm)) {
       onClearAll();
    }
  };

  const handleSaveProfile = (newName: string, newAvatar?: string) => {
    if (!user) return;
    
    const updatedUser: UserProfile = {
      ...user,
      name: newName,
      avatarUrl: newAvatar || user.avatarUrl
    };
    
    StorageService.saveUser(updatedUser);
    onUpdateUser(updatedUser);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 glass-panel border-r border-white/5
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        bg-black pt-24 md:pt-0
      `}>
        {/* Header - Replaced Logo with Text to prevent cutoff */}
        <div className="p-4 border-b border-white/5 bg-black/40">
           {/* Typographic Logo */}
           <div className="mb-4 pl-1">
             <h1 className="text-2xl font-black tracking-tighter text-white">
               VORTEX <span className="text-cyan-400 font-light">OS</span>
             </h1>
             <p className="text-[10px] text-slate-500 tracking-widest uppercase">Proprietary Intelligence</p>
           </div>

          <button 
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-cyan-900/20 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>{t.newChat}</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 mt-2">
           <div className="relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
             <input 
               type="text" 
               placeholder={t.searchPlaceholder}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 placeholder-slate-600 transition-all"
             />
           </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <h3 className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Clock size={10} /> {t.recentSyncs}
          </h3>
          
          <div className="space-y-1">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-10 text-slate-600 text-sm">
                {searchQuery ? t.noResults : t.noHistory}
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div 
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`
                    group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border
                    ${currentSessionId === session.id 
                      ? 'bg-slate-800/80 border-slate-700 text-white shadow-sm' 
                      : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}
                  `}
                >
                  <MessageSquare size={16} className={currentSessionId === session.id ? 'text-cyan-400' : 'text-slate-600'} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {session.title || "Untitled Sync"}
                    </div>
                    <div className="text-[10px] opacity-60 truncate">
                      {session.preview || "No data available"}
                    </div>
                  </div>

                  {currentSessionId === session.id && (
                    <button
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="absolute right-2 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      title={t.deleteChat}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-900/30">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px]">
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full border-2 border-slate-900 object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white max-w-[100px] truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-400">VORTEX ID</span>
                </div>
              </div>
              
              <div className="flex items-center">
                 <button 
                  onClick={() => setShowSettings(true)}
                  className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                  title={t.settings}
                >
                  <Settings size={16} />
                </button>
                <button 
                  onClick={onLogout}
                  className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                  title={t.signOut}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={18} />
            </button>
            
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Settings size={18} className="text-cyan-400" />
              {t.settings}
            </h2>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              
              {/* Profile Customization */}
              {user && (
                <div>
                   <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3 block flex items-center gap-2">
                     <User size={12} /> {t.editProfile}
                   </label>
                   <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-4">
                     {/* Name Input */}
                     <div>
                       <label className="text-[10px] text-slate-400 mb-1 block">{t.displayName}</label>
                       <div className="relative">
                         <input 
                           type="text" 
                           value={editName}
                           onChange={(e) => {
                             setEditName(e.target.value);
                             handleSaveProfile(e.target.value);
                           }}
                           className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-sm text-white focus:border-cyan-500 focus:outline-none"
                         />
                         <Edit2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                       </div>
                     </div>

                     {/* Avatar Selection */}
                     <div>
                       <label className="text-[10px] text-slate-400 mb-2 block">{t.chooseAvatar}</label>
                       <div className="grid grid-cols-4 gap-2">
                         {AVATAR_OPTIONS.map((avatar, idx) => (
                           <button
                             key={idx}
                             onClick={() => handleSaveProfile(editName, avatar)}
                             className={`
                               relative rounded-full aspect-square overflow-hidden border-2 transition-all
                               ${user.avatarUrl === avatar ? 'border-cyan-500 scale-110 shadow-lg shadow-cyan-500/20' : 'border-slate-800 hover:border-slate-600'}
                             `}
                           >
                             <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                             {user.avatarUrl === avatar && (
                               <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                                 <Check size={12} className="text-white drop-shadow-md" />
                               </div>
                             )}
                           </button>
                         ))}
                       </div>
                     </div>
                   </div>
                </div>
              )}

              {/* Language Section */}
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">{t.language}</label>
                <div className="space-y-2">
                  <button 
                    onClick={() => { onLanguageChange('pt-PT'); setShowSettings(false); }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${language === 'pt-PT' ? 'bg-cyan-600/10 border-cyan-500/50 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                  >
                    <span>Português (Portugal)</span>
                    {language === 'pt-PT' && <Check size={16} />}
                  </button>
                  <button 
                    onClick={() => { onLanguageChange('en-US'); setShowSettings(false); }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${language === 'en-US' ? 'bg-cyan-600/10 border-cyan-500/50 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                  >
                    <span>English (US)</span>
                    {language === 'en-US' && <Check size={16} />}
                  </button>
                </div>
              </div>

              {/* Data Management Section (Backup) */}
              <div>
                 <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block flex items-center gap-2">
                   {t.dataManagement}
                 </label>
                 <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 space-y-3">
                   <p className="text-[10px] text-slate-400">{t.dataDesc}</p>
                   
                   <button 
                     onClick={handleExport}
                     className="w-full flex items-center justify-center gap-2 p-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-colors"
                   >
                     <Download size={14} />
                     {t.exportData}
                   </button>
                   
                   <div className="relative">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".scyno,.json" 
                        className="hidden"
                        onChange={handleImport}
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Upload size={14} />
                        {t.importData}
                      </button>
                   </div>
                 </div>
              </div>

              {/* Danger Zone */}
              <div>
                 <label className="text-xs text-red-500 font-bold uppercase tracking-wider mb-2 block flex items-center gap-2">
                   <AlertCircle size={12} /> Zone Danger
                 </label>
                 <div className="bg-red-900/10 rounded-xl p-3 border border-red-500/20 space-y-3">
                   <p className="text-[10px] text-red-300/70">{t.clearAllDesc}</p>
                   <button 
                     onClick={handleClearAllClick}
                     className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors"
                   >
                     <Trash2 size={14} />
                     {t.clearAll}
                   </button>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;