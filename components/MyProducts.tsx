import React, { useState } from 'react';
import { Product, User, PlanType } from '../types';
import { PLANS } from '../constants';
import { ArrowLeft, Edit2, Trash2, Plus, PackageOpen, Crown, Building2 } from 'lucide-react';
import { Button } from './Button';

interface MyProductsProps {
    user: User;
    products: Product[];
    onBack: () => void;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    onAddNew: () => void;
    // New props for Branch Management
    scopeId?: string; // If present, shows products for this specific ID (Branch)
    scopeName?: string; // Name of the branch being managed
}

export const MyProducts: React.FC<MyProductsProps> = ({ user, products, onBack, onEdit, onDelete, onAddNew, scopeId, scopeName }) => {
    // Filter products: If scopeId is provided (Branch), filter by that. Otherwise filter by user (HQ).
    const targetId = scopeId || user.id;
    
    // Logic: 
    // 1. Products owned directly by the targetId (Branch or HQ)
    // 2. OR Products where companyName matches (fallback for older logic, primarily for HQ)
    const myProducts = products.filter(p => p.ownerId === targetId || (!scopeId && p.companyName === user.name));
    
    // Usage Calculations
    const totalProducts = myProducts.length;
    const totalHighlights = myProducts.filter(p => p.isPromoted).length;
    
    // Determine user plan (Branches use HQ's plan)
    const userPlanType = user.plan || PlanType.BASIC;
    const planDetails = PLANS.find(p => p.type === userPlanType) || PLANS[0];
    
    // Use custom limits if available (from upgrade rollover), otherwise plan defaults
    const maxProducts = user.customLimits?.maxProducts ?? planDetails.maxProducts;
    const maxHighlights = user.customLimits?.maxHighlights ?? planDetails.maxHighlights;
    
    // Check if limits reached
    const isProductLimitReached = maxProducts !== -1 && totalProducts >= maxProducts;

    const handleAddNewClick = () => {
        if (isProductLimitReached) {
            alert(`Limite de publicações atingido para o plano ${userPlanType}. Atualize o seu plano para adicionar mais produtos.`);
            return;
        }
        onAddNew();
    };

    const getProgressColor = (current: number, max: number) => {
        if (max === -1) return 'bg-yellow-500'; // Unlimited is Gold
        const percent = (current / max) * 100;
        if (percent >= 90) return 'bg-red-600';
        if (percent >= 70) return 'bg-yellow-500';
        return 'bg-gray-800'; // Default black/dark gray
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-20 animate-[slideInRight_0.2s_ease-out]">
            <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4 shadow-sm sticky top-0 z-10 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <ArrowLeft size={24} className="text-gray-800 dark:text-gray-200" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {scopeName ? `Produtos: ${scopeName}` : 'Meus Produtos'}
                        </h1>
                        <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-1">
                            {scopeName && <Building2 size={10} />}
                            Plano {userPlanType}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={handleAddNewClick}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${isProductLimitReached ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                    <Plus size={24} className={isProductLimitReached ? 'text-gray-200' : 'text-white'} />
                </button>
            </div>

            {/* Plan Usage Card */}
            <div className="px-6 mt-4 mb-2">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                        <Crown size={14} className="text-yellow-500" />
                        Uso {scopeName ? 'da Agência' : 'Geral'}
                    </h3>
                    
                    {/* Products Limit */}
                    <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Publicações</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {totalProducts} {maxProducts !== -1 && `/ ${maxProducts}`}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${getProgressColor(totalProducts, maxProducts)} transition-all duration-500`} 
                                style={{ width: maxProducts === -1 ? '100%' : `${Math.min((totalProducts / maxProducts) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Highlights Limit */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Destaques Ativos</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {totalHighlights} {maxHighlights !== -1 && `/ ${maxHighlights}`}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full ${getProgressColor(totalHighlights, maxHighlights)} transition-all duration-500`} 
                                style={{ width: maxHighlights === -1 ? '100%' : `${Math.min((totalHighlights / maxHighlights) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-4 pt-2">
                {myProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-60">
                        <PackageOpen size={64} className="text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                            {scopeName ? 'Esta agência não tem produtos.' : 'Ainda não tem produtos.'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Comece a vender hoje mesmo!</p>
                        <Button onClick={handleAddNewClick} variant="outline" disabled={isProductLimitReached}>
                            Criar primeiro anúncio
                        </Button>
                    </div>
                ) : (
                    myProducts.map((product) => (
                        <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shrink-0 relative">
                                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                {product.isPromoted && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-yellow-400 text-[10px] font-bold text-yellow-900 text-center py-0.5">
                                        DESTAQUE
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block ${product.category === 'Serviço' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                            {product.category.toUpperCase()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">{product.title}</h3>
                                    <p className="text-red-600 dark:text-red-400 font-bold mt-1">
                                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(product.price)}
                                    </p>
                                </div>
                                
                                <div className="flex justify-end gap-2 mt-2">
                                    <button 
                                        onClick={() => onEdit(product)}
                                        className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Adicionar e.stopPropagation para evitar que cliques no container disparem ações indesejadas
                                            onDelete(product.id);
                                        }}
                                        className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};