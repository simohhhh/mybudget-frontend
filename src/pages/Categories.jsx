import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Tag, LogOut, Wallet, PlusCircle, Trash2, Pencil,
  AlertCircle, CheckCircle2, Palette, FileText, ArrowLeft, Plus, ArrowRightLeft,
  Heart, Gamepad2, Home, Utensils, GraduationCap, Bus,
  ShoppingCart, Users, Dumbbell, Shirt, Apple, Briefcase, Coffee, Plane,
  Car, Train, Ship, Bike, Fuel, Pizza, Croissant, Beer, Wine,
  Tv, Film, Music, Mic, Ticket, Smartphone, Laptop, Monitor, Mouse,
  Sofa, Bed, Bath, Lightbulb, Stethoscope, Syringe, Pill,
  Baby, Cat, Dog, CreditCard, Coins, Landmark, PiggyBank, Receipt,
  Gift, Scissors, Wrench, Umbrella, Globe
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const ICON_MAP = {
  Heart, Gamepad2, Home, Utensils, GraduationCap, Bus,
  ShoppingCart, Users, Dumbbell, Shirt, Apple, Briefcase, Coffee, Plane, FileText, Wallet,
  Car, Train, Ship, Bike, Fuel, Pizza, Croissant, Beer, Wine,
  Tv, Film, Music, Mic, Ticket, Smartphone, Laptop, Monitor, Mouse,
  Sofa, Bed, Bath, Lightbulb, Stethoscope, Syringe, Pill,
  Baby, Cat, Dog, CreditCard, Coins, Landmark, PiggyBank, Receipt,
  Gift, Scissors, Wrench, Umbrella, Globe
};

const PRESET_CATEGORIES = [
  { nom: 'Santé', couleur: '#ef4444', icone: 'Heart' },
  { nom: 'Loisirs', couleur: '#10b981', icone: 'Gamepad2' },
  { nom: 'Maison', couleur: '#3b82f6', icone: 'Home' },
  { nom: 'Alimentation', couleur: '#eab308', icone: 'Utensils' },
  { nom: 'Éducation', couleur: '#d946ef', icone: 'GraduationCap' },
  { nom: 'Transport', couleur: '#0ea5e9', icone: 'Bus' },
  { nom: 'Courses', couleur: '#6366f1', icone: 'ShoppingCart' },
  { nom: 'Famille', couleur: '#f43f5e', icone: 'Users' },
  { nom: 'Sport', couleur: '#22c55e', icone: 'Dumbbell' },
  { nom: 'Voyage', couleur: '#14b8a6', icone: 'Plane' },
  { nom: 'Vêtements', couleur: '#f59e0b', icone: 'Shirt' },
];

const MySwal = withReactContent(Swal);

