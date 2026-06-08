import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tag, ArrowRightLeft, Menu, X } from 'lucide-react'; 
import { useTranslation } from 'react-i18next'; 
import api from '../services/api'; 

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { t } = useTranslation(); 
  
  const [isOpen, setIsOpen] = useState(false); 

  const isActive = (path) => location.pathname === path;

  const [user, setUser] = useState({ nom: 'Chargement...', email: '', avatar: '' });

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/utilisateurs/me'); 
      const userData = {
        nom: res.data.nom || 'Utilisateur',
        email: res.data.email,
        avatar: res.data.avatar || '' 
      };
      setUser(userData);
      localStorage.setItem('utilisateur', JSON.stringify(userData)); 
    } catch (err) {
      console.error("Erreur récupération utilisateur", err);
      const storedUser = localStorage.getItem('utilisateur');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    const handleProfileUpdate = () => {
      const storedUser = localStorage.getItem('utilisateur');
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    
    window.addEventListener('profilMisAJour', handleProfileUpdate);
    return () => window.removeEventListener('profilMisAJour', handleProfileUpdate);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 left-4 z-50 p-2 bg-white/80 backdrop-blur-md dark:bg-[#0A192F]/80 rounded-xl shadow-lg shadow-indigo-500/10 dark:shadow-[0_0_15px_rgba(6,182,212,0.2)] text-slate-800 dark:text-white border border-slate-200 dark:border-blue-500/30 transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="lg:hidden fixed inset-0 bg-slate-900/40 dark:bg-[#050B14]/80 backdrop-blur-sm z-40 transition-opacity"
        ></div>
      )}

      {/* FOND BLEU NUIT PROFOND (#0A192F) et BORDURE LUMINEUSE */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/95 dark:bg-[#0A192F]/95 backdrop-blur-xl border-r border-slate-100 dark:border-blue-500/20 shadow-2xl shadow-indigo-500/5 dark:shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* WIDGET UTILISATEUR */}
        <div 
          onClick={() => handleNavigate('/Profile')} 
          title={t('profile.pageTitle', 'Accéder à mon Profil')}
          className="px-6 py-5 mx-4 mt-20 lg:mt-8 mb-4 bg-slate-50 dark:bg-[#112240]/60 hover:bg-white dark:hover:bg-[#112240] rounded-2xl border border-slate-100 dark:border-blue-500/20 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.nom.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`} 
                alt="Avatar" 
                className="w-11 h-11 rounded-full border-2 border-white dark:border-[#0A192F] shadow-md group-hover:scale-105 transition-transform duration-300 object-cover" 
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0A192F] rounded-full shadow-sm dark:shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-blue-50 truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                {user.nom}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-blue-200/60 truncate w-full block">
                {user.email || "Chargement..."}
              </p>
            </div>
          </div>
        </div>
        
        {/* MENU PRINCIPAL (Effet Néon sur l'actif) */}
        <nav className="flex-1 px-4 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <div onClick={() => handleNavigate('/Dashboard')} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold cursor-pointer transition-all duration-300 ${isActive('/Dashboard') ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-600/20 dark:to-cyan-600/20 text-blue-600 dark:text-cyan-400 shadow-sm border border-blue-100/50 dark:border-cyan-500/30 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'text-slate-500 dark:text-blue-200/60 hover:bg-slate-50 dark:hover:bg-[#112240] font-medium hover:translate-x-1 dark:hover:text-cyan-300'}`}>
              <LayoutDashboard size={18} /> {t('sidebar.dashboard', 'Dashboard')}
            </div>
            <div onClick={() => handleNavigate('/Transactions')} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold cursor-pointer transition-all duration-300 ${isActive('/Transactions') ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-600/20 dark:to-cyan-600/20 text-blue-600 dark:text-cyan-400 shadow-sm border border-blue-100/50 dark:border-cyan-500/30 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'text-slate-500 dark:text-blue-200/60 hover:bg-slate-50 dark:hover:bg-[#112240] font-medium hover:translate-x-1 dark:hover:text-cyan-300'}`}>
              <ArrowRightLeft size={18} /> {t('sidebar.transactions', 'Transactions')}
            </div>
            <div onClick={() => handleNavigate('/Categories')} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold cursor-pointer transition-all duration-300 ${isActive('/Categories') ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-600/20 dark:to-cyan-600/20 text-blue-600 dark:text-cyan-400 shadow-sm border border-blue-100/50 dark:border-cyan-500/30 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'text-slate-500 dark:text-blue-200/60 hover:bg-slate-50 dark:hover:bg-[#112240] font-medium hover:translate-x-1 dark:hover:text-cyan-300'}`}>
              <Tag size={18} /> {t('sidebar.categories', 'Catégories')}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;