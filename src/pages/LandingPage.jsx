import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Wallet, 
  ArrowRight, 
  PieChart, 
  ShieldCheck, 
  Sun, 
  Moon,
  Sparkles,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const currentYear = new Date().getFullYear();

  // === LOGIQUE DE PROFONDEUR 3D (SOURIS) ===
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Ajout d'un effet "ressort" (spring) pour que le mouvement soit fluide et non saccadé
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transformation des coordonnées de la souris en angles de rotation (X et Y)
  const rotateX = useTransform(smoothY, [-250, 250], [15, -15]);
  const rotateY = useTransform(smoothX, [-250, 250], [-15, 15]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleGetStarted = () => navigate('/Register');

  // Variantes d'animation d'entrée
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#050B14] text-slate-800 dark:text-slate-100 transition-colors duration-500 font-sans relative overflow-hidden">
      
      {/* ==========================================
          ARRIÈRE-PLAN PROFOND (Grille & Blobs)
      ========================================== */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Grille de fond style Cyberpunk */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[30%] -right-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[120px]"
        />
      </div>

      {/* ==========================================
          EN-TÊTE (NAVBAR)
      ========================================== */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full bg-white/70 dark:bg-[#050B14]/70 backdrop-blur-xl border-b border-slate-200 dark:border-blue-900/30 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src="/petit-logo.png" alt="Icône Adawn" className="h-10 md:h-12 w-auto object-contain" />
            <div className="flex flex-col justify-center">
              <span className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">Adawn</span>
              <span className="text-[0.65rem] md:text-xs font-bold text-blue-600 dark:text-cyan-400 tracking-[0.2em] mt-0.5 uppercase">Gestion Budget</span>
            </div>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={toggleDarkMode} className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-blue-200 dark:hover:text-white bg-slate-100/50 hover:bg-slate-200 dark:bg-[#0A192F] dark:hover:bg-[#112240] rounded-full transition-all duration-300 shadow-sm dark:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-500" />}
            </button>
            <Link to="/Login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-blue-600 dark:text-blue-200 dark:hover:text-cyan-400 transition-colors">
              {t('landing.login', 'Se connecter')}
            </Link>
            <Link to="/Register" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-600 dark:to-cyan-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:-translate-y-0.5 hover:scale-105">
              {t('landing.register', "S'inscrire")}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ==========================================
          SECTION HERO
      ========================================== */}
      <main className="flex-1 pt-32 pb-16 flex flex-col items-center justify-center z-10 relative">
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[75vh]">
          
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-start text-left space-y-6">
            

            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-slate-900 dark:text-white tracking-tight">
              Gérer votre budget <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500">
                facilement.
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 dark:text-blue-200/80 max-w-lg leading-relaxed">
              Prenez le contrôle de votre budget, suivez vos dépenses au quotidien et atteignez vos objectifs financiers grâce à des outils intuitifs et sécurisés.
            </motion.p>
            
            <motion.div variants={itemVariants} className="pt-4 flex flex-col sm:flex-row w-full sm:w-auto gap-4">
              <button onClick={handleGetStarted} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-cyan-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/30 dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:scale-105 group relative overflow-hidden">
                <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:animate-[shine_1.5s_ease-in-out_infinite] skew-x-12 -translate-x-full"></span>
                {t('landing.cta', 'Commencer gratuitement')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>

          {/* === EFFET 3D PARALLAXE MULTI-COUCHES === */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="relative w-full z-10 flex items-center justify-center lg:justify-end perspective-[1200px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Conteneur principal avec la rotation 3D */}
            <motion.div 
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative w-full max-w-lg cursor-default"
            >
              {/* L'image de fond (Layer 1) */}
              <div className="relative h-80 md:h-[450px] rounded-[2.5rem] shadow-2xl shadow-blue-500/20 dark:shadow-[0_20px_50px_rgba(6,182,212,0.2)] border border-white/50 dark:border-blue-500/20 overflow-hidden bg-slate-100 dark:bg-[#0A192F]">
                <img src="/hh.jfif" alt="Adawn App" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent opacity-0 dark:opacity-80"></div>
              </div>

              {/* Badge Flottant 1 (Layer 2 - Pop-out effect) */}
              <motion.div 
                style={{ translateZ: 80 }} // Fait "sortir" l'élément vers l'utilisateur
                className="absolute -right-6 top-12 bg-white/90 dark:bg-[#112240]/90 backdrop-blur-md p-4 rounded-2xl shadow-xl dark:shadow-[0_0_20px_rgba(6,182,212,0.2)] border border-white dark:border-blue-500/30 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <ArrowUpRight size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-blue-300/70 font-bold uppercase tracking-wider">Revenus du mois</p>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-white">+ 4 500 DH</p>
                </div>
              </motion.div>

              {/* Badge Flottant 2 (Layer 3 - Pop-out effect différent) */}
              <motion.div 
                style={{ translateZ: 120 }} // Sort encore plus que le premier
                className="absolute -left-8 bottom-16 bg-white/90 dark:bg-[#0A192F]/90 backdrop-blur-md p-4 rounded-2xl shadow-xl dark:shadow-[0_0_20px_rgba(59,130,246,0.2)] border border-white dark:border-cyan-500/30 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <Activity size={16} className="text-blue-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-blue-300/70 font-bold uppercase tracking-wider">Budget Actif</p>
                  <div className="w-24 h-1.5 bg-slate-200 dark:bg-[#050B14] rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 w-[65%]"></div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

        </section>

        {/* ==========================================
            SECTION FONCTIONNALITÉS (Au Scroll)
        ========================================== */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full mt-32 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ce que Adawn vous offre
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Wallet, color: "emerald", title: "Suivi Intuitif", desc: "Ajoutez vos revenus et dépenses en un clin d'œil. La catégorisation n'a jamais été aussi simple et rapide." },
              { icon: PieChart, color: "blue", title: "Analytique Profonde", desc: "Visualisez vos flux financiers avec des graphiques dynamiques et générez des rapports PDF détaillés." },
              { icon: ShieldCheck, color: "rose", title: "Sécurité & Contrôle", desc: "Base de données chiffrée et architecture moderne. Vos informations financières restent strictement privées." }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white/80 dark:bg-[#0A192F]/80 backdrop-blur-lg p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-[0_0_20px_rgba(6,182,212,0.05)] border border-white dark:border-blue-500/20"
              >
                <div className={`w-14 h-14 bg-${feat.color}-100 dark:bg-${feat.color}-500/20 rounded-2xl flex items-center justify-center mb-6`}>
                  <feat.icon className={`text-${feat.color}-600 dark:text-${feat.color}-400`} size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-blue-50 mb-3">{feat.title}</h3>
                <p className="text-slate-600 dark:text-blue-200/70 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-white/50 dark:bg-[#050B14]/50 backdrop-blur-md border-t border-slate-200 dark:border-blue-900/30 py-8 z-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm font-medium text-slate-500 dark:text-blue-300/50">
          <p>© {currentYear} Adawn.</p>
        </div>
      </footer>

      {/* Ajout d'une petite animation CSS pure pour le bouton */}
      <style dangerouslySetAttribute={{__html: `
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(12deg); }
          100% { transform: translateX(200%) skewX(12deg); }
        }
      `}} />
    </div>
  );
}