import React, { useState } from 'react';
import { Button } from './Button';
import { Eye, EyeOff, Facebook, Building2, User, Landmark, Check, FileText, Shield, ArrowLeft } from 'lucide-react';
import { User as UserType, PlanType } from '../types';
import { Toast, ToastType } from './Toast';

interface LoginProps {
  onLogin: (user: UserType) => void;
  existingUsers?: UserType[]; // List of existing users to check against
}

export const Login: React.FC<LoginProps> = ({ onLogin, existingUsers = [] }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState(''); // Added password state
  const [isBusiness, setIsBusiness] = useState(false);
  const [isBank, setIsBank] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false); // New state for admin login
  const [isForgotPassword, setIsForgotPassword] = useState(false); // New state for forgot password
  
  // Form Data
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nif, setNif] = useState('');
  const [nifError, setNifError] = useState('');

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
      show: false,
      message: '',
      type: 'success'
  });

  const showToast = (message: string, type: ToastType = 'success') => {
      setToast({ show: true, message, type });
  };

  const handleResetPassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) {
          showToast("Por favor, insira o seu email.", 'error');
          return;
      }
      
      // Simulate Email Sending
      setTimeout(() => {
          showToast(`Um link de recuperação foi enviado para ${email}`, 'success');
          setIsForgotPassword(false);
      }, 1500);
  };

  const handleSubmit = () => {
    // 1. Logic for Admin Login
    if (isAdminLogin) {
         // Standard Access Credentials
         if (email === 'admin@facilita.ao' && password === 'admin123') {
             const adminUser: UserType = {
                id: 'admin-master',
                name: 'Administrador',
                email: email,
                phone: '+244 900000000',
                isBusiness: false,
                isAdmin: true,
                settings: { notifications: true, allowMessages: true },
                accountStatus: 'Active'
             };
             showToast("Bem-vindo, Administrador!");
             setTimeout(() => onLogin(adminUser), 800);
         } else {
             showToast("Acesso negado. Email ou senha incorretos.", 'error');
         }
         return;
    }

    // 2. Logic for LOGIN (Entering existing account)
    if (!isSignUp) {
        const foundUser = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (foundUser) {
            if (foundUser.accountStatus === 'Blocked') {
                showToast("Esta conta foi bloqueada pelo administrador.", 'error');
                return;
            }
            showToast(`Bem-vindo de volta, ${foundUser.name}!`);
            setTimeout(() => {
                onLogin(foundUser);
            }, 800);
        } else {
            showToast("Usuário não encontrado. Verifique o email ou crie uma conta.", 'error');
        }
        return;
    }

    // 3. Logic for SIGN UP (Creating new account)
    if (isSignUp) {
        // Check if email already exists
        const emailExists = existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
            showToast("Este email já está registado. Tente fazer login.", 'error');
            return;
        }

        // Validation for NIF if business
        if (isBusiness) {
            if (nif.length !== 10) {
                setNifError(`O NIF deve ter exatamente 10 dígitos. Faltam ${10 - nif.length}.`);
                return;
            }
        }

        // Format phone with Country Code for WhatsApp compatibility
        const formattedPhone = phone.startsWith('+244') ? phone : `+244 ${phone}`;

        const newUser: UserType = {
            id: Date.now().toString(),
            name: name,
            email: email,
            phone: formattedPhone,
            isBusiness: isBusiness,
            isBank: isBusiness && isBank, // Only set isBank if isBusiness is true
            nif: isBusiness ? nif : undefined,
            // Set default plan to FREE for businesses
            plan: isBusiness ? PlanType.FREE : undefined,
            isAdmin: false,
            settings: { notifications: true, allowMessages: true },
            accountStatus: 'Active'
        };
        
        showToast("Conta criada com sucesso!");
        setTimeout(() => {
            onLogin(newUser);
        }, 800);
        return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background decoration - Fixed to prevent repaint on mobile keyboard open */}
      <div className="fixed top-[-20%] right-[-20%] w-[80%] h-[60%] bg-indigo-600 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-teal-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10 animate-[fadeIn_0.5s_ease-out]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl mb-4 shadow-xl shadow-indigo-600/20 rotate-3">
            <span className="text-white font-black text-4xl italic">F</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Facilita</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              {isForgotPassword ? 'Recuperação de Conta' : (isSignUp ? 'A sua vida, mais simples e conectada.' : 'Tudo o que precisa, num só lugar.')}
          </p>
        </div>

        {!isAdminLogin && !isForgotPassword && (
            <div className="flex gap-4 mb-8">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">G</div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
            </button>
            </div>
        )}

        {isForgotPassword ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-[fadeIn_0.3s_ease-out]">
                <button onClick={() => setIsForgotPassword(false)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white mb-6 text-sm font-medium">
                    <ArrowLeft size={16} /> Voltar ao Login
                </button>
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-2">Email de Registo</label>
                        <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium"
                        placeholder="seu@email.com"
                        required
                        autoFocus
                        />
                    </div>
                    <Button type="submit" fullWidth className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none h-12">
                        Enviar Link de Recuperação
                    </Button>
                </form>
                <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
                    Você receberá um email com instruções para definir uma nova palavra-passe. Verifique a sua caixa de entrada e spam.
                </div>
            </div>
        ) : (
            <>
                <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-400">
                        {isAdminLogin ? 'Acesso Administrativo' : 'Ou entre com email'}
                    </span>
                </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                
                {isSignUp && (
                    <>
                        <div>
                            <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400 shadow-sm"
                            placeholder={isBusiness ? "Nome da Empresa" : "Nome Completo"}
                            required
                            autoComplete="name"
                            />
                        </div>
                        
                        {/* NIF Field - Only for Business, right below Name */}
                        {isBusiness && (
                            <div>
                                <div className="relative">
                                    <input
                                    type="text"
                                    maxLength={10}
                                    value={nif}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, ''); // Only numbers
                                        setNif(val);
                                        setNifError(''); // Clear error on type
                                    }}
                                    className={`w-full pl-10 pr-4 py-3.5 bg-white dark:bg-gray-800 border ${nifError ? 'border-red-500 animate-pulse' : 'border-gray-200 dark:border-gray-700'} focus:border-indigo-500 rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400 shadow-sm`}
                                    placeholder="NIF (10 dígitos)"
                                    required
                                    inputMode="numeric"
                                    autoComplete="off"
                                    />
                                    <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    {nif.length === 10 && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none animate-in fade-in zoom-in duration-200">
                                            <Check size={18} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-1 pl-1">
                                    <p className={`text-[10px] transition-colors ${nifError ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                        {nifError || 'Apenas números.'}
                                    </p>
                                    <div className="flex flex-col items-end">
                                        <p className={`text-[10px] font-bold transition-colors ${nif.length === 0 ? 'text-gray-400' : nif.length < 10 ? 'text-orange-500' : 'text-green-500'}`}>
                                            {nif.length}/10
                                        </p>
                                    </div>
                                </div>
                                {nif.length > 0 && nif.length < 10 && (
                                    <p className="text-[10px] text-orange-500 pl-1 mt-0.5 text-right font-medium">
                                        Faltam {10 - nif.length} dígitos
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-3 h-6">
                                    <span className="text-lg">🇦🇴</span>
                                    <span className="text-gray-500 dark:text-gray-400 font-bold text-sm">+244</span>
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 9); // Max 9 digits for Angola
                                        setPhone(val);
                                    }}
                                    className="w-full pl-28 px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400 shadow-sm"
                                    placeholder="9xx xxx xxx"
                                    inputMode="tel"
                                    autoComplete="tel"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div>
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400 shadow-sm"
                    placeholder={isAdminLogin ? "Email de Admin (admin@facilita.ao)" : "Email"}
                    required
                    autoComplete="email"
                    />
                </div>
                
                <div className="relative">
                    <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium placeholder-gray-400 shadow-sm"
                    placeholder={isAdminLogin ? "Palavra-passe (admin123)" : "Palavra-passe"}
                    autoComplete="current-password"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* Account Type Toggle for Sign Up */}
                {isSignUp && (
                    <>
                        <div className="flex gap-4 pt-2">
                            <button 
                                type="button"
                                onClick={() => { setIsBusiness(false); setIsBank(false); setNif(''); setNifError(''); }}
                                className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${!isBusiness ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500'}`}
                            >
                                <User size={24} />
                                <span className="text-xs font-bold">Pessoal</span>
                            </button>
                            <button 
                                type="button"
                                onClick={() => setIsBusiness(true)}
                                className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${isBusiness ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500'}`}
                            >
                                <Building2 size={24} />
                                <span className="text-xs font-bold">Empresa</span>
                            </button>
                        </div>

                        {/* Sub-selection for Bank */}
                        {isBusiness && (
                            <div 
                                onClick={() => setIsBank(!isBank)}
                                className={`mt-3 p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${isBank ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-400 dark:border-teal-700' : 'bg-white dark:bg-gray-800 border-transparent'}`}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isBank ? 'bg-teal-500 border-teal-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                                    {isBank && <Check size={14} className="text-white" />}
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <Landmark size={18} className={isBank ? 'text-teal-700 dark:text-teal-400' : 'text-gray-500'} />
                                    <span className={`text-sm font-medium ${isBank ? 'text-teal-900 dark:text-teal-200' : ''}`}>É uma instituição bancária?</span>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!isSignUp && !isAdminLogin && (
                    <div className="flex justify-end">
                        <button 
                            type="button" 
                            onClick={() => setIsForgotPassword(true)}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                        >
                        Esqueceu a palavra passe?
                        </button>
                    </div>
                )}

                <Button type="submit" fullWidth className={`mt-4 text-lg shadow-xl ${isAdminLogin ? 'bg-indigo-900 hover:bg-black shadow-indigo-200 dark:bg-indigo-700' : 'bg-gray-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-indigo-200 dark:shadow-indigo-900/40'}`}>
                    {isSignUp ? 'Criar Conta' : (isAdminLogin ? 'Acessar Painel' : 'Entrar')}
                </Button>
                </form>

                <p className="text-center mt-8 text-gray-600 dark:text-gray-400">
                {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
                <button 
                    onClick={() => { setIsSignUp(!isSignUp); setIsAdminLogin(false); }}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                    {isSignUp ? 'Entrar' : 'Criar conta'}
                </button>
                </p>

                {/* Secret Admin Toggle */}
                <div className="mt-8 flex justify-center">
                    <button onClick={() => { setIsAdminLogin(!isAdminLogin); setIsSignUp(false); }} className={`text-xs flex items-center gap-1 ${isAdminLogin ? 'text-indigo-600 font-bold' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500'}`}>
                        <Shield size={12} /> {isAdminLogin ? 'Voltar ao Login' : 'Admin'}
                    </button>
                </div>
            </>
        )}
      </div>
      
      {/* Toast Notification for Login Feedback */}
      <Toast 
          isVisible={toast.show} 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(prev => ({ ...prev, show: false }))} 
      />
    </div>
  );
};