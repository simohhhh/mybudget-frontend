import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, AlertCircle, CheckCircle2, Sun, Moon } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

function Notifications() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const isEng = i18n.language === 'en';

  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [resTx, resCat] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories')
      ]);
      setTransactions(resTx.data);
      setCategories(resCat.data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur de chargement des notifications", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Calcul dynamique des alertes basées sur le mois en cours
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const alerts = categories
    .filter(cat => cat.budgetMax > 0)
    .map(cat => {
      const spentThisMonth = transactions
        .filter(tx => {
          const d = new Date(tx.date);
          return tx.type === 'depense' && 
                 tx.categorie?._id === cat._id && 
                 d.getFullYear() === currentYear && 
                 d.getMonth() === currentMonth;
        })
        .reduce((sum, tx) => sum + tx.montant, 0);

      const percentage = Math.round((spentThisMonth / cat.budgetMax) * 100);
      
      if (percentage >= 100) {
        return {
          id: cat._id,
          type: 'critical',
          category: cat.nom,
          couleur: cat.couleur,
          messageFr: `Dépassement critique ! Vous avez consommé ${percentage}% du budget alloué à la catégorie ${cat.nom} (${spentThisMonth} DH / ${cat.budgetMax} DH).`,
          messageEn: `Critical alert! You have consumed ${percentage}% of the budget allocated to the ${cat.nom} category (${spentThisMonth} MAD / ${cat.budgetMax} MAD).`
        };
      } else if (percentage >= 80) {
        return {
          id: cat._id,
          type: 'warning',
          category: cat.nom,
          couleur: cat.couleur,
          messageFr: `Attention ! Vous approchez de la limite de votre budget pour la catégorie ${cat.nom} (${percentage}% utilisé : ${spentThisMonth} DH / ${cat.budgetMax} DH).`,
          messageEn: `Warning! You are approaching your budget limit for the ${cat.nom} category (${percentage}% used: ${spentThisMonth} MAD / ${cat.budgetMax} MAD).`
        };
      }
      return null;
    })
    .filter(alert => alert !== null);

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#f4f7fb] dark:bg-[#050B14] text-slate-800 dark:text-blue-50">{isEng ? 'Loading...' : 'Chargement...'}</div>;

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7fb] dark:bg-[#050B14] flex font-sans text-slate-800 dark:text-blue-50 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        <header className="h-20 shrink-0 pl-16 pr-4 md:px-8 flex justify-between items-center bg-[#f4f7fb]/80 dark:bg-[#050B14]/80 backdrop-blur-md sticky top-0 z-30 border-b border-transparent dark:border-blue-900/30">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
            <Bell className="text-blue-600 dark:text-cyan-400" size={24} />
            {isEng ? 'Notifications' : 'Notifications'}
          </h1>

          <div onClick={toggleDarkMode} className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-blue-500/30 text-slate-600 dark:text-cyan-300 rounded-xl font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-[#112240] transition-all">
            <span className="text-sm hidden sm:block">
              {isDarkMode ? t('header.lightMode', 'Mode Clair') : t('header.darkMode', 'Mode Sombre')}
            </span>
            {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
          </div>
        </header>

        <div className="flex-1 px-4 md:px-8 pb-24 w-full max-w-[1000px] mx-auto overflow-y-auto custom-scrollbar flex flex-col pt-6">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500 dark:text-blue-300/40">
              <CheckCircle2 size={56} className="text-emerald-500 mb-4 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
              <p className="text-lg font-bold">{isEng ? 'All systems clear!' : 'Tout est sous contrôle !'}</p>
              <p className="text-sm mt-1 text-center">{isEng ? 'Your monthly budgets are well within limits.' : 'Vos dépenses respectent parfaitement vos limites budgétaires.'}</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-5 rounded-3xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 flex gap-4 items-start bg-white dark:bg-[#0A192F] ${
                    alert.type === 'critical' 
                      ? 'border-rose-100 dark:border-rose-500/30 shadow-lg shadow-rose-500/5 dark:hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]' 
                      : 'border-amber-100 dark:border-amber-500/30 shadow-lg shadow-amber-500/5 dark:hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  }`}
                >
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    alert.type === 'critical' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'
                  }`}>
                    {alert.type === 'critical' ? <AlertCircle size={22} className="animate-pulse" /> : <AlertTriangle size={22} />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: alert.couleur }} />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-blue-300/60">
                        {t(`categories_list.${alert.category}`, alert.category)}
                      </span>
                      <span className={`ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                        alert.type === 'critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>
                        {alert.type === 'critical' ? (isEng ? 'CRITICAL' : 'CRITIQUE') : (isEng ? 'WARNING' : 'ATTENTION')}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-blue-100 leading-relaxed">
                      {isEng ? alert.messageEn : alert.messageFr}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;