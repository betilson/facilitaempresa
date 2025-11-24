import React, { useState, useRef, useEffect } from 'react';
import { PLANS, ANGOLA_PROVINCES, ANGOLA_MUNICIPALITIES } from '../constants';
import { generateAdCopy } from '../services/geminiService';
import { User, Settings, CreditCard, LogOut, Check, Star, Sparkles, ChevronRight, ArrowLeft, ToggleLeft, ToggleRight, Moon, Globe, Bell, Package, Heart, Building2, Phone, Landmark, FileText, Camera, MapPin, ChevronDown, Plus, Wallet, X, Trash2, ArrowRight, HelpCircle, Loader2, GitBranch, Edit2, ShoppingBag } from 'lucide-react';
import { Button } from './Button';
import { BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts';
import { User as UserType, Product, PlanType, Bank } from '../types';
import { processImage } from '../utils/imageOptimizer';

export type ProfileView = 'MAIN' | 'PERSONAL' | 'WALLET' | 'SETTINGS' | 'PLANS' | 'AI_TOOLS' | 'FAVORITES' | 'UPGRADE' | 'PLAN_PAYMENT' | 'HELP' | 'TERMS' | 'BRANCHES';

interface ProfileProps {
    user: UserType;
    onLogout: () => void;
    onOpenMyProducts: () => void;
    favoriteProducts?: Product[];
    onSelectFavorite?: (product: Product) => void;
    onUpgradeUser?: (details: { name: string; phone: string; isBank: boolean; nif: string, plan: PlanType }) => void;
    onUpdateUser?: (user: UserType) => void;
    initialView?: ProfileView;
    navigationTimestamp?: number; // New prop to force view updates
    products?: Product[];
    isDarkMode?: boolean;
    onToggleDarkMode?: () => void;
    // Props for Branch Management
    myBranches?: Bank[];
    onAddBranch?: (branchData: Partial<Bank>) => void;
    onUpdateBranch?: (branchId: string, branchData: Partial<Bank>) => void;
    onDeleteBranch?: (branchId: string) => void;
    onManageBranchProducts?: (branchId: string, branchName: string) => void;
}

interface PaymentCard {
    id: string;
    type: 'VISA' | 'MULTICAIXA';
    number: string;
    holder: string;
    expiry: string;
    cvv: string;
}

const data = [
  { name: 'Seg', views: 40 },
  { name: 'Ter', views: 30 },
  { name: 'Qua', views: 20 },
  { name: 'Qui', views: 27 },
  { name: 'Sex', views: 18 },
  { name: 'Sab', views: 23 },
  { name: 'Dom', views: 34 },
];

// Extracted Components to prevent re-rendering focus loss
const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800">
            <ArrowLeft size={24} className="text-gray-800 dark:text-gray-200" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
);

const ProfileContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-20 p-6 animate-[slideInRight_0.2s_ease-out]">
        <div className="max-w-3xl mx-auto w-full">
            {children}
        </div>
    </div>
);

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, onOpenMyProducts, favoriteProducts = [], onSelectFavorite, onUpgradeUser, onUpdateUser, initialView, navigationTimestamp, products = [], isDarkMode, onToggleDarkMode, myBranches = [], onAddBranch, onUpdateBranch, onDeleteBranch, onManageBranchProducts }) => {
    const [view, setView] = useState<ProfileView>(initialView || 'MAIN');
    const [aiResult, setAiResult] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);
    // Initialize default plan to FREE
    const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<PlanType>(PlanType.FREE);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Image Processing States
    const [isOptimizingImage, setIsOptimizingImage] = useState(false);

    // Update view if initialView prop or timestamp changes
    useEffect(() => {
        if (initialView) {
            setView(initialView);
        }
    }, [initialView, navigationTimestamp]);

    // Form states
    const [name, setName] = useState(user.name || '');
    const [email, setEmail] = useState(user.email || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [address, setAddress] = useState(user.address || '');
    const [province, setProvince] = useState(user.province || '');
    const [municipality, setMunicipality] = useState(user.municipality || '');
    const [nif, setNif] = useState(user.nif || '');
    
    // Branch Form States
    const [showAddBranch, setShowAddBranch] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Bank | null>(null); // Track which branch is being edited
    const [branchName, setBranchName] = useState('');
    const [branchPhone, setBranchPhone] = useState('');
    const [branchAddress, setBranchAddress] = useState('');
    const [branchProvince, setBranchProvince] = useState('');
    const [branchMunicipality, setBranchMunicipality] = useState('');

    // Profile Image State
    const [profileImage, setProfileImage] = useState(user.profileImage || 'https://picsum.photos/200');
    const [coverImage, setCoverImage] = useState(user.coverImage || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80');

    // Wallet State
    const [cards, setCards] = useState<PaymentCard[]>([
        { id: '1', type: 'MULTICAIXA', number: '9000 1234 5678 9012', holder: user.name.toUpperCase(), expiry: '12/30', cvv: '***' },
        { id: '2', type: 'VISA', number: '4532 **** **** 1290', holder: user.name.toUpperCase(), expiry: '09/28', cvv: '***' }
    ]);
    const [showAddCard, setShowAddCard] = useState(false);
    
    // Add Card Form State
    const [newCardType, setNewCardType] = useState<'VISA' | 'MULTICAIXA'>('MULTICAIXA');
    const [newCardNumber, setNewCardNumber] = useState('');
    const [newCardExpiry, setNewCardExpiry] = useState('');
    const [newCardCvv, setNewCardCvv] = useState('');
    const [newCardHolder, setNewCardHolder] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    // Upgrade Form States
    const [upgradeName, setUpgradeName] = useState(user.name || '');
    const [upgradePhone, setUpgradePhone] = useState(user.phone || '');
    const [upgradeIsBank, setUpgradeIsBank] = useState(false);
    const [upgradeNif, setUpgradeNif] = useState('');

    // Sync state with user prop changes
    useEffect(() => {
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setAddress(user.address || '');
        setProvince(user.province || '');
        setMunicipality(user.municipality || '');
        setNif(user.nif || '');
        setProfileImage(user.profileImage || 'https://picsum.photos/200');
        setCoverImage(user.coverImage || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80');
    }, [user]);

    // Initialize Edit Form when editingBranch changes
    useEffect(() => {
        if (editingBranch) {
            setBranchName(editingBranch.name || '');
            setBranchPhone(editingBranch.phone || '');
            setBranchAddress(editingBranch.address || '');
            setBranchProvince(editingBranch.province || '');
            setBranchMunicipality(editingBranch.municipality || '');
            setShowAddBranch(true);
        }
    }, [editingBranch]);

    const handleGenerateAd = async () => {
        setLoadingAi(true);
        const result = await generateAdCopy("Tênis Nike Air", "confortável, barato, original");
        setAiResult(result);
        setLoadingAi(false);
    }

    const handleUpgradeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (upgradeNif.length !== 10) {
            alert("O NIF deve conter exatamente 10 dígitos numéricos.");
            return;
        }

        if (onUpgradeUser) {
            onUpgradeUser({
                name: upgradeName,
                phone: upgradePhone,
                isBank: upgradeIsBank,
                nif: upgradeNif,
                plan: selectedUpgradePlan
            });
            alert(`Conta empresarial criada com sucesso! Plano ${selectedUpgradePlan} ativado.`);
            setView('MAIN');
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setIsOptimizingImage(true);
                const { optimized } = await processImage(file);
                
                setProfileImage(optimized);
                
                // Auto-save the new profile image immediately
                if (onUpdateUser) {
                    onUpdateUser({
                        ...user,
                        name,
                        email,
                        phone,
                        address,
                        province,
                        municipality,
                        nif: user.isBusiness ? nif : undefined,
                        profileImage: optimized,
                        coverImage
                    });
                }
            } catch (error) {
                alert(error instanceof Error ? error.message : "Erro ao processar imagem");
            } finally {
                setIsOptimizingImage(false);
            }
        }
    };

    const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setIsOptimizingImage(true);
                const { optimized } = await processImage(file);
                
                setCoverImage(optimized);

                // Auto-save the new cover image immediately
                if (onUpdateUser) {
                    onUpdateUser({
                        ...user,
                        name,
                        email,
                        phone,
                        address,
                        province,
                        municipality,
                        nif: user.isBusiness ? nif : undefined,
                        profileImage,
                        coverImage: optimized
                    });
                }
            } catch (error) {
                alert(error instanceof Error ? error.message : "Erro ao processar imagem");
            } finally {
                setIsOptimizingImage(false);
            }
        }
    };

    const triggerFileInput = () => {
        if (!isOptimizingImage) fileInputRef.current?.click();
    };

    const triggerCoverInput = () => {
        if (!isOptimizingImage) coverInputRef.current?.click();
    };

    const handleSavePersonalData = () => {
        if (onUpdateUser) {
            // Basic validation for NIF if business
            if (user.isBusiness && nif.length !== 10) {
                alert("O NIF deve ter exatamente 10 dígitos.");
                return;
            }

            onUpdateUser({
                ...user,
                name,
                email,
                phone,
                address,
                province,
                municipality,
                nif: user.isBusiness ? nif : undefined,
                profileImage,
                coverImage
            });
            alert('Dados atualizados com sucesso!');
        }
    };

    const handleSubmitBranch = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingBranch) {
            // Update Existing
            if (onUpdateBranch) {
                onUpdateBranch(editingBranch.id, {
                    name: branchName,
                    phone: branchPhone,
                    address: branchAddress,
                    province: branchProvince,
                    municipality: branchMunicipality
                });
                alert("Agência atualizada com sucesso!");
            }
        } else {
            // Create New
            if (onAddBranch) {
                onAddBranch({
                    name: branchName,
                    phone: branchPhone,
                    address: branchAddress,
                    province: branchProvince,
                    municipality: branchMunicipality,
                    coverImage: user.coverImage,
                    logo: user.profileImage,
                    description: user.isBank 
                        ? `Agência do ${user.name} localizada em ${branchMunicipality || 'localização estratégica'}.` 
                        : `Filial da ${user.name}.`,
                });
                alert("Agência adicionada com sucesso!");
            }
        }
        
        // Reset and Close
        setShowAddBranch(false);
        setEditingBranch(null);
        setBranchName('');
        setBranchPhone('');
        setBranchAddress('');
        setBranchProvince('');
        setBranchMunicipality('');
    };

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        const newCard: PaymentCard = {
            id: Date.now().toString(),
            type: newCardType,
            number: newCardNumber,
            holder: newCardHolder || user.name.toUpperCase(),
            expiry: newCardExpiry,
            cvv: newCardCvv
        };
        setCards([...cards, newCard]);
        setShowAddCard(false);
        // Reset form
        setNewCardNumber('');
        setNewCardExpiry('');
        setNewCardCvv('');
        setNewCardHolder('');
    };
    
    const handleDeleteCard = (id: string) => {
        if(window.confirm("Tem certeza que deseja remover este cartão?")) {
            setCards(prevCards => prevCards.filter(c => c.id !== id));
        }
    };

    const handleSelectPlan = (planType: PlanType) => {
        setSelectedUpgradePlan(planType);
        if (!user.isBusiness) {
            // If personal, redirect to upgrade screen with this plan selected
            setView('UPGRADE');
        } else {
            // If already business, go to payment view
            setView('PLAN_PAYMENT');
        }
    };

    const handlePlanPayment = () => {
        setIsProcessingPayment(true);
        setTimeout(() => {
            setIsProcessingPayment(false);
            if (onUpdateUser) {
                // Logic to carry over unused benefits
                const myProducts = products.filter(p => p.ownerId === user.id || p.companyName === user.name);
                const currentUsageProducts = myProducts.length;
                const currentUsageHighlights = myProducts.filter(p => p.isPromoted).length;

                // Determine current limits
                const currentPlanDetails = PLANS.find(p => p.type === (user.plan || PlanType.FREE));
                const currentMaxProd = user.customLimits?.maxProducts ?? currentPlanDetails?.maxProducts ?? 2;
                const currentMaxHigh = user.customLimits?.maxHighlights ?? currentPlanDetails?.maxHighlights ?? 0;

                // Calculate remaining (don't allow negative)
                const remainingProd = currentMaxProd === -1 ? 0 : Math.max(0, currentMaxProd - currentUsageProducts);
                const remainingHigh = currentMaxHigh === -1 ? 0 : Math.max(0, currentMaxHigh - currentUsageHighlights);

                // Get new plan base limits
                const newPlanDetails = PLANS.find(p => p.type === selectedUpgradePlan);
                let newMaxProd = newPlanDetails?.maxProducts ?? 0;
                let newMaxHigh = newPlanDetails?.maxHighlights ?? 0;

                // Add unused benefits to new plan (if new plan is not unlimited)
                if (newMaxProd !== -1) {
                    newMaxProd += remainingProd;
                }
                if (newMaxHigh !== -1) {
                    newMaxHigh += remainingHigh;
                }

                onUpdateUser({
                    ...user,
                    plan: selectedUpgradePlan,
                    customLimits: {
                        maxProducts: newMaxProd,
                        maxHighlights: newMaxHigh
                    }
                });
                alert(`Compra realizada com sucesso! O seu plano agora é ${selectedUpgradePlan}. Benefícios acumulados!`);
                setView('MAIN');
            }
        }, 2000);
    }

    if (view === 'BRANCHES') {
        return (
            <ProfileContainer>
                <Header title="Gerir Agências e Filiais" onBack={() => setView('MAIN')} />
                
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl mb-6 flex items-start gap-3">
                    <Building2 className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" size={20} />
                    <div className="text-sm">
                        <p className="font-bold text-gray-900 dark:text-white">Expanda a sua rede</p>
                        <p className="text-gray-600 dark:text-gray-400">Adicione suas agências para que os clientes as encontrem no mapa e no perfil da sua empresa.</p>
                    </div>
                </div>

                {!showAddBranch ? (
                    <>
                        <div className="space-y-4 mb-20">
                            {myBranches.length === 0 ? (
                                <div className="text-center py-10 opacity-60">
                                    <GitBranch size={48} className="mx-auto text-gray-400 mb-3" />
                                    <p className="text-gray-500 font-medium">Nenhuma agência adicionada</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {myBranches.map(branch => (
                                        <div key={branch.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500 dark:text-gray-300">
                                                    {branch.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{branch.name}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{branch.municipality}, {branch.province}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                 <button 
                                                    onClick={() => setEditingBranch(branch)}
                                                    className="p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => onDeleteBranch && onDeleteBranch(branch.id)}
                                                    className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => {
                                setEditingBranch(null);
                                setBranchName(`${user.name} - `);
                                setBranchPhone('');
                                setBranchAddress('');
                                setBranchProvince('');
                                setBranchMunicipality('');
                                setShowAddBranch(true);
                            }}
                            className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center text-white z-20 hover:scale-110 transition-transform"
                        >
                            <Plus size={28} />
                        </button>
                    </>
                ) : (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 animate-[slideUp_0.2s_ease-out]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{editingBranch ? 'Editar Agência' : 'Nova Agência'}</h3>
                            <button 
                                onClick={() => {
                                    setShowAddBranch(false);
                                    setEditingBranch(null);
                                }} 
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                            >
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitBranch} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Agência</label>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <input 
                                        type="text" 
                                        required
                                        value={branchName}
                                        onChange={(e) => setBranchName(e.target.value)}
                                        className="bg-transparent w-full outline-none text-gray-900 dark:text-white"
                                        placeholder="Ex: Banco BIC - Agência Kilamba"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone da Agência</label>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <input 
                                        type="tel" 
                                        value={branchPhone}
                                        onChange={(e) => setBranchPhone(e.target.value)}
                                        className="bg-transparent w-full outline-none text-gray-900 dark:text-white"
                                        placeholder="+244..."
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Província</label>
                                    <div className="relative">
                                        <select 
                                            value={branchProvince}
                                            onChange={(e) => {
                                                setBranchProvince(e.target.value);
                                                setBranchMunicipality('');
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 outline-none appearance-none text-gray-900 dark:text-white"
                                        >
                                            <option value="">Selecione</option>
                                            {ANGOLA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Município</label>
                                    <div className="relative">
                                        <select 
                                            value={branchMunicipality}
                                            onChange={(e) => setBranchMunicipality(e.target.value)}
                                            disabled={!branchProvince}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 outline-none appearance-none text-gray-900 dark:text-white disabled:opacity-50"
                                        >
                                            <option value="">Selecione</option>
                                            {branchProvince && ANGOLA_MUNICIPALITIES[branchProvince]?.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço Completo</label>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <input 
                                        type="text" 
                                        value={branchAddress}
                                        onChange={(e) => setBranchAddress(e.target.value)}
                                        className="bg-transparent w-full outline-none text-gray-900 dark:text-white"
                                        placeholder="Rua, Bairro, Ponto de referência..."
                                        autoComplete="street-address"
                                    />
                                </div>
                            </div>

                            <Button type="submit" fullWidth className="mt-4">
                                {editingBranch ? 'Atualizar Agência' : 'Adicionar Agência'}
                            </Button>
                        </form>
                    </div>
                )}
            </ProfileContainer>
        );
    }

    if (view === 'UPGRADE') {
        return (
            <ProfileContainer>
                <Header title="Criar Conta Empresa" onBack={() => setView('MAIN')} />
                
                <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl text-indigo-800 dark:text-indigo-300 text-sm border border-indigo-100 dark:border-indigo-800 flex items-start gap-3">
                    <Building2 className="shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="font-bold mb-1">Passo final para vender!</p>
                        <p>Preencha os dados da empresa. O plano <strong>{selectedUpgradePlan}</strong> será ativado após a confirmação.</p>
                    </div>
                </div>

                <form onSubmit={handleUpgradeSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome da Empresa</label>
                        <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-all">
                            <Building2 size={20} className="text-gray-400 mr-3" />
                            <input 
                                type="text" 
                                required
                                value={upgradeName}
                                onChange={(e) => setUpgradeName(e.target.value)}
                                className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-medium"
                                placeholder="Ex: Tech Solutions Lda"
                                autoComplete="organization"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">NIF</label>
                        <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-all">
                            <FileText size={20} className="text-gray-400 mr-3" />
                            <input 
                                type="text" 
                                required
                                maxLength={10}
                                value={upgradeNif}
                                onChange={(e) => {
                                    // Ensure only numbers
                                    const val = e.target.value.replace(/\D/g, '');
                                    setUpgradeNif(val);
                                }}
                                className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-medium"
                                placeholder="0000000000"
                                inputMode="numeric"
                            />
                        </div>
                        {upgradeNif.length > 0 && upgradeNif.length !== 10 && (
                            <p className="text-xs text-red-500 mt-1 pl-1">O NIF deve ter exatamente 10 dígitos.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Telefone Comercial</label>
                        <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-all">
                            <Phone size={20} className="text-gray-400 mr-3" />
                            <input 
                                type="tel" 
                                required
                                value={upgradePhone}
                                onChange={(e) => setUpgradePhone(e.target.value)}
                                className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-medium"
                                placeholder="+244 900 000 000"
                                autoComplete="tel"
                            />
                        </div>
                    </div>

                    <div 
                        onClick={() => setUpgradeIsBank(!upgradeIsBank)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${upgradeIsBank ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${upgradeIsBank ? 'bg-teal-200 dark:bg-teal-700 text-teal-800 dark:text-teal-100' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                <Landmark size={24} />
                            </div>
                            <div>
                                <p className={`font-bold ${upgradeIsBank ? 'text-teal-900 dark:text-teal-200' : 'text-gray-700 dark:text-gray-300'}`}>Instituição Bancária</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Marque se esta conta representa um banco.</p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${upgradeIsBank ? 'border-teal-500 bg-teal-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            {upgradeIsBank && <Check size={14} className="text-white" />}
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" fullWidth className="h-14 text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40" disabled={upgradeNif.length !== 10}>
                            Confirmar e Ativar
                        </Button>
                    </div>
                </form>
            </ProfileContainer>
        );
    }

    if (view === 'PLAN_PAYMENT') {
        const plan = PLANS.find(p => p.type === selectedUpgradePlan);
        return (
            <ProfileContainer>
                <Header title="Resumo do Pedido" onBack={() => setView('MAIN')} />
                
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 mb-6">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase mb-4">Plano Selecionado</h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{plan?.type}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cobrança mensal</p>
                        </div>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                             {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(plan?.price || 0)}
                        </p>
                    </div>
                </div>

                <div className="mb-8">
                     <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase mb-4">Método de Pagamento</h3>
                     {/* Show first card or default */}
                     <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center gap-4 dark:bg-gray-800">
                        <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center">
                             <div className="w-6 h-4 border border-white/30 rounded-sm"></div>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">Multicaixa Express</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">**** 1234</p>
                        </div>
                        <Check size={20} className="ml-auto text-teal-600" />
                     </div>
                </div>

                <Button 
                    onClick={handlePlanPayment} 
                    fullWidth 
                    disabled={isProcessingPayment}
                    className="h-14 text-lg"
                >
                    {isProcessingPayment ? 'Processando...' : 'Confirmar Pagamento'}
                </Button>
            </ProfileContainer>
        )
    }

    if (view === 'FAVORITES') {
        return (
            <ProfileContainer>
                <Header title="Meus Favoritos" onBack={() => setView('MAIN')} />
                
                {favoriteProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-60">
                        <Heart size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Sem favoritos</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Toque no coração dos produtos que você ama.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {favoriteProducts.map(product => (
                            <button 
                                key={product.id}
                                onClick={() => onSelectFavorite && onSelectFavorite(product)}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-left group"
                            >
                                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3 relative">
                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-2 right-2 bg-white dark:bg-gray-900 rounded-full p-1.5 shadow-sm z-10">
                                        <Heart size={14} className="fill-red-500 text-red-500" />
                                    </div>
                                    {product.isPromoted && (
                                        <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1.5 py-0.5 rounded">
                                            DESTAQUE
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">{product.title}</h3>
                                <p className="font-bold text-teal-600 dark:text-teal-400 text-sm">
                                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(product.price)}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </ProfileContainer>
        );
    }

    if (view === 'PERSONAL') {
        return (
            <ProfileContainer>
                <Header title={user.isBusiness ? "Dados da Empresa" : "Dados Pessoais"} onBack={() => setView('MAIN')} />
                
                <div className="space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg relative">
                                {isOptimizingImage ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                                        <Loader2 size={24} className="text-white animate-spin" />
                                    </div>
                                ) : null}
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-md">
                                <Camera size={14} />
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 -mt-4 mb-4">
                        {isOptimizingImage ? 'Otimizando imagem...' : 'Toque para alterar a foto'}
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {user.isBusiness ? 'Nome da Empresa' : 'Nome completo'}
                            </label>
                            <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-colors">
                                {user.isBusiness ? <Building2 size={18} className="text-gray-400 mr-3" /> : <User size={18} className="text-gray-400 mr-3" />}
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-transparent w-full outline-none text-gray-800 dark:text-gray-200"
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        {user.isBusiness && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIF</label>
                                <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-colors">
                                    <FileText size={18} className="text-gray-400 mr-3" />
                                    <input 
                                        type="text" 
                                        value={nif}
                                        onChange={(e) => {
                                             // Only allow numbers
                                             const val = e.target.value.replace(/\D/g, '');
                                             setNif(val);
                                        }}
                                        maxLength={10}
                                        className="bg-transparent w-full outline-none text-gray-800 dark:text-gray-200"
                                        placeholder="Número de Identificação Fiscal"
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-colors">
                                <span className="text-gray-400 mr-3 text-sm">@</span>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-transparent w-full outline-none text-gray-800 dark:text-gray-200"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                            <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-colors">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Flag_of_Angola.svg/1200px-Flag_of_Angola.svg.png" className="w-6 h-4 object-cover mr-3 rounded-sm" alt="Angola Flag" />
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="bg-transparent w-full outline-none text-gray-800 dark:text-gray-200"
                                    autoComplete="tel"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Província</label>
                                <div className="relative">
                                    <select 
                                        value={province}
                                        onChange={(e) => {
                                            setProvince(e.target.value);
                                            setMunicipality(''); // Reset municipality
                                        }}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none appearance-none text-gray-800 dark:text-gray-200"
                                    >
                                        <option value="">Selecione</option>
                                        {ANGOLA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Município</label>
                                <div className="relative">
                                    <select 
                                        value={municipality}
                                        onChange={(e) => setMunicipality(e.target.value)}
                                        disabled={!province}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none appearance-none text-gray-800 dark:text-gray-200 disabled:opacity-50"
                                    >
                                        <option value="">Selecione</option>
                                        {province && ANGOLA_MUNICIPALITIES[province]?.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                     <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço</label>
                            <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-colors">
                                <MapPin size={18} className="text-gray-400 mr-3" />
                                <input 
                                    type="text" 
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="bg-transparent w-full outline-none text-gray-800 dark:text-gray-200"
                                    placeholder="Rua, Bairro, Nº Casa"
                                    autoComplete="street-address"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <Button fullWidth onClick={handleSavePersonalData} className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40">
                            Salvar as alterações
                        </Button>
                    </div>
                </div>
            </ProfileContainer>
        );
    }

    if (view === 'WALLET') {
        return (
            <ProfileContainer>
                <Header title="Carteira" onBack={() => setView('MAIN')} />
                
                {/* Cards List */}
                <div className="space-y-6 mb-8 max-w-md mx-auto">
                    {cards.map((card) => (
                        <div 
                            key={card.id}
                            className={`rounded-2xl p-6 text-white shadow-xl relative overflow-hidden transition-transform hover:scale-[1.02] aspect-[1.58/1] flex flex-col justify-between group
                                ${card.type === 'MULTICAIXA' 
                                    ? 'bg-gradient-to-br from-[#FF8800] to-[#FF5500]' // Orange Gradient for Multicaixa
                                    : 'bg-gradient-to-br from-[#1A1F71] to-[#004E92]' // Visa Blue
                                }`
                            }
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
                            
                            {/* Delete Button (Always Visible for better mobile UX) */}
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleDeleteCard(card.id); 
                                }}
                                className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-all z-20 cursor-pointer"
                                title="Remover cartão"
                                type="button"
                            >
                                <Trash2 size={16} />
                            </button>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="h-10 flex items-center">
                                    {card.type === 'MULTICAIXA' ? (
                                        <div className="flex items-center gap-3">
                                            {/* Professional Multicaixa Logo */}
                                            <div className="bg-white rounded-lg p-1 shadow-sm h-9 w-9 flex items-center justify-center">
                                                 <img 
                                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Multicaixa_logo.png/600px-Multicaixa_logo.png" 
                                                    alt="Multicaixa" 
                                                    className="h-full w-full object-contain" 
                                                 />
                                            </div>
                                            <div>
                                                <span className="font-black italic tracking-tighter text-lg text-white drop-shadow-sm block leading-none">multicaixa</span>
                                                <span className="font-light text-[10px] text-white/90 tracking-widest uppercase block leading-none">express</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <img 
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" 
                                            alt="Visa" 
                                            className="h-8 w-auto brightness-0 invert opacity-100" 
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="relative z-10 pl-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-10 h-7 bg-[#ffcb66] rounded-md overflow-hidden relative shadow-sm border border-yellow-600/20">
                                         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-700/30"></div>
                                         <div className="absolute top-0 left-1/2 h-full w-[1px] bg-yellow-700/30"></div>
                                         <div className="absolute top-2 left-2 w-1.5 h-1.5 border border-yellow-800/40 rounded-sm"></div>
                                    </div>
                                    <span className="text-white/60 text-xs font-mono tracking-wider">Contactless</span>
                                </div>
                                <p className="text-xl md:text-2xl font-mono tracking-widest drop-shadow-md text-white/95">{card.number}</p>
                            </div>

                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <p className="text-[9px] text-white/70 uppercase tracking-wider mb-0.5">Titular</p>
                                    <p className="font-bold text-sm tracking-wide text-white truncate max-w-[150px]">{card.holder}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-white/70 uppercase tracking-wider mb-0.5">Validade</p>
                                    <p className="font-bold text-sm tracking-wide text-white">{card.expiry}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Card Button / Form Toggle */}
                {!showAddCard ? (
                    <button 
                        onClick={() => setShowAddCard(true)}
                        className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 font-bold hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all max-w-md mx-auto"
                    >
                        <Plus size={20} />
                        Adicionar novo cartão
                    </button>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 animate-[slideUp_0.2s_ease-out] max-w-md mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white">Novo Cartão</h3>
                            <button onClick={() => setShowAddCard(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCard} className="space-y-4">
                            {/* Card Type Selector */}
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setNewCardType('MULTICAIXA')}
                                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 h-24 ${newCardType === 'MULTICAIXA' ? 'border-[#FF6B00] bg-orange-50 dark:bg-orange-900/20 text-[#FF6B00]' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500'}`}
                                >
                                     <div className="bg-[#FF6B00] w-10 h-6 rounded flex items-center justify-center">
                                         <span className="text-white text-[10px] font-black italic">MC</span>
                                     </div>
                                    Multicaixa Express
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewCardType('VISA')}
                                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 h-24 ${newCardType === 'VISA' ? 'border-[#1A1F71] bg-indigo-50 dark:bg-indigo-900/20 text-[#1A1F71] dark:text-indigo-400' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500'}`}
                                >
                                    <div className="bg-[#1A1F71] w-10 h-6 rounded flex items-center justify-center">
                                         <span className="text-white text-[10px] font-black italic">VISA</span>
                                     </div>
                                    Visa Internacional
                                </button>
                            </div>

                            <div className="px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-colors">
                                <input 
                                    type="text" 
                                    required
                                    value={newCardNumber}
                                    onChange={(e) => {
                                        // Simple formatting
                                        const val = e.target.value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || '';
                                        if (val.length <= 19) setNewCardNumber(val);
                                    }}
                                    placeholder="Número do cartão" 
                                    className="bg-transparent w-full outline-none text-sm font-medium text-gray-900 dark:text-white"
                                    inputMode="numeric"
                                />
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex-1 focus-within:border-indigo-500 transition-colors">
                                    <input 
                                        type="text" 
                                        required
                                        value={newCardExpiry}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                                            if (val.length <= 5) setNewCardExpiry(val);
                                        }}
                                        placeholder="MM/AA" 
                                        className="bg-transparent w-full outline-none text-sm font-medium text-gray-900 dark:text-white"
                                        inputMode="numeric"
                                    />
                                </div>
                                <div className="px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex-1 focus-within:border-indigo-500 transition-colors">
                                    <input 
                                        type="password" 
                                        required
                                        value={newCardCvv}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 3) setNewCardCvv(val);
                                        }}
                                        placeholder="CVV" 
                                        maxLength={3}
                                        className="bg-transparent w-full outline-none text-sm font-medium text-gray-900 dark:text-white"
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                            
                            <div className="px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-colors">
                                <input 
                                    type="text" 
                                    value={newCardHolder}
                                    onChange={(e) => setNewCardHolder(e.target.value.toUpperCase())}
                                    placeholder={user.name.toUpperCase()} 
                                    className="bg-transparent w-full outline-none text-sm font-medium uppercase text-gray-900 dark:text-white" 
                                />
                            </div>

                            <Button type="submit" fullWidth className="mt-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                                Salvar Cartão
                            </Button>
                        </form>
                    </div>
                )}
            </ProfileContainer>
        );
    }

    if (view === 'SETTINGS') {
        return (
             <ProfileContainer>
                <Header title="Configurações" onBack={() => setView('MAIN')} />

                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 mt-2">Geral</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Bell className="text-gray-600 dark:text-gray-300" size={20} />
                            <span className="font-medium text-gray-800 dark:text-gray-200">Notificações</span>
                        </div>
                        <ToggleRight className="text-indigo-600 dark:text-indigo-400" size={32} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Moon className="text-gray-600 dark:text-gray-300" size={20} />
                            <span className="font-medium text-gray-800 dark:text-gray-200">Modo Escuro</span>
                        </div>
                        <button onClick={onToggleDarkMode}>
                            {isDarkMode ? (
                                <ToggleRight className="text-indigo-600 dark:text-indigo-400" size={32} />
                            ) : (
                                <ToggleLeft className="text-gray-300" size={32} />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Globe className="text-gray-600 dark:text-gray-300" size={20} />
                            <span className="font-medium text-gray-800 dark:text-gray-200">Idioma</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            Português <ChevronRight size={16} />
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 mt-8">Segurança</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <span className="font-medium text-gray-800 dark:text-gray-200">Face ID</span>
                        <ToggleRight className="text-indigo-600 dark:text-indigo-400" size={32} />
                    </div>
                </div>
            </ProfileContainer>
        )
    }

    if (view === 'PLANS') {
        return (
            <ProfileContainer>
                 <Header title="Planos Empresariais" onBack={() => setView('MAIN')} />
                <p className="text-gray-500 dark:text-gray-400 mb-6 -mt-4">Escolha o melhor para o seu negócio crescer.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PLANS.map(plan => {
                        const isCurrentPlan = user.plan === plan.type || (user.isBusiness && !user.plan && plan.type === PlanType.FREE);
                        return (
                            <div key={plan.id} className={`p-6 rounded-2xl border-2 ${isCurrentPlan ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/30' : `${plan.color} dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200`} relative overflow-hidden transition-transform hover:scale-[1.02] ${isCurrentPlan ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>
                                {isCurrentPlan && (
                                     <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                        PLANO ATUAL
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{plan.type}</h3>
                                        <p className="text-2xl font-bold mt-1">
                                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(plan.price)}
                                            <span className="text-sm font-normal opacity-70">/mês</span>
                                        </p>
                                    </div>
                                    {plan.id === 'premium' && <Star className="fill-yellow-500 text-yellow-500" />}
                                    {isCurrentPlan && <div className="p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400"><Check size={16}/></div>}
                                </div>
                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((feat, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <Check size={16} className={isCurrentPlan ? "text-indigo-600 dark:text-indigo-400" : ""} /> {feat}
                                        </li>
                                    ))}
                                </ul>
                                <Button 
                                    fullWidth 
                                    variant={isCurrentPlan ? 'secondary' : (plan.id === 'premium' ? 'black' : 'outline')} 
                                    className="text-sm py-2"
                                    onClick={() => handleSelectPlan(plan.type)}
                                    disabled={isCurrentPlan}
                                >
                                    {isCurrentPlan ? 'Plano Atual' : `Escolher ${plan.type}`}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </ProfileContainer>
        )
    }

    if (view === 'AI_TOOLS') {
        return (
            <ProfileContainer>
                <Header title="Ferramentas IA" onBack={() => setView('MAIN')} />
                
                <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 text-white mb-6">
                    <Sparkles className="w-10 h-10 mb-4 text-teal-400" />
                    <h2 className="text-2xl font-bold mb-2">Assistente IA</h2>
                    <p className="opacity-90">Use a inteligência artificial para criar anúncios perfeitos para seus produtos.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Gerador de Anúncios</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Exemplo: Tênis Nike Air</p>
                            <Button onClick={handleGenerateAd} disabled={loadingAi} fullWidth variant="secondary">
                                {loadingAi ? 'Gerando...' : 'Gerar Texto Publicitário'}
                            </Button>
                        </div>
                        {aiResult && (
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 text-sm whitespace-pre-wrap">
                                {aiResult}
                            </div>
                        )}
                    </div>
                </div>
            </ProfileContainer>
        )
    }

    if (view === 'HELP') {
        return (
            <ProfileContainer>
                <Header title="Ajuda & Suporte" onBack={() => setView('MAIN')} />
                <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl mb-6 text-center">
                         <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-indigo-600 dark:text-indigo-400">
                            <Phone size={32} />
                         </div>
                         <h3 className="font-bold text-gray-900 dark:text-white mb-2">Precisa de ajuda urgente?</h3>
                         <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Nossa equipa está disponível 24/7 para ajudar você.</p>
                         <Button fullWidth onClick={() => window.open('tel:+244923456789')}>Ligar para Suporte</Button>
                    </div>
    
                    <div className="space-y-2">
                        <details className="group bg-gray-50 dark:bg-gray-800 rounded-xl p-4 cursor-pointer">
                            <summary className="font-bold text-gray-800 dark:text-gray-200 flex justify-between items-center list-none">
                                Como fazer um pagamento?
                                <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
                            </summary>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Vá até a sua carteira, adicione um cartão Multicaixa ou Visa e selecione a opção de pagamento no checkout.</p>
                        </details>
                        <details className="group bg-gray-50 dark:bg-gray-800 rounded-xl p-4 cursor-pointer">
                            <summary className="font-bold text-gray-800 dark:text-gray-200 flex justify-between items-center list-none">
                                É seguro comprar aqui?
                                <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
                            </summary>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sim! Utilizamos criptografia de ponta e processamos pagamentos através da rede Multicaixa oficial.</p>
                        </details>
                         <details className="group bg-gray-50 dark:bg-gray-800 rounded-xl p-4 cursor-pointer">
                            <summary className="font-bold text-gray-800 dark:text-gray-200 flex justify-between items-center list-none">
                                Como vender meus produtos?
                                <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
                            </summary>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Crie uma conta empresarial ou atualize seu perfil pessoal. Depois, basta clicar no botão "+" na loja.</p>
                        </details>
                    </div>
                </div>
            </ProfileContainer>
        );
    }
    
    if (view === 'TERMS') {
        return (
            <ProfileContainer>
                <Header title="Termos de Uso" onBack={() => setView('MAIN')} />
                <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">1. Aceitação dos Termos</h3>
                    <p className="mb-4">Ao acessar e usar o Facilita, você aceita e concorda em estar vinculado aos termos e disposições deste acordo.</p>
                    
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">2. Uso do Serviço</h3>
                    <p className="mb-4">O Facilita fornece uma plataforma para localização de ATMs e marketplace. Você concorda em usar o serviço apenas para fins legais.</p>
    
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">3. Contas de Usuário</h3>
                    <p className="mb-4">Você é responsável por manter a confidencialidade da sua conta e senha. O Facilita não se responsabiliza por qualquer perda decorrente do uso não autorizado.</p>
    
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">4. Pagamentos e Transações</h3>
                    <p className="mb-4">Todas as transações são processadas de forma segura. O Facilita não armazena dados completos do seu cartão.</p>
    
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">5. Alterações nos Termos</h3>
                    <p className="mb-4">Reservamo-nos o direito de modificar estes termos a qualquer momento. O uso continuado do serviço constitui aceitação dos novos termos.</p>
                </div>
            </ProfileContainer>
        );
    }

    // Default MAIN View
    return (
        <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-20">
            {/* Hidden File Input for Avatar */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*"
                className="hidden" 
            />

            {/* Hidden File Input for Cover */}
             <input 
                type="file" 
                ref={coverInputRef} 
                onChange={handleCoverUpload} 
                accept="image/*"
                className="hidden" 
            />

            <div className="relative bg-white dark:bg-gray-800 pb-4 transition-colors duration-300">
                {/* Cover Image Area */}
                <div className="h-40 md:h-64 lg:h-80 w-full relative group cursor-pointer" onClick={triggerCoverInput}>
                     {isOptimizingImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                            <div className="bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-full flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-indigo-600" />
                                <span className="text-xs font-bold text-gray-800 dark:text-white">Otimizando...</span>
                            </div>
                        </div>
                     )}
                     <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                     <button 
                        className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors opacity-100 shadow-sm"
                     >
                        <Camera size={18} />
                     </button>
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white font-bold bg-black/40 px-3 py-1 rounded-full text-sm">Alterar Capa</p>
                     </div>
                </div>

                {/* Profile Header Content (Overlapping) */}
                <div className="px-6 -mt-12 md:-mt-16 relative flex flex-col items-center">
                     <div className="relative group cursor-pointer mb-3" onClick={triggerFileInput}>
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                                {isOptimizingImage && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
                                         <Loader2 size={24} className="animate-spin text-white" />
                                    </div>
                                )}
                                <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-md">
                             <Camera size={14} />
                        </button>
                     </div>
                     
                     <div className="text-center mb-2">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{name}</h1>
                         <p className="text-gray-500 dark:text-gray-400 text-sm">{user.isBusiness ? 'Conta Empresarial' : 'Conta Pessoal'}</p>
                         <p className="text-indigo-600 dark:text-indigo-400 font-medium text-xs mt-0.5">{phone}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-6 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Stats or Promo) */}
                    <div className="lg:col-span-1">
                        {/* Business Stats Card - Only for Business Users */}
                        {user.isBusiness && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white">Estatísticas da Loja</h3>
                                    <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Plano {user.plan || PlanType.FREE}</span>
                                </div>
                                <div style={{ width: '100%', height: 200, minWidth: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data}>
                                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="views" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <Button onClick={() => setView('PLANS')} fullWidth variant="primary" className="mt-4 text-sm bg-gray-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700">
                                    Atualizar o Plano
                                </Button>
                            </div>
                        )}

                        {!user.isBusiness && (
                            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 text-white mb-6 shadow-lg shadow-indigo-500/20">
                                <h3 className="font-bold text-lg mb-2">Seja um Parceiro</h3>
                                <p className="text-indigo-100 text-sm mb-4">Crie uma conta empresarial para vender seus produtos.</p>
                                <Button 
                                    variant="secondary" 
                                    className="text-sm py-2 px-4 bg-white text-indigo-700 hover:bg-gray-100 border-none"
                                    onClick={() => {
                                        setSelectedUpgradePlan(PlanType.FREE);
                                        setView('UPGRADE');
                                    }}
                                >
                                    Criar Conta Empresa
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right Column (Menu Options) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {user.isBusiness && (
                                <>
                                    <button onClick={onOpenMyProducts} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><Package size={20} /></div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">Meus Produtos</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                                    </button>

                                     <button onClick={() => setView('BRANCHES')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400"><GitBranch size={20} /></div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">Gerir Agências/Filiais</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                                    </button>
                                    
                                    <button onClick={() => setView('AI_TOOLS')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400"><Sparkles size={20} /></div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">Ferramentas IA</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                                    </button>
                                </>
                            )}
                            
                            {/* Favorites Menu Item */}
                            <button onClick={() => setView('FAVORITES')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-50 dark:bg-pink-900/30 rounded-lg text-pink-500"><Heart size={20} /></div>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Meus Favoritos</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                            </button>

                            <button onClick={() => setView('PERSONAL')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                                        {user.isBusiness ? <Building2 size={20} /> : <User size={20} />}
                                    </div>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">{user.isBusiness ? 'Dados da Empresa' : 'Dados Pessoais'}</span>
                                </div>
                                 <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                            </button>
                            <button onClick={() => setView('WALLET')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"><Wallet size={20} /></div>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Carteira</span>
                                </div>
                                 <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                            </button>
                            <button onClick={() => setView('SETTINGS')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"><Settings size={20} /></div>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Configurações</span>
                                </div>
                                 <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                            </button>
                            <button onClick={onLogout} className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/20 group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400 group-hover:bg-red-200"><LogOut size={20} /></div>
                                    <span className="font-medium text-red-600 dark:text-red-400">Sair</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};