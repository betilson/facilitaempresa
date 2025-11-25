import React, { useState, useRef } from 'react';
import { Product, User, PlatformBankAccount } from '../types';
import { X, Trash2, ArrowRight, ShoppingBag, User as UserIcon, Phone, Mail, CheckCircle, ArrowLeft, CreditCard, Landmark, Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { processImage } from '../utils/imageOptimizer';

interface CartProps {
    items: Product[];
    user: User;
    onRemoveItem: (index: number) => void;
    onClose: () => void;
    onCheckout: (method: 'Multicaixa' | 'Visa' | 'Transferencia', proof?: string) => void;
    platformAccounts?: PlatformBankAccount[];
}

type CartView = 'LIST' | 'CHECKOUT' | 'SUCCESS';

export const Cart: React.FC<CartProps> = ({ items, user, onRemoveItem, onClose, onCheckout, platformAccounts = [] }) => {
    const [view, setView] = useState<CartView>('LIST');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'Multicaixa' | 'Visa' | 'Transferencia'>('Multicaixa');
    const [paymentProof, setPaymentProof] = useState<string | null>(null);
    const [proofName, setProofName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const total = items.reduce((sum, item) => sum + item.price, 0);

    const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Optimize or just read base64
                const { optimized } = await processImage(file);
                setPaymentProof(optimized);
                setProofName(file.name);
            } catch (error) {
                console.error("Erro no upload", error);
            }
        }
    };

    const handlePayment = () => {
        if (paymentMethod === 'Transferencia' && !paymentProof) {
            alert("Por favor, anexe o comprovativo de pagamento.");
            return;
        }

        setIsProcessing(true);
        // Simulate payment delay
        setTimeout(() => {
            onCheckout(paymentMethod, paymentProof || undefined);
            setIsProcessing(false);
            setView('SUCCESS');
        }, 2000);
    };

    const handleFinish = () => {
        onClose();
    };

    if (view === 'SUCCESS') {
        return (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-[90%] max-w-sm text-center animate-[scaleIn_0.3s_ease-out] shadow-2xl border border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-teal-600 dark:text-teal-400 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pedido Recebido!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        {paymentMethod === 'Transferencia' 
                            ? "O seu comprovativo foi enviado. Aguarde a aprovação da empresa para receber o produto." 
                            : "A sua compra foi confirmada com sucesso."}
                    </p>
                    <Button onClick={handleFinish} fullWidth className="bg-teal-600 hover:bg-teal-700 shadow-teal-200">
                        Voltar à Loja
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
             {/* Click backdrop to close */}
             <div className="absolute inset-0" onClick={onClose}></div>
             
             <div className="bg-white dark:bg-gray-900 rounded-t-3xl h-[90%] w-full overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out] relative z-10">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                        {view === 'CHECKOUT' ? (
                            <button onClick={() => setView('LIST')} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                <ArrowLeft size={20} className="text-gray-800 dark:text-white" />
                            </button>
                        ) : (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <ShoppingBag size={20} />
                            </div>
                        )}
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {view === 'CHECKOUT' ? 'Confirmar e Pagar' : `Seu Carrinho (${items.length})`}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                {view === 'LIST' ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
                                    <ShoppingBag size={48} className="mb-4 text-gray-400" />
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">O seu carrinho está vazio.</p>
                                    <p className="text-xs text-gray-400 mt-1">Adicione produtos para começar.</p>
                                </div>
                            ) : (
                                items.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="flex gap-4 items-center bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.title}</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{item.companyName}</p>
                                            <p className="text-teal-600 dark:text-teal-400 font-bold text-sm">
                                                {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => onRemoveItem(index)}
                                            className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Total a pagar</span>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">
                                    {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                </span>
                            </div>
                            <Button 
                                onClick={() => setView('CHECKOUT')} 
                                fullWidth 
                                disabled={items.length === 0} 
                                className="flex justify-between items-center h-14 text-lg"
                            >
                                <span>Continuar</span>
                                <div className="bg-white/20 p-1 rounded-full">
                                    <ArrowRight size={20} />
                                </div>
                            </Button>
                        </div>
                    </>
                ) : (
                    /* Checkout View */
                    <>
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4">Dados de Envio</h3>
                            
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 mb-6">
                                <div className="flex items-center gap-4 p-2">
                                    <div className="bg-gray-100 dark:bg-gray-700 p-2.5 rounded-xl text-gray-600 dark:text-gray-300">
                                        <UserIcon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400">Nome Completo</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4">Método de Pagamento</h3>
                            
                            <div className="space-y-3 mb-6">
                                <button 
                                    onClick={() => setPaymentMethod('Multicaixa')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${paymentMethod === 'Multicaixa' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center">
                                        <div className="w-6 h-3 border border-white/30 rounded-sm"></div>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Multicaixa Express</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Multicaixa' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {paymentMethod === 'Multicaixa' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setPaymentMethod('Visa')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${paymentMethod === 'Visa' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <div className="w-10 h-6 bg-blue-800 rounded flex items-center justify-center text-[8px] font-bold text-white tracking-widest">VISA</div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Cartão Visa / Mastercard</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Visa' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {paymentMethod === 'Visa' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setPaymentMethod('Transferencia')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${paymentMethod === 'Transferencia' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <div className="w-10 h-6 bg-teal-100 dark:bg-teal-900/50 rounded flex items-center justify-center text-teal-700 dark:text-teal-400">
                                        <Landmark size={16} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Transferência Bancária</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Transferencia' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {paymentMethod === 'Transferencia' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                </button>
                            </div>

                            {/* Bank Transfer Details Section */}
                            {paymentMethod === 'Transferencia' && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-6 animate-[fadeIn_0.3s_ease-out]">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        Faça a transferência para uma das contas abaixo e anexe o comprovativo.
                                    </p>
                                    
                                    {platformAccounts.length > 0 ? platformAccounts.map(acc => (
                                        <div key={acc.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl mb-3 border border-gray-100 dark:border-gray-600">
                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{acc.bankName}</p>
                                            <p className="font-mono font-bold text-gray-900 dark:text-white text-sm select-all">{acc.iban}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Titular: {acc.holderName}</p>
                                        </div>
                                    )) : (
                                        <p className="text-red-500 text-sm">Nenhuma conta configurada na plataforma.</p>
                                    )}

                                    <div className="mt-4">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Anexar Comprovativo</label>
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${paymentProof ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'}`}
                                        >
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                className="hidden" 
                                                accept="image/*,application/pdf"
                                                onChange={handleProofUpload}
                                            />
                                            {paymentProof ? (
                                                <>
                                                    <CheckCircle className="text-green-500 mb-2" size={24} />
                                                    <p className="text-xs font-bold text-green-700 dark:text-green-400">Comprovativo Anexado</p>
                                                    <p className="text-[10px] text-gray-500 truncate max-w-full">{proofName}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="text-gray-400 mb-2" size={24} />
                                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Clique para enviar foto/PDF</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                             <Button 
                                onClick={handlePayment} 
                                disabled={isProcessing}
                                fullWidth 
                                className="h-14 text-lg relative"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" />
                                        <span>Processando...</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center w-full">
                                        <span>{paymentMethod === 'Transferencia' ? 'Enviar Pedido' : 'Pagar Agora'}</span>
                                        <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">
                                            {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                        </span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </>
                )}
             </div>
        </div>
    );
};