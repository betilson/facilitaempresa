
import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { MapView } from './components/MapView';
import { Marketplace } from './components/Marketplace';
import { Profile, ProfileView } from './components/Profile';
import { Dashboard, BankProfile } from './components/Dashboard';
import { ProductDetails } from './components/ProductDetails';
import { Cart } from './components/Cart';
import { PublishProduct } from './components/PublishProduct';
import { MyProducts } from './components/MyProducts';
import { AdminDashboard } from './components/AdminDashboard';
import { Map, ShoppingBag, User, Home, Menu, X, Settings, HelpCircle, FileText, LogOut, ChevronRight, LayoutGrid, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { User as UserType, Bank, Product, PlanType, ATM, Message, Notification, Attachment, Transaction, Plan, PaymentGatewayConfig, PlatformBankAccount, WithdrawalRequest } from './types';
import { MOCK_PRODUCTS, BANKS, MOCK_ATMS, PLANS as DEFAULT_PLANS } from './constants';
import { supabase } from './services/supabaseClient';
import { Toast, ToastType } from './components/Toast';

const App: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'MAP' | 'MARKET' | 'PROFILE'>('HOME');
  const [profileInitialView, setProfileInitialView] = useState<ProfileView>('MAIN');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [navTimestamp, setNavTimestamp] = useState(Date.now());
  const [targetConversationId, setTargetConversationId] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [banks, setBanks] = useState<Bank[]>(BANKS);
  const [otherCompanies, setOtherCompanies] = useState<Bank[]>([]);
  
  // Connection Status State
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
      show: false,
      message: '',
      type: 'success'
  });

  // Verify Supabase Connection on Mount and Check Session
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      console.log("Iniciando teste de conexão Supabase...");
      try {
        // 1. Basic Auth Check
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) throw new Error(`Erro de Autenticação: ${authError.message}`);

        // If session exists, try to load profile
        if (session?.user) {
             const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
             
             if (profile) {
                const loggedUser: UserType = {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone,
                    isBusiness: profile.is_business,
                    isBank: profile.is_bank,
                    nif: profile.nif,
                    plan: profile.plan,
                    isAdmin: false,
                    profileImage: profile.avatar_url,
                    coverImage: profile.cover_url,
                    address: profile.address,
                    province: profile.province,
                    municipality: profile.municipality,
                    walletBalance: profile.wallet_balance,
                    topUpBalance: profile.top_up_balance,
                    settings: profile.settings || { notifications: true, allowMessages: true },
                    accountStatus: profile.account_status || 'Active',
                    bankDetails: profile.bank_details
                };
                setUser(loggedUser);
             }
        }

        // 2. Database Check
        const { error: dbError } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
        
        if (dbError && dbError.code === '42P01') {
             throw new Error("Conectado, mas as tabelas não foram encontradas. Execute o SQL no Dashboard.");
        }

        setConnectionStatus('connected');
      } catch (error: any) {
        console.error("Supabase Connection Failed:", error);
        setConnectionStatus('error');
      }
    };

    checkSupabaseConnection();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
            setUser(null);
        } else if (event === 'SIGNED_IN' && session?.user && !user) {
             // Fetch profile logic handled inside checkSupabaseConnection or Login component
             // But good to have a backup here if needed
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);
  
  // Initialize ATMs from localStorage if available, otherwise use MOCK_ATMS
  const [atms, setAtms] = useState<ATM[]>(() => {
      const savedATMs = localStorage.getItem('facilita_atms');
      return savedATMs ? JSON.parse(savedATMs) : MOCK_ATMS;
  });

  // Save ATMs to localStorage whenever they change
  useEffect(() => {
      localStorage.setItem('facilita_atms', JSON.stringify(atms));
  }, [atms]);

  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig[]>([
      { id: 'gw1', name: 'Multicaixa Express', provider: 'Proxypay', isActive: true, environment: 'Sandbox', supportsReferences: true },
      { id: 'gw2', name: 'Visa / Mastercard', provider: 'CyberSource', isActive: true, environment: 'Sandbox', supportsReferences: false }
  ]);
  const [platformAccounts, setPlatformAccounts] = useState<PlatformBankAccount[]>([
      { id: 'acc1', bankName: 'BAI', iban: 'AO06 0040 0000 1234 5678 9012 3', accountNumber: '123456789', holderName: 'Facilita Plataforma', isActive: true }
  ]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([
      { id: 'wr1', companyId: 'tech-angola', companyName: 'Tech Angola', amount: 50000, requestDate: new Date().toLocaleDateString(), status: 'Pendente', bankDetails: 'BAI - AO06...' }
  ]);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
      { id: 'n1', userId: 'global', title: 'Bem-vindo ao Facilita', desc: 'Explore os melhores serviços e produtos de Angola.', timestamp: Date.now() - 100000, read: false, type: 'info' }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [votedAtms, setVotedAtms] = useState<string[]>([]);

  const initialMockUsers: UserType[] = [
      { id: 'u1', name: 'Maria Silva', email: 'maria@gmail.com', phone: '923000000', isBusiness: false, walletBalance: 0, topUpBalance: 50000, accountStatus: 'Active', settings: { notifications: true, allowMessages: true } },
      { id: 'u2', name: 'Tech Angola', email: 'contato@tech.ao', phone: '923111111', isBusiness: true, plan: PlanType.PROFESSIONAL, profileImage: 'https://picsum.photos/200?1', walletBalance: 150000, topUpBalance: 20000, accountStatus: 'Active', settings: { notifications: true, allowMessages: true }, bankDetails: { bankName: 'BAI', iban: 'AO06 0040 0000 8888 8888 1234 5', accountNumber: '88888888', beneficiaryName: 'Tech Angola Lda' } },
  ];

  const [allUsers, setAllUsers] = useState<UserType[]>(() => {
      const savedUsers = localStorage.getItem('facilita_users');
      return savedUsers ? JSON.parse(savedUsers) : initialMockUsers;
  });

  useEffect(() => {
      localStorage.setItem('facilita_users', JSON.stringify(allUsers));
  }, [allUsers]);

  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showMyProducts, setShowMyProducts] = useState(false);
  const [branchManageId, setBranchManageId] = useState<string | null>(null);
  const [branchManageName, setBranchManageName] = useState<string | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (loggedInUser: UserType) => {
    const userExists = allUsers.find(u => u.email === loggedInUser.email);
    let currentUser = loggedInUser;

    if (!userExists) {
        setAllUsers(prev => [...prev, loggedInUser]);
    } else {
        currentUser = { ...userExists, ...loggedInUser };
    }

    const userWithFavs = { ...currentUser, favorites: currentUser.favorites || [], following: currentUser.following || [], walletBalance: currentUser.walletBalance || 0, topUpBalance: currentUser.topUpBalance || 0, settings: currentUser.settings || { notifications: true, allowMessages: true }, accountStatus: currentUser.accountStatus || 'Active' };
    setUser(userWithFavs);

    if (userWithFavs.isBusiness) {
        const companyProfile: Bank = {
            id: userWithFavs.id,
            name: userWithFavs.name,
            logo: userWithFavs.profileImage || '', 
            coverImage: userWithFavs.coverImage,
            description: `Bem-vindo à ${userWithFavs.name}.`,
            followers: 0,
            reviews: 0,
            phone: userWithFavs.phone,
            email: userWithFavs.email,
            nif: userWithFavs.nif,
            address: userWithFavs.address,
            province: userWithFavs.province,
            municipality: userWithFavs.municipality,
            type: 'HQ'
        };

        if (userWithFavs.isBank) {
            if (!banks.find(b => b.name === userWithFavs.name)) setBanks([...banks, companyProfile]);
        } else {
            if (!otherCompanies.find(c => c.name === userWithFavs.name)) setOtherCompanies([...otherCompanies, companyProfile]);
        }
    }

    setActiveTab('HOME');
    setSelectedBank(null);
    setSelectedProduct(null);
    setShowMyProducts(false);
    setShowPublishModal(false);
    setBranchManageId(null);
    setProfileInitialView('MAIN');
  };
  
  // ... Rest of the component (Handlers, Renders) remains the same as provided ...
  // Re-including the rest of the component body to ensure validity
  
  const handleUpgradeToBusiness = (details: { name: string; phone: string; isBank: boolean; nif: string, plan: PlanType }) => {
    if (!user) return;
    const updatedUser: UserType = { ...user, name: details.name, phone: details.phone, isBusiness: true, isBank: details.isBank, nif: details.nif, plan: details.plan };
    setUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));

    const companyProfile: Bank = { id: updatedUser.id, name: details.name, logo: user.profileImage || '', coverImage: user.coverImage || 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=1000&q=80', description: '', followers: 0, reviews: 0, phone: details.phone, nif: details.nif, email: user.email, address: user.address, province: user.province, municipality: user.municipality, type: 'HQ' };

    if (details.isBank) setBanks([...banks, companyProfile]);
    else setOtherCompanies([...otherCompanies, companyProfile]);
  };

  const handleUpdateUser = (updatedUser: UserType) => {
    setUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    if (updatedUser.isBusiness) {
        const syncProfile = (list: Bank[]) => list.map(b => {
            if (b.id === updatedUser.id) {
                return {
                    ...b,
                    name: updatedUser.name,
                    logo: updatedUser.profileImage || b.logo,
                    coverImage: updatedUser.coverImage || b.coverImage,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                    province: updatedUser.province,
                    municipality: updatedUser.municipality
                };
            }
            return b;
        });

        setBanks(prev => syncProfile(prev));
        setOtherCompanies(prev => syncProfile(prev));
    }
  };

  const handleRequestWithdrawal = (amount: number, details: string) => {
      if(!user) return;
      const newReq: WithdrawalRequest = {
          id: `wd-${Date.now()}`,
          companyId: user.id,
          companyName: user.name,
          amount,
          requestDate: new Date().toLocaleDateString(),
          status: 'Pendente',
          bankDetails: details
      };
      setWithdrawalRequests(prev => [newReq, ...prev]);
  };

  const handleProcessWithdrawal = (id: string, action: 'approve' | 'reject') => {
      const req = withdrawalRequests.find(r => r.id === id);
      if(!req) return;

      setWithdrawalRequests(prev => prev.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'Processado' : 'Rejeitado' } : r));

      if(action === 'approve') {
          const companyUser = allUsers.find(u => u.id === req.companyId);
          if(companyUser) {
              const updatedUser = {
                  ...companyUser,
                  walletBalance: Math.max(0, (companyUser.walletBalance || 0) - req.amount)
              };
              setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
              if(user && user.id === updatedUser.id) setUser(updatedUser);
          }
      }
  };

  const handleAdminTransactionAction = (id: string, action: 'approve' | 'reject') => {
      const txToUpdate = transactions.find(t => t.id === id);
      if (!txToUpdate) return;

      setTransactions(prev => prev.map(t => {
          if (t.id === id) {
              return { ...t, status: action === 'approve' ? 'Aprovado' : 'Rejeitado' };
          }
          return t;
      }));

      if (action === 'approve') {
          if (txToUpdate.category === 'DEPOSIT') {
              const userToUpdate = allUsers.find(u => u.id === txToUpdate.user);
              if (userToUpdate) {
                  const updatedUser = { ...userToUpdate, topUpBalance: (userToUpdate.topUpBalance || 0) + txToUpdate.amount };
                  setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                  if (user && user.id === updatedUser.id) setUser(updatedUser);
              }
          } 
      }
  };

  const handleSellerTransactionAction = (id: string, action: 'approve' | 'reject') => {
      const txToUpdate = transactions.find(t => t.id === id);
      if (!txToUpdate) return;

      setTransactions(prev => prev.map(t => {
          if (t.id === id) {
              return { ...t, status: action === 'approve' ? 'Aprovado' : 'Rejeitado' };
          }
          return t;
      }));
      
      if (action === 'approve') {
           const sellerId = txToUpdate.user;
           const seller = allUsers.find(u => u.id === sellerId);
           
           if (seller) {
                const updatedSeller = { ...seller, walletBalance: (seller.walletBalance || 0) + txToUpdate.amount };
                setAllUsers(prev => prev.map(u => u.id === updatedSeller.id ? updatedSeller : u));
                if (user && user.id === updatedSeller.id) setUser(updatedSeller);
           }
      }
  };
  
  const handleCheckout = (paymentMethod: 'Multicaixa' | 'Visa' | 'Transferencia', proof?: string) => {
    if (!user) return;
    const earnings: Record<string, number> = {};
    const newTransactions: Transaction[] = [];
    const timestamp = Date.now();
    const dateStr = new Date().toLocaleDateString('pt-BR');

    const initialStatus = paymentMethod === 'Transferencia' ? 'Pendente' : 'Aprovado';

    cartItems.forEach((item, index) => {
        if (item.id.startsWith('plan_') && paymentMethod !== 'Transferencia') {
            const planType = item.title.replace('Plano ', '') as PlanType;
            const planDetails = DEFAULT_PLANS.find(p => p.type === planType);
            if (planDetails) {
                 const updatedUser = {
                     ...user,
                     plan: planType,
                     customLimits: {
                         maxProducts: planDetails.maxProducts,
                         maxHighlights: planDetails.maxHighlights
                     }
                 };
                 setUser(updatedUser);
                 setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
            }
        }

        if (item.ownerId) {
            earnings[item.ownerId] = (earnings[item.ownerId] || 0) + item.price;
            const saleTx: Transaction = {
                id: `sale-${timestamp}-${index}`,
                user: item.ownerId,
                amount: item.price,
                date: dateStr,
                timestamp: timestamp,
                status: initialStatus,
                method: paymentMethod, 
                category: item.id.startsWith('plan_') ? 'PLAN_PAYMENT' : 'SALE',
                productName: item.title,
                reference: `REF-${Math.floor(Math.random() * 1000000)}`,
                otherPartyName: user.name,
                proofUrl: proof
            };
            newTransactions.push(saleTx);
        }

        const purchaseTx: Transaction = {
            id: `buy-${timestamp}-${index}`,
            user: user.id,
            amount: item.price,
            date: dateStr,
            timestamp: timestamp,
            status: initialStatus,
            method: paymentMethod,
            category: item.id.startsWith('plan_') ? 'PLAN_PAYMENT' : 'PURCHASE',
            productName: item.title,
            reference: `REF-${Math.floor(Math.random() * 1000000)}`,
            otherPartyName: item.companyName 
        };
        newTransactions.push(purchaseTx);
    });

    setTransactions(prev => [...newTransactions, ...prev]);

    if (paymentMethod !== 'Transferencia') {
        const updatedUsers = allUsers.map(u => {
            if (earnings[u.id]) {
                return { ...u, walletBalance: (u.walletBalance || 0) + earnings[u.id] };
            }
            return u;
        });
        setAllUsers(updatedUsers);
        
        if (earnings[user.id]) {
            setUser(prev => prev ? { ...prev, walletBalance: (prev.walletBalance || 0) + earnings[user.id] } : null);
        }
    }

    setCartItems([]);
    setIsCartOpen(false);
    setSelectedProduct(null);
  };

  const handleManagePlans = (action: 'add' | 'update' | 'delete', plan: Plan) => {
      if (action === 'add') setPlans([...plans, plan]);
      if (action === 'update') setPlans(plans.map(p => p.id === plan.id ? plan : p));
      if (action === 'delete') setPlans(plans.filter(p => p.id !== plan.id));
  };

  const addToCart = (product: Product) => {
      setCartItems([...cartItems, product]);
      setIsCartOpen(true);
  };
  
  const removeFromCart = (index: number) => { const newCart = [...cartItems]; newCart.splice(index, 1); setCartItems(newCart); };
  const toggleFavorite = (productId: string) => { if (!user) return; const currentFavorites = user.favorites || []; const newFavorites = currentFavorites.includes(productId) ? currentFavorites.filter(id => id !== productId) : [...currentFavorites, productId]; const updatedUser = { ...user, favorites: newFavorites }; setUser(updatedUser); setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u)); };
  const handleSaveProduct = (newProduct: Product) => { if (editingProduct) { setProducts(products.map(p => p.id === newProduct.id ? newProduct : p)); } else { setProducts([newProduct, ...products]); } setShowPublishModal(false); setEditingProduct(null); };
  const handleDeleteProduct = (productId: string) => setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  const openPublishModal = (productToEdit?: Product) => { setEditingProduct(productToEdit || null); setShowPublishModal(true); };
  const openBranchProductManager = (branchId: string, branchName: string) => { setBranchManageId(branchId); setBranchManageName(branchName); setShowMyProducts(true); };
  const openBranchPublishModal = (productToEdit?: Product) => { setEditingProduct(productToEdit || null); setShowPublishModal(true); };
  const handleSendMessage = (receiverId: string, content: string, productId?: string, productName?: string, attachment?: Attachment) => { if (!user) return; const newMessage: Message = { id: Date.now().toString(), senderId: user.id, senderName: user.name, receiverId, productId, productName, content, attachment, timestamp: Date.now(), isRead: false, isFromBusiness: false }; setMessages(prev => [newMessage, ...prev]); setNotifications(prev => [...prev, { id: `notif-${Date.now()}`, userId: receiverId, title: 'Nova Mensagem', desc: `Você recebeu uma mensagem.`, timestamp: Date.now(), read: false, type: 'message', relatedEntityId: user.id }]); };
  const handleReplyMessage = (originalMessage: Message, content: string, attachment?: Attachment) => { if (!user) return; const receiverId = originalMessage.senderId === user.id ? originalMessage.receiverId : originalMessage.senderId; const newMessage: Message = { id: Date.now().toString(), senderId: user.id, senderName: user.name, receiverId: receiverId, productId: originalMessage.productId, productName: originalMessage.productName, content, attachment, timestamp: Date.now(), isRead: false, isFromBusiness: user.isBusiness && user.id !== originalMessage.senderId }; setMessages(prev => [newMessage, ...prev]); setNotifications(prev => [...prev, { id: `notif-${Date.now()}`, userId: receiverId, title: 'Nova Resposta', desc: `${user.name} respondeu.`, timestamp: Date.now(), read: false, type: 'message', relatedEntityId: user.id }]); };
  const handleNotificationClick = (notification: Notification) => { if (notification.type === 'message') { setActiveTab('PROFILE'); setProfileInitialView('MESSAGES'); setNavTimestamp(Date.now()); if (notification.relatedEntityId) setTargetConversationId(notification.relatedEntityId); } setNotifications(prev => prev.filter(n => n.id !== notification.id)); setIsMenuOpen(false); setSelectedBank(null); setSelectedProduct(null); };
  const handleClearNotifications = () => { if (!user) return; setNotifications(prev => prev.map(n => (n.userId === user.id || n.userId === 'global') ? { ...n, read: true } : n)); };
  const handleLogout = () => { 
      supabase.auth.signOut().then(() => {
        setUser(null); 
        setIsMenuOpen(false);
      });
  };
  
  // Navigation Reset Logic
  const navigateTo = (tab: 'HOME' | 'MAP' | 'MARKET' | 'PROFILE') => { 
      if (tab === 'PROFILE' && activeTab === 'PROFILE') {
          setProfileInitialView('MAIN'); 
          setNavTimestamp(Date.now()); 
      } else {
          setActiveTab(tab); 
          setProfileInitialView('MAIN'); 
          setNavTimestamp(Date.now()); 
      }
      setIsMenuOpen(false); 
      setSelectedBank(null); 
      setSelectedProduct(null); 
      setShowMyProducts(false); 
      setShowPublishModal(false); 
      setBranchManageId(null); 
  };
  
  const navigateToProfileSection = (section: ProfileView) => { setActiveTab('PROFILE'); setProfileInitialView(section); setNavTimestamp(Date.now()); setIsMenuOpen(false); setSelectedBank(null); setSelectedProduct(null); setShowMyProducts(false); setShowPublishModal(false); setBranchManageId(null); };
  const handleToggleFollow = (companyId: string) => { if (!user) return; const isFollowing = user.following?.includes(companyId); let newFollowing = user.following || []; if (isFollowing) { newFollowing = newFollowing.filter(id => id !== companyId); } else { newFollowing = [...newFollowing, companyId]; } const updatedUser = { ...user, following: newFollowing }; setUser(updatedUser); setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u)); const updateFollowerCount = (list: Bank[]) => { return list.map(b => { if (b.id === companyId) { return { ...b, followers: isFollowing ? Math.max(0, b.followers - 1) : b.followers + 1 }; } return b; }); }; setBanks(updateFollowerCount(banks)); setOtherCompanies(updateFollowerCount(otherCompanies)); if (selectedBank && selectedBank.id === companyId) { setSelectedBank(prev => prev ? { ...prev, followers: isFollowing ? Math.max(0, prev.followers - 1) : prev.followers + 1 } : null); } };
  const handleRateCompany = (companyId: string) => { const updateReviewCount = (list: Bank[]) => { return list.map(b => { if (b.id === companyId) { return { ...b, reviews: b.reviews + 1 }; } return b; }); }; setBanks(updateReviewCount(banks)); setOtherCompanies(updateReviewCount(otherCompanies)); if (selectedBank && selectedBank.id === companyId) { setSelectedBank(prev => prev ? { ...prev, reviews: prev.reviews + 1 } : null); } };
  const handleUpdateUserStatus = (userId: string, action: 'block' | 'verify' | 'unblock') => { const updatedList = allUsers.map(u => { if (u.id === userId) { if (action === 'block') return { ...u, accountStatus: 'Blocked' as const }; if (action === 'unblock') return { ...u, accountStatus: 'Active' as const }; } return u; }); setAllUsers(updatedList); };
  const handleRequestDeposit = (amount: number, method: 'Multicaixa' | 'Visa' | 'Transferencia', proof?: string) => { if (!user) return; const newTx: Transaction = { id: `deposit-${Date.now()}`, user: user.id, amount: amount, date: new Date().toLocaleDateString('pt-BR'), timestamp: Date.now(), status: 'Pendente', method: method, category: 'DEPOSIT', reference: `REF-${Math.floor(Math.random() * 1000000)}`, otherPartyName: 'Facilita Plataforma', proofUrl: proof }; setTransactions(prev => [newTx, ...prev]); };
  
  const handleManageATM = (action: 'ADD' | 'UPDATE' | 'DELETE', atmData: Partial<ATM> & { id?: string }) => { 
      if (action === 'ADD' && atmData) { 
          setAtms(prev => [...prev, atmData as ATM]); 
      } else if (action === 'UPDATE' && atmData.id) { 
          setAtms(prev => prev.map(atm => atm.id === atmData.id ? { ...atm, ...atmData } : atm)); 
      } else if (action === 'DELETE' && atmData.id) { 
          setAtms(prev => prev.filter(atm => atm.id !== atmData.id)); 
      } 
  };
  
  const handleValidateATM = (atmId: string) => { const hasVoted = votedAtms.includes(atmId); setAtms(prev => prev.map(atm => { if (atm.id === atmId) { const currentVotes = atm.votes || 0; const newVotes = hasVoted ? Math.max(0, currentVotes - 1) : currentVotes + 1; return { ...atm, votes: newVotes }; } return atm; })); if (hasVoted) { setVotedAtms(prev => prev.filter(id => id !== atmId)); } else { setVotedAtms(prev => [...prev, atmId]); } };
  const handleAddBranch = (branchData: Partial<Bank>) => { if (!user) return; const newBranch: Bank = { id: `${user.id}-branch-${Date.now()}`, name: branchData.name || '', logo: branchData.logo || '', coverImage: branchData.coverImage || '', description: branchData.description || '', followers: 0, reviews: 0, phone: branchData.phone, email: user.email, nif: user.nif, address: branchData.address, province: branchData.province, municipality: branchData.municipality, parentId: user.id, type: 'BRANCH' }; if (user.isBank) { setBanks(prev => [...prev, newBranch]); } else { setOtherCompanies(prev => [...prev, newBranch]); } };
  const handleUpdateBranch = (branchId: string, branchData: Partial<Bank>) => { const updateList = (list: Bank[]) => { return list.map(item => { if (item.id === branchId) { return { ...item, ...branchData }; } return item; }); }; if (user?.isBank) { setBanks(prev => updateList(prev)); } else { setOtherCompanies(prev => updateList(prev)); } };
  const handleDeleteBranch = (branchId: string) => { const deleteFromList = (prev: Bank[]) => prev.filter(b => b.id !== branchId); if (user?.isBank) { setBanks(deleteFromList); } else { setOtherCompanies(deleteFromList); } };

  if (!user) return <Login onLogin={handleLogin} existingUsers={allUsers} />;

  if (user.isAdmin) {
      return (
          <AdminDashboard 
            users={allUsers}
            onUpdateUserStatus={handleUpdateUserStatus}
            onLogout={handleLogout}
            transactions={transactions}
            onTransactionAction={handleAdminTransactionAction}
            plans={plans}
            onManagePlans={handleManagePlans}
            paymentGateways={paymentGateways}
            onManageGateways={setPaymentGateways}
            platformAccounts={platformAccounts}
            onManageAccounts={setPlatformAccounts}
            withdrawalRequests={withdrawalRequests}
            onProcessWithdrawal={handleProcessWithdrawal}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
      );
  }

  const userNotifications = notifications.filter(n => n.userId === user.id || n.userId === 'global');
  const favoriteProducts = products.filter(p => user.favorites?.includes(p.id));
  const myBranches = [...banks, ...otherCompanies].filter(b => b.parentId === user.id);
  const myTransactions = transactions.filter(t => t.user === user.id);

  const renderContent = () => {
    if (showPublishModal) return <PublishProduct user={user} products={products} branches={myBranches} onBack={() => setShowPublishModal(false)} onSave={handleSaveProduct} initialData={editingProduct} overrideOwnerId={branchManageId || undefined} overrideCompanyName={branchManageName || undefined} />;
    if (showMyProducts) return <MyProducts user={user} products={products} branches={myBranches} onBack={() => { setShowMyProducts(false); }} onEdit={(p) => openBranchPublishModal(p)} onDelete={handleDeleteProduct} onAddNew={() => openBranchPublishModal()} scopeId={branchManageId || undefined} scopeName={branchManageName || undefined} />;
    if (selectedProduct) { let companyPhone = undefined; const allEntities = [...banks, ...otherCompanies]; const ownerEntity = allEntities.find(e => e.id === selectedProduct.ownerId); if (ownerEntity) { companyPhone = ownerEntity.phone; } else { const nameEntity = allEntities.find(e => e.name === selectedProduct.companyName); if (nameEntity) { companyPhone = nameEntity.phone; } } return <ProductDetails product={selectedProduct} onBack={() => setSelectedProduct(null)} onAddToCart={addToCart} cartItemCount={cartItems.length} onOpenCart={() => setIsCartOpen(true)} isFavorite={user.favorites?.includes(selectedProduct.id) || false} onToggleFavorite={() => toggleFavorite(selectedProduct.id)} onSendMessage={(content, attachment) => handleSendMessage(selectedProduct.ownerId || '', content, selectedProduct.id, selectedProduct.title, attachment)} companyPhone={companyPhone} />; }

    switch (activeTab) {
      case 'HOME':
        if (selectedBank) return <BankProfile user={user} bank={selectedBank} products={products} allBanks={[...banks, ...otherCompanies]} onBack={() => setSelectedBank(null)} onSelectProduct={setSelectedProduct} onToggleFollow={handleToggleFollow} onRate={handleRateCompany} onSelectBranch={(branch: Bank) => setSelectedBank(branch)} />;
        return <Dashboard products={products} banks={banks.filter(b => b.type !== 'BRANCH')} otherCompanies={otherCompanies.filter(b => b.type !== 'BRANCH')} onSelectBank={setSelectedBank} onSelectProduct={setSelectedProduct} onViewMarket={() => setActiveTab('MARKET')} notifications={userNotifications} onClearNotifications={handleClearNotifications} onNotificationClick={handleNotificationClick} />;
      case 'MAP':
        return <MapView atms={atms} onValidateATM={handleValidateATM} votedAtms={votedAtms} />;
      case 'MARKET':
        return <Marketplace user={user} products={products} onSelectProduct={setSelectedProduct} onOpenPublish={() => { setBranchManageId(null); setBranchManageName(null); openPublishModal(); }} onViewPlans={() => { setProfileInitialView('PLANS'); setActiveTab('PROFILE'); }} />;
      case 'PROFILE':
        return <Profile user={user} onLogout={handleLogout} onOpenMyProducts={() => { setBranchManageId(null); setBranchManageName(null); setShowMyProducts(true); }} favoriteProducts={favoriteProducts} onSelectFavorite={setSelectedProduct} onUpgradeUser={handleUpgradeToBusiness} onUpdateUser={handleUpdateUser} initialView={profileInitialView} navigationTimestamp={navTimestamp} targetConversationId={targetConversationId} products={products} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} myBranches={myBranches} onAddBranch={handleAddBranch} onUpdateBranch={handleUpdateBranch} onDeleteBranch={handleDeleteBranch} onManageBranchProducts={openBranchProductManager} atms={atms} onManageATM={handleManageATM} messages={messages} onReplyMessage={handleReplyMessage} transactions={myTransactions} onRequestDeposit={handleRequestDeposit} onRequestWithdrawal={handleRequestWithdrawal} onSendMessage={handleSendMessage} onNavigateToMap={() => navigateTo('MAP')} onProcessTransaction={handleSellerTransactionAction} platformAccounts={platformAccounts} onAddToCart={addToCart} />;
      default: return null;
    }
  };

  const SidebarButton = ({ icon: Icon, label, tab, active }: any) => (
      <button onClick={() => { navigateTo(tab); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
        <Icon size={24} className={active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors'} />
        <span className="font-bold text-sm">{label}</span>
      </button>
  );

  return (
    <div className={`h-screen w-full flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden`}>
      <aside className="hidden md:flex w-72 flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-full shrink-0 z-30 relative">
        <div className="p-8">
             <div className="flex flex-col items-start">
                <div className="text-gray-900 dark:text-white font-black text-3xl tracking-tighter flex items-center gap-1 italic mb-1">Facilita</div>
                <div className="w-12 h-1.5 bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full"></div>
             </div>
        </div>
        <nav className="flex-1 px-6 space-y-2">
            <SidebarButton icon={Home} label="Início" tab="HOME" active={activeTab === 'HOME'} />
            <SidebarButton icon={Map} label="Mapa ATM" tab="MAP" active={activeTab === 'MAP'} />
            <SidebarButton icon={ShoppingBag} label="Loja" tab="MARKET" active={activeTab === 'MARKET'} />
            <SidebarButton icon={User} label="Perfil" tab="PROFILE" active={activeTab === 'PROFILE'} />
        </nav>
        <div className="p-6 border-t border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => navigateTo('PROFILE')}>
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-gray-600 overflow-hidden"><img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p></div>
                <Settings size={16} className="text-gray-400" />
             </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full relative w-full max-w-[100vw]">
        
        <Toast 
            isVisible={toast.show} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(prev => ({ ...prev, show: false }))} 
        />

        <div className="md:hidden bg-gradient-to-r from-indigo-600 to-violet-700 h-24 pt-8 px-6 flex justify-between items-start shrink-0 z-20 shadow-xl shadow-indigo-600/20 relative dark:shadow-indigo-900/40 rounded-b-[2rem]">
             <button onClick={() => setIsMenuOpen(true)} className="text-white p-2 hover:bg-white/20 rounded-xl active:scale-95 transition-transform"><Menu size={24} /></button>
             <div className="flex flex-col items-center -mt-1">
                <div className="text-white font-black text-2xl tracking-tighter flex items-center gap-1 italic">Facilita</div>
                <div className="w-12 h-1 bg-teal-400 rounded-full mt-1"></div>
             </div>
             <button onClick={() => setIsCartOpen(true)} className="w-10 h-10 flex items-center justify-center text-white relative active:scale-95 transition-transform hover:bg-white/20 rounded-xl">
                 <ShoppingBag size={24} />{cartItems.length > 0 && (<span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-teal-400 text-teal-900 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-transparent shadow-sm">{cartItems.length}</span>)}
             </button>
        </div>

        <div className="hidden md:flex justify-end items-center p-6 bg-transparent absolute top-0 right-0 z-40 gap-4 pointer-events-none">
             <div className="pointer-events-auto flex gap-4">
                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm bg-white dark:bg-gray-800 ${connectionStatus === 'connected' ? 'text-green-600' : connectionStatus === 'error' ? 'text-red-500' : 'text-gray-500'}`}>
                     {connectionStatus === 'connected' ? <CheckCircle size={14} /> : connectionStatus === 'error' ? <AlertTriangle size={14} /> : <Database size={14} className="animate-pulse" />}
                     {connectionStatus === 'connected' ? 'Supabase OK' : connectionStatus === 'error' ? 'Erro DB' : 'Verificando...'}
                 </div>

                 {activeTab !== 'PROFILE' && (
                     <>
                        <button onClick={() => navigateTo('MARKET')} className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><LayoutGrid size={20} className="text-gray-600 dark:text-gray-300" /></button>
                        <button onClick={() => setIsCartOpen(true)} className="w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center hover:bg-indigo-700 transition-colors relative"><ShoppingBag size={20} />{cartItems.length > 0 && (<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-900">{cartItems.length}</span>)}</button>
                     </>
                 )}
             </div>
        </div>

        <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
            <div className="h-full w-full overflow-hidden relative">
                {renderContent()}
                {isCartOpen && user && <Cart items={cartItems} user={user} onRemoveItem={removeFromCart} onClose={() => setIsCartOpen(false)} onCheckout={handleCheckout} platformAccounts={platformAccounts} />}
            </div>
        </div>

        {/* Bottom Menu */}
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-around px-4 pt-2 pb-7 w-full z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] transition-colors duration-300">
          <button onClick={() => navigateTo('HOME')} className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${activeTab === 'HOME' ? 'text-indigo-600 -translate-y-2 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><div className={`p-1.5 rounded-xl transition-all ${activeTab === 'HOME' ? 'bg-indigo-50 dark:bg-indigo-900/40' : 'bg-transparent'}`}><Home size={22} className={activeTab === 'HOME' ? 'fill-indigo-600 dark:fill-indigo-400' : ''} /></div>{activeTab === 'HOME' && <span className="text-[9px] font-bold mt-1 animate-fade-in">Início</span>}</button>
          <button onClick={() => navigateTo('MAP')} className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${activeTab === 'MAP' ? 'text-indigo-600 -translate-y-2 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><div className={`p-1.5 rounded-xl transition-all ${activeTab === 'MAP' ? 'bg-indigo-50 dark:bg-indigo-900/40' : 'bg-transparent'}`}><Map size={22} className={activeTab === 'MAP' ? 'fill-indigo-600 dark:fill-indigo-400' : ''} /></div>{activeTab === 'MAP' && <span className="text-[9px] font-bold mt-1 animate-fade-in">Mapa</span>}</button>
          <button onClick={() => navigateTo('MARKET')} className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${activeTab === 'MARKET' ? 'text-indigo-600 -translate-y-2 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><div className={`p-1.5 rounded-xl transition-all ${activeTab === 'MARKET' ? 'bg-indigo-50 dark:bg-indigo-900/40' : 'bg-transparent'}`}><ShoppingBag size={22} className={activeTab === 'MARKET' ? 'fill-indigo-600 dark:fill-indigo-400' : ''} /></div>{activeTab === 'MARKET' && <span className="text-[9px] font-bold mt-1 animate-fade-in">Loja</span>}</button>
          <button onClick={() => navigateTo('PROFILE')} className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${activeTab === 'PROFILE' ? 'text-indigo-600 -translate-y-2 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><div className={`p-1.5 rounded-xl transition-all ${activeTab === 'PROFILE' ? 'bg-indigo-50 dark:bg-indigo-900/40' : 'bg-transparent'}`}><User size={22} className={activeTab === 'PROFILE' ? 'fill-indigo-600 dark:fill-indigo-400' : ''} /></div>{activeTab === 'PROFILE' && <span className="text-[9px] font-bold mt-1 animate-fade-in">Perfil</span>}</button>
        </div>
      </div>

      {isMenuOpen && user && (
          <div className="md:hidden absolute inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
              <div className={`w-[85%] h-full shadow-2xl relative z-10 animate-[slideRight_0.3s_ease-out] flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                  <div className="p-8 bg-gradient-to-br from-indigo-600 to-violet-800 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                      <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30"><X size={20} /></button>
                      <div className="w-16 h-16 bg-white rounded-full p-0.5 mb-4 shadow-lg"><img src={user.profileImage} alt="User" className="w-full h-full rounded-full object-cover" /></div>
                      <h2 className="text-xl font-bold">{user.name}</h2>
                      <p className="text-indigo-100 text-sm">{user.isBusiness ? 'Conta Empresarial' : 'Conta Pessoal'}</p>
                      
                      {/* Connection Status in Mobile Menu */}
                      <div className={`mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 ${connectionStatus === 'connected' ? 'text-green-300' : 'text-red-300'}`}>
                          {connectionStatus === 'connected' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                          {connectionStatus === 'connected' ? 'Supabase Conectado' : 'Erro de Conexão'}
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto py-6">
                       <nav className="space-y-1 px-4">
                          <button onClick={() => navigateToProfileSection('SETTINGS')} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"><div className="flex items-center gap-3"><Settings size={20} /> Configurações</div><ChevronRight size={16} className="text-gray-300 dark:text-gray-600" /></button>
                          <button onClick={() => navigateToProfileSection('HELP')} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"><div className="flex items-center gap-3"><HelpCircle size={20} /> Ajuda & Suporte</div><ChevronRight size={16} className="text-gray-300 dark:text-gray-600" /></button>
                          <button onClick={() => navigateToProfileSection('TERMS')} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"><div className="flex items-center gap-3"><FileText size={20} /> Termos de Uso</div><ChevronRight size={16} className="text-gray-300 dark:text-gray-600" /></button>
                      </nav>
                  </div>
                  <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"><LogOut size={20} /> Terminar Sessão</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
