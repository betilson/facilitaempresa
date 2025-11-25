
import React, { useState, useEffect } from 'react';
import { User, Transaction, Plan, PaymentGatewayConfig, PlatformBankAccount, WithdrawalRequest, Message, Attachment } from '../types';
import { User as UserIcon, Building2, CreditCard, BarChart2, CheckCircle, XCircle, Search, LogOut, LayoutDashboard, ShieldCheck, Lock, Unlock, Verified, Settings, Wallet, FileText, Plus, Trash2, Edit2, Save, Banknote, Eye, MessageSquare, Send, Paperclip, X, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from './Button';

interface AdminDashboardProps {
    users: User[];
    onUpdateUserStatus: (userId: string, action: 'block' | 'verify' | 'unblock') => void;
    onLogout: () => void;
    transactions?: Transaction[];
    onTransactionAction?: (id: string, action: 'approve' | 'reject') => void;
    
    // New Props for dynamic management
    plans: Plan[];
    onManagePlans: (action: 'add' | 'update' | 'delete', plan: Plan) => void;
    
    paymentGateways: PaymentGatewayConfig[];
    onManageGateways: (gateways: PaymentGatewayConfig[]) => void;
    
    platformAccounts: PlatformBankAccount[];
    onManageAccounts: (accounts: PlatformBankAccount[]) => void;

    withdrawalRequests: WithdrawalRequest[];
    onProcessWithdrawal: (id: string, action: 'approve' | 'reject') => void;

    // Support Props
    messages: Message[];
    onSendMessage: (receiverId: string, content: string, productId?: string, productName?: string, attachment?: Attachment) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    users, 
    onUpdateUserStatus, 
    onLogout, 
    transactions = [], 
    onTransactionAction,
    plans,
    onManagePlans,
    paymentGateways,
    onManageGateways,
    platformAccounts,
    onManageAccounts,
    withdrawalRequests,
    onProcessWithdrawal,
    messages,
    onSendMessage
}) => {
    const [view, setView] = useState<'OVERVIEW' | 'USERS' | 'PLANS' | 'FINANCE' | 'SETTINGS' | 'SUPPORT'>('OVERVIEW');
    const [financeSubTab, setFinanceSubTab] = useState<'TRANSACTIONS' | 'SUBSCRIPTIONS' | 'WITHDRAWALS' | 'BALANCES'>('BALANCES');
    const [settingsSubTab, setSettingsSubTab] = useState<'GATEWAYS' | 'ACCOUNTS'>('GATEWAYS');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);
    const [selectedWithdrawalDetail, setSelectedWithdrawalDetail] = useState<WithdrawalRequest | null>(null);

    // Editing States
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [isAddingPlan, setIsAddingPlan] = useState(false);
    
    // Gateway Form State
    const [localGateways, setLocalGateways] = useState<PaymentGatewayConfig[]>(paymentGateways);
    // Accounts Form State
    const [localAccounts, setLocalAccounts] = useState<PlatformBankAccount[]>(platformAccounts);

    // Support Chat State
    const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    // Stats Calculation
    const totalUsers = users.length;
    const businessUsers = users.filter(u => u.isBusiness).length;
    
    // MRR Calculation (Only approved plan payments)
    const mrr = transactions.filter(t => t.status === 'Aprovado' && t.category === 'PLAN_PAYMENT').reduce((acc, curr) => acc + curr.amount, 0);

    // Total Platform Sales Volume (Approved Purchase transactions)
    const totalSalesVolume = transactions.filter(t => t.status === 'Aprovado' && t.category === 'PURCHASE').reduce((acc, curr) => acc + curr.amount, 0);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter Companies for Balances View
    const companies = users.filter(u => u.isBusiness);

    // Support Logic
    const adminId = 'admin-master';
    const supportMessages = messages.filter(m => m.receiverId === adminId || m.senderId === adminId);
    
    // Group messages by user
    const supportConversations: Record<string, Message[]> = {};
    supportMessages.forEach(msg => {
        const otherId = msg.senderId === adminId ? msg.receiverId : msg.senderId;
        if (!supportConversations[otherId]) {
            supportConversations[otherId] = [];
        }
        supportConversations[otherId].push(msg);
    });

    const activeChatMessages = selectedChatUser ? (supportConversations[selectedChatUser] || []).sort((a,b) => a.timestamp - b.timestamp) : [];

    // Chart Data Preparation
    // 1. Plan Revenue (MRR) by Month
    const revenueByMonth = transactions
        .filter(t => t.status === 'Aprovado' && t.category === 'PLAN_PAYMENT')
        .reduce((acc, t) => {
             const month = new Date(t.timestamp).toLocaleString('pt-BR', { month: 'short' });
             acc[month] = (acc[month] || 0) + t.amount;
             return acc;
        }, {} as Record<string, number>);

    const revenueChartData = Object.entries(revenueByMonth).map(([name, value]) => ({ name, value }));
    // If empty, mock some data for visualization if needed, or leave empty
    if(revenueChartData.length === 0) {
         revenueChartData.push({ name: 'Jan', value: 0 }, { name: 'Fev', value: 0 });
    }

    // 2. Sales Volume by Month
    const salesByMonth = transactions
        .filter(t => t.status === 'Aprovado' && t.category === 'PURCHASE')
        .reduce((acc, t) => {
             const month = new Date(t.timestamp).toLocaleString('pt-BR', { month: 'short' });
             acc[month] = (acc[month] || 0) + t.amount;
             return acc;
        }, {} as Record<string, number>);
    
    const salesChartData = Object.entries(salesByMonth).map(([name, value]) => ({ name, value }));
     if(salesChartData.length === 0) {
         salesChartData.push({ name: 'Jan', value: 0 }, { name: 'Fev', value: 0 });
    }

    // Helper for Subscription Expiration Date
    const getExpirationDate = (txDate: number) => {
        const date = new Date(txDate);
        date.setDate(date.getDate() + 30);
        return date.toLocaleDateString('pt-BR');
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            'Pendente': 'bg-yellow-100 text-yellow-700',
            'Aprovado': 'bg-green-100 text-green-700',
            'Processado': 'bg-green-100 text-green-700',
            'Rejeitado': 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            <Icon size={20} />
            <span className="font-medium text-sm">{label}</span>
        </button>
    );

    // --- HANDLERS ---
    const handleSavePlan = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPlan) {
            onManagePlans(isAddingPlan ? 'add' : 'update', editingPlan);
            setEditingPlan(null);
            setIsAddingPlan(false);
        }
    };

    const handleUpdateGateway = (index: number, field: keyof PaymentGatewayConfig, value: any) => {
        const newGateways = [...localGateways];
        newGateways[index] = { ...newGateways[index], [field]: value };
        setLocalGateways(newGateways);
    };

    const saveGateways = () => {
        onManageGateways(localGateways);
        alert('Configurações de Gateway salvas!');
    };

    const handleAddAccount = () => {
        setLocalAccounts([...localAccounts, {
            id: Date.now().toString(),
            bankName: '',
            iban: '',
            accountNumber: '',
            holderName: 'Facilita Plataforma',
            isActive: true
        }]);
    };

    const handleRemoveAccount = (index: number) => {
        const newAccs = [...localAccounts];
        newAccs.splice(index, 1);
        setLocalAccounts(newAccs);
    };

    const handleUpdateAccount = (index: number, field: keyof PlatformBankAccount, value: any) => {
        const newAccs = [...localAccounts];
        newAccs[index] = { ...newAccs[index], [field]: value };
        setLocalAccounts(newAccs);
    };

    const saveAccounts = () => {
        onManageAccounts(localAccounts);
        alert('Contas Bancárias atualizadas!');
    };
    
    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if(selectedChatUser && replyContent.trim()) {
            onSendMessage(selectedChatUser, replyContent);
            setReplyContent('');
        }
    };

    const getUserById = (id: string) => users.find(u => u.id === id);

    return (
        <div className="h-screen w-full bg-gray-100 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-6">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="text-white" size={18} />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Facilita <span className="text-indigo-600">Admin</span></h1>
                </div>

                <div className="space-y-2 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Visão Geral" active={view === 'OVERVIEW'} onClick={() => setView('OVERVIEW')} />
                    <SidebarItem icon={UserIcon} label="Utilizadores" active={view === 'USERS'} onClick={() => setView('USERS')} />
                    <SidebarItem icon={FileText} label="Planos" active={view === 'PLANS'} onClick={() => setView('PLANS')} />
                    <SidebarItem icon={Wallet} label="Financeiro" active={view === 'FINANCE'} onClick={() => setView('FINANCE')} />
                    <SidebarItem icon={Settings} label="Pagamentos (API)" active={view === 'SETTINGS'} onClick={() => setView('SETTINGS')} />
                    <SidebarItem icon={MessageSquare} label="Suporte" active={view === 'SUPPORT'} onClick={() => setView('SUPPORT')} />
                </div>

                <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Sair</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Top Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-20">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {view === 'OVERVIEW' && 'Dashboard'}
                        {view === 'USERS' && 'Gestão de Utilizadores'}
                        {view === 'PLANS' && 'Gestão de Planos'}
                        {view === 'FINANCE' && 'Gestão Financeira'}
                        {view === 'SETTINGS' && 'Configurações de Pagamento'}
                        {view === 'SUPPORT' && 'Suporte ao Cliente'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">Admin Master</p>
                            <p className="text-xs text-gray-500">super@facilita.ao</p>
                        </div>
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <UserIcon size={20} className="text-gray-500" />
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {/* OVERVIEW */}
                    {view === 'OVERVIEW' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Building2 size={24} /></div>
                                        <span className="text-green-500 text-xs font-bold">MRR</span>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">Receita Mensal (Planos)</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                        {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                    </h3>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-green-50 rounded-xl text-green-600"><ShoppingBag size={24} /></div>
                                        <span className="text-green-500 text-xs font-bold">Vendas</span>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">Total de Vendas da Plataforma</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                         {totalSalesVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                    </h3>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><BarChart2 size={24} /></div>
                                        <span className="text-gray-400 text-xs font-bold">0%</span>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">Empresas Ativas</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{businessUsers}</h3>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Receita de Planos (MRR)</h3>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={revenueChartData}>
                                                <defs>
                                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(value: number) => [`${value.toLocaleString('pt-BR')} Kz`, 'Receita']} />
                                                <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Volume de Vendas da Plataforma</h3>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={salesChartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(value: number) => [`${value.toLocaleString('pt-BR')} Kz`, 'Vendas']} />
                                                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* USERS */}
                    {view === 'USERS' && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
                            {/* User Details Modal */}
                            {selectedUserDetail && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                            <h3 className="text-xl font-bold text-gray-900">Detalhes do Utilizador</h3>
                                            <button onClick={() => setSelectedUserDetail(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                                        </div>
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-3">
                                                    <img src={selectedUserDetail.profileImage} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <h4 className="font-bold text-lg">{selectedUserDetail.name}</h4>
                                                <p className="text-gray-500 text-sm">{selectedUserDetail.email}</p>
                                                <div className="mt-3">
                                                    <StatusBadge status={selectedUserDetail.accountStatus || 'Active'} />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase">Tipo de Conta</p>
                                                    <p className="font-medium">{selectedUserDetail.isBusiness ? 'Empresa' : 'Pessoal'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase">Telefone</p>
                                                    <p className="font-medium">{selectedUserDetail.phone}</p>
                                                </div>
                                                {selectedUserDetail.isBusiness && (
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase">NIF</p>
                                                        <p className="font-medium">{selectedUserDetail.nif || 'N/A'}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase">Plano Atual</p>
                                                    <p className="font-medium text-indigo-600">{selectedUserDetail.plan || 'Gratuito'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase">Endereço</p>
                                                    <p className="text-sm">{selectedUserDetail.address || 'Não informado'}, {selectedUserDetail.municipality}, {selectedUserDetail.province}</p>
                                                </div>
                                            </div>
                                            {selectedUserDetail.isBusiness && (
                                                <div className="md:col-span-2 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                                    <h5 className="font-bold text-indigo-900 mb-2 flex items-center gap-2"><Banknote size={16}/> Dados Bancários</h5>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-xs text-indigo-400 font-bold">Banco</p>
                                                            <p className="text-indigo-900 font-medium">{selectedUserDetail.bankDetails?.bankName || 'Não configurado'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-indigo-400 font-bold">Beneficiário</p>
                                                            <p className="text-indigo-900 font-medium">{selectedUserDetail.bankDetails?.beneficiaryName || 'N/A'}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-xs text-indigo-400 font-bold">IBAN</p>
                                                            <p className="text-indigo-900 font-mono font-bold tracking-wide">{selectedUserDetail.bankDetails?.iban || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
                                            <Button variant="outline" onClick={() => setSelectedUserDetail(null)}>Fechar</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <div className="relative w-64">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar utilizador..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Utilizador</th>
                                        <th className="px-6 py-4">Tipo</th>
                                        <th className="px-6 py-4">Plano</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                        <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                                                        <p className="text-gray-500 text-xs">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${u.isBusiness ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {u.isBusiness ? 'Empresa' : 'Pessoal'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-700">{u.plan || 'Básico'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${u.accountStatus === 'Blocked' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${u.accountStatus === 'Blocked' ? 'bg-red-500' : 'bg-green-500'}`}></div> 
                                                    {u.accountStatus === 'Blocked' ? 'Bloqueado' : 'Ativo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setSelectedUserDetail(u)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg" title="Ver Detalhes"><Eye size={18} /></button>
                                                    {u.accountStatus !== 'Blocked' ? (
                                                        <button onClick={() => onUpdateUserStatus(u.id, 'block')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Bloquear"><Lock size={18} /></button>
                                                    ) : (
                                                         <button onClick={() => onUpdateUserStatus(u.id, 'unblock')} className="p-2 text-green-500 hover:bg-green-50 rounded-lg" title="Desbloquear"><Unlock size={18} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PLANS MANAGEMENT */}
                    {view === 'PLANS' && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <Button 
                                    onClick={() => {
                                        setEditingPlan({ id: Date.now().toString(), type: 'NOVO PLANO', price: 0, features: [], color: 'bg-white', maxProducts: 10, maxHighlights: 0 });
                                        setIsAddingPlan(true);
                                    }} 
                                    className="bg-indigo-600 text-white"
                                >
                                    <Plus size={20} className="mr-2" /> Adicionar Plano
                                </Button>
                            </div>

                            {editingPlan && (
                                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-lg animate-[slideDown_0.2s_ease-out]">
                                    <h3 className="text-lg font-bold mb-4">{isAddingPlan ? 'Criar Novo Plano' : 'Editar Plano'}</h3>
                                    <form onSubmit={handleSavePlan} className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Nome do Plano</label>
                                            <input type="text" value={editingPlan.type} onChange={e => setEditingPlan({...editingPlan, type: e.target.value})} className="w-full border p-2 rounded-lg" required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Preço (Kz)</label>
                                            <input type="number" value={editingPlan.price} onChange={e => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})} className="w-full border p-2 rounded-lg" required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Max Produtos (-1 para ilimitado)</label>
                                            <input type="number" value={editingPlan.maxProducts} onChange={e => setEditingPlan({...editingPlan, maxProducts: parseInt(e.target.value)})} className="w-full border p-2 rounded-lg" required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Max Destaques (-1 para ilimitado)</label>
                                            <input type="number" value={editingPlan.maxHighlights} onChange={e => setEditingPlan({...editingPlan, maxHighlights: parseInt(e.target.value)})} className="w-full border p-2 rounded-lg" required />
                                        </div>
                                        <div className="col-span-2">
                                             <label className="text-xs font-bold text-gray-500">Funcionalidades (separadas por vírgula)</label>
                                             <input 
                                                type="text" 
                                                value={editingPlan.features.join(', ')} 
                                                onChange={e => setEditingPlan({...editingPlan, features: e.target.value.split(',').map(s => s.trim())})} 
                                                className="w-full border p-2 rounded-lg" 
                                            />
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-2 mt-2">
                                            <button type="button" onClick={() => setEditingPlan(null)} className="px-4 py-2 text-gray-500">Cancelar</button>
                                            <Button type="submit" className="bg-indigo-600 text-white">Salvar</Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {plans.map(plan => (
                                    <div key={plan.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group hover:border-indigo-300 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg">{plan.type}</h3>
                                            <span className="text-indigo-600 font-black">{plan.price.toLocaleString('pt-BR')} Kz</span>
                                        </div>
                                        <ul className="text-xs text-gray-500 space-y-1 mb-4">
                                            {plan.features.map((f, i) => <li key={i}>• {f}</li>)}
                                        </ul>
                                        <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-2">
                                            <span>Prod: {plan.maxProducts === -1 ? '∞' : plan.maxProducts}</span>
                                            <span>Dest: {plan.maxHighlights === -1 ? '∞' : plan.maxHighlights}</span>
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingPlan(plan); setIsAddingPlan(false); }} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"><Edit2 size={14} /></button>
                                            <button onClick={() => onManagePlans('delete', plan)} className="p-1.5 bg-red-50 hover:bg-red-100 rounded text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FINANCE */}
                    {view === 'FINANCE' && (
                        <div className="space-y-6">
                            <div className="flex gap-4 border-b border-gray-200 pb-2 overflow-x-auto">
                                <button onClick={() => setFinanceSubTab('BALANCES')} className={`px-4 py-2 font-bold text-sm whitespace-nowrap ${financeSubTab === 'BALANCES' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Saldo das Empresas</button>
                                <button onClick={() => setFinanceSubTab('SUBSCRIPTIONS')} className={`px-4 py-2 font-bold text-sm whitespace-nowrap ${financeSubTab === 'SUBSCRIPTIONS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Subscrições (Planos)</button>
                                <button onClick={() => setFinanceSubTab('WITHDRAWALS')} className={`px-4 py-2 font-bold text-sm whitespace-nowrap ${financeSubTab === 'WITHDRAWALS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Solicitações de Levantamento</button>
                                <button onClick={() => setFinanceSubTab('TRANSACTIONS')} className={`px-4 py-2 font-bold text-sm whitespace-nowrap ${financeSubTab === 'TRANSACTIONS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Transações</button>
                            </div>

                            {financeSubTab === 'BALANCES' && (
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                     <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                            <tr>
                                                <th className="px-6 py-4">Empresa</th>
                                                <th className="px-6 py-4">Saldo em Vendas</th>
                                                <th className="px-6 py-4">Saldo de Carregamento</th>
                                                <th className="px-6 py-4">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {companies.map(c => (
                                                <tr key={c.id} className="border-t border-gray-100">
                                                    <td className="px-6 py-4 font-bold">{c.name}</td>
                                                    <td className="px-6 py-4 text-green-600">{(c.walletBalance || 0).toLocaleString('pt-BR')} Kz</td>
                                                    <td className="px-6 py-4 text-blue-600">{(c.topUpBalance || 0).toLocaleString('pt-BR')} Kz</td>
                                                    <td className="px-6 py-4 font-black">{((c.walletBalance || 0) + (c.topUpBalance || 0)).toLocaleString('pt-BR')} Kz</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                             {financeSubTab === 'SUBSCRIPTIONS' && (
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-700">Pagamentos de Planos Recorrentes</h3>
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md font-bold">
                                            Total Receita: {mrr.toLocaleString()} Kz
                                        </span>
                                    </div>
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                            <tr>
                                                <th className="px-6 py-4">Empresa</th>
                                                <th className="px-6 py-4">Plano</th>
                                                <th className="px-6 py-4">Valor</th>
                                                <th className="px-6 py-4">Data Pagamento</th>
                                                <th className="px-6 py-4">Vencimento</th>
                                                <th className="px-6 py-4">Estado</th>
                                                <th className="px-6 py-4 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.filter(t => t.category === 'PLAN_PAYMENT').length === 0 ? (
                                                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Nenhum pagamento de subscrição encontrado.</td></tr>
                                            ) : (
                                                transactions.filter(t => t.category === 'PLAN_PAYMENT').map(t => (
                                                    <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{users.find(u => u.id === t.user)?.name}</td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                                            {/* Try to infer plan name or get from user if recent */}
                                                            {users.find(u => u.id === t.user)?.plan || 'Desconhecido'}
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-indigo-600">{t.amount.toLocaleString('pt-BR')} Kz</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{t.date}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {t.status === 'Aprovado' ? (
                                                                <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                                                                    <Calendar size={12} /> {getExpirationDate(t.timestamp)}
                                                                </span>
                                                            ) : '-'}
                                                        </td>
                                                        <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                                                        <td className="px-6 py-4 text-right">
                                                            {t.status === 'Pendente' && onTransactionAction && (
                                                                <div className="flex justify-end gap-2">
                                                                    <button onClick={() => onTransactionAction(t.id, 'approve')} className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100"><CheckCircle size={14} /> Aprovar</button>
                                                                    <button onClick={() => onTransactionAction(t.id, 'reject')} className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100"><XCircle size={14} /> Rejeitar</button>
                                                                </div>
                                                            )}
                                                            {t.status === 'Aprovado' && (
                                                                <span className="text-xs text-gray-400 font-medium">Processado</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {financeSubTab === 'WITHDRAWALS' && (
                                <div className="space-y-4">
                                    {/* Withdrawal Detail Modal */}
                                    {selectedWithdrawalDetail && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                                    <h3 className="text-xl font-bold text-gray-900">Detalhes do Levantamento</h3>
                                                    <button onClick={() => setSelectedWithdrawalDetail(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                                                </div>
                                                <div className="p-6 space-y-4">
                                                     <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                                         <div>
                                                             <p className="text-xs text-indigo-500 font-bold uppercase">Valor Solicitado</p>
                                                             <p className="text-2xl font-black text-indigo-900">{selectedWithdrawalDetail.amount.toLocaleString('pt-BR')} Kz</p>
                                                         </div>
                                                         <div className="text-right">
                                                             <StatusBadge status={selectedWithdrawalDetail.status} />
                                                             <p className="text-xs text-gray-500 mt-1">{selectedWithdrawalDetail.requestDate}</p>
                                                         </div>
                                                     </div>

                                                     <div>
                                                         <h4 className="font-bold text-gray-800 mb-2">Dados da Empresa</h4>
                                                         {(() => {
                                                             const companyUser = getUserById(selectedWithdrawalDetail.companyId);
                                                             return companyUser ? (
                                                                 <div className="text-sm space-y-1 text-gray-600">
                                                                     <p><span className="font-bold">Nome:</span> {companyUser.name}</p>
                                                                     <p><span className="font-bold">Email:</span> {companyUser.email}</p>
                                                                     <p><span className="font-bold">Telefone:</span> {companyUser.phone}</p>
                                                                     <p><span className="font-bold">NIF:</span> {companyUser.nif || 'N/A'}</p>
                                                                 </div>
                                                             ) : <p className="text-red-500 text-sm">Empresa não encontrada.</p>;
                                                         })()}
                                                     </div>

                                                     <div className="border-t border-gray-100 pt-4">
                                                         <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><Building2 size={16}/> Dados Bancários Verificados</h4>
                                                         {(() => {
                                                             const companyUser = getUserById(selectedWithdrawalDetail.companyId);
                                                             const bankInfo = companyUser?.bankDetails;
                                                             return bankInfo ? (
                                                                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm space-y-2">
                                                                     <p><span className="font-bold text-gray-500">Banco:</span> {bankInfo.bankName}</p>
                                                                     <p><span className="font-bold text-gray-500">Titular:</span> {bankInfo.beneficiaryName}</p>
                                                                     <div className="bg-white p-2 rounded border border-gray-200 mt-1">
                                                                         <p className="text-xs text-gray-400 font-bold">IBAN</p>
                                                                         <p className="font-mono font-bold text-gray-900">{bankInfo.iban}</p>
                                                                     </div>
                                                                     <div className="bg-white p-2 rounded border border-gray-200">
                                                                         <p className="text-xs text-gray-400 font-bold">Nº Conta</p>
                                                                         <p className="font-mono font-bold text-gray-900">{bankInfo.accountNumber}</p>
                                                                     </div>
                                                                 </div>
                                                             ) : <p className="text-red-500 bg-red-50 p-2 rounded text-sm">Dados bancários não encontrados no perfil da empresa.</p>;
                                                         })()}
                                                     </div>
                                                </div>
                                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                                    {selectedWithdrawalDetail.status === 'Pendente' && (
                                                        <>
                                                            <Button onClick={() => { onProcessWithdrawal(selectedWithdrawalDetail.id, 'reject'); setSelectedWithdrawalDetail(null); }} className="bg-red-50 text-red-600 hover:bg-red-100">Rejeitar</Button>
                                                            <Button onClick={() => { onProcessWithdrawal(selectedWithdrawalDetail.id, 'approve'); setSelectedWithdrawalDetail(null); }} className="bg-green-600 text-white">Confirmar Transferência</Button>
                                                        </>
                                                    )}
                                                    <Button variant="outline" onClick={() => setSelectedWithdrawalDetail(null)}>Fechar</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {withdrawalRequests.length === 0 && <p className="text-gray-500 text-center py-10">Nenhuma solicitação pendente.</p>}
                                    {withdrawalRequests.map(req => (
                                        <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center hover:shadow-sm transition-shadow">
                                            <div>
                                                <p className="font-bold text-gray-900">{req.companyName}</p>
                                                <p className="text-sm text-gray-500">Solicitou: <span className="text-green-600 font-bold">{req.amount.toLocaleString('pt-BR')} Kz</span></p>
                                                <p className="text-xs text-gray-400 mt-1">Data: {req.requestDate}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <StatusBadge status={req.status} />
                                                <button 
                                                    onClick={() => setSelectedWithdrawalDetail(req)}
                                                    className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1 text-xs font-bold"
                                                >
                                                    <Eye size={16} /> Detalhes
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {financeSubTab === 'TRANSACTIONS' && (
                                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                            <tr>
                                                <th className="px-6 py-4">Usuário</th>
                                                <th className="px-6 py-4">Tipo</th>
                                                <th className="px-6 py-4">Valor</th>
                                                <th className="px-6 py-4">Método</th>
                                                <th className="px-6 py-4">Estado</th>
                                                <th className="px-6 py-4 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map(t => (
                                                <tr key={t.id} className="border-t border-gray-100">
                                                    <td className="px-6 py-4 text-sm font-medium">{users.find(u=>u.id === t.user)?.name}</td>
                                                    <td className="px-6 py-4 text-xs">{t.category}</td>
                                                    <td className="px-6 py-4 text-sm font-bold">{t.amount.toLocaleString('pt-BR')} Kz</td>
                                                    <td className="px-6 py-4 text-xs">{t.method}</td>
                                                    <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                                                    <td className="px-6 py-4 text-right">
                                                        {t.status === 'Pendente' && onTransactionAction && (
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => onTransactionAction(t.id, 'approve')} className="text-green-600 hover:bg-green-50 p-1 rounded"><CheckCircle size={18} /></button>
                                                                <button onClick={() => onTransactionAction(t.id, 'reject')} className="text-red-600 hover:bg-red-50 p-1 rounded"><XCircle size={18} /></button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SETTINGS (Payment Gateways & Accounts) */}
                    {view === 'SETTINGS' && (
                         <div className="space-y-6">
                            <div className="flex gap-4 border-b border-gray-200 pb-2">
                                <button onClick={() => setSettingsSubTab('GATEWAYS')} className={`px-4 py-2 font-bold text-sm ${settingsSubTab === 'GATEWAYS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Gateways de Pagamento (API)</button>
                                <button onClick={() => setSettingsSubTab('ACCOUNTS')} className={`px-4 py-2 font-bold text-sm ${settingsSubTab === 'ACCOUNTS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Contas Bancárias da Plataforma</button>
                            </div>

                            {settingsSubTab === 'GATEWAYS' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {localGateways.map((gw, idx) => (
                                            <div key={gw.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-bold text-lg text-gray-800">{gw.name}</h3>
                                                    <div className={`w-3 h-3 rounded-full ${gw.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500">API Key</label>
                                                        <input 
                                                            type="password" 
                                                            value={gw.apiKey || ''} 
                                                            onChange={(e) => handleUpdateGateway(idx, 'apiKey', e.target.value)} 
                                                            className="w-full border p-2 rounded-lg text-sm bg-gray-50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500">Ambiente</label>
                                                        <select 
                                                            value={gw.environment} 
                                                            onChange={(e) => handleUpdateGateway(idx, 'environment', e.target.value)}
                                                            className="w-full border p-2 rounded-lg text-sm bg-gray-50"
                                                        >
                                                            <option value="Sandbox">Sandbox (Teste)</option>
                                                            <option value="Production">Produção</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={gw.isActive} 
                                                            onChange={(e) => handleUpdateGateway(idx, 'isActive', e.target.checked)} 
                                                        />
                                                        <label className="text-sm">Ativar na Plataforma</label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button onClick={saveGateways} className="bg-indigo-600 text-white"><Save size={18} className="mr-2"/> Salvar Configurações</Button>
                                </div>
                            )}

                            {settingsSubTab === 'ACCOUNTS' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500 mb-4">Estas contas serão exibidas aos utilizadores para transferências manuais.</p>
                                    {localAccounts.map((acc, idx) => (
                                        <div key={acc.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-gray-500">Banco</label>
                                                <input type="text" value={acc.bankName} onChange={(e) => handleUpdateAccount(idx, 'bankName', e.target.value)} className="w-full border p-2 rounded-lg text-sm" placeholder="Ex: BAI" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-gray-500">IBAN</label>
                                                <input type="text" value={acc.iban} onChange={(e) => handleUpdateAccount(idx, 'iban', e.target.value)} className="w-full border p-2 rounded-lg text-sm" placeholder="AO06..." />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-gray-500">Nº Conta</label>
                                                <input type="text" value={acc.accountNumber} onChange={(e) => handleUpdateAccount(idx, 'accountNumber', e.target.value)} className="w-full border p-2 rounded-lg text-sm" />
                                            </div>
                                            <button onClick={() => handleRemoveAccount(idx)} className="p-2.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200"><Trash2 size={18}/></button>
                                        </div>
                                    ))}
                                    <div className="flex gap-4 mt-4">
                                        <Button onClick={handleAddAccount} className="bg-gray-800 text-white"><Plus size={18} className="mr-2"/> Adicionar Conta</Button>
                                        <Button onClick={saveAccounts} className="bg-green-600 text-white"><Save size={18} className="mr-2"/> Salvar Contas</Button>
                                    </div>
                                </div>
                            )}
                         </div>
                    )}

                    {/* SUPPORT VIEW */}
                    {view === 'SUPPORT' && (
                        <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            {/* Conversations List */}
                            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="font-bold text-gray-700">Mensagens de Suporte</h3>
                                </div>
                                {Object.keys(supportConversations).length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-sm">Nenhuma mensagem.</div>
                                ) : (
                                    Object.keys(supportConversations).map(userId => {
                                        const msgs = supportConversations[userId].sort((a,b) => b.timestamp - a.timestamp); // newest first for preview
                                        const lastMsg = msgs[0];
                                        const userObj = getUserById(userId);
                                        const isActive = selectedChatUser === userId;
                                        
                                        return (
                                            <button 
                                                key={userId}
                                                onClick={() => setSelectedChatUser(userId)}
                                                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${isActive ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-sm text-gray-900">{userObj?.name || 'Utilizador Desconhecido'}</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(lastMsg.timestamp).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{lastMsg.content || 'Anexo enviado...'}</p>
                                                {msgs.some(m => !m.isRead && m.receiverId === adminId) && (
                                                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                                                )}
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                            
                            {/* Chat Area */}
                            <div className="flex-1 flex flex-col bg-gray-50">
                                {selectedChatUser ? (
                                    <>
                                        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{getUserById(selectedChatUser)?.name}</h3>
                                                <p className="text-xs text-gray-500">{getUserById(selectedChatUser)?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {activeChatMessages.map(msg => {
                                                const isAdmin = msg.senderId === adminId;
                                                return (
                                                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isAdmin ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                                                            {msg.attachment && (
                                                                <div className="mb-2 p-1 bg-black/10 rounded">
                                                                     {msg.attachment.type === 'image' ? (
                                                                        <img src={msg.attachment.url} alt="anexo" className="max-w-full rounded" />
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 text-xs"><Paperclip size={12}/> {msg.attachment.name}</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <p>{msg.content}</p>
                                                            <p className={`text-[9px] mt-1 text-right ${isAdmin ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="p-4 bg-white border-t border-gray-200">
                                            <form onSubmit={handleSendReply} className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={replyContent}
                                                    onChange={e => setReplyContent(e.target.value)}
                                                    placeholder="Escreva uma resposta..."
                                                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                                />
                                                <Button type="submit" className="bg-indigo-600 text-white"><Send size={18}/></Button>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <MessageSquare size={48} className="mb-4 opacity-20" />
                                        <p>Selecione uma conversa para responder.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