function Categories() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isEng = i18n.language === 'en';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [uiMode, setUiMode] = useState('presets');
  const [newCat, setNewCat] = useState({ nom: '', couleur: '#3b82f6', icone: 'FileText', budgetMax: '' });

  const presetColors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#14b8a6', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'];

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleQuickAdd = async (preset) => {
    try {
      await api.post('/categories', preset);
      const motSucces = isEng ? 'successfully added!' : 'ajoutée !';
      const nomTraduit = t(`categories_list.${preset.nom}`, preset.nom);
      setStatus({ type: 'success', message: `${nomTraduit} ${motSucces}` });
      fetchCategories();
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      let errorMsg = err.response?.data?.message || t('categories.addError', isEng ? "Add error" : "Erreur d'ajout");
      if (errorMsg.includes('existante') || errorMsg.includes('utilisé')) {
        errorMsg = isEng ? 'This category already exists.' : 'Catégorie déjà existante.';
      }
      setStatus({ type: 'error', message: errorMsg });
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', newCat);
      setStatus({ type: 'success', message: t('categories.customSuccess', 'Catégorie sur-mesure créée !') });
      setNewCat({ nom: '', couleur: '#3b82f6', icone: 'FileText', budgetMax: '' });
      setUiMode('presets');
      fetchCategories();
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      let errorMsg = err.response?.data?.message || t('categories.addError', isEng ? "Creation error" : "Erreur de création");
      if (errorMsg.includes('existante') || errorMsg.includes('utilisé')) {
        errorMsg = isEng ? 'This category already exists.' : 'Catégorie déjà existante.';
      }
      setStatus({ type: 'error', message: errorMsg });
    }
  };

  const handleEditBudget = (cat) => {
    const isDark = document.documentElement.classList.contains('dark');
    
    MySwal.fire({
      title: isEng ? 'Edit Monthly Budget' : 'Modifier le budget mensuel',
      text: `${t('categories.name', 'Nom')} : ${t(`categories_list.${cat.nom}`, cat.nom)}`,
      input: 'number',
      inputValue: cat.budgetMax || '',
      inputPlaceholder: isEng ? 'Ex: 1500 (MAD)' : 'Ex: 1500 (DH)',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: isEng ? 'Save' : 'Enregistrer',
      cancelButtonText: isEng ? 'Cancel' : 'Annuler',
      background: isDark ? '#0A192F' : '#ffffff',
      color: isDark ? '#eff6ff' : '#0f172a',
      borderRadius: '1.5rem',
      inputValidator: (value) => {
        if (value && Number(value) < 0) {
          return isEng ? 'Budget cannot be negative' : 'Le budget ne peut pas être négatif';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const nouveauBudget = result.value ? Number(result.value) : 0;
          await api.put(`/categories/${cat._id}`, {
            nom: cat.nom,
            couleur: cat.couleur,
            icone: cat.icone,
            budgetMax: nouveauBudget
          });
          
          MySwal.fire({
            icon: 'success',
            title: isEng ? 'Updated!' : 'Mis à jour !',
            text: isEng ? 'Budget modified successfully.' : 'Le budget a bien été modifié.',
            timer: 2000,
            showConfirmButton: false,
            background: isDark ? '#0A192F' : '#ffffff',
            color: isDark ? '#eff6ff' : '#0f172a'
          });
          fetchCategories();
        } catch (err) {
          MySwal.fire({
            icon: 'error',
            title: isEng ? 'Error' : 'Erreur',
            text: isEng ? 'Could not modify budget.' : 'Impossible de modifier le budget.',
            background: isDark ? '#0A192F' : '#ffffff',
            color: isDark ? '#eff6ff' : '#0f172a'
          });
        }
      }
    });
  };

  const handleDelete = (id) => {
    const isDark = document.documentElement.classList.contains('dark');

    MySwal.fire({
      title: t('categories.deleteTitle', 'Supprimer cette catégorie ?'),
      text: t('categories.deleteWarning', "Vos transactions risquent de ne plus avoir de catégorie associée !"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('categories.confirmBtn', 'Oui, supprimer'),
      cancelButtonText: t('categories.cancelBtn', 'Annuler'),
      background: isDark ? '#0A192F' : '#ffffff',
      color: isDark ? '#eff6ff' : '#0f172a',
      borderRadius: '1.5rem'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/categories/${id}`);
          fetchCategories();
          MySwal.fire({
            title: t('categories.deletedTitle', 'Supprimée !'),
            text: t('categories.deletedMsg', 'La catégorie a bien été effacée.'),
            icon: 'success',
            confirmButtonColor: '#3b82f6',
            background: isDark ? '#0A192F' : '#ffffff',
            color: isDark ? '#eff6ff' : '#0f172a'
          });
        } catch (err) {
          MySwal.fire({
            title: t('categories.errorTitle', 'Erreur'),
            text: t('categories.errorMsg', 'Impossible de supprimer cette catégorie.'),
            icon: 'error',
            background: isDark ? '#0A192F' : '#ffffff',
            color: isDark ? '#eff6ff' : '#0f172a'
          });
        }
      }
    });
  };

  const RenderIcon = ({ name, size = 24, className = "" }) => {
    const IconComponent = ICON_MAP[name] || ICON_MAP['FileText'];
    return <IconComponent size={size} className={className} />;
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#f4f7fb] dark:bg-[#050B14] dark:text-blue-50 transition-colors duration-300">{isEng ? 'Loading...' : 'Chargement...'}</div>;

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7fb] dark:bg-[#050B14] flex font-sans text-slate-800 dark:text-blue-50 transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 shrink-0 bg-[#f4f7fb] dark:bg-[#050B14] pl-16 pr-4 md:px-8 flex justify-between items-center transition-colors duration-300">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('categories.pageTitle', 'Paramètres des Catégories')}</h1>
        </header>

        <div className="flex-1 px-4 md:px-8 pb-8 max-w-[1600px] w-full mx-auto overflow-hidden flex flex-col min-h-0">
          {status.message && (
            <div className={`shrink-0 flex items-center gap-2 p-4 rounded-xl mb-6 text-sm font-medium ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {status.message}
            </div>
          )}

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
            {/* ajout de categorie */}
            <div className="lg:col-span-1 flex flex-col min-h-0 gap-6">
              {uiMode === 'presets' ? (
                <div className="bg-white dark:bg-[#0A192F] p-8 rounded-[2rem] shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.05)] border border-slate-100 dark:border-blue-500/20 transition-colors flex-1 flex flex-col min-h-0">
                  <h2 className="text-xl font-bold text-slate-700 dark:text-blue-100 mb-6 shrink-0">{t('categories.quickAdd', 'Ajouter rapidement')}</h2>
                  <div className="flex-1 grid grid-cols-3 gap-y-6 gap-x-4 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                    {PRESET_CATEGORIES.map((preset) => (
                      <div key={preset.nom} onClick={() => handleQuickAdd(preset)} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110 active:scale-95" style={{ backgroundColor: preset.couleur }}>
                          <RenderIcon name={preset.icone} size={28} />
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-blue-300/70 text-center">
                          {t(`categories_list.${preset.nom}`, preset.nom)}
                        </span>
                      </div>
                    ))}
                    <div onClick={() => setUiMode('custom')} className="flex flex-col items-center gap-2 cursor-pointer group">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#112240] text-slate-500 dark:text-blue-300/70 shadow-sm transition-transform group-hover:scale-110 group-hover:bg-slate-200 dark:group-hover:bg-[#112240]/80 active:scale-95 border-2 border-dashed border-slate-300 dark:border-blue-800/50">
                        <Plus size={32} />
                      </div>
                      <span className="text-xs font-medium text-slate-500 dark:text-blue-300/70 text-center">{t('categories.create', 'Créer')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0A192F] p-8 rounded-[2rem] shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.05)] border border-slate-100 dark:border-blue-500/20 transition-colors flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                  <button onClick={() => setUiMode('presets')} className="flex items-center gap-2 text-sm text-slate-500 dark:text-blue-300/70 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition shrink-0">
                    <ArrowLeft size={16} /> {t('categories.back', 'Retour')}
                  </button>
                  <h2 className="text-xl font-bold text-slate-700 dark:text-blue-100 mb-6 shrink-0">{t('categories.customCat', 'Catégorie Sur-mesure')}</h2>
                  <form onSubmit={handleCustomSubmit} className="space-y-6 flex-1 flex flex-col">
                    <div className="shrink-0">
                      <label className="block text-sm font-bold text-slate-600 dark:text-blue-300/70 mb-2">{t('categories.name', 'Nom')}</label>
                      <input type="text" placeholder={t('categories.namePlaceholder', 'Ex: Cinéma...')} required maxLength="20" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-blue-800/50 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={newCat.nom} onChange={(e) => setNewCat({ ...newCat, nom: e.target.value })} />
                    </div>
                    <div className="shrink-0 mt-6">
                      <label className="block text-sm font-bold text-slate-600 dark:text-blue-300/70 mb-2">{isEng ? 'Max Monthly Budget (MAD)' : 'Budget Mensuel Max (DH)'}</label>
                      <input
                        type="number"
                        placeholder={isEng ? 'Ex: 1500 (Leave empty if no limit)' : 'Ex: 1500 (Laisser vide si pas de limite)'}
                        min="0"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-blue-800/50 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={newCat.budgetMax}
                        onChange={(e) => setNewCat({ ...newCat, budgetMax: e.target.value })}
                      />
                    </div>
                    <div className="shrink-0">
                      <label className="block text-sm font-bold text-slate-600 dark:text-blue-300/70 mb-2">{t('categories.chooseIcon', 'Choisir une icône')}</label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-slate-50 dark:bg-[#112240] p-3 rounded-xl border border-slate-200 dark:border-blue-800/50 h-40 overflow-y-auto custom-scrollbar">
                        {Object.keys(ICON_MAP).map(iconKey => (
                          <div key={iconKey} onClick={() => setNewCat({ ...newCat, icone: iconKey })} className={`p-2 flex justify-center items-center rounded-lg cursor-pointer transition ${newCat.icone === iconKey ? 'text-white shadow-md' : 'text-slate-500 dark:text-blue-300/70 hover:bg-slate-200 dark:hover:bg-[#112240]/80'}`} style={newCat.icone === iconKey ? { backgroundColor: newCat.couleur } : {}}>
                            <RenderIcon name={iconKey} size={20} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <label className="block text-sm font-bold text-slate-600 dark:text-blue-300/70 mb-3 flex items-center gap-2">
                        <Palette size={16} /> {t('categories.color', 'Couleur')}
                      </label>
                      <div className="grid grid-cols-6 gap-2 mb-3">
                        {presetColors.map(color => (
                          <div key={color} onClick={() => setNewCat({ ...newCat, couleur: color })} className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 ${newCat.couleur === color ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-cyan-300 scale-110' : ''}`} style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 dark:bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition shadow-lg mt-auto shrink-0">
                      {t('categories.createBtn', 'Créer la catégorie')}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* liste des categories existantes */}
            <div className="lg:col-span-2 flex flex-col min-h-0">
              <div className="bg-white dark:bg-[#0A192F] p-8 rounded-[2rem] shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.05)] border border-slate-100 dark:border-blue-500/20 flex-1 flex flex-col min-h-0 transition-colors">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <h2 className="text-xl font-bold text-slate-700 dark:text-blue-100">{t('categories.yourCategories', 'Vos Catégories')}</h2>
                  <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">{categories.length} {t('categories.total', 'total')}</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar min-h-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map(cat => (
                      <div key={cat._id} className="flex items-center justify-between p-4 bg-white dark:bg-[#0A192F] border border-slate-100 dark:border-[#112240] hover:border-slate-300 dark:hover:border-blue-500/50 hover:shadow-md rounded-2xl transition group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: cat.couleur || '#cbd5e1' }}>
                            <RenderIcon name={cat.icone} size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-blue-100">
                              {t(`categories_list.${cat.nom}`, cat.nom)}
                            </h4>
                            <p className="text-xs text-slate-400 dark:text-blue-400/50 font-medium mt-0.5">
                              {cat.budgetMax > 0 
                                ? (isEng ? `Budget: ${cat.budgetMax} MAD` : `Budget: ${cat.budgetMax} DH`) 
                                : (isEng ? 'No limit' : 'Pas de limite')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
                          <button onClick={() => handleEditBudget(cat)} className="text-slate-400 dark:text-blue-400/50 hover:text-blue-500 dark:hover:text-cyan-400 transition p-2 bg-slate-50 dark:bg-[#112240] hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl" title={isEng ? 'Edit Budget' : 'Modifier le budget'}>
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(cat._id)} className="text-slate-400 dark:text-blue-400/50 hover:text-rose-500 dark:hover:text-rose-400 transition p-2 bg-slate-50 dark:bg-[#112240] hover:bg-rose-50 dark:hover:bg-[#112240]/80 rounded-xl" title={t('categories.deleteTitle', 'Supprimer')}>
                            <Trash2 size={16} />
                          </button>
                        </div>

                      </div>
                    ))}
                    {categories.length === 0 && (
                      <div className="col-span-1 md:col-span-2 text-center py-12 text-slate-400 dark:text-blue-400/50">
                        <Tag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{t('categories.empty', 'Votre catalogue de catégories est vide.')}</p>
                        <p className="text-sm mt-2">{t('categories.emptyDesc', 'Cliquez sur une icône à gauche pour commencer.')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories;