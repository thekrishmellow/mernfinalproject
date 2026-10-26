import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext.jsx';
import { useToast } from '../ui/Toast.jsx';
import {
  GraduationCap,
  Shield,
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Settings,
  ExternalLink,
  KeyRound,
  X
} from 'lucide-react';

export function GoogleAuthCard({ initialRole = 'client', defaultView = 'login' }) {
  const [selectedRole, setSelectedRole] = useState(initialRole); // 'client' | 'admin'
  const [isRegisterMode, setIsRegisterMode] = useState(defaultView === 'register');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Google Client ID & Setup Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const [storedClientId, setStoredClientId] = useState(() => localStorage.getItem('google_client_id') || '');
  
  // Custom Personal Identity State (when no Google Cloud Client ID is configured yet)
  const [personalName, setPersonalName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');

  // Manual Email/Password Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const { loginWithGoogle, login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const envClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '888827375910-i4e2l7nl7lsipm675mn0tj4n1svj46ep.apps.googleusercontent.com';
  const effectiveClientId = envClientId || storedClientId;

  // Load Google Identity Services script
  useEffect(() => {
    if (window.google?.accounts?.oauth2) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // Trigger Google Sign-In
  const handleGoogleLoginClick = () => {
    setErrorMessage('');

    // If a Google Client ID is configured, trigger the real Google OAuth Popup!
    if (effectiveClientId && window.google?.accounts?.oauth2) {
      try {
        setGoogleLoading(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: effectiveClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            try {
              if (tokenResponse.error) {
                throw new Error(tokenResponse.error_description || tokenResponse.error);
              }
              // Fetch user profile directly from Google using the access token
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });

              if (!userInfoRes.ok) {
                throw new Error('Failed to fetch profile from Google');
              }

              const googleProfile = await userInfoRes.json();
              const user = await loginWithGoogle({
                role: selectedRole,
                profile: {
                  email: googleProfile.email,
                  name: googleProfile.name,
                  picture: googleProfile.picture,
                  sub: googleProfile.sub
                }
              });

              toast.success(`Welcome, ${user.name}!`);
              if (user.role === 'admin') {
                navigate('/admin/dashboard');
              } else {
                navigate('/client/dashboard');
              }
            } catch (err) {
              setErrorMessage(err.message || 'Google sign-in failed');
              toast.error(err.message || 'Google sign-in failed');
            } finally {
              setGoogleLoading(false);
            }
          }
        });

        // Request access token with account picker popup
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        setGoogleLoading(false);
        setErrorMessage('Failed to open Google popup: ' + err.message);
        setShowConfigModal(true);
      }
      return;
    }

    // If no client ID configured yet, open the modal explaining how to connect Google or use personal account
    setShowConfigModal(true);
  };

  // Handle saving user-provided Client ID
  const handleSaveClientId = (e) => {
    e.preventDefault();
    if (!customClientId.trim()) return;
    localStorage.setItem('google_client_id', customClientId.trim());
    setStoredClientId(customClientId.trim());
    setShowConfigModal(false);
    toast.success('Google Client ID saved! Click "Continue with Google" to test the real popup.');
  };

  // Handle signing in with personal identity directly (without waiting for GCP)
  const handlePersonalDirectLogin = async (e) => {
    e.preventDefault();
    if (!personalEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      setGoogleLoading(true);
      const user = await loginWithGoogle({
        role: selectedRole,
        profile: {
          name: personalName.trim() || personalEmail.split('@')[0],
          email: personalEmail.trim(),
          picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(personalName || personalEmail)}`,
          sub: `custom_google_${Date.now()}`
        }
      });

      setShowConfigModal(false);
      toast.success(`Signed in as ${user.name} (${user.role.toUpperCase()})!`);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setErrorMessage('');

      if (isRegisterMode) {
        const user = await register({
          name,
          email,
          password,
          role: selectedRole
        });
        toast.success(`Account created as ${user.role}!`);
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/client/dashboard');
        }
      } else {
        const user = await login({ email, password });
        toast.success(`Welcome back, ${user.name}!`);
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/client/dashboard');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setFormLoading(false);
    }
  };

  const fillDemoAccount = (roleToFill) => {
    setSelectedRole(roleToFill);
    setIsRegisterMode(false);
    setShowManualForm(true);
    if (roleToFill === 'admin') {
      setEmail('admin@roadmap.local');
      setPassword('Admin@123456!');
      toast.info('Filled Administrator demo credentials');
    } else {
      setEmail('learner@roadmap.local');
      setPassword('Learner@123456!');
      toast.info('Filled Learner demo credentials');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/20 text-slate-100">
        
        {/* Card Header & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Direct Google Access</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isRegisterMode ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            {isRegisterMode
              ? 'Select your role and authenticate in one click'
              : 'Sign in to access your roadmaps and workspace'}
          </p>
        </div>

        {/* STEP 1: CHOOSE YOUR ROLE (Admin vs Client) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Choose Account Role</span>
              <span className="text-[10px] text-indigo-400 font-medium">(Required)</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              {selectedRole === 'admin' ? 'Studio & Curriculum' : 'Learner & Progression'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
            {/* Learner Option */}
            <button
              type="button"
              onClick={() => setSelectedRole('client')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center relative cursor-pointer ${
                selectedRole === 'client'
                  ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-4 h-4" />
                <span className="text-xs font-extrabold">Learner</span>
              </div>
              <span className={`text-[10px] line-clamp-1 ${selectedRole === 'client' ? 'text-indigo-100' : 'text-slate-500'}`}>
                Client / Student
              </span>
              {selectedRole === 'client' && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Admin Option */}
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center relative cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-gradient-to-b from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-extrabold">Admin</span>
              </div>
              <span className={`text-[10px] line-clamp-1 ${selectedRole === 'admin' ? 'text-purple-100' : 'text-slate-500'}`}>
                Instructor / Creator
              </span>
              {selectedRole === 'admin' && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Error Alert Display */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* STEP 2: PRIMARY GOOGLE ONE-CLICK SIGN IN */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            disabled={googleLoading}
            onClick={handleGoogleLoginClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-black/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group border border-slate-200"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {googleLoading
                ? 'Connecting to Google...'
                : `Continue with Google as ${selectedRole === 'admin' ? 'Admin' : 'Learner'}`}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>
              {effectiveClientId ? 'Google OAuth Connected (Popup Mode)' : 'Google OAuth Configuration Ready'}
            </span>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="text-indigo-400 hover:text-indigo-300 underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>{effectiveClientId ? 'Change ID' : 'Setup Google ID'}</span>
            </button>
          </div>
        </div>

        {/* DIVIDER & TOGGLE FOR MANUAL / DEMO CREDENTIALS */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{showManualForm ? 'Hide email sign-in' : 'Or use email & password'}</span>
              {showManualForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* OPTIONAL MANUAL EMAIL FORM */}
        {showManualForm && (
          <form onSubmit={handleManualSubmit} className="space-y-3.5 pt-2 mb-6">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {formLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isRegisterMode ? 'Sign Up with Email' : 'Sign In with Email'}</span>
              )}
            </button>
          </form>
        )}

        {/* QUICK DEMO CREDENTIAL CHIPS (Instant Evaluation) */}
        <div className="pt-2 border-t border-slate-800/60">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>Instant Demo Accounts:</span>
            <span className="text-[10px] text-indigo-400">1-click test</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-600/40 text-[11px] font-medium text-slate-300 hover:text-purple-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Admin Demo</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('client')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-600/40 text-[11px] font-medium text-slate-300 hover:text-indigo-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <GraduationCap className="w-3 h-3 text-indigo-400" />
              <span>Learner Demo</span>
            </button>
          </div>
        </div>

        {/* Switch Between Login & Register Mode */}
        <div className="text-center mt-5 pt-3">
          <button
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isRegisterMode ? (
              <span>Already have an account? <strong className="text-indigo-400 underline">Sign In</strong></span>
            ) : (
              <span>New to Pathfinder? <strong className="text-indigo-400 underline">Create Account</strong></span>
            )}
          </button>
        </div>

      </div>

      {/* ──── GOOGLE POPUP & CLIENT ID MODAL ──── */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Google OAuth Setup</h3>
                <p className="text-xs text-slate-400">Enable actual Google popup for your personal account</p>
              </div>
            </div>

            <div className="space-y-5 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <span>Why isn't Google popping up automatically?</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Google's security requires a <strong>Google OAuth 2.0 Client ID</strong> registered for <code className="text-indigo-300 font-mono">http://localhost:5173</code> in Google Cloud Console. Without this Client ID, Google rejects opening the account selector popup.
                </p>
              </div>

              {/* OPTION 1: Use Your Real Name & Email Instantly */}
              <div className="border border-indigo-500/30 bg-indigo-950/20 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 text-xs">Option A: Sign in with your real personal identity now</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">Fastest</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Sign in under your actual personal name & email without creating a Google Cloud project right away:
                </p>
                <form onSubmit={handlePersonalDirectLogin} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    value={personalName}
                    onChange={(e) => setPersonalName(e.target.value)}
                    placeholder="Your Full Name (e.g. Krishna Bhatia)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="email"
                    required
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    placeholder="Your Personal Email (e.g. yourname@gmail.com)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <span>Authenticate as {selectedRole === 'admin' ? 'Admin' : 'Learner'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* OPTION 2: Enter Google Client ID for Official Popup */}
              <div className="border border-slate-800 p-4 rounded-2xl space-y-3">
                <span className="font-bold text-white text-xs">Option B: Connect Real Google OAuth Client ID</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Have a Google Cloud Client ID (or want to create one in 1 minute)? Paste it below to enable the native Google popup window:
                </p>
                <form onSubmit={handleSaveClientId} className="space-y-2.5">
                  <input
                    type="text"
                    value={customClientId}
                    onChange={(e) => setCustomClientId(e.target.value)}
                    placeholder="xxxxxxxxxxxx-xxxxxxxx.apps.googleusercontent.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 underline"
                    >
                      <span>Google Cloud Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="submit"
                      className="py-1.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs"
                    >
                      Save & Enable Popup
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default GoogleAuthCard;
