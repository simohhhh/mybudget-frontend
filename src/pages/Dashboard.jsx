import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { LayoutDashboard, Tag, Wallet, PlusCircle, ArrowDownRight, ArrowUpRight, Calendar, ArrowRightLeft, Download, Sun, Moon, Globe, ChevronDown, Sparkles, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import WelcomeOnboarding from '../components/WelcomeOnboarding';
import { useTheme } from '../context/ThemeContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTranslation } from 'react-i18next'; 

import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);
const MySwal = withReactContent(Swal);

function Dashboard() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t, i18n } = useTranslation(); 
  const isEng = i18n.language === 'en'; 
  
  const [allTransactions, setAllTransactions] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [timeFilter, setTimeFilter] = useState('month');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchDashboardData = async () => {
    try {
      const [resTx, resCat] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories')
      ]);
      setAllTransactions(resTx.data);
      setCategories(resCat.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const formatDevise = (montant) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(montant).replace('$', '') + (isEng ? ' MAD' : ' DH');
  const formatDeviseCompact = (montant) => Math.abs(montant) >= 100000 ? new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(montant) + (isEng ? ' MAD' : ' DH') : formatDevise(montant);
  const formaterDateCourte = (dateString) => new Date(dateString).toLocaleDateString(i18n.language || 'fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const getFilteredTransactions = () => {
    const now = new Date();
    return allTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      switch (timeFilter) {
        case 'day': return txDate.toDateString() === now.toDateString();
        case 'week':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
          startOfWeek.setHours(0, 0, 0, 0);
          return txDate >= startOfWeek && txDate <= now;
        case 'month': return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        case 'year': return txDate.getFullYear() === now.getFullYear();
        case 'custom':
          if (!customDates.start || !customDates.end) return true;
          const start = new Date(customDates.start); start.setHours(0, 0, 0, 0);
          const end = new Date(customDates.end); end.setHours(23, 59, 59, 999);
          return txDate >= start && txDate <= end;
        default: return true;
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const budgetTracking = categories
    .filter(cat => cat.budgetMax > 0)
    .map(cat => {
      const spentThisMonth = filteredTransactions
        .filter(tx => tx.type === 'depense' && tx.categorie?._id === cat._id)
        .reduce((sum, tx) => sum + tx.montant, 0);
      const percentage = Math.round((spentThisMonth / cat.budgetMax) * 100);
      const isOverBudget = spentThisMonth > cat.budgetMax;
      return { ...cat, spent: spentThisMonth, percentage, isOverBudget };
    })
    .filter(cat => cat.percentage >= 80) 
    .sort((a, b) => b.percentage - a.percentage);

  const genererRapportMensuel = () => {
    const [year, month] = reportMonth.split('-');
    const transactionsDuMois = allTransactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getFullYear() === parseInt(year) && d.getMonth() === parseInt(month) - 1;
    });

    if (transactionsDuMois.length === 0) {
      return MySwal.fire({ title: t('dashboard.emptyMonth', 'Mois vide'), text: t('dashboard.emptyMonthDesc', "Il n'y a aucune transaction pour ce mois."), icon: 'info', background: isDarkMode ? '#0B1120' : '#ffffff', color: isDarkMode ? '#fff' : '#1c1917', borderRadius: '1.5rem' });
    }

    const totRev = transactionsDuMois.filter(t => t.type === 'revenu').reduce((acc, t) => acc + t.montant, 0);
    const totDep = transactionsDuMois.filter(t => t.type === 'depense').reduce((acc, t) => acc + t.montant, 0);
    const soldeMois = totRev - totDep;
    const dateAffichage = new Date(year, month - 1).toLocaleDateString(i18n.language || 'fr-FR', { month: 'long', year: 'numeric' });

    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(30, 27, 75);
    doc.text(`Rapport financier : ${dateAffichage.charAt(0).toUpperCase() + dateAffichage.slice(1)}`, 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`Édité le : ${new Date().toLocaleDateString(i18n.language || 'fr-FR')}`, 14, 28);
    doc.setFontSize(11); doc.setTextColor(60); doc.text(`Total de Revenus : + ${formatDevise(totRev)}`, 20, 55); doc.text(`Total de Dépenses : - ${formatDevise(totDep)}`, 20, 62);
    doc.setFontSize(12); doc.setFont("helvetica", "bold");
    if (soldeMois >= 0) { doc.setTextColor(16, 185, 129); doc.text(`Excédent : + ${formatDevise(soldeMois)}`, 20, 72); } else { doc.setTextColor(244, 63, 94); doc.text(`Déficit : ${formatDevise(soldeMois)}`, 20, 72); }
    doc.setFontSize(14); doc.setTextColor(30, 27, 75); doc.setFont("helvetica", "normal"); doc.text("Liste détaillée des transactions", 14, 90);

    const tableColumn = ["Date", "Titre", "Catégorie", "Type", "Montant"];
    const tableRows = transactionsDuMois.map(tx => [
      new Date(tx.date).toLocaleDateString(i18n.language || 'fr-FR'), tx.titre,
      tx.categorie ? t(`categories_list.${tx.categorie.nom}`, tx.categorie.nom) : t('transactions.general', 'Général'),
      tx.type === 'revenu' ? 'Revenu' : 'Dépense', `${tx.type === 'revenu' ? '+' : '-'}${tx.montant} ${isEng ? 'MAD' : 'DH'}`
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 95, theme: 'grid', styles: { fontSize: 10, cellPadding: 3 }, headStyles: { fillColor: [30, 27, 75], textColor: [255, 255, 255], fontStyle: 'bold' }, alternateRowStyles: { fillColor: [245, 247, 250] } });
    doc.save(`MyBudget_Rapport_${reportMonth}.pdf`);
  };

  const totalRevenus = filteredTransactions.filter(t => t.type === 'revenu').reduce((acc, t) => acc + t.montant, 0);
  const totalDepenses = filteredTransactions.filter(t => t.type === 'depense').reduce((acc, t) => acc + t.montant, 0);
  const soldeGlobal = allTransactions.filter(t => t.type === 'revenu').reduce((acc, t) => acc + t.montant, 0) - allTransactions.filter(t => t.type === 'depense').reduce((acc, t) => acc + t.montant, 0);

  const depMap = {}; const revMap = {};
  filteredTransactions.forEach(tx => {
    const nomCat = tx.categorie?.nom || 'Général';
    const couleurCat = tx.categorie?.couleur || (tx.type === 'revenu' ? '#10b981' : '#f43f5e');
    if (tx.type === 'depense') { if (!depMap[nomCat]) depMap[nomCat] = { nom: nomCat, couleur: couleurCat, total: 0 }; depMap[nomCat].total += tx.montant; } 
    else { if (!revMap[nomCat]) revMap[nomCat] = { nom: nomCat, couleur: couleurCat, total: 0 }; revMap[nomCat].total += tx.montant; }
  });

  const depensesData = Object.values(depMap).sort((a, b) => b.total - a.total);
  const revenusData = Object.values(revMap).sort((a, b) => b.total - a.total);

  const optionsDoughnut = { maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } }, elements: { arc: { borderWidth: 0 } } };

  const doughnutDepenses = { labels: depensesData.length > 0 ? depensesData.map(c => t(`categories_list.${c.nom}`, c.nom)) : [t('dashboard.empty', 'Aucune dépense')], datasets: [{ data: depensesData.length > 0 ? depensesData.map(c => c.total) : [1], backgroundColor: depensesData.length > 0 ? depensesData.map(c => c.couleur) : [isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'] }] };
  const doughnutRevenus = { labels: revenusData.length > 0 ? revenusData.map(c => t(`categories_list.${c.nom}`, c.nom)) : [t('dashboard.empty', 'Aucun revenu')], datasets: [{ data: revenusData.length > 0 ? revenusData.map(c => c.total) : [1], backgroundColor: revenusData.length > 0 ? revenusData.map(c => c.couleur) : [isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'] }] };

  const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const slideUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } } };

  if (loading) return <div className="flex h-[100dvh] items-center justify-center bg-[#FDFBF7] dark:bg-[#05050A] text-[#4a3728] dark:text-cyan-500 font-bold tracking-widest">{isEng ? 'Loading...' : 'Chargement...'}</div>;

  return (
    <>
      <WelcomeOnboarding onComplete={fetchDashboardData} />
      
      <div className="relative h-[100dvh] w-full bg-[#FDFBF7] dark:bg-[#05050A] text-stone-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-500">
        
        {/* LUEURS ARRIÈRE-PLAN SUBTILES */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-amber-500/5 dark:bg-cyan-600/10 rounded-full blur-[120px]"></div>
        </div>

        {/* OVERLAY DE FOND */}
        <div className={`absolute inset-0 z-0 pointer-events-none transition-colors duration-500 ${isDarkMode ? 'bg-[#05050A]/70' : 'bg-[#FDFBF7]/40'}`}></div>

        <div className="relative z-10 flex h-full">
          <Sidebar />

          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            <header className="h-20 shrink-0 px-4 md:px-8 flex justify-between items-center bg-white/60 dark:bg-white/[0.02] border-b border-stone-200/50 dark:border-white/5 backdrop-blur-xl transition-colors duration-500">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/Transactions')} className="bg-[#4a3728] hover:bg-[#5c4431] text-white dark:bg-cyan-500/10 dark:text-cyan-400 dark:border dark:border-cyan-500/30 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md dark:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Sparkles size={16} /> <span className="hidden sm:inline">{t('header.add', 'Ajouter')}</span>
                </button>

                <div className="flex items-center bg-white/80 dark:bg-white/5 border border-stone-200/50 dark:border-white/10 rounded-xl overflow-hidden transition-colors backdrop-blur-md shadow-sm">
                  <div className="px-3 border-r border-stone-200/50 dark:border-white/10">
                    <input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="bg-transparent border-none text-sm font-bold text-stone-700 dark:text-slate-300 outline-none py-2 cursor-pointer" style={{ colorScheme: isDarkMode ? 'dark' : 'light' }} />
                  </div>
                  <button onClick={genererRapportMensuel} className="flex items-center gap-2 px-4 py-2 hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-cyan-400 font-bold text-sm transition-colors">
                    <Download size={16} /> <span className="hidden sm:inline">{isEng ? 'Report' : 'Rapport'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <button onClick={toggleDarkMode} className="p-3 bg-white/80 dark:bg-white/5 border border-stone-200/50 dark:border-white/10 rounded-xl text-stone-700 dark:text-slate-300 hover:text-cyan-400 hover:bg-stone-100 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none" title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}>
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </header>

            {/* CONTENEUR PRINCIPAL SCROLLABLE */}
            <div className="flex-1 px-4 lg:px-8 pb-6 max-w-[1600px] w-full mx-auto overflow-y-auto custom-scrollbar pt-6">
              
              <motion.div variants={staggerContainer} initial="hidden" animate="show">
                
                {/* FILTRES */}
                <motion.div variants={slideUp} className="flex flex-col md:flex-row items-start md:items-center mb-8 gap-4 bg-white/60 dark:bg-white/[0.03] p-2 rounded-2xl border border-stone-200/50 dark:border-white/5 backdrop-blur-md shadow-sm dark:shadow-none transition-colors duration-500">
                  <div className="flex gap-1 overflow-x-auto w-full md:w-auto p-1">
                    {['day', 'week', 'month', 'year', 'all'].map((filter) => {
                      const jsonKey = filter === 'day' ? 'today' : filter;
                      const fallbackTxt = filter === 'day' ? "Aujourd'hui" : filter === 'week' ? 'Semaine' : filter === 'month' ? 'Ce mois' : filter === 'year' ? 'Cette année' : 'Tout';
                      return (
                        <button key={filter} onClick={() => { setTimeFilter(filter); setShowCustomPicker(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${timeFilter === filter ? 'bg-[#4a3728] text-white dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 shadow-md' : 'text-stone-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'}`}>
                          {t(`filters.${jsonKey}`, fallbackTxt)} 
                        </button>
                      )
                    })}
                    <button onClick={() => { setTimeFilter('custom'); setShowCustomPicker(true); }} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${timeFilter === 'custom' ? 'bg-[#4a3728] text-white dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 shadow-md' : 'text-stone-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'}`}>
                      <Calendar size={16} /> {t('filters.custom', 'Personnalisée')}
                    </button>
                  </div>

                  {showCustomPicker && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/80 dark:bg-white/5 border border-stone-200/50 dark:border-white/10 rounded-xl shadow-sm">
                      <span className="text-sm font-bold text-stone-800 dark:text-cyan-400">{isEng ? 'From:' : 'Du:'}</span>
                      <input type="date" value={customDates.start} onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })} className="bg-transparent border-none text-sm text-stone-600 dark:text-slate-300 outline-none" style={{ colorScheme: isDarkMode ? 'dark' : 'light' }} />
                      <span className="text-sm font-bold text-stone-800 dark:text-cyan-400 ml-2">{isEng ? 'To:' : 'Au:'}</span>
                      <input type="date" value={customDates.end} onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })} className="bg-transparent border-none text-sm text-stone-600 dark:text-slate-300 outline-none" style={{ colorScheme: isDarkMode ? 'dark' : 'light' }} />
                    </div>
                  )}
                </motion.div>

                {/* BUDGET TRACKING */}
                {timeFilter === 'month' && budgetTracking.length > 0 && (
                  <motion.div variants={slideUp} className="mb-8 shrink-0">
                    <h3 className="text-sm font-bold text-rose-500 mb-3 uppercase tracking-wider ml-2 flex items-center gap-2 dark:drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">
                      <AlertTriangle size={16} /> {isEng ? `Budget Alerts (${budgetTracking.length})` : `Alertes Budget (${budgetTracking.length})`}
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                      {budgetTracking.map(cat => {
                        let barColor = 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
                        if (cat.percentage >= 100) barColor = 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.5)]';

                        return (
                          <div key={cat._id} className="min-w-[280px] bg-rose-50/50 dark:bg-rose-900/10 backdrop-blur-xl p-5 rounded-[1.5rem] shadow-sm border border-rose-200/80 dark:border-rose-500/30 flex flex-col gap-3 transition-colors duration-500">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: cat.couleur, boxShadow: `0 0 10px ${cat.couleur}` }}></div>
                                <span className="font-bold text-[15px] text-stone-800 dark:text-white truncate">
                                  {t(`categories_list.${cat.nom}`, cat.nom)}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 px-2 py-1 rounded-md border border-rose-200/50 dark:border-rose-500/20">
                                {cat.spent} / {cat.budgetMax} {isEng ? 'MAD' : 'DH'}
                              </span>
                            </div>
                            
                            <div className="w-full bg-stone-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${Math.min(cat.percentage, 100)}%` }}></div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-0.5">
                              <span className="text-[12px] text-rose-500 dark:text-rose-400 font-bold">
                                {cat.percentage >= 100 ? (isEng ? 'Budget exceeded!' : 'Budget dépassé !') : `${cat.percentage}% ${isEng ? 'used' : 'utilisé'}`}
                              </span>
                              <span className={`text-[12px] font-bold ${cat.isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-orange-500 dark:text-orange-400'}`}>
                                {cat.isOverBudget ? `-${cat.spent - cat.budgetMax} ${isEng ? 'MAD' : 'DH'}` : `${isEng ? 'Left' : 'Reste'} ${cat.budgetMax - cat.spent} ${isEng ? 'MAD' : 'DH'}`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 💡 VUE MOBILE UNIQUEMENT : CARTES GLOBALES EN PREMIER */}
                <motion.div variants={slideUp} className="grid grid-cols-2 gap-3 mb-6 lg:hidden">
                  <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-stone-200/50 dark:border-white/10 text-stone-800 dark:text-white shadow-md dark:shadow-none transition-colors duration-500">
                    <p className="text-[11px] text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t('dashboard.expenses', 'Dépenses')}</p>
                    <div className="flex justify-between items-center"><span className="font-bold text-rose-500 dark:text-rose-400 dark:drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">{formatDeviseCompact(totalDepenses)}</span></div>
                  </div>
                  <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-stone-200/50 dark:border-white/10 text-stone-800 dark:text-white shadow-md dark:shadow-none transition-colors duration-500">
                    <p className="text-[11px] text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t('dashboard.income', 'Revenus')}</p>
                    <div className="flex justify-between items-center"><span className="font-bold text-emerald-600 dark:text-emerald-400 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">{formatDeviseCompact(totalRevenus)}</span></div>
                  </div>
                  
                  <div className="col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-cyan-900/40 dark:to-purple-900/40 backdrop-blur-xl p-5 rounded-3xl border border-amber-200/60 dark:border-cyan-500/30 text-stone-800 dark:text-white shadow-lg dark:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-colors duration-500">
                    <p className="text-xs text-[#4a3728] dark:text-cyan-400 uppercase tracking-wide mb-1 dark:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">{t('dashboard.balance', 'Solde Global')}</p>
                    <span className="text-3xl font-black">{formatDevise(soldeGlobal)}</span>
                  </div>
                </motion.div>

                {/* GRILLE 3 COLONNES SANS ÉTIREMENT FORCÉ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* COLONNE 1 : REVENUS */}
                  <motion.div variants={slideUp} className="flex flex-col gap-6">
                    <div className="bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-5 lg:p-6 rounded-[2rem] border border-stone-200/50 dark:border-white/10 shadow-lg dark:shadow-xl transition-colors duration-500">
                      <h3 className="font-bold text-stone-800 dark:text-white mb-4">{t('dashboard.income', 'Revenus')}</h3>
                      <div className="relative h-32 lg:h-40 flex justify-center">
                        <Doughnut data={doughnutRevenus} options={optionsDoughnut} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 dark:drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">{formatDeviseCompact(totalRevenus)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-6 rounded-[2rem] border border-stone-200/50 dark:border-white/10 shadow-lg dark:shadow-xl min-h-[250px] transition-colors duration-500">
                      <h3 className="font-bold text-stone-800 dark:text-white mb-4">{t('dashboard.incomeDetails', 'Détails Revenus')}</h3>
                      <div className="overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-48">
                        {revenusData.map((cat, idx) => {
                          const pct = totalRevenus > 0 ? Math.round((cat.total / totalRevenus) * 100) : 0;
                          return (
                            <div key={idx}>
                              <div className="flex justify-between text-sm mb-1"><span className="font-bold text-stone-700 dark:text-slate-300">{t(`categories_list.${cat.nom}`, cat.nom)}</span><span className="text-[#4a3728] dark:text-cyan-400 font-mono">{pct}%</span></div>
                              <div className="w-full bg-stone-200 dark:bg-white/5 rounded-full h-1.5"><div className="h-1.5 rounded-full shadow-sm dark:shadow-[0_0_10px_currentColor]" style={{ width: `${pct}%`, backgroundColor: cat.couleur, color: cat.couleur }}></div></div>
                            </div>
                          );
                        })}
                        {revenusData.length === 0 && <p className="text-sm text-stone-400 dark:text-slate-500 italic">{t('dashboard.empty', 'Aucune transaction.')}</p>}
                      </div>
                    </div>
                  </motion.div>

                  {/* COLONNE 2 : DÉPENSES */}
                  <motion.div variants={slideUp} className="flex flex-col gap-6">
                    <div className="bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-5 lg:p-6 rounded-[2rem] border border-stone-200/50 dark:border-white/10 shadow-lg dark:shadow-xl transition-colors duration-500">
                      <h3 className="font-bold text-stone-800 dark:text-white mb-4">{t('dashboard.expenses', 'Dépenses')}</h3>
                      <div className="relative h-32 lg:h-40 flex justify-center">
                        <Doughnut data={doughnutDepenses} options={optionsDoughnut} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-xl font-bold text-rose-500 dark:text-rose-400 dark:drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">{formatDeviseCompact(totalDepenses)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-6 rounded-[2rem] border border-stone-200/50 dark:border-white/10 shadow-lg dark:shadow-xl min-h-[250px] transition-colors duration-500">
                      <h3 className="font-bold text-stone-800 dark:text-white mb-4">{t('dashboard.expensesDetails', 'Détails Dépenses')}</h3>
                      <div className="overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-48">
                        {depensesData.map((cat, idx) => {
                          const pct = totalDepenses > 0 ? Math.round((cat.total / totalDepenses) * 100) : 0;
                          return (
                            <div key={idx}>
                              <div className="flex justify-between text-sm mb-1"><span className="font-bold text-stone-700 dark:text-slate-300">{t(`categories_list.${cat.nom}`, cat.nom)}</span><span className="text-rose-500 dark:text-rose-400 font-mono">{pct}%</span></div>
                              <div className="w-full bg-stone-200 dark:bg-white/5 rounded-full h-1.5"><div className="h-1.5 rounded-full shadow-sm dark:shadow-[0_0_10px_currentColor]" style={{ width: `${pct}%`, backgroundColor: cat.couleur, color: cat.couleur }}></div></div>
                            </div>
                          );
                        })}
                        {depensesData.length === 0 && <p className="text-sm text-stone-400 dark:text-slate-500 italic">{t('dashboard.empty', 'Aucune transaction.')}</p>}
                      </div>
                    </div>
                  </motion.div>

                  {/* COLONNE 3 : GLOBALES ET TRANSACTIONS */}
                  <motion.div variants={slideUp} className="flex flex-col gap-6">
                    
                    {/* 💡 VUE DESKTOP UNIQUEMENT : CARTES GLOBALES */}
                    <div className="hidden lg:grid grid-cols-2 gap-3">
                      <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-stone-200/50 dark:border-white/10 text-stone-800 dark:text-white shadow-md dark:shadow-none transition-colors duration-500">
                        <p className="text-[11px] text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t('dashboard.expenses', 'Dépenses')}</p>
                        <div className="flex justify-between items-center"><span className="font-bold text-rose-500 dark:text-rose-400 dark:drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">{formatDeviseCompact(totalDepenses)}</span></div>
                      </div>
                      <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-stone-200/50 dark:border-white/10 text-stone-800 dark:text-white shadow-md dark:shadow-none transition-colors duration-500">
                        <p className="text-[11px] text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t('dashboard.income', 'Revenus')}</p>
                        <div className="flex justify-between items-center"><span className="font-bold text-emerald-600 dark:text-emerald-400 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">{formatDeviseCompact(totalRevenus)}</span></div>
                      </div>
                      
                      <div className="col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-cyan-900/40 dark:to-purple-900/40 backdrop-blur-xl p-5 rounded-3xl border border-amber-200/60 dark:border-cyan-500/30 text-stone-800 dark:text-white shadow-lg dark:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-colors duration-500">
                        <p className="text-xs text-[#4a3728] dark:text-cyan-400 uppercase tracking-wide mb-1 dark:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">{t('dashboard.balance', 'Solde Global')}</p>
                        <span className="text-3xl font-black">{formatDevise(soldeGlobal)}</span>
                      </div>
                    </div>

                    <div className="bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl p-6 rounded-[2rem] border border-stone-200/50 dark:border-white/10 shadow-lg dark:shadow-xl flex flex-col transition-colors duration-500">
                      <div className="flex justify-between items-center mb-6 shrink-0">
                        <h3 className="font-bold text-stone-800 dark:text-white">{t('dashboard.transactions', 'Transactions')}</h3>
                        <span onClick={() => navigate('/Transactions')} className="text-xs font-bold text-[#4a3728] dark:text-cyan-400 cursor-pointer hover:underline dark:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">{t('dashboard.seeAll', 'Voir tout')}</span>
                      </div>
                      <div className="overflow-y-auto pr-2 custom-scrollbar space-y-2 max-h-[350px]">
                        {filteredTransactions.slice(0, 200).map((tx) => (
                          <div key={tx._id} className="flex justify-between items-center bg-stone-50 dark:bg-white/5 p-3 rounded-xl border border-stone-100 dark:border-white/5 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors">
                            <div>
                              <h4 className="text-sm font-bold text-stone-800 dark:text-white leading-tight">{tx.titre}</h4>
                              <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">
                                {tx.categorie ? t(`categories_list.${tx.categorie.nom}`, tx.categorie.nom) : t('transactions.general', 'Général')} • {formaterDateCourte(tx.date)}
                              </p>
                            </div>
                            <span className={`text-sm font-bold ${tx.type === 'revenu' ? 'text-emerald-600 dark:text-emerald-400 dark:drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]' : 'text-rose-500 dark:text-rose-400 dark:drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]'}`}>
                              {tx.type === 'revenu' ? '+' : '-'}{formatDevise(tx.montant)}
                            </span>
                          </div>
                        ))}
                        {filteredTransactions.length === 0 && <p className="text-sm text-stone-400 dark:text-slate-500 italic p-2">{t('dashboard.empty', 'Aucune transaction.')}</p>}
                      </div>
                    </div>
                  </motion.div>

                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;