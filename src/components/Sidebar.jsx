import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tag, ArrowRightLeft, Menu, X, ChevronLeft, ChevronRight, Wallet, Bell, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Swal from 'sweetalert2';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isEng = i18n.language === 'en';

  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path;
  const [user, setUser] = useState({ nom: 'Chargement...', email: '', avatar: '' });

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/utilisateurs/me');
      const userData = { nom: res.data.nom || 'Utilisateur', email: res.data.email, avatar: res.data.avatar || '' };
      setUser(userData);
      localStorage.setItem('utilisateur', JSON.stringify(userData));
    } catch (err) {
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

  const handleLogout = () => {
    const isDark = document.documentElement.classList.contains('dark');
    Swal.fire({
      title: t('profile.logoutTitle', 'Se déconnecter ?'),
      text: t('profile.logoutText', 'Voulez-vous vraiment fermer votre session ?'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('profile.logoutConfirm', 'Oui, déconnexion'),
      cancelButtonText: t('profile.cancelBtn', 'Annuler'),
      background: isDark ? '#0A192F' : '#ffffff',
      color: isDark ? '#eff6ff' : '#0f172a',
      borderRadius: '1.5rem'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('utilisateur');
        window.location.href = '/Login';
      }
    });
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed top-5 left-4 z-50 p-2 bg-white/80 backdrop-blur-md dark:bg-[#0A192F]/80 rounded-xl shadow-lg shadow-indigo-500/10 text-slate-800 dark:text-white border border-slate-200 dark:border-blue-500/30 transition-all">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && <div onClick={() => setIsOpen(false)} className="lg:hidden fixed inset-0 bg-slate-900/40 dark:bg-[#050B14]/80 backdrop-blur-sm z-40 transition-opacity"></div>}

      <div className={`fixed lg:relative inset-y-0 left-0 z-40 bg-white/95 dark:bg-[#0A192F]/95 backdrop-blur-xl border-r border-slate-100 dark:border-blue-500/20 shadow-2xl flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-20' : 'w-64'}`}>

        <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex absolute -right-3.5 top-10 w-7 h-7 bg-white dark:bg-[#050B14] border border-slate-200 dark:border-cyan-500/50 rounded-full items-center justify-center text-slate-500 dark:text-cyan-400 cursor-pointer hover:scale-110 shadow-md transition-all z-50 group">
          {isCollapsed ? <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />}
        </button>

        <div onClick={() => handleNavigate('/Profile')} className={`mx-4 mt-20 lg:mt-8 mb-4 bg-slate-50 dark:bg-[#112240]/60 hover:bg-white dark:hover:bg-[#112240] rounded-2xl border border-slate-100 dark:border-blue-500/20 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group shrink-0 flex items-center ${isCollapsed ? 'px-1 py-4 justify-center' : 'px-6 py-5 gap-3'}`}>
          <div className="relative shrink-0">
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.nom.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`} alt="Avatar" className={`${isCollapsed ? 'w-10 h-10' : 'w-11 h-11'} rounded-full border-2 border-white dark:border-[#0A192F] shadow-md group-hover:scale-105 transition-all duration-300 object-cover`} />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0A192F] rounded-full shadow-sm"></div>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden flex-1 transition-opacity duration-300 delay-100">
              <h4 className="text-sm font-bold text-slate-800 dark:text-blue-50 truncate group-hover:text-cyan-400 transition-colors">{user.nom}</h4>
              <p className="text-[11px] text-slate-500 dark:text-blue-200/60 truncate">{user.email || "Chargement..."}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <div onClick={() => handleNavigate('/Dashboard')} className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl font-bold cursor-pointer transition-all duration-300 ${isActive('/Dashboard') ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-600/20 dark:to-cyan-600/20 text-blue-600 dark:text-cyan-400 shadow-sm border border-cyan-500/30' : 'text-slate-500 dark:text-blue-200/60 hover:bg-slate-100 dark:hover:bg-[#112240] hover:translate-x-1 hover:text-cyan-600 dark:hover:text-cyan-300'}`}>
              <LayoutDashboard size={isCollapsed ? 22 : 18} className="shrink-0 transition-all duration-300" /> {!isCollapsed && <span className="truncate">{t('sidebar.dashboard', 'Dashboard')}</span>}
            </div>
            <div onClick={() => handleNavigate('/Transactions')} className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl font-bold cursor-pointer transition-all duration-300 ${isActive('/Transactions') ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-600/20 dark:to-cyan-600/20 text-blue-600 dark:text-cyan-400 shadow-sm border border-cyan-500/30' : 'text-slate-500 dark:text-blue-200/60 hover:bg-slate-100 dark:hover:bg-[#112240] hover:translate-x-1 hover:text-cyan-600 dark:hover:text-cyan-300'}`}>
              <ArrowRightLeft size={isCollapsed ? 22 : 18} className="shrink-0 transition-all duration-300" /> {!isCollapsed && <span className="truncate">{t('sidebar.transactions', 'Transactions')}</span>}
            </div>
            <div onClick={() => handleNavigate('/Categories')} className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl font-bold cursor-pointer transition-all duration-300 ${isActive('/Categories') ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-600/20 dark:to-cyan-600/20 text-blue-600 dark:text-cyan-400 shadow-sm border border-cyan-500/30' : 'text-slate-500 dark:text-blue-200/60 hover:bg-slate-100 dark:hover:bg-[#112240] hover:translate-x-1 hover:text-cyan-600 dark:hover:text-cyan-300'}`}>
              <Tag size={isCollapsed ? 22 : 18} className="shrink-0 transition-all duration-300" /> {!isCollapsed && <span className="truncate">{t('sidebar.categories', 'Catégories')}</span>}
            </div>
            <div onClick={() => handleNavigate('/Budgets')} className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl font-bold cursor-pointer transition-all duration-300 ${isActive('/Budgets') ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-600/20 dark:to-cyan-600/20 text-blue-600 dark:text-cyan-400 shadow-sm border border-cyan-500/30' : 'text-slate-500 dark:text-blue-200/60 hover:bg-slate-100 dark:hover:bg-[#112240] hover:translate-x-1 hover:text-cyan-600 dark:hover:text-cyan-300'}`}>
              <Wallet size={isCollapsed ? 22 : 18} className="shrink-0 transition-all duration-300" /> {!isCollapsed && <span className="truncate">{t('sidebar.budgets', 'Budgets')}</span>}
            </div>

            <div onClick={() => handleNavigate('/Notifications')} className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl font-bold cursor-pointer transition-all duration-300 ${isActive('/Notifications') ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-600/20 dark:to-cyan-600/20 text-blue-600 dark:text-cyan-400 shadow-sm border border-cyan-500/30' : 'text-slate-500 dark:text-blue-200/60 hover:bg-slate-100 dark:hover:bg-[#112240] hover:translate-x-1 hover:text-cyan-600 dark:hover:text-cyan-300'}`}>
              <Bell size={isCollapsed ? 22 : 18} className="shrink-0 transition-all duration-300" /> {!isCollapsed && <span className="truncate">{isEng ? 'Notifications' : 'Notifications'}</span>}
            </div>




          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-blue-500/20 shrink-0">
          <div
            onClick={handleLogout}
            title={isCollapsed ? t('profile.logout', 'Déconnexion') : ''}
            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl font-bold cursor-pointer transition-all duration-300 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:text-rose-400`}
          >
            <LogOut size={isCollapsed ? 22 : 18} className="shrink-0" />
            {!isCollapsed && <span className="truncate">{t('profile.logout', 'Déconnexion')}</span>}
          </div>
        </div>

      </div>
    </>
  );
}

export default Sidebar;