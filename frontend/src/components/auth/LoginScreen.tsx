import { useState } from 'react';
import { ShieldCheck, User, Eye, EyeOff } from 'lucide-react';
import { login, register, changePassword, setAuthData } from '../../api';
import { usePortal } from '../../contexts/PortalContext';
export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const { setPortal } = usePortal();
  const [showChamaModal, setShowChamaModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempUserToken, setTempUserToken] = useState<any>(null);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const trimmedEmail = email.trim();
      let role = '';
      if (isRegistering) {
        const payload: any = { email: trimmedEmail, password, name, inviteCode };
        const res = await register(payload);
        setAuthData(res.token, res.user);
        role = res.user.role;
      } else {
        const res = await login({ email: trimmedEmail, password });
        if (res.user.requiresPasswordChange) {
           setTempUserToken({ token: res.token, user: res.user, oldPassword: password });
           setIsChangingPassword(true);
           setIsLoading(false);
           return;
        }
        setAuthData(res.token, res.user);
        role = res.user.role;
      }
      
      // Intelligent Routing via Portal Context
      const targetPortal = role === 'TCM_SUPER_ADMIN' ? 'admin' : role === 'CHAMA_ADMIN' ? 'officials' : 'members';
      setPortal(targetPortal);
      
      if (onLogin) onLogin();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      localStorage.setItem('token', tempUserToken.token);
      await changePassword({ oldPassword: tempUserToken.oldPassword, newPassword });
      
      setAuthData(tempUserToken.token, { ...tempUserToken.user, requiresPasswordChange: false });
      const role = tempUserToken.user.role;
      
      if (role === 'TCM_SUPER_ADMIN') {
        window.location.href = '/admin';
      } else if (role === 'CHAMA_ADMIN') {
        window.location.href = '/officials';
      } else {
        window.location.href = '/members';
      }
      
      if (onLogin) onLogin();
    } catch (err: any) {
      localStorage.removeItem('token');
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed relative overflow-y-auto"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      {/* Dark overlay to ensure text remains readable against bright backgrounds */}
      <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none" />
      
      <div className="min-h-screen flex flex-col items-center p-4 py-6 sm:py-8 sm:p-8 z-10 relative">
        <div className="w-full max-w-md rounded-2xl sm:rounded-3xl overflow-hidden bg-transparent border border-white/20 shadow-2xl my-auto shrink-0">
          <div className="p-5 sm:p-8 text-center border-b border-white/10">
            <div className="bg-brand-accent w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg border border-white/20">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 tracking-tight">TASK-ME CHAMA</h1>
            <p className="text-white/80 text-xs sm:text-sm">Powered by TASK-ME CHAMA. Get Together. Achieve your goals.</p>
          </div>

          <div className="p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 text-center">
            {isChangingPassword ? 'Secure Your Account' : (isRegistering ? `Create an Account` : 'Welcome Back')}
          </h2>



          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-200 p-3 rounded-xl text-sm font-medium mb-6 text-center">
              {error}
            </div>
          )}

          {isChangingPassword ? (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="bg-amber-500/20 text-amber-100 p-3 rounded-xl text-sm mb-4 border border-amber-500/30">
                You are logging in with a temporary password. Please set a new secure password to continue.
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all text-white placeholder-white/40 text-sm sm:text-base"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all text-white placeholder-white/40 text-sm sm:text-base"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-accent hover:bg-brand-amber text-white font-extrabold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,80,0,0.3)] hover:shadow-[0_0_25px_rgba(255,153,0,0.5)] disabled:opacity-70 flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Save & Continue'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all text-white placeholder-white/40 text-sm sm:text-base"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Invite Code</label>
                <div className="relative">
                  <ShieldCheck className="w-5 h-5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all text-white placeholder-white/40 text-sm sm:text-base"
                    placeholder="E.g. REG-2024 or ADMIN-REG-2024"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 sm:py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all text-white placeholder-white/40 text-sm sm:text-base"
                placeholder="member@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 sm:py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all text-white placeholder-white/40 pr-12 text-sm sm:text-base"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-accent hover:bg-brand-amber text-white font-extrabold py-3 sm:py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,80,0,0.3)] hover:shadow-[0_0_25px_rgba(255,153,0,0.5)] disabled:opacity-70 flex items-center justify-center gap-2 mt-4 sm:mt-6 text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isRegistering ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>
          )}

          {!isChangingPassword && (
            <div className="mt-6 space-y-3 text-center">
              <div>
                <button
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                  }}
                  className="text-sm text-white/70 font-medium hover:text-white transition-colors"
                >
                  {isRegistering ? 'Already have an individual account? Sign In' : 'Need an individual member account? Join with Invite Code'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
