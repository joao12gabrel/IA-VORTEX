import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { Cpu, Fingerprint } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { StorageService } from '../services/storageService';

interface LoginModalProps {
  onLogin: (user: UserProfile) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const lang = StorageService.getLanguage(); // Load default language for login screen
  const t = TRANSLATIONS[lang];

  const handleLogin = () => {
    setIsLoading(true);
    // Simulation of Proprietary Login
    setTimeout(() => {
      onLogin({
        id: 'magus_' + Date.now(),
        name: 'Operator',
        email: 'admin@vortex.os',
        avatarUrl: 'https://cdn-icons-png.flaticon.com/512/4333/4333609.png' // Wizard icon
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg animate-fade-in p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden animate-slide-up">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg border border-slate-700">
             <Cpu className="text-cyan-500" size={32} />
          </div>
          
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">VORTEX <span className="text-cyan-400 font-light">OS</span></h1>
          <p className="text-slate-400 mb-8">{t.proprietaryTech}</p>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg group border border-cyan-400/20"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Fingerprint className="w-5 h-5" />
            )}
            <span>{isLoading ? t.verifying : t.loginTitle}</span>
          </button>
          
          <p className="mt-6 text-xs text-slate-600">
            {t.authorizedOnly}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;