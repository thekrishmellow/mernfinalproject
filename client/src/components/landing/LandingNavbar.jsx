import React, { useState, useEffect } from 'react';
import { Compass, ArrowRight, Menu, X, Sparkles } from 'lucide-react';

export function LandingNavbar({ onSelectAuthTab }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAuth = (tab = 'login') => {
    if (onSelectAuthTab) {
      onSelectAuthTab(tab);
    }
    setMobileMenuOpen(false);
    const element = document.getElementById('auth-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-black/40 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 animate-pulse-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white">Pathfinder</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Journey OS
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">Guided Learning Architecture</span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 rounded-full px-3 py-1.5 backdrop-blur-md">
            {[
              { id: 'scene-problem', label: 'The Problem' },
              { id: 'scene-transformation', label: 'The Blueprint' },
              { id: 'scene-creator', label: 'Studio' },
              { id: 'scene-milestones', label: 'Milestones' },
              { id: 'scene-progression', label: 'Progression' },
              { id: 'scene-perspectives', label: 'Perspectives' }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Direct Auth Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => scrollToAuth('login')}
              className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => scrollToAuth('register')}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-2xl bg-slate-900/95 border border-slate-800/90 backdrop-blur-2xl space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => scrollToSection('scene-problem')}
                className="p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300"
              >
                The Problem
              </button>
              <button
                onClick={() => scrollToSection('scene-transformation')}
                className="p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300"
              >
                The Blueprint
              </button>
              <button
                onClick={() => scrollToSection('scene-creator')}
                className="p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300"
              >
                Studio Canvas
              </button>
              <button
                onClick={() => scrollToSection('scene-milestones')}
                className="p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300"
              >
                Milestones
              </button>
              <button
                onClick={() => scrollToSection('scene-progression')}
                className="p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300"
              >
                Progression
              </button>
              <button
                onClick={() => scrollToSection('scene-perspectives')}
                className="p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300"
              >
                Two Perspectives
              </button>
            </div>
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => scrollToAuth('login')}
                className="py-2.5 text-xs font-bold text-center text-slate-200 bg-slate-800 rounded-xl"
              >
                Sign In
              </button>
              <button
                onClick={() => scrollToAuth('register')}
                className="py-2.5 text-xs font-bold text-center text-white bg-indigo-600 rounded-xl"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
