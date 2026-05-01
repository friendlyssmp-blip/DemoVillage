import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Lock, User, MapPin, Loader2, CheckCircle2, 
  AlertCircle, LogIn, UserPlus, LogOut, RotateCw, Eye, EyeOff 
} from 'lucide-react';
import { authService } from '../../services/authService';
import { audioService } from '../../services/audioService';
import { useGameStore } from '../../store/useGameStore';
import { auth } from '../../lib/firebase';

type AuthStep = 'login' | 'register' | 'loading';

export function AuthOverlay() {
  const { user, setUser } = useGameStore();
  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [villageName, setVillageName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Restore pending profile data from local storage if any
    const pending = localStorage.getItem('pending_profile');
    if (pending) {
      try {
        const { username: pUser, villageName: pVillage } = JSON.parse(pending);
        setUsername(pUser);
        setVillageName(pVillage);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (user.uid && !user.profile) {
      setStep('register');
    } else if (user.uid && user.profile) {
      setStep('loading');
    }
  }, [user.uid, !!user.profile]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.loginWithGoogle();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.loginWithApple();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.login(identifier, password, rememberMe);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword && !auth.currentUser) {
      setError('Passwords do not match');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (auth.currentUser) {
        // Just finalizing profile for existing auth session (Google or just signed up)
        await authService.finalizeProfile(username, villageName);
      } else {
        // Full registration: Create user then finalize profile
        await authService.register(email, password, username, rememberMe);
        await authService.finalizeProfile(username, villageName);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user.uid && user.profile) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#050510] flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(60,100,255,0.1),transparent_70%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
      >
        <div className="p-8 pt-12 text-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            <UserPlus size={40} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">
            {step === 'login' ? 'Welcome Back' : 'Join the Tribe'}
          </h1>
          <p className="text-sm text-white/40 font-medium">
             {step === 'login' && 'Log in to continue your conquest'}
             {step === 'register' && 'Create your unique legacy and village'}
          </p>
        </div>

        <div className="px-8 pb-12">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 'login' && (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Username or Email</label>
                   <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                         type="text" 
                         value={identifier}
                         onChange={(e) => setIdentifier(e.target.value)}
                         required
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                         placeholder="Chief_Unique or your@email.com"
                      />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Password</label>
                   <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                         type={showPassword ? "text" : "password"} 
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         required
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                         placeholder="••••••••"
                      />
                      <button 
                         type="button" 
                         onClick={() => {
                            audioService.play('click');
                            setShowPassword(!showPassword);
                         }}
                         className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                      >
                         {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                   </div>
                </div>

                 <div className="flex items-center justify-between px-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                       <div className="relative">
                          <input 
                             type="checkbox" 
                             checked={rememberMe}
                             onChange={(e) => setRememberMe(e.target.checked)}
                             className="sr-only" 
                          />
                          <div className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${rememberMe ? 'bg-blue-500 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                             {rememberMe && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 size={12} className="text-white" /></motion.div>}
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">Remember Me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={async () => {
                         if (!identifier) {
                            setError('Please enter your email to reset password');
                            return;
                         }
                         try {
                            setLoading(true);
                            await authService.resetPassword(identifier);
                            setError('Password reset link sent to your email!');
                         } catch (err: any) {
                            setError(err.message);
                         } finally {
                            setLoading(false);
                         }
                      }}
                      className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest hover:text-blue-400 transition-colors"
                    >
                      Forgot?
                    </button>
                 </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button 
                    type="submit"
                    disabled={loading}
                    onPointerDown={() => audioService.play('primary', { randomized: true })}
                    className="bg-white text-black font-black py-4 rounded-3xl uppercase italic tracking-widest text-[10px] hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <LogIn size={14} />}
                    Login
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep('register')}
                    onPointerDown={() => audioService.play('click')}
                    className="bg-blue-600 text-white font-black py-4 rounded-3xl uppercase italic tracking-widest text-[9px] hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <UserPlus size={14} />
                    Create Account
                  </button>
                </div>

                <div className="relative flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                 <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    onPointerDown={() => audioService.play('secondary', { randomized: true })}
                    disabled={loading}
                    className="flex-1 bg-white/5 border border-white/10 text-white font-black py-4 rounded-3xl uppercase italic tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>

                  <button 
                    type="button"
                    onClick={handleAppleLogin}
                    onPointerDown={() => audioService.play('secondary', { randomized: true })}
                    disabled={loading}
                    className="flex-1 bg-white border border-white text-black font-black py-4 rounded-3xl uppercase italic tracking-widest text-[10px] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 256 315">
                        <path fill="currentColor" d="M213.803 167.03c.442 47.58 41.74 63.413 42.147 63.615-.35 1.116-6.599 22.563-21.757 44.716-13.104 19.153-26.705 38.235-48.13 38.63-21.05.388-27.82-12.483-51.888-12.483-24.067 0-31.58 12.088-51.889 12.875-20.686.777-35.885-20.705-49.054-39.796-26.938-39.066-47.525-110.37-19.154-159.593 14.077-24.43 39.123-39.846 66.255-40.234 20.686-.388 40.25 13.91 52.88 13.91 12.63 0 36.634-17.18 61.354-14.654 10.378.43 39.51 4.148 58.19 31.426-1.493.926-34.71 20.19-34.354 61.643M174.197 45.445c11.01-13.34 18.423-31.875 16.393-50.38-15.897.644-35.157 10.613-46.54 23.945-10.204 11.79-19.114 30.684-16.71 48.74 17.704 1.378 35.843-8.96 46.857-22.305"/>
                    </svg>
                    Apple
                  </button>
                </div>

                <p className="text-center text-[10px] font-bold text-white/30 uppercase tracking-widest mt-6">
                  Log in with social accounts below
                </p>
              </motion.form>
            )}

            {step === 'register' && (
              <motion.form 
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Username</label>
                     <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                          placeholder="Chief_Unique"
                        />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Village Name</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                          type="text" 
                          value={villageName}
                          onChange={(e) => setVillageName(e.target.value)}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                          placeholder="The Citadel"
                        />
                     </div>
                  </div>
                </div>

                {!auth.currentUser && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Email</label>
                      <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                            placeholder="warrior@email.com"
                          />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input 
                              type="password" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                              placeholder="••••••••"
                            />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Confirm</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input 
                              type="password" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                              placeholder="••••••••"
                            />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  onPointerDown={() => audioService.play('primary', { randomized: true })}
                  className="w-full bg-white text-black font-black py-4 rounded-3xl uppercase italic tracking-widest text-xs hover:bg-zinc-200 transition-all active:scale-95 mt-6 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                  {auth.currentUser ? 'Finish Setup' : 'Create Account'}
                </button>

                {!auth.currentUser && (
                  <p className="text-center text-[10px] font-bold text-white/30 uppercase tracking-widest mt-6">
                    Already a chief? <button type="button" onClick={() => setStep('login')} className="text-blue-400 hover:text-blue-300">Back to Login</button>
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
