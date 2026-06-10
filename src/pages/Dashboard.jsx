import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { LayoutDashboard, PlusCircle, ArrowDownRight, ArrowUpRight, Calendar, Download, Sun, Moon } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import WelcomeOnboarding from '../components/WelcomeOnboarding';
import { useTheme } from '../context/ThemeContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTranslation } from 'react-i18next';

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

  const formatDevise = (montant) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
      .format(montant).replace('$', '') + (isEng ? ' MAD' : ' DH');
  };

  const formatDeviseCompact = (montant) => {
    if (Math.abs(montant) >= 100000) {
      return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(montant) + (isEng ? ' MAD' : ' DH');
    }
    return formatDevise(montant);
  };

  const formaterDateCourte = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language || 'fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

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

  const genererRapportMensuel = () => {
    const [year, month] = reportMonth.split('-');
    const transactionsDuMois = allTransactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getFullYear() === parseInt(year) && d.getMonth() === parseInt(month) - 1;
    });

    if (transactionsDuMois.length === 0) {
      MySwal.fire({
        title: t('dashboard.emptyMonth', 'Mois vide'),
        text: t('dashboard.emptyMonthDesc', "Il n'y a aucune transaction pour ce mois."),
        icon: 'info',
        confirmButtonColor: '#3b82f6',
        background: isDarkMode ? '#0A192F' : '#ffffff',
        color: isDarkMode ? '#eff6ff' : '#0f172a',
        borderRadius: '1.5rem'
      });
      return;
    }

    const totRev = transactionsDuMois.filter(t => t.type === 'revenu').reduce((acc, t) => acc + t.montant, 0);
    const totDep = transactionsDuMois.filter(t => t.type === 'depense').reduce((acc, t) => acc + t.montant, 0);
    const soldeMois = totRev - totDep;
    const dateAffichage = new Date(year, month - 1).toLocaleDateString(i18n.language || 'fr-FR', { month: 'long', year: 'numeric' });

    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(30, 27, 75); doc.text(`Rapport financier : ${dateAffichage.charAt(0).toUpperCase() + dateAffichage.slice(1)}`, 14, 20);
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
    doc.save(`Adawn_Rapport_${reportMonth}.pdf`);
  };

  const totalRevenus = filteredTransactions.filter(t => t.type === 'revenu').reduce((acc, t) => acc + t.montant, 0);
  const totalDepenses = filteredTransactions.filter(t => t.type === 'depense').reduce((acc, t) => acc + t.montant, 0);
  const soldeGlobal = allTransactions.filter(t => t.type === 'revenu').reduce((acc, t) => acc + t.montant, 0) - allTransactions.filter(t => t.type === 'depense').reduce((acc, t) => acc + t.montant, 0);

  const depMap = {}; const revMap = {};
  filteredTransactions.forEach(tx => {
    const nomCat = tx.categorie?.nom || 'Général'; const couleurCat = tx.categorie?.couleur || (tx.type === 'revenu' ? '#10b981' : '#f43f5e');
    if (tx.type === 'depense') { if (!depMap[nomCat]) depMap[nomCat] = { nom: nomCat, couleur: couleurCat, total: 0 }; depMap[nomCat].total += tx.montant; } 
    else { if (!revMap[nomCat]) revMap[nomCat] = { nom: nomCat, couleur: couleurCat, total: 0 }; revMap[nomCat].total += tx.montant; }
  });

  const depensesData = Object.values(depMap).sort((a, b) => b.total - a.total);
  const revenusData = Object.values(revMap).sort((a, b) => b.total - a.total);

  const optionsDoughnut = { maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } };
  const doughnutDepenses = { labels: depensesData.length > 0 ? depensesData.map(c => t(`categories_list.${c.nom}`, c.nom)) : [t('dashboard.empty', 'Aucune dépense')], datasets: [{ data: depensesData.length > 0 ? depensesData.map(c => c.total) : [1], backgroundColor: depensesData.length > 0 ? depensesData.map(c => c.couleur) : [isDarkMode ? '#112240' : '#f1f5f9'], borderWidth: 0, hoverOffset: 4 }] };
  const doughnutRevenus = { labels: revenusData.length > 0 ? revenusData.map(c => t(`categories_list.${c.nom}`, c.nom)) : [t('dashboard.empty', 'Aucun revenu')], datasets: [{ data: revenusData.length > 0 ? revenusData.map(c => c.total) : [1], backgroundColor: revenusData.length > 0 ? revenusData.map(c => c.couleur) : [isDarkMode ? '#112240' : '#f1f5f9'], borderWidth: 0, hoverOffset: 4 }] };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#f4f7fb] dark:bg-[#050B14] text-slate-800 dark:text-blue-50 transition-colors duration-300">Chargement...</div>;

  return (
    <>
      <WelcomeOnboarding onComplete={fetchDashboardData} />
      <div className="h-screen overflow-hidden bg-[#f4f7fb] dark:bg-[#050B14] flex font-sans text-slate-800 dark:text-blue-50 transition-colors duration-300">
        <Sidebar />

        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className="h-20 shrink-0 pl-16 pr-4 md:px-8 flex justify-between items-center bg-[#f4f7fb]/80 dark:bg-[#050B14]/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-300 border-b border-transparent dark:border-blue-900/30">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/Transactions')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg dark:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 transition-all">
                <PlusCircle size={16} /> <span className="hidden sm:inline ml-2">{t('header.add', 'Ajouter')}</span>
              </button>

              <div className="flex items-center bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-blue-500/30 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden px-3">
                <input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="bg-transparent border-none text-[11px] md:text-sm font-bold text-slate-700 dark:text-blue-100 outline-none py-2 cursor-pointer" />
                <button onClick={genererRapportMensuel} className="flex items-center justify-center p-2.5 ml-2 md:px-4 md:py-2 bg-slate-50 dark:bg-[#112240] hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-600 dark:text-cyan-400 font-bold transition-colors rounded-lg">
                  <Download size={18} /> <span className="hidden sm:inline ml-2 text-sm">{isEng ? 'Report' : 'Rapport'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div onClick={toggleDarkMode} className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-blue-500/30 text-slate-600 dark:text-cyan-300 rounded-xl font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-[#112240] transition-all hover:shadow-md">
                <span className="text-sm hidden sm:block">
                  {isDarkMode ? t('header.lightMode', 'Mode Clair') : t('header.darkMode', 'Mode Sombre')}
                </span>
                {isDarkMode ? <Sun size={18} className="text-amber-500 dark:text-amber-400" /> : <Moon size={18} className="text-indigo-500" />}
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 md:px-8 pb-24 max-w-[1600px] w-full mx-auto overflow-y-auto custom-scrollbar flex flex-col pt-4">
            
            <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white dark:bg-[#0A192F] p-2 rounded-2xl shadow-lg dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-blue-500/20">
              <div className="flex gap-1 overflow-x-auto w-full md:w-auto p-1">
                {['day', 'week', 'month', 'year', 'all'].map((filter) => {
                  const jsonKey = filter === 'day' ? 'today' : filter;
                  const fallbackTxt = filter === 'day' ? "Aujourd'hui" : filter === 'week' ? 'Semaine' : filter === 'month' ? 'Ce mois' : filter === 'year' ? 'Cette année' : 'Tout';
                  return (
                    <button key={filter} onClick={() => { setTimeFilter(filter); setShowCustomPicker(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${timeFilter === filter ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-cyan-600 text-white shadow-md' : 'text-slate-500 dark:text-blue-200/60 hover:bg-slate-100 dark:hover:bg-[#112240]'}`}>
                      {t(`filters.${jsonKey}`, fallbackTxt)} 
                    </button>
                  )
                })}
                <button onClick={() => { setTimeFilter('custom'); setShowCustomPicker(true); }} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${timeFilter === 'custom' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#112240]'}`}>
                  <Calendar size={16} /> {t('filters.custom', 'Personnalisée')}
                </button>
              </div>

              {showCustomPicker && (
                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-[#112240] rounded-xl animate-fade-in border border-indigo-100 dark:border-blue-500/30">
                  <span className="text-sm font-bold text-indigo-800 dark:text-cyan-400">{isEng ? 'From:' : 'Du:'}</span>
                  <input type="date" value={customDates.start} onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })} className="bg-white dark:bg-[#050B14] rounded-lg px-2 py-1 text-sm outline-none shadow-sm" />
                  <span className="text-sm font-bold text-indigo-800 dark:text-cyan-400 ml-2">{isEng ? 'To:' : 'Au:'}</span>
                  <input type="date" value={customDates.end} onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })} className="bg-white dark:bg-[#050B14] rounded-lg px-2 py-1 text-sm outline-none shadow-sm" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-4">
                <div className="shrink-0 bg-white dark:bg-[#0A192F] p-5 rounded-[2rem] shadow-xl hover:-translate-y-1 transition-all border border-slate-100 dark:border-blue-500/20">
                  <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700 dark:text-blue-50">{t('dashboard.income', 'Revenus')}</h3></div>
                  <div className="relative h-40 flex justify-center">
                    <Doughnut data={doughnutRevenus} options={optionsDoughnut} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold text-emerald-500 w-full px-4 text-center truncate">{formatDeviseCompact(totalRevenus)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col bg-white dark:bg-[#0A192F] p-5 rounded-[2rem] shadow-xl hover:-translate-y-1 transition-all border border-slate-100 dark:border-blue-500/20 h-64">
                  <div className="shrink-0 flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700 dark:text-blue-50">{t('dashboard.incomeDetails', 'Détails Revenus')}</h3></div>
                  <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-4">
                    {revenusData.map((cat, idx) => {
                      const pct = totalRevenus > 0 ? Math.round((cat.total / totalRevenus) * 100) : 0;
                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1"><span className="font-bold text-slate-700 dark:text-blue-100">{t(`categories_list.${cat.nom}`, cat.nom)}</span><span className="text-slate-500">{pct}%</span></div>
                          <div className="w-full bg-slate-100 dark:bg-[#050B14] rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.couleur }}></div></div>
                        </div>
                      );
                    })}
                    {revenusData.length === 0 && <p className="text-sm text-slate-400 italic">{t('dashboard.empty', 'Aucune transaction.')}</p>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="shrink-0 bg-white dark:bg-[#0A192F] p-5 rounded-[2rem] shadow-xl hover:-translate-y-1 transition-all border border-slate-100 dark:border-blue-500/20">
                  <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700 dark:text-blue-50">{t('dashboard.expenses', 'Dépenses')}</h3></div>
                  <div className="relative h-40 flex justify-center">
                    <Doughnut data={doughnutDepenses} options={optionsDoughnut} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold text-rose-500 w-full px-4 text-center truncate">{formatDeviseCompact(totalDepenses)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col bg-white dark:bg-[#0A192F] p-5 rounded-[2rem] shadow-xl hover:-translate-y-1 transition-all border border-slate-100 dark:border-blue-500/20 h-64">
                  <div className="shrink-0 flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700 dark:text-blue-50">{t('dashboard.expensesDetails', 'Détails Dépenses')}</h3></div>
                  <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-4">
                    {depensesData.map((cat, idx) => {
                      const pct = totalDepenses > 0 ? Math.round((cat.total / totalDepenses) * 100) : 0;
                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1"><span className="font-bold text-slate-700 dark:text-blue-100">{t(`categories_list.${cat.nom}`, cat.nom)}</span><span className="text-slate-500">{pct}%</span></div>
                          <div className="w-full bg-slate-100 dark:bg-[#050B14] rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.couleur }}></div></div>
                        </div>
                      );
                    })}
                    {depensesData.length === 0 && <p className="text-sm text-slate-400 italic">{t('dashboard.empty', 'Aucune transaction.')}</p>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="shrink-0 grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-rose-400 to-rose-500 dark:from-[#0A192F] dark:to-[#050B14] p-4 rounded-3xl text-white dark:border dark:border-rose-500/30 shadow-lg hover:-translate-y-1 transition-all">
                    <p className="text-[11px] opacity-90 mb-1 uppercase tracking-wide">{t('dashboard.expenses', 'Dépenses')}</p>
                    <div className="flex items-center justify-between"><span className="text-lg font-bold dark:text-rose-400">{formatDevise(totalDepenses)}</span><ArrowDownRight size={16} className="opacity-80 dark:text-rose-400" /></div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 dark:from-[#0A192F] dark:to-[#050B14] p-4 rounded-3xl text-white dark:border dark:border-emerald-500/30 shadow-lg hover:-translate-y-1 transition-all">
                    <p className="text-[11px] opacity-90 mb-1 uppercase tracking-wide">{t('dashboard.income', 'Revenus')}</p>
                    <div className="flex items-center justify-between"><span className="text-lg font-bold dark:text-emerald-400">{formatDevise(totalRevenus)}</span><ArrowUpRight size={16} className="opacity-80 dark:text-emerald-400" /></div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-[#0A192F] dark:to-[#0A192F] p-4 rounded-3xl text-white dark:border dark:border-cyan-500/40 shadow-lg col-span-2 hover:-translate-y-1 transition-all relative overflow-hidden">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 dark:opacity-20 blur-xl"></div>
                    <div className="relative">
                      <p className="text-[17px] opacity-90 dark:text-cyan-400 mb-1 uppercase tracking-wide">{t('dashboard.balance', 'Solde Global')}</p>
                      <div className="flex items-center justify-between"><span className="text-2xl font-bold tracking-tight dark:text-white">{formatDevise(soldeGlobal)}</span></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col bg-white dark:bg-[#0A192F] p-5 rounded-[2rem] shadow-xl hover:-translate-y-1 transition-all border border-slate-100 dark:border-blue-500/20 h-96 lg:h-[450px]">
                  <div className="shrink-0 flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700 dark:text-blue-50">{t('dashboard.transactions', 'Transactions')}</h3>
                    <span onClick={() => navigate('/Transactions')} className="text-xs font-bold text-blue-600 dark:text-cyan-400 cursor-pointer hover:underline">{t('dashboard.seeAll', 'Voir tout')}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-1">
                    {filteredTransactions.slice(0, 200).map((tx) => (
                      <div key={tx._id} className="flex justify-between items-center p-2.5 hover:bg-slate-50 dark:hover:bg-[#112240] rounded-xl transition-colors">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-blue-100 leading-tight">{tx.titre}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {tx.categorie ? t(`categories_list.${tx.categorie.nom}`, tx.categorie.nom) : t('transactions.general', 'Général')} • {formaterDateCourte(tx.date)}
                          </p>
                        </div>
                        <span className={`text-sm font-bold ${tx.type === 'revenu' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {tx.type === 'revenu' ? '+' : '-'}{formatDevise(tx.montant)}
                        </span>
                      </div>
                    ))}
                    {filteredTransactions.length === 0 && <p className="text-sm text-slate-400 italic p-2">{t('dashboard.empty', 'Aucune transaction.')}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;