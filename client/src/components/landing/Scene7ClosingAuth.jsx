import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext.jsx';
import { Button } from '../ui/Button.jsx';
import { useToast } from '../ui/Toast.jsx';
import {
  Compass,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Shield,
  GraduationCap,
  Send,
  CheckCircle2,
  KeyRound,
  User
} from 'lucide-react';

export function Scene7ClosingAuth({ initialTab = 'login', onTabChange }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'

  // Sign In states
  const [authMode, setAuthMode] = useState('password'); // 'password' | 'magic'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // 'client' | 'admin'
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('client'); // 'client' | 'admin'
  const [regLoading, setRegLoading] = useState(false);

  const { login, register, requestMagicLogin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      const res = await requestMagicLogin({ email, role });
      setMagicLinkSent(true);
      toast.success(res.message || 'Magic login link sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send login link');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      setRegLoading(true);
      const user = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole
      });
      toast.success(`Registration successful! Welcome to Pathfinder as ${user.role}.`);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  // Quick fill helper for demo credentials
  const fillDemoCredentials = (demoEmail, demoPass) => {
    handleTabSwitch('login');
    setAuthMode('password');
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.success(`Demo credentials filled for ${demoEmail}`);
  };

  return (
    <section id="auth-section" className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden border-t border-slate-900 bg-slate-950">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-blue-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Closing Headline Section */}
      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>The Next Stage</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          Your next chapter starts{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            with a clear path.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
          Whether you're creating a learning journey for others or following one toward your own goals, start with a plan that takes you somewhere.
        </p>

        {/* Primary and Secondary Quick Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => handleTabSwitch('register')}
            className={`group inline-flex items-center gap-2.5 font-bold text-sm sm:text-base px-8 py-3.5 rounded-2xl shadow-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-indigo-500/30 ring-2 ring-indigo-400'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
            }`}
          >
            <span>Start your journey</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleTabSwitch('login')}
            className={`inline-flex items-center gap-2 font-semibold text-sm sm:text-base px-7 py-3.5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-slate-800 text-white border-slate-600 ring-2 ring-slate-400'
                : 'text-slate-300 hover:text-white border-slate-700 bg-slate-900/60 hover:bg-slate-800/60'
            }`}
          >
            <span>I'm already on my journey — Sign in</span>
          </button>
        </div>
      </div>

      {/* The Reusable Authentication Card Container */}
      <div className="max-w-md mx-auto w-full relative z-10">
        <div className="p-6 sm:p-8 border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-2xl rounded-3xl">
          {/* Main Auth Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('register')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* SIGN IN TAB */}
          {activeTab === 'login' && (
            <div className="space-y-5">
              {/* Login Sub-Mode Switcher: Password vs Magic Link */}
              <div className="grid grid-cols-2 p-1 bg-slate-950/70 rounded-xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setMagicLinkSent(false);
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMode === 'password'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('magic')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'magic'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Email Magic Link
                </button>
              </div>

              {authMode === 'password' ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@roadmap.local or alex@learner.local"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">Password</label>
                      <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-2 !py-2.5 !bg-indigo-600 hover:!bg-indigo-500"
                    loading={loginLoading}
                    icon={ArrowRight}
                  >
                    Sign In to Journey
                  </Button>
                </form>
              ) : (
                <div>
                  {magicLinkSent ? (
                    <div className="text-center py-4 space-y-4">
                      <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">Check Your Inbox</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          We sent a secure sign-in link to <span className="text-indigo-400 font-mono">{email}</span>. Click the link in your email to enter your journey.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => setMagicLinkSent(false)}>
                        Send to Another Email
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Select Account Role
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setRole('client')}
                            className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                              role === 'client'
                                ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <GraduationCap className={`w-4 h-4 ${role === 'client' ? 'text-indigo-400' : 'text-slate-500'}`} />
                              <span className="text-xs font-bold">Learner</span>
                            </div>
                            <span className="text-[10px] text-slate-400">Roadmaps & Quizzes</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRole('admin')}
                            className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                              role === 'admin'
                                ? 'bg-purple-600/15 border-purple-500 text-white shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Shield className={`w-4 h-4 ${role === 'admin' ? 'text-purple-400' : 'text-slate-500'}`} />
                              <span className="text-xs font-bold">Admin</span>
                            </div>
                            <span className="text-[10px] text-slate-400">Studio & Creator</span>
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full mt-2 !py-2.5 !bg-indigo-600 hover:!bg-indigo-500"
                        loading={loginLoading}
                        icon={Send}
                      >
                        Send Sign-in Link
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CREATE ACCOUNT / REGISTER TAB */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('client')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      regRole === 'client'
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className={`w-4 h-4 ${regRole === 'client' ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold">Learner / Client</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Follow learning journeys</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('admin')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      regRole === 'admin'
                        ? 'bg-purple-600/15 border-purple-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Shield className={`w-4 h-4 ${regRole === 'admin' ? 'text-purple-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold">Instructor / Admin</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Design & assign journeys</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ada@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 !py-2.5 !bg-indigo-600 hover:!bg-indigo-500"
                loading={regLoading}
                icon={ArrowRight}
              >
                Register as {regRole === 'admin' ? 'Instructor' : 'Learner'}
              </Button>
            </form>
          )}

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Quick Demo Credentials:</span>
              <span>Click to auto-fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin@roadmap.local', 'Admin@123456!')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-left transition-colors cursor-pointer"
              >
                <span className="text-indigo-400 font-bold block">Admin Account</span>
                <span className="text-slate-400 font-mono text-[10px] truncate block">admin@roadmap.local</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('alex@learner.local', 'Client@123456!')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-left transition-colors cursor-pointer"
              >
                <span className="text-purple-400 font-bold block">Learner Account</span>
                <span className="text-slate-400 font-mono text-[10px] truncate block">alex@learner.local</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="mt-20 pt-8 border-t border-slate-900 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">Pathfinder</span>
            <span>&mdash; Personalized Learning Roadmap Platform</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Pathfinder. Built for guided mastery.
          </div>
        </div>
      </footer>
    </section>
  );
}
