import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowRight, 
  PieChart, 
  ShieldCheck, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const currentYear = new Date().getFullYear();

  const handleGetStarted = () => {
    navigate('/Register');
  };

  // Variantes d'animation pour gérer les apparitions en cascade
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#050B14] text-slate-800 dark:text-slate-100 transition-colors duration-500 font-sans relative overflow-hidden">
      
      {/* ==========================================
          ARRIÈRE-PLAN ANIMÉ (Blobs Lumineux)
      ========================================== */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] -right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-400/20 dark:bg-cyan-500/20 blur-[100px]"
        />
      </div>

      {/* ==========================================
          EN-TÊTE (NAVBAR)
      ========================================== */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full bg-white/70 dark:bg-[#050B14]/70 backdrop-blur-xl border-b border-slate-200 dark:border-blue-900/30 z-50 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src="/petit-logo.png" alt="Icône MyBudget" className="h-10 md:h-12 w-auto object-contain" />
            <div className="flex flex-col justify-center">
              <span className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                Adawn
              </span>
              <span className="text-[0.65rem] md:text-xs font-bold text-blue-600 dark:text-cyan-400 tracking-[0.2em] mt-0.5 uppercase">
                Gestion Budget
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={toggleDarkMode} 
              className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-blue-200 dark:hover:text-white bg-slate-100/50 hover:bg-slate-200 dark:bg-[#0A192F] dark:hover:bg-[#112240] rounded-full transition-all duration-300 shadow-sm dark:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-500" />}
            </button>

            <Link to="/Login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-blue-600 dark:text-blue-200 dark:hover:text-cyan-400 transition-colors">
              {t('landing.login', 'Se connecter')}
            </Link>

            <Link to="/Register" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-600 dark:to-cyan-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-105">
              {t('landing.register', "S'inscrire")}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ==========================================
          SECTION HERO (PRINCIPALE)
      ========================================== */}
      <main className="flex-1 pt-32 pb-16 flex flex-col items-center justify-center">
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[75vh]">
          
          {/* Contenu Texte Animé */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start text-left space-y-6 z-10"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-500/30 text-blue-600 dark:text-cyan-400 text-sm font-bold shadow-sm">
              <Sparkles size={16} /> Version 2.0 Intelligente
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-slate-900 dark:text-white tracking-tight">
              Gérez votre budget <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500">
                intelligemment.
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 dark:text-blue-200/80 max-w-lg leading-relaxed">
              {t('landing.heroSubtitle', 'Prenez le contrôle de votre budget, suivez vos dépenses au quotidien et atteignez vos objectifs financiers grâce à des outils intuitifs et sécurisés.')}
            </motion.p>
            
            <motion.div variants={itemVariants} className="pt-4 flex flex-col sm:flex-row w-full sm:w-auto gap-4">
              <button onClick={handleGetStarted} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-cyan-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/30 dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:scale-105 group">
                {t('landing.cta', 'Commencer gratuitement')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>

          {/* === IMAGE / ILLUSTRATION ANIMÉE EN LÉVITATION === */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative w-full z-10 flex items-center justify-center lg:justify-end"
          >
            {/* Animation de lévitation pure */}
            <motion.div 
              animate={{ y: [-15, 15, -15] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative w-full max-w-lg h-80 md:h-[450px] rounded-[3rem] shadow-2xl shadow-blue-500/20 dark:shadow-[0_0_40px_rgba(6,182,212,0.2)] border border-white dark:border-blue-500/20 overflow-hidden group bg-slate-100 dark:bg-[#0A192F]"
            >
              <img src="/hh.jfif" alt="Adawn Dashboard Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 dark:opacity-100 pointer-events-none transition-opacity"></div>
            </motion.div>
          </motion.div>
        </section>

        {/* ==========================================
            SECTION FONCTIONNALITÉS (Au Scroll)
        ========================================== */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full mt-24 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('landing.featuresTitle', 'CE QUE ADAWN VOUS OFFRE')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Carte 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-[#0A192F] p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-[0_0_15px_rgba(6,182,212,0.05)] border border-slate-100 dark:border-blue-500/20 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Wallet className="text-emerald-600 dark:text-emerald-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-blue-50 mb-3">
                {t('landing.feature1Title', 'Suivi intuitif')}
              </h3>
              <p className="text-slate-600 dark:text-blue-200/70 leading-relaxed">
                {t('landing.feature1Desc', 'Ajoutez vos revenus et dépenses en quelques clics. Catégorisez vos transactions pour une vision claire de votre budget.')}
              </p>
            </motion.div>

            {/* Carte 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-[#0A192F] p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-[0_0_15px_rgba(6,182,212,0.05)] border border-slate-100 dark:border-blue-500/20 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-blue-100 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <PieChart className="text-blue-600 dark:text-cyan-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-blue-50 mb-3">
                {t('landing.feature2Title', 'Statistiques claires')}
              </h3>
              <p className="text-slate-600 dark:text-blue-200/70 leading-relaxed">
                {t('landing.feature2Desc', 'Visualisez vos habitudes financières grâce à des graphiques dynamiques et des rapports mensuels exportables en PDF.')}
              </p>
            </motion.div>

            {/* Carte 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-[#0A192F] p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-[0_0_15px_rgba(6,182,212,0.05)] border border-slate-100 dark:border-blue-500/20 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-rose-100 dark:bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck className="text-rose-600 dark:text-rose-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-blue-50 mb-3">
                {t('landing.feature3Title', 'Sécurité renforcée')}
              </h3>
              <p className="text-slate-600 dark:text-blue-200/70 leading-relaxed">
                {t('landing.feature3Desc', 'Vos données vous appartiennent. Nous utilisons des standards de sécurité élevés pour garantir la confidentialité de vos finances.')}
              </p>
            </motion.div>

          </div>
        </section>
      </main>

      {/* ==========================================
          PIED DE PAGE (FOOTER)
      ========================================== */}
      <footer className="bg-white/50 dark:bg-[#050B14]/50 backdrop-blur-md border-t border-slate-200 dark:border-blue-900/30 py-8 transition-colors duration-300 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-4 text-sm font-medium text-slate-500 dark:text-blue-300/50">
          <p>
            {t('landing.footer', '© {{year}} Adawn. Tous droits réservés.', { year: currentYear })}
          </p>
        </div>
      </footer>

    </div>
  );
}