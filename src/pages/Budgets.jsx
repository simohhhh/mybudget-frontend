import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, AlertTriangle, Info } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';

function Budgets() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); 
  const isEng = i18n.language === 'en'; 
  
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

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
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Calcul intelligent des budgets pour le mois sélectionné
  const [year, month] = reportMonth.split('-');
  
  const budgetTracking = categories
    .filter(cat => cat.budgetMax > 0)
    .map(cat => {
      const spentThisMonth = transactions
        .filter(tx => {
          const d = new Date(tx.date);
          return tx.type === 'depense' && tx.categorie?._id === cat._id && 
                 d.getFullYear() === parseInt(year) && d.getMonth() === parseInt(month) - 1;
        })
        .reduce((sum, tx) => sum + tx.montant, 0);

      const percentage = Math.round((spentThisMonth / cat.budgetMax) * 100);
      const isOverBudget = spentThisMonth > cat.budgetMax;

      return { ...cat, spent: spentThisMonth, percentage, isOverBudget };
    })
    .sort((a, b) => b.percentage - a.percentage);

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#f4f7fb] dark:bg-[#050B14] dark:text-blue-50 transition-colors duration-300">Chargement...</div>;

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7fb] dark:bg-[#050B14] flex font-sans text-slate-800 dark:text-blue-50 transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-20 shrink-0 pl-16 pr-4 md:px-8 flex justify-between items-center bg-[#f4f7fb]/80 dark:bg-[#050B14]/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-300 border-b border-transparent dark:border-blue-900/30">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white">
              {isEng ? 'budget monitoring' : 'suivi de budgets'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-blue-500/30 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden px-3">
              <input 
                type="month" 
                value={reportMonth} 
                onChange={(e) => setReportMonth(e.target.value)} 
                className="bg-transparent border-none text-[11px] md:text-sm font-bold text-slate-700 dark:text-blue-100 outline-none py-2 cursor-pointer" 
              />
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 md:px-8 pb-24 w-full mx-auto overflow-y-auto custom-scrollbar flex flex-col pt-6">
          
          {budgetTracking.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500 dark:text-blue-300/50">
              <Info size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">{isEng ? "No budget defined yet." : "Aucun budget défini pour le moment."}</p>
              <button onClick={() => navigate('/Categories')} className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30">
                <PlusCircle size={18} /> {isEng ? 'Set a Budget' : 'Définir un budget'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {budgetTracking.map(cat => {
                let barColor = 'bg-gradient-to-r from-emerald-400 to-emerald-500 dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]';
                let statusColor = 'text-emerald-500 dark:text-emerald-400 dark:drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]';
                
                if (cat.percentage >= 100) {
                  barColor = 'bg-gradient-to-r from-rose-400 to-rose-500 dark:shadow-[0_0_10px_rgba(244,63,94,0.5)] shadow-sm shadow-rose-500/20';
                  statusColor = 'text-rose-500 dark:text-rose-400 dark:drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]';
                } else if (cat.percentage >= 80) {
                  barColor = 'bg-gradient-to-r from-orange-400 to-orange-500 dark:shadow-[0_0_10px_rgba(249,115,22,0.5)] shadow-sm shadow-orange-500/20';
                  statusColor = 'text-orange-500 dark:text-orange-400 dark:drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]';
                }

                return (
                  <div key={cat._id} className="bg-white dark:bg-[#0A192F] p-6 rounded-[2rem] shadow-xl shadow-indigo-500/5 hover:shadow-2xl dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] border border-slate-100 dark:border-blue-500/20 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: cat.couleur, boxShadow: `0 0 10px ${cat.couleur}` }}></div>
                        <span className="font-extrabold text-lg text-slate-800 dark:text-blue-50 truncate">
                          {t(`categories_list.${cat.nom}`, cat.nom)}
                        </span>
                      </div>
                      {cat.percentage >= 100 && <AlertTriangle size={20} className="text-rose-500 animate-pulse" />}
                    </div>

                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-slate-700 dark:text-white leading-none">{cat.spent}</span>
                      <span className="text-sm font-medium text-slate-400 dark:text-blue-300/70 mb-0.5">/ {cat.budgetMax} {isEng ? 'MAD' : 'DH'}</span>
                    </div>
                    
                    <div className="w-full bg-slate-100 dark:bg-[#050B14] rounded-full h-3 overflow-hidden border dark:border-blue-900/50 mt-2">
                      <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${Math.min(cat.percentage, 100)}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[13px] text-slate-500 dark:text-blue-200/60 font-bold bg-slate-50 dark:bg-[#112240] px-2.5 py-1 rounded-lg border border-slate-100 dark:border-blue-800/50">
                        {cat.percentage}% {isEng ? 'used' : 'utilisé'}
                      </span>
                      <span className={`text-[13px] font-bold ${statusColor}`}>
                        {cat.isOverBudget 
                          ? `-${cat.spent - cat.budgetMax} ${isEng ? 'MAD' : 'DH'}` 
                          : `${isEng ? 'Left' : 'Reste'} ${cat.budgetMax - cat.spent} ${isEng ? 'MAD' : 'DH'}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Budgets;